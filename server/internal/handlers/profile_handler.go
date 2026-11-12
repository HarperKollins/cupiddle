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
		 age_min = $9, age_max = $10, max_distance_km = $11, is_paused = $12, updated_at = $13
		 WHERE user_id = $14`,
		p.DisplayName, p.Bio, p.City, p.Country, p.Latitude, p.Longitude,
		p.DatingIntentions, string(targetGendersBytes), p.AgeMin, p.AgeMax, p.MaxDistanceKm,
		p.IsPaused, now, userID,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update profile"})
		return
	}

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
