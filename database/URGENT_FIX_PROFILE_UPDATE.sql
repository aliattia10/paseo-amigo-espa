-- URGENT FIX: Profile Update RLS Policy
-- Run this IMMEDIATELY in Supabase SQL Editor

-- Step 1: Drop ALL existing policies on users table
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Step 2: Create a simple, working UPDATE policy
CREATE POLICY "allow_user_update_own_profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 3: Verify the policy was created
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'allow_user_update_own_profile'
    ) THEN
        RAISE NOTICE '✓ SUCCESS: Profile update policy created!';
    ELSE
        RAISE EXCEPTION '✗ FAILED: Policy was not created';
    END IF;
END $$;

-- Step 4: Grant UPDATE permission
GRANT UPDATE ON users TO authenticated;

-- Step 5: Test query (optional - uncomment to test)
-- SELECT 
--     schemaname,
--     tablename,
--     policyname,
--     permissive,
--     roles,
--     cmd,
--     qual,
--     with_check
-- FROM pg_policies
-- WHERE tablename = 'users';

RAISE NOTICE '========================================';
RAISE NOTICE 'Profile update fix applied successfully!';
RAISE NOTICE 'You can now update your profile.';
RAISE NOTICE '========================================';
