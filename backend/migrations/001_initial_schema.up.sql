-- TrenchJobs Database Schema
-- PostgreSQL Migration: Initial Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    primary_wallet_address VARCHAR(44),
    is_client BOOLEAN DEFAULT FALSE,
    is_freelancer BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    wallet_verified BOOLEAN DEFAULT FALSE,
    account_status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(44) NOT NULL,
    wallet_type VARCHAR(20) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, wallet_address)
);

CREATE TABLE auth_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(44),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE wallet_nonces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(44) UNIQUE NOT NULL,
    nonce VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PROFILES
-- ============================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    professional_title VARCHAR(150),
    avatar_url TEXT,
    cover_image_url TEXT,
    overview TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50),
    hourly_rate_sol DECIMAL(18, 9),
    minimum_project_sol DECIMAL(18, 9),
    total_jobs_completed INTEGER DEFAULT 0,
    total_earnings_sol DECIMAL(18, 9) DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    available_for_hire BOOLEAN DEFAULT TRUE,
    availability_status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE profile_skills (
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    years_experience INTEGER,
    proficiency_level VARCHAR(20),
    PRIMARY KEY (profile_id, skill_id)
);

CREATE TABLE portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    project_url TEXT,
    image_urls TEXT[],
    skills_used INTEGER[],
    completion_date DATE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    issuing_organization VARCHAR(200),
    issue_date DATE,
    expiry_date DATE,
    credential_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL
);

CREATE TABLE profile_languages (
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    language_id INTEGER REFERENCES languages(id) ON DELETE CASCADE,
    proficiency VARCHAR(20) NOT NULL,
    PRIMARY KEY (profile_id, language_id)
);

-- ============================================
-- JOBS
-- ============================================

CREATE TABLE job_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id INTEGER REFERENCES job_categories(id),
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER REFERENCES job_categories(id),
    payment_type VARCHAR(20) NOT NULL,
    budget_min_sol DECIMAL(18, 9),
    budget_max_sol DECIMAL(18, 9),
    hourly_rate_min_sol DECIMAL(18, 9),
    hourly_rate_max_sol DECIMAL(18, 9),
    expected_duration VARCHAR(30),
    complexity VARCHAR(20),
    visibility VARCHAR(20) DEFAULT 'public',
    status VARCHAR(20) DEFAULT 'draft',
    proposal_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    posted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE job_skills (
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (job_id, skill_id)
);

CREATE TABLE job_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE job_screening_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE saved_jobs (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, job_id)
);

-- ============================================
-- PROPOSALS
-- ============================================

CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES users(id),
    cover_letter TEXT NOT NULL,
    proposed_rate_sol DECIMAL(18, 9),
    proposed_amount_sol DECIMAL(18, 9),
    estimated_duration VARCHAR(30),
    status VARCHAR(30) DEFAULT 'submitted',
    client_rating INTEGER,
    client_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    viewed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, freelancer_id)
);

CREATE TABLE proposal_screening_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES job_screening_questions(id) ON DELETE CASCADE,
    answer TEXT NOT NULL
);

CREATE TABLE proposal_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    amount_sol DECIMAL(18, 9) NOT NULL,
    estimated_days INTEGER,
    sort_order INTEGER DEFAULT 0
);

-- ============================================
-- CONTRACTS
-- ============================================

CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID UNIQUE REFERENCES proposals(id),
    job_id UUID NOT NULL REFERENCES jobs(id),
    client_id UUID NOT NULL REFERENCES users(id),
    freelancer_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    payment_type VARCHAR(20) NOT NULL,
    total_amount_sol DECIMAL(18, 9) NOT NULL,
    hourly_rate_sol DECIMAL(18, 9),
    weekly_hour_limit INTEGER,
    escrow_account_address VARCHAR(44),
    escrow_amount_sol DECIMAL(18, 9) DEFAULT 0,
    released_amount_sol DECIMAL(18, 9) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    amount_sol DECIMAL(18, 9) NOT NULL,
    due_date DATE,
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(30) DEFAULT 'pending',
    submission_text TEXT,
    submission_urls TEXT[],
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    payment_id UUID,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE milestone_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id),
    revision_notes TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ESCROW & PAYMENTS
-- ============================================

