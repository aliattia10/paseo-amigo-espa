-- ============================================
-- MATCHES TABLE FOR TINDER-STYLE MATCHING
-- ============================================

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure users can't match with themselves
  CONSTRAINT different_users CHECK (user1_id != user2_id),
  
  -- Ensure unique match (prevent duplicates)
  CONSTRAINT unique_match UNIQUE (user1_id, user2_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id, matched_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id, matched_at DESC);

-- Create likes table to track who liked whom
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  liked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure users can't like themselves
  CONSTRAINT different_users_like CHECK (liker_id != liked_id),
  
  -- Ensure unique like (prevent duplicates)
  CONSTRAINT unique_like UNIQUE (liker_id, liked_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_likes_liker ON likes(liker_id);
CREATE INDEX IF NOT EXISTS idx_likes_liked ON likes(liked_id);

-- ============================================
-- FUNCTION TO CHECK AND CREATE MATCH
-- ============================================

CREATE OR REPLACE FUNCTION check_and_create_match(
  p_liker_id UUID,
  p_liked_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_match BOOLEAN := FALSE;
  v_match_id UUID;
BEGIN
  -- Insert the like
  INSERT INTO likes (liker_id, liked_id)
  VALUES (p_liker_id, p_liked_id)
  ON CONFLICT (liker_id, liked_id) DO NOTHING;
  
  -- Check if the other person also liked this user
  IF EXISTS (
    SELECT 1 FROM likes 
    WHERE liker_id = p_liked_id AND liked_id = p_liker_id
  ) THEN
    -- It's a match! Create match record
    INSERT INTO matches (user1_id, user2_id)
    VALUES (
      LEAST(p_liker_id, p_liked_id),
      GREATEST(p_liker_id, p_liked_id)
    )
    ON CONFLICT (user1_id, user2_id) DO NOTHING
    RETURNING id INTO v_match_id;
    
    IF v_match_id IS NOT NULL THEN
      -- Create notifications for both users
      INSERT INTO notifications (user_id, type, title, message, related_id)
      VALUES 
        (p_liker_id, 'match', '🎉 It''s a Match!', 'You and ' || (SELECT name FROM users WHERE id = p_liked_id) || ' liked each other!', v_match_id),
        (p_liked_id, 'match', '🎉 It''s a Match!', 'You and ' || (SELECT name FROM users WHERE id = p_liker_id) || ' liked each other!', v_match_id);
      
      v_is_match := TRUE;
    END IF;
  END IF;
  
  RETURN v_is_match;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS POLICIES FOR MATCHES
-- ============================================

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
CREATE POLICY "Users can view their own matches" 
ON matches FOR SELECT 
TO authenticated 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ============================================
-- RLS POLICIES FOR LIKES
-- ============================================

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own likes" ON likes;
CREATE POLICY "Users can view their own likes" 
ON likes FOR SELECT 
TO authenticated 
USING (auth.uid() = liker_id OR auth.uid() = liked_id);

DROP POLICY IF EXISTS "Users can create likes" ON likes;
CREATE POLICY "Users can create likes" 
ON likes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = liker_id);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Matches system created successfully!';
  RAISE NOTICE 'Tables: matches, likes';
  RAISE NOTICE 'Function: check_and_create_match()';
  RAISE NOTICE 'Ready for Tinder-style matching!';
END $$;
