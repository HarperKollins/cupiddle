package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/cupiddle/server/internal/database"
	"github.com/cupiddle/server/internal/middleware"
	"github.com/google/uuid"
)

type SuggestionHandler struct {
	DB *database.DB
}

func NewSuggestionHandler(db *database.DB) *SuggestionHandler {
	return &SuggestionHandler{DB: db}
}

type SuggestionRequest struct {
	Category string `json:"category"`
	Title    string `json:"title"`
	Content  string `json:"content"`
	Email    string `json:"email,omitempty"`
}

type SuggestionRecord struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id,omitempty"`
	Email     string    `json:"email,omitempty"`
	Category  string    `json:"category"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

func (h *SuggestionHandler) SubmitSuggestion(w http.ResponseWriter, r *http.Request) {
	var req SuggestionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	req.Title = strings.TrimSpace(req.Title)
	req.Content = strings.TrimSpace(req.Content)
	if req.Title == "" || req.Content == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "title and description are required"})
		return
	}

	category := strings.TrimSpace(req.Category)
	if category == "" {
		category = "Feature Request"
	}

	userID, _ := r.Context().Value(middleware.UserIDKey).(string)

	suggestionID := uuid.New().String()
	now := time.Now()

	_, err := h.DB.Exec(
		`INSERT INTO suggestions (id, user_id, email, category, title, content, status, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)`,
		suggestionID, userID, req.Email, category, req.Title, req.Content, now,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to record suggestion"})
		return
	}

	respondJSON(w, http.StatusCreated, map[string]interface{}{
		"success": true,
		"message": "Thank you! Your suggestion has been recorded and will shape Cupiddle's roadmap.",
		"id":      suggestionID,
	})
}

func (h *SuggestionHandler) GetSuggestions(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(
		`SELECT id, user_id, email, category, title, content, status, created_at 
		 FROM suggestions ORDER BY created_at DESC LIMIT 100`,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to fetch suggestions"})
		return
	}
	defer rows.Close()

	var list []SuggestionRecord
	for rows.Next() {
		var s SuggestionRecord
		if err := rows.Scan(&s.ID, &s.UserID, &s.Email, &s.Category, &s.Title, &s.Content, &s.Status, &s.CreatedAt); err == nil {
			list = append(list, s)
		}
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"suggestions": list,
	})
}

