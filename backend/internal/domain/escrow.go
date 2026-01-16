package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type Escrow struct {
	ID               uuid.UUID       `json:"id" db:"id"`
	ContractID       uuid.UUID       `json:"contract_id" db:"contract_id"`
	EscrowPDA        string          `json:"escrow_pda" db:"escrow_pda"`
	VaultAddress     string          `json:"vault_address" db:"vault_address"`
	ClientWallet     string          `json:"client_wallet" db:"client_wallet"`
	FreelancerWallet string          `json:"freelancer_wallet" db:"freelancer_wallet"`
	TotalAmountSOL   decimal.Decimal `json:"total_amount_sol" db:"total_amount_sol"`
	FundedAmountSOL  decimal.Decimal `json:"funded_amount_sol" db:"funded_amount_sol"`
	ReleasedAmountSOL decimal.Decimal `json:"released_amount_sol" db:"released_amount_sol"`
	RefundedAmountSOL decimal.Decimal `json:"refunded_amount_sol" db:"refunded_amount_sol"`
	Status           string          `json:"status" db:"status"`
	InitTxSignature  *string         `json:"init_tx_signature" db:"init_tx_signature"`
	CreatedAt        time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at" db:"updated_at"`
}

type Payment struct {
	ID             uuid.UUID       `json:"id" db:"id"`
	EscrowID       *uuid.UUID      `json:"escrow_id" db:"escrow_id"`
	ContractID     uuid.UUID       `json:"contract_id" db:"contract_id"`
	MilestoneID    *uuid.UUID      `json:"milestone_id" db:"milestone_id"`
	PaymentType    string          `json:"payment_type" db:"payment_type"`
	FromWallet     string          `json:"from_wallet" db:"from_wallet"`
	ToWallet       string          `json:"to_wallet" db:"to_wallet"`
	AmountSOL      decimal.Decimal `json:"amount_sol" db:"amount_sol"`
	PlatformFeeSOL decimal.Decimal `json:"platform_fee_sol" db:"platform_fee_sol"`
	NetAmountSOL   decimal.Decimal `json:"net_amount_sol" db:"net_amount_sol"`
	TxSignature    *string         `json:"tx_signature" db:"tx_signature"`
	Slot           *int64          `json:"slot" db:"slot"`
	BlockTime      *time.Time      `json:"block_time" db:"block_time"`
	Status         string          `json:"status" db:"status"`
	InitiatedAt    time.Time       `json:"initiated_at" db:"initiated_at"`
	ConfirmedAt    *time.Time      `json:"confirmed_at" db:"confirmed_at"`
}

type EscrowLog struct {
	ID          uuid.UUID       `json:"id" db:"id"`
	EscrowID    uuid.UUID       `json:"escrow_id" db:"escrow_id"`
	Action      string          `json:"action" db:"action"`
	AmountSOL   *decimal.Decimal `json:"amount_sol" db:"amount_sol"`
	TxSignature *string         `json:"tx_signature" db:"tx_signature"`
	PerformedBy *uuid.UUID      `json:"performed_by" db:"performed_by"`
	Notes       *string         `json:"notes" db:"notes"`
	CreatedAt   time.Time       `json:"created_at" db:"created_at"`
}

// Escrow status constants
const (
	EscrowStatusCreated          = "created"
	EscrowStatusFunded           = "funded"
	EscrowStatusPartiallyReleased = "partially_released"
	EscrowStatusFullyReleased    = "fully_released"
	EscrowStatusRefunded         = "refunded"
	EscrowStatusDisputed         = "disputed"
)

// Payment type constants
const (
	PaymentTypeEscrowFund        = "escrow_fund"
	PaymentTypeMilestoneRelease  = "milestone_release"
	PaymentTypeBonus             = "bonus"
	PaymentTypeRefund            = "refund"
	PaymentTypeDisputeResolution = "dispute_resolution"
)

// Payment status constants
const (
	PaymentStatusPending   = "pending"
	PaymentStatusConfirmed = "confirmed"
	PaymentStatusFailed    = "failed"
)

// Escrow log action constants
const (
	EscrowLogActionCreated          = "created"
	EscrowLogActionFunded           = "funded"
	EscrowLogActionMilestoneReleased = "milestone_released"
	EscrowLogActionRefunded         = "refunded"
	EscrowLogActionDisputed         = "disputed"
	EscrowLogActionResolved         = "resolved"
)
