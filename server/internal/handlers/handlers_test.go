package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/cupiddle/server/internal/config"
	"github.com/cupiddle/server/internal/database"
	"github.com/cupiddle/server/internal/handlers"
	"github.com/cupiddle/server/internal/middleware"
	"github.com/go-chi/chi/v5"
)

func setupTestApp(t *testing.T) (*chi.Mux, *database.DB, func()) {
	testDBPath := "test_cupiddle.db"
	os.Remove(testDBPath)

	db, err := database.InitDB("sqlite", testDBPath)
	if err != nil {
		t.Fatalf("Failed to init test db: %v", err)
	}

	cfg := &config.Config{
		JWTSecret:   "test-jwt-secret-key-12345",
		StoragePath: "./test_uploads",
	}

	authH := handlers.NewAuthHandler(db, cfg)
	discH := handlers.NewDiscoveryHandler(db)

	r := chi.NewRouter()
	r.Post("/api/auth/register", authH.Register)
	r.Post("/api/auth/login", authH.Login)

	r.Group(func(r chi.Router) {
		r.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		r.Get("/api/auth/me", authH.Me)
		r.Get("/api/discovery/feed", discH.GetIdeaStream)
	})

	cleanup := func() {
		db.Close()
		os.Remove(testDBPath)
		os.RemoveAll("./test_uploads")
	}

	return r, db, cleanup
}

func TestRegisterAndLoginFlow(t *testing.T) {
	router, _, cleanup := setupTestApp(t)
	defer cleanup()

	// 1. Attempt Underage Registration (Must Fail with 400)
	underageBody := map[string]interface{}{
		"email":        "teen@example.com",
		"password":     "SecretPass123!",
		"display_name": "Teenager",
		"birthdate":    time.Now().AddDate(-16, 0, 0).Format("2006-01-02"),
		"gender":       "Woman",
		"city":         "Lagos",
	}
	bodyBytes, _ := json.Marshal(underageBody)
	req := httptest.NewRequest("POST", "/api/auth/register", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request for underage registration, got: %d", rec.Code)
	}

	// 2. Successful Adult Registration (Must Succeed with 201)
	adultBody := map[string]interface{}{
		"email":        "scholar@example.com",
		"password":     "ScholarPass123!",
		"display_name": "Curious Scholar",
		"birthdate":    time.Now().AddDate(-24, 0, 0).Format("2006-01-02"),
		"gender":       "Man",
		"city":         "Lagos",
	}
	bodyBytes, _ = json.Marshal(adultBody)
	req = httptest.NewRequest("POST", "/api/auth/register", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("Expected 201 Created for adult registration, got: %d, body: %s", rec.Code, rec.Body.String())
	}

	var regResp handlers.AuthResponse
	if err := json.NewDecoder(rec.Body).Decode(&regResp); err != nil {
		t.Fatalf("Failed to parse register response: %v", err)
	}

	if regResp.Token == "" {
		t.Fatalf("Expected non-empty JWT token on register")
	}

	// 3. Login with Correct Credentials
	loginBody := map[string]string{
		"email":    "scholar@example.com",
		"password": "ScholarPass123!",
	}
	bodyBytes, _ = json.Marshal(loginBody)
	req = httptest.NewRequest("POST", "/api/auth/login", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for login, got: %d", rec.Code)
	}

	var loginResp handlers.AuthResponse
	json.NewDecoder(rec.Body).Decode(&loginResp)

	// 4. Access Protected Route (/api/auth/me) with JWT
	req = httptest.NewRequest("GET", "/api/auth/me", nil)
	req.Header.Set("Authorization", "Bearer "+loginResp.Token)
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for /api/auth/me with valid token, got: %d", rec.Code)
	}

	// 5. Access Protected Route without JWT (Must Fail with 401)
	req = httptest.NewRequest("GET", "/api/auth/me", nil)
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("Expected 401 Unauthorized for request without token, got: %d", rec.Code)
	}
}
