package config

import (
	"bufio"
	"log"
	"os"
	"strconv"
	"strings"
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

	// S3-Compatible Cloud Storage (e.g. Neon S3)
	S3Endpoint  string
	S3AccessKey string
	S3SecretKey string
	S3Region    string
	S3Bucket    string
}

// loadDotEnv loads environment variables from .env if present
func loadDotEnv() {
	paths := []string{".env", "../.env"}
	for _, p := range paths {
		f, err := os.Open(p)
		if err != nil {
			continue
		}
		defer f.Close()

		scanner := bufio.NewScanner(f)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			parts := strings.SplitN(line, "=", 2)
			if len(parts) == 2 {
				key := strings.TrimSpace(parts[0])
				val := strings.TrimSpace(parts[1])
				val = strings.Trim(val, `"'`)
				if os.Getenv(key) == "" {
					os.Setenv(key, val)
				}
			}
		}
		log.Printf("[CONFIG] Loaded environment settings from %s", p)
		break
	}
}

// LoadConfig reads configuration from environment variables with fallbacks
func LoadConfig() *Config {
	loadDotEnv()

	port := getEnv("PORT", "8080")
	dbURL := getEnv("DATABASE_URL", "")
	if dbURL == "" {
		dbURL = getEnv("NEON_DATABASE_URL", "")
	}
	if dbURL == "" {
		dbURL = getEnv("POSTGRES_URL", "cuppidle.db")
	}

	driver := getEnv("DB_DRIVER", "")
	if driver == "" {
		if strings.HasPrefix(dbURL, "postgres://") || strings.HasPrefix(dbURL, "postgresql://") {
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

	s3Endpoint := getEnv("AWS_ENDPOINT_URL_S3", "")
	s3AccessKey := getEnv("AWS_ACCESS_KEY_ID", "")
	s3SecretKey := getEnv("AWS_SECRET_ACCESS_KEY", "")
	s3Region := getEnv("AWS_REGION", "us-east-2")
	s3Bucket := getEnv("S3_BUCKET", "assets")

	return &Config{
		Port:         port,
		DatabaseURL:  dbURL,
		DBDriver:     driver,
		JWTSecret:    jwtSecret,
		StoragePath:  storagePath,
		AllowedCORS:  []string{"*"},
		Environment:  env,
		RateLimitReq: rateLimit,
		S3Endpoint:   s3Endpoint,
		S3AccessKey:  s3AccessKey,
		S3SecretKey:  s3SecretKey,
		S3Region:     s3Region,
		S3Bucket:     s3Bucket,
	}
}

func getEnv(key, defaultVal string) string {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	return val
}

