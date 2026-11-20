package handlers

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"strings"
	"time"

	"github.com/cupiddle/server/internal/database"
	"github.com/cupiddle/server/internal/middleware"
	"github.com/cupiddle/server/internal/models"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// ProfileHandler manages curiosity profile updates, photos, and public views
type ProfileHandler struct {
	DB *database.DB
}

// NewProfileHandler creates a new ProfileHandler
func NewProfileHandler(db *database.DB) *ProfileHandler {
	return &ProfileHandler{DB: db}
}

type UpdateProfileRequest struct {
	DisplayName      *string  `json:"display_name,omitempty"`
	Bio              *string  `json:"bio,omitempty"`
	Campus           *string  `json:"campus,omitempty"`
	Faculty          *string  `json:"faculty,omitempty"`
	Department       *string  `json:"department,omitempty"`
	Level            *string  `json:"level,omitempty"`
	GateQuestion     *string  `json:"gate_question,omitempty"`
	VibeTag          *string  `json:"vibe_tag,omitempty"`
	City             *string  `json:"city,omitempty"`
	Country          *string  `json:"country,omitempty"`
	Latitude         *float64 `json:"latitude,omitempty"`
	Longitude        *float64 `json:"longitude,omitempty"`
	DatingIntentions *string  `json:"dating_intentions,omitempty"`
	TargetGenders    []string `json:"target_genders,omitempty"`
	AgeMin           *int     `json:"age_min,omitempty"`
	AgeMax           *int     `json:"age_max,omitempty"`
	MaxDistanceKm    *int     `json:"max_distance_km,omitempty"`
	IsPaused         *bool    `json:"is_paused,omitempty"`
}

type UpdateCuriosityRequest struct {
	RabbitHole  *string  `json:"rabbit_hole,omitempty"`
	DefendTake  *string  `json:"defend_take,omitempty"`
	TeachMe     *string  `json:"teach_me,omitempty"`
	MyWorldTags []string `json:"my_world_tags,omitempty"`
	Interests   []string `json:"interests,omitempty"`
}

type AudioIntroRequest struct {
	AudioURL string `json:"audio_url"`
	Duration int    `json:"duration"` // in seconds, max 30
}

type AddPhotoRequest struct {
	URL       string `json:"url"`
	IsPrimary bool   `json:"is_primary"`
}

type UpdateLifestyleRequest struct {
	Lifestyle    map[string]float64 `json:"lifestyle"`
	ValuesVector []float64          `json:"values_vector,omitempty"`
	CGPATier     *int               `json:"cgpa_tier,omitempty"`
}

type SetVibeRequest struct {
	VibeTag string `json:"vibe_tag"`
}

type SetGateQuestionRequest struct {
	GateQuestion string `json:"gate_question"`
}

