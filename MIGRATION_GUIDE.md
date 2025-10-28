# Database Migration Guide

## Quick Start

### Step 1: Run the SQL Migration

You have two options:

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard: https://app.supabase.com/project/zxbfygofxxmfivddwdqt
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `database/sprint_enhanced_profiles_availability_booking.sql`
5. Paste into the SQL editor
6. Click **Run** button
7. Verify success message

#### Option B: Using psql Command Line
```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.zxbfygofxxmfivddwdqt.supabase.co:5432/postgres"

# Run the migration file
\i database/sprint_enhanced_profiles_availability_booking.sql

# Verify tables were created
\dt

# Check if new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('availability', 'bookings', 'notifications');
```

### Step 2: Regenerate TypeScript Types

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref zxbfygofxxmfivddwdqt

# Generate new types
supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

### Step 3: Verify the Migration

Run these SQL queries in the Supabase SQL Editor to verify:

```sql
-- Check new columns in users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('bio', 'hourly_rate', 'avatar_url');

-- Check new columns in dogs table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dogs' 
AND column_name IN ('temperament', 'special_needs', 'energy_level');

-- Check new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('availability', 'bookings', 'notifications');

-- Check RPC functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('create_booking', 'update_booking_status', 'add_availability_slot', 'get_sitter_availability');

-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('availability', 'bookings', 'notifications');
```

### Step 4: Test the Application

1. **Clear browser cache and localStorage**
   ```javascript
   // Run in browser console
   localStorage.clear();
   location.reload();
   ```

2. **Test Dog Owner Flow**
   - Sign up as dog owner
   - Should redirect to `/dog-profile-setup`
   - Upload dog picture
   - Fill in temperament, energy level
   - Submit and verify data in Supabase

3. **Test Sitter Flow**
   - Sign up as sitter
   - Should redirect to `/sitter-profile-setup`
   - Fill in bio and hourly rate
   - Submit and verify data in Supabase
   - Navigate to Availability page
   - Add availability slots

4. **Test Booking Flow**
   - As owner, browse sitters
   - Click "Book Now"
   - Select dog, date, time
   - Submit booking request
   - As sitter, view booking in Bookings tab
   - Accept booking
   - Verify availability slot marked as booked

## Troubleshooting

### Issue: "relation does not exist" errors
**Solution:** The migration didn't run successfully. Re-run the SQL migration file.

### Issue: TypeScript errors about missing tables
**Solution:** Regenerate the types file using `supabase gen types`

### Issue: RLS policy errors
**Solution:** Check if RLS is enabled on new tables:
```sql
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

### Issue: RPC function not found
**Solution:** Verify functions were created:
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';
```

### Issue: Overlapping availability slots error
**Solution:** This is expected behavior. The exclusion constraint prevents overlapping slots. Delete existing slot or choose different time.

### Issue: Commission calculation error
**Solution:** The database enforces 20% commission. Ensure `commission_fee = total_price * 0.20`

## Rollback (If Needed)

If you need to rollback the migration:

```sql
-- Drop new tables
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS availability CASCADE;

-- Drop RPC functions
DROP FUNCTION IF EXISTS create_booking CASCADE;
DROP FUNCTION IF EXISTS update_booking_status CASCADE;
DROP FUNCTION IF EXISTS add_availability_slot CASCADE;
DROP FUNCTION IF EXISTS get_sitter_availability CASCADE;

-- Remove new columns from users
ALTER TABLE users DROP COLUMN IF EXISTS bio;
ALTER TABLE users DROP COLUMN IF EXISTS hourly_rate;
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;

-- Remove new columns from dogs
ALTER TABLE dogs DROP COLUMN IF EXISTS temperament;
ALTER TABLE dogs DROP COLUMN IF EXISTS special_needs;
ALTER TABLE dogs DROP COLUMN IF EXISTS energy_level;
```

## Post-Migration Checklist

- [ ] All SQL commands executed successfully
- [ ] New tables visible in Supabase dashboard
- [ ] RPC functions created
- [ ] RLS policies active
- [ ] TypeScript types regenerated
- [ ] No TypeScript errors in IDE
- [ ] Dog owner signup flow works
- [ ] Sitter signup flow works
- [ ] Availability management works
- [ ] Booking creation works
- [ ] Booking acceptance works
- [ ] Notifications created

## Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Check browser console for errors
3. Verify database schema matches migration file
4. Ensure RLS policies are correct
5. Test RPC functions manually in SQL Editor

## Sample Test Data

After migration, you can add test data:

```sql
-- Add sample availability for a sitter
INSERT INTO availability (sitter_id, start_time, end_time, status)
VALUES (
  'YOUR_SITTER_USER_ID',
  NOW() + interval '1 day' + interval '9 hours',
  NOW() + interval '1 day' + interval '17 hours',
  'available'
);

-- Test create_booking function
SELECT create_booking(
  'OWNER_USER_ID',
  'SITTER_USER_ID',
  'DOG_ID',
  NOW() + interval '1 day' + interval '10 hours',
  NOW() + interval '1 day' + interval '12 hours',
  'walk',
  'Central Park',
  'Please bring water',
  30.00
);
```

---

**Last Updated:** October 28, 2025
**Migration File:** `database/sprint_enhanced_profiles_availability_booking.sql`
**Status:** Ready for Production
