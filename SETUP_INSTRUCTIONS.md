# 🚀 Setup Instructions for New Features

## Quick Start Guide

### 1. Apply Database Migration

```bash
# Navigate to your project root
cd paseo-amigo-espa

# Apply the new migration
supabase db push
```

Or manually run the migration:
```bash
psql -h YOUR_SUPABASE_HOST -U postgres -d postgres -f supabase/migrations/20250124000000_add_matches_and_features.sql
```

### 2. Seed the Database with Users

```bash
# Navigate to backend directory
cd backend

# Install dependencies if not already done
npm install

# Run the comprehensive seed script
npm run seed-comprehensive
```

Or run directly with ts-node:
```bash
npx ts-node src/database/seed-comprehensive.ts
```

### 3. Verify the Data

Check your Supabase dashboard:
- **Users table**: Should have 20 users (10 owners + 10 walkers)
- **Dogs table**: Should have 15 dogs
- **Walker_profiles table**: Should have 10 profiles
- **Matches table**: Should exist and be empty (ready for user interactions)
- **Activity_feed table**: Should exist and be empty

### 4. Test the Application

```bash
# Start the frontend
npm run dev
```

#### Test Login Credentials

Use any of these test accounts:

**Dog Owners:**
- maria.gonzalez@gmail.com
- carlos.ruiz@hotmail.com
- ana.fernandez@gmail.com
- elena.martin@gmail.com

**Dog Walkers:**
- alejandro.morales@gmail.com
- carmen.delgado@hotmail.com
- roberto.silva@gmail.com
- raquel.mendez@gmail.com

**Password for all test accounts:** `password123` (update in seed script if needed)

### 5. Navigate the New Features

Once logged in:

1. **Bottom Navigation Bar** appears at the bottom
2. Click **Nearby** tab → See Tinder-style walker cards
3. Click **❤️ Like** button → Creates a match
4. Click **✖️ Pass** button → Skips to next walker
5. Click **Feed** tab → See community activity
6. Click **Profile** tab → Edit your profile and upload photo
7. Click **Messages** tab → See match notifications (bubbles will show when matches occur)

---

## 🔧 Manual Database Setup

If you prefer to set up manually:

### Step 1: Create Tables

```sql
-- Run the migration file
\i supabase/migrations/20250124000000_add_matches_and_features.sql
```

### Step 2: Insert Users Manually

```sql
-- Example: Insert a walker
INSERT INTO users (name, email, phone, city, postal_code, user_type, profile_image, bio)
VALUES (
  'Alejandro Morales',
  'alejandro@example.com',
  '+34 678 901 234',
  'Madrid',
  '28002',
  'walker',
  NULL,
  'Profesional con más de 8 años cuidando perros'
);

-- Then insert walker profile
INSERT INTO walker_profiles (user_id, bio, experience, hourly_rate, availability, rating, total_walks, verified, tags)
VALUES (
  'USER_ID_FROM_ABOVE',
  'Profesional con más de 8 años...',
  'Más de 8 años de experiencia',
  18.00,
  ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  4.9,
  127,
  true,
  ARRAY['experiencia', 'certificado', 'razas grandes']
);
```

---

## 🧪 Testing Match Functionality

### Test the Match Flow:

1. **Login as Owner** (maria.gonzalez@gmail.com)
2. Go to **Nearby** tab
3. See walker card (Alejandro Morales)
4. Click **❤️ Like**
5. Toast notification: "You liked Alejandro Morales"
6. Match is created in database

### Check Match in Database:

```sql
SELECT * FROM matches WHERE user_id = 'MARIA_USER_ID';
```

### Test Mutual Match:

1. **Login as Walker** (alejandro.morales@gmail.com)
2. Implement walker discovery (similar UI for owners)
3. Walker likes owner back
4. **is_mutual** flag automatically set to TRUE by trigger
5. Both see match notification in Messages tab

---

## 📸 Testing Profile Photo Upload

Currently, the profile photo upload shows a preview but doesn't upload to storage yet. To make it functional:

### 1. Create Storage Bucket in Supabase

```sql
-- In Supabase Dashboard → Storage
-- Create bucket: "profile-images"
-- Make it public
```

### 2. Update ProfileSettings Component

```typescript
// In src/components/profile/ProfileSettings.tsx
// Add actual upload logic:

const handleImageUpload = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userProfile.id}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('profile-images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('profile-images')
    .getPublicUrl(filePath);

  // Update user profile
  const { error: updateError } = await supabase
    .from('users')
    .update({ profile_image: publicUrl })
    .eq('id', userProfile.id);

  if (updateError) throw updateError;
  
  return publicUrl;
};
```

---

## 🔄 Real-time Match Notifications

To add real-time match notifications:

```typescript
// In MessagingPage or wherever you want notifications

useEffect(() => {
  const matchChannel = supabase
    .channel('matches')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: `matched_user_id=eq.${userProfile.id}`
      },
      (payload) => {
        if (payload.new.is_mutual) {
          toast({
            title: "🎉 New Match!",
            description: "You have a new match! Check your messages.",
          });
          // Update match count
          setNewMatchesCount(prev => prev + 1);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(matchChannel);
  };
}, [userProfile?.id]);
```

---

## 🐛 Troubleshooting

### Issue: Seed script fails

**Solution:** Make sure:
- Supabase is running: `supabase start`
- Environment variables are set in `backend/.env`
- Database connection string is correct

### Issue: Users can't login

**Solution:**
- Check Supabase Auth is enabled
- Verify email confirmation is disabled (or confirm test emails)
- Check password requirements in Auth settings

### Issue: Bottom navigation doesn't show

**Solution:**
- Make sure you're logged in
- Check browser console for errors
- Verify MainNavigation import in OwnerDashboard

### Issue: Images don't load

**Solution:**
- Create `profile-images` bucket in Supabase Storage
- Set bucket to public
- Update RLS policies for storage bucket

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React TypeScript Guide](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## ✅ Checklist

- [ ] Migration applied successfully
- [ ] 20 users seeded in database
- [ ] Can login with test accounts
- [ ] Bottom navigation shows all 5 tabs
- [ ] Nearby tab shows walker cards
- [ ] Like button creates matches
- [ ] Feed tab shows activities
- [ ] Profile tab allows editing
- [ ] Messages tab ready for notifications
- [ ] All translations working (EN/ES)

---

**Ready to go! Start swiping and matching! 🐕💕**

