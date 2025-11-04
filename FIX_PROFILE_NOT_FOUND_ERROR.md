# Fix "Profile not found" and "column users.rating does not exist" Error

## 🔴 The Problem

You're seeing two errors:
1. **"Profile not found"** - Profile page not loading
2. **"column users.rating does not exist"** - Database schema missing columns

## ✅ The Solution

Run this SQL migration in your Supabase SQL Editor:

### File: `database/ADD_MISSING_USER_COLUMNS.sql`

This migration adds all missing columns to the users table:
- `rating` - Average rating (0-5)
- `review_count` - Number of reviews
- `verified` - Verification status
- `hourly_rate` - Hourly rate for sitters
- `experience_years` - Years of experience
- `available` - Availability status
- `last_active` - Last active timestamp
- `profile_completion` - Profile completion percentage

## 📋 Steps to Fix

### 1. Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/zxbfygofxxmfivddwdqt

### 2. Go to SQL Editor
Click on "SQL Editor" in the left sidebar

### 3. Run the Migration
Copy and paste the contents of `database/ADD_MISSING_USER_COLUMNS.sql` and click "Run"

### 4. Verify the Fix
Run this query to check if columns were added:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('rating', 'review_count', 'verified', 'hourly_rate', 'experience_years', 'available', 'last_active', 'profile_completion')
ORDER BY column_name;
```

You should see all 8 columns listed.

### 5. Test the Profile Page
- Refresh your browser
- Navigate to the profile page
- The "Profile not found" error should be gone!

## 🎯 What This Fixes

### Before Migration ❌
```
Error: column users.rating does not exist
Profile not found
```

### After Migration ✅
```
Profile loads successfully
All user data displays correctly
Rating shows as 0.0 (default)
```

## 📊 Default Values

After running the migration, all users will have:
- **rating:** 0.0
- **review_count:** 0
- **verified:** false
- **hourly_rate:** 15.00 EUR
- **experience_years:** 0
- **available:** true
- **last_active:** Current timestamp
- **profile_completion:** Auto-calculated (0-100%)

## 🔧 Profile Completion Feature

The migration also adds an automatic profile completion calculator:

**Calculation:**
- Basic info (name, phone, city, bio): 40%
- Profile image: 20%
- Role-specific info: 40%
  - **Sitters:** Hourly rate + experience
  - **Owners:** Having at least one pet

**Auto-updates when:**
- User updates their profile
- User adds/removes pets
- User changes their role

## 🚨 Common Issues

### Issue: "permission denied for table users"
**Solution:** Make sure you're logged in as the database owner or have proper permissions

### Issue: "column already exists"
**Solution:** This is fine! The migration uses `IF NOT EXISTS` so it's safe to run multiple times

### Issue: Still seeing "Profile not found"
**Solution:** 
1. Clear browser cache (Ctrl+Shift+R)
2. Check browser console for other errors
3. Verify user is logged in
4. Check if user exists in database:
   ```sql
   SELECT id, name, email, rating FROM users WHERE id = 'YOUR_USER_ID';
   ```

## 📝 Additional Migrations

If you need to add more columns later, use this template:

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS column_name data_type DEFAULT default_value;

-- Add index if needed
CREATE INDEX IF NOT EXISTS idx_users_column_name ON users(column_name);

-- Add comment
COMMENT ON COLUMN users.column_name IS 'Description of the column';

-- Update existing rows
UPDATE users SET column_name = default_value WHERE column_name IS NULL;
```

## ✅ Verification Checklist

After running the migration:

- [ ] SQL migration ran without errors
- [ ] All 8 columns exist in users table
- [ ] Profile page loads without errors
- [ ] User rating shows as 0.0
- [ ] Profile completion percentage shows
- [ ] No console errors about missing columns

## 🎉 Success!

Once the migration is complete:
1. Profile pages will load correctly
2. Rating system will work
3. Profile completion will be tracked
4. All user data will display properly

---

**TL;DR:** Run `database/ADD_MISSING_USER_COLUMNS.sql` in Supabase SQL Editor to fix the error!
