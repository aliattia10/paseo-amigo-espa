-- Complete RLS Policy Fix for Paseo App
-- Run this in your Supabase SQL Editor to fix the signup issues

-- First, let's check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;

-- Create new, more permissive policies

-- 1. Allow anyone to insert users (for registration)
CREATE POLICY "Allow user registration" ON users 
FOR INSERT 
WITH CHECK (true);

-- 2. Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON users 
FOR SELECT 
USING (auth.uid() = id);

-- 3. Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON users 
FOR UPDATE 
USING (auth.uid() = id);

-- 4. Allow service role to do everything (for backend operations)
CREATE POLICY "Service role full access" ON users 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Test the policies by trying to insert a test user (this will fail if policies are wrong)
-- You can uncomment this to test:
-- INSERT INTO users (id, name, email, phone, city, postal_code, user_type) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Test User', 'test@example.com', '123456789', 'Test City', '12345', 'owner');

-- If the above insert works, the policies are correct
-- If it fails, there might be other constraints (like email uniqueness)
