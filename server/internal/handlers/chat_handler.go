package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/cupiddle/server/internal/database"
	"github.com/cupiddle/server/internal/middleware"
	"github.com/cupiddle/server/internal/models"
	"github.com/cupiddle/server/internal/websocket"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// ChatHandler manages persistent conversations, messages, reactions, and RabbitHole Radar
type ChatHandler struct {
	DB  *database.DB
	Hub *websocket.Hub
}

// NewChatHandler creates a new ChatHandler
func NewChatHandler(db *database.DB, hub *websocket.Hub) *ChatHandler {
	return &ChatHandler{DB: db, Hub: hub}
}

type SendMessageRequest struct {
	Content   string `json:"content"`
	MediaType string `json:"media_type"` // "text", "voice", "image"
	MediaURL  string `json:"media_url"`
}

type ReactionRequest struct {
	Emoji string `json:"emoji"`
}

// GetConversations returns all active chat rooms for the authenticated user
func (h *ChatHandler) GetConversations(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)

	query := `
		SELECT c.id, c.match_id, c.spark_id, c.user1_id, c.user2_id, c.last_message_at, c.created_at,
		       s.target_type, s.target_content, s.comment
		FROM conversations c
		LEFT JOIN sparks s ON s.id = c.spark_id
		WHERE c.user1_id = $1 OR c.user2_id = $1
		ORDER BY c.last_message_at DESC
	`

	rows, err := h.DB.Query(query, currentUserID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to query conversations"})
		return
	}
	defer rows.Close()

	var conversations []models.Conversation

	for rows.Next() {
		var c models.Conversation
		var targetType, targetContent, sparkComment *string

		err := rows.Scan(
			&c.ID, &c.MatchID, &c.SparkID, &c.User1ID, &c.User2ID, &c.LastMessageAt, &c.CreatedAt,
			&targetType, &targetContent, &sparkComment,
		)
		if err != nil {
			continue
		}

		partnerID := c.User1ID
		if partnerID == currentUserID {
			partnerID = c.User2ID
		}

		c.Partner = h.getPartnerProfile(partnerID)

		if targetType != nil && targetContent != nil && sparkComment != nil {
			c.OriginSpark = &models.Spark{
				TargetType:    *targetType,
				TargetContent: *targetContent,
				Comment:       *sparkComment,
			}
		}

		// Fetch latest message
		var lastMsg models.Message
		err = h.DB.QueryRow(
			`SELECT id, conversation_id, sender_id, content, media_type, media_url, created_at
			 FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 1`, c.ID,
		).Scan(&lastMsg.ID, &lastMsg.ConversationID, &lastMsg.SenderID, &lastMsg.Content, &lastMsg.MediaType, &lastMsg.MediaURL, &lastMsg.CreatedAt)
		if err == nil {
			c.LastMessage = &lastMsg
		}

		// Count unread
		h.DB.QueryRow(
			`SELECT COUNT(*) FROM messages 
			 WHERE conversation_id = $1 AND sender_id != $2 AND read_at IS NULL`,
			c.ID, currentUserID,
		).Scan(&c.UnreadCount)

		conversations = append(conversations, c)
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"conversations": conversations,
		"count":         len(conversations),
	})
}

