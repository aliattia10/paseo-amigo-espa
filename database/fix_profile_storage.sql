-- ============================================
-- FIX PROFILE STORAGE AND PERMISSIONS
-- ============================================

-- Create avatars storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Create storage policies for avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Ensure users table has profile_image column
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_profile_image ON users(profile_image) WHERE profile_image IS NOT NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Profile storage fixed successfully!';
  RAISE NOTICE 'Created avatars bucket with public access';
  RAISE NOTICE 'Added RLS policies for avatar uploads';
  RAISE NOTICE 'Users can now upload and update profile pictures';
END $$;
