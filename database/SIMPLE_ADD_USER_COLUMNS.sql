-- Simple migration to add missing user columns
-- Run this in Supabase SQL Editor

-- Add rating column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0;

-- Add review count
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Add verification status
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- Add hourly rate for sitters
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 15.00;

-- Add experience years
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0;

-- Add availability status
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT true;

-- Add last active timestamp
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ DEFAULT NOW();

-- Add profile completion percentage
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_completion INTEGER DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating);
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(verified);
CREATE INDEX IF NOT EXISTS idx_users_available ON users(available);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);

-- Update existing users to have default values
UPDATE users SET rating = 0.0 WHERE rating IS NULL;
UPDATE users SET review_count = 0 WHERE review_count IS NULL;
UPDATE users SET verified = false WHERE verified IS NULL;
UPDATE users SET hourly_rate = 15.00 WHERE hourly_rate IS NULL;
UPDATE users SET experience_years = 0 WHERE experience_years IS NULL;
UPDATE users SET available = true WHERE available IS NULL;
UPDATE users SET last_active = NOW() WHERE last_active IS NULL;
UPDATE users SET profile_completion = 0 WHERE profile_completion IS NULL;