CREATE TABLE escrows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID UNIQUE NOT NULL REFERENCES contracts(id),
    escrow_pda VARCHAR(44) NOT NULL,
    vault_address VARCHAR(44) NOT NULL,
    client_wallet VARCHAR(44) NOT NULL,
    freelancer_wallet VARCHAR(44) NOT NULL,
    total_amount_sol DECIMAL(18, 9) NOT NULL,
    funded_amount_sol DECIMAL(18, 9) DEFAULT 0,
    released_amount_sol DECIMAL(18, 9) DEFAULT 0,
    refunded_amount_sol DECIMAL(18, 9) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'created',
    init_tx_signature VARCHAR(88),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_id UUID REFERENCES escrows(id),
    contract_id UUID NOT NULL REFERENCES contracts(id),
    milestone_id UUID REFERENCES milestones(id),
    payment_type VARCHAR(30) NOT NULL,
    from_wallet VARCHAR(44) NOT NULL,
    to_wallet VARCHAR(44) NOT NULL,
    amount_sol DECIMAL(18, 9) NOT NULL,
    platform_fee_sol DECIMAL(18, 9) DEFAULT 0,
    net_amount_sol DECIMAL(18, 9) NOT NULL,
    tx_signature VARCHAR(88),
    slot BIGINT,
    block_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending',
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE escrow_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_id UUID NOT NULL REFERENCES escrows(id),
    action VARCHAR(50) NOT NULL,
    amount_sol DECIMAL(18, 9),
    tx_signature VARCHAR(88),
    performed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MESSAGING
-- ============================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id),
    proposal_id UUID REFERENCES proposals(id),
    contract_id UUID REFERENCES contracts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE conversation_participants (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    last_read_at TIMESTAMP WITH TIME ZONE,
    is_muted BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- REVIEWS
-- ============================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),
    overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    expertise_rating INTEGER CHECK (expertise_rating BETWEEN 1 AND 5),
    professionalism_rating INTEGER CHECK (professionalism_rating BETWEEN 1 AND 5),
    would_recommend BOOLEAN,
    review_text TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(contract_id, reviewer_id)
);

-- ============================================
-- DISPUTES
-- ============================================

CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id),
    milestone_id UUID REFERENCES milestones(id),
    initiated_by UUID NOT NULL REFERENCES users(id),
    reason VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT[],
    status VARCHAR(30) DEFAULT 'open',
    resolved_by UUID REFERENCES users(id),
    resolution_type VARCHAR(30),
    resolution_notes TEXT,
    client_refund_sol DECIMAL(18, 9),
    freelancer_payment_sol DECIMAL(18, 9),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    job_id UUID REFERENCES jobs(id),
    proposal_id UUID REFERENCES proposals(id),
    contract_id UUID REFERENCES contracts(id),
    payment_id UUID REFERENCES payments(id),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PLATFORM SETTINGS
-- ============================================

CREATE TABLE platform_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO platform_settings (key, value, description) VALUES
('platform_fee_percentage', '5', 'Percentage fee charged on payments'),
('min_escrow_amount_sol', '0.1', 'Minimum escrow amount in SOL'),
('job_posting_fee_sol', '0.01', 'Fee to post a job in SOL'),
('escrow_program_id', '', 'Solana program ID for escrow');

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_primary_wallet ON users(primary_wallet_address);
CREATE INDEX idx_user_wallets_address ON user_wallets(wallet_address);

-- Profiles
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_available ON profiles(available_for_hire) WHERE available_for_hire = TRUE;

