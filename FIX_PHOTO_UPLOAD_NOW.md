# Fix Photo Upload - Quick Guide

## The Problem
You're seeing this error when trying to upload a profile picture:
```
Upload Failed
Storage bucket not configured. Please run: database/fix_profile_storage.sql
```

## The Solution (2 minutes)

### Step 1: Go to Supabase
1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the SQL
1. Click **New query**
2. Copy the ENTIRE contents of `database/SETUP_STORAGE_COMPLETE.sql`
3. Paste it into the SQL editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Success
You should see output like:
```
✅ STORAGE SETUP COMPLETE!
📦 Buckets Created:
   - avatars bucket: ✓ (5MB limit, public)
   - pets bucket: ✓ (5MB limit, public)
🔒 Policies Created:
   - Avatar policies: 4 policies
   - Pet policies: 4 policies
🎉 Users can now upload profile pictures and pet photos!
```

### Step 4: Test Upload
1. Go back to your app
2. Click "Edit Profile"
3. Click "Change Photo"
4. Select an image
5. It should upload successfully! ✅

## What This SQL Does

1. **Creates storage buckets**
   - `avatars` - for user profile pictures
   - `pets` - for pet photos

2. **Sets up permissions**
   - Authenticated users can upload/update/delete
   - Everyone can view (public buckets)

3. **Configures limits**
   - Max file size: 5MB
   - Allowed types: JPEG, PNG, WebP, GIF

## Troubleshooting

### Still getting errors?

**Error: "Permission denied"**
- Make sure you're logged in
- Check that RLS is enabled on storage.objects
- Verify policies were created (check Storage → Policies in Supabase)

**Error: "File too large"**
- Image must be under 5MB
- Try compressing the image first

**Error: "Invalid file type"**
- Only images allowed (JPEG, PNG, WebP, GIF)
- No PDFs, videos, or other file types

### Check if buckets exist
1. Go to Supabase Dashboard
2. Click **Storage** in left sidebar
3. You should see:
   - `avatars` bucket (public)
   - `pets` bucket (public)

### Check if policies exist
1. Go to Supabase Dashboard
2. Click **Storage** → **Policies**
3. You should see 8 policies total:
   - 4 for avatars (insert, update, delete, select)
   - 4 for pets (insert, update, delete, select)

## Files Involved

- `database/SETUP_STORAGE_COMPLETE.sql` - **RUN THIS ONE** (complete setup)
- `database/fix_storage_bucket.sql` - Alternative (avatars only)
- `database/fix_profile_storage.sql` - Alternative (avatars only)
- `src/pages/ProfileEditPage.tsx` - Upload code (already fixed)

## After Running SQL

Once the SQL is run successfully:
- ✅ Profile picture upload works
- ✅ Pet photo upload works
- ✅ Sitter profile picture upload works
- ✅ All image uploads work across the app

No code changes needed - just run the SQL once!

## Need Help?

If you're still having issues:
1. Check browser console for errors (F12)
2. Check Supabase logs (Dashboard → Logs)
3. Verify you're logged in as an authenticated user
4. Try in incognito mode (clear cache)
