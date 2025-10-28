-- ============================================
-- FIX NULL PET IMAGES AND ENFORCE NOT NULL
-- ============================================
-- Run this AFTER the main migration if you want to enforce NOT NULL on image_url

-- Step 1: Fix any NULL image_urls in pets table with placeholder images
UPDATE pets 
SET image_url = 'https://api.dicebear.com/7.x/bottts/svg?seed=' || id::text
WHERE image_url IS NULL;

-- Step 2: Make image_url NOT NULL (optional - only if you want to enforce it)
-- ALTER TABLE pets ALTER COLUMN image_url SET NOT NULL;

-- Step 3: Verify no NULL values remain
DO $$ 
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count FROM pets WHERE image_url IS NULL;
  
  IF null_count > 0 THEN
    RAISE NOTICE '⚠️  Warning: % pets still have NULL image_url', null_count;
  ELSE
    RAISE NOTICE '✅ All pets have valid image URLs!';
  END IF;
END $$;