-- Jobs
CREATE INDEX idx_jobs_client ON jobs(client_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_category ON jobs(category_id);
CREATE INDEX idx_jobs_posted ON jobs(posted_at DESC);
CREATE INDEX idx_jobs_visibility_status ON jobs(visibility, status);

-- Proposals
CREATE INDEX idx_proposals_job ON proposals(job_id);
CREATE INDEX idx_proposals_freelancer ON proposals(freelancer_id);
CREATE INDEX idx_proposals_status ON proposals(status);

-- Contracts
CREATE INDEX idx_contracts_client ON contracts(client_id);
CREATE INDEX idx_contracts_freelancer ON contracts(freelancer_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_escrow_address ON contracts(escrow_account_address);

-- Milestones
CREATE INDEX idx_milestones_contract ON milestones(contract_id);
CREATE INDEX idx_milestones_status ON milestones(status);

-- Escrows
CREATE INDEX idx_escrows_contract ON escrows(contract_id);
CREATE INDEX idx_escrows_pda ON escrows(escrow_pda);

-- Payments
CREATE INDEX idx_payments_contract ON payments(contract_id);
CREATE INDEX idx_payments_escrow ON payments(escrow_id);
CREATE INDEX idx_payments_tx_signature ON payments(tx_signature);
CREATE INDEX idx_payments_status ON payments(status);

-- Messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_conversations_contract ON conversations(contract_id);

-- Reviews
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_contract ON reviews(contract_id);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Full-text search
CREATE INDEX idx_jobs_search ON jobs USING GIN(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_profiles_search ON profiles USING GIN(to_tsvector('english', coalesce(display_name, '') || ' ' || coalesce(professional_title, '') || ' ' || coalesce(overview, '')));

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default skills
INSERT INTO skills (name, slug, category) VALUES
('JavaScript', 'javascript', 'development'),
('TypeScript', 'typescript', 'development'),
('React', 'react', 'development'),
('Node.js', 'nodejs', 'development'),
('Python', 'python', 'development'),
('Golang', 'golang', 'development'),
('Rust', 'rust', 'development'),
('Solana', 'solana', 'blockchain'),
('Anchor', 'anchor', 'blockchain'),
('Smart Contracts', 'smart-contracts', 'blockchain'),
('Web3', 'web3', 'blockchain'),
('DeFi', 'defi', 'blockchain'),
('NFT', 'nft', 'blockchain'),
('UI/UX Design', 'ui-ux-design', 'design'),
('Graphic Design', 'graphic-design', 'design'),
('Figma', 'figma', 'design'),
('Logo Design', 'logo-design', 'design'),
('Content Writing', 'content-writing', 'writing'),
('Technical Writing', 'technical-writing', 'writing'),
('Copywriting', 'copywriting', 'writing'),
('SEO', 'seo', 'marketing'),
('Social Media Marketing', 'social-media-marketing', 'marketing'),
('Data Analysis', 'data-analysis', 'data'),
('Machine Learning', 'machine-learning', 'data'),
('PostgreSQL', 'postgresql', 'development'),
('MongoDB', 'mongodb', 'development'),
('AWS', 'aws', 'devops'),
('Docker', 'docker', 'devops'),
('Kubernetes', 'kubernetes', 'devops');

-- Insert default job categories
INSERT INTO job_categories (name, slug, icon, sort_order) VALUES
('Web Development', 'web-development', 'code', 1),
('Blockchain & Web3', 'blockchain-web3', 'link', 2),
('Design', 'design', 'palette', 3),
('Writing', 'writing', 'edit', 4),
('Marketing', 'marketing', 'megaphone', 5),
('Data & Analytics', 'data-analytics', 'chart', 6),
('DevOps', 'devops', 'server', 7),
('Mobile Development', 'mobile-development', 'smartphone', 8);

-- Insert default languages
INSERT INTO languages (name, code) VALUES
('English', 'en'),
('Spanish', 'es'),
('French', 'fr'),
('German', 'de'),
('Portuguese', 'pt'),
('Chinese', 'zh'),
('Japanese', 'ja'),
('Korean', 'ko'),
('Russian', 'ru'),
('Arabic', 'ar');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_escrows_updated_at BEFORE UPDATE ON escrows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update profile stats after review
CREATE OR REPLACE FUNCTION update_profile_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET
        average_rating = (
            SELECT COALESCE(AVG(overall_rating), 0)
            FROM reviews
            WHERE reviewee_id = (SELECT user_id FROM profiles WHERE id = profiles.id)
            AND is_public = TRUE
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE reviewee_id = (SELECT user_id FROM profiles WHERE id = profiles.id)
            AND is_public = TRUE
        )
    WHERE user_id = NEW.reviewee_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profile_stats_on_review
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_profile_review_stats();

-- Function to increment job proposal count
CREATE OR REPLACE FUNCTION update_job_proposal_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE jobs SET proposal_count = proposal_count + 1 WHERE id = NEW.job_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE jobs SET proposal_count = proposal_count - 1 WHERE id = OLD.job_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_job_proposal_count_trigger
AFTER INSERT OR DELETE ON proposals
FOR EACH ROW EXECUTE FUNCTION update_job_proposal_count();
