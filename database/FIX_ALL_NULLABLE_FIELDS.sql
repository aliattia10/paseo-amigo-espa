-- ============================================
-- FIX ALL NULLABLE FIELDS IN USERS TABLE
-- Make optional fields nullable so users can sign up with minimal info
-- ============================================

-- Step 1: Check current NOT NULL constraints
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND is_nullable = 'NO'
ORDER BY ordinal_position;

-- Step 2: Make all optional fields nullable
-- Only email, id, and created_at should be required

ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE users ALTER COLUMN city DROP NOT NULL;
ALTER TABLE users ALTER COLUMN postal_code DROP NOT NULL;
ALTER TABLE users ALTER COLUMN name DROP NOT NULL;
ALTER TABLE users ALTER COLUMN bio DROP NOT NULL;
ALTER TABLE users ALTER COLUMN user_type DROP NOT NULL;

-- Step 3: Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Step 4: Now create missing user profiles with minimal data
INSERT INTO users (id, email, name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'name',
    au.raw_user_meta_data->>'full_name',
    SPLIT_PART(au.email, '@', 1),
    'User'
  ) as name,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 5: Verify all auth users now have profiles
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  u.id as user_id,
  u.name as user_name,
  u.phone,
  u.city,
  CASE WHEN u.id IS NULL THEN '❌ MISSING' ELSE '✅ EXISTS' END as status
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
ORDER BY au.created_at DESC;

-- Step 6: Test if current user can update their profile
UPDATE users 
SET 
  name = COALESCE(name, 'User'),
  updated_at = NOW()
WHERE id = auth.uid()
RETURNING id, name, email, phone, city, updated_at;

-- Step 7: Show final status
SELECT 
  '✅ All nullable constraints fixed!' as status,
  'Users can now sign up with just email and password' as info,
  'Profile fields can be filled in later' as note;

-- Step 8: Count synced users
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM users) as total_user_profiles,
  (SELECT COUNT(*) 
   FROM auth.users au 
   LEFT JOIN users u ON au.id = u.id 
   WHERE u.id IS NULL) as missing_profiles,
  CASE 
    WHEN (SELECT COUNT(*) 
          FROM auth.users au 
          LEFT JOIN users u ON au.id = u.id 
          WHERE u.id IS NULL) = 0 
    THEN '✅ ALL SYNCED' 
    ELSE '❌ SYNC NEEDED' 
  END as sync_status;
