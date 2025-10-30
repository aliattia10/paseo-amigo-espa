-- ============================================
-- COMPLETE FIX FOR ALL ISSUES
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. FIX USER_TYPE FOR SITTERS
-- ============================================

-- Check current user types
SELECT 'Current user types:' as info;
SELECT id, name, email, user_type FROM users ORDER BY created_at DESC;

-- Update NULL user_types to 'owner' by default
UPDATE users SET user_type = 'owner' WHERE user_type IS NULL;

-- If you want to set specific users as sitters, run this:
-- UPDATE users SET user_type = 'sitter' WHERE email = 'your-sitter-email@example.com';
-- Or use 'both' if they can be both owner and sitter:
-- UPDATE users SET user_type = 'both' WHERE email = 'your-email@example.com';

SELECT 'Updated user types:' as info;
SELECT id, name, email, user_type FROM users ORDER BY created_at DESC;

-- ============================================
-- 2. CREATE/FIX LIKES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(liker_id, liked_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_liker_id ON likes(liker_id);
CREATE INDEX IF NOT EXISTS idx_likes_liked_id ON likes(liked_id);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own likes" ON likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;

CREATE POLICY "Users can view their own likes" ON likes FOR SELECT USING (auth.uid() = liker_id OR auth.uid() = liked_id);
CREATE POLICY "Users can create their own likes" ON likes FOR INSERT WITH CHECK (auth.uid() = liker_id);
CREATE POLICY "Users can delete their own likes" ON likes FOR DELETE USING (auth.uid() = liker_id);

-- ============================================
-- 3. CREATE/FIX MATCHES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
CREATE POLICY "Users can view their own matches" ON matches FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ============================================
-- 4. CREATE MATCH FUNCTION
-- ============================================

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
  -- Insert the like
  INSERT INTO likes (liker_id, liked_id, created_at)
  VALUES (liker_user_id, liked_user_id, NOW())
  ON CONFLICT (liker_id, liked_id) DO NOTHING;
  
  -- Check if mutual like exists
  SELECT EXISTS (
    SELECT 1 FROM likes
    WHERE liker_id = liked_user_id AND liked_id = liker_user_id
  ) INTO mutual_like_exists;
  
  -- If mutual like exists, create match
  IF mutual_like_exists THEN
    SELECT EXISTS (
      SELECT 1 FROM matches
      WHERE user1_id = LEAST(liker_user_id, liked_user_id)
        AND user2_id = GREATEST(liker_user_id, liked_user_id)
    ) INTO match_already_exists;
    
    IF NOT match_already_exists THEN
      INSERT INTO matches (user1_id, user2_id, created_at)
      VALUES (
        LEAST(liker_user_id, liked_user_id),
        GREATEST(liker_user_id, liked_user_id),
        NOW()
      );
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION check_and_create_match(UUID, UUID) TO authenticated;

-- ============================================
-- 5. VERIFY EVERYTHING
-- ============================================

SELECT '=== VERIFICATION ===' as info;

SELECT 'Users with user_type:' as info;
SELECT 
  user_type,
  COUNT(*) as count
FROM users
GROUP BY user_type;

SELECT 'Likes table exists:' as info;
SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'likes') as likes_exists;

SELECT 'Matches table exists:' as info;
SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'matches') as matches_exists;

SELECT 'Match function exists:' as info;
SELECT EXISTS(
  SELECT 1 FROM pg_proc 
  WHERE proname = 'check_and_create_match'
) as function_exists;

SELECT '✅ ALL FIXES APPLIED!' as status;
SELECT 'Now refresh your app and try again' as next_step;
