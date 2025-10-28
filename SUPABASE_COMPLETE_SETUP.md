# Complete Supabase Database Setup Guide

This guide will help you set up your Supabase database to prevent errors and save all data properly.

## Step 1: Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Sign in to your account
3. Select your project: **paseo-amigo-espa** (or your project name)

## Step 2: Run Database Migration

### 2.1 Open SQL Editor

1. In the left sidebar, click **"SQL Editor"**
2. Click **"New query"** button

### 2.2 Copy and Run the Migration Script

1. Open the file `database/sprint_enhanced_profiles_availability_booking.sql` in your project
2. Copy ALL the SQL code (Ctrl+A, then Ctrl+C)
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** button (or press Ctrl+Enter)

**Expected Result:** You should see "Success. No rows returned" message.

### 2.3 What This Creates:

The migration creates these tables:
- ✅ `availability` - For sitter time slots
- ✅ `bookings` - For booking management
- ✅ `notifications` - For user notifications

And adds these fields to existing tables:
- ✅ `users` table: `bio`, `hourly_rate`, `avatar_url`
- ✅ `dogs` table: `temperament`, `special_needs`, `energy_level`

## Step 3: Verify Tables Were Created

### 3.1 Check Tables

1. In SQL Editor, run this query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'dogs', 'bookings', 'availability', 'notifications', 'walker_profiles', 'walk_requests');
```

**Expected Result:** You should see all these tables listed.

### 3.2 Check Table Structure

Run these queries to verify the structure:

```sql
-- Check users table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';

-- Check dogs table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dogs';

-- Check bookings table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings';

-- Check availability table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'availability';
```

## Step 4: Set Up Storage Bucket

### 4.1 Check Existing Bucket

1. In the left sidebar, click **"Storage"**
2. Look for a bucket named **"avatars"**

### 4.2 Create Bucket (if it doesn't exist)

1. Click **"New bucket"**
2. Name: `avatars`
3. Set to **Public** (or configure policies below)
4. Click **"Create bucket"**

### 4.3 Create Folders in Bucket

1. Click on the **"avatars"** bucket
2. Click **"Create folder"**
3. Create these folders:
   - `profiles/` (for user profile pictures)
   - `dogs/` (for dog pictures)

### 4.4 Set Storage Policies

Go to **Storage** > **Policies** and add these policies:

**Policy 1: Allow authenticated users to upload**
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');
```

**Policy 2: Allow public read access**
```sql
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

**Policy 3: Allow users to update their own files**
```sql
CREATE POLICY "Allow users to update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 5: Set Up Row Level Security (RLS) Policies

### 5.1 Users Table Policies

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles
CREATE POLICY "Users can view all profiles"
ON users FOR SELECT
TO authenticated
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
```

### 5.2 Dogs Table Policies

```sql
-- Enable RLS
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;

-- Users can view all dogs
CREATE POLICY "Users can view all dogs"
ON dogs FOR SELECT
TO authenticated
USING (true);

-- Owners can insert their own dogs
CREATE POLICY "Owners can insert own dogs"
ON dogs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own dogs
CREATE POLICY "Owners can update own dogs"
ON dogs FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id);

-- Owners can delete their own dogs
CREATE POLICY "Owners can delete own dogs"
ON dogs FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);
```

### 5.3 Bookings Table Policies

```sql
-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings (as owner or sitter)
CREATE POLICY "Users can view own bookings"
ON bookings FOR SELECT
TO authenticated
USING (auth.uid() = owner_id OR auth.uid() = sitter_id);

-- Owners can create bookings
CREATE POLICY "Owners can create bookings"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Sitters can update booking status
CREATE POLICY "Sitters can update bookings"
ON bookings FOR UPDATE
TO authenticated
USING (auth.uid() = sitter_id);

-- Owners can cancel their bookings
CREATE POLICY "Owners can cancel bookings"
ON bookings FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id AND status = 'requested');
```

### 5.4 Availability Table Policies

```sql
-- Enable RLS
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- Everyone can view availability
CREATE POLICY "Everyone can view availability"
ON availability FOR SELECT
TO authenticated
USING (true);

-- Sitters can manage their own availability
CREATE POLICY "Sitters can insert own availability"
ON availability FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sitter_id);

CREATE POLICY "Sitters can update own availability"
ON availability FOR UPDATE
TO authenticated
USING (auth.uid() = sitter_id);