// GetMessages returns paginated messages for a conversation
func (h *ChatHandler) GetMessages(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)
	convID := chi.URLParam(r, "id")

	// Verify participant
	var u1, u2 string
	err := h.DB.QueryRow("SELECT user1_id, user2_id FROM conversations WHERE id = $1", convID).Scan(&u1, &u2)
	if err != nil || (u1 != currentUserID && u2 != currentUserID) {
		respondJSON(w, http.StatusForbidden, map[string]string{"error": "access denied to conversation"})
		return
	}

	limit := 50
	if lStr := r.URL.Query().Get("limit"); lStr != "" {
		if l, err := strconv.Atoi(lStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	rows, err := h.DB.Query(
		`SELECT id, conversation_id, sender_id, content, media_type, media_url, read_at, reactions, created_at
		 FROM messages WHERE conversation_id = $1
		 ORDER BY created_at ASC LIMIT $2`, convID, limit,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load messages"})
		return
	}
	defer rows.Close()

	var messages []models.Message
	now := time.Now()

	for rows.Next() {
		var m models.Message
		var reactionsJSON string
		err := rows.Scan(&m.ID, &m.ConversationID, &m.SenderID, &m.Content, &m.MediaType, &m.MediaURL, &m.ReadAt, &reactionsJSON, &m.CreatedAt)
		if err != nil {
			continue
		}
		if reactionsJSON != "" {
			json.Unmarshal([]byte(reactionsJSON), &m.Reactions)
		}
		messages = append(messages, m)
	}

	// Mark unread messages as read
	go func() {
		h.DB.Exec(
			`UPDATE messages SET read_at = $1 
			 WHERE conversation_id = $2 AND sender_id != $3 AND read_at IS NULL`,
			now, convID, currentUserID,
		)
	}()

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"messages": messages,
		"count":    len(messages),
	})
}

