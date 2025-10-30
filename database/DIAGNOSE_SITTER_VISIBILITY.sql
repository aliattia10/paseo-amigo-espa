-- ============================================
-- DIAGNOSE WHY SITTERS AREN'T SHOWING UP
-- ============================================

-- Step 1: Check all users and their types
SELECT 'All users in database:' as info;
SELECT 
  id,
  name,
  email,
  user_type,
  profile_image,
  created_at
FROM users
ORDER BY created_at DESC;

-- Step 2: Check which users should show as sitters
SELECT 'Users that should show as sitters:' as info;
SELECT 
  id,
  name,
  email,
  user_type,
  CASE 
    WHEN user_type IN ('walker', 'sitter', 'both') THEN '✅ Will show'
    ELSE '❌ Won''t show'
  END as visibility
FROM users
ORDER BY created_at DESC;

-- Step 3: Check if any users have NULL user_type
SELECT 'Users with NULL user_type:' as info;
SELECT 
  id,
  name,
  email,
  user_type
FROM users
WHERE user_type IS NULL;

-- Step 4: To make a user show as a sitter, run one of these:
SELECT 'To fix, run one of these commands:' as info;

-- Option 1: Make user a sitter only
-- UPDATE users SET user_type = 'sitter' WHERE email = 'your-email@example.com';

-- Option 2: Make user both owner and sitter
-- UPDATE users SET user_type = 'both' WHERE email = 'your-email@example.com';

-- Option 3: Make user a walker (same as sitter)
-- UPDATE users SET user_type = 'walker' WHERE email = 'your-email@example.com';

SELECT '💡 TIP: Use user_type = ''both'' if you want to be both owner and sitter' as tip;
