-- ============================================
-- FIX PHONE COLUMN CONSTRAINT
-- Make phone nullable so users can sign up without a phone number
-- ============================================

-- Step 1: Check current constraint
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'phone';

-- Step 2: Make phone column nullable
ALTER TABLE users 
ALTER COLUMN phone DROP NOT NULL;

-- Step 3: Verify the change
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'phone';

-- Step 4: Now create missing user profiles
INSERT INTO users (id, email, name, phone, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', SPLIT_PART(au.email, '@', 1)) as name,
  au.raw_user_meta_data->>'phone' as phone,  -- Can be NULL now
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
RETURNING id, name, email, phone, updated_at;

SELECT '✅ Phone constraint fixed and users synced!' as status;
