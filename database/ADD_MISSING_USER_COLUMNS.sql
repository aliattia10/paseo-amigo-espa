-- Add all potentially missing columns to users table
-- This fixes various "column does not exist" errors

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

-- Add constraints (drop first if exists to avoid errors)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_rating_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_rating_check CHECK (rating >= 0 AND rating <= 5);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_profile_completion_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_profile_completion_check CHECK (profile_completion >= 0 AND profile_completion <= 100);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating);
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(verified);
CREATE INDEX IF NOT EXISTS idx_users_available ON users(available);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);

-- Add comments
COMMENT ON COLUMN users.rating IS 'Average rating from reviews (0-5)';
COMMENT ON COLUMN users.review_count IS 'Total number of reviews received';
COMMENT ON COLUMN users.verified IS 'Whether user has completed verification';
COMMENT ON COLUMN users.hourly_rate IS 'Hourly rate for sitters (in EUR)';
COMMENT ON COLUMN users.experience_years IS 'Years of experience for sitters';
COMMENT ON COLUMN users.available IS 'Whether user is currently available';
COMMENT ON COLUMN users.last_active IS 'Last time user was active';
COMMENT ON COLUMN users.profile_completion IS 'Profile completion percentage (0-100)';

-- Update existing users to have default values
UPDATE users SET rating = 0.0 WHERE rating IS NULL;
UPDATE users SET review_count = 0 WHERE review_count IS NULL;
UPDATE users SET verified = false WHERE verified IS NULL;
UPDATE users SET hourly_rate = 15.00 WHERE hourly_rate IS NULL;
UPDATE users SET experience_years = 0 WHERE experience_years IS NULL;
UPDATE users SET available = true WHERE available IS NULL;
UPDATE users SET last_active = NOW() WHERE last_active IS NULL;
UPDATE users SET profile_completion = 0 WHERE profile_completion IS NULL;

-- Create or replace function to calculate profile completion
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  completion INTEGER := 0;
  user_record RECORD;
BEGIN
  SELECT * INTO user_record FROM users WHERE id = user_id;
  
  IF user_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Basic info (40%)
  IF user_record.name IS NOT NULL AND user_record.name != '' THEN
    completion := completion + 10;
  END IF;
  
  IF user_record.phone IS NOT NULL AND user_record.phone != '' THEN
    completion := completion + 10;
  END IF;
  
  IF user_record.city IS NOT NULL AND user_record.city != '' THEN
    completion := completion + 10;
  END IF;
  
  IF user_record.bio IS NOT NULL AND user_record.bio != '' THEN
    completion := completion + 10;
  END IF;
  
  -- Profile image (20%)
  IF user_record.profile_image IS NOT NULL AND user_record.profile_image != '' THEN
    completion := completion + 20;
  END IF;
  
  -- Role-specific (40%)
  IF user_record.role = 'sitter' THEN
    IF user_record.hourly_rate IS NOT NULL AND user_record.hourly_rate > 0 THEN
      completion := completion + 20;
    END IF;
    
    IF user_record.experience_years IS NOT NULL AND user_record.experience_years >= 0 THEN
      completion := completion + 20;
    END IF;
  ELSE
    -- For owners, check if they have pets
    IF EXISTS (SELECT 1 FROM pets WHERE owner_id = user_id LIMIT 1) THEN
      completion := completion + 40;
    END IF;
  END IF;
  
  RETURN completion;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update profile completion
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion := calculate_profile_completion(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profile_completion ON users;
CREATE TRIGGER trigger_update_profile_completion
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

-- Update all existing users' profile completion
UPDATE users SET profile_completion = calculate_profile_completion(id);
