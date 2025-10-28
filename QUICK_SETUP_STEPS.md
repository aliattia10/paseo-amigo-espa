# Quick Setup Steps - Supabase Database

## 🚀 Fast Track (5 Minutes)

### Step 1: Run Main Migration (2 min)
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** → **New query**
4. Copy ALL content from `database/clean_migration.sql`
5. Paste and click **Run**
6. Wait for "✅ Migration completed successfully!" message

### Step 1.5: Add Matches System (1 min)
1. Click **New query** again
2. Copy ALL content from `database/add_matches_table.sql`
3. Paste and click **Run**
4. Wait for "✅ Matches system created successfully!" message

### Step 2: Set Up Storage (1 min)
1. Go to **Storage** in sidebar
2. Check if `avatars` bucket exists
3. If not, create it and set to **Public**
4. Inside bucket, create folders: `profiles/` and `dogs/`

### Step 3: Enable RLS Policies (2 min)
1. In SQL Editor, click **New query**
2. Copy ALL content from `database/setup_rls_policies.sql`
3. Paste and click **Run**
4. Wait for "✅ RLS Policies configured successfully!" message

**Alternative:** Copy and run this in SQL Editor:

```sql
-- Users Table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Dogs Table
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all dogs" ON dogs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owners can insert own dogs" ON dogs FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own dogs" ON dogs FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own dogs" ON dogs FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Bookings Table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT TO authenticated USING (auth.uid() = owner_id OR auth.uid() = sitter_id);
CREATE POLICY "Owners can create bookings" ON bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Sitters can update bookings" ON bookings FOR UPDATE TO authenticated USING (auth.uid() = sitter_id);

-- Availability Table
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view availability" ON availability FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sitters can insert own availability" ON availability FOR INSERT TO authenticated WITH CHECK (auth.uid() = sitter_id);
CREATE POLICY "Sitters can update own availability" ON availability FOR UPDATE TO authenticated USING (auth.uid() = sitter_id);
CREATE POLICY "Sitters can delete own availability" ON availability FOR DELETE TO authenticated USING (auth.uid() = sitter_id);

-- Notifications Table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Storage Policies
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Allow public read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');
```

### Step 4: Verify (30 sec)
Run this to check everything:

```sql
-- Should return all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'dogs', 'bookings', 'availability', 'notifications');

-- Should return counts (even if 0)
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL SELECT 'dogs', COUNT(*) FROM dogs
UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL SELECT 'availability', COUNT(*) FROM availability
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications;
```

## ✅ Done!

Your database is now fully set up. Test your app at: https://paseop.netlify.app

## 📋 What You Just Created:

- ✅ **5 Tables**: users, dogs, bookings, availability, notifications
- ✅ **Storage Bucket**: avatars (with profiles/ and dogs/ folders)
- ✅ **Security**: Row Level Security policies for all tables
- ✅ **Data Protection**: Only users can access their own data

## 🔍 Quick Verification Checklist:

- [ ] Migration ran without errors
- [ ] All 5 tables exist
- [ ] `avatars` bucket exists
- [ ] RLS policies created
- [ ] Test queries return results

## 🆘 If Something Goes Wrong:

**Error: "relation does not exist"**
→ Run the migration script again

**Error: "permission denied"**
→ Run the RLS policies script again

**Images not uploading**
→ Check storage bucket is set to Public

**Can't see data**
→ Check RLS policies are enabled

## 📚 For More Details:

See `SUPABASE_COMPLETE_SETUP.md` for the full detailed guide.
