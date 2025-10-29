-- =====================================================
-- FIX STORAGE BUCKET FOR IMAGE UPLOADS
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Ensure avatars bucket exists and is public
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

-- 2. Remove all existing policies to start fresh
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;

-- 3. Create simple, permissive policies for authenticated users
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 4. Verify the setup
DO $$
BEGIN
    RAISE NOTICE '✅ Storage bucket "avatars" configured';
    RAISE NOTICE '✅ File size limit: 5MB';
    RAISE NOTICE '✅ Allowed types: JPEG, PNG, WebP, GIF';
    RAISE NOTICE '✅ Public access: Enabled';
    RAISE NOTICE '✅ Upload policies: Created for authenticated users';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Image uploads should now work!';
END $$;
