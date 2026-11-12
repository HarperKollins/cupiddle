package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/cupiddle/server/internal/config"
	"github.com/cupiddle/server/internal/middleware"
	"github.com/google/uuid"
)

// MediaHandler handles multipart media uploads
type MediaHandler struct {
	Config *config.Config
}

// NewMediaHandler creates a new MediaHandler
func NewMediaHandler(cfg *config.Config) *MediaHandler {
	// Ensure upload directory exists
	os.MkdirAll(cfg.StoragePath, 0755)
	os.MkdirAll(filepath.Join(cfg.StoragePath, "photos"), 0755)
	os.MkdirAll(filepath.Join(cfg.StoragePath, "audio"), 0755)
	return &MediaHandler{Config: cfg}
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

	// Verify content type
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "only JPG, PNG, and WebP images are permitted"})
		return
	}

	fileName := fmt.Sprintf("%s_%s%s", userID, uuid.New().String()[:8], ext)
	dstPath := filepath.Join(h.Config.StoragePath, "photos", fileName)

	dst, err := os.Create(dstPath)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save photo"})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to write photo file"})
		return
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

	fileName := fmt.Sprintf("rant_%s_%d%s", userID, time.Now().Unix(), ext)
	dstPath := filepath.Join(h.Config.StoragePath, "audio", fileName)

	dst, err := os.Create(dstPath)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save audio"})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to write audio file"})
		return
	}

	url := fmt.Sprintf("/uploads/audio/%s", fileName)
	respondJSON(w, http.StatusCreated, map[string]string{
		"url":       url,
		"file_name": fileName,
	})
}

