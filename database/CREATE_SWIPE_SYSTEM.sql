-- ============================================
-- COMPLETE SWIPE & INTERACTION SYSTEM
-- Stores likes, passes, and enables matching
-- ============================================

-- 1. LIKES TABLE (already exists from add_match_function.sql, but let's ensure it's correct)
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(liker_id, liked_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_likes_liker_id ON likes(liker_id);
CREATE INDEX IF NOT EXISTS idx_likes_liked_id ON likes(liked_id);
CREATE INDEX IF NOT EXISTS idx_likes_mutual ON likes(liker_id, liked_id);

-- 2. PASSES TABLE (new - track who user passed on)
CREATE TABLE IF NOT EXISTS passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  passed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(passer_id, passed_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_passes_passer_id ON passes(passer_id);
CREATE INDEX IF NOT EXISTS idx_passes_passed_id ON passes(passed_id);

-- 2B. PET_LIKES TABLE (sitters liking pets)
CREATE TABLE IF NOT EXISTS pet_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sitter_id, pet_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_pet_likes_sitter_id ON pet_likes(sitter_id);
CREATE INDEX IF NOT EXISTS idx_pet_likes_pet_id ON pet_likes(pet_id);

-- 2C. PET_PASSES TABLE (sitters passing on pets)
CREATE TABLE IF NOT EXISTS pet_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sitter_id, pet_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_pet_passes_sitter_id ON pet_passes(sitter_id);
CREATE INDEX IF NOT EXISTS idx_pet_passes_pet_id ON pet_passes(pet_id);

-- 3. MATCHES TABLE (ensure it exists with correct structure)
-- First check if table exists and add missing columns
DO $$ 
BEGIN
  -- Add last_message_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'last_message_at'
  ) THEN
    ALTER TABLE matches ADD COLUMN last_message_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add unread_count_user1 column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'unread_count_user1'
  ) THEN
    ALTER TABLE matches ADD COLUMN unread_count_user1 INTEGER DEFAULT 0;
  END IF;
  
  -- Add unread_count_user2 column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'unread_count_user2'
  ) THEN
    ALTER TABLE matches ADD COLUMN unread_count_user2 INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create table if it doesn't exist at all
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count_user1 INTEGER DEFAULT 0,
  unread_count_user2 INTEGER DEFAULT 0,
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id) -- Ensure consistent ordering
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_last_message ON matches(last_message_at DESC);

-- 4. MESSAGES TABLE (for chat between matches)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(match_id, read) WHERE read = FALSE;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- LIKES TABLE RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own likes" ON likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;

CREATE POLICY "Users can view their own likes"
  ON likes FOR SELECT
  USING (auth.uid() = liker_id OR auth.uid() = liked_id);

CREATE POLICY "Users can create their own likes"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = liker_id);

CREATE POLICY "Users can delete their own likes"
  ON likes FOR DELETE
  USING (auth.uid() = liker_id);

-- PASSES TABLE RLS
ALTER TABLE passes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own passes" ON passes;
DROP POLICY IF EXISTS "Users can create their own passes" ON passes;
DROP POLICY IF EXISTS "Users can delete their own passes" ON passes;

CREATE POLICY "Users can view their own passes"
  ON passes FOR SELECT
  USING (auth.uid() = passer_id);

CREATE POLICY "Users can create their own passes"
  ON passes FOR INSERT
  WITH CHECK (auth.uid() = passer_id);

CREATE POLICY "Users can delete their own passes"
  ON passes FOR DELETE
  USING (auth.uid() = passer_id);

-- PET_LIKES TABLE RLS
ALTER TABLE pet_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sitters can view their own pet likes" ON pet_likes;
DROP POLICY IF EXISTS "Sitters can create their own pet likes" ON pet_likes;
DROP POLICY IF EXISTS "Sitters can delete their own pet likes" ON pet_likes;

