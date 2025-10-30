-- ============================================
-- DIAGNOSTIC SCRIPT FOR PROFILE UPDATE ISSUES
-- Run this in Supabase SQL Editor to diagnose the problem
-- ============================================

-- 1. Check if users table exists and has correct structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 2. Check RLS policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';

-- 3. Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- 4. Test if you can see your own user record (replace YOUR_USER_ID with actual ID)
-- Get your user ID first:
SELECT auth.uid() as my_user_id;

-- Then check if you can select your record:
SELECT * FROM users WHERE id = auth.uid();

-- 5. Check if there are any triggers that might interfere
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users';

-- ============================================
-- POTENTIAL FIX: Recreate UPDATE policy
-- ============================================

-- Drop and recreate the update policy with explicit RETURNING clause support
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- TEST THE UPDATE
-- ============================================

-- Try updating your own profile (this should work if policies are correct)
UPDATE users 
SET 
  name = 'Test Name',
  updated_at = NOW()
WHERE id = auth.uid()
RETURNING *;

-- If the above returns a row, the update worked!
-- If it returns nothing, there's an RLS policy issue

-- ============================================
-- ALTERNATIVE: Disable RLS temporarily for testing
-- WARNING: Only do this in development, never in production!
-- ============================================

-- To test if RLS is the issue, you can temporarily disable it:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Then try your update again from the app
-- If it works, the issue is definitely the RLS policy

-- Re-enable RLS after testing:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
