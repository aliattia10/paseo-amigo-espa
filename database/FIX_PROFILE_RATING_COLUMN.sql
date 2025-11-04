-- Fix missing rating column in users table
-- This fixes the "column users.rating does not exist" error

-- Add rating column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0;

-- Add review count column for calculating average rating
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Add constraint to ensure rating is between 0 and 5
ALTER TABLE users 
ADD CONSTRAINT IF NOT EXISTS users_rating_check 
CHECK (rating >= 0 AND rating <= 5);

-- Create index for faster rating queries
CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating);

-- Add comments
COMMENT ON COLUMN users.rating IS 'Average rating from reviews (0-5)';
COMMENT ON COLUMN users.review_count IS 'Total number of reviews received';

-- Update existing users to have 0 rating if NULL
UPDATE users SET rating = 0.0 WHERE rating IS NULL;
UPDATE users SET review_count = 0 WHERE review_count IS NULL;
