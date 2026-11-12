package auth

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidToken   = errors.New("invalid or expired authentication token")
	ErrTokenExpired   = errors.New("authentication token has expired")
	ErrUnderageUser   = errors.New("you must be at least 18 years old to join Cupiddle")
	ErrInvalidDOB     = errors.New("invalid date of birth format, expected YYYY-MM-DD")
)

// Claims represents the JWT payload
type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// HashPassword generates a bcrypt hash of the provided password
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// CheckPasswordHash compares a password with its bcrypt hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateJWT creates a signed JWT token valid for 30 days
func GenerateJWT(userID, email, role, secret string) (string, error) {
	expirationTime := time.Now().Add(30 * 24 * time.Hour)
	claims := &Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "cupiddle-auth",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ValidateJWT parses and verifies a JWT token
func ValidateJWT(tokenStr, secret string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, ErrInvalidToken
	}

	if !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// CalculateAge verifies date of birth and calculates exact age in years
func CalculateAge(dobStr string) (int, error) {
	dob, err := time.Parse("2006-01-02", dobStr)
	if err != nil {
		return 0, ErrInvalidDOB
	}

	now := time.Now()
	age := now.Year() - dob.Year()
	if now.YearDay() < dob.YearDay() {
		age--
	}

	if age < 18 {
		return age, ErrUnderageUser
	}

	return age, nil
}

