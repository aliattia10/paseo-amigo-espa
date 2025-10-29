-- Drop existing function if it exists
DROP FUNCTION IF EXISTS check_and_create_match(UUID, UUID);

-- First, let's check and fix the likes table structure
-- Drop the table if it exists with wrong structure and recreate it
DROP TABLE IF EXISTS likes CASCADE;

-- Create likes table with correct structure
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(liker_id, liked_id)
);

-- Add indexes for performance
CREATE INDEX idx_likes_liker_id ON likes(liker_id);
CREATE INDEX idx_likes_liked_id ON likes(liked_id);
CREATE INDEX idx_likes_mutual ON likes(liker_id, liked_id);

-- Enable RLS on likes table
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for likes table
CREATE POLICY "Users can view their own likes"
  ON likes FOR SELECT
  USING (auth.uid() = liker_id);

CREATE POLICY "Users can create their own likes"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = liker_id);

CREATE POLICY "Users can delete their own likes"
  ON likes FOR DELETE
  USING (auth.uid() = liker_id);

-- Function to check for mutual likes and create a match
-- This function is called when a user likes another user's profile
-- It checks if the other user has already liked them back
-- If yes, it creates a match record and returns true
CREATE OR REPLACE FUNCTION check_and_create_match(
  liker_user_id UUID,
  liked_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  mutual_like_exists BOOLEAN;
  match_already_exists BOOLEAN;
BEGIN
  -- First, insert the like into the likes table (if not already exists)
  INSERT INTO likes (liker_id, liked_id, created_at)
  VALUES (liker_user_id, liked_user_id, NOW())
  ON CONFLICT (liker_id, liked_id) DO NOTHING;
  
  -- Check if the other user has also liked this user
  SELECT EXISTS (
    SELECT 1 FROM likes
    WHERE liker_id = liked_user_id
    AND liked_id = liker_user_id
  ) INTO mutual_like_exists;
  
  -- If mutual like exists, check if match already exists
  IF mutual_like_exists THEN
    SELECT EXISTS (
      SELECT 1 FROM matches
      WHERE (user1_id = liker_user_id AND user2_id = liked_user_id)
         OR (user1_id = liked_user_id AND user2_id = liker_user_id)
    ) INTO match_already_exists;
    
    -- Create match if it doesn't exist
    IF NOT match_already_exists THEN
      INSERT INTO matches (user1_id, user2_id, created_at)
      VALUES (
        LEAST(liker_user_id, liked_user_id),
        GREATEST(liker_user_id, liked_user_id),
        NOW()
      );
      RETURN TRUE; -- It's a match!
    END IF;
  END IF;
  
  RETURN FALSE; -- No match (yet)
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION check_and_create_match(UUID, UUID) TO authenticated;