// SendMessage sends a message in a conversation and triggers WebSocket dispatch
func (h *ChatHandler) SendMessage(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)
	convID := chi.URLParam(r, "id")

	var u1, u2 string
	err := h.DB.QueryRow("SELECT user1_id, user2_id FROM conversations WHERE id = $1", convID).Scan(&u1, &u2)
	if err != nil || (u1 != currentUserID && u2 != currentUserID) {
		respondJSON(w, http.StatusForbidden, map[string]string{"error": "access denied to conversation"})
		return
	}

	partnerID := u1
	if partnerID == currentUserID {
		partnerID = u2
	}

	// Check blocks
	var blockCount int
	h.DB.QueryRow(
		`SELECT COUNT(*) FROM user_blocks 
		 WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)`,
		currentUserID, partnerID,
	).Scan(&blockCount)
	if blockCount > 0 {
		respondJSON(w, http.StatusForbidden, map[string]string{"error": "unable to message this user"})
		return
	}

	var req SendMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || len(req.Content) == 0 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "content cannot be empty"})
		return
	}

	mediaType := req.MediaType
	if mediaType == "" {
		mediaType = "text"
	}

	msgID := uuid.New().String()
	now := time.Now()

	_, err = h.DB.Exec(
		`INSERT INTO messages (id, conversation_id, sender_id, content, media_type, media_url, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		msgID, convID, currentUserID, req.Content, mediaType, req.MediaURL, now,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save message"})
		return
	}

	// Update conversation last message timestamp
	h.DB.Exec("UPDATE conversations SET last_message_at = $1 WHERE id = $2", now, convID)

	msg := models.Message{
		ID:             msgID,
		ConversationID: convID,
		SenderID:       currentUserID,
		Content:        req.Content,
		MediaType:      mediaType,
		MediaURL:       req.MediaURL,
		CreatedAt:      now,
	}

	// Send to partner via real-time WebSocket
	if h.Hub != nil {
		h.Hub.SendToUser(partnerID, "new_message", msg)
	}

	respondJSON(w, http.StatusCreated, msg)
}

// AddReaction adds or toggles an emoji reaction on a message
func (h *ChatHandler) AddReaction(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)
	msgID := chi.URLParam(r, "messageId")

	var req ReactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Emoji == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "emoji required"})
		return
	}

	var reactionsJSON string
	var convID string
	err := h.DB.QueryRow("SELECT conversation_id, reactions FROM messages WHERE id = $1", msgID).Scan(&convID, &reactionsJSON)
	if err != nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "message not found"})
		return
	}

	reactions := make(map[string]string)
	if reactionsJSON != "" {
		json.Unmarshal([]byte(reactionsJSON), &reactions)
	}

	// Toggle or update
	if reactions[currentUserID] == req.Emoji {
		delete(reactions, currentUserID)
	} else {
		reactions[currentUserID] = req.Emoji
	}

	updatedJSON, _ := json.Marshal(reactions)
	h.DB.Exec("UPDATE messages SET reactions = $1 WHERE id = $2", string(updatedJSON), msgID)

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"message_id": msgID,
		"reactions":  reactions,
	})
}

// GetConversationRadar implements the RabbitHole Radar topic matcher
func (h *ChatHandler) GetConversationRadar(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)
	convID := chi.URLParam(r, "id")

	var u1, u2 string
	err := h.DB.QueryRow("SELECT user1_id, user2_id FROM conversations WHERE id = $1", convID).Scan(&u1, &u2)
	if err != nil || (u1 != currentUserID && u2 != currentUserID) {
		respondJSON(w, http.StatusForbidden, map[string]string{"error": "access denied"})
		return
	}

	partnerID := u1
	if partnerID == currentUserID {
		partnerID = u2
	}

	myProfile := h.getPartnerProfile(currentUserID)
	partnerProfile := h.getPartnerProfile(partnerID)

	if myProfile == nil || partnerProfile == nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "profiles unavailable"})
		return
	}

	sharedInterests := findIntersection(myProfile.Interests, partnerProfile.Interests)
	sharedTags := findIntersection(myProfile.MyWorldTags, partnerProfile.MyWorldTags)

	var suggestions []string
	if len(sharedInterests) > 0 {
		suggestions = append(suggestions, fmt.Sprintf("You both share an interest in %s. What drew you into that initially?", sharedInterests[0]))
	}
	if len(sharedTags) > 0 {
		suggestions = append(suggestions, fmt.Sprintf("You both love '%s'. Compare your favourite moments or works!", sharedTags[0]))
	}
	if partnerProfile.DefendTake != "" {
		suggestions = append(suggestions, fmt.Sprintf("Ask about their take: \"%s\"", partnerProfile.DefendTake))
	}
	if partnerProfile.RabbitHole != "" {
		suggestions = append(suggestions, fmt.Sprintf("Ask about their Rabbit Hole: \"%s\"", partnerProfile.RabbitHole))
	}

	// Default fallback curiosity prompts
	if len(suggestions) < 3 {
		suggestions = append(suggestions, "What is one thing people consistently misunderstand about your favourite field?")
		suggestions = append(suggestions, "What's an idea you recently changed your mind about?")
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"shared_interests": sharedInterests,
		"shared_tags":      sharedTags,
		"suggestions":      suggestions,
	})
}

func (h *ChatHandler) getPartnerProfile(userID string) *models.Profile {
	var p models.Profile
	var targetGendersJSON, myWorldJSON, interestsJSON string

	err := h.DB.QueryRow(
		`SELECT user_id, display_name, birthdate, age, gender, pronouns, city, country,
		 bio, dating_intentions, rabbit_hole, defend_take, teach_me, my_world_tags, interests, is_verified
		 FROM profiles WHERE user_id = $1`, userID,
	).Scan(
		&p.UserID, &p.DisplayName, &p.Birthdate, &p.Age, &p.Gender, &p.Pronouns, &p.City, &p.Country,
		&p.Bio, &p.DatingIntentions, &p.RabbitHole, &p.DefendTake, &p.TeachMe, &myWorldJSON, &interestsJSON, &p.IsVerified,
	)
	if err != nil {
		return nil
	}

	json.Unmarshal([]byte(targetGendersJSON), &p.TargetGenders)
	json.Unmarshal([]byte(myWorldJSON), &p.MyWorldTags)
	json.Unmarshal([]byte(interestsJSON), &p.Interests)

	// Fetch primary photo
	var photo models.Photo
	err = h.DB.QueryRow(
		`SELECT id, user_id, url, is_primary, sort_order, created_at
		 FROM profile_photos WHERE user_id = $1 ORDER BY is_primary DESC LIMIT 1`, userID,
	).Scan(&photo.ID, &photo.UserID, &photo.URL, &photo.IsPrimary, &photo.SortOrder, &photo.CreatedAt)
	if err == nil {
		p.Photos = []models.Photo{photo}
	}

	return &p
}

