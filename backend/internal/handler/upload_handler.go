package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/trenchjob/backend/internal/middleware"
)

type UploadHandler struct {
	uploadDir string
	baseURL   string
}

func NewUploadHandler(uploadDir, baseURL string) *UploadHandler {
	// Ensure upload directory exists
	os.MkdirAll(uploadDir, 0755)
	return &UploadHandler{
		uploadDir: uploadDir,
		baseURL:   baseURL,
	}
}

// UploadFile handles POST /api/v1/upload
func (h *UploadHandler) UploadFile(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Max file size: 5MB
	r.Body = http.MaxBytesReader(w, r.Body, 5*1024*1024)

	// Parse multipart form
	if err := r.ParseMultipartForm(5 << 20); err != nil {
		writeError(w, http.StatusBadRequest, "file too large or invalid form data")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "no file provided")
		return
	}
	defer file.Close()

	// Validate file type
	contentType := header.Header.Get("Content-Type")
	allowedTypes := map[string]string{
		"image/jpeg": ".jpg",
		"image/png":  ".png",
		"image/gif":  ".gif",
		"image/webp": ".webp",
	}

	ext, ok := allowedTypes[contentType]
	if !ok {
		writeError(w, http.StatusBadRequest, "invalid file type. allowed: jpg, png, gif, webp")
		return
	}

	// Generate unique filename
	filename := fmt.Sprintf("%s_%d%s", uuid.New().String()[:8], time.Now().Unix(), ext)

	// Create file path
	filePath := filepath.Join(h.uploadDir, filename)

	// Create destination file
	dst, err := os.Create(filePath)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save file")
		return
	}
	defer dst.Close()

	// Copy file contents
	if _, err := io.Copy(dst, file); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save file")
		return
	}

	// Build URL
	url := strings.TrimSuffix(h.baseURL, "/") + "/uploads/" + filename

	writeJSON(w, http.StatusOK, map[string]string{
		"url":      url,
		"filename": filename,
	})
}

// ServeFile handles GET /uploads/{filename}
func (h *UploadHandler) ServeFile(w http.ResponseWriter, r *http.Request) {
	// Extract filename from path
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 2 {
		writeError(w, http.StatusBadRequest, "invalid file path")
		return
	}

	filename := parts[len(parts)-1]

	// Sanitize filename
	filename = filepath.Base(filename)
	if strings.Contains(filename, "..") {
		writeError(w, http.StatusBadRequest, "invalid file path")
		return
	}

	filePath := filepath.Join(h.uploadDir, filename)

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		writeError(w, http.StatusNotFound, "file not found")
		return
	}

	// Set content type based on extension
	ext := filepath.Ext(filename)
	contentTypes := map[string]string{
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".png":  "image/png",
		".gif":  "image/gif",
		".webp": "image/webp",
	}

	if ct, ok := contentTypes[ext]; ok {
		w.Header().Set("Content-Type", ct)
	}

	// Set cache headers
	w.Header().Set("Cache-Control", "public, max-age=31536000")

	http.ServeFile(w, r, filePath)
}
