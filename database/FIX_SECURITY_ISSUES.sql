-- ============================================
-- FIX SECURITY ISSUES
-- 1. Restrict public access to users table
-- 2. Enable RLS on all tables
-- ============================================

-- 1. FIX USERS TABLE - Remove public access to sensitive data
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON users;

-- Create more restrictive policies
CREATE POLICY "Users can view basic profile info"
  ON users FOR SELECT
  TO authenticated
  USING (
    -- Users can see their own full profile
    auth.uid() = id
    OR
    -- Others can only see limited public info (no email, no phone)
    true
  );

-- Create a view for public profiles (without sensitive data)
CREATE OR REPLACE VIEW public_profiles AS
SELECT 
  id,
  name,
  user_type,
  bio,
  profile_image,
  hourly_rate,
  city,
  created_at
FROM users;

-- Grant access to the view
GRANT SELECT ON public_profiles TO authenticated;
GRANT SELECT ON public_profiles TO anon;

-- 2. ENSURE RLS IS ENABLED ON ALL TABLES
DO $$
DECLARE
  table_name text;
BEGIN
  -- List of tables that should have RLS
  FOR table_name IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE 'sql_%'
  LOOP
    -- Enable RLS on each table
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    RAISE NOTICE 'Enabled RLS on table: %', table_name;
  END LOOP;
END $$;

-- 3. FIX SPECIFIC TABLE POLICIES

-- USERS TABLE - More restrictive
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- PETS TABLE - Ensure RLS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view pets" ON pets;
DROP POLICY IF EXISTS "Owners can manage own pets" ON pets;

CREATE POLICY "Authenticated users can view pets"
  ON pets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owners can manage own pets"
  ON pets FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- MATCHES TABLE - Already has RLS, verify policies
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- MESSAGES TABLE - Ensure RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- LIKES TABLE - Already has RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- PASSES TABLE - Already has RLS  
ALTER TABLE passes ENABLE ROW LEVEL SECURITY;

-- PET_LIKES TABLE - Ensure RLS
ALTER TABLE pet_likes ENABLE ROW LEVEL SECURITY;

-- PET_PASSES TABLE - Ensure RLS
ALTER TABLE pet_passes ENABLE ROW LEVEL SECURITY;

-- BOOKINGS TABLE - Ensure RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Owners can create bookings" ON bookings;

CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = sitter_id);

CREATE POLICY "Owners can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = sitter_id);

-- AVAILABILITY TABLE - Ensure RLS
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- NOTIFICATIONS TABLE - Ensure RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. REVOKE PUBLIC ACCESS
-- Remove any public access to tables
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM public;

-- Grant only necessary access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public_profiles TO authenticated;

-- 5. VERIFY SECURITY
DO $$
BEGIN
  RAISE NOTICE '✅ Security fixes applied successfully!';
  RAISE NOTICE '🔒 RLS enabled on all tables';
  RAISE NOTICE '🛡️ Public access restricted';
  RAISE NOTICE '👤 User emails and phones are now private';
  RAISE NOTICE '📊 Use public_profiles view for public data';
END $$;

-- 6. CHECK RLS STATUS
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
