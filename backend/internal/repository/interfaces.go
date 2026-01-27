package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/trenchjob/backend/internal/domain"
)

// UserRepository defines user data access methods
type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
	GetByEmail(ctx context.Context, email string) (*domain.User, error)
	GetByUsername(ctx context.Context, username string) (*domain.User, error)
	GetByWalletAddress(ctx context.Context, walletAddress string) (*domain.User, error)
	Update(ctx context.Context, user *domain.User) error
	Delete(ctx context.Context, id uuid.UUID) error
	EmailExists(ctx context.Context, email string) (bool, error)
	UsernameExists(ctx context.Context, username string) (bool, error)
}

// WalletRepository defines wallet data access methods
type WalletRepository interface {
	Create(ctx context.Context, wallet *domain.UserWallet) error
	GetByAddress(ctx context.Context, address string) (*domain.UserWallet, error)
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]domain.UserWallet, error)
	SetPrimary(ctx context.Context, userID uuid.UUID, walletID uuid.UUID) error
	Delete(ctx context.Context, id uuid.UUID) error
	SaveNonce(ctx context.Context, walletAddress, nonce string) error
	GetNonce(ctx context.Context, walletAddress string) (string, error)
	DeleteNonce(ctx context.Context, walletAddress string) error
}

// SessionRepository defines session data access methods
type SessionRepository interface {
	Create(ctx context.Context, session *domain.AuthSession) error
	GetByToken(ctx context.Context, token string) (*domain.AuthSession, error)
	Delete(ctx context.Context, id uuid.UUID) error
	DeleteByUserID(ctx context.Context, userID uuid.UUID) error
	DeleteExpired(ctx context.Context) error
}

// ProfileRepository defines profile data access methods
type ProfileRepository interface {
	Create(ctx context.Context, profile *domain.Profile) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Profile, error)
	GetByUserID(ctx context.Context, userID uuid.UUID) (*domain.Profile, error)
	Update(ctx context.Context, profile *domain.Profile) error
	Search(ctx context.Context, query string, skills []int, limit, offset int) ([]domain.Profile, int, error)
	GetSkills(ctx context.Context, profileID uuid.UUID) ([]domain.ProfileSkill, error)
	AddSkill(ctx context.Context, ps *domain.ProfileSkill) error
	RemoveSkill(ctx context.Context, profileID uuid.UUID, skillID int) error
	SetSkills(ctx context.Context, profileID uuid.UUID, skills []domain.ProfileSkill) error
}

// PortfolioRepository defines portfolio data access methods
type PortfolioRepository interface {
	Create(ctx context.Context, item *domain.PortfolioItem) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.PortfolioItem, error)
	GetByProfileID(ctx context.Context, profileID uuid.UUID) ([]domain.PortfolioItem, error)
	Update(ctx context.Context, item *domain.PortfolioItem) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// SocialRepository defines social links data access methods
type SocialRepository interface {
	GetByProfileID(ctx context.Context, profileID uuid.UUID) ([]domain.ProfileSocial, error)
	Upsert(ctx context.Context, social *domain.ProfileSocial) error
	Delete(ctx context.Context, profileID uuid.UUID, platform string) error
	DeleteAllByProfileID(ctx context.Context, profileID uuid.UUID) error
}

// TokenWorkRepository defines token work items data access methods
type TokenWorkRepository interface {
	Create(ctx context.Context, item *domain.TokenWorkItem) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.TokenWorkItem, error)
	GetByProfileID(ctx context.Context, profileID uuid.UUID) ([]domain.TokenWorkItem, error)
	Update(ctx context.Context, item *domain.TokenWorkItem) error
	Delete(ctx context.Context, id uuid.UUID) error
}


// SkillRepository defines skill data access methods
type SkillRepository interface {
	GetAll(ctx context.Context) ([]domain.Skill, error)
	GetByID(ctx context.Context, id int) (*domain.Skill, error)
	GetByCategory(ctx context.Context, category string) ([]domain.Skill, error)
	Search(ctx context.Context, query string) ([]domain.Skill, error)
}

// JobRepository defines job data access methods
type JobRepository interface {
	Create(ctx context.Context, job *domain.Job) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Job, error)
	GetByClientID(ctx context.Context, clientID uuid.UUID, limit, offset int) ([]domain.Job, int, error)
	Update(ctx context.Context, job *domain.Job) error
	Delete(ctx context.Context, id uuid.UUID) error
	Search(ctx context.Context, query string, categoryID *int, skills []int, status string, limit, offset int) ([]domain.Job, int, error)
	IncrementViews(ctx context.Context, id uuid.UUID) error
	AddSkills(ctx context.Context, jobID uuid.UUID, skillIDs []int) error
	RemoveSkills(ctx context.Context, jobID uuid.UUID) error
	GetSkills(ctx context.Context, jobID uuid.UUID) ([]domain.Skill, error)
}

