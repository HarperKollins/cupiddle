package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/cupiddle/server/internal/database"
	"github.com/cupiddle/server/internal/middleware"
	"github.com/cupiddle/server/internal/models"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// SafetyHandler manages blocking, reporting, and safety operations
type SafetyHandler struct {
	DB *database.DB
}

// NewSafetyHandler creates a new SafetyHandler
func NewSafetyHandler(db *database.DB) *SafetyHandler {
	return &SafetyHandler{DB: db}
}

type BlockRequest struct {
	TargetUserID string `json:"target_user_id"`
}

type ReportRequest struct {
	ReportedUserID string `json:"reported_user_id"`
	Reason         string `json:"reason"` // "harassment", "scam", "inappropriate_photos", "underage", "fake_profile", "spam"
	Details        string `json:"details"`
}

// BlockUser blocks another user and cleans up active matches
func (h *SafetyHandler) BlockUser(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)
	var req BlockRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.TargetUserID == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "target_user_id required"})
		return
	}

	if req.TargetUserID == currentUserID {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "cannot block yourself"})
		return
	}

	now := time.Now()
	_, err := h.DB.Exec(
		`INSERT INTO user_blocks (blocker_id, blocked_id, created_at)
		 VALUES ($1, $2, $3)
		 ON CONFLICT (blocker_id, blocked_id) DO NOTHING`,
		currentUserID, req.TargetUserID, now,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to block user"})
		return
	}

	// Terminate active matches and conversations
	h.DB.Exec(
		`DELETE FROM matches 
		 WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`,
		currentUserID, req.TargetUserID,
	)

	respondJSON(w, http.StatusOK, map[string]string{"message": "user blocked and matches removed"})
}

// UnblockUser removes a block
func (h *SafetyHandler) UnblockUser(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)
	targetID := chi.URLParam(r, "userId")

	_, err := h.DB.Exec(
		"DELETE FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2",
		currentUserID, targetID,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to unblock user"})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "user unblocked"})
}

// GetBlockedUsers returns list of blocked users
func (h *SafetyHandler) GetBlockedUsers(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)

	rows, err := h.DB.Query(
		`SELECT b.blocked_id, p.display_name, p.city, b.created_at
		 FROM user_blocks b
		 LEFT JOIN profiles p ON p.user_id = b.blocked_id
		 WHERE b.blocker_id = $1
		 ORDER BY b.created_at DESC`,
		currentUserID,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load blocks"})
		return
	}
	defer rows.Close()

	var blockedList []map[string]interface{}
	for rows.Next() {
		var id, displayName, city string
		var createdAt time.Time
		if err := rows.Scan(&id, &displayName, &city, &createdAt); err == nil {
			blockedList = append(blockedList, map[string]interface{}{
				"user_id":      id,
				"display_name": displayName,
				"city":         city,
				"created_at":   createdAt,
			})
		}
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"blocked_users": blockedList,
		"count":         len(blockedList),
	})
}

// SubmitReport files a safety report against an account
func (h *SafetyHandler) SubmitReport(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)
	var req ReportRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	if req.ReportedUserID == "" || req.ReportedUserID == currentUserID {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid reported user"})
		return
	}

	if req.Reason == "" || len(req.Details) < 5 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "valid reason and detailed explanation required"})
		return
	}

	reportID := uuid.New().String()
	now := time.Now()

	_, err := h.DB.Exec(
		`INSERT INTO reports (id, reporter_id, reported_id, reason, details, status, created_at)
		 VALUES ($1, $2, $3, $4, $5, 'pending', $6)`,
		reportID, currentUserID, req.ReportedUserID, req.Reason, req.Details, now,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to submit report: " + err.Error()})
		return
	}

	// Create audit log
	auditID := uuid.New().String()
	h.DB.Exec(
		`INSERT INTO audit_logs (id, actor_id, action, target_type, target_id, details, created_at)
		 VALUES ($1, $2, 'report_submitted', 'user', $3, $4, $5)`,
		auditID, currentUserID, req.ReportedUserID, "Reason: "+req.Reason, now,
	)

	respondJSON(w, http.StatusCreated, models.Report{
		ID:         reportID,
		ReporterID: currentUserID,
		ReportedID: req.ReportedUserID,
		Reason:     req.Reason,
		Details:    req.Details,
		Status:     "pending",
		CreatedAt:  now,
	})
}
