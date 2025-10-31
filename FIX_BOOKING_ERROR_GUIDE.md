# Fix Booking Error Guide

## Problem
The bookings page shows this error:
```
operator does not exist: time without time zone <= timestamp with time zone
```

This error occurs because the `availability` table has `TIME` columns (start_time, end_time) instead of `TIMESTAMP WITH TIME ZONE`, causing a type mismatch when comparing with the `bookings` table which uses `TIMESTAMPTZ`.

## Solution

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/20251101000000_fix_availability_time_type.sql`
4. Copy the entire content
5. Paste it in the SQL Editor
6. Click **Run** to execute the migration
7. Verify the fix by checking the output messages

### Option 2: Via Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

### Option 3: Via Database Script (Alternative)

If you prefer to run the script directly:

```bash
# Run the fix script
psql -h your-db-host -U your-db-user -d your-db-name -f database/FIX_AVAILABILITY_TIME_TYPE.sql
```

## What This Fix Does

1. **Converts TIME columns to TIMESTAMPTZ**: Changes `start_time` and `end_time` from `TIME` to `TIMESTAMP WITH TIME ZONE`
2. **Preserves existing data**: If there's a `date` column, it combines date + time to create proper timestamps
3. **Fixes column naming**: Ensures `user_id` is renamed to `sitter_id` for consistency
4. **Adds proper constraints**: Ensures `end_time > start_time`
5. **Recreates indexes**: Optimizes queries for performance

## Verification

After running the fix, verify it worked:

1. Go to the Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run this query:

```sql
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'availability'
ORDER BY ordinal_position;
```

You should see:
- `start_time` → `timestamp with time zone`
- `end_time` → `timestamp with time zone`

4. Test the bookings page again - the error should be gone!

## Root Cause

The issue was introduced by these scripts:
- `database/fix_profile_and_availability_errors.sql` (line 32-33)
- `database/FIX_AVAILABILITY_STATUS.sql` (line 39-55)

These scripts incorrectly used `TIME` type instead of `TIMESTAMPTZ`, which is incompatible with the `bookings` table's timestamp fields.

## Prevention

Going forward:
- Always use `TIMESTAMP WITH TIME ZONE` (or `TIMESTAMPTZ`) for date/time columns
- Avoid using `TIME` alone unless you specifically need time-of-day without date
- Test migrations in a development environment before production