// ProposalRepository defines proposal data access methods
type ProposalRepository interface {
	Create(ctx context.Context, proposal *domain.Proposal) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Proposal, error)
	GetByJobID(ctx context.Context, jobID uuid.UUID, limit, offset int) ([]domain.Proposal, int, error)
	GetByFreelancerID(ctx context.Context, freelancerID uuid.UUID, limit, offset int) ([]domain.Proposal, int, error)
	Update(ctx context.Context, proposal *domain.Proposal) error
	Delete(ctx context.Context, id uuid.UUID) error
	Exists(ctx context.Context, jobID, freelancerID uuid.UUID) (bool, error)
}

// ContractRepository defines contract data access methods
type ContractRepository interface {
	Create(ctx context.Context, contract *domain.Contract) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Contract, error)
	GetByClientID(ctx context.Context, clientID uuid.UUID, status string, limit, offset int) ([]domain.Contract, int, error)
	GetByFreelancerID(ctx context.Context, freelancerID uuid.UUID, status string, limit, offset int) ([]domain.Contract, int, error)
	Update(ctx context.Context, contract *domain.Contract) error
}

// MilestoneRepository defines milestone data access methods
type MilestoneRepository interface {
	Create(ctx context.Context, milestone *domain.Milestone) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Milestone, error)
	GetByContractID(ctx context.Context, contractID uuid.UUID) ([]domain.Milestone, error)
	Update(ctx context.Context, milestone *domain.Milestone) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// EscrowRepository defines escrow data access methods
type EscrowRepository interface {
	Create(ctx context.Context, escrow *domain.Escrow) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Escrow, error)
	GetByContractID(ctx context.Context, contractID uuid.UUID) (*domain.Escrow, error)
	GetByPDA(ctx context.Context, pda string) (*domain.Escrow, error)
	Update(ctx context.Context, escrow *domain.Escrow) error
	CreateLog(ctx context.Context, log *domain.EscrowLog) error
}

// PaymentRepository defines payment data access methods
type PaymentRepository interface {
	Create(ctx context.Context, payment *domain.Payment) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Payment, error)
	GetByContractID(ctx context.Context, contractID uuid.UUID) ([]domain.Payment, error)
	GetByTxSignature(ctx context.Context, txSignature string) (*domain.Payment, error)
	Update(ctx context.Context, payment *domain.Payment) error
}

// ConversationRepository defines conversation data access methods
type ConversationRepository interface {
	Create(ctx context.Context, conversation *domain.Conversation) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Conversation, error)
	GetByUserID(ctx context.Context, userID uuid.UUID, limit, offset int) ([]domain.Conversation, int, error)
	GetByContractID(ctx context.Context, contractID uuid.UUID) (*domain.Conversation, error)
	AddParticipant(ctx context.Context, conversationID, userID uuid.UUID) error
	GetParticipants(ctx context.Context, conversationID uuid.UUID) ([]domain.ConversationParticipant, error)
	UpdateLastRead(ctx context.Context, conversationID, userID uuid.UUID) error
	IsParticipant(ctx context.Context, conversationID, userID uuid.UUID) (bool, error)
}

// MessageRepository defines message data access methods
type MessageRepository interface {
	Create(ctx context.Context, message *domain.Message) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Message, error)
	GetByConversationID(ctx context.Context, conversationID uuid.UUID, limit, offset int) ([]domain.Message, int, error)
	Update(ctx context.Context, message *domain.Message) error
	Delete(ctx context.Context, id uuid.UUID) error
	GetLastMessage(ctx context.Context, conversationID uuid.UUID) (*domain.Message, error)
	GetUnreadCount(ctx context.Context, userID uuid.UUID) (int, error)
}

// ReviewRepository defines review data access methods
type ReviewRepository interface {
	Create(ctx context.Context, review *domain.Review) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Review, error)
	GetByContractID(ctx context.Context, contractID uuid.UUID) ([]domain.Review, error)
	GetByRevieweeID(ctx context.Context, revieweeID uuid.UUID, limit, offset int) ([]domain.Review, int, error)
	Exists(ctx context.Context, contractID, reviewerID uuid.UUID) (bool, error)
}

// NotificationRepository defines notification data access methods
type NotificationRepository interface {
	Create(ctx context.Context, notification *domain.Notification) error
	GetByUserID(ctx context.Context, userID uuid.UUID, unreadOnly bool, limit, offset int) ([]domain.Notification, int, error)
	MarkAsRead(ctx context.Context, id uuid.UUID) error
	MarkAllAsRead(ctx context.Context, userID uuid.UUID) error
	GetUnreadCount(ctx context.Context, userID uuid.UUID) (int, error)
}