// UpdateProfile updates basic identity and discovery filters
func (h *ProfileHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	p := h.fetchFullProfile(userID)
	if p == nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "profile not found"})
		return
	}

	if req.DisplayName != nil {
		p.DisplayName = *req.DisplayName
	}
	if req.Bio != nil {
		p.Bio = *req.Bio
	}
	if req.Campus != nil {
		p.Campus = *req.Campus
	}
	if req.Faculty != nil {
		p.Faculty = *req.Faculty
	}
	if req.Department != nil {
		p.Department = *req.Department
	}
	if req.Level != nil {
		p.Level = *req.Level
	}
	if req.GateQuestion != nil {
		p.GateQuestion = *req.GateQuestion
	}
	if req.VibeTag != nil {
		p.VibeTag = *req.VibeTag
		exp := time.Now().Add(6 * time.Hour)
		p.VibeExpiresAt = &exp
	}
	if req.City != nil {
		p.City = *req.City
	}
	if req.Country != nil {
		p.Country = *req.Country
	}
	if req.Latitude != nil {
		p.Latitude = *req.Latitude
	}
	if req.Longitude != nil {
		p.Longitude = *req.Longitude
	}
	if req.DatingIntentions != nil {
		p.DatingIntentions = *req.DatingIntentions
	}
	if req.TargetGenders != nil {
		p.TargetGenders = req.TargetGenders
	}
	if req.AgeMin != nil {
		p.AgeMin = *req.AgeMin
	}
	if req.AgeMax != nil {
		p.AgeMax = *req.AgeMax
	}
	if req.MaxDistanceKm != nil {
		p.MaxDistanceKm = *req.MaxDistanceKm
	}
	if req.IsPaused != nil {
		p.IsPaused = *req.IsPaused
	}

	targetGendersBytes, _ := json.Marshal(p.TargetGenders)
	now := time.Now()

	_, err := h.DB.Exec(
		`UPDATE profiles SET display_name = $1, bio = $2, city = $3, country = $4,
		 latitude = $5, longitude = $6, dating_intentions = $7, target_genders = $8,
		 age_min = $9, age_max = $10, max_distance_km = $11, is_paused = $12,
		 campus = $13, faculty = $14, department = $15, level = $16, gate_question = $17, vibe_tag = $18, vibe_expires_at = $19, updated_at = $20
		 WHERE user_id = $21`,
		p.DisplayName, p.Bio, p.City, p.Country, p.Latitude, p.Longitude,
		p.DatingIntentions, string(targetGendersBytes), p.AgeMin, p.AgeMax, p.MaxDistanceKm,
		p.IsPaused, p.Campus, p.Faculty, p.Department, p.Level, p.GateQuestion, p.VibeTag, p.VibeExpiresAt, now, userID,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update profile"})
		return
	}

	// Also sync campus fields to users table
	_, _ = h.DB.Exec(`UPDATE users SET campus = $1, faculty = $2, department = $3, level = $4, updated_at = $5 WHERE id = $6`, p.Campus, p.Faculty, p.Department, p.Level, now, userID)

	respondJSON(w, http.StatusOK, p)
}

// UpdateCuriosity updates Rabbit Hole, Defend Take, Teach Me, and My World tags
func (h *ProfileHandler) UpdateCuriosity(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	var req UpdateCuriosityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	p := h.fetchFullProfile(userID)
	if p == nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "profile not found"})
		return
	}

	if req.RabbitHole != nil {
		p.RabbitHole = *req.RabbitHole
	}
	if req.DefendTake != nil {
		p.DefendTake = *req.DefendTake
	}
	if req.TeachMe != nil {
		p.TeachMe = *req.TeachMe
	}
	if req.MyWorldTags != nil {
		p.MyWorldTags = req.MyWorldTags
	}
	if req.Interests != nil {
		p.Interests = req.Interests
	}

	myWorldBytes, _ := json.Marshal(p.MyWorldTags)
	interestsBytes, _ := json.Marshal(p.Interests)
	now := time.Now()

	_, err := h.DB.Exec(
		`UPDATE profiles SET rabbit_hole = $1, defend_take = $2, teach_me = $3,
		 my_world_tags = $4, interests = $5, updated_at = $6 WHERE user_id = $7`,
		p.RabbitHole, p.DefendTake, p.TeachMe, string(myWorldBytes), string(interestsBytes), now, userID,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update curiosity profile"})
		return
	}

	respondJSON(w, http.StatusOK, p)
}

// UpdateAudioIntro updates the optional 30-second audio introduction
func (h *ProfileHandler) UpdateAudioIntro(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	var req AudioIntroRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	if req.Duration > 30 {
		req.Duration = 30
	}

	_, err := h.DB.Exec(
		`UPDATE profiles SET audio_intro_url = $1, audio_intro_duration = $2, updated_at = $3
		 WHERE user_id = $4`,
		req.AudioURL, req.Duration, time.Now(), userID,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update audio intro"})
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"audio_intro_url":      req.AudioURL,
		"audio_intro_duration": req.Duration,
	})
}

