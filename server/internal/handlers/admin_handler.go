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

// AdminHandler handles administration metrics, user management, and moderation queues
type AdminHandler struct {
	DB *database.DB
}

// NewAdminHandler creates a new AdminHandler
func NewAdminHandler(db *database.DB) *AdminHandler {
	return &AdminHandler{DB: db}
}

type UpdateStatusRequest struct {
	Status string `json:"status"` // "active", "suspended", "banned"
	Reason string `json:"reason"`
}

type ResolveReportRequest struct {
	Status         string `json:"status"` // "resolved", "dismissed"
	ActionTaken    string `json:"action_taken"` // "warning", "suspend_7_days", "permanent_ban", "no_violation"
	ModeratorNotes string `json:"moderator_notes"`
}

type VerificationRequest struct {
	IsVerified bool   `json:"is_verified"`
	Badge      string `json:"badge"` // "Curious Pioneer", "Verified Human", "Community Scholar"
}

// GetOverviewMetrics returns live operational metrics calculated directly from the database
func (h *AdminHandler) GetOverviewMetrics(w http.ResponseWriter, r *http.Request) {
	var totalUsers, suspendedUsers, activeMatches, sparksSent, sparksAccepted, messagesCount, pendingReports, communitiesCount int

	h.DB.QueryRow("SELECT COUNT(*) FROM users").Scan(&totalUsers)
	h.DB.QueryRow("SELECT COUNT(*) FROM users WHERE status IN ('suspended', 'banned')").Scan(&suspendedUsers)
	h.DB.QueryRow("SELECT COUNT(*) FROM matches").Scan(&activeMatches)
	h.DB.QueryRow("SELECT COUNT(*) FROM sparks").Scan(&sparksSent)
	h.DB.QueryRow("SELECT COUNT(*) FROM sparks WHERE status = 'accepted'").Scan(&sparksAccepted)
	h.DB.QueryRow("SELECT COUNT(*) FROM messages").Scan(&messagesCount)
	h.DB.QueryRow("SELECT COUNT(*) FROM reports WHERE status = 'pending'").Scan(&pendingReports)
	h.DB.QueryRow("SELECT COUNT(*) FROM communities").Scan(&communitiesCount)

	acceptanceRate := 0.0
	if sparksSent > 0 {
		acceptanceRate = (float64(sparksAccepted) / float64(sparksSent)) * 100.0
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"total_users":       totalUsers,
		"active_users":      totalUsers - suspendedUsers,
		"suspended_users":   suspendedUsers,
		"active_matches":    activeMatches,
		"sparks_sent":       sparksSent,
		"sparks_accepted":   sparksAccepted,
		"acceptance_rate":   acceptanceRate,
		"messages_volume":   messagesCount,
		"pending_reports":   pendingReports,
		"communities_count": communitiesCount,
	})
}

// GetUsers returns searchable, filterable list of users
func (h *AdminHandler) GetUsers(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")
	status := r.URL.Query().Get("status")

	query := `
		SELECT u.id, u.email, u.role, u.status, u.email_verified, u.created_at,
		       COALESCE(p.display_name, ''), COALESCE(p.city, ''), COALESCE(p.age, 0),
		       COALESCE(p.is_verified, false), COALESCE(p.verification_badge, '')
		FROM users u
		LEFT JOIN profiles p ON p.user_id = u.id
		WHERE 1=1
	`
	var args []interface{}
	idx := 1

	if search != "" {
		query += " AND (u.email LIKE $" + string(rune('0'+idx)) + " OR p.display_name LIKE $" + string(rune('0'+idx)) + ")"
		args = append(args, "%"+search+"%")
		idx++
	}

	if status != "" {
		query += " AND u.status = $" + string(rune('0'+idx))
		args = append(args, status)
		idx++
	}

	query += " ORDER BY u.created_at DESC LIMIT 100"

	rows, err := h.DB.Query(query, args...)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to query users"})
		return
	}
	defer rows.Close()

	var users []map[string]interface{}
	for rows.Next() {
		var u models.User
		var displayName, city, badge string
		var age int
		var isVerified bool

		if err := rows.Scan(&u.ID, &u.Email, &u.Role, &u.Status, &u.EmailVerified, &u.CreatedAt, &displayName, &city, &age, &isVerified, &badge); err == nil {
			users = append(users, map[string]interface{}{
				"id":                 u.ID,
				"email":              u.Email,
				"role":               u.Role,
				"status":             u.Status,
				"email_verified":     u.EmailVerified,
				"display_name":       displayName,
				"city":               city,
				"age":                age,
				"is_verified":        isVerified,
				"verification_badge": badge,
				"created_at":         u.CreatedAt,
			})
		}
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"users": users,
		"count": len(users),
	})
}

