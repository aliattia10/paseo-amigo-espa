# Photo Upload Setup Guide

## Issue Fixed
✅ **Fixed**: Page refresh on photo upload  
✅ **Fixed**: Async upload with proper error handling  
✅ **Fixed**: Storage bucket validation  
✅ **Fixed**: Better user feedback during upload  

## Setup Required

### 1. Run Storage Setup SQL

The photo upload feature requires a Supabase Storage bucket called `avatars`. Run this SQL in your Supabase SQL Editor:

```bash
# In Supabase Dashboard > SQL Editor, run:
database/fix_profile_storage.sql
```

Or manually execute this SQL:

```sql
-- Create avatars storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

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
```

### 2. Verify Setup

1. Go to Supabase Dashboard > Storage
2. You should see a bucket called `avatars`
3. The bucket should be marked as "Public"
4. Policies should show 4 policies (upload, view, update, delete)

## How It Works Now

### User Experience
1. User clicks "Change Photo" button
2. File selector appears
3. User selects an image
4. Loading spinner appears on the photo
5. **Page does NOT refresh** ✅
6. Upload happens in background
7. Success toast appears
8. New photo is immediately visible
9. Change is persistent (saved to database)

### Technical Flow

```typescript
// 1. User selects file
handleFileChange(event) 
  ├─ event.preventDefault() // Prevents page refresh
  ├─ Get file from input
  └─ Call handleImageUpload(file)

// 2. Upload to Supabase
handleImageUpload(file)
  ├─ Validate file type & size
  ├─ Check storage bucket exists
  ├─ Delete old image (if exists)
  ├─ Upload new image to Supabase Storage
  ├─ Get public URL
  ├─ Update users table with new URL
  └─ Refresh user profile in context

// 3. UI Updates
  ├─ Show loading spinner during upload
  ├─ Display new photo immediately
  └─ Show success/error toast
```

## File Validations

- **Accepted Types**: Images only (image/*)
- **Max Size**: 5MB
- **Supported Formats**: JPEG, PNG, GIF, WebP, etc.

## Error Handling

The system now provides specific error messages:

| Error | Message |
|-------|---------|
| Not logged in | "You must be logged in to upload images" |
| Wrong file type | "Please select an image file" |
| File too large | "Image must be less than 5MB" |
| Bucket not configured | "Storage bucket not configured..." |
| Permission denied | "Permission denied. Storage policies need to be configured." |
| Network error | Shows actual error from Supabase |

## Testing Checklist

- [ ] Run storage SQL script in Supabase
- [ ] Verify avatars bucket exists
- [ ] Upload a profile picture
- [ ] Page should NOT refresh
- [ ] Loading spinner should appear
- [ ] New photo should appear immediately
- [ ] Refresh page - photo should persist
- [ ] Log out and log back in - photo should still be there
- [ ] Try uploading different image - should replace old one
- [ ] Try uploading non-image file - should show error
- [ ] Try uploading 10MB file - should show "too large" error

## Troubleshooting

### Issue: Page Still Refreshes
- Check browser console for errors
- Ensure Button has `type="button"` (not "submit")
- Verify no `<form>` wrapper around the upload button

### Issue: Upload Fails with 406 Error
- Run the storage SQL script
- Check Supabase Storage dashboard for `avatars` bucket
- Verify RLS policies are created
- Check browser console for detailed error

### Issue: Upload Succeeds but Image Doesn't Show
- Check users table has `profile_image` column
- Verify the URL is being saved to database
- Check browser network tab for CORS errors
- Ensure bucket is marked as "Public"

### Issue: Permission Denied
- Verify user is logged in
- Check RLS policies in Supabase Storage
- Ensure policy checks `auth.uid()::text = (storage.foldername(name))[1]`
- Files must be uploaded to `userId/filename.ext` structure

## Code Changes Made

### ProfileEditPage.tsx
1. Added `e.preventDefault()` to prevent form submission
2. Added storage bucket validation before upload
3. Improved error messages with specific guidance
4. Added explicit `type="button"` to prevent form submission
5. Added `onClick` handlers to prevent event propagation
6. Clear file input after upload for better UX

### Key Safety Features
- No form wrapper (direct div structure)
- Explicit `event.preventDefault()` and `stopPropagation()`
- Button type explicitly set to "button"
- Async/await with try-catch for all operations
- Loading states to prevent duplicate uploads
- Input value cleared after upload

## Next Steps

1. ✅ Run storage SQL in Supabase
2. ✅ Test upload functionality
3. ✅ Verify persistence after page refresh
4. 🔄 Deploy to production
5. 🔄 Test on mobile devices
6. 🔄 Monitor error logs in production

## Support

If issues persist after following this guide:
1. Check Supabase Dashboard > Storage > avatars bucket
2. Check Supabase Dashboard > Authentication > Policies
3. Review browser console for detailed errors
4. Check network tab for 406, 403, or 404 errors

