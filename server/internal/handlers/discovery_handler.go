package handlers

import (
	"encoding/json"
	"math"
	"net/http"
	"sort"
	"strconv"
	"strings"
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

// GetIdeaStream returns ranked candidates for the curiosity feed using the master formula:
// MatchScore(A, B) = F_hard(A,B) * [ 0.35 * S_values + 0.30 * S_behavior + 0.20 * S_intellect + 0.15 * S_reciprocity ]
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

	// Fetch current user's lifestyle values vector & CGPA tier
	var myTier int = 4
	var myValuesJSON string = "[]"
	_ = h.DB.QueryRow(`SELECT COALESCE(cgpa_tier, 4), COALESCE(values_vector::text, '[]') FROM users WHERE id = $1`, currentUserID).Scan(&myTier, &myValuesJSON)
	var myValues []float64
	_ = json.Unmarshal([]byte(myValuesJSON), &myValues)

	// Fetch all active profiles excluding self, blocked, passed, and matched users
	query := `
		SELECT p.user_id, COALESCE(p.username, ''), p.display_name,
		       COALESCE(p.campus, ''), COALESCE(p.faculty, ''), COALESCE(p.department, ''), COALESCE(p.level, ''),
		       COALESCE(p.gate_question, ''), COALESCE(p.vibe_tag, ''), p.vibe_expires_at,
		       p.birthdate, p.age, p.gender, p.pronouns, p.city, p.country,
		       p.latitude, p.longitude, p.bio, p.dating_intentions, p.target_genders, p.age_min, p.age_max,
		       p.max_distance_km, p.is_paused, p.is_verified, p.verification_badge, p.audio_intro_url,
		       p.audio_intro_duration, p.rabbit_hole, p.defend_take, p.teach_me, p.my_world_tags, p.interests,
		       p.created_at, p.updated_at,
		       COALESCE(u.cgpa_tier, 4), COALESCE(u.values_vector::text, '[]')
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

	candidates := make([]models.DiscoveryCandidate, 0)
	now := time.Now()

	for rows.Next() {
		var p models.Profile
		var targetGendersJSON, myWorldJSON, interestsJSON, candValuesJSON string
		var candTier int

		err := rows.Scan(
			&p.UserID, &p.Username, &p.DisplayName,
			&p.Campus, &p.Faculty, &p.Department, &p.Level,
			&p.GateQuestion, &p.VibeTag, &p.VibeExpiresAt,
			&p.Birthdate, &p.Age, &p.Gender, &p.Pronouns, &p.City, &p.Country,
			&p.Latitude, &p.Longitude, &p.Bio, &p.DatingIntentions, &targetGendersJSON, &p.AgeMin, &p.AgeMax,
			&p.MaxDistanceKm, &p.IsPaused, &p.IsVerified, &p.VerificationBadge, &p.AudioIntroURL,
			&p.AudioIntroDuration, &p.RabbitHole, &p.DefendTake, &p.TeachMe, &myWorldJSON, &interestsJSON,
			&p.CreatedAt, &p.UpdatedAt,
			&candTier, &candValuesJSON,
		)
		if err != nil {
			continue
		}

		json.Unmarshal([]byte(targetGendersJSON), &p.TargetGenders)
		json.Unmarshal([]byte(myWorldJSON), &p.MyWorldTags)
		json.Unmarshal([]byte(interestsJSON), &p.Interests)

		var candValues []float64
		_ = json.Unmarshal([]byte(candValuesJSON), &candValues)

		// ----------------------------------------------------
		// 1. F_hard(A, B) Binary Gate
		// ----------------------------------------------------
		// Age filtering (two-way)
		if p.Age < myProfile.AgeMin || p.Age > myProfile.AgeMax {
			continue
		}
		if myProfile.Age < p.AgeMin || myProfile.Age > p.AgeMax {
			continue
		}

		// Gender filtering (two-way)
		if len(myProfile.TargetGenders) > 0 && !containsString(myProfile.TargetGenders, "All") && !containsString(myProfile.TargetGenders, "Everyone") && !containsString(myProfile.TargetGenders, p.Gender) {
			continue
		}
		if len(p.TargetGenders) > 0 && !containsString(p.TargetGenders, "All") && !containsString(p.TargetGenders, "Everyone") && !containsString(p.TargetGenders, myProfile.Gender) {
			continue
		}

		// Campus Lock: if both have campus specified, enforce campus matching
		if myProfile.Campus != "" && p.Campus != "" && !strings.EqualFold(myProfile.Campus, p.Campus) {
			continue
		}

		// Approximate distance check
		distance := haversineDistance(myProfile.Latitude, myProfile.Longitude, p.Latitude, p.Longitude)
		if myProfile.MaxDistanceKm > 0 && myProfile.MaxDistanceKm < 1500 && distance > float64(myProfile.MaxDistanceKm) && myProfile.City != "" && p.City != "" && myProfile.City != p.City {
			continue
		}

		// Shared interests & tags
		sharedInterests := findIntersection(myProfile.Interests, p.Interests)
		sharedTags := findIntersection(myProfile.MyWorldTags, p.MyWorldTags)
		allShared := append(sharedInterests, sharedTags...)

		// ----------------------------------------------------
		// 2. Mathematical Matching Engine
		// ----------------------------------------------------
		// S_values: Cosine similarity of 10-dim values vector, or Jaccard overlap fallback
		sValues := computeValuesSimilarity(myValues, candValues, myProfile, &p)

		// S_behavior: Intellectual curiosity depth & investment
		sBehavior := computeBehaviorScore(&p)

		// S_intellect: Academic tier compatibility + Faculty alignment
		sIntellect := computeIntellectScore(myProfile, myTier, &p, candTier)

		// S_reciprocity: Verification trust & active responsiveness
		sReciprocity := computeReciprocityScore(&p, now)

		// Master Weighted Formula
		matchScore := (0.35 * sValues) + (0.30 * sBehavior) + (0.20 * sIntellect) + (0.15 * sReciprocity)
		if matchScore > 1.0 {
			matchScore = 1.0
		}
		if matchScore < 0.1 {
			matchScore = 0.1
		}
		compatPct := int(math.Round(matchScore * 100))

		// Check active vibe tag
		activeVibe := ""
		if p.VibeTag != "" {
			if p.VibeExpiresAt == nil || p.VibeExpiresAt.After(now) {
				activeVibe = p.VibeTag
			}
		}

		// Attach photos
		p.Photos = h.getPhotos(p.UserID)

		// Sanitize coordinates for privacy
		p.Latitude = 0
		p.Longitude = 0

		candidates = append(candidates, models.DiscoveryCandidate{
			Profile:          p,
			DistanceKm:       math.Round(distance*10) / 10,
			SharedInterests:  allShared,
			MatchScore:       math.Round(matchScore*100) / 100,
			CompatibilityPct: compatPct,
			GateQuestion:     p.GateQuestion,
			VibeTag:          activeVibe,
			Faculty:          p.Faculty,
			Level:            p.Level,
			BlurLevel:        40, // Stage 1 of progressive unblur: 40px silhouette
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

// computeValuesSimilarity calculates cosine similarity between 10-dim lifestyle vectors.
// If vectors are unpopulated, it gracefully falls back to Jaccard overlap of shared tags & interests.
func computeValuesSimilarity(vA, vB []float64, pA, pB *models.Profile) float64 {
	if len(vA) == 10 && len(vB) == 10 {
		dot := 0.0
		normA := 0.0
		normB := 0.0
		for i := 0; i < 10; i++ {
			dot += vA[i] * vB[i]
			normA += vA[i] * vA[i]
			normB += vB[i] * vB[i]
		}
		if normA > 0 && normB > 0 {
			sim := dot / (math.Sqrt(normA) * math.Sqrt(normB))
			if sim > 1.0 {
				sim = 1.0
			}
			if sim < 0.0 {
				sim = 0.0
			}
			return sim
		}
	}

	// Fallback: Jaccard similarity of tags and interests
	sharedInterests := len(findIntersection(pA.Interests, pB.Interests))
	sharedTags := len(findIntersection(pA.MyWorldTags, pB.MyWorldTags))
	totalShared := sharedInterests + sharedTags
	totalPool := len(pA.Interests) + len(pB.Interests) + len(pA.MyWorldTags) + len(pB.MyWorldTags)

	if totalPool > 0 {
		jaccard := float64(totalShared*2) / float64(totalPool)
		return math.Min(1.0, math.Max(0.3, jaccard+0.35))
	}

	return 0.55 // Neutral default
}

// computeBehaviorScore evaluates candidate profile richness & effort
func computeBehaviorScore(p *models.Profile) float64 {
	score := 0.35 // Base score

	if p.RabbitHole != "" {
		score += 0.20
	}
	if p.DefendTake != "" {
		score += 0.20
	}
	if p.TeachMe != "" {
		score += 0.15
	}
	if p.AudioIntroURL != "" {
		score += 0.10
	}

	// Extra investment if bio is thoughtful (>40 chars)
	if len(strings.TrimSpace(p.Bio)) >= 40 {
		score += 0.10
	}

	if score > 1.0 {
		score = 1.0
	}
	return score
}

// computeIntellectScore calculates academic tier compatibility and campus/faculty alignment
func computeIntellectScore(pA *models.Profile, tierA int, pB *models.Profile, tierB int) float64 {
	// Tier compatibility: soft distance penalty
	tierDiff := math.Abs(float64(tierA - tierB))
	tierCompat := math.Max(0.5, 1.0-(0.15*tierDiff))

	// Field alignment score
	fieldScore := 0.50
	if pA.Faculty != "" && pB.Faculty != "" {
		if strings.EqualFold(pA.Faculty, pB.Faculty) {
			fieldScore = 0.85 // Coursemates in same faculty
		} else if strings.EqualFold(pA.Campus, pB.Campus) {
			fieldScore = 0.70 // Cross-faculty on same campus
		}
	} else if pA.Campus != "" && strings.EqualFold(pA.Campus, pB.Campus) {
		fieldScore = 0.70
	}

	return (0.50 * tierCompat) + (0.50 * fieldScore)
}

// computeReciprocityScore rewards verified status and active recent engagement
func computeReciprocityScore(p *models.Profile, now time.Time) float64 {
	reciprocity := 0.40 // Prior baseline

	if p.IsVerified {
		reciprocity += 0.25 // Verified profiles have much higher follow-through
	}
	if p.GateQuestion != "" {
		reciprocity += 0.20 // Prompt writer is actively ready for connections
	}
	if p.VibeTag != "" && (p.VibeExpiresAt == nil || p.VibeExpiresAt.After(now)) {
		reciprocity += 0.15 // Fresh vibe tag signals real-time presence
	}

	if reciprocity > 1.0 {
		reciprocity = 1.0
	}
	return reciprocity
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
	if (lat1 == 0 && lon1 == 0) || (lat2 == 0 && lon2 == 0) {
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
		`SELECT user_id, COALESCE(username, ''), display_name,
		        COALESCE(campus, ''), COALESCE(faculty, ''), COALESCE(department, ''), COALESCE(level, ''),
		        COALESCE(gate_question, ''), COALESCE(vibe_tag, ''), vibe_expires_at,
		        birthdate, age, gender, pronouns, city, country,
		        latitude, longitude, bio, dating_intentions, target_genders, age_min, age_max, max_distance_km,
		        is_paused, is_verified, verification_badge, audio_intro_url, audio_intro_duration,
		        rabbit_hole, defend_take, teach_me, my_world_tags, interests, created_at, updated_at
		 FROM profiles WHERE user_id = $1`, userID,
	).Scan(
		&p.UserID, &p.Username, &p.DisplayName,
		&p.Campus, &p.Faculty, &p.Department, &p.Level,
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
	p.Photos = h.getPhotos(p.UserID)
	return &p
}
