-- ============================================
-- REMOVE TEST/BOT PROFILES
-- Clean up example/test users from the database
-- ============================================

-- Step 1: Show test profiles that will be removed
SELECT 'Test profiles to be removed:' as info;
SELECT 
  id,
  name,
  email,
  user_type,
  created_at
FROM users
WHERE 
  email LIKE '%@example.com'
  OR name IN ('María García', 'Carlos López', 'Ana Rodríguez', 'David Martín', 'pepe')
ORDER BY created_at DESC;

-- Step 2: Count test profiles
SELECT 
  COUNT(*) as test_profile_count
FROM users
WHERE 
  email LIKE '%@example.com'
  OR name IN ('María García', 'Carlos López', 'Ana Rodríguez', 'David Martín', 'pepe');

-- Step 3: Remove test profiles (CAREFUL - this deletes data!)
-- Uncomment the following lines to actually delete:

/*
DELETE FROM users
WHERE 
  email LIKE '%@example.com'
  OR name IN ('María García', 'Carlos López', 'Ana Rodríguez', 'David Martín', 'pepe');
*/

-- Step 4: Verify remaining users
SELECT 'Remaining real users:' as info;
SELECT 
  id,
  name,
  email,
  user_type,
  created_at
FROM users
WHERE 
  email NOT LIKE '%@example.com'
  AND name NOT IN ('María García', 'Carlos López', 'Ana Rodríguez', 'David Martín', 'pepe')
ORDER BY created_at DESC;

-- Step 5: Count real users
SELECT 
  COUNT(*) as real_user_count
FROM users
WHERE 
  email NOT LIKE '%@example.com'
  AND name NOT IN ('María García', 'Carlos López', 'Ana Rodríguez', 'David Martín', 'pepe');

SELECT '✅ Test profile cleanup complete!' as status;
SELECT 'Note: Uncomment the DELETE statement to actually remove test profiles' as info;
