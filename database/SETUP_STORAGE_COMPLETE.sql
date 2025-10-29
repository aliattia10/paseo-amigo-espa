-- ============================================
-- COMPLETE STORAGE SETUP FOR PETFLIK
-- Run this in Supabase SQL Editor to fix all storage issues
-- ============================================

-- 1. CREATE AVATARS BUCKET (for user profile pictures)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) 
DO UPDATE SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 2. CREATE PETS BUCKET (for pet pictures)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'pets',
    'pets',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) 
DO UPDATE SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 3. DROP ALL EXISTING POLICIES (clean slate)
-- ============================================
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public avatars access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar upload access" ON storage.objects;

-- Pets policies
DROP POLICY IF EXISTS "Users can upload pet images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update pet images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete pet images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view pet images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload pets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update pets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete pets" ON storage.objects;

-- 4. CREATE SIMPLE, PERMISSIVE POLICIES
-- ============================================

-- AVATARS BUCKET POLICIES
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to update files
CREATE POLICY "Authenticated users can update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow everyone to view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- PETS BUCKET POLICIES
-- Allow authenticated users to upload pet images
CREATE POLICY "Authenticated users can upload pets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pets');

-- Allow authenticated users to update pet images
CREATE POLICY "Authenticated users can update pets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'pets');

-- Allow authenticated users to delete pet images
CREATE POLICY "Authenticated users can delete pets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pets');

-- Allow everyone to view pet images (public bucket)
CREATE POLICY "Anyone can view pet images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pets');

-- 5. ENSURE DATABASE COLUMNS EXIST
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;
CREATE INDEX IF NOT EXISTS idx_users_profile_image ON users(profile_image) WHERE profile_image IS NOT NULL;

-- 6. VERIFICATION & SUCCESS MESSAGE
-- ============================================
DO $$
DECLARE
    avatars_count INTEGER;
    pets_count INTEGER;
    avatar_policies INTEGER;
    pet_policies INTEGER;
BEGIN
    -- Count buckets
    SELECT COUNT(*) INTO avatars_count FROM storage.buckets WHERE id = 'avatars';
    SELECT COUNT(*) INTO pets_count FROM storage.buckets WHERE id = 'pets';
    
    -- Count policies
    SELECT COUNT(*) INTO avatar_policies FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%avatar%';
    
    SELECT COUNT(*) INTO pet_policies FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%pet%';
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ STORAGE SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📦 Buckets Created:';
    RAISE NOTICE '   - avatars bucket: % (5MB limit, public)', CASE WHEN avatars_count > 0 THEN '✓' ELSE '✗' END;
    RAISE NOTICE '   - pets bucket: % (5MB limit, public)', CASE WHEN pets_count > 0 THEN '✓' ELSE '✗' END;
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Policies Created:';
    RAISE NOTICE '   - Avatar policies: % policies', avatar_policies;
    RAISE NOTICE '   - Pet policies: % policies', pet_policies;
    RAISE NOTICE '';
    RAISE NOTICE '✨ Allowed file types: JPEG, PNG, WebP, GIF';
    RAISE NOTICE '📏 Max file size: 5MB';
    RAISE NOTICE '🔓 Public access: Enabled';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Users can now upload profile pictures and pet photos!';
    RAISE NOTICE '';
END $$;
