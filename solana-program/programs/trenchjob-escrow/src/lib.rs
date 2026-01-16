use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("TrenchEscrow111111111111111111111111111111");

#[program]
pub mod trenchjob_escrow {
    use super::*;

    /// Initialize a new escrow for a contract
    /// Called when a client hires a freelancer
    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        contract_id: [u8; 16],  // Off-chain contract UUID (16 bytes)
        total_amount: u64,       // Total amount in lamports
        freelancer: Pubkey,      // Freelancer's wallet address
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        let clock = Clock::get()?;

        escrow.client = ctx.accounts.client.key();
        escrow.freelancer = freelancer;
        escrow.contract_id = contract_id;
        escrow.total_amount = total_amount;
        escrow.funded_amount = 0;
        escrow.released_amount = 0;
        escrow.refunded_amount = 0;
        escrow.status = EscrowStatus::Created;
        escrow.bump = ctx.bumps.escrow;
        escrow.vault_bump = ctx.bumps.vault;
        escrow.created_at = clock.unix_timestamp;
        escrow.updated_at = clock.unix_timestamp;

        emit!(EscrowCreated {
            escrow: ctx.accounts.escrow.key(),
            client: ctx.accounts.client.key(),
            freelancer,
            contract_id,
            total_amount,
        });

        Ok(())
    }

    /// Fund the escrow vault with SOL
    /// Client transfers SOL to the escrow vault
    pub fn fund_escrow(
        ctx: Context<FundEscrow>,
        amount: u64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        let clock = Clock::get()?;

        require!(
            escrow.client == ctx.accounts.client.key(),
            EscrowError::UnauthorizedClient
        );

        require!(
            escrow.status == EscrowStatus::Created ||
            escrow.status == EscrowStatus::PartiallyFunded,
            EscrowError::InvalidEscrowState
        );

        require!(
            amount > 0,
            EscrowError::InvalidAmount
        );

        // Transfer SOL from client to vault
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.client.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;

        // Update escrow state
        escrow.funded_amount = escrow.funded_amount
            .checked_add(amount)
            .ok_or(EscrowError::Overflow)?;

        escrow.updated_at = clock.unix_timestamp;

        // Update status
        if escrow.funded_amount >= escrow.total_amount {
            escrow.status = EscrowStatus::FullyFunded;
        } else {
            escrow.status = EscrowStatus::PartiallyFunded;
        }

        emit!(EscrowFunded {
            escrow: ctx.accounts.escrow.key(),
            client: ctx.accounts.client.key(),
            amount,
            total_funded: escrow.funded_amount,
            status: escrow.status.clone(),
        });

        Ok(())
    }

    /// Release funds for a completed milestone
    /// Only the client can release funds to the freelancer
    pub fn release_milestone(
        ctx: Context<ReleaseMilestone>,
        milestone_id: [u8; 16],  // Off-chain milestone UUID
        amount: u64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        let clock = Clock::get()?;

        require!(
            escrow.client == ctx.accounts.client.key(),
            EscrowError::UnauthorizedClient
        );

        require!(
            escrow.status == EscrowStatus::FullyFunded ||
            escrow.status == EscrowStatus::PartiallyReleased,
            EscrowError::InvalidEscrowState
        );

        require!(
            escrow.freelancer == ctx.accounts.freelancer.key(),
            EscrowError::InvalidFreelancer
        );

        require!(
            amount > 0,
            EscrowError::InvalidAmount
        );

        // Calculate available funds
        let available = escrow.funded_amount
            .checked_sub(escrow.released_amount)
            .ok_or(EscrowError::Overflow)?
            .checked_sub(escrow.refunded_amount)
            .ok_or(EscrowError::Overflow)?;

        require!(
            amount <= available,
            EscrowError::InsufficientFunds
        );

        // Transfer from vault to freelancer using PDA signing
        let contract_id = escrow.contract_id;
        let bump = escrow.vault_bump;
        let seeds = &[
            b"vault",
            contract_id.as_ref(),
            &[bump],
        ];
        let signer_seeds = &[&seeds[..]];

        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.freelancer.to_account_info().try_borrow_mut_lamports()? += amount;

        // Update escrow state
        escrow.released_amount = escrow.released_amount
            .checked_add(amount)
            .ok_or(EscrowError::Overflow)?;

        escrow.updated_at = clock.unix_timestamp;

        // Update status
        let remaining = escrow.funded_amount
            .checked_sub(escrow.released_amount)
            .ok_or(EscrowError::Overflow)?
            .checked_sub(escrow.refunded_amount)
            .ok_or(EscrowError::Overflow)?;

        if remaining == 0 {
            escrow.status = EscrowStatus::FullyReleased;
        } else {
            escrow.status = EscrowStatus::PartiallyReleased;
        }

        emit!(MilestoneReleased {
            escrow: ctx.accounts.escrow.key(),
            milestone_id,
            freelancer: ctx.accounts.freelancer.key(),
            amount,
            total_released: escrow.released_amount,
            status: escrow.status.clone(),
        });

        Ok(())
    }

    /// Refund remaining funds to the client
    /// Used for contract cancellation or dispute resolution
    pub fn refund(
        ctx: Context<Refund>,
        amount: u64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        let clock = Clock::get()?;

        require!(
            escrow.client == ctx.accounts.client.key(),
            EscrowError::UnauthorizedClient
        );

        require!(
            amount > 0,
            EscrowError::InvalidAmount
        );

        // Calculate available funds for refund
        let available = escrow.funded_amount
            .checked_sub(escrow.released_amount)
            .ok_or(EscrowError::Overflow)?
            .checked_sub(escrow.refunded_amount)
            .ok_or(EscrowError::Overflow)?;

        require!(
            amount <= available,
            EscrowError::InsufficientFunds
        );

        // Transfer from vault back to client using PDA signing
        let contract_id = escrow.contract_id;
        let bump = escrow.vault_bump;
        let seeds = &[
            b"vault",
            contract_id.as_ref(),
            &[bump],
        ];
        let signer_seeds = &[&seeds[..]];

        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.client.to_account_info().try_borrow_mut_lamports()? += amount;

        // Update escrow state
        escrow.refunded_amount = escrow.refunded_amount
            .checked_add(amount)
            .ok_or(EscrowError::Overflow)?;

        escrow.updated_at = clock.unix_timestamp;

        // Check if fully refunded
        let remaining = escrow.funded_amount
            .checked_sub(escrow.released_amount)
            .ok_or(EscrowError::Overflow)?
            .checked_sub(escrow.refunded_amount)
            .ok_or(EscrowError::Overflow)?;

        if remaining == 0 && escrow.released_amount == 0 {
            escrow.status = EscrowStatus::Refunded;
        }

        emit!(EscrowRefunded {
            escrow: ctx.accounts.escrow.key(),
            client: ctx.accounts.client.key(),
            amount,
            total_refunded: escrow.refunded_amount,
            status: escrow.status.clone(),
        });

        Ok(())
    }

    /// Mark escrow as disputed
    /// Freezes the escrow until resolution
    pub fn open_dispute(
        ctx: Context<OpenDispute>,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        let clock = Clock::get()?;

        // Only client or freelancer can open dispute
        require!(
            ctx.accounts.initiator.key() == escrow.client ||
            ctx.accounts.initiator.key() == escrow.freelancer,
            EscrowError::UnauthorizedDispute
        );

        require!(
            escrow.status != EscrowStatus::Disputed &&
            escrow.status != EscrowStatus::Refunded &&
            escrow.status != EscrowStatus::FullyReleased,
            EscrowError::InvalidEscrowState
        );

        escrow.status = EscrowStatus::Disputed;
        escrow.updated_at = clock.unix_timestamp;

        emit!(DisputeOpened {
            escrow: ctx.accounts.escrow.key(),
            initiator: ctx.accounts.initiator.key(),
        });

        Ok(())
    }

    /// Close the escrow account and return rent
    /// Only possible when fully released or fully refunded
    pub fn close_escrow(
        ctx: Context<CloseEscrow>,
    ) -> Result<()> {
        let escrow = &ctx.accounts.escrow;

        require!(
            escrow.client == ctx.accounts.client.key(),
            EscrowError::UnauthorizedClient
        );

        require!(
            escrow.status == EscrowStatus::FullyReleased ||
            escrow.status == EscrowStatus::Refunded,
            EscrowError::InvalidEscrowState
        );

        // Vault should be empty at this point
        let vault_lamports = ctx.accounts.vault.lamports();
        require!(
            vault_lamports == 0,
            EscrowError::VaultNotEmpty
        );

        emit!(EscrowClosed {
            escrow: ctx.accounts.escrow.key(),
            client: ctx.accounts.client.key(),
        });

        Ok(())
    }
}

