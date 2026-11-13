package database

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
	_ "modernc.org/sqlite"
)

// DB wraps standard database connection
type DB struct {
	*sql.DB
	Driver string
}

// InitDB connects to the configured database and runs migrations
func InitDB(driverName, dataSourceName string) (*DB, error) {
	var db *sql.DB
	var err error

	if driverName == "postgres" {
		db, err = sql.Open("postgres", dataSourceName)
	} else {
		// Default SQLite driver name for modernc.org/sqlite is "sqlite"
		db, err = sql.Open("sqlite", dataSourceName)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	db.SetMaxOpenConns(20)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(15 * time.Minute)
	db.SetConnMaxIdleTime(3 * time.Minute)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("database ping failed: %w", err)
	}

	appDB := &DB{DB: db, Driver: driverName}
	if err := appDB.RunMigrations(); err != nil {
		return nil, fmt.Errorf("failed running migrations: %w", err)
	}

	log.Printf("[DATABASE] Connected successfully using driver '%s'", driverName)
	return appDB, nil
}

// RunMigrations initializes all core tables
func (db *DB) RunMigrations() error {
	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		email TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		role TEXT NOT NULL DEFAULT 'user',
		status TEXT NOT NULL DEFAULT 'active',
		email_verified BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMP NOT NULL,
		updated_at TIMESTAMP NOT NULL
	);

	CREATE TABLE IF NOT EXISTS profiles (
		user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
		display_name TEXT NOT NULL,
		birthdate TEXT NOT NULL,
		age INTEGER NOT NULL,
		gender TEXT NOT NULL,
		pronouns TEXT DEFAULT '',
		city TEXT DEFAULT '',
		country TEXT DEFAULT 'Nigeria',
		latitude REAL DEFAULT 0.0,
		longitude REAL DEFAULT 0.0,
		bio TEXT DEFAULT '',
		dating_intentions TEXT DEFAULT '',
		target_genders TEXT DEFAULT '[]',
		age_min INTEGER DEFAULT 18,
		age_max INTEGER DEFAULT 99,
		max_distance_km INTEGER DEFAULT 100,
		is_paused BOOLEAN DEFAULT FALSE,
		is_verified BOOLEAN DEFAULT FALSE,
		verification_badge TEXT DEFAULT '',
		audio_intro_url TEXT DEFAULT '',
		audio_intro_duration INTEGER DEFAULT 0,
		rabbit_hole TEXT DEFAULT '',
		defend_take TEXT DEFAULT '',
		teach_me TEXT DEFAULT '',
		my_world_tags TEXT DEFAULT '[]',
		interests TEXT DEFAULT '[]',
		created_at TIMESTAMP NOT NULL,
		updated_at TIMESTAMP NOT NULL
	);

	CREATE TABLE IF NOT EXISTS profile_photos (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		url TEXT NOT NULL,
		is_primary BOOLEAN DEFAULT FALSE,
		sort_order INTEGER DEFAULT 0,
		created_at TIMESTAMP NOT NULL
	);

	CREATE TABLE IF NOT EXISTS sparks (
		id TEXT PRIMARY KEY,
		sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		target_type TEXT NOT NULL,
		target_content TEXT NOT NULL,
		comment TEXT NOT NULL,
		status TEXT NOT NULL DEFAULT 'pending',
		created_at TIMESTAMP NOT NULL,
		updated_at TIMESTAMP NOT NULL
	);

	CREATE TABLE IF NOT EXISTS matches (
		id TEXT PRIMARY KEY,
		user1_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		user2_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		spark_id TEXT,
		created_at TIMESTAMP NOT NULL,
		UNIQUE(user1_id, user2_id)
	);

	CREATE TABLE IF NOT EXISTS conversations (
		id TEXT PRIMARY KEY,
		match_id TEXT UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
		spark_id TEXT,
		user1_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		user2_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		last_message_at TIMESTAMP NOT NULL,
		created_at TIMESTAMP NOT NULL
	);

	CREATE TABLE IF NOT EXISTS messages (
		id TEXT PRIMARY KEY,
		conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
		sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		content TEXT NOT NULL,
		media_type TEXT DEFAULT 'text',
		media_url TEXT DEFAULT '',
		read_at TIMESTAMP,
		reactions TEXT DEFAULT '{}',
		created_at TIMESTAMP NOT NULL
	);

	CREATE TABLE IF NOT EXISTS communities (
		id TEXT PRIMARY KEY,
		slug TEXT UNIQUE NOT NULL,
		name TEXT NOT NULL,
		description TEXT NOT NULL,
		icon TEXT NOT NULL,
		category TEXT NOT NULL,
		member_count INTEGER DEFAULT 0,
		post_count INTEGER DEFAULT 0,
		created_at TIMESTAMP NOT NULL
	);

	CREATE TABLE IF NOT EXISTS community_members (
		community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
		user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		joined_at TIMESTAMP NOT NULL,
		PRIMARY KEY(community_id, user_id)
	);

	CREATE TABLE IF NOT EXISTS community_posts (
		id TEXT PRIMARY KEY,
		community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
		user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		title TEXT NOT NULL,
		content TEXT NOT NULL,
		tags TEXT DEFAULT '[]',
		like_count INTEGER DEFAULT 0,
		comment_count INTEGER DEFAULT 0,
		created_at TIMESTAMP NOT NULL
	);

	CREATE TABLE IF NOT EXISTS post_comments (
		id TEXT PRIMARY KEY,
		post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
		user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		content TEXT NOT NULL,
		created_at TIMESTAMP NOT NULL
	);

	CREATE TABLE IF NOT EXISTS coop_games (
		id TEXT PRIMARY KEY,
		conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
		game_type TEXT NOT NULL,
		initiator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		partner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		title TEXT NOT NULL,
		prompt_data TEXT NOT NULL,
		user1_answer TEXT DEFAULT '',
		user2_answer TEXT DEFAULT '',
		status TEXT NOT NULL DEFAULT 'in_progress',
		result_summary TEXT DEFAULT '',
		created_at TIMESTAMP NOT NULL,
		completed_at TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS user_blocks (
		blocker_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		blocked_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		created_at TIMESTAMP NOT NULL,
		PRIMARY KEY(blocker_id, blocked_id)
	);

	CREATE TABLE IF NOT EXISTS user_passes (
		user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		passed_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		created_at TIMESTAMP NOT NULL,
		PRIMARY KEY(user_id, passed_id)
	);

	CREATE TABLE IF NOT EXISTS reports (
		id TEXT PRIMARY KEY,
		reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		reported_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		reason TEXT NOT NULL,
		details TEXT NOT NULL,
		status TEXT NOT NULL DEFAULT 'pending',
		action_taken TEXT DEFAULT '',
		moderator_notes TEXT DEFAULT '',
		created_at TIMESTAMP NOT NULL,
		resolved_at TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS audit_logs (
		id TEXT PRIMARY KEY,
		actor_id TEXT NOT NULL,
		action TEXT NOT NULL,
		target_type TEXT NOT NULL,
		target_id TEXT NOT NULL,
		details TEXT NOT NULL,
		ip_address TEXT DEFAULT '',
		created_at TIMESTAMP NOT NULL
	);

	CREATE TABLE IF NOT EXISTS analytics_events (
		id TEXT PRIMARY KEY,
		user_id TEXT DEFAULT '',
		event_name TEXT NOT NULL,
		properties TEXT DEFAULT '{}',
		created_at TIMESTAMP NOT NULL
	);

	CREATE INDEX IF NOT EXISTS idx_sparks_receiver ON sparks(receiver_id, status);
	CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);
	CREATE INDEX IF NOT EXISTS idx_posts_comm ON community_posts(community_id, created_at);
	`

	_, err := db.Exec(schema)
	if err != nil {
		return err
	}

	return nil
}

func (db *DB) seedDefaultCommunities() error {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM communities").Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		return nil
	}

	defaultCommunities := []struct {
		ID, Slug, Name, Description, Icon, Category string
	}{
		{"comm-1", "ai-and-coding", "AI & Software Engineering", "For developers, researchers, and builders shaping the algorithmic frontier.", "code", "Technology"},
		{"comm-2", "philosophy-ethics", "Philosophy & Curious Minds", "Exploring morality, epistemology, consciousness, and why we think what we think.", "sparkles", "Philosophy"},
		{"comm-3", "film-and-cinema", "Cinema, Indie Film & Storytelling", "Narrative arcs, visual grammar, auteur theory, and storytelling craft.", "film", "Arts & Culture"},
		{"comm-4", "anime-and-manga", "Anime & Manga Deep Dives", "From classic mecha and shonen deconstructions to obscure slice-of-life.", "tv", "Pop Culture"},
		{"comm-5", "books-and-literature", "Books, Essays & Long-Reads", "Sharing the literature and ideas that permanently rewired our perspective.", "book-open", "Literature"},
		{"comm-6", "cosmology-physics", "Cosmology, Physics & Deep Science", "Black holes, astrophysics, quantum weirdness, and the scale of the cosmos.", "globe", "Science"},
		{"comm-7", "gaming-design", "Game Design & Interactive Art", "Mechanics as metaphor, worldbuilding, Ludology, and indie game gems.", "gamepad-2", "Gaming"},
		{"comm-8", "startups-building", "Ventures & Creative Experiments", "Building companies, indie hacking, design thinking, and ambitious prototypes.", "rocket", "Entrepreneurship"},
	}

	now := time.Now()
	for _, c := range defaultCommunities {
		_, err := db.Exec(
			`INSERT INTO communities (id, slug, name, description, icon, category, member_count, post_count, created_at)
			 VALUES ($1, $2, $3, $4, $5, $6, 0, 0, $7)
			 ON CONFLICT (id) DO NOTHING`,
			c.ID, c.Slug, c.Name, c.Description, c.Icon, c.Category, now,
		)
		if err != nil {
			// For SQLite parameter syntax compatibility if needed:
			_, err = db.Exec(
				`INSERT INTO communities (id, slug, name, description, icon, category, member_count, post_count, created_at)
				 VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)
				 ON CONFLICT (id) DO NOTHING`,
				c.ID, c.Slug, c.Name, c.Description, c.Icon, c.Category, now,
			)
			if err != nil {
				log.Printf("Warning: error seeding community %s: %v", c.Slug, err)
			}
		}
	}

	log.Printf("[DATABASE] Seeded %d initial Rabbit Hole communities", len(defaultCommunities))
	return nil
}

