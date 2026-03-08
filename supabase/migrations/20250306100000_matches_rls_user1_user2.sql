-- Ensure matches RLS policy (supports user_id/matched_user_id or user1_id/user2_id).

DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their matches" ON public.matches;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user_id') THEN
    CREATE POLICY "Users can view their matches" ON public.matches FOR SELECT
      USING (auth.uid() = user_id OR auth.uid() = matched_user_id);
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user1_id') THEN
    CREATE POLICY "Users can view their matches" ON public.matches FOR SELECT
      USING (auth.uid() = user1_id OR auth.uid() = user2_id);
  END IF;
END $$;