// UpdateLifestyle saves lifestyle answers and computes the 10-dim values vector
func (h *ProfileHandler) UpdateLifestyle(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	var req UpdateLifestyleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	if req.Lifestyle == nil {
		req.Lifestyle = make(map[string]float64)
	}

	// Dimensions: smoking, drinking, religion_weight, night_owl, introversion, political_interest, ambition_level, campus_social, cheating_stance, family_values
	keys := []string{
		"smoking", "drinking", "religion_weight", "night_owl", "introversion",
		"political_interest", "ambition_level", "campus_social", "cheating_stance", "family_values",
	}

	vec := make([]float64, 10)
	if len(req.ValuesVector) == 10 {
		vec = req.ValuesVector
	} else {
		for i, k := range keys {
			if val, ok := req.Lifestyle[k]; ok {
				vec[i] = val
			} else {
				vec[i] = 0.5 // Default neutral
			}
		}
	}

	lifestyleBytes, _ := json.Marshal(req.Lifestyle)
	vecBytes, _ := json.Marshal(vec)
	tier := 4
	if req.CGPATier != nil && *req.CGPATier >= 1 && *req.CGPATier <= 4 {
		tier = *req.CGPATier
	}

	now := time.Now()
	_, err := h.DB.Exec(
		`UPDATE users SET lifestyle = $1, values_vector = $2, cgpa_tier = $3, updated_at = $4 WHERE id = $5`,
		string(lifestyleBytes), string(vecBytes), tier, now, userID,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update lifestyle"})
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"success":       true,
		"lifestyle":     req.Lifestyle,
		"values_vector": vec,
		"cgpa_tier":     tier,
	})
}

// SetVibeTag sets an ephemeral vibe tag with a strict 6-hour expiration
func (h *ProfileHandler) SetVibeTag(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	var req SetVibeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	now := time.Now()
	expiresAt := now.Add(6 * time.Hour)

	_, err := h.DB.Exec(
		`UPDATE profiles SET vibe_tag = $1, vibe_expires_at = $2, updated_at = $3 WHERE user_id = $4`,
		req.VibeTag, expiresAt, now, userID,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update vibe tag"})
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"success":         true,
		"vibe_tag":        req.VibeTag,
		"vibe_expires_at": expiresAt.Format(time.RFC3339),
	})
}

// SetGateQuestion sets the user's custom gate question, rate-limited to once every 7 days
func (h *ProfileHandler) SetGateQuestion(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	var req SetGateQuestionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	req.GateQuestion = strings.TrimSpace(req.GateQuestion)
	if len(req.GateQuestion) > 0 && len(req.GateQuestion) < 15 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Gate question should be at least 15 characters to be meaningful."})
		return
	}

	var lastSet *time.Time
	_ = h.DB.QueryRow(`SELECT gate_question_set_at FROM profiles WHERE user_id = $1`, userID).Scan(&lastSet)

	now := time.Now()
	if lastSet != nil && now.Sub(*lastSet) < 7*24*time.Hour && len(req.GateQuestion) > 0 {
		daysRemaining := int(math.Ceil(float64(7*24*time.Hour-now.Sub(*lastSet)) / float64(24*time.Hour)))
		respondJSON(w, http.StatusTooManyRequests, map[string]string{
			"error": fmt.Sprintf("Gate questions can only be updated once every 7 days (%d days remaining).", daysRemaining),
		})
		return
	}

	_, err := h.DB.Exec(
		`UPDATE profiles SET gate_question = $1, gate_question_set_at = $2, updated_at = $3 WHERE user_id = $4`,
		req.GateQuestion, now, now, userID,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update gate question"})
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"success":       true,
		"gate_question": req.GateQuestion,
	})
}

