# Fix Profile Save Issue - Complete Guide

## Problem
Profile edits are not being saved to Supabase. When you edit your profile and click save, you see "Saved!" message but when you return to the profile page, the old data is still there.

## Root Cause
The issue is likely one of these:
1. **RLS Policy Blocking Updates** - The Row Level Security policy might be preventing the UPDATE operation
2. **Silent Failure** - The update query returns no error but also doesn't update any rows
3. **Session Mismatch** - The auth.uid() doesn't match the user ID being updated

## Diagnostic Steps

### Step 1: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Try to save your profile
4. Look for these log messages:
   - `=== SAVE PROFILE START ===`
   - `Updating profile with data:`
   - `Update result - data:`
   - `Update result - error:`

### Step 2: Run Diagnostic SQL
1. Go to your Supabase Dashboard
2. Open the SQL Editor
3. Run the script in `database/DIAGNOSE_PROFILE_UPDATE.sql`
4. Check the results:
   - Does the users table exist?
   - Are RLS policies configured correctly?
   - Can you select your own user record?
   - Can you update your own record?

## Solutions

### Solution 1: Fix RLS Policy (Most Likely)
If the diagnostic shows RLS is blocking updates, run this in Supabase SQL Editor:

```sql
-- Drop and recreate the update policy
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### Solution 2: Verify User ID Match
Check if the logged-in user ID matches the profile being updated:

```sql
-- Run this to see your current auth user ID
SELECT auth.uid() as my_auth_id;

-- Then check if it matches your user record
SELECT id, name, email FROM users WHERE id = auth.uid();
```

If these don't match, you have an authentication issue.

### Solution 3: Check for Triggers
Sometimes database triggers can interfere with updates:

```sql
-- Check for triggers on users table
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users';
```

### Solution 4: Temporary RLS Disable (Testing Only)
**WARNING: Only for development/testing, never in production!**

```sql
-- Temporarily disable RLS to test if that's the issue
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Try updating from the app
-- If it works, RLS is definitely the problem

-- Re-enable RLS immediately after testing
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

## Code Changes Made

### 1. Enhanced Error Logging (ProfileEditPage.tsx)
- Added verification step before update to ensure user can be read
- Added detailed logging of update results
- Added explicit error messages for RLS policy issues
- Verifies that data is actually returned from the update

### 2. Profile Refresh on Mount (NewProfilePage.tsx)
- Added automatic profile refresh when page loads
- Ensures latest data is always displayed

## Testing the Fix

1. **Clear your browser cache** (Ctrl+Shift+Delete)
2. **Log out and log back in** to ensure fresh session
3. Go to `/profile/edit`
4. Open browser console (F12)
5. Make a change to your profile
6. Click Save
7. Watch the console logs:
   - Should see "Current user data before update"
   - Should see "Update result - data" with your updated data
   - Should see "✅ Profile updated successfully"
8. Navigate to `/profile`
9. Verify your changes are visible

## If It Still Doesn't Work

1. **Check the console logs** - Look for the exact error message
2. **Run the diagnostic SQL** - This will tell you exactly what's wrong
3. **Check Supabase logs** - Go to Supabase Dashboard > Logs > Postgres Logs
4. **Verify your session** - Make sure you're actually logged in:
   ```javascript
   // Run this in browser console
   const { data } = await supabase.auth.getSession();
   console.log('Session:', data.session);
   ```

## Common Error Messages

### "Update was blocked by database security policy"
- **Cause**: RLS policy is preventing the update
- **Fix**: Run Solution 1 above (Fix RLS Policy)

### "Cannot access your profile. Please log in again"
- **Cause**: Can't read current user data
- **Fix**: Log out and log back in, or check RLS SELECT policy

### "Permission denied"
- **Cause**: RLS policy issue or wrong user ID
- **Fix**: Verify auth.uid() matches user ID, fix RLS policies

### "No rows returned"
- **Cause**: Update query didn't match any rows
- **Fix**: Check if user ID is correct, verify RLS policies

## Files Modified
1. `src/pages/ProfileEditPage.tsx` - Enhanced error handling and verification
2. `src/components/profile/NewProfilePage.tsx` - Added profile refresh on mount
3. `database/DIAGNOSE_PROFILE_UPDATE.sql` - New diagnostic script

## Next Steps
1. Deploy the updated code
2. Test with a real user account
3. If issues persist, run the diagnostic SQL and share the results
