# 🔧 Fix Booking Error - Quick Guide

## The Problem
Your bookings page shows an error because the `availability` table uses incompatible time types.

## ✅ Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to: **https://supabase.com/dashboard/project/zxbfygofxxmfivddwdqt/sql/new**
2. You should see the SQL Editor interface

### Step 2: Copy the Fix Script
Open the file: `supabase/migrations/20251101000000_fix_availability_time_type.sql`

Or copy this complete script:

```sql
-- Fix availability table time type issue
DO $$
DECLARE
    v_start_time_type TEXT;
    v_end_time_type TEXT;
BEGIN
    -- Check current data types
    SELECT data_type INTO v_start_time_type
    FROM information_schema.columns
    WHERE table_name = 'availability' AND column_name = 'start_time';
    
    SELECT data_type INTO v_end_time_type
    FROM information_schema.columns
    WHERE table_name = 'availability' AND column_name = 'end_time';
    
    RAISE NOTICE 'Current start_time type: %', v_start_time_type;
    RAISE NOTICE 'Current end_time type: %', v_end_time_type;
    
    -- If columns are TIME or time without time zone, convert them to TIMESTAMPTZ
    IF v_start_time_type IN ('time without time zone', 'time') THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'availability' AND column_name = 'date'
        ) THEN
            RAISE NOTICE 'Converting start_time and end_time with date column...';
            
            ALTER TABLE availability ADD COLUMN IF NOT EXISTS temp_start_time TIMESTAMPTZ;
            ALTER TABLE availability ADD COLUMN IF NOT EXISTS temp_end_time TIMESTAMPTZ;
            
            UPDATE availability 
            SET temp_start_time = (date + start_time)::TIMESTAMPTZ;
            
            UPDATE availability 
            SET temp_end_time = (date + end_time)::TIMESTAMPTZ;
            
            ALTER TABLE availability DROP COLUMN start_time;
            ALTER TABLE availability DROP COLUMN end_time;
            ALTER TABLE availability RENAME COLUMN temp_start_time TO start_time;
            ALTER TABLE availability RENAME COLUMN temp_end_time TO end_time;
            
            ALTER TABLE availability ALTER COLUMN start_time SET NOT NULL;
            ALTER TABLE availability ALTER COLUMN end_time SET NOT NULL;
            
            ALTER TABLE availability DROP COLUMN IF EXISTS date;
            
            RAISE NOTICE '✅ Converted start_time and end_time to TIMESTAMPTZ using date column';
        ELSE
            RAISE NOTICE 'Converting start_time and end_time without date column...';
            
            ALTER TABLE availability 
            ALTER COLUMN start_time TYPE TIMESTAMPTZ 
            USING (CURRENT_DATE + start_time);
            
            ALTER TABLE availability 
            ALTER COLUMN end_time TYPE TIMESTAMPTZ 
            USING (CURRENT_DATE + end_time);
            
            RAISE NOTICE '✅ Converted start_time and end_time to TIMESTAMPTZ';
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ Columns are already TIMESTAMPTZ or compatible type';
    END IF;
    
    -- Ensure sitter_id column exists and is correctly named
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'availability' AND column_name = 'sitter_id'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'availability' AND column_name = 'user_id'
        ) THEN
            ALTER TABLE availability RENAME COLUMN user_id TO sitter_id;
            RAISE NOTICE '✅ Renamed user_id to sitter_id';
        END IF;
    END IF;
    
    -- Ensure we have the right constraint
    ALTER TABLE availability DROP CONSTRAINT IF EXISTS valid_time_range;
    ALTER TABLE availability ADD CONSTRAINT valid_time_range 
    CHECK (end_time > start_time);
    
    -- Update status column values if needed
    UPDATE availability 
    SET status = 'available' 
    WHERE status IS NULL OR status NOT IN ('available', 'booked', 'unavailable', 'blocked');
    
    RAISE NOTICE '✅ Availability table fixed successfully!';
END $$;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_availability_sitter_time ON availability(sitter_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_availability_status ON availability(status);
```

### Step 3: Paste and Run
1. Paste the entire script into the SQL Editor
2. Click the **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
3. Wait for execution to complete (should take a few seconds)

### Step 4: Verify the Fix
Run this verification query in the same SQL Editor:

```sql
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'availability'
ORDER BY ordinal_position;
```

You should see `start_time` and `end_time` with type: **`timestamp with time zone`**

### Step 5: Test Your App
1. Go back to your app: **https://petflik.com/bookings**
2. Refresh the page
3. The error should be gone! ✅

## 🎯 Expected Results

After running the fix:
- ✅ No more "operator does not exist" error
- ✅ Bookings page loads properly
- ✅ Owners can view and manage bookings
- ✅ Payment flow works correctly

## 🆘 Need Help?

If you encounter any issues:

1. **Error: "permission denied"**
   - Make sure you're logged into Supabase with the correct account
   - Try using the SQL Editor from the project dashboard

2. **Error: "column does not exist"**
   - The availability table might not exist yet
   - Run the complete schema from: `database/clean_migration.sql` first

3. **Still seeing the error after fix**
   - Clear your browser cache
   - Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
   - Check browser console for any other errors

## 📚 Additional Resources

- Full explanation: `FIX_BOOKING_ERROR_GUIDE.md`
- Original migration: `supabase/migrations/20251101000000_fix_availability_time_type.sql`
- Database fix: `database/FIX_AVAILABILITY_TIME_TYPE.sql`

