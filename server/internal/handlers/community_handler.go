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

// CommunityHandler manages Rabbit Hole communities, posts, comments, and community sparks
type CommunityHandler struct {
	DB  *database.DB
	Hub *websocket.Hub
}

// NewCommunityHandler creates a new CommunityHandler
func NewCommunityHandler(db *database.DB, hub *websocket.Hub) *CommunityHandler {
	return &CommunityHandler{DB: db, Hub: hub}
}

type CreatePostRequest struct {
	Title   string   `json:"title"`
	Content string   `json:"content"`
	Tags    []string `json:"tags"`
}

type AddCommentRequest struct {
	Content string `json:"content"`
}

// GetCommunities returns all available Rabbit Hole communities
func (h *CommunityHandler) GetCommunities(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)

	rows, err := h.DB.Query(
		`SELECT c.id, c.slug, c.name, c.description, c.icon, c.category, c.member_count, c.post_count, c.created_at,
		        CASE WHEN cm.user_id IS NOT NULL THEN 1 ELSE 0 END as is_member
		 FROM communities c
		 LEFT JOIN community_members cm ON cm.community_id = c.id AND cm.user_id = $1
		 ORDER BY c.member_count DESC, c.name ASC`,
		currentUserID,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to query communities"})
		return
	}
	defer rows.Close()

	communities := make([]models.Community, 0)
	for rows.Next() {
		var c models.Community
		var isMemberInt int
		if err := rows.Scan(&c.ID, &c.Slug, &c.Name, &c.Description, &c.Icon, &c.Category, &c.MemberCount, &c.PostCount, &c.CreatedAt, &isMemberInt); err == nil {
			c.IsMember = (isMemberInt == 1)
			communities = append(communities, c)
		}
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"communities": communities,
		"count":       len(communities),
	})
}

// GetCommunityPosts returns posts within a specific community
func (h *CommunityHandler) GetCommunityPosts(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	var commID string
	err := h.DB.QueryRow("SELECT id FROM communities WHERE slug = $1", slug).Scan(&commID)
	if err != nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "community not found"})
		return
	}

	rows, err := h.DB.Query(
		`SELECT p.id, p.community_id, p.user_id, p.title, p.content, p.tags, p.like_count, p.comment_count, p.created_at,
		        pr.display_name, pr.age, pr.city, pr.is_verified
		 FROM community_posts p
		 JOIN profiles pr ON pr.user_id = p.user_id
		 WHERE p.community_id = $1
		 ORDER BY p.created_at DESC LIMIT 50`,
		commID,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load posts"})
		return
	}
	defer rows.Close()

	posts := make([]models.CommunityPost, 0)
	for rows.Next() {
		var post models.CommunityPost
		var author models.Profile
		var tagsJSON string

		err := rows.Scan(
			&post.ID, &post.CommunityID, &post.UserID, &post.Title, &post.Content, &tagsJSON,
			&post.LikeCount, &post.CommentCount, &post.CreatedAt,
			&author.DisplayName, &author.Age, &author.City, &author.IsVerified,
		)
		if err != nil {
			continue
		}

		author.UserID = post.UserID
		json.Unmarshal([]byte(tagsJSON), &post.Tags)
		post.Author = &author
		posts = append(posts, post)
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"posts": posts,
		"count": len(posts),
	})
}

// JoinCommunity toggles membership in a community
func (h *CommunityHandler) JoinCommunity(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)
	slug := chi.URLParam(r, "slug")

	var commID string
	err := h.DB.QueryRow("SELECT id FROM communities WHERE slug = $1", slug).Scan(&commID)
	if err != nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "community not found"})
		return
	}

	now := time.Now()
	_, err = h.DB.Exec(
		`INSERT INTO community_members (community_id, user_id, joined_at)
		 VALUES ($1, $2, $3)
		 ON CONFLICT (community_id, user_id) DO NOTHING`,
		commID, currentUserID, now,
	)
	if err == nil {
		h.DB.Exec("UPDATE communities SET member_count = (SELECT COUNT(*) FROM community_members WHERE community_id = $1) WHERE id = $1", commID)
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "joined community"})
}

