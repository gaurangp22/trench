package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/trenchjob/backend/internal/domain"
	apperrors "github.com/trenchjob/backend/internal/pkg/errors"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, user *domain.User) error {
	query := `
		INSERT INTO users (
			id, email, username, password_hash, primary_wallet_address,
			is_client, is_freelancer, email_verified, wallet_verified,
			account_status, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
		)`

	user.ID = uuid.New()
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	if user.AccountStatus == "" {
		user.AccountStatus = domain.AccountStatusActive
	}

	_, err := r.db.Exec(ctx, query,
		user.ID, user.Email, user.Username, user.PasswordHash,
		user.PrimaryWalletAddress, user.IsClient, user.IsFreelancer,
		user.EmailVerified, user.WalletVerified, user.AccountStatus,
		user.CreatedAt, user.UpdatedAt,
	)

	return err
}

func (r *UserRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	query := `
		SELECT id, email, username, password_hash, primary_wallet_address,
			   is_client, is_freelancer, email_verified, wallet_verified,
			   account_status, created_at, updated_at, last_login_at
		FROM users WHERE id = $1`

	user := &domain.User{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID, &user.Email, &user.Username, &user.PasswordHash,
		&user.PrimaryWalletAddress, &user.IsClient, &user.IsFreelancer,
		&user.EmailVerified, &user.WalletVerified, &user.AccountStatus,
		&user.CreatedAt, &user.UpdatedAt, &user.LastLoginAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return user, err
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	query := `
		SELECT id, email, username, password_hash, primary_wallet_address,
			   is_client, is_freelancer, email_verified, wallet_verified,
			   account_status, created_at, updated_at, last_login_at
		FROM users WHERE LOWER(email) = LOWER($1)`

	user := &domain.User{}
	err := r.db.QueryRow(ctx, query, email).Scan(
		&user.ID, &user.Email, &user.Username, &user.PasswordHash,
		&user.PrimaryWalletAddress, &user.IsClient, &user.IsFreelancer,
		&user.EmailVerified, &user.WalletVerified, &user.AccountStatus,
		&user.CreatedAt, &user.UpdatedAt, &user.LastLoginAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return user, err
}

func (r *UserRepository) GetByUsername(ctx context.Context, username string) (*domain.User, error) {
	query := `
		SELECT id, email, username, password_hash, primary_wallet_address,
			   is_client, is_freelancer, email_verified, wallet_verified,
			   account_status, created_at, updated_at, last_login_at
		FROM users WHERE LOWER(username) = LOWER($1)`

	user := &domain.User{}
	err := r.db.QueryRow(ctx, query, username).Scan(
		&user.ID, &user.Email, &user.Username, &user.PasswordHash,
		&user.PrimaryWalletAddress, &user.IsClient, &user.IsFreelancer,
		&user.EmailVerified, &user.WalletVerified, &user.AccountStatus,
		&user.CreatedAt, &user.UpdatedAt, &user.LastLoginAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return user, err
}

func (r *UserRepository) GetByWalletAddress(ctx context.Context, walletAddress string) (*domain.User, error) {
	query := `
		SELECT u.id, u.email, u.username, u.password_hash, u.primary_wallet_address,
			   u.is_client, u.is_freelancer, u.email_verified, u.wallet_verified,
			   u.account_status, u.created_at, u.updated_at, u.last_login_at
		FROM users u
		LEFT JOIN user_wallets w ON u.id = w.user_id
		WHERE u.primary_wallet_address = $1 OR w.wallet_address = $1
		LIMIT 1`

	user := &domain.User{}
	err := r.db.QueryRow(ctx, query, walletAddress).Scan(
		&user.ID, &user.Email, &user.Username, &user.PasswordHash,
		&user.PrimaryWalletAddress, &user.IsClient, &user.IsFreelancer,
		&user.EmailVerified, &user.WalletVerified, &user.AccountStatus,
		&user.CreatedAt, &user.UpdatedAt, &user.LastLoginAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return user, err
}

func (r *UserRepository) Update(ctx context.Context, user *domain.User) error {
	query := `
		UPDATE users SET
			email = $2, username = $3, password_hash = $4,
			primary_wallet_address = $5, is_client = $6, is_freelancer = $7,
			email_verified = $8, wallet_verified = $9, account_status = $10,
			updated_at = $11, last_login_at = $12
		WHERE id = $1`

	user.UpdatedAt = time.Now()
	result, err := r.db.Exec(ctx, query,
		user.ID, user.Email, user.Username, user.PasswordHash,
		user.PrimaryWalletAddress, user.IsClient, user.IsFreelancer,
		user.EmailVerified, user.WalletVerified, user.AccountStatus,
		user.UpdatedAt, user.LastLoginAt,
	)

	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *UserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`
	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *UserRepository) EmailExists(ctx context.Context, email string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(email) = LOWER($1))`
	var exists bool
	err := r.db.QueryRow(ctx, query, email).Scan(&exists)
	return exists, err
}

func (r *UserRepository) UsernameExists(ctx context.Context, username string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(username) = LOWER($1))`
	var exists bool
	err := r.db.QueryRow(ctx, query, username).Scan(&exists)
	return exists, err
}

// WalletRepository implementation
type WalletRepository struct {
	db *pgxpool.Pool
}

func NewWalletRepository(db *pgxpool.Pool) *WalletRepository {
	return &WalletRepository{db: db}
}

func (r *WalletRepository) Create(ctx context.Context, wallet *domain.UserWallet) error {
	query := `
		INSERT INTO user_wallets (id, user_id, wallet_address, wallet_type, is_primary, verified_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`

	wallet.ID = uuid.New()
	wallet.CreatedAt = time.Now()

	_, err := r.db.Exec(ctx, query,
		wallet.ID, wallet.UserID, wallet.WalletAddress, wallet.WalletType,
		wallet.IsPrimary, wallet.VerifiedAt, wallet.CreatedAt,
	)
	return err
}

func (r *WalletRepository) GetByAddress(ctx context.Context, address string) (*domain.UserWallet, error) {
	query := `
		SELECT id, user_id, wallet_address, wallet_type, is_primary, verified_at, created_at
		FROM user_wallets WHERE wallet_address = $1`

	wallet := &domain.UserWallet{}
	err := r.db.QueryRow(ctx, query, address).Scan(
		&wallet.ID, &wallet.UserID, &wallet.WalletAddress, &wallet.WalletType,
		&wallet.IsPrimary, &wallet.VerifiedAt, &wallet.CreatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return wallet, err
}

func (r *WalletRepository) GetByUserID(ctx context.Context, userID uuid.UUID) ([]domain.UserWallet, error) {
	query := `
		SELECT id, user_id, wallet_address, wallet_type, is_primary, verified_at, created_at
		FROM user_wallets WHERE user_id = $1 ORDER BY created_at`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var wallets []domain.UserWallet
	for rows.Next() {
		var wallet domain.UserWallet
		if err := rows.Scan(
			&wallet.ID, &wallet.UserID, &wallet.WalletAddress, &wallet.WalletType,
			&wallet.IsPrimary, &wallet.VerifiedAt, &wallet.CreatedAt,
		); err != nil {
			return nil, err
		}
		wallets = append(wallets, wallet)
	}
	return wallets, rows.Err()
}

func (r *WalletRepository) SetPrimary(ctx context.Context, userID uuid.UUID, walletID uuid.UUID) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Unset all primary wallets for user
	_, err = tx.Exec(ctx, `UPDATE user_wallets SET is_primary = FALSE WHERE user_id = $1`, userID)
	if err != nil {
		return err
	}

	// Set the specified wallet as primary
	_, err = tx.Exec(ctx, `UPDATE user_wallets SET is_primary = TRUE WHERE id = $1 AND user_id = $2`, walletID, userID)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *WalletRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM user_wallets WHERE id = $1`
	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *WalletRepository) SaveNonce(ctx context.Context, walletAddress, nonce string) error {
	query := `
		INSERT INTO wallet_nonces (id, wallet_address, nonce, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (wallet_address) DO UPDATE SET nonce = $3, expires_at = $4`

	expiresAt := time.Now().Add(5 * time.Minute)
	_, err := r.db.Exec(ctx, query, uuid.New(), walletAddress, nonce, expiresAt, time.Now())
	return err
}

func (r *WalletRepository) GetNonce(ctx context.Context, walletAddress string) (string, error) {
	query := `SELECT nonce FROM wallet_nonces WHERE wallet_address = $1 AND expires_at > NOW()`

	var nonce string
	err := r.db.QueryRow(ctx, query, walletAddress).Scan(&nonce)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", apperrors.ErrNotFound
	}
	return nonce, err
}

func (r *WalletRepository) DeleteNonce(ctx context.Context, walletAddress string) error {
	query := `DELETE FROM wallet_nonces WHERE wallet_address = $1`
	_, err := r.db.Exec(ctx, query, walletAddress)
	return err
}

// SessionRepository implementation
type SessionRepository struct {
	db *pgxpool.Pool
}

func NewSessionRepository(db *pgxpool.Pool) *SessionRepository {
	return &SessionRepository{db: db}
}

func (r *SessionRepository) Create(ctx context.Context, session *domain.AuthSession) error {
	query := `
		INSERT INTO auth_sessions (id, user_id, session_token, wallet_address, ip_address, user_agent, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

	session.ID = uuid.New()
	session.CreatedAt = time.Now()

	_, err := r.db.Exec(ctx, query,
		session.ID, session.UserID, session.SessionToken, session.WalletAddress,
		session.IPAddress, session.UserAgent, session.ExpiresAt, session.CreatedAt,
	)
	return err
}

func (r *SessionRepository) GetByToken(ctx context.Context, token string) (*domain.AuthSession, error) {
	query := `
		SELECT id, user_id, session_token, wallet_address, ip_address, user_agent, expires_at, created_at
		FROM auth_sessions WHERE session_token = $1 AND expires_at > NOW()`

	session := &domain.AuthSession{}
	err := r.db.QueryRow(ctx, query, token).Scan(
		&session.ID, &session.UserID, &session.SessionToken, &session.WalletAddress,
		&session.IPAddress, &session.UserAgent, &session.ExpiresAt, &session.CreatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return session, err
}

func (r *SessionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM auth_sessions WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *SessionRepository) DeleteByUserID(ctx context.Context, userID uuid.UUID) error {
	query := `DELETE FROM auth_sessions WHERE user_id = $1`
	_, err := r.db.Exec(ctx, query, userID)
	return err
}

func (r *SessionRepository) DeleteExpired(ctx context.Context) error {
	query := `DELETE FROM auth_sessions WHERE expires_at < NOW()`
	_, err := r.db.Exec(ctx, query)
	return err
}
