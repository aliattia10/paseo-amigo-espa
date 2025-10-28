# Media & Location Features Setup Guide

This guide explains how to set up the new media messaging and location-based matching features in Petflik.

## 🎯 Features Added

### 1. Media Support in Messages
- Users can send **images** and **videos** in chat messages
- Supported formats: JPEG, PNG, GIF, WebP (images), MP4, WebM (videos)
- Maximum file size: 10MB
- Media is stored in Supabase Storage
- Automatic thumbnail generation for videos

### 2. Location-Based Matching
- Users can enable location to see nearby matches
- Distance calculation in kilometers/miles
- Privacy-focused: location only shared with matched users
- Global mode toggle to see all users regardless of location

## 📋 Database Setup

### Step 1: Run the Migration

Execute the SQL migration to add media and location support:

```bash
# In Supabase SQL Editor, run:
database/add_media_and_location.sql
```

This migration will:
- Add `media_url`, `media_type`, and `media_thumbnail_url` columns to messages table
- Add `latitude`, `longitude`, `location_enabled` columns to users table
- Create distance calculation functions
- Set up storage bucket for message media
- Configure RLS policies for privacy

### Step 2: Verify Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Verify that `message-media` bucket exists
3. Check that it's set to **public** (for easy media access)
4. Verify storage policies are in place

## 🔧 How It Works

### Media Messaging

1. **Sending Media:**
   - User clicks the image icon in chat
   - Selects an image or video file
   - Preview appears before sending
   - File is uploaded to Supabase Storage
   - Message is sent with media URL

2. **Viewing Media:**
   - Images display inline in chat bubbles
   - Videos have playback controls
   - Click images to open in new tab
   - Media loads from CDN for fast delivery

### Location-Based Matching

1. **Location Permission:**
   - On first visit, users see a location prompt
   - Three options:
     - **Enable Location**: Uses GPS for nearby matches
     - **Browse Globally**: See all users everywhere
     - **Maybe Later**: Skip for now

2. **Local Mode (Default):**
   - Shows profiles within 50km radius
   - Sorted by distance (closest first)
   - Distance displayed on profile cards
   - Updates when user moves

3. **Global Mode:**
   - Toggle with globe icon (top right)
   - Shows all profiles regardless of location
   - No distance filtering
   - Useful for travelers or remote connections

4. **Privacy:**
   - Location only stored when enabled
   - Only matched users can see exact location
   - Can disable location anytime
   - Location updates only when app is open

## 🎨 UI Components

### Location Toggle Button
- **Local Mode**: 📍 location_on icon (gray)
- **Global Mode**: 🌍 public icon (blue)
- Located in top-right of home page
- Click to toggle between modes

### Location Prompt Modal
- Appears on first visit
- Clean, modern design
- Three clear options
- Can be dismissed

### Media Upload in Chat
- Image icon button next to message input
- Preview thumbnail before sending
- Remove button (X) to cancel
- Loading spinner during upload
- Success/error toasts

## 🔐 Security & Privacy

### Storage Security
- Users can only upload to their own folder
- File type validation (images and videos only)
- File size limit (10MB max)
- Automatic virus scanning (Supabase feature)

### Location Privacy
- Location stored only when enabled
- Encrypted in database
- Only visible to matched users
- Can be disabled anytime
- No location history tracking

### RLS Policies
- Users can only update their own location
- Media URLs are public but folder-protected
- Messages only visible to sender/receiver
- Location queries filtered by permissions

## 📱 User Experience

### First-Time Flow

1. User opens app
2. After 2 seconds, location prompt appears
3. User chooses:
   - Enable location → GPS permission → See nearby matches
   - Browse globally → See all matches
   - Maybe later → Can enable later via toggle

### Sending Media

1. Open chat with matched user
2. Click image icon
3. Select photo/video from device
4. Preview appears
5. Add optional text message
6. Click send
7. Media uploads and appears in chat

### Switching Modes

1. Click globe/location icon (top right)
2. Mode switches instantly
3. Toast notification confirms
4. Profiles refresh with new filter
5. Preference saved for next visit

## 🧪 Testing

### Test Media Upload

1. Open a chat conversation
2. Click the image icon
3. Select a test image (< 10MB)
4. Verify preview appears
5. Send message
6. Check media displays correctly
7. Try clicking image to open full size

### Test Location

1. Enable location in browser
2. Check location prompt appears
3. Click "Enable Location"
4. Verify GPS permission requested
5. Check profiles show distance
6. Toggle to global mode
7. Verify all profiles appear

### Test Privacy

1. Create two test accounts
2. Enable location on both
3. Verify they can't see each other's exact location
4. Create a match between them
5. Verify distance is now visible
6. Disable location on one account
7. Verify it disappears from matches

## 🐛 Troubleshooting

### Media Not Uploading
- Check file size (< 10MB)
- Verify file type (image or video)
- Check Supabase storage bucket exists
- Verify storage policies are correct

### Location Not Working
- Check browser location permission
- Verify HTTPS (required for geolocation)
- Check database columns exist
- Verify RLS policies allow updates

### Distance Not Showing
- Verify location is enabled
- Check latitude/longitude are set
- Verify distance calculation function exists
- Check profiles have location data

## 🚀 Next Steps

### Potential Enhancements

1. **Media Features:**
   - Video thumbnail generation
   - Image compression before upload
   - Multiple media in one message
   - Voice messages
   - GIF support

2. **Location Features:**
   - Custom radius selection
   - Map view of nearby users
   - Location-based notifications
   - Travel mode (temporary location)
   - Multiple saved locations

3. **Privacy Features:**
   - Blur exact location (show area only)
   - Location sharing time limits
   - Anonymous browsing mode
   - Block specific locations

## 📊 Database Schema

### Messages Table (Updated)
```sql
messages (
  id UUID PRIMARY KEY,
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  message TEXT,
  media_url TEXT,              -- NEW
  media_type VARCHAR(20),      -- NEW: 'image' or 'video'
  media_thumbnail_url TEXT,    -- NEW: for video thumbnails
  created_at TIMESTAMP,
  read BOOLEAN
)
```

### Users Table (Updated)
```sql
users (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  latitude DECIMAL(10, 8),           -- NEW
  longitude DECIMAL(11, 8),          -- NEW
  location_enabled BOOLEAN,          -- NEW
  location_updated_at TIMESTAMP,     -- NEW
  ...
)
```

## ✅ Checklist

Before deploying to production:

- [ ] Run database migration
- [ ] Verify storage bucket created
- [ ] Test media upload/download
- [ ] Test location permission flow
- [ ] Test global/local mode toggle
- [ ] Verify RLS policies work
- [ ] Test on mobile devices
- [ ] Check HTTPS is enabled
- [ ] Test with multiple users
- [ ] Verify privacy settings work

---

**Ready to connect users with media-rich conversations and location-based matching! 🎉📍**
