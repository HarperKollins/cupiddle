package config

import (
	"os"
	"strconv"
)

// Config holds all runtime application configuration
type Config struct {
	Port         string
	DatabaseURL  string
	DBDriver     string // "postgres" or "sqlite"
	JWTSecret    string
	StoragePath  string
	AllowedCORS  []string
	Environment  string // "development", "staging", "production"
	RateLimitReq int    // requests per minute
}

// LoadConfig reads configuration from environment variables with fallbacks
func LoadConfig() *Config {
	port := getEnv("PORT", "8080")
	dbURL := getEnv("DATABASE_URL", "cuppidle.db")
	driver := getEnv("DB_DRIVER", "")

	if driver == "" {
		if len(dbURL) >= 11 && dbURL[:11] == "postgres://" || len(dbURL) >= 14 && dbURL[:14] == "postgresql://" {
			driver = "postgres"
		} else {
			driver = "sqlite"
		}
	}

	jwtSecret := getEnv("JWT_SECRET", "cupiddle-super-secret-production-jwt-key-change-in-prod-2026")
	storagePath := getEnv("STORAGE_PATH", "./uploads")
	env := getEnv("ENVIRONMENT", "development")

	rateLimitStr := getEnv("RATE_LIMIT_REQ", "120")
	rateLimit, err := strconv.Atoi(rateLimitStr)
	if err != nil {
		rateLimit = 120
	}

	return &Config{
		Port:         port,
		DatabaseURL:  dbURL,
		DBDriver:     driver,
		JWTSecret:    jwtSecret,
		StoragePath:  storagePath,
		AllowedCORS:  []string{"*"},
		Environment:  env,
		RateLimitReq: rateLimit,
	}
}

func getEnv(key, defaultVal string) string {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	return val
}
