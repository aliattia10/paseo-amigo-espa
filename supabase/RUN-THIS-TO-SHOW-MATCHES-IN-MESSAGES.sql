-- ============================================================================
-- Run this in Supabase SQL Editor if matches work (you get "It's a Match!")
-- but the Messages page shows "No conversations".
-- 1. Lets the app see match rows that use user1_id / user2_id.
-- 2. Lets authenticated users read other users' profiles (so chat list can show names/photos).
-- ============================================================================

-- 1. Allow SELECT on matches where current user is user1_id or user2_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user1_id'
  ) THEN
    DROP POLICY IF EXISTS "Users can view matches by user1_id user2_id" ON public.matches;
    CREATE POLICY "Users can view matches by user1_id user2_id"
      ON public.matches FOR SELECT
      USING (auth.uid() = user1_id OR auth.uid() = user2_id);
    RAISE NOTICE 'Policy created: matches visible by user1_id/user2_id';
  ELSE
    RAISE NOTICE 'Column user1_id not found on matches - skip';
  END IF;
END $$;

-- 2. Allow authenticated users to read other users (so Messages can show match names/avatars)
DROP POLICY IF EXISTS "Authenticated can read users for joins" ON public.users;
CREATE POLICY "Authenticated can read users for joins"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);
