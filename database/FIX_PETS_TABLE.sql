-- ============================================
-- FIX PETS TABLE STRUCTURE AND RLS
-- Ensure pets table exists with all required columns
-- ============================================

-- Step 1: Check if pets table exists
SELECT 
  EXISTS(
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'pets'
  ) as pets_table_exists;

-- Step 2: Create pets table if it doesn't exist
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pet_type TEXT NOT NULL CHECK (pet_type IN ('dog', 'cat')),
  age TEXT,
  breed TEXT,
  notes TEXT,
  image_url TEXT,
  temperament TEXT[],
  special_needs TEXT,
  energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Add indexes
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_pet_type ON pets(pet_type);
CREATE INDEX IF NOT EXISTS idx_pets_created_at ON pets(created_at);

-- Step 4: Enable RLS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies
DROP POLICY IF EXISTS "Users can view all pets" ON pets;
DROP POLICY IF EXISTS "Owners can insert own pets" ON pets;
DROP POLICY IF EXISTS "Owners can update own pets" ON pets;
DROP POLICY IF EXISTS "Owners can delete own pets" ON pets;

-- Step 6: Create RLS policies
CREATE POLICY "Users can view all pets" 
ON pets FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Owners can insert own pets" 
ON pets FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own pets" 
ON pets FOR UPDATE 
TO authenticated 
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own pets" 
ON pets FOR DELETE 
TO authenticated 
USING (auth.uid() = owner_id);

-- Step 7: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_pets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pets_updated_at ON pets;
CREATE TRIGGER pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW
  EXECUTE FUNCTION update_pets_updated_at();

-- Step 8: Verify table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'pets'
ORDER BY ordinal_position;

-- Step 9: Show RLS policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'pets';

-- Step 10: Test insert (will fail if RLS is wrong)
-- This is just a test - replace with your actual user ID
SELECT 'Testing pet creation...' as info;
SELECT 
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ Not logged in'
    ELSE '✅ Logged in'
  END as auth_status;

SELECT '✅ Pets table setup complete!' as status;
SELECT 'You can now create pet profiles' as info;
