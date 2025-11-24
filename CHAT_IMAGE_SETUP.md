# Chat Image Upload Setup Guide

## Issue
Users couldn't send images in the chat/messaging page.

## Solution
Created a storage bucket for message media (images and videos).

## Setup Instructions

### Option 1: Run the Migration (Recommended)
The migration file has been created at `supabase/migrations/20241110_create_message_media_bucket.sql`

Run it in your Supabase SQL Editor:
```sql
-- Create message-media storage bucket for chat images and videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-media', 'message-media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for message-media bucket
CREATE POLICY "Anyone can view message media"
ON storage.objects FOR SELECT
USING (bucket_id = 'message-media');

CREATE POLICY "Authenticated users can upload message media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'message-media' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own message media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'message-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own message media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'message-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Option 2: Manual Setup via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Name it: `message-media`
5. Make it **Public**
6. Click **Create bucket**

### Option 3: Fallback (Already Implemented)
The code now automatically falls back to the `avatars` bucket if `message-media` doesn't exist, so images will still work!

## Features Added

### 1. Image Upload Button
- Click the 📷 image icon next to the message input
- Select an image or video (max 10MB)
- Preview appears before sending
- Can remove preview with X button

### 2. Supported Formats
- **Images**: JPEG, PNG, GIF, WebP
- **Videos**: MP4, WebM

### 3. File Size Limit
- Maximum 10MB per file

### 4. Error Handling
- Validates file type
- Validates file size
- Shows clear error messages
- Automatic fallback to avatars bucket

## How It Works

1. User clicks image button
2. Selects file from device
3. File is validated (type & size)
4. Preview shows in chat
5. User sends message
6. File uploads to Supabase Storage
7. Message sent with image URL
8. Image displays in chat for both users

## Testing

1. Open Messages page
2. Start a conversation
3. Click the image icon (📷)
4. Select an image
5. See preview
6. Click send
7. Image should appear in chat

## Troubleshooting

### Images not uploading?
1. Check if `message-media` bucket exists in Supabase Storage
2. Check bucket is set to **Public**
3. Check storage policies are created
4. Check browser console for errors

### Still not working?
The code will automatically use the `avatars` bucket as fallback, so images should still work!
