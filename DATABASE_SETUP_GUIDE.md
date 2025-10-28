# Database Setup Guide

## Required: Run Database Migration

The bookings feature requires the `bookings` table to exist in your Supabase database. Follow these steps:

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar

### Step 2: Run the Migration

1. Copy the contents of `database/sprint_enhanced_profiles_availability_booking.sql`
2. Paste it into the SQL Editor
3. Click "Run" to execute the migration

### What This Migration Creates:

1. **Enhanced Profile Fields**
   - Adds `bio`, `hourly_rate`, `avatar_url` to users table
   - Adds `temperament`, `special_needs`, `energy_level` to dogs table

2. **Availability System**
   - Creates `availability` table for sitter time slots
   - Prevents overlapping bookings

3. **Bookings Table**
   - Replaces old `walk_requests` with comprehensive `bookings` table
   - Includes fields: owner_id, sitter_id, dog_id, start_time, end_time, service_type, location, notes, total_price, commission_fee, status
   - Status options: requested, confirmed, in-progress, completed, cancelled

4. **Notifications Table**
   - Creates `notifications` table for user notifications

### Step 3: Verify Tables Exist

Run this query in SQL Editor to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('bookings', 'availability', 'notifications');
```

You should see all three tables listed.

### Step 4: Set Up Storage Bucket (if not exists)

The app uses Supabase Storage for images. Ensure you have an `avatars` bucket:

1. Go to "Storage" in Supabase dashboard
2. Create a bucket named `avatars` if it doesn't exist
3. Set it to **Public** (or configure RLS policies as needed)
4. Create folders: `profiles/` and `dogs/`

### Troubleshooting

**Error: "relation 'bookings' does not exist"**
- Run the migration SQL script in Supabase SQL Editor

**Error: "permission denied for table bookings"**
- Check RLS (Row Level Security) policies
- You may need to add policies for authenticated users

**Images not uploading**
- Verify `avatars` bucket exists and is public
- Check storage policies allow authenticated users to upload

### RLS Policies (Optional but Recommended)

Add these policies in Supabase > Authentication > Policies:

```sql
-- Bookings: Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = sitter_id);

-- Bookings: Users can create bookings
CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Bookings: Sitters can update booking status
CREATE POLICY "Sitters can update bookings" ON bookings
  FOR UPDATE USING (auth.uid() = sitter_id);
```
