-- ============================================
-- FIX USER ID MISMATCH ISSUE
-- This script checks if your auth user ID matches your users table record
-- ============================================

-- Step 1: Check your current auth user ID
SELECT auth.uid() as auth_user_id;

-- Step 2: Check if you have a record in the users table
SELECT id, name, email, created_at 
FROM users 
WHERE id = auth.uid();

-- Step 3: If the above returns nothing, check all users in the table
-- (This will help identify if your user exists with a different ID)
SELECT id, name, email, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- Step 4: Check auth.users table to see your actual auth record
SELECT id, email, created_at 
FROM auth.users 
WHERE id = auth.uid();

-- ============================================
-- SOLUTION 1: If user record doesn't exist, create it
-- ============================================

-- First, get your auth user info
DO $$
DECLARE
  v_user_id uuid;
  v_email text;
  v_user_exists boolean;
BEGIN
  -- Get current auth user
  SELECT auth.uid() INTO v_user_id;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'ERROR: No authenticated user. Please log in first.';
    RETURN;
  END IF;
  
  -- Get email from auth.users
  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;
  
  -- Check if user exists in users table
  SELECT EXISTS(SELECT 1 FROM users WHERE id = v_user_id) INTO v_user_exists;
  
  IF NOT v_user_exists THEN
    RAISE NOTICE 'User record does not exist in users table. Creating...';
    
    -- Create the user record
    INSERT INTO users (id, email, name, created_at, updated_at)
    VALUES (
      v_user_id,
      v_email,
      COALESCE(SPLIT_PART(v_email, '@', 1), 'User'),
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'User record created successfully!';
  ELSE
    RAISE NOTICE 'User record already exists.';
  END IF;
END $$;

-- Step 5: Verify the user now exists
SELECT id, name, email, created_at 
FROM users 
WHERE id = auth.uid();

-- ============================================
-- SOLUTION 2: If you have duplicate users, merge them
-- ============================================

-- This is more complex and should only be done if you have duplicate records
-- Contact support or run this carefully

-- ============================================
-- TEST THE UPDATE AGAIN
-- ============================================

-- After running the above, test if you can update your profile
UPDATE users 
SET 
  name = 'Test Update ' || NOW()::text,
  updated_at = NOW()
WHERE id = auth.uid()
RETURNING id, name, email, updated_at;

-- If the above returns a row, your profile update should now work!
