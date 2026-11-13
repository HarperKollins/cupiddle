package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/cupiddle/server/internal/config"
	"github.com/cupiddle/server/internal/database"
	"github.com/cupiddle/server/internal/handlers"
	"github.com/cupiddle/server/internal/middleware"
	"github.com/cupiddle/server/internal/websocket"
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/rs/cors"
)

func main() {
	log.Println("==================================================")
	log.Println("  CUPIDDLE — High-Performance Low-Latency Server  ")
	log.Println("  Philosophy: Curiosity is attractive.            ")
	log.Println("==================================================")

	cfg := config.LoadConfig()

	// Initialize Database and run migrations
	db, err := database.InitDB(cfg.DBDriver, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("[FATAL] Could not initialize database: %v", err)
	}
	defer db.Close()

	// Initialize WebSocket Real-Time Hub
	hub := websocket.NewHub()
	go hub.Run()
	log.Println("[WS] Real-Time WebSocket Hub initialized and running")

	// Initialize Handlers
	authH := handlers.NewAuthHandler(db, cfg)
	profileH := handlers.NewProfileHandler(db)
	discH := handlers.NewDiscoveryHandler(db)
	sparkH := handlers.NewSparkHandler(db, hub)
	chatH := handlers.NewChatHandler(db, hub)
	commH := handlers.NewCommunityHandler(db, hub)
	coopH := handlers.NewCoopHandler(db, hub)
	safetyH := handlers.NewSafetyHandler(db)
	adminH := handlers.NewAdminHandler(db)
	mediaH := handlers.NewMediaHandler(cfg)
	suggestionH := handlers.NewSuggestionHandler(db)

	// Router setup
	r := chi.NewRouter()

	// Core middleware
	r.Use(chimiddleware.RealIP)
	r.Use(middleware.RequestLogger)
	r.Use(middleware.SecurityHeaders)
	r.Use(chimiddleware.Recoverer)

	rateLimiter := middleware.NewRateLimiter(cfg.RateLimitReq, time.Minute)
	r.Use(rateLimiter.Limit)

	// CORS config
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	})
	r.Use(c.Handler)

	// Media serving (Local disk cache with fallback to Neon S3 Cloud Storage)
	r.Get("/uploads/*", mediaH.ServeUpload)

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status":"online","product":"Cupiddle","version":"1.0.0","timestamp":"%s"}`, time.Now().UTC().Format(time.RFC3339))
	})

	// Public routes
	r.Route("/api", func(r chi.Router) {
		r.Post("/auth/register", authH.Register)
		r.Post("/auth/login", authH.Login)
		r.Post("/auth/forgot-password", authH.ForgotPassword)
		r.Post("/auth/reset-password", authH.ResetPassword)
		r.Post("/suggestions", suggestionH.SubmitSuggestion)
		r.Get("/communities", commH.GetCommunities)
		r.Get("/communities/{slug}/posts", commH.GetCommunityPosts)
		r.Get("/profiles/{id}", profileH.GetPublicProfile)

		// Authenticated routes
		r.Group(func(r chi.Router) {
			r.Use(middleware.AuthMiddleware(cfg.JWTSecret))

			// WebSocket real-time connection
			r.Get("/ws", func(w http.ResponseWriter, r *http.Request) {
				userID, _ := r.Context().Value(middleware.UserIDKey).(string)
				websocket.ServeWS(hub, w, r, userID)
			})

			// Account & Identity
			r.Get("/auth/me", authH.Me)
			r.Delete("/auth/account", authH.DeleteAccount)

			// Profile & Curiosity
			r.Put("/profile", profileH.UpdateProfile)
			r.Put("/profile/curiosity", profileH.UpdateCuriosity)
			r.Put("/profile/audio", profileH.UpdateAudioIntro)
			r.Post("/profile/photos", profileH.AddPhoto)
			r.Delete("/profile/photos/{id}", profileH.DeletePhoto)
			r.Put("/profile/photos/{id}/primary", profileH.SetPrimaryPhoto)

			// Media uploads
			r.Post("/media/photo", mediaH.UploadPhoto)
			r.Post("/media/audio", mediaH.UploadAudio)

			// The Idea Stream (Discovery)
			r.Get("/discovery/feed", discH.GetIdeaStream)
			r.Post("/discovery/pass", discH.PassProfile)
			r.Post("/discovery/reset", discH.ResetPasses)

			// The Spark System
			r.Post("/sparks", sparkH.SendSpark)
			r.Get("/sparks/inbox", sparkH.GetIncomingSparks)
			r.Post("/sparks/{id}/accept", sparkH.AcceptSpark)
			r.Post("/sparks/{id}/pass", sparkH.PassSpark)

			// Real-Time Conversation Room
			r.Get("/conversations", chatH.GetConversations)
			r.Get("/conversations/{id}/messages", chatH.GetMessages)
			r.Post("/conversations/{id}/messages", chatH.SendMessage)
			r.Post("/conversations/messages/{messageId}/reactions", chatH.AddReaction)
			r.Get("/conversations/{id}/radar", chatH.GetConversationRadar)

			// Co-op Corner Games
			r.Post("/conversations/{id}/games", coopH.StartGame)
			r.Get("/conversations/{id}/games/active", coopH.GetActiveGame)
			r.Post("/games/{gameId}/answer", coopH.SubmitAnswer)

			// Rabbit Holes Communities
			r.Post("/communities", commH.CreateCommunity)
			r.Post("/communities/{slug}/join", commH.JoinCommunity)
			r.Post("/communities/{slug}/leave", commH.LeaveCommunity)
			r.Post("/communities/{slug}/posts", commH.CreatePost)
			r.Get("/posts/{postId}/comments", commH.GetPostComments)
			r.Post("/posts/{postId}/comments", commH.AddComment)

			// Safety & Trust
			r.Post("/safety/block", safetyH.BlockUser)
			r.Delete("/safety/block/{userId}", safetyH.UnblockUser)
			r.Get("/safety/blocks", safetyH.GetBlockedUsers)
			r.Post("/safety/report", safetyH.SubmitReport)

			// Administration & Moderation
			r.Group(func(r chi.Router) {
				r.Use(middleware.RequireRole("admin", "moderator"))
				r.Get("/admin/metrics", adminH.GetOverviewMetrics)
				r.Get("/admin/users", adminH.GetUsers)
				r.Put("/admin/users/{id}/status", adminH.UpdateUserStatus)
				r.Put("/admin/users/{id}/verify", adminH.ToggleVerification)
				r.Get("/admin/reports", adminH.GetReportsQueue)
				r.Put("/admin/reports/{id}/resolve", adminH.ResolveReport)
				r.Get("/admin/audit-logs", adminH.GetAuditLogs)
				r.Get("/admin/suggestions", suggestionH.GetSuggestions)
			})
		})
	})

	// Static SPA Serving for Production (Unified single-service deployment)
	webDistPaths := []string{
		os.Getenv("WEB_DIST_PATH"),
		"./web/dist",
		"../web/dist",
		"./dist",
	}
	var resolvedWebDist string
	for _, p := range webDistPaths {
		if p != "" {
			if info, err := os.Stat(p); err == nil && info.IsDir() {
				resolvedWebDist = p
				break
			}
		}
	}

	if resolvedWebDist != "" {
		fileServer := http.FileServer(http.Dir(resolvedWebDist))
		r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
			path := r.URL.Path
			// Don't intercept API or upload routes
			if strings.HasPrefix(path, "/api") || strings.HasPrefix(path, "/uploads") {
				http.NotFound(w, r)
				return
			}

			filePath := filepath.Join(resolvedWebDist, filepath.Clean(path))
			if info, err := os.Stat(filePath); err == nil && !info.IsDir() {
				fileServer.ServeHTTP(w, r)
				return
			}

			// SPA fallback: return index.html
			http.ServeFile(w, r, filepath.Join(resolvedWebDist, "index.html"))
		})
		log.Printf("[STATIC] Serving Web PWA frontend from %s", resolvedWebDist)
	}

	serverAddr := ":" + cfg.Port
	server := &http.Server{
		Addr:         serverAddr,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("[SERVER] Listening on http://localhost%s (Environment: %s)", serverAddr, cfg.Environment)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[FATAL] Server failed: %v", err)
		}
	}()

	// Graceful shutdown handling
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("[SERVER] Shutting down gracefully...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("[FATAL] Server forced shutdown: %v", err)
	}

	log.Println("[SERVER] Server exited cleanly.")
}

