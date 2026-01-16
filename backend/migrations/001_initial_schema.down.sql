-- TrenchJobs Database Schema
-- PostgreSQL Migration: Rollback Initial Schema

-- Drop triggers
DROP TRIGGER IF EXISTS update_job_proposal_count_trigger ON proposals;
DROP TRIGGER IF EXISTS update_profile_stats_on_review ON reviews;
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
DROP TRIGGER IF EXISTS update_escrows_updated_at ON escrows;
DROP TRIGGER IF EXISTS update_milestones_updated_at ON milestones;
DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts;
DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals;
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop functions
DROP FUNCTION IF EXISTS update_job_proposal_count();
DROP FUNCTION IF EXISTS update_profile_review_stats();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS platform_settings;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS disputes;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS message_attachments;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversation_participants;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS escrow_logs;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS escrows;
DROP TABLE IF EXISTS milestone_revisions;
DROP TABLE IF EXISTS milestones;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS proposal_milestones;
DROP TABLE IF EXISTS proposal_screening_answers;
DROP TABLE IF EXISTS proposals;
DROP TABLE IF EXISTS saved_jobs;
DROP TABLE IF EXISTS job_screening_questions;
DROP TABLE IF EXISTS job_attachments;
DROP TABLE IF EXISTS job_skills;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS job_categories;
DROP TABLE IF EXISTS profile_languages;
DROP TABLE IF EXISTS languages;
DROP TABLE IF EXISTS certifications;
DROP TABLE IF EXISTS portfolio_items;
DROP TABLE IF EXISTS profile_skills;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS wallet_nonces;
DROP TABLE IF EXISTS auth_sessions;
DROP TABLE IF EXISTS user_wallets;
DROP TABLE IF EXISTS users;

-- Drop extension
DROP EXTENSION IF EXISTS "uuid-ossp";
