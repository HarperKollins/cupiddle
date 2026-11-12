package main

import (
	"encoding/json"
	"log"
	"time"

	"github.com/cupiddle/server/internal/auth"
	"github.com/cupiddle/server/internal/config"
	"github.com/cupiddle/server/internal/database"
	"github.com/google/uuid"
)

func main() {
	log.Println("[SEED] Seeding Cupiddle development database...")
	cfg := config.LoadConfig()

	db, err := database.InitDB(cfg.DBDriver, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}
	defer db.Close()

	now := time.Now()

	// 1. Create Admin Account
	adminPass, _ := auth.HashPassword("CupiddleAdmin2026!")
	adminID := "admin-user-001"
	db.Exec(
		`INSERT INTO users (id, email, password_hash, role, status, email_verified, created_at, updated_at)
		 VALUES ($1, 'admin@cupiddle.com', $2, 'admin', 'active', true, $3, $3)
		 ON CONFLICT (email) DO NOTHING`,
		adminID, adminPass, now,
	)

	db.Exec(
		`INSERT INTO profiles (user_id, display_name, birthdate, age, gender, pronouns, city, country,
		 latitude, longitude, bio, dating_intentions, target_genders, age_min, age_max, max_distance_km,
		 is_paused, is_verified, verification_badge, rabbit_hole, defend_take, teach_me, my_world_tags, interests, created_at, updated_at)
		 VALUES ($1, 'Cupiddle Admin', '1995-04-12', 31, 'Non-binary', 'they/them', 'Lagos', 'Nigeria',
		 6.5244, 3.3792, 'Trust and Safety Steward at Cupiddle.', 'Connecting curious minds', '["All"]', 18, 99, 500,
		 false, true, 'Cupiddle Core Team', 'Trust networks in decentralized social graphs',
		 'Algorithms should empower curiosity, not addiction', 'How cryptography preserves privacy in dating',
		 '["Cryptography", "Philosophy", "Distributed Systems"]', '["Technology", "Philosophy", "Science"]', $2, $2)
		 ON CONFLICT (user_id) DO NOTHING`,
		adminID, now,
	)

	// 2. Seed Curious Profiles
	demoUsers := []struct {
		ID, Email, Name, DOB, Gender, Pronouns, City string
		Age                                         int
		Lat, Lon                                    float64
		Bio, Intentions, RabbitHole, DefendTake     string
		TeachMe                                     string
		Tags, Interests                             []string
		PhotoURL                                    string
	}{
		{
			ID:          "user-amina-001",
			Email:       "amina@example.com",
			Name:        "Amina Bello",
			DOB:         "2002-06-15",
			Gender:      "Woman",
			Pronouns:    "she/her",
			City:        "Lagos",
			Age:         24,
			Lat:         6.5244,
			Lon:         3.3792,
			Bio:         "Machine learning engineer. Fascinated by computational linguistics and late-night jollof arguments.",
			Intentions:  "Deep conversations & meaningful connection",
			RabbitHole:  "Cellular automata and emergent behavior in generative neural networks.",
			DefendTake:  "Language models aren't stochastic parrots; their latent representations exhibit genuine geometric semantics.",
			TeachMe:     "How transformer attention mechanisms actually work without mathematical intimidation.",
			Tags:        []string{"Dune", "Neuromancer", "PyTorch", "Afrobeats", "Sci-Fi"},
			Interests:   []string{"Technology", "Programming", "Science", "Philosophy", "Books"},
			PhotoURL:    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
		},
		{
			ID:          "user-chidi-002",
			Email:       "chidi@example.com",
			Name:        "Chidi Okonkwo",
			DOB:         "1999-03-21",
			Gender:      "Man",
			Pronouns:    "he/him",
			City:        "Abuja",
			Age:         27,
			Lat:         9.0765,
			Lon:         7.3986,
			Bio:         "Indie game developer & synth nerd. Creating interactive worlds and searching for people who ask 'why'.",
			Intentions:  "Curious exploration leading to long-term love",
			RabbitHole:  "Procedural audio synthesis and psychological tension in horror game mechanics.",
			DefendTake:  "Sound design carries more emotional weight in storytelling than visual resolution ever could.",
			TeachMe:     "How to build a playable mini-game in Godot from scratch in under an hour.",
			Tags:        []string{"Disco Elysium", "Hollow Knight", "Modular Synths", "Cyberpunk", "Pixel Art"},
			Interests:   []string{"Gaming", "Music", "Programming", "Film", "Art"},
			PhotoURL:    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
		},
		{
			ID:          "user-zainab-003",
			Email:       "zainab@example.com",
			Name:        "Zainab Aliyu",
			DOB:         "2001-11-09",
			Gender:      "Woman",
			Pronouns:    "she/her",
			City:        "Ibadan",
			Age:         25,
			Lat:         7.3775,
			Lon:         3.9470,
			Bio:         "Molecular biologist by day, speculative fiction writer by night. Coffee and complex ecosystems.",
			Intentions:  "Intellectual spark & romance",
			RabbitHole:  "Extremophile microbes living in volcanic sub-oceanic hydrothermal vents.",
			DefendTake:  "Hard science fiction has predicted our socio-technological crisis far more accurately than economists.",
			TeachMe:     "How CRISPR gene editing operates in reality versus sensationalized media depictions.",
			Tags:        []string{"Octavia Butler", "Biology", "Coffee", "TED Talks", "Speculative Fiction"},
			Interests:   []string{"Science", "Books", "Writing", "Nature", "Literature"},
			PhotoURL:    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
		},
		{
			ID:          "user-tunde-004",
			Email:       "tunde@example.com",
			Name:        "Tunde Davies",
			DOB:         "1998-08-30",
			Gender:      "Man",
			Pronouns:    "he/him",
			City:        "Port Harcourt",
			Age:         28,
			Lat:         4.8156,
			Lon:         7.0498,
			Bio:         "Documentary director & visual essayist. Looking for someone willing to argue about film endings at 2 AM.",
			Intentions:  "Dating & creative collaboration",
			RabbitHole:  "Parallels between French New Wave cinema and 1970s West African visual culture.",
			DefendTake:  "Streaming algorithms have flattened cinematic bravery; unpredictability is the highest form of luxury.",
			TeachMe:     "How to read cinematography and composition like a master visual novel.",
			Tags:        []string{"Ousmane Sembène", "Wong Kar-wai", "Analogue Film", "Jazz", "Photography"},
			Interests:   []string{"Film", "Photography", "Art", "Culture", "Music"},
			PhotoURL:    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
		},
	}

	userPass, _ := auth.HashPassword("Cupiddle2026!")

	for _, u := range demoUsers {
		db.Exec(
			`INSERT INTO users (id, email, password_hash, role, status, email_verified, created_at, updated_at)
			 VALUES ($1, $2, $3, 'user', 'active', true, $4, $4)
			 ON CONFLICT (email) DO NOTHING`,
			u.ID, u.Email, userPass, now,
		)

		tagsBytes, _ := json.Marshal(u.Tags)
		interestsBytes, _ := json.Marshal(u.Interests)

		db.Exec(
			`INSERT INTO profiles (user_id, display_name, birthdate, age, gender, pronouns, city, country,
			 latitude, longitude, bio, dating_intentions, target_genders, age_min, age_max, max_distance_km,
			 is_paused, is_verified, verification_badge, rabbit_hole, defend_take, teach_me, my_world_tags, interests, created_at, updated_at)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, 'Nigeria',
			 $8, $9, $10, $11, '["All"]', 18, 99, 200,
			 false, true, 'Curious Mind', $12, $13, $14, $15, $16, $17, $17)
			 ON CONFLICT (user_id) DO NOTHING`,
			u.ID, u.Name, u.DOB, u.Age, u.Gender, u.Pronouns, u.City,
			u.Lat, u.Lon, u.Bio, u.Intentions, u.RabbitHole, u.DefendTake, u.TeachMe,
			string(tagsBytes), string(interestsBytes), now,
		)

		photoID := uuid.New().String()
		db.Exec(
			`INSERT INTO profile_photos (id, user_id, url, is_primary, sort_order, created_at)
			 VALUES ($1, $2, $3, true, 0, $4)
			 ON CONFLICT (id) DO NOTHING`,
			photoID, u.ID, u.PhotoURL, now,
		)
	}

	// 3. Seed an active match and conversation between Amina and Chidi
	sparkID := "spark-demo-001"
	db.Exec(
		`INSERT INTO sparks (id, sender_id, receiver_id, target_type, target_content, comment, status, created_at, updated_at)
		 VALUES ($1, 'user-chidi-002', 'user-amina-001', 'defend_take',
		 'Language models aren''t stochastic parrots; their latent representations exhibit genuine geometric semantics.',
		 'I agree with the geometric semantics point! Have you seen how vector embedding arithmetic works in non-Euclidean hyperbolic spaces?',
		 'accepted', $2, $2)
		 ON CONFLICT (id) DO NOTHING`,
		sparkID, now,
	)

	matchID := "match-demo-001"
	db.Exec(
		`INSERT INTO matches (id, user1_id, user2_id, spark_id, created_at)
		 VALUES ($1, 'user-chidi-002', 'user-amina-001', $2, $3)
		 ON CONFLICT (user1_id, user2_id) DO NOTHING`,
		matchID, sparkID, now,
	)

	convID := "conv-demo-001"
	db.Exec(
		`INSERT INTO conversations (id, match_id, spark_id, user1_id, user2_id, last_message_at, created_at)
		 VALUES ($1, $2, $3, 'user-chidi-002', 'user-amina-001', $4, $4)
		 ON CONFLICT (match_id) DO NOTHING`,
		convID, matchID, sparkID, now,
	)

	// Seed conversation messages
	db.Exec(
		`INSERT INTO messages (id, conversation_id, sender_id, content, media_type, created_at)
		 VALUES ($1, $2, 'user-chidi-002', 'Sparked conversation: "I agree with the geometric semantics point! Have you seen how vector embedding arithmetic works in non-Euclidean hyperbolic spaces?"', 'text', $3)`,
		uuid.New().String(), convID, now.Add(-30*time.Minute),
	)

	db.Exec(
		`INSERT INTO messages (id, conversation_id, sender_id, content, media_type, created_at)
		 VALUES ($1, $2, 'user-amina-001', 'Yes! Poincaré embeddings for hierarchical knowledge graphs are fascinating. Are you applying them in game procedural generation?', 'text', $3)`,
		uuid.New().String(), convID, now.Add(-15*time.Minute),
	)

	// 4. Seed sample community posts
	db.Exec(
		`INSERT INTO community_posts (id, community_id, user_id, title, content, tags, like_count, comment_count, created_at)
		 VALUES ($1, 'comm-1', 'user-amina-001',
		 'Why attention maps are the closest thing to digital psychology',
		 'Looking into cross-attention heads in multimodal architectures feels less like computer science and more like cognitive neuroscience. How do you all conceptualize reasoning steps?',
		 '["Transformers", "AI", "CognitiveScience"]', 14, 2, $2)
		 ON CONFLICT (id) DO NOTHING`,
		"post-demo-001", now.Add(-2*time.Hour),
	)

	db.Exec(
		`INSERT INTO post_comments (id, post_id, user_id, content, created_at)
		 VALUES ($1, 'post-demo-001', 'user-chidi-002', 'It completely mirrors how human subconscious primes associative memories before conscious speech occurs!', $2)
		 ON CONFLICT (id) DO NOTHING`,
		uuid.New().String(), now.Add(-1*time.Hour),
	)

	log.Println("[SEED] Database successfully populated with admin, curiosity profiles, communities, and real sparks!")
}
