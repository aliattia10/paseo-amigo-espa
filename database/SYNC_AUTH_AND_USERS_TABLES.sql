-- ============================================
-- SYNC AUTH.USERS WITH PUBLIC.USERS TABLE
-- This fixes the mismatch between authentication and user profiles
-- ============================================

-- Step 1: Check current situation
SELECT 'Auth Users (from auth.users):' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

SELECT 'Public Users (from users table):' as info;
SELECT id, name, email, created_at FROM users ORDER BY created_at DESC;

-- Step 2: Find auth users that don't have a profile in users table
SELECT 'Auth users WITHOUT profile in users table:' as info;
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;

-- Step 3: Create missing user profiles for all auth users
INSERT INTO users (id, email, name, phone, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', SPLIT_PART(au.email, '@', 1)) as name,
  COALESCE(au.raw_user_meta_data->>'phone', '') as phone,  -- Default to empty string if no phone
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 4: Verify all auth users now have profiles
SELECT 'Verification - All auth users should now have profiles:' as info;
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  u.id as user_id,
  u.name as user_name,
  u.email as user_email,
  CASE WHEN u.id IS NULL THEN '❌ MISSING' ELSE '✅ EXISTS' END as status
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
ORDER BY au.created_at DESC;

-- Step 5: Check if current logged-in user has a profile
SELECT 'Current logged-in user profile:' as info;
SELECT 
  auth.uid() as my_auth_id,
  u.id as my_user_id,
  u.name,
  u.email,
  CASE WHEN u.id IS NULL THEN '❌ PROFILE MISSING - RUN THIS SCRIPT!' ELSE '✅ PROFILE EXISTS' END as status
FROM users u
WHERE u.id = auth.uid();

-- Step 6: Test update capability
SELECT 'Testing if you can update your profile:' as info;
UPDATE users 
SET 
  name = COALESCE(name, 'User'),
  updated_at = NOW()
WHERE id = auth.uid()
RETURNING id, name, email, updated_at;

-- ============================================
-- OPTIONAL: Clean up orphaned users
-- (Users in users table that don't have auth accounts)
-- ============================================

-- First, see which users are orphaned
SELECT 'Orphaned users (in users table but not in auth.users):' as info;
SELECT u.id, u.name, u.email, u.created_at
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL;

-- If you want to delete orphaned users (BE CAREFUL!):
-- DELETE FROM users 
-- WHERE id IN (
--   SELECT u.id
--   FROM users u
--   LEFT JOIN auth.users au ON u.id = au.id
--   WHERE au.id IS NULL
-- );

-- ============================================
-- FINAL VERIFICATION
-- ============================================

SELECT '=== FINAL STATUS ===' as info;
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM users) as total_user_profiles,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN users u ON au.id = u.id WHERE u.id IS NULL) as missing_profiles,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users au LEFT JOIN users u ON au.id = u.id WHERE u.id IS NULL) = 0 
    THEN '✅ ALL SYNCED' 
    ELSE '❌ SYNC NEEDED' 
  END as sync_status;