// LeaveCommunity leaves a community
func (h *CommunityHandler) LeaveCommunity(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)
	slug := chi.URLParam(r, "slug")

	var commID string
	err := h.DB.QueryRow("SELECT id FROM communities WHERE slug = $1", slug).Scan(&commID)
	if err != nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "community not found"})
		return
	}

	h.DB.Exec("DELETE FROM community_members WHERE community_id = $1 AND user_id = $2", commID, currentUserID)
	h.DB.Exec("UPDATE communities SET member_count = (SELECT COUNT(*) FROM community_members WHERE community_id = $1) WHERE id = $1", commID)

	respondJSON(w, http.StatusOK, map[string]string{"message": "left community"})
}

// CreatePost publishes a discussion post
func (h *CommunityHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)
	slug := chi.URLParam(r, "slug")

	var commID string
	err := h.DB.QueryRow("SELECT id FROM communities WHERE slug = $1", slug).Scan(&commID)
	if err != nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "community not found"})
		return
	}

	var req CreatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || len(req.Title) == 0 || len(req.Content) == 0 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "title and content are required"})
		return
	}

	postID := uuid.New().String()
	tagsBytes, _ := json.Marshal(req.Tags)
	now := time.Now()

	_, err = h.DB.Exec(
		`INSERT INTO community_posts (id, community_id, user_id, title, content, tags, like_count, comment_count, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, 0, 0, $7)`,
		postID, commID, currentUserID, req.Title, req.Content, string(tagsBytes), now,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create post"})
		return
	}

	h.DB.Exec("UPDATE communities SET post_count = (SELECT COUNT(*) FROM community_posts WHERE community_id = $1) WHERE id = $1", commID)

	respondJSON(w, http.StatusCreated, models.CommunityPost{
		ID:          postID,
		CommunityID: commID,
		UserID:      currentUserID,
		Title:       req.Title,
		Content:     req.Content,
		Tags:        req.Tags,
		CreatedAt:   now,
	})
}

// GetPostComments returns comments for a post
func (h *CommunityHandler) GetPostComments(w http.ResponseWriter, r *http.Request) {
	postID := chi.URLParam(r, "postId")

	rows, err := h.DB.Query(
		`SELECT c.id, c.post_id, c.user_id, c.content, c.created_at,
		        pr.display_name, pr.city, pr.is_verified
		 FROM post_comments c
		 JOIN profiles pr ON pr.user_id = c.user_id
		 WHERE c.post_id = $1
		 ORDER BY c.created_at ASC`,
		postID,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to fetch comments"})
		return
	}
	defer rows.Close()

	comments := make([]models.PostComment, 0)
	for rows.Next() {
		var c models.PostComment
		var author models.Profile
		if err := rows.Scan(&c.ID, &c.PostID, &c.UserID, &c.Content, &c.CreatedAt, &author.DisplayName, &author.City, &author.IsVerified); err == nil {
			author.UserID = c.UserID
			c.Author = &author
			comments = append(comments, c)
		}
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"comments": comments,
		"count":    len(comments),
	})
}

// AddComment posts a response to a discussion
func (h *CommunityHandler) AddComment(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)
	postID := chi.URLParam(r, "postId")

	var req AddCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || len(req.Content) == 0 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "comment content required"})
		return
	}

	commentID := uuid.New().String()
	now := time.Now()

	_, err := h.DB.Exec(
		`INSERT INTO post_comments (id, post_id, user_id, content, created_at)
		 VALUES ($1, $2, $3, $4, $5)`,
		commentID, postID, currentUserID, req.Content, now,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save comment"})
		return
	}

	h.DB.Exec("UPDATE community_posts SET comment_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = $1) WHERE id = $1", postID)

	respondJSON(w, http.StatusCreated, models.PostComment{
		ID:        commentID,
		PostID:    postID,
		UserID:    currentUserID,
		Content:   req.Content,
		CreatedAt: now,
	})
}

