package handler

import (
	"encoding/json"
	"net/http"

	apperrors "github.com/trenchjob/backend/internal/pkg/errors"
)

// Common HTTP response helper functions

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if data != nil {
		json.NewEncoder(w).Encode(data)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func handleError(w http.ResponseWriter, err error) {
	appErr := apperrors.GetAppError(err)
	if appErr != nil {
		response := map[string]interface{}{"error": appErr.Message}
		if appErr.Details != nil {
			response["details"] = appErr.Details
		}
		writeJSON(w, appErr.StatusCode, response)
		return
	}
	writeError(w, http.StatusInternalServerError, "internal server error")
}
