-- ============================================
-- CHECK AND FIX LOCATION COLUMNS
-- ============================================

-- Step 1: Check what columns exist in users table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Step 2: Check if latitude/longitude columns exist
SELECT 
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'latitude') as has_latitude,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'longitude') as has_longitude,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'location_lat') as has_location_lat,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'location_lng') as has_location_lng;

-- Step 3: Add location columns if they don't exist
DO $$
BEGIN
  -- Add latitude if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'latitude') THEN
    ALTER TABLE users ADD COLUMN latitude DOUBLE PRECISION;
    RAISE NOTICE 'Added latitude column';
  END IF;
  
  -- Add longitude if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'longitude') THEN
    ALTER TABLE users ADD COLUMN longitude DOUBLE PRECISION;
    RAISE NOTICE 'Added longitude column';
  END IF;
END $$;

-- Step 4: Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name IN ('latitude', 'longitude', 'location_lat', 'location_lng');

-- Step 5: Check user_type values
SELECT 
  user_type,
  COUNT(*) as count
FROM users
GROUP BY user_type
ORDER BY count DESC;

-- Step 6: Fix NULL user_types (set to 'owner' by default)
UPDATE users
SET user_type = 'owner'
WHERE user_type IS NULL;

-- Step 7: Verify user types
SELECT 
  id,
  name,
  email,
  user_type,
  CASE 
    WHEN user_type IS NULL THEN '❌ NULL'
    WHEN user_type IN ('owner', 'walker', 'sitter', 'both') THEN '✅ VALID'
    ELSE '⚠️ INVALID'
  END as status
FROM users
ORDER BY created_at DESC;

SELECT '✅ Location columns added and user types fixed!' as status;
