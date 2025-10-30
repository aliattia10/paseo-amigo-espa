-- ============================================
-- FIX AVAILABILITY TABLE
-- Add missing status column and fix time format
-- ============================================

-- 1. Add status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'availability' AND column_name = 'status'
  ) THEN
    ALTER TABLE availability ADD COLUMN status TEXT DEFAULT 'available';
    RAISE NOTICE '✅ Added status column to availability table';
  ELSE
    RAISE NOTICE 'ℹ️ Status column already exists';
  END IF;
END $$;

-- 2. Check current column types
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'availability'
ORDER BY ordinal_position;

-- 3. If start_time and end_time are TEXT, convert them to TIME
DO $$
BEGIN
  -- Check if start_time is text
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'availability' 
    AND column_name = 'start_time' 
    AND data_type = 'text'
  ) THEN
    -- Convert start_time from text to time
    ALTER TABLE availability 
    ALTER COLUMN start_time TYPE TIME USING start_time::TIME;
    RAISE NOTICE '✅ Converted start_time to TIME type';
  END IF;
  
  -- Check if end_time is text
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'availability' 
    AND column_name = 'end_time' 
    AND data_type = 'text'
  ) THEN
    -- Convert end_time from text to time
    ALTER TABLE availability 
    ALTER COLUMN end_time TYPE TIME USING end_time::TIME;
    RAISE NOTICE '✅ Converted end_time to TIME type';
  END IF;
END $$;

-- 4. Update RLS policies to include status column
DROP POLICY IF EXISTS "Sitters can insert own availability" ON availability;
DROP POLICY IF EXISTS "Sitters can update own availability" ON availability;

CREATE POLICY "Sitters can insert own availability" 
ON availability FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = sitter_id);

CREATE POLICY "Sitters can update own availability" 
ON availability FOR UPDATE 
TO authenticated 
USING (auth.uid() = sitter_id);

-- 5. Verify the fix
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'availability'
ORDER BY ordinal_position;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Availability table fixed successfully!';
  RAISE NOTICE '📊 Columns: sitter_id, start_time (TIME), end_time (TIME), status (TEXT)';
  RAISE NOTICE '🔒 RLS policies updated';
END $$;
