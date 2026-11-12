package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/cupiddle/server/internal/database"
	"github.com/cupiddle/server/internal/middleware"
	"github.com/cupiddle/server/internal/models"
	"github.com/cupiddle/server/internal/websocket"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// SparkHandler manages contextual Sparks, inbox, and match creation
type SparkHandler struct {
	DB  *database.DB
	Hub *websocket.Hub
}

// NewSparkHandler creates a new SparkHandler
func NewSparkHandler(db *database.DB, hub *websocket.Hub) *SparkHandler {
	return &SparkHandler{DB: db, Hub: hub}
}

type SendSparkRequest struct {
	ReceiverID    string `json:"receiver_id"`
	TargetType    string `json:"target_type"`    // "rabbit_hole", "defend_take", "teach_me", "photo", "community_post", "general"
	TargetContent string `json:"target_content"` // The snippet being reacted to
	Comment       string `json:"comment"`        // The thoughtful message
}

// SendSpark creates a new contextual Spark
func (h *SparkHandler) SendSpark(w http.ResponseWriter, r *http.Request) {
	senderID, _ := r.Context().Value(middleware.UserIDKey).(string)
	var req SendSparkRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	if req.ReceiverID == "" || req.ReceiverID == senderID {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "cannot send spark to self or invalid recipient"})
		return
	}

	if len(req.Comment) < 2 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "please include a thoughtful comment with your spark"})
		return
	}

	// Check if blocked
	var blockCount int
	h.DB.QueryRow(
		`SELECT COUNT(*) FROM user_blocks 
		 WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)`,
		senderID, req.ReceiverID,
	).Scan(&blockCount)
	if blockCount > 0 {
		respondJSON(w, http.StatusForbidden, map[string]string{"error": "unable to interact with this user"})
		return
	}

	// Check if pending spark already exists
	var existingSparkID string
	err := h.DB.QueryRow(
		`SELECT id FROM sparks 
		 WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'`,
		senderID, req.ReceiverID,
	).Scan(&existingSparkID)
	if err == nil {
		respondJSON(w, http.StatusConflict, map[string]string{"error": "you already have a pending spark with this user"})
		return
	}

	sparkID := uuid.New().String()
	now := time.Now()

	_, err = h.DB.Exec(
		`INSERT INTO sparks (id, sender_id, receiver_id, target_type, target_content, comment, status, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8)`,
		sparkID, senderID, req.ReceiverID, req.TargetType, req.TargetContent, req.Comment, now, now,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to send spark: " + err.Error()})
		return
	}

	spark := models.Spark{
		ID:            sparkID,
		SenderID:      senderID,
		ReceiverID:    req.ReceiverID,
		TargetType:    req.TargetType,
		TargetContent: req.TargetContent,
		Comment:       req.Comment,
		Status:        "pending",
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	// Notify receiver in real-time
	if h.Hub != nil {
		h.Hub.SendToUser(req.ReceiverID, "spark_received", spark)
	}

	respondJSON(w, http.StatusCreated, spark)
}

// GetIncomingSparks returns pending sparks received by current user
func (h *SparkHandler) GetIncomingSparks(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)

	rows, err := h.DB.Query(
		`SELECT s.id, s.sender_id, s.receiver_id, s.target_type, s.target_content, s.comment, s.status, s.created_at, s.updated_at,
		        p.display_name, p.age, p.city, p.bio, p.rabbit_hole, p.defend_take, p.teach_me, p.interests
		 FROM sparks s
		 JOIN profiles p ON p.user_id = s.sender_id
		 WHERE s.receiver_id = $1 AND s.status = 'pending'
		 ORDER BY s.created_at DESC`,
		currentUserID,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to fetch sparks"})
		return
	}
	defer rows.Close()

	var sparks []models.Spark
	for rows.Next() {
		var s models.Spark
		var p models.Profile
		var interestsJSON string

		err := rows.Scan(
			&s.ID, &s.SenderID, &s.ReceiverID, &s.TargetType, &s.TargetContent, &s.Comment, &s.Status, &s.CreatedAt, &s.UpdatedAt,
			&p.DisplayName, &p.Age, &p.City, &p.Bio, &p.RabbitHole, &p.DefendTake, &p.TeachMe, &interestsJSON,
		)
		if err != nil {
			continue
		}

		p.UserID = s.SenderID
		json.Unmarshal([]byte(interestsJSON), &p.Interests)
		p.Photos = h.getPhotos(s.SenderID)
		s.SenderProfile = &p

		sparks = append(sparks, s)
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"sparks": sparks,
		"count":  len(sparks),
	})
}

