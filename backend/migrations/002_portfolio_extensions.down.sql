-- Rollback Portfolio Extensions Migration

DROP INDEX IF EXISTS idx_token_work_unique;
DROP INDEX IF EXISTS idx_token_work_ca;
DROP INDEX IF EXISTS idx_token_work_profile;
DROP TABLE IF EXISTS token_work_items;

DROP INDEX IF EXISTS idx_profile_socials_profile;
DROP INDEX IF EXISTS idx_profile_socials_unique;
DROP TABLE IF EXISTS profile_socials;
