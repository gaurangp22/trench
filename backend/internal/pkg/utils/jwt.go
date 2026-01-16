package utils

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type JWTClaims struct {
	UserID       uuid.UUID `json:"user_id"`
	Email        string    `json:"email"`
	Username     string    `json:"username"`
	IsClient     bool      `json:"is_client"`
	IsFreelancer bool      `json:"is_freelancer"`
	jwt.RegisteredClaims
}

type JWTManager struct {
	secretKey   []byte
	expireHours int
}

func NewJWTManager(secret string, expireHours int) *JWTManager {
	return &JWTManager{
		secretKey:   []byte(secret),
		expireHours: expireHours,
	}
}

// GenerateToken creates a new JWT token for a user
func (j *JWTManager) GenerateToken(userID uuid.UUID, email, username string, isClient, isFreelancer bool) (string, time.Time, error) {
	expiresAt := time.Now().Add(time.Duration(j.expireHours) * time.Hour)

	claims := &JWTClaims{
		UserID:       userID,
		Email:        email,
		Username:     username,
		IsClient:     isClient,
		IsFreelancer: isFreelancer,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "trenchjob",
			Subject:   userID.String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(j.secretKey)
	if err != nil {
		return "", time.Time{}, fmt.Errorf("failed to sign token: %w", err)
	}

	return tokenString, expiresAt, nil
}

// ValidateToken validates and parses a JWT token
func (j *JWTManager) ValidateToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return j.secretKey, nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}

// RefreshToken creates a new token with extended expiry
func (j *JWTManager) RefreshToken(claims *JWTClaims) (string, time.Time, error) {
	return j.GenerateToken(
		claims.UserID,
		claims.Email,
		claims.Username,
		claims.IsClient,
		claims.IsFreelancer,
	)
}
