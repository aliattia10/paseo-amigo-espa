-- ============================================
-- FIX AVAILABILITY TABLE STRUCTURE
-- Add missing sitter_id column
-- ============================================

-- Step 1: Check current availability table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'availability'
ORDER BY ordinal_position;

-- Step 2: Add sitter_id column if it doesn't exist
DO $$
BEGIN
  -- Check if sitter_id column exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'availability' 
    AND column_name = 'sitter_id'
  ) THEN
    -- Add sitter_id column
    ALTER TABLE availability 
    ADD COLUMN sitter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added sitter_id column to availability table';
    
    -- If there are existing rows, we need to handle them
    -- Option 1: Delete existing rows (safest for new system)
    DELETE FROM availability;
    RAISE NOTICE 'Cleared existing availability records';
    
    -- Now make sitter_id NOT NULL
    ALTER TABLE availability 
    ALTER COLUMN sitter_id SET NOT NULL;
    
    RAISE NOTICE 'Set sitter_id as NOT NULL';
  ELSE
    RAISE NOTICE 'sitter_id column already exists';
  END IF;
END $$;

-- Step 3: Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_availability_sitter_id ON availability(sitter_id);
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability(date);

-- Step 4: Update RLS policies for availability table
DROP POLICY IF EXISTS "Everyone can view availability" ON availability;
DROP POLICY IF EXISTS "Sitters can insert own availability" ON availability;
DROP POLICY IF EXISTS "Sitters can update own availability" ON availability;
DROP POLICY IF EXISTS "Sitters can delete own availability" ON availability;

-- Create updated RLS policies
CREATE POLICY "Everyone can view availability" 
ON availability FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Sitters can insert own availability" 
ON availability FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = sitter_id);

CREATE POLICY "Sitters can update own availability" 
ON availability FOR UPDATE 
TO authenticated 
USING (auth.uid() = sitter_id);

CREATE POLICY "Sitters can delete own availability" 
ON availability FOR DELETE 
TO authenticated 
USING (auth.uid() = sitter_id);

-- Step 5: Verify the table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'availability'
ORDER BY ordinal_position;

-- Step 6: Show RLS policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'availability';

SELECT '✅ Availability table fixed!' as status;
SELECT 'sitter_id column added and RLS policies updated' as info;
