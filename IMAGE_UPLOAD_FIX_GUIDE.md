# Image Upload Fix Guide

## 🔴 Problem
Images are not uploading - getting errors in console.

## ✅ Solution Steps

### Step 1: Fix Storage Bucket (CRITICAL)

1. **Go to Supabase SQL Editor**
2. **Run this file:** `database/fix_storage_bucket.sql`
3. **Wait for success message**

### Step 2: Verify Storage Bucket in Dashboard

1. Go to Supabase Dashboard → **Storage**
2. Check if `avatars` bucket exists
3. If it doesn't exist, create it manually:
   - Click "New bucket"
   - Name: `avatars`
   - Public: **YES** ✅
   - File size limit: `5242880` (5MB)
   - Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`

### Step 3: Check Storage Policies

1. In Supabase Dashboard → Storage → `avatars` bucket
2. Click "Policies" tab
3. You should see these policies:
   - ✅ "Authenticated users can upload avatars" (INSERT)
   - ✅ "Authenticated users can update avatars" (UPDATE)
   - ✅ "Authenticated users can delete avatars" (DELETE)
   - ✅ "Anyone can view avatars" (SELECT)

### Step 4: Test Upload

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+F5)
3. Login to your app
4. Go to Edit Pet Profile
5. Click "Add Photo"
6. Select an image
7. **Check browser console** (F12) for any errors

### Step 5: Manual Bucket Creation (If SQL doesn't work)

If the SQL script doesn't create the bucket, do it manually:

1. **Supabase Dashboard → Storage → New Bucket**
2. **Settings:**
   ```
   Name: avatars
   Public: ON
   File size limit: 5242880
   Allowed MIME types: image/jpeg,image/png,image/webp,image/gif
   ```

3. **Create Policies** (Click "New Policy" for each):

   **Policy 1: Upload**
   ```sql
   CREATE POLICY "Authenticated users can upload avatars"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'avatars');
   ```

   **Policy 2: Update**
   ```sql
   CREATE POLICY "Authenticated users can update avatars"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (bucket_id = 'avatars');
   ```

   **Policy 3: Delete**
   ```sql
   CREATE POLICY "Authenticated users can delete avatars"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'avatars');
   ```

   **Policy 4: View**
   ```sql
   CREATE POLICY "Anyone can view avatars"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'avatars');
   ```

## 🔍 Debugging

### Check if bucket exists:
```sql
SELECT * FROM storage.buckets WHERE id = 'avatars';
```

### Check policies:
```sql
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
```

### Check if user is authenticated:
```sql
SELECT auth.uid(); -- Should return your user ID
```

## 🎯 Expected Behavior After Fix

1. Click "Add Photo" button
2. Select image file
3. See "Uploading..." message
4. Image appears in gallery
5. Console shows: "✅ IMAGE UPLOAD END"
6. Database updated with image URL

## ⚠️ Common Errors & Solutions

### Error: "new row violates row-level security policy"
**Solution:** Run the storage policies SQL again

### Error: "Bucket not found"
**Solution:** Create bucket manually in dashboard

### Error: "File size too large"
**Solution:** Ensure image is under 5MB

### Error: "Invalid MIME type"
**Solution:** Only use JPG, PNG, WebP, or GIF images

## 📞 Still Not Working?

If images still don't upload after all steps:

1. **Check browser console** (F12) - copy the exact error
2. **Check Supabase logs** (Dashboard → Logs → Storage)
3. **Verify you're logged in** - auth.uid() should return a value
4. **Try a different image** - use a small JPG file (< 1MB)

## ✅ Success Indicators

- ✅ No errors in browser console
- ✅ "Success! Pet picture uploaded" toast message
- ✅ Image appears in the gallery
- ✅ Image URL saved in database
- ✅ Image persists after page refresh