// ============================================
// Account Structures
// ============================================

#[account]
#[derive(Default)]
pub struct Escrow {
    /// Client who created the escrow (32 bytes)
    pub client: Pubkey,
    /// Freelancer who will receive funds (32 bytes)
    pub freelancer: Pubkey,
    /// Off-chain contract UUID (16 bytes)
    pub contract_id: [u8; 16],
    /// Total expected amount in lamports (8 bytes)
    pub total_amount: u64,
    /// Amount funded so far in lamports (8 bytes)
    pub funded_amount: u64,
    /// Amount released to freelancer in lamports (8 bytes)
    pub released_amount: u64,
    /// Amount refunded to client in lamports (8 bytes)
    pub refunded_amount: u64,
    /// Current status of the escrow (1 byte)
    pub status: EscrowStatus,
    /// Bump seed for escrow PDA (1 byte)
    pub bump: u8,
    /// Bump seed for vault PDA (1 byte)
    pub vault_bump: u8,
    /// Unix timestamp of creation (8 bytes)
    pub created_at: i64,
    /// Unix timestamp of last update (8 bytes)
    pub updated_at: i64,
}

impl Escrow {
    pub const LEN: usize = 8 +  // discriminator
        32 +    // client
        32 +    // freelancer
        16 +    // contract_id
        8 +     // total_amount
        8 +     // funded_amount
        8 +     // released_amount
        8 +     // refunded_amount
        1 +     // status
        1 +     // bump
        1 +     // vault_bump
        8 +     // created_at
        8;      // updated_at
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Default)]
pub enum EscrowStatus {
    #[default]
    Created,
    PartiallyFunded,
    FullyFunded,
    PartiallyReleased,
    FullyReleased,
    Refunded,
    Disputed,
}