// UpdateUserStatus suspends, bans, or reinstates an account
func (h *AdminHandler) UpdateUserStatus(w http.ResponseWriter, r *http.Request) {
	adminID, _ := r.Context().Value(middleware.UserIDKey).(string)
	targetUserID := chi.URLParam(r, "id")

	var req UpdateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	if req.Status != "active" && req.Status != "suspended" && req.Status != "banned" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "status must be active, suspended, or banned"})
		return
	}

	now := time.Now()
	_, err := h.DB.Exec("UPDATE users SET status = $1, updated_at = $2 WHERE id = $3", req.Status, now, targetUserID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update status"})
		return
	}

	// Audit log
	auditID := uuid.New().String()
	h.DB.Exec(
		`INSERT INTO audit_logs (id, actor_id, action, target_type, target_id, details, created_at)
		 VALUES ($1, $2, 'update_user_status', 'user', $3, $4, $5)`,
		auditID, adminID, targetUserID, "Status changed to: "+req.Status+" Reason: "+req.Reason, now,
	)

	respondJSON(w, http.StatusOK, map[string]string{"message": "user status updated to " + req.Status})
}

// ToggleVerification updates verified badge status
func (h *AdminHandler) ToggleVerification(w http.ResponseWriter, r *http.Request) {
	adminID, _ := r.Context().Value(middleware.UserIDKey).(string)
	targetUserID := chi.URLParam(r, "id")

	var req VerificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	now := time.Now()
	_, err := h.DB.Exec(
		"UPDATE profiles SET is_verified = $1, verification_badge = $2, updated_at = $3 WHERE user_id = $4",
		req.IsVerified, req.Badge, now, targetUserID,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update verification"})
		return
	}

	auditID := uuid.New().String()
	h.DB.Exec(
		`INSERT INTO audit_logs (id, actor_id, action, target_type, target_id, details, created_at)
		 VALUES ($1, $2, 'toggle_verification', 'user', $3, $4, $5)`,
		auditID, adminID, targetUserID, "Verified: "+req.Badge, now,
	)

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"is_verified":        req.IsVerified,
		"verification_badge": req.Badge,
	})
}

// GetReportsQueue returns moderation queue
func (h *AdminHandler) GetReportsQueue(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(
		`SELECT r.id, r.reporter_id, r.reported_id, r.reason, r.details, r.status, r.created_at,
		        rep.display_name as reporter_name,
		        target.display_name as reported_name, target.city as reported_city
		 FROM reports r
		 LEFT JOIN profiles rep ON rep.user_id = r.reporter_id
		 LEFT JOIN profiles target ON target.user_id = r.reported_id
		 WHERE r.status IN ('pending', 'investigating')
		 ORDER BY r.created_at DESC`,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load reports"})
		return
	}
	defer rows.Close()

	var reports []map[string]interface{}
	for rows.Next() {
		var id, reporterID, reportedID, reason, details, status string
		var createdAt time.Time
		var reporterName, reportedName, reportedCity *string

		if err := rows.Scan(&id, &reporterID, &reportedID, &reason, &details, &status, &createdAt, &reporterName, &reportedName, &reportedCity); err == nil {
			repName := "Unknown"
			if reporterName != nil {
				repName = *reporterName
			}
			tName := "Unknown"
			if reportedName != nil {
				tName = *reportedName
			}
			tCity := "Unknown"
			if reportedCity != nil {
				tCity = *reportedCity
			}

			reports = append(reports, map[string]interface{}{
				"id":            id,
				"reporter_id":   reporterID,
				"reporter_name": repName,
				"reported_id":   reportedID,
				"reported_name": tName,
				"reported_city": tCity,
				"reason":        reason,
				"details":       details,
				"status":        status,
				"created_at":    createdAt,
			})
		}
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"reports": reports,
		"count":   len(reports),
	})
}

// ResolveReport marks report case as resolved or dismissed
func (h *AdminHandler) ResolveReport(w http.ResponseWriter, r *http.Request) {
	adminID, _ := r.Context().Value(middleware.UserIDKey).(string)
	reportID := chi.URLParam(r, "id")

	var req ResolveReportRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	now := time.Now()
	_, err := h.DB.Exec(
		`UPDATE reports SET status = $1, action_taken = $2, moderator_notes = $3, resolved_at = $4
		 WHERE id = $5`,
		req.Status, req.ActionTaken, req.ModeratorNotes, now, reportID,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to resolve report"})
		return
	}

	auditID := uuid.New().String()
	h.DB.Exec(
		`INSERT INTO audit_logs (id, actor_id, action, target_type, target_id, details, created_at)
		 VALUES ($1, $2, 'resolve_report', 'report', $3, $4, $5)`,
		auditID, adminID, reportID, "Action: "+req.ActionTaken+" Notes: "+req.ModeratorNotes, now,
	)

	respondJSON(w, http.StatusOK, map[string]string{"message": "report successfully resolved"})
}

// GetAuditLogs returns recent audit trail
func (h *AdminHandler) GetAuditLogs(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(
		`SELECT id, actor_id, action, target_type, target_id, details, created_at
		 FROM audit_logs ORDER BY created_at DESC LIMIT 100`,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to query audit logs"})
		return
	}
	defer rows.Close()

	var logs []models.AuditLog
	for rows.Next() {
		var l models.AuditLog
		if err := rows.Scan(&l.ID, &l.ActorID, &l.Action, &l.TargetType, &l.TargetID, &l.Details, &l.CreatedAt); err == nil {
			logs = append(logs, l)
		}
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"audit_logs": logs,
		"count":      len(logs),
	})
}
