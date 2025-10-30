-- ============================================
-- FIX MATCHING SYSTEM
-- This ensures likes and matches tables exist and work properly
-- ============================================

-- Step 1: Create likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(liker_id, liked_id)
);

-- Step 2: Create matches table if it doesn't exist
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id) -- Ensure consistent ordering
);

-- Step 3: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_likes_liker_id ON likes(liker_id);
CREATE INDEX IF NOT EXISTS idx_likes_liked_id ON likes(liked_id);
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id);

-- Step 4: Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies
DROP POLICY IF EXISTS "Users can view their own likes" ON likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;
DROP POLICY IF EXISTS "Users can view their own matches" ON matches;

-- Step 6: Create RLS policies for likes
CREATE POLICY "Users can view their own likes"
  ON likes FOR SELECT
  USING (auth.uid() = liker_id OR auth.uid() = liked_id);

CREATE POLICY "Users can create their own likes"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = liker_id);

CREATE POLICY "Users can delete their own likes"
  ON likes FOR DELETE
  USING (auth.uid() = liker_id);

-- Step 7: Create RLS policies for matches
CREATE POLICY "Users can view their own matches"
  ON matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Step 8: Drop and recreate the match function
DROP FUNCTION IF EXISTS check_and_create_match(UUID, UUID);

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
      WHERE (user1_id = LEAST(liker_user_id, liked_user_id) 
         AND user2_id = GREATEST(liker_user_id, liked_user_id))
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

-- Step 9: Grant execute permission
GRANT EXECUTE ON FUNCTION check_and_create_match(UUID, UUID) TO authenticated;

-- Step 10: Test the function
SELECT '✅ Matching system setup complete!' as status;
SELECT 'Tables created: likes, matches' as info;
SELECT 'Function created: check_and_create_match' as info;

-- Step 11: Show current likes and matches
SELECT 'Current likes:' as info;
SELECT 
  l.id,
  u1.name as liker_name,
  u2.name as liked_name,
  l.created_at
FROM likes l
LEFT JOIN users u1 ON l.liker_id = u1.id
LEFT JOIN users u2 ON l.liked_id = u2.id
ORDER BY l.created_at DESC
LIMIT 10;

SELECT 'Current matches:' as info;
SELECT 
  m.id,
  u1.name as user1_name,
  u2.name as user2_name,
  m.created_at
FROM matches m
LEFT JOIN users u1 ON m.user1_id = u1.id
LEFT JOIN users u2 ON m.user2_id = u2.id
ORDER BY m.created_at DESC
LIMIT 10;
