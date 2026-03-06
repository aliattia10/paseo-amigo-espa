-- Allow users to see matches that use user1_id/user2_id (used by save_like_and_check_match).
-- Without this, RLS only allowed user_id/matched_user_id so match bubbles never appeared.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user1_id') THEN
    DROP POLICY IF EXISTS "Users can view matches by user1_id user2_id" ON public.matches;
    CREATE POLICY "Users can view matches by user1_id user2_id"
      ON public.matches FOR SELECT
      USING (auth.uid() = user1_id OR auth.uid() = user2_id);
  END IF;
END $$;
