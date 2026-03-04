-- =====================================================
-- FIX CRITICAL RLS ISSUES (Dashboard, Bookings, Users, Sitter earnings)
-- =====================================================
-- 1. subscription_plans: enable read so dashboard stops hanging
-- 2. bookings: allow both owner and sitter to SELECT
-- 3. users: allow authenticated users to read (for joins / public profile)
-- 4. sitter_earnings: allow sitters to read own rows (if table exists)
-- =====================================================

-- -----------------------------------------------------------
-- 1. subscription_plans (Critical for Dashboard Load)
-- -----------------------------------------------------------
ALTER TABLE IF EXISTS public.subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable public read access" ON public.subscription_plans;
CREATE POLICY "Enable public read access"
  ON public.subscription_plans
  FOR SELECT
  TO public
  USING (true);


-- -----------------------------------------------------------
-- 2. bookings (Critical for Profile/Bookings Page)
-- -----------------------------------------------------------
ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop any existing SELECT policies that might restrict to only one party
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Owner can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Sitter can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users and Sitters can view their own bookings" ON public.bookings;

CREATE POLICY "Users and Sitters can view their own bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = owner_id
    OR auth.uid() = sitter_id
  );


-- -----------------------------------------------------------
-- 3. users / Public profiles (for joins and FK lookups)
-- -----------------------------------------------------------
-- Allow any authenticated user to SELECT from users so that:
-- - Bookings join (owner:users, sitter:users) returns names
-- - Public profile / match cards can show other users' basic info
DROP POLICY IF EXISTS "Authenticated can read users for joins" ON public.users;
CREATE POLICY "Authenticated can read users for joins"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);


-- -----------------------------------------------------------
-- 4. sitter_earnings (Sitters view own earnings)
-- -----------------------------------------------------------
-- Only create if table exists (name may vary per project)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'sitter_earnings'
  ) THEN
    ALTER TABLE public.sitter_earnings ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Sitters can view own earnings" ON public.sitter_earnings;
    CREATE POLICY "Sitters can view own earnings"
      ON public.sitter_earnings
      FOR SELECT
      TO authenticated
      USING (auth.uid() = sitter_id);
  END IF;
END $$;
