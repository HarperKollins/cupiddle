package handlers

import (
	"encoding/json"
	"math"
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/cupiddle/server/internal/database"
	"github.com/cupiddle/server/internal/middleware"
	"github.com/cupiddle/server/internal/models"
)

// DiscoveryHandler serves The Idea Stream recommendations
type DiscoveryHandler struct {
	DB *database.DB
}

// NewDiscoveryHandler creates a new DiscoveryHandler
func NewDiscoveryHandler(db *database.DB) *DiscoveryHandler {
	return &DiscoveryHandler{DB: db}
}

// PassRequest records a user pass
type PassRequest struct {
	TargetUserID string `json:"target_user_id"`
}

// GetIdeaStream returns ranked candidates for the curiosity feed
func (h *DiscoveryHandler) GetIdeaStream(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)

	limitStr := r.URL.Query().Get("limit")
	limit := 10
	if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 50 {
		limit = l
	}

	// Fetch current user's profile and preferences
	myProfile := h.fetchFullProfile(currentUserID)
	if myProfile == nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "please complete your profile first"})
		return
	}

	// Fetch all active profiles excluding self, blocked, and passed users
	query := `
		SELECT p.user_id, p.display_name, p.birthdate, p.age, p.gender, p.pronouns, p.city, p.country,
		       p.latitude, p.longitude, p.bio, p.dating_intentions, p.target_genders, p.age_min, p.age_max,
		       p.max_distance_km, p.is_paused, p.is_verified, p.verification_badge, p.audio_intro_url,
		       p.audio_intro_duration, p.rabbit_hole, p.defend_take, p.teach_me, p.my_world_tags, p.interests,
		       p.created_at, p.updated_at
		FROM profiles p
		JOIN users u ON u.id = p.user_id
		WHERE p.user_id != $1
		  AND p.is_paused = false
		  AND u.status = 'active'
		  AND p.user_id NOT IN (SELECT blocked_id FROM user_blocks WHERE blocker_id = $1)
		  AND p.user_id NOT IN (SELECT blocker_id FROM user_blocks WHERE blocked_id = $1)
		  AND p.user_id NOT IN (SELECT passed_id FROM user_passes WHERE user_id = $1)
		  AND p.user_id NOT IN (SELECT user2_id FROM matches WHERE user1_id = $1 UNION SELECT user1_id FROM matches WHERE user2_id = $1)
	`

	rows, err := h.DB.Query(query, currentUserID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to query discovery: " + err.Error()})
		return
	}
	defer rows.Close()

	var candidates []models.DiscoveryCandidate

	for rows.Next() {
		var p models.Profile
		var targetGendersJSON, myWorldJSON, interestsJSON string

		err := rows.Scan(
			&p.UserID, &p.DisplayName, &p.Birthdate, &p.Age, &p.Gender, &p.Pronouns, &p.City, &p.Country,
			&p.Latitude, &p.Longitude, &p.Bio, &p.DatingIntentions, &targetGendersJSON, &p.AgeMin, &p.AgeMax,
			&p.MaxDistanceKm, &p.IsPaused, &p.IsVerified, &p.VerificationBadge, &p.AudioIntroURL,
			&p.AudioIntroDuration, &p.RabbitHole, &p.DefendTake, &p.TeachMe, &myWorldJSON, &interestsJSON,
			&p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			continue
		}

		json.Unmarshal([]byte(targetGendersJSON), &p.TargetGenders)
		json.Unmarshal([]byte(myWorldJSON), &p.MyWorldTags)
		json.Unmarshal([]byte(interestsJSON), &p.Interests)

		// Hard eligibility: Age filtering (two-way)
		if p.Age < myProfile.AgeMin || p.Age > myProfile.AgeMax {
			continue
		}
		if myProfile.Age < p.AgeMin || myProfile.Age > p.AgeMax {
			continue
		}

		// Gender filtering (if configured and not "All" / "Everyone")
		if len(myProfile.TargetGenders) > 0 && !containsString(myProfile.TargetGenders, "All") && !containsString(myProfile.TargetGenders, "Everyone") && !containsString(myProfile.TargetGenders, p.Gender) {
			continue
		}
		if len(p.TargetGenders) > 0 && !containsString(p.TargetGenders, "All") && !containsString(p.TargetGenders, "Everyone") && !containsString(p.TargetGenders, myProfile.Gender) {
			continue
		}

		// Calculate approximate distance
		distance := haversineDistance(myProfile.Latitude, myProfile.Longitude, p.Latitude, p.Longitude)
		// If user explicitly configured a tight local radius (< 1500km), respect it; otherwise allow Nationwide Nigeria discovery
		if myProfile.MaxDistanceKm > 0 && myProfile.MaxDistanceKm < 1500 && distance > float64(myProfile.MaxDistanceKm) && myProfile.City != p.City {
			continue
		}

		// Find shared interests & tags
		shared := findIntersection(myProfile.Interests, p.Interests)
		sharedTags := findIntersection(myProfile.MyWorldTags, p.MyWorldTags)
		allShared := append(shared, sharedTags...)

		// Algorithmic curiosity score
		score := 0.0
		// 1. Shared interests score
		score += float64(len(allShared)) * 15.0
		// 2. Curiosity richness (has prompts filled)
		if p.RabbitHole != "" {
			score += 20.0
		}
		if p.DefendTake != "" {
			score += 20.0
		}
		if p.TeachMe != "" {
			score += 20.0
		}
		if p.AudioIntroURL != "" {
			score += 15.0
		}
		// 3. Proximity bonus
		if distance < 25.0 {
			score += 25.0
		} else if distance < 75.0 {
			score += 15.0
		}
		// 4. Verification bonus
		if p.IsVerified {
			score += 10.0
		}

		// Attach photos
		p.Photos = h.getPhotos(p.UserID)

		// Sanitize coordinates (privacy)
		p.Latitude = 0
		p.Longitude = 0

		candidates = append(candidates, models.DiscoveryCandidate{
			Profile:         p,
			DistanceKm:      math.Round(distance*10) / 10,
			SharedInterests: allShared,
			MatchScore:      score,
		})
	}

	// Sort candidates by match score descending
	sort.Slice(candidates, func(i, j int) bool {
		return candidates[i].MatchScore > candidates[j].MatchScore
	})

	if len(candidates) > limit {
		candidates = candidates[:limit]
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"candidates": candidates,
		"count":      len(candidates),
	})
}

