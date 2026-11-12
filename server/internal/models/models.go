package models

import (
	"time"
)

// User represents the core authentication account
type User struct {
	ID            string    `json:"id"`
	Email         string    `json:"email"`
	PasswordHash  string    `json:"-"`
	Role          string    `json:"role"` // "user", "moderator", "admin"
	Status        string    `json:"status"` // "active", "suspended", "banned", "pending_deletion"
	EmailVerified bool      `json:"email_verified"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// Profile represents the complete curiosity-first profile
type Profile struct {
	UserID              string    `json:"user_id"`
	DisplayName         string    `json:"display_name"`
	Birthdate           string    `json:"birthdate"` // YYYY-MM-DD
	Age                 int       `json:"age"`
	Gender              string    `json:"gender"`
	Pronouns            string    `json:"pronouns,omitempty"`
	City                string    `json:"city"`
	Country             string    `json:"country"`
	Latitude            float64   `json:"latitude"`
	Longitude           float64   `json:"longitude"`
	Bio                 string    `json:"bio"`
	DatingIntentions    string    `json:"dating_intentions"`
	TargetGenders       []string  `json:"target_genders"`
	AgeMin              int       `json:"age_min"`
	AgeMax              int       `json:"age_max"`
	MaxDistanceKm       int       `json:"max_distance_km"`
	IsPaused            bool      `json:"is_paused"`
	IsVerified          bool      `json:"is_verified"`
	VerificationBadge   string    `json:"verification_badge,omitempty"`
	AudioIntroURL       string    `json:"audio_intro_url,omitempty"`
	AudioIntroDuration  int       `json:"audio_intro_duration,omitempty"` // in seconds (max 30)
	RabbitHole          string    `json:"rabbit_hole"`                    // "What are you currently obsessed with?"
	DefendTake          string    `json:"defend_take"`                    // "Defend this take"
	TeachMe             string    `json:"teach_me"`                       // "Teach me something"
	MyWorldTags         []string  `json:"my_world_tags"`                  // Favourite books, anime, games, code, music
	Interests           []string  `json:"interests"`                      // Categorized taxonomy
	Photos              []Photo   `json:"photos,omitempty"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

// Photo represents an uploaded profile photograph
type Photo struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	URL       string    `json:"url"`
	IsPrimary bool      `json:"is_primary"`
	SortOrder int       `json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
}

// Spark represents an intentional, context-rich interaction
type Spark struct {
	ID            string    `json:"id"`
	SenderID      string    `json:"sender_id"`
	SenderProfile *Profile  `json:"sender_profile,omitempty"`
	ReceiverID    string    `json:"receiver_id"`
	TargetType    string    `json:"target_type"`    // "rabbit_hole", "defend_take", "teach_me", "photo", "community_post"
	TargetContent string    `json:"target_content"` // The snippet being reacted to
	Comment       string    `json:"comment"`        // The sender's thoughtful response
	Status        string    `json:"status"`         // "pending", "accepted", "passed"
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// Match represents a mutual connection formed by an accepted Spark
type Match struct {
	ID           string    `json:"id"`
	User1ID      string    `json:"user1_id"`
	User2ID      string    `json:"user2_id"`
	SparkID      *string   `json:"spark_id,omitempty"`
	Spark        *Spark    `json:"spark,omitempty"`
	Partner      *Profile  `json:"partner,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}

// Conversation represents a chat room between matched users
type Conversation struct {
	ID             string    `json:"id"`
	MatchID        string    `json:"match_id"`
	SparkID        *string   `json:"spark_id,omitempty"`
	User1ID        string    `json:"user1_id"`
	User2ID        string    `json:"user2_id"`
	Partner        *Profile  `json:"partner,omitempty"`
	OriginSpark    *Spark    `json:"origin_spark,omitempty"`
	LastMessageAt  time.Time `json:"last_message_at"`
	LastMessage    *Message  `json:"last_message,omitempty"`
	UnreadCount    int       `json:"unread_count"`
	CreatedAt      time.Time `json:"created_at"`
}

// Message represents a text, voice, or media item in a conversation
type Message struct {
	ID             string            `json:"id"`
	ConversationID string            `json:"conversation_id"`
	SenderID       string            `json:"sender_id"`
	Content        string            `json:"content"`
	MediaType      string            `json:"media_type"` // "text", "voice", "image"
	MediaURL       string            `json:"media_url,omitempty"`
	ReadAt         *time.Time        `json:"read_at,omitempty"`
	Reactions      map[string]string `json:"reactions,omitempty"` // map[userID]emoji
	CreatedAt      time.Time         `json:"created_at"`
}

// Community represents a topic-based Rabbit Hole space
type Community struct {
	ID          string    `json:"id"`
	Slug        string    `json:"slug"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Icon        string    `json:"icon"`
	Category    string    `json:"category"`
	MemberCount int       `json:"member_count"`
	PostCount   int       `json:"post_count"`
	IsMember    bool      `json:"is_member"`
	CreatedAt   time.Time `json:"created_at"`
}

// CommunityPost represents a discussion post within a community
type CommunityPost struct {
	ID           string    `json:"id"`
	CommunityID  string    `json:"community_id"`
	UserID       string    `json:"user_id"`
	Author       *Profile  `json:"author,omitempty"`
	Title        string    `json:"title"`
	Content      string    `json:"content"`
	Tags         []string  `json:"tags"`
	LikeCount    int       `json:"like_count"`
	CommentCount int       `json:"comment_count"`
	CreatedAt    time.Time `json:"created_at"`
}

// PostComment represents a reply to a community post
type PostComment struct {
	ID        string    `json:"id"`
	PostID    string    `json:"post_id"`
	UserID    string    `json:"user_id"`
	Author    *Profile  `json:"author,omitempty"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

// CoopGame represents an asynchronous or synchronous Co-op Corner game
type CoopGame struct {
	ID             string     `json:"id"`
	ConversationID string     `json:"conversation_id"`
	GameType       string     `json:"game_type"` // "logic_riddle", "would_you_rather", "two_truths_lie", "ai_or_human", "collaborative_debate"
	InitiatorID    string     `json:"initiator_id"`
	PartnerID      string     `json:"partner_id"`
	Title          string     `json:"title"`
	PromptData     string     `json:"prompt_data"` // JSON payload
	User1Answer    string     `json:"user1_answer"`
	User2Answer    string     `json:"user2_answer"`
	Status         string     `json:"status"` // "in_progress", "completed"
	ResultSummary  string     `json:"result_summary,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
	CompletedAt    *time.Time `json:"completed_at,omitempty"`
}

// Report represents a user safety incident
type Report struct {
	ID             string     `json:"id"`
	ReporterID     string     `json:"reporter_id"`
	ReportedID     string     `json:"reported_id"`
	ReportedUser   *Profile   `json:"reported_user,omitempty"`
	Reason         string     `json:"reason"`
	Details        string     `json:"details"`
	Status         string     `json:"status"` // "pending", "investigating", "resolved", "dismissed"
	ActionTaken    string     `json:"action_taken,omitempty"`
	ModeratorNotes string     `json:"moderator_notes,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
	ResolvedAt     *time.Time `json:"resolved_at,omitempty"`
}

// AuditLog represents an administrative or safety action
type AuditLog struct {
	ID         string    `json:"id"`
	ActorID    string    `json:"actor_id"`
	Action     string    `json:"action"`
	TargetType string    `json:"target_type"`
	TargetID   string    `json:"target_id"`
	Details    string    `json:"details"`
	IPAddress  string    `json:"ip_address,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}

// DiscoveryCandidate represents a scored recommendation for the Idea Stream
type DiscoveryCandidate struct {
	Profile         Profile  `json:"profile"`
	DistanceKm      float64  `json:"distance_km"`
	SharedInterests []string `json:"shared_interests"`
	MatchScore      float64  `json:"match_score"`
}

