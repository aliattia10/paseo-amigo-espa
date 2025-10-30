# Fix Profile Update Error - Step by Step Guide

## The Problem
You're seeing: **"Save Failed: Profile update may have failed. Please check console for details."**

This is caused by Row Level Security (RLS) policies in Supabase blocking your profile updates.

## The Solution - Run This SQL

### Step 1: Go to Supabase
1. Open your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Copy and Paste This SQL

```sql
-- URGENT FIX: Profile Update RLS Policy
-- This will fix the "Save Failed" error

-- Drop all existing update policies
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create the correct policy
CREATE POLICY "allow_user_update_own_profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT UPDATE ON users TO authenticated;
```

### Step 3: Click "Run" Button

You should see a success message.

### Step 4: Test Your Profile

1. Go back to your app
2. Navigate to Profile → Edit Profile
3. Make a change (e.g., update your bio)
4. Click "Save"
5. ✅ It should now save successfully!

## Alternative: Use the SQL File

You can also run the file: `database/URGENT_FIX_PROFILE_UPDATE.sql`

## What This Does

- **Removes** old, conflicting RLS policies
- **Creates** a new, simple policy that allows users to update their own profile
- **Grants** the necessary permissions to authenticated users

## Verify It Worked

After running the SQL, you should be able to:
- ✅ Update your name
- ✅ Update your phone number
- ✅ Update your city and postal code
- ✅ Update your bio
- ✅ Update your hourly rate (for sitters)
- ✅ Upload photos

## Still Having Issues?

If you still see errors after running the SQL:

1. Check the browser console (F12) for detailed error messages
2. Make sure you're logged in
3. Try logging out and back in
4. Clear your browser cache

## Need More Help?

The SQL file `database/fix_profile_and_availability_errors.sql` contains additional fixes for:
- Availability table errors
- Hourly rate column
- All RLS policies

Run that file if you're still having issues!