// AcceptSpark accepts a spark, creating a Match and starting a Conversation
func (h *SparkHandler) AcceptSpark(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)
	sparkID := chi.URLParam(r, "id")

	var spark models.Spark
	err := h.DB.QueryRow(
		`SELECT id, sender_id, receiver_id, target_type, target_content, comment, status
		 FROM sparks WHERE id = $1 AND receiver_id = $2`,
		sparkID, currentUserID,
	).Scan(&spark.ID, &spark.SenderID, &spark.ReceiverID, &spark.TargetType, &spark.TargetContent, &spark.Comment, &spark.Status)
	if err != nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "spark not found"})
		return
	}

	if spark.Status != "pending" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "spark already processed"})
		return
	}

	now := time.Now()

	// Update spark status
	h.DB.Exec("UPDATE sparks SET status = 'accepted', updated_at = $1 WHERE id = $2", now, sparkID)

	// Create match
	matchID := uuid.New().String()
	_, err = h.DB.Exec(
		`INSERT INTO matches (id, user1_id, user2_id, spark_id, created_at)
		 VALUES ($1, $2, $3, $4, $5)
		 ON CONFLICT (user1_id, user2_id) DO NOTHING`,
		matchID, spark.SenderID, spark.ReceiverID, spark.ID, now,
	)
	if err != nil {
		// Try reversed conflict check
		h.DB.QueryRow("SELECT id FROM matches WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)", spark.SenderID, spark.ReceiverID).Scan(&matchID)
	}

	// Create conversation
	convID := uuid.New().String()
	_, err = h.DB.Exec(
		`INSERT INTO conversations (id, match_id, spark_id, user1_id, user2_id, last_message_at, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 ON CONFLICT (match_id) DO NOTHING`,
		convID, matchID, spark.ID, spark.SenderID, spark.ReceiverID, now, now,
	)
	if err != nil {
		h.DB.QueryRow("SELECT id FROM conversations WHERE match_id = $1", matchID).Scan(&convID)
	}

	// Insert initial contextual message representing the Spark
	msgID := uuid.New().String()
	initialContent := "Sparked conversation: \"" + spark.Comment + "\""
	h.DB.Exec(
		`INSERT INTO messages (id, conversation_id, sender_id, content, media_type, created_at)
		 VALUES ($1, $2, $3, $4, 'text', $5)`,
		msgID, convID, spark.SenderID, initialContent, now,
	)

	matchData := map[string]interface{}{
		"match_id":        matchID,
		"conversation_id": convID,
		"spark":           spark,
		"matched_at":      now,
	}

	// Notify both users via WebSocket
	if h.Hub != nil {
		h.Hub.SendToUser(spark.SenderID, "match_created", matchData)
		h.Hub.SendToUser(spark.ReceiverID, "match_created", matchData)
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"message":         "spark accepted",
		"match_id":        matchID,
		"conversation_id": convID,
	})
}

// PassSpark rejects/passes on an incoming spark
func (h *SparkHandler) PassSpark(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)
	sparkID := chi.URLParam(r, "id")

	_, err := h.DB.Exec(
		"UPDATE sparks SET status = 'passed', updated_at = $1 WHERE id = $2 AND receiver_id = $3",
		time.Now(), sparkID, currentUserID,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update spark"})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "spark passed"})
}

func (h *SparkHandler) getPhotos(userID string) []models.Photo {
	var photos []models.Photo
	rows, err := h.DB.Query(
		`SELECT id, user_id, url, is_primary, sort_order, created_at
		 FROM profile_photos WHERE user_id = $1 ORDER BY sort_order ASC, is_primary DESC`, userID,
	)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var photo models.Photo
			if err := rows.Scan(&photo.ID, &photo.UserID, &photo.URL, &photo.IsPrimary, &photo.SortOrder, &photo.CreatedAt); err == nil {
				photos = append(photos, photo)
			}
		}
	}
	return photos
}

