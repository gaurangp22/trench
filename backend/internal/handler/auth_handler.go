package handler

import (
	"encoding/json"
	"net/http"

	"github.com/trenchjob/backend/internal/middleware"
	apperrors "github.com/trenchjob/backend/internal/pkg/errors"
	"github.com/trenchjob/backend/internal/service"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// Signup handles user registration
func (h *AuthHandler) Signup(w http.ResponseWriter, r *http.Request) {
	var req service.SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	resp, err := h.authService.Signup(r.Context(), &req)
	if err != nil {
		handleAppError(w, err)
		return
	}

	respondJSON(w, http.StatusCreated, resp)
}

// Login handles user authentication
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req service.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	resp, err := h.authService.Login(r.Context(), &req)
	if err != nil {
		handleAppError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, resp)
}

// GetNonce returns a nonce for wallet authentication
func (h *AuthHandler) GetNonce(w http.ResponseWriter, r *http.Request) {
	walletAddress := r.URL.Query().Get("wallet_address")
	if walletAddress == "" {
		respondError(w, http.StatusBadRequest, "wallet_address query parameter required")
		return
	}

	nonce, err := h.authService.GetNonce(r.Context(), walletAddress)
	if err != nil {
		handleAppError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"nonce":   nonce,
		"message": "Sign this message to verify your wallet ownership: " + nonce,
	})
}

// WalletLogin handles wallet-based authentication
func (h *AuthHandler) WalletLogin(w http.ResponseWriter, r *http.Request) {
	var req service.WalletLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	resp, err := h.authService.WalletLogin(r.Context(), &req)
	if err != nil {
		handleAppError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, resp)
}

// ConnectWallet links a wallet to the authenticated user's account
func (h *AuthHandler) ConnectWallet(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req struct {
		WalletAddress string `json:"wallet_address"`
		WalletType    string `json:"wallet_type"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.WalletType == "" {
		req.WalletType = "phantom"
	}

	err := h.authService.ConnectWallet(r.Context(), claims.UserID, req.WalletAddress, req.WalletType)
	if err != nil {
		handleAppError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "wallet connected successfully"})
}

// GetWallets returns all wallets for the authenticated user
func (h *AuthHandler) GetWallets(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	wallets, err := h.authService.GetUserWallets(r.Context(), claims.UserID)
	if err != nil {
		handleAppError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{"wallets": wallets})
}

// DisconnectWallet removes a wallet from the authenticated user's account
func (h *AuthHandler) DisconnectWallet(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Get wallet address from URL path
	// This would normally come from a router like chi or gorilla/mux
	walletAddress := r.URL.Query().Get("address")
	if walletAddress == "" {
		respondError(w, http.StatusBadRequest, "wallet address required")
		return
	}

	err := h.authService.DisconnectWallet(r.Context(), claims.UserID, walletAddress)
	if err != nil {
		handleAppError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "wallet disconnected successfully"})
}

// RefreshToken generates a new token
func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	resp, err := h.authService.RefreshToken(r.Context(), claims)
	if err != nil {
		handleAppError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, resp)
}

// Logout invalidates the user's session (client should discard token)
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// Since we use JWTs, logout is primarily handled client-side
	// The token should be removed from local storage
	respondJSON(w, http.StatusOK, map[string]string{"message": "logged out successfully"})
}

// Helper functions

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if data != nil {
		json.NewEncoder(w).Encode(data)
	}
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}

func handleAppError(w http.ResponseWriter, err error) {
	appErr := apperrors.GetAppError(err)
	if appErr != nil {
		response := map[string]interface{}{"error": appErr.Message}
		if appErr.Details != nil {
			response["details"] = appErr.Details
		}
		respondJSON(w, appErr.StatusCode, response)
		return
	}
	respondError(w, http.StatusInternalServerError, "internal server error")
}
