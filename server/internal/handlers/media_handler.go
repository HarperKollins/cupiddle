package handlers

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/cupiddle/server/internal/config"
	"github.com/cupiddle/server/internal/middleware"
	"github.com/google/uuid"
)

// MediaHandler handles multipart media uploads
type MediaHandler struct {
	Config   *config.Config
	S3Client *s3.Client
}

// NewMediaHandler creates a new MediaHandler
func NewMediaHandler(cfg *config.Config) *MediaHandler {
	// Ensure upload directory exists
	os.MkdirAll(cfg.StoragePath, 0755)
	os.MkdirAll(filepath.Join(cfg.StoragePath, "photos"), 0755)
	os.MkdirAll(filepath.Join(cfg.StoragePath, "audio"), 0755)

	var s3Client *s3.Client
	if cfg.S3Endpoint != "" && cfg.S3AccessKey != "" && cfg.S3SecretKey != "" {
		customResolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
			return aws.Endpoint{
				URL:               cfg.S3Endpoint,
				SigningRegion:     cfg.S3Region,
				HostnameImmutable: true,
			}, nil
		})

		awsCfg, err := awsconfig.LoadDefaultConfig(context.Background(),
			awsconfig.WithRegion(cfg.S3Region),
			awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.S3AccessKey, cfg.S3SecretKey, "")),
			awsconfig.WithEndpointResolverWithOptions(customResolver),
		)
		if err == nil {
			s3Client = s3.NewFromConfig(awsCfg, func(o *s3.Options) {
				o.UsePathStyle = true
			})
			log.Printf("[MEDIA] Neon S3 Cloud Storage initialized for bucket '%s' at '%s'", cfg.S3Bucket, cfg.S3Endpoint)
		} else {
			log.Printf("[MEDIA] Warning: failed to initialize S3 config: %v", err)
		}
	}

	return &MediaHandler{Config: cfg, S3Client: s3Client}
}

// UploadPhoto handles profile photo uploads
func (h *MediaHandler) UploadPhoto(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)

	// Max 10MB
	r.Body = http.MaxBytesReader(w, r.Body, 10<<20)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "file size exceeds 10MB limit"})
		return
	}

	file, header, err := r.FormFile("photo")
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "photo file is required"})
		return
	}
	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to read photo file"})
		return
	}

	// Verify content type & extension (support iOS Safari HEIC, Android, web camera captures)
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext == "" || (ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" && ext != ".heic" && ext != ".heif") {
		detectedType := http.DetectContentType(fileBytes)
		if strings.HasPrefix(detectedType, "image/") {
			ext = ".jpg"
		} else {
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": "only image files (JPG, PNG, WebP) are permitted"})
			return
		}
	}
	if ext == ".jpeg" || ext == ".heic" || ext == ".heif" {
		ext = ".jpg"
	}

	fileName := fmt.Sprintf("%s_%s%s", userID, uuid.New().String()[:8], ext)
	dstPath := filepath.Join(h.Config.StoragePath, "photos", fileName)

	// 1. Save to local storage for fast local cache
	if err := os.WriteFile(dstPath, fileBytes, 0644); err != nil {
		log.Printf("[MEDIA] Local write warning: %v", err)
	}

	// 2. Persist to Neon S3 Cloud Storage
	if h.S3Client != nil {
		s3Key := "photos/" + fileName
		detectedType := http.DetectContentType(fileBytes)
		_, s3Err := h.S3Client.PutObject(r.Context(), &s3.PutObjectInput{
			Bucket:      aws.String(h.Config.S3Bucket),
			Key:         aws.String(s3Key),
			Body:        bytes.NewReader(fileBytes),
			ContentType: aws.String(detectedType),
		})
		if s3Err != nil {
			log.Printf("[MEDIA] Neon S3 upload warning: %v", s3Err)
		} else {
			log.Printf("[MEDIA] Successfully uploaded %s to Neon S3 (bucket: %s)", fileName, h.Config.S3Bucket)
		}
	}

	url := fmt.Sprintf("/uploads/photos/%s", fileName)
	respondJSON(w, http.StatusCreated, map[string]string{
		"url":       url,
		"file_name": fileName,
	})
}

// UploadAudio handles 30-second audio rant introductions
func (h *MediaHandler) UploadAudio(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)

	r.Body = http.MaxBytesReader(w, r.Body, 10<<20)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "audio file exceeds 10MB limit"})
		return
	}

	file, header, err := r.FormFile("audio")
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "audio file is required"})
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext != ".mp3" && ext != ".m4a" && ext != ".wav" && ext != ".webm" && ext != ".aac" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "only MP3, M4A, WAV, AAC, and WebM audio formats are permitted"})
		return
	}

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to read audio file"})
		return
	}

	fileName := fmt.Sprintf("rant_%s_%d%s", userID, time.Now().Unix(), ext)
	dstPath := filepath.Join(h.Config.StoragePath, "audio", fileName)

	// Save locally
	if err := os.WriteFile(dstPath, fileBytes, 0644); err != nil {
		log.Printf("[MEDIA] Local audio write warning: %v", err)
	}

	// Persist to Neon S3
	if h.S3Client != nil {
		s3Key := "audio/" + fileName
		detectedType := http.DetectContentType(fileBytes)
		_, s3Err := h.S3Client.PutObject(r.Context(), &s3.PutObjectInput{
			Bucket:      aws.String(h.Config.S3Bucket),
			Key:         aws.String(s3Key),
			Body:        bytes.NewReader(fileBytes),
			ContentType: aws.String(detectedType),
		})
		if s3Err != nil {
			log.Printf("[MEDIA] Neon S3 audio upload warning: %v", s3Err)
		} else {
			log.Printf("[MEDIA] Successfully uploaded audio %s to Neon S3 (bucket: %s)", fileName, h.Config.S3Bucket)
		}
	}

	url := fmt.Sprintf("/uploads/audio/%s", fileName)
	respondJSON(w, http.StatusCreated, map[string]string{
		"url":       url,
		"file_name": fileName,
	})
}

// ServeUpload serves requested file from local disk cache, or streams from Neon S3 if missing locally
func (h *MediaHandler) ServeUpload(w http.ResponseWriter, r *http.Request) {
	relPath := strings.TrimPrefix(r.URL.Path, "/uploads/")
	localPath := filepath.Join(h.Config.StoragePath, filepath.FromSlash(relPath))

	if _, err := os.Stat(localPath); err == nil {
		http.ServeFile(w, r, localPath)
		return
	}

	// Fallback to S3
	if h.S3Client != nil {
		s3Key := relPath
		obj, err := h.S3Client.GetObject(r.Context(), &s3.GetObjectInput{
			Bucket: aws.String(h.Config.S3Bucket),
			Key:    aws.String(s3Key),
		})
		if err == nil {
			defer obj.Body.Close()
			if obj.ContentType != nil {
				w.Header().Set("Content-Type", *obj.ContentType)
			}
			w.Header().Set("Cache-Control", "public, max-age=86400")
			io.Copy(w, obj.Body)
			return
		}
	}

	http.NotFound(w, r)
}