// ============================================
// Context Structures
// ============================================

#[derive(Accounts)]
#[instruction(contract_id: [u8; 16])]
pub struct InitializeEscrow<'info> {
    #[account(mut)]
    pub client: Signer<'info>,

    #[account(
        init,
        payer = client,
        space = Escrow::LEN,
        seeds = [b"escrow", contract_id.as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,

    /// CHECK: Vault PDA that will hold SOL
    #[account(
        mut,
        seeds = [b"vault", contract_id.as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FundEscrow<'info> {
    #[account(mut)]
    pub client: Signer<'info>,

    #[account(
        mut,
        seeds = [b"escrow", escrow.contract_id.as_ref()],
        bump = escrow.bump,
        constraint = escrow.client == client.key() @ EscrowError::UnauthorizedClient
    )]
    pub escrow: Account<'info, Escrow>,

    /// CHECK: Vault PDA
    #[account(
        mut,
        seeds = [b"vault", escrow.contract_id.as_ref()],
        bump = escrow.vault_bump
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReleaseMilestone<'info> {
    #[account(mut)]
    pub client: Signer<'info>,

    #[account(
        mut,
        seeds = [b"escrow", escrow.contract_id.as_ref()],
        bump = escrow.bump,
        constraint = escrow.client == client.key() @ EscrowError::UnauthorizedClient
    )]
    pub escrow: Account<'info, Escrow>,

    /// CHECK: Vault PDA
    #[account(
        mut,
        seeds = [b"vault", escrow.contract_id.as_ref()],
        bump = escrow.vault_bump
    )]
    pub vault: SystemAccount<'info>,

    /// CHECK: Freelancer receiving payment
    #[account(
        mut,
        constraint = escrow.freelancer == freelancer.key() @ EscrowError::InvalidFreelancer
    )]
    pub freelancer: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(mut)]
    pub client: Signer<'info>,

    #[account(
        mut,
        seeds = [b"escrow", escrow.contract_id.as_ref()],
        bump = escrow.bump,
        constraint = escrow.client == client.key() @ EscrowError::UnauthorizedClient
    )]
    pub escrow: Account<'info, Escrow>,

    /// CHECK: Vault PDA
    #[account(
        mut,
        seeds = [b"vault", escrow.contract_id.as_ref()],
        bump = escrow.vault_bump
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct OpenDispute<'info> {
    #[account(mut)]
    pub initiator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"escrow", escrow.contract_id.as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
}

