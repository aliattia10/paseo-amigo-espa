-- ============================================
-- ADD CAT SUPPORT TO PASEO
-- ============================================

-- Add pet_type column to dogs table (rename to pets later)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dogs' AND column_name = 'pet_type') THEN
    ALTER TABLE dogs ADD COLUMN pet_type TEXT DEFAULT 'dog' CHECK (pet_type IN ('dog', 'cat'));
  END IF;
END $$;

-- Update existing records to be dogs
UPDATE dogs SET pet_type = 'dog' WHERE pet_type IS NULL;

-- Create pets table (better name than dogs)
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pet_type TEXT NOT NULL DEFAULT 'dog' CHECK (pet_type IN ('dog', 'cat')),
  age TEXT NOT NULL,
  breed TEXT,
  notes TEXT,
  image_url TEXT NOT NULL,
  temperament TEXT[] DEFAULT '{}',
  special_needs TEXT,
  energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate data from dogs to pets (if pets table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pets LIMIT 1) THEN
    INSERT INTO pets (id, owner_id, name, pet_type, age, breed, notes, image_url, temperament, special_needs, energy_level, created_at, updated_at)
    SELECT id, owner_id, name, COALESCE(pet_type, 'dog'), age, breed, notes, image_url, temperament, special_needs, energy_level, created_at, updated_at
    FROM dogs;
  END IF;
END $$;

-- Create indexes for pets
CREATE INDEX IF NOT EXISTS idx_pets_owner ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_type ON pets(pet_type);

-- Update bookings table to reference pets instead of dogs
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'pet_id') THEN
    ALTER TABLE bookings ADD COLUMN pet_id UUID REFERENCES pets(id) ON DELETE CASCADE;
    -- Migrate existing dog_id to pet_id
    UPDATE bookings SET pet_id = dog_id WHERE pet_id IS NULL AND dog_id IS NOT NULL;
  END IF;
  
  -- Update service_type to support more options
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'service_type') THEN
    -- Drop old constraint
    ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_service_type_check;
    -- Add new constraint with more options
    ALTER TABLE bookings ADD CONSTRAINT bookings_service_type_check 
      CHECK (service_type IN ('walk', 'sitting', 'boarding', 'daycare', 'visit'));
  ELSE
    ALTER TABLE bookings ADD COLUMN service_type TEXT DEFAULT 'walk' 
      CHECK (service_type IN ('walk', 'sitting', 'boarding', 'daycare', 'visit'));
  END IF;
END $$;

-- ============================================
-- RLS POLICIES FOR PETS
-- ============================================

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all pets" ON pets;
CREATE POLICY "Users can view all pets" 
ON pets FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Owners can insert own pets" ON pets;
CREATE POLICY "Owners can insert own pets" 
ON pets FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update own pets" ON pets;
CREATE POLICY "Owners can update own pets" 
ON pets FOR UPDATE 
TO authenticated 
USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete own pets" ON pets;
CREATE POLICY "Owners can delete own pets" 
ON pets FOR DELETE 
TO authenticated 
USING (auth.uid() = owner_id);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Cat support added successfully!';
  RAISE NOTICE 'Tables: pets (with dog/cat support)';
  RAISE NOTICE 'Updated: bookings table with pet_id and expanded service types';
  RAISE NOTICE 'Service types: walk, sitting, boarding, daycare, visit';
  RAISE NOTICE 'Ready for cats and dogs! 🐱🐶';
END $$;
