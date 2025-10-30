-- SIMPLE PROFILE UPDATE FIX
-- Copy and paste this entire block into Supabase SQL Editor and click RUN

-- Remove old policies
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new policy
CREATE POLICY "allow_user_update_own_profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Grant permission
GRANT UPDATE ON users TO authenticated;

-- Done! Your profile updates should now work.