// AddPhoto adds a new photo to the user's profile
func (h *ProfileHandler) AddPhoto(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	var req AddPhotoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	if req.URL == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "photo URL is required"})
		return
	}

	// Check if this is the first photo; if so, make it primary automatically
	var photoCount int
	h.DB.QueryRow("SELECT COUNT(*) FROM profile_photos WHERE user_id = $1", userID).Scan(&photoCount)
	if photoCount == 0 {
		req.IsPrimary = true
	} else if req.IsPrimary {
		// Reset previous primary
		h.DB.Exec("UPDATE profile_photos SET is_primary = false WHERE user_id = $1", userID)
	}

	photoID := uuid.New().String()
	now := time.Now()

	_, err := h.DB.Exec(
		`INSERT INTO profile_photos (id, user_id, url, is_primary, sort_order, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		photoID, userID, req.URL, req.IsPrimary, photoCount, now,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to add photo"})
		return
	}

	respondJSON(w, http.StatusCreated, models.Photo{
		ID:        photoID,
		UserID:    userID,
		URL:       req.URL,
		IsPrimary: req.IsPrimary,
		SortOrder: photoCount,
		CreatedAt: now,
	})
}

// DeletePhoto removes a photo
func (h *ProfileHandler) DeletePhoto(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	photoID := chi.URLParam(r, "id")

	var isPrimary bool
	err := h.DB.QueryRow("SELECT is_primary FROM profile_photos WHERE id = $1 AND user_id = $2", photoID, userID).Scan(&isPrimary)
	if err != nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "photo not found"})
		return
	}

	_, err = h.DB.Exec("DELETE FROM profile_photos WHERE id = $1 AND user_id = $2", photoID, userID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to delete photo"})
		return
	}

	// If primary was deleted, promote next photo
	if isPrimary {
		h.DB.Exec("UPDATE profile_photos SET is_primary = true WHERE id = (SELECT id FROM profile_photos WHERE user_id = $1 ORDER BY sort_order ASC LIMIT 1)", userID)
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "photo removed successfully"})
}

// SetPrimaryPhoto sets a photo as primary
func (h *ProfileHandler) SetPrimaryPhoto(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)
	photoID := chi.URLParam(r, "id")

	h.DB.Exec("UPDATE profile_photos SET is_primary = false WHERE user_id = $1", userID)
	_, err := h.DB.Exec("UPDATE profile_photos SET is_primary = true WHERE id = $1 AND user_id = $2", photoID, userID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update primary photo"})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "primary photo updated"})
}

// GetPublicProfile returns sanitized profile for public viewing
func (h *ProfileHandler) GetPublicProfile(w http.ResponseWriter, r *http.Request) {
	targetUserID := chi.URLParam(r, "id")
	p := h.fetchFullProfile(targetUserID)
	if p == nil || p.IsPaused {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "profile not found or paused"})
		return
	}

	// Mask precise coordinates for privacy
	p.Latitude = 0
	p.Longitude = 0

	respondJSON(w, http.StatusOK, p)
}

func (h *ProfileHandler) fetchFullProfile(userID string) *models.Profile {
	var p models.Profile
	var targetGendersJSON, myWorldJSON, interestsJSON string

	err := h.DB.QueryRow(
		`SELECT user_id, COALESCE(username, ''), display_name, COALESCE(campus, ''), COALESCE(faculty, ''), COALESCE(department, ''), COALESCE(level, ''),
		 COALESCE(gate_question, ''), COALESCE(vibe_tag, ''), vibe_expires_at,
		 birthdate, age, gender, pronouns, city, country,
		 latitude, longitude, bio, dating_intentions, target_genders, age_min, age_max, max_distance_km,
		 is_paused, is_verified, verification_badge, audio_intro_url, audio_intro_duration,
		 rabbit_hole, defend_take, teach_me, my_world_tags, interests, created_at, updated_at
		 FROM profiles WHERE user_id = $1`, userID,
	).Scan(
		&p.UserID, &p.Username, &p.DisplayName, &p.Campus, &p.Faculty, &p.Department, &p.Level,
		&p.GateQuestion, &p.VibeTag, &p.VibeExpiresAt,
		&p.Birthdate, &p.Age, &p.Gender, &p.Pronouns, &p.City, &p.Country,
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

