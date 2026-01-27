// ============================================
// Core Types
// ============================================

export interface User {
    id: string
    email: string
    role: 'client' | 'freelancer'
    username?: string
    avatar_url?: string
    display_name?: string
}

export interface Profile {
    id: string
    user_id: string
    display_name: string
    professional_title?: string
    bio?: string
    overview?: string
    hourly_rate_sol?: number
    country?: string
    avatar_url?: string
    available_for_hire: boolean
    availability_status?: 'available' | 'busy' | 'not_available' | string
    created_at: string
    // Stats fields from backend
    total_jobs_completed?: number
    total_earnings_sol?: number
    average_rating?: number
    total_reviews?: number
    // These may be included when profile is returned with related data
    skills?: { id: string; name: string }[]
    socials?: ProfileSocial[]
    token_work?: TokenWorkItem[]
    portfolio?: PortfolioItem[]
}

export interface ProfileResponse {
    profile: Profile
    skills?: { id: string; name: string }[]
    portfolio?: PortfolioItem[]
    socials?: ProfileSocial[]
    token_work?: TokenWorkItem[]
    user?: {
        id: string
        username: string
        wallet_address?: string
    }
    stats?: {
        total_earnings?: number
        jobs_completed?: number
        rating?: number
        review_count?: number
    }
}

export interface PortfolioItem {
    id: string
    title: string
    description: string
    url?: string
    project_url?: string
    image_url?: string
    image_urls?: string[]
    created_at: string
    sort_order?: number
}

export interface ProfileSocial {
    id?: string
    platform: 'website' | 'twitter' | 'telegram' | 'discord'
    url: string
    created_at?: string
}

export interface TokenWorkItem {
    id: string
    contract_address: string
    chain: string
    token_name?: string
    token_symbol?: string
    token_image_url?: string
    ath_market_cap?: number
    last_fetched_at?: string
    sort_order: number
    created_at: string
}

// ============================================
// Job Types
// ============================================

export interface Job {
    id: string
    title: string
    description: string
    budget: number
    budget_type: 'fixed' | 'hourly'
    difficulty: string
    status: 'draft' | 'open' | 'active' | 'completed' | 'cancelled'
    created_at: string
    client_id: string
    skills: string[]
    category_id?: number
    proposal_count?: number
    escrow_funded?: boolean
    client?: {
        id: string
        display_name: string
        avatar_url?: string
        rating?: number
        jobs_posted?: number
        verified?: boolean
    }
}

export interface CreateJobRequest {
    title: string
    description: string
    budget: number
    budget_type: 'fixed' | 'hourly'
    difficulty: string
    category_id?: number
    skills?: string[]
}

export interface JobSearchParams {
    q?: string
    category_id?: number
    skills?: string[]
    status?: string
    min_budget?: number
    max_budget?: number
    difficulty?: string
    limit?: number
    offset?: number
}

// ============================================
// Proposal Types
// ============================================

export interface Proposal {
    id: string
    job_id: string
    freelancer_id: string
    cover_letter: string
    proposed_rate: number
    estimated_duration: string
    status: 'pending' | 'shortlisted' | 'rejected' | 'hired' | 'withdrawn'
    created_at: string
    job?: Job
    freelancer?: Profile
}

export interface CreateProposalRequest {
    cover_letter: string
    proposed_rate: number // Frontend field - will be mapped to proposed_rate_sol
    estimated_duration: string
}

// ============================================
// Contract Types
// ============================================

export interface Contract {
    id: string
    job_id: string
    client_id: string
    freelancer_id: string
    proposal_id: string
    title: string
    description?: string
    total_amount: number
    status: 'pending' | 'active' | 'completed' | 'cancelled' | 'disputed'
    escrow_address?: string
    created_at: string
    milestones?: Milestone[]
    job?: Job
    client?: Profile
    freelancer?: Profile
}

export interface Milestone {
    id: string
    contract_id: string
    title: string
    description?: string
    amount: number
    status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'revision_requested'
    due_date?: string
    submitted_at?: string
    approved_at?: string
    order_index: number
}

export interface CreateMilestoneRequest {
    title: string
    description?: string
    amount: number
    due_date?: string
}

export interface ContractSearchParams {
    status?: string
    role?: 'client' | 'freelancer'
    limit?: number
    offset?: number
}

// ============================================
// Message Types
// ============================================

export interface Conversation {
    id: string
    participants: Participant[]
    last_message?: Message
    unread_count: number
    context?: ConversationContext
    updated_at: string
    created_at: string
}

export interface Participant {
    user_id: string
    username: string
    avatar_url?: string
    is_online: boolean
}

export interface ConversationContext {
    type: 'contract' | 'job' | 'proposal'
    id: string
    title: string
    status?: string
    amount_sol?: string
}

export interface Message {
    id: string
    conversation_id: string
    sender_id: string
    sender_username?: string
    sender_avatar?: string
    message_text: string
    message_type: 'text' | 'system' | 'milestone_update'
    is_edited: boolean
    created_at: string
}

export interface SendMessageRequest {
    message_text: string
    message_type?: string
}

export interface CreateConversationRequest {
    participant_id: string
    contract_id?: string
    job_id?: string
    initial_message?: string
}

// ============================================
// Review Types
// ============================================

export interface Review {
    id: string
    contract_id: string
    reviewer_id: string
    reviewee_id: string
    overall_rating: number
    communication_rating?: number
    quality_rating?: number
    expertise_rating?: number
    professionalism_rating?: number
    would_recommend?: boolean
    review_text?: string
    is_public: boolean
    created_at: string
    reviewer_username?: string
}

export interface CreateReviewRequest {
    contract_id: string
    overall_rating: number
    communication_rating?: number
    quality_rating?: number
    expertise_rating?: number
    professionalism_rating?: number
    would_recommend?: boolean
    review_text?: string
    is_public?: boolean
}

// ============================================
// Profile Search Types
// ============================================

export interface ProfileSearchParams {
    q?: string
    skills?: string[]
    min_rate?: number
    max_rate?: number
    available_only?: boolean
    limit?: number
    offset?: number
}
