-- ============================================================================
-- Messages page: ensure matches and conversations are visible
-- - Matches RLS: user can see rows where they are user_id or matched_user_id
-- - Users: authenticated can read other users (for chat list names/avatars)
-- - messages table for match-based chat (separate from chat_messages)
-- ============================================================================

-- 1. Matches: ensure SELECT policy allows viewing by user_id / matched_user_id
DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can view their matches" ON public.matches;
CREATE POLICY "Users can view their matches"
  ON public.matches FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

-- 2. Users: allow authenticated to read other users (Messages page needs names/avatars)
DROP POLICY IF EXISTS "Authenticated can read users for joins" ON public.users;
CREATE POLICY "Authenticated can read users for joins"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

-- 3. Match-based messages table (for Messages page chat)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view match messages" ON public.messages;
CREATE POLICY "Users can view match messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = messages.match_id
        AND (auth.uid() = m.user_id OR auth.uid() = m.matched_user_id)
    )
  );

DROP POLICY IF EXISTS "Users can send match messages" ON public.messages;
CREATE POLICY "Users can send match messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = messages.match_id
        AND (auth.uid() = m.user_id OR auth.uid() = m.matched_user_id)
    )
  );

-- 4. RPC for sending messages (used by ChatWindow)
CREATE OR REPLACE FUNCTION public.send_message(
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
  INSERT INTO public.messages (id, match_id, sender_id, content, created_at)
  VALUES (gen_random_uuid(), p_match_id, p_sender_id, p_content, NOW())
  RETURNING id INTO v_message_id;
  RETURN v_message_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_message(UUID, UUID, TEXT) TO authenticated;
