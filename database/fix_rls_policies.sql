-- Fix RLS policies to allow user registration
-- This script addresses the "new row violates row-level security policy for table 'users'" error

-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Create a policy that allows authenticated users to insert their own profile
-- This works with Supabase Auth where auth.uid() returns the authenticated user's ID
CREATE POLICY "Users can insert their own profile" ON users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Also create a policy that allows service role to insert users (for backend operations)
-- This is needed if the backend needs to create users directly
CREATE POLICY "Service role can insert users" ON users 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Alternative fallback: If the above doesn't work, use this more permissive policy for registration
-- Uncomment the following lines and comment out the above if needed:
-- DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
-- DROP POLICY IF EXISTS "Service role can insert users" ON users;
-- CREATE POLICY "Allow user registration" ON users 
-- FOR INSERT 
-- WITH CHECK (true);

-- Keep the existing policies for SELECT and UPDATE to maintain security
-- Users can only view and update their own profiles
