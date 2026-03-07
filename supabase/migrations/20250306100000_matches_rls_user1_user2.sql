-- Ensure matches RLS policy covers user_id / matched_user_id.
-- The table uses user_id + matched_user_id (not user1_id/user2_id).

DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their matches" ON public.matches;
  CREATE POLICY "Users can view their matches"
    ON public.matches FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = matched_user_id);
END $$;