#[derive(Accounts)]
pub struct CloseEscrow<'info> {
    #[account(mut)]
    pub client: Signer<'info>,

    #[account(
        mut,
        seeds = [b"escrow", escrow.contract_id.as_ref()],
        bump = escrow.bump,
        close = client,
        constraint = escrow.client == client.key() @ EscrowError::UnauthorizedClient
    )]
    pub escrow: Account<'info, Escrow>,

    /// CHECK: Vault PDA
    #[account(
        mut,
        seeds = [b"vault", escrow.contract_id.as_ref()],
        bump = escrow.vault_bump
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

// ============================================
// Events
// ============================================

#[event]
pub struct EscrowCreated {
    pub escrow: Pubkey,
    pub client: Pubkey,
    pub freelancer: Pubkey,
    pub contract_id: [u8; 16],
    pub total_amount: u64,
}

#[event]
pub struct EscrowFunded {
    pub escrow: Pubkey,
    pub client: Pubkey,
    pub amount: u64,
    pub total_funded: u64,
    pub status: EscrowStatus,
}

#[event]
pub struct MilestoneReleased {
    pub escrow: Pubkey,
    pub milestone_id: [u8; 16],
    pub freelancer: Pubkey,
    pub amount: u64,
    pub total_released: u64,
    pub status: EscrowStatus,
}

#[event]
pub struct EscrowRefunded {
    pub escrow: Pubkey,
    pub client: Pubkey,
    pub amount: u64,
    pub total_refunded: u64,
    pub status: EscrowStatus,
}

#[event]
pub struct DisputeOpened {
    pub escrow: Pubkey,
    pub initiator: Pubkey,
}

#[event]
pub struct EscrowClosed {
    pub escrow: Pubkey,
    pub client: Pubkey,
}

// ============================================
// Errors
// ============================================

#[error_code]
pub enum EscrowError {
    #[msg("Unauthorized: Only the client can perform this action")]
    UnauthorizedClient,

    #[msg("Invalid escrow state for this operation")]
    InvalidEscrowState,

    #[msg("Invalid freelancer address")]
    InvalidFreelancer,

    #[msg("Insufficient funds in escrow")]
    InsufficientFunds,

    #[msg("Invalid amount: must be greater than 0")]
    InvalidAmount,

    #[msg("Arithmetic overflow")]
    Overflow,

    #[msg("Unauthorized: Only client or freelancer can open dispute")]
    UnauthorizedDispute,

    #[msg("Vault is not empty")]
    VaultNotEmpty,
}
