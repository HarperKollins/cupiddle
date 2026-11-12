package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/cupiddle/server/internal/auth"
	"github.com/cupiddle/server/internal/config"
	"github.com/cupiddle/server/internal/database"
	"github.com/cupiddle/server/internal/middleware"
	"github.com/cupiddle/server/internal/models"
	"github.com/google/uuid"
)

// AuthHandler handles user registration, authentication and session lifecycle
type AuthHandler struct {
	DB     *database.DB
	Config *config.Config
}

// NewAuthHandler creates a new AuthHandler
func NewAuthHandler(db *database.DB, cfg *config.Config) *AuthHandler {
	return &AuthHandler{DB: db, Config: cfg}
}

type RegisterRequest struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	DisplayName string `json:"display_name"`
	Birthdate   string `json:"birthdate"` // YYYY-MM-DD
	Gender      string `json:"gender"`
	City        string `json:"city"`
	Country     string `json:"country"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token   string          `json:"token"`
	User    *models.User    `json:"user"`
	Profile *models.Profile `json:"profile,omitempty"`
}

// Register creates a new adult user account and initializes their curiosity profile
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	if req.Email == "" || !strings.Contains(req.Email, "@") {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "valid email address is required"})
		return
	}

	if len(req.Password) < 8 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "password must be at least 8 characters"})
		return
	}

	if strings.TrimSpace(req.DisplayName) == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "display name is required"})
		return
	}

	// 18+ Age verification
	age, err := auth.CalculateAge(req.Birthdate)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	// Check if user already exists
	var existingID string
	err = h.DB.QueryRow("SELECT id FROM users WHERE email = $1", req.Email).Scan(&existingID)
	if err == nil {
		respondJSON(w, http.StatusConflict, map[string]string{"error": "an account with this email already exists"})
		return
	}

	// Hash password
	pwHash, err := auth.HashPassword(req.Password)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to process credentials"})
		return
	}

	userID := uuid.New().String()
	now := time.Now()

	country := req.Country
	if country == "" {
		country = "Nigeria"
	}

	// Insert user
	_, err = h.DB.Exec(
		`INSERT INTO users (id, email, password_hash, role, status, email_verified, created_at, updated_at)
		 VALUES ($1, $2, $3, 'user', 'active', false, $4, $5)`,
		userID, req.Email, pwHash, now, now,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create user account: " + err.Error()})
		return
	}

	// Insert default profile
	profile := &models.Profile{
		UserID:           userID,
		DisplayName:      req.DisplayName,
		Birthdate:        req.Birthdate,
		Age:              age,
		Gender:           req.Gender,
		City:             req.City,
		Country:          country,
		TargetGenders:    []string{},
		AgeMin:           18,
		AgeMax:           99,
		MaxDistanceKm:    100,
		MyWorldTags:      []string{},
		Interests:        []string{},
		Photos:           []models.Photo{},
		CreatedAt:        now,
		UpdatedAt:        now,
	}

	_, err = h.DB.Exec(
		`INSERT INTO profiles (user_id, display_name, birthdate, age, gender, pronouns, city, country,
		 latitude, longitude, bio, dating_intentions, target_genders, age_min, age_max, max_distance_km,
		 is_paused, is_verified, verification_badge, audio_intro_url, audio_intro_duration,
		 rabbit_hole, defend_take, teach_me, my_world_tags, interests, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, '', $6, $7, 0, 0, '', '', '[]', 18, 99, 100,
		 false, false, '', '', 0, '', '', '', '[]', '[]', $8, $9)`,
		userID, req.DisplayName, req.Birthdate, age, req.Gender, req.City, country, now, now,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to initialize profile: " + err.Error()})
		return
	}

	token, err := auth.GenerateJWT(userID, req.Email, "user", h.Config.JWTSecret)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to generate authentication token"})
		return
	}

	user := &models.User{
		ID:            userID,
		Email:         req.Email,
		Role:          "user",
		Status:        "active",
		EmailVerified: false,
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	respondJSON(w, http.StatusCreated, AuthResponse{
		Token:   token,
		User:    user,
		Profile: profile,
	})
}

// Login authenticates an existing user
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	var user models.User
	err := h.DB.QueryRow(
		`SELECT id, email, password_hash, role, status, email_verified, created_at, updated_at
		 FROM users WHERE email = $1`, req.Email,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Role, &user.Status, &user.EmailVerified, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid email or password"})
		return
	}

	if user.Status == "banned" {
		respondJSON(w, http.StatusForbidden, map[string]string{"error": "this account has been permanently suspended for safety violations"})
		return
	}

	if !auth.CheckPasswordHash(req.Password, user.PasswordHash) {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid email or password"})
		return
	}

	profile := h.getProfileByUserID(user.ID)

	token, err := auth.GenerateJWT(user.ID, user.Email, user.Role, h.Config.JWTSecret)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to generate authentication token"})
		return
	}

	respondJSON(w, http.StatusOK, AuthResponse{
		Token:   token,
		User:    &user,
		Profile: profile,
	})
}

// Me returns the authenticated user's account and profile
func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	if userID == "" {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	var user models.User
	err := h.DB.QueryRow(
		`SELECT id, email, role, status, email_verified, created_at, updated_at
		 FROM users WHERE id = $1`, userID,
	).Scan(&user.ID, &user.Email, &user.Role, &user.Status, &user.EmailVerified, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "user not found"})
		return
	}

	profile := h.getProfileByUserID(userID)

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"user":    user,
		"profile": profile,
	})
}

// DeleteAccount removes all personal user data (NDPA / GDPR compliance)
func (h *AuthHandler) DeleteAccount(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	if userID == "" {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	// Delete user cascade
	_, err := h.DB.Exec("DELETE FROM users WHERE id = $1", userID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to process account deletion"})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "account and all associated data permanently deleted"})
}

func (h *AuthHandler) getProfileByUserID(userID string) *models.Profile {
	var p models.Profile
	var targetGendersJSON, myWorldJSON, interestsJSON string

	err := h.DB.QueryRow(
		`SELECT user_id, display_name, birthdate, age, gender, pronouns, city, country,
		 latitude, longitude, bio, dating_intentions, target_genders, age_min, age_max, max_distance_km,
		 is_paused, is_verified, verification_badge, audio_intro_url, audio_intro_duration,
		 rabbit_hole, defend_take, teach_me, my_world_tags, interests, created_at, updated_at
		 FROM profiles WHERE user_id = $1`, userID,
	).Scan(
		&p.UserID, &p.DisplayName, &p.Birthdate, &p.Age, &p.Gender, &p.Pronouns, &p.City, &p.Country,
		&p.Latitude, &p.Longitude, &p.Bio, &p.DatingIntentions, &targetGendersJSON, &p.AgeMin, &p.AgeMax, &p.MaxDistanceKm,
		&p.IsPaused, &p.IsVerified, &p.VerificationBadge, &p.AudioIntroURL, &p.AudioIntroDuration,
		&p.RabbitHole, &p.DefendTake, &p.TeachMe, &myWorldJSON, &interestsJSON, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil
	}

	json.Unmarshal([]byte(targetGendersJSON), &p.TargetGenders)
	json.Unmarshal([]byte(myWorldJSON), &p.MyWorldTags)
	json.Unmarshal([]byte(interestsJSON), &p.Interests)

	// Fetch photos
	rows, err := h.DB.Query(
		`SELECT id, user_id, url, is_primary, sort_order, created_at
		 FROM profile_photos WHERE user_id = $1 ORDER BY sort_order ASC, is_primary DESC`, userID,
	)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var photo models.Photo
			if err := rows.Scan(&photo.ID, &photo.UserID, &photo.URL, &photo.IsPrimary, &photo.SortOrder, &photo.CreatedAt); err == nil {
				p.Photos = append(p.Photos, photo)
			}
		}
	}

	return &p
}

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
