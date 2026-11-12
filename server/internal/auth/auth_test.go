package auth_test

import (
	"testing"
	"time"

	"github.com/cupiddle/server/internal/auth"
)

func TestHashPasswordAndVerify(t *testing.T) {
	password := "CuriousLover2026!"
	hash, err := auth.HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	if !auth.CheckPasswordHash(password, hash) {
		t.Fatalf("Password verification failed for correct password")
	}

	if auth.CheckPasswordHash("WrongPassword!", hash) {
		t.Fatalf("Password verification succeeded for wrong password")
	}
}

func TestCalculateAgeAnd18PlusEnforcement(t *testing.T) {
	// Adult test case (25 years old)
	adultDOB := time.Now().AddDate(-25, 0, 0).Format("2006-01-02")
	age, err := auth.CalculateAge(adultDOB)
	if err != nil {
		t.Fatalf("Expected adult DOB to succeed, got error: %v", err)
	}
	if age != 25 {
		t.Fatalf("Expected age 25, got %d", age)
	}

	// Underage test case (16 years old) - MUST be rejected
	underageDOB := time.Now().AddDate(-16, 0, 0).Format("2006-01-02")
	_, err = auth.CalculateAge(underageDOB)
	if err != auth.ErrUnderageUser {
		t.Fatalf("Expected ErrUnderageUser for 16-year-old, got: %v", err)
	}

	// Invalid format test
	_, err = auth.CalculateAge("invalid-date")
	if err != auth.ErrInvalidDOB {
		t.Fatalf("Expected ErrInvalidDOB, got: %v", err)
	}
}

func TestJWTGenerationAndValidation(t *testing.T) {
	secret := "test-secret-key"
	userID := "user-123"
	email := "test@cupiddle.com"
	role := "user"

	token, err := auth.GenerateJWT(userID, email, role, secret)
	if err != nil {
		t.Fatalf("Failed to generate JWT: %v", err)
	}

	claims, err := auth.ValidateJWT(token, secret)
	if err != nil {
		t.Fatalf("Failed to validate JWT: %v", err)
	}

	if claims.UserID != userID || claims.Email != email || claims.Role != role {
		t.Fatalf("JWT claims mismatch: got %+v", claims)
	}

	// Test with wrong secret
	_, err = auth.ValidateJWT(token, "wrong-secret")
	if err == nil {
		t.Fatalf("Expected error validating with wrong secret, got nil")
	}
}