CREATE POLICY "Sitters can delete own availability"
ON availability FOR DELETE
TO authenticated
USING (auth.uid() = sitter_id);
```

### 5.5 Notifications Table Policies

```sql
-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
```

## Step 6: Create Helper Functions (Optional but Recommended)

These functions make database operations easier and safer:

```sql
-- Function to create a booking
CREATE OR REPLACE FUNCTION create_booking(
  p_owner_id UUID,
  p_sitter_id UUID,
  p_dog_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_service_type TEXT,
  p_location TEXT,
  p_notes TEXT,
  p_total_price NUMERIC
)
RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_commission_fee NUMERIC;
BEGIN
  -- Calculate commission (20%)
  v_commission_fee := p_total_price * 0.20;
  
  -- Insert booking
  INSERT INTO bookings (
    owner_id,
    sitter_id,
    dog_id,
    start_time,
    end_time,
    service_type,
    location,
    notes,
    total_price,
    commission_fee,
    status
  ) VALUES (
    p_owner_id,
    p_sitter_id,
    p_dog_id,
    p_start_time,
    p_end_time,
    p_service_type,
    p_location,
    p_notes,
    p_total_price,
    v_commission_fee,
    'requested'
  )
  RETURNING id INTO v_booking_id;
  
  -- Create notification for sitter
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    related_id
  ) VALUES (
    p_sitter_id,
    'booking_request',
    'New Booking Request',
    'You have a new booking request',
    v_booking_id
  );
  
  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update booking status
CREATE OR REPLACE FUNCTION update_booking_status(
  p_booking_id UUID,
  p_new_status TEXT
)
RETURNS VOID AS $$
DECLARE
  v_booking RECORD;
BEGIN
  -- Get booking details
  SELECT * INTO v_booking
  FROM bookings
  WHERE id = p_booking_id;
  
  -- Update status
  UPDATE bookings
  SET status = p_new_status,
      updated_at = NOW()
  WHERE id = p_booking_id;
  
  -- Create notification for owner
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    related_id
  ) VALUES (
    v_booking.owner_id,
    'booking_status_update',
    'Booking Status Updated',
    'Your booking status has been updated to ' || p_new_status,
    p_booking_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add availability slot
CREATE OR REPLACE FUNCTION add_availability_slot(
  p_sitter_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ
)
RETURNS UUID AS $$
DECLARE
  v_slot_id UUID;
BEGIN
  INSERT INTO availability (
    sitter_id,
    start_time,
    end_time,
    status
  ) VALUES (
    p_sitter_id,
    p_start_time,
    p_end_time,
    'available'
  )
  RETURNING id INTO v_slot_id;
  
  RETURN v_slot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Step 7: Verify Everything Works

### 7.1 Test Data Insert

Run these test queries to verify everything works:

```sql
-- Test: Check if you can query users
SELECT COUNT(*) FROM users;

-- Test: Check if you can query dogs
SELECT COUNT(*) FROM dogs;

-- Test: Check if you can query bookings
SELECT COUNT(*) FROM bookings;

-- Test: Check if you can query availability
SELECT COUNT(*) FROM availability;

-- Test: Check if you can query notifications
SELECT COUNT(*) FROM notifications;
```

All queries should return a count (even if it's 0).

## Step 8: Update Your App Configuration

Make sure your app has the correct Supabase credentials:

1. Check your `.env` file (or environment variables):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

2. Get these values from Supabase:
   - Go to **Settings** > **API**
   - Copy **Project URL** and **anon public** key

## Troubleshooting

### Error: "relation does not exist"
- **Solution:** Run the migration script again (Step 2)

### Error: "permission denied"
- **Solution:** Check RLS policies (Step 5)

### Error: "bucket does not exist"
- **Solution:** Create the avatars bucket (Step 4)

### Images not uploading
- **Solution:** Check storage policies (Step 4.4)

### Can't see data
- **Solution:** Check RLS policies are set correctly (Step 5)

## Summary Checklist

- [ ] Ran migration script (`sprint_enhanced_profiles_availability_booking.sql`)
- [ ] Verified all tables exist
- [ ] Created `avatars` storage bucket
- [ ] Created `profiles/` and `dogs/` folders in bucket
- [ ] Set up storage policies
- [ ] Set up RLS policies for all tables
- [ ] Created helper functions
- [ ] Tested with sample queries
- [ ] Updated app environment variables

## Need Help?

If you encounter any errors:
1. Check the Supabase logs: **Database** > **Logs**
2. Check the browser console for errors
3. Verify your Supabase credentials in the app

Once all steps are complete, your app will work perfectly with full data persistence!