// PassProfile registers that the current user passed on a profile
func (h *DiscoveryHandler) PassProfile(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)
	var req PassRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.TargetUserID == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "target_user_id is required"})
		return
	}

	_, err := h.DB.Exec(
		`INSERT INTO user_passes (user_id, passed_id, created_at)
		 VALUES ($1, $2, $3)
		 ON CONFLICT (user_id, passed_id) DO NOTHING`,
		currentUserID, req.TargetUserID, time.Now(),
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to record pass"})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "profile passed"})
}

// ResetPasses allows a user to reset their passed profiles to rediscover
func (h *DiscoveryHandler) ResetPasses(w http.ResponseWriter, r *http.Request) {
	currentUserID, _ := r.Context().Value(middleware.UserIDKey).(string)
	_, err := h.DB.Exec("DELETE FROM user_passes WHERE user_id = $1", currentUserID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to reset passes"})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "discovery feed reset successfully"})
}

func haversineDistance(lat1, lon1, lat2, lon2 float64) float64 {
	// If coordinates are unpopulated default to 0
	if lat1 == 0 && lon1 == 0 || lat2 == 0 && lon2 == 0 {
		return 10.0 // Default reasonable local distance
	}
	const earthRadiusKm = 6371.0

	dLat := (lat2 - lat1) * (math.Pi / 180.0)
	dLon := (lon2 - lon1) * (math.Pi / 180.0)

	rLat1 := lat1 * (math.Pi / 180.0)
	rLat2 := lat2 * (math.Pi / 180.0)

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Sin(dLon/2)*math.Sin(dLon/2)*math.Cos(rLat1)*math.Cos(rLat2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return earthRadiusKm * c
}

func findIntersection(a, b []string) []string {
	set := make(map[string]bool)
	for _, item := range a {
		set[item] = true
	}
	var res []string
	for _, item := range b {
		if set[item] {
			res = append(res, item)
		}
	}
	return res
}

func containsString(slice []string, val string) bool {
	for _, s := range slice {
		if s == val {
			return true
		}
	}
	return false
}

func (h *DiscoveryHandler) getPhotos(userID string) []models.Photo {
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

func (h *DiscoveryHandler) fetchFullProfile(userID string) *models.Profile {
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
	p.Photos = h.getPhotos(p.UserID)
	return &p
}