CREATE POLICY "Sitters can view their own pet likes"
  ON pet_likes FOR SELECT
  USING (auth.uid() = sitter_id);

CREATE POLICY "Sitters can create their own pet likes"
  ON pet_likes FOR INSERT
  WITH CHECK (auth.uid() = sitter_id);

CREATE POLICY "Sitters can delete their own pet likes"
  ON pet_likes FOR DELETE
  USING (auth.uid() = sitter_id);

-- PET_PASSES TABLE RLS
ALTER TABLE pet_passes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sitters can view their own pet passes" ON pet_passes;
DROP POLICY IF EXISTS "Sitters can create their own pet passes" ON pet_passes;
DROP POLICY IF EXISTS "Sitters can delete their own pet passes" ON pet_passes;

CREATE POLICY "Sitters can view their own pet passes"
  ON pet_passes FOR SELECT
  USING (auth.uid() = sitter_id);

CREATE POLICY "Sitters can create their own pet passes"
  ON pet_passes FOR INSERT
  WITH CHECK (auth.uid() = sitter_id);

CREATE POLICY "Sitters can delete their own pet passes"
  ON pet_passes FOR DELETE
  USING (auth.uid() = sitter_id);

-- MATCHES TABLE RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
DROP POLICY IF EXISTS "System can create matches" ON matches;
DROP POLICY IF EXISTS "Users can update their own matches" ON matches;

CREATE POLICY "Users can view their own matches"
  ON matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create matches"
  ON matches FOR INSERT
  WITH CHECK (true); -- Function will handle security

CREATE POLICY "Users can update their own matches"
  ON matches FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- MESSAGES TABLE RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their matches" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their matches" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

CREATE POLICY "Users can view messages in their matches"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their matches"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to check for mutual likes and create a match
DROP FUNCTION IF EXISTS check_and_create_match(UUID, UUID);

