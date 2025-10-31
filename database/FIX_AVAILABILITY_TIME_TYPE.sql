-- ============================================
-- FIX AVAILABILITY TABLE TIME TYPE ISSUE
-- Convert TIME columns to TIMESTAMPTZ to fix comparison errors
-- ============================================

-- This fixes the error: "operator does not exist: time without time zone <= timestamp with time zone"

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
        -- First, we need to handle conversion differently depending on if there's a date column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'availability' AND column_name = 'date'
        ) THEN
            -- If there's a date column, combine date + time to make timestamp
            RAISE NOTICE 'Converting start_time and end_time with date column...';
            
            -- Add temporary columns
            ALTER TABLE availability ADD COLUMN IF NOT EXISTS temp_start_time TIMESTAMPTZ;
            ALTER TABLE availability ADD COLUMN IF NOT EXISTS temp_end_time TIMESTAMPTZ;
            
            -- Convert existing data by combining date + time
            UPDATE availability 
            SET temp_start_time = (date + start_time)::TIMESTAMPTZ;
            
            UPDATE availability 
            SET temp_end_time = (date + end_time)::TIMESTAMPTZ;
            
            -- Drop old columns and rename new ones
            ALTER TABLE availability DROP COLUMN start_time;
            ALTER TABLE availability DROP COLUMN end_time;
            ALTER TABLE availability RENAME COLUMN temp_start_time TO start_time;
            ALTER TABLE availability RENAME COLUMN temp_end_time TO end_time;
            
            -- Make them NOT NULL
            ALTER TABLE availability ALTER COLUMN start_time SET NOT NULL;
            ALTER TABLE availability ALTER COLUMN end_time SET NOT NULL;
            
            -- Drop the date column as it's now part of the timestamp
            ALTER TABLE availability DROP COLUMN IF EXISTS date;
            
            RAISE NOTICE '✅ Converted start_time and end_time to TIMESTAMPTZ using date column';
        ELSE
            -- No date column, convert time to timestamptz with today's date
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
    WHERE status IS NULL OR status NOT IN ('available', 'booked', 'unavailable');
    
    RAISE NOTICE '✅ Availability table fixed successfully!';
END $$;

-- Verify the fix
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'availability'
ORDER BY ordinal_position;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_availability_sitter_time ON availability(sitter_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_availability_status ON availability(status);

-- Success message
SELECT '✅ Availability table time type fixed! Now using TIMESTAMPTZ for start_time and end_time.' as message;

