package domain

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                   uuid.UUID  `json:"id" db:"id"`
	Email                string     `json:"email" db:"email"`
	Username             string     `json:"username" db:"username"`
	PasswordHash         string     `json:"-" db:"password_hash"`
	PrimaryWalletAddress *string    `json:"primary_wallet_address" db:"primary_wallet_address"`
	IsClient             bool       `json:"is_client" db:"is_client"`
	IsFreelancer         bool       `json:"is_freelancer" db:"is_freelancer"`
	EmailVerified        bool       `json:"email_verified" db:"email_verified"`
	WalletVerified       bool       `json:"wallet_verified" db:"wallet_verified"`
	AccountStatus        string     `json:"account_status" db:"account_status"`
	CreatedAt            time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at" db:"updated_at"`
	LastLoginAt          *time.Time `json:"last_login_at" db:"last_login_at"`

	// Joined/computed fields (not stored in users table)
	DisplayName string  `json:"display_name,omitempty" db:"-"`
	AvatarURL   *string `json:"avatar_url,omitempty" db:"-"`
}

type UserWallet struct {
	ID            uuid.UUID  `json:"id" db:"id"`
	UserID        uuid.UUID  `json:"user_id" db:"user_id"`
	WalletAddress string     `json:"wallet_address" db:"wallet_address"`
	WalletType    string     `json:"wallet_type" db:"wallet_type"`
	IsPrimary     bool       `json:"is_primary" db:"is_primary"`
	VerifiedAt    *time.Time `json:"verified_at" db:"verified_at"`
	CreatedAt     time.Time  `json:"created_at" db:"created_at"`
}

type AuthSession struct {
	ID            uuid.UUID  `json:"id" db:"id"`
	UserID        uuid.UUID  `json:"user_id" db:"user_id"`
	SessionToken  string     `json:"session_token" db:"session_token"`
	WalletAddress *string    `json:"wallet_address" db:"wallet_address"`
	IPAddress     *string    `json:"ip_address" db:"ip_address"`
	UserAgent     *string    `json:"user_agent" db:"user_agent"`
	ExpiresAt     time.Time  `json:"expires_at" db:"expires_at"`
	CreatedAt     time.Time  `json:"created_at" db:"created_at"`
}

// Account status constants
const (
	AccountStatusActive    = "active"
	AccountStatusSuspended = "suspended"
	AccountStatusBanned    = "banned"
)

// Wallet type constants
const (
	WalletTypePhantom  = "phantom"
	WalletTypeSolflare = "solflare"
	WalletTypeOther    = "other"
)
