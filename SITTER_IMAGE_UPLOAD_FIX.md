# Sitter Image Upload Fix

## Issue
Sitters can't upload profile pictures during setup.

## Solution

The sitter profile setup page already has image upload functionality built in. If it's not working, the issue is with the Supabase storage bucket configuration.

### Fix Steps:

1. **Run the storage bucket SQL** in Supabase:
   - Go to Supabase Dashboard → SQL Editor
   - Open `database/fix_storage_bucket.sql`
   - Copy and paste the entire file
   - Click **Run**

2. **Verify the bucket exists**:
   - Go to Supabase Dashboard → Storage
   - You should see an `avatars` bucket
   - It should be marked as **Public**

3. **Test the upload**:
   - Sign up as a sitter
   - Go to profile setup
   - Click "Upload Photo"
   - Select an image (max 5MB, JPEG/PNG/WebP/GIF)
   - Should upload successfully

## What Was Fixed

### ✅ Removed Mock Data
- No more fake dog profiles (Max, Luna, Charlie)
- No more fake sitter profiles (Sarah, Mike, Emma)
- Only real profiles from database are shown

### ✅ Removed Fake Ratings
- New users start with rating = 0
- Shows "✨ New Profile" badge instead of fake stars
- Ratings will be based on actual reviews later

### ✅ Fresh User Experience
- New users see only real profiles
- No pre-populated data
- Clean slate for everyone

## Image Upload Code

The sitter profile setup (`src/pages/SitterProfileSetup.tsx`) already includes:

```tsx
// Image upload handler
const handleImageUpload = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${currentUser.id}-avatar-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  setSitterData({ ...sitterData, avatarUrl: publicUrl });
}
```

## Storage Bucket Configuration

The `database/fix_storage_bucket.sql` file configures:
- ✅ Public bucket for avatars
- ✅ 5MB file size limit
- ✅ Allowed types: JPEG, PNG, WebP, GIF
- ✅ Upload policies for authenticated users
- ✅ Public read access for everyone

## Troubleshooting

If image upload still doesn't work:

1. **Check browser console** for errors
2. **Verify storage bucket** exists in Supabase
3. **Check RLS policies** in Storage → Policies
4. **Test with small image** (< 1MB) first
5. **Clear browser cache** and try again

## Next Steps

After fixing storage:
1. Test sitter signup with image upload
2. Verify image appears in profile
3. Check that image shows in swipe cards
4. Confirm image displays in messages