CREATE OR REPLACE FUNCTION check_and_create_match(
  liker_user_id UUID,
  liked_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
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
$func$;

-- Function to record a pass (user-to-user)
DROP FUNCTION IF EXISTS record_pass(UUID, UUID);

CREATE OR REPLACE FUNCTION record_pass(
  passer_user_id UUID,
  passed_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  -- Insert the pass into the passes table (if not already exists)
  INSERT INTO passes (passer_id, passed_id, created_at)
  VALUES (passer_user_id, passed_user_id, NOW())
  ON CONFLICT (passer_id, passed_id) DO NOTHING;
END;
$func$;

-- Function to record a pet like (sitter-to-pet)
DROP FUNCTION IF EXISTS record_pet_like(UUID, UUID);

CREATE OR REPLACE FUNCTION record_pet_like(
  p_sitter_id UUID,
  p_pet_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  -- Insert the pet like into the pet_likes table (if not already exists)
  INSERT INTO pet_likes (sitter_id, pet_id, created_at)
  VALUES (p_sitter_id, p_pet_id, NOW())
  ON CONFLICT (sitter_id, pet_id) DO NOTHING;
END;
$func$;

-- Function to record a pet pass (sitter-to-pet)
DROP FUNCTION IF EXISTS record_pet_pass(UUID, UUID);

CREATE OR REPLACE FUNCTION record_pet_pass(
  p_sitter_id UUID,
  p_pet_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  -- Insert the pet pass into the pet_passes table (if not already exists)
  INSERT INTO pet_passes (sitter_id, pet_id, created_at)
  VALUES (p_sitter_id, p_pet_id, NOW())
  ON CONFLICT (sitter_id, pet_id) DO NOTHING;
END;
$func$;

-- Function to get profiles user hasn't interacted with yet
DROP FUNCTION IF EXISTS get_available_profiles(UUID, TEXT);

CREATE OR REPLACE FUNCTION get_available_profiles(
  current_user_id UUID,
  profile_type TEXT -- 'sitter' or 'pet'
)
RETURNS TABLE (
  profile_id UUID,
  profile_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  IF profile_type = 'sitter' THEN
    -- Return sitters that current user hasn't liked or passed
    RETURN QUERY
    SELECT 
      u.id as profile_id,
      jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'bio', u.bio,
        'profile_image', u.profile_image,
        'hourly_rate', u.hourly_rate,
        'user_type', u.user_type
      ) as profile_data
    FROM users u
    WHERE u.id != current_user_id
    AND (u.user_type = 'walker' OR u.user_type = 'sitter' OR u.user_type = 'both')
    AND u.id NOT IN (
      SELECT liked_id FROM likes WHERE liker_id = current_user_id
    )
    AND u.id NOT IN (
      SELECT passed_id FROM passes WHERE passer_id = current_user_id
    )
    ORDER BY u.created_at DESC;
  ELSE
    -- Return pets that current user hasn't liked or passed
    RETURN QUERY
    SELECT 
      p.id as profile_id,
      jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'age', p.age,
        'image_url', p.image_url,
        'owner_id', p.owner_id
      ) as profile_data
    FROM pets p
    WHERE p.owner_id != current_user_id
    AND p.id NOT IN (
      SELECT liked_id FROM likes WHERE liker_id = current_user_id
    )
    AND p.id NOT IN (
      SELECT passed_id FROM passes WHERE passer_id = current_user_id
    )
    ORDER BY p.created_at DESC;
  END IF;
END;
$func$;

-- Function to send a message and update match metadata
DROP FUNCTION IF EXISTS send_message(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION send_message(
  p_match_id UUID,
  p_sender_id UUID,
  p_content TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  message_id UUID;
  other_user_id UUID;
BEGIN
  -- Insert the message
  INSERT INTO messages (match_id, sender_id, content, created_at)
  VALUES (p_match_id, p_sender_id, p_content, NOW())
  RETURNING id INTO message_id;
  
  -- Update match last_message_at and increment unread count for other user
  UPDATE matches
  SET 
    last_message_at = NOW(),
    unread_count_user1 = CASE 
      WHEN user2_id = p_sender_id THEN unread_count_user1 + 1 
      ELSE unread_count_user1 
    END,
    unread_count_user2 = CASE 
      WHEN user1_id = p_sender_id THEN unread_count_user2 + 1 
      ELSE unread_count_user2 
    END
  WHERE id = p_match_id;
  
  RETURN message_id;
END;
$func$;

-- Function to mark messages as read
DROP FUNCTION IF EXISTS mark_messages_read(UUID, UUID);

CREATE OR REPLACE FUNCTION mark_messages_read(
  p_match_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  -- Mark all messages in this match as read (except sender's own messages)
  UPDATE messages
  SET read = TRUE
  WHERE match_id = p_match_id
  AND sender_id != p_user_id
  AND read = FALSE;
  
  -- Reset unread count for this user
  UPDATE matches
  SET 
    unread_count_user1 = CASE WHEN user1_id = p_user_id THEN 0 ELSE unread_count_user1 END,
    unread_count_user2 = CASE WHEN user2_id = p_user_id THEN 0 ELSE unread_count_user2 END
  WHERE id = p_match_id;
END;
$func$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_and_create_match(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION record_pass(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION record_pet_like(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION record_pet_pass(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_profiles(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION send_message(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_messages_read(UUID, UUID) TO authenticated;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Swipe & Interaction System Created Successfully!';
  RAISE NOTICE '📊 Tables: likes, passes, pet_likes, pet_passes, matches, messages';
  RAISE NOTICE '🔒 RLS policies enabled on all tables';
  RAISE NOTICE '⚡ Functions: check_and_create_match, record_pass, record_pet_like, record_pet_pass, get_available_profiles, send_message, mark_messages_read';
  RAISE NOTICE '🎯 Ready for: Swiping, Matching, Messaging, and Booking flow';
END $$;
