package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/trenchjob/backend/internal/domain"
	apperrors "github.com/trenchjob/backend/internal/pkg/errors"
	"github.com/trenchjob/backend/internal/pkg/utils"
	"github.com/trenchjob/backend/internal/pkg/validator"
	"github.com/trenchjob/backend/internal/repository"
)

type AuthService struct {
	userRepo    repository.UserRepository
	walletRepo  repository.WalletRepository
	sessionRepo repository.SessionRepository
	jwtManager  *utils.JWTManager
}

func NewAuthService(
	userRepo repository.UserRepository,
	walletRepo repository.WalletRepository,
	sessionRepo repository.SessionRepository,
	jwtManager *utils.JWTManager,
) *AuthService {
	return &AuthService{
		userRepo:    userRepo,
		walletRepo:  walletRepo,
		sessionRepo: sessionRepo,
		jwtManager:  jwtManager,
	}
}

type SignupRequest struct {
	Email         string `json:"email"`
	Username      string `json:"username"`
	Password      string `json:"password"`
	IsClient      bool   `json:"is_client"`
	IsFreelancer  bool   `json:"is_freelancer"`
	WalletAddress string `json:"wallet_address,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type WalletLoginRequest struct {
	WalletAddress string `json:"wallet_address"`
	Signature     string `json:"signature"`
	Message       string `json:"message"`
}

type AuthResponse struct {
	User      *domain.User `json:"user"`
	Token     string       `json:"token"`
	ExpiresAt time.Time    `json:"expires_at"`
}

// Signup creates a new user account
func (s *AuthService) Signup(ctx context.Context, req *SignupRequest) (*AuthResponse, error) {
	// Validate input
	v := validator.New().
		Required(req.Email, "email").
		Email(req.Email, "email").
		Required(req.Username, "username").
		Username(req.Username, "username").
		Required(req.Password, "password").
		Password(req.Password, "password")

	if req.WalletAddress != "" {
		v.WalletAddress(req.WalletAddress, "wallet_address")
	}

	if !v.Valid() {
		return nil, apperrors.NewValidation(map[string]interface{}{"errors": v.Errors().ToMap()})
	}

	// Check if at least one role is selected
	if !req.IsClient && !req.IsFreelancer {
		return nil, apperrors.NewBadRequest("must select at least one role (client or freelancer)")
	}

	// Check if email already exists
	emailExists, err := s.userRepo.EmailExists(ctx, req.Email)
	if err != nil {
		return nil, apperrors.NewInternal(err)
	}
	if emailExists {
		return nil, apperrors.NewConflict("email already registered")
	}

	// Check if username already exists
	usernameExists, err := s.userRepo.UsernameExists(ctx, req.Username)
	if err != nil {
		return nil, apperrors.NewInternal(err)
	}
	if usernameExists {
		return nil, apperrors.NewConflict("username already taken")
	}

	// Hash password
	passwordHash, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, apperrors.NewInternal(err)
	}

	// Create user
	user := &domain.User{
		Email:                req.Email,
		Username:             req.Username,
		PasswordHash:         passwordHash,
		IsClient:             req.IsClient,
		IsFreelancer:         req.IsFreelancer,
		AccountStatus:        domain.AccountStatusActive,
	}

	if req.WalletAddress != "" {
		user.PrimaryWalletAddress = &req.WalletAddress
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, apperrors.NewInternal(err)
	}

	// If wallet address provided, create wallet entry
	if req.WalletAddress != "" {
		now := time.Now()
		wallet := &domain.UserWallet{
			UserID:        user.ID,
			WalletAddress: req.WalletAddress,
			WalletType:    domain.WalletTypePhantom, // Default, can be updated
			IsPrimary:     true,
			VerifiedAt:    &now,
		}
		if err := s.walletRepo.Create(ctx, wallet); err != nil {
			// Log error but don't fail signup
			fmt.Printf("failed to create wallet entry: %v\n", err)
		}
	}

	// Generate JWT token
	token, expiresAt, err := s.jwtManager.GenerateToken(
		user.ID, user.Email, user.Username, user.IsClient, user.IsFreelancer,
	)
	if err != nil {
		return nil, apperrors.NewInternal(err)
	}

	return &AuthResponse{
		User:      user,
		Token:     token,
		ExpiresAt: expiresAt,
	}, nil
}

// Login authenticates a user with email and password
func (s *AuthService) Login(ctx context.Context, req *LoginRequest) (*AuthResponse, error) {
	// Validate input
	v := validator.New().
		Required(req.Email, "email").
		Required(req.Password, "password")

	if !v.Valid() {
		return nil, apperrors.NewValidation(map[string]interface{}{"errors": v.Errors().ToMap()})
	}

	// Get user by email
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.NewUnauthorized("invalid credentials")
		}
		return nil, apperrors.NewInternal(err)
	}

	// Check password
	if !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
		return nil, apperrors.NewUnauthorized("invalid credentials")
	}

	// Check account status
	if user.AccountStatus != domain.AccountStatusActive {
		return nil, apperrors.NewForbidden("account is " + user.AccountStatus)
	}

	// Update last login
	now := time.Now()
	user.LastLoginAt = &now
	if err := s.userRepo.Update(ctx, user); err != nil {
		// Log error but don't fail login
		fmt.Printf("failed to update last login: %v\n", err)
	}

	// Generate JWT token
	token, expiresAt, err := s.jwtManager.GenerateToken(
		user.ID, user.Email, user.Username, user.IsClient, user.IsFreelancer,
	)
	if err != nil {
		return nil, apperrors.NewInternal(err)
	}

	return &AuthResponse{
		User:      user,
		Token:     token,
		ExpiresAt: expiresAt,
	}, nil
}

// GetNonce generates a nonce for wallet authentication
func (s *AuthService) GetNonce(ctx context.Context, walletAddress string) (string, error) {
	if !validator.ValidateWalletAddress(walletAddress) {
		return "", apperrors.NewBadRequest("invalid wallet address")
	}

	nonce, err := utils.GenerateNonce()
	if err != nil {
		return "", apperrors.NewInternal(err)
	}

	if err := s.walletRepo.SaveNonce(ctx, walletAddress, nonce); err != nil {
		return "", apperrors.NewInternal(err)
	}

	return nonce, nil
}

// WalletLogin authenticates a user with their wallet signature
func (s *AuthService) WalletLogin(ctx context.Context, req *WalletLoginRequest) (*AuthResponse, error) {
	// Validate wallet address
	if !validator.ValidateWalletAddress(req.WalletAddress) {
		return nil, apperrors.NewBadRequest("invalid wallet address")
	}

	// Get stored nonce
	storedNonce, err := s.walletRepo.GetNonce(ctx, req.WalletAddress)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.NewBadRequest("nonce expired or not found, please request a new one")
		}
		return nil, apperrors.NewInternal(err)
	}

	// Verify the message contains the nonce
	// In production, you'd verify the actual signature using ed25519
	// For now, we'll do a simplified check
	if req.Message == "" || req.Signature == "" {
		return nil, apperrors.NewBadRequest("message and signature are required")
	}

	// TODO: Implement actual signature verification using ed25519
	// The signature should be verified against the message using the wallet's public key
	_ = storedNonce // Use nonce in actual verification

	// Delete the nonce (one-time use)
	_ = s.walletRepo.DeleteNonce(ctx, req.WalletAddress)

	// Get user by wallet address
	user, err := s.userRepo.GetByWalletAddress(ctx, req.WalletAddress)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.NewNotFound("wallet not registered, please sign up first")
		}
		return nil, apperrors.NewInternal(err)
	}

	// Check account status
	if user.AccountStatus != domain.AccountStatusActive {
		return nil, apperrors.NewForbidden("account is " + user.AccountStatus)
	}

	// Update last login
	now := time.Now()
	user.LastLoginAt = &now
	if err := s.userRepo.Update(ctx, user); err != nil {
		fmt.Printf("failed to update last login: %v\n", err)
	}

	// Generate JWT token
	token, expiresAt, err := s.jwtManager.GenerateToken(
		user.ID, user.Email, user.Username, user.IsClient, user.IsFreelancer,
	)
	if err != nil {
		return nil, apperrors.NewInternal(err)
	}

	return &AuthResponse{
		User:      user,
		Token:     token,
		ExpiresAt: expiresAt,
	}, nil
}

// ConnectWallet links a wallet to an existing user account
func (s *AuthService) ConnectWallet(ctx context.Context, userID uuid.UUID, walletAddress, walletType string) error {
	if !validator.ValidateWalletAddress(walletAddress) {
		return apperrors.NewBadRequest("invalid wallet address")
	}

	// Check if wallet is already connected to another account
	existingWallet, err := s.walletRepo.GetByAddress(ctx, walletAddress)
	if err == nil && existingWallet != nil {
		if existingWallet.UserID != userID {
			return apperrors.NewConflict("wallet already connected to another account")
		}
		return nil // Already connected to this user
	}

	// Get user's existing wallets
	existingWallets, err := s.walletRepo.GetByUserID(ctx, userID)
	if err != nil {
		return apperrors.NewInternal(err)
	}

	isPrimary := len(existingWallets) == 0 // First wallet is primary

	now := time.Now()
	wallet := &domain.UserWallet{
		UserID:        userID,
		WalletAddress: walletAddress,
		WalletType:    walletType,
		IsPrimary:     isPrimary,
		VerifiedAt:    &now,
	}

	if err := s.walletRepo.Create(ctx, wallet); err != nil {
		return apperrors.NewInternal(err)
	}

	// If this is the first/primary wallet, update user's primary wallet address
	if isPrimary {
		user, err := s.userRepo.GetByID(ctx, userID)
		if err != nil {
			return apperrors.NewInternal(err)
		}
		user.PrimaryWalletAddress = &walletAddress
		user.WalletVerified = true
		if err := s.userRepo.Update(ctx, user); err != nil {
			return apperrors.NewInternal(err)
		}
	}

	return nil
}

// GetUserWallets returns all wallets for a user
func (s *AuthService) GetUserWallets(ctx context.Context, userID uuid.UUID) ([]domain.UserWallet, error) {
	wallets, err := s.walletRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, apperrors.NewInternal(err)
	}
	return wallets, nil
}

// DisconnectWallet removes a wallet from a user account
func (s *AuthService) DisconnectWallet(ctx context.Context, userID uuid.UUID, walletAddress string) error {
	wallet, err := s.walletRepo.GetByAddress(ctx, walletAddress)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return apperrors.NewNotFound("wallet")
		}
		return apperrors.NewInternal(err)
	}

	if wallet.UserID != userID {
		return apperrors.NewForbidden("wallet does not belong to this user")
	}

	// Get all user wallets
	wallets, err := s.walletRepo.GetByUserID(ctx, userID)
	if err != nil {
		return apperrors.NewInternal(err)
	}

	if len(wallets) == 1 {
		return apperrors.NewBadRequest("cannot remove the only wallet")
	}

	if err := s.walletRepo.Delete(ctx, wallet.ID); err != nil {
		return apperrors.NewInternal(err)
	}

	// If this was the primary wallet, set another as primary
	if wallet.IsPrimary {
		for _, w := range wallets {
			if w.ID != wallet.ID {
				if err := s.walletRepo.SetPrimary(ctx, userID, w.ID); err != nil {
					fmt.Printf("failed to set new primary wallet: %v\n", err)
				}

				// Update user's primary wallet address
				user, err := s.userRepo.GetByID(ctx, userID)
				if err == nil {
					user.PrimaryWalletAddress = &w.WalletAddress
					_ = s.userRepo.Update(ctx, user)
				}
				break
			}
		}
	}

	return nil
}

// RefreshToken generates a new token from an existing valid token
func (s *AuthService) RefreshToken(ctx context.Context, claims *utils.JWTClaims) (*AuthResponse, error) {
	// Get fresh user data
	user, err := s.userRepo.GetByID(ctx, claims.UserID)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.NewUnauthorized("user not found")
		}
		return nil, apperrors.NewInternal(err)
	}

	// Check account status
	if user.AccountStatus != domain.AccountStatusActive {
		return nil, apperrors.NewForbidden("account is " + user.AccountStatus)
	}

	// Generate new token
	token, expiresAt, err := s.jwtManager.GenerateToken(
		user.ID, user.Email, user.Username, user.IsClient, user.IsFreelancer,
	)
	if err != nil {
		return nil, apperrors.NewInternal(err)
	}

	return &AuthResponse{
		User:      user,
		Token:     token,
		ExpiresAt: expiresAt,
	}, nil
}
