-- ============================================================================
-- Run this in Supabase SQL Editor if matches work (you get "It's a Match!")
-- but the Messages page shows "No conversations".
--
-- Supports matches with either: user_id/matched_user_id OR user1_id/user2_id.
-- ============================================================================

-- 1. Ensure the matches RLS policy (supports user_id/matched_user_id OR user1_id/user2_id)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their matches" ON public.matches;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user_id') THEN
    CREATE POLICY "Users can view their matches"
      ON public.matches FOR SELECT
      USING (auth.uid() = user_id OR auth.uid() = matched_user_id);
    RAISE NOTICE 'Policy created: matches visible by user_id/matched_user_id';
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user1_id') THEN
    CREATE POLICY "Users can view their matches"
      ON public.matches FOR SELECT
      USING (auth.uid() = user1_id OR auth.uid() = user2_id);
    RAISE NOTICE 'Policy created: matches visible by user1_id/user2_id';
  ELSE
    RAISE EXCEPTION 'matches table has neither user_id nor user1_id';
  END IF;
END $$;

-- 2. Allow authenticated users to read other users (so Messages can show match names/avatars)
DROP POLICY IF EXISTS "Authenticated can read users for joins" ON public.users;
CREATE POLICY "Authenticated can read users for joins"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

-- 3. Ensure the messages table exists (needed for match-based chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view match messages" ON messages;
DROP POLICY IF EXISTS "Users can send match messages" ON messages;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user_id') THEN
    CREATE POLICY "Users can view match messages"
      ON messages FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM matches m
          WHERE m.id = messages.match_id AND (auth.uid() = m.user_id OR auth.uid() = m.matched_user_id)
        )
      );
    CREATE POLICY "Users can send match messages"
      ON messages FOR INSERT
      WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
          SELECT 1 FROM matches m
          WHERE m.id = messages.match_id AND (auth.uid() = m.user_id OR auth.uid() = m.matched_user_id)
        )
      );
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user1_id') THEN
    CREATE POLICY "Users can view match messages"
      ON messages FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM matches m
          WHERE m.id = messages.match_id AND (auth.uid() = m.user1_id OR auth.uid() = m.user2_id)
        )
      );
    CREATE POLICY "Users can send match messages"
      ON messages FOR INSERT
      WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
          SELECT 1 FROM matches m
          WHERE m.id = messages.match_id AND (auth.uid() = m.user1_id OR auth.uid() = m.user2_id)
        )
      );
  END IF;
END $$;

-- 4. Create or replace the send_message RPC (so ChatWindow can send)
CREATE OR REPLACE FUNCTION send_message(
  p_match_id UUID,
  p_sender_id UUID,
  p_content TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message_id UUID;
BEGIN
  INSERT INTO messages (id, match_id, sender_id, content, created_at)
  VALUES (gen_random_uuid(), p_match_id, p_sender_id, p_content, NOW())
  RETURNING id INTO v_message_id;
  RETURN v_message_id;
END;
$$;
GRANT EXECUTE ON FUNCTION send_message(UUID, UUID, TEXT) TO authenticated;
