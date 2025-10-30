# 🎯 Supabase Swipe & Matching System Setup

## Overview
This system replaces localStorage with Supabase database storage for:
- ✅ Likes (swipe right)
- ✅ Passes (swipe left)
- ✅ Matches (mutual likes)
- ✅ Messages (chat between matches)
- ✅ Booking flow integration

## Benefits
1. **Cross-device sync** - Swipes saved across all devices
2. **Persistent data** - Never lose your likes/matches
3. **Real matching** - Automatic match detection when both users like each other
4. **Messaging ready** - Built-in chat system for matches
5. **Booking integration** - Seamless flow from match → chat → booking

---

## 🚀 Setup Instructions

### Step 1: Run the Database Migration

Go to your Supabase project → SQL Editor and run:

```sql
-- Copy and paste the entire content of database/CREATE_SWIPE_SYSTEM.sql
```

This creates:
- `likes` table - Stores who liked whom
- `passes` table - Stores who passed on whom
- `matches` table - Stores mutual likes
- `messages` table - Stores chat messages
- RLS policies for security
- Helper functions for common operations

### Step 2: Verify Tables Created

In Supabase → Table Editor, you should see:
- ✅ likes
- ✅ passes
- ✅ matches
- ✅ messages

### Step 3: Test the System

1. **Clear old localStorage data** (optional):
   - Open browser DevTools → Application → Local Storage
   - Delete any keys starting with `user_` (old swipe data)

2. **Test swiping**:
   - Log in as user A (e.g., aliattiaa@gmail.com)
   - Swipe right on a profile
   - Check Supabase → Table Editor → `likes` table
   - You should see a new row with your user ID

3. **Test matching**:
   - Log in as user B (e.g., attiaali85@gmail.com)
   - Swipe right on user A's profile
   - You should see a "It's a Match!" modal
   - Check Supabase → `matches` table for the new match

4. **Test cross-device sync**:
   - Swipe on profiles on one device
   - Log in on another device
   - Your swipes should be remembered!

---

## 📊 Database Schema

### likes table
```
id          UUID (PK)
liker_id    UUID → auth.users(id)
liked_id    UUID → auth.users(id)
created_at  TIMESTAMP
UNIQUE(liker_id, liked_id)
```

### passes table
```
id          UUID (PK)
passer_id   UUID → auth.users(id)
passed_id   UUID → auth.users(id)
created_at  TIMESTAMP
UNIQUE(passer_id, passed_id)
```

### matches table
```
id                  UUID (PK)
user1_id            UUID → auth.users(id)
user2_id            UUID → auth.users(id)
created_at          TIMESTAMP
last_message_at     TIMESTAMP
unread_count_user1  INTEGER
unread_count_user2  INTEGER
UNIQUE(user1_id, user2_id)
CHECK(user1_id < user2_id)
```

### messages table
```
id          UUID (PK)
match_id    UUID → matches(id)
sender_id   UUID → auth.users(id)
content     TEXT
read        BOOLEAN
created_at  TIMESTAMP
```

---

## 🔧 Available Functions

### 1. check_and_create_match(liker_id, liked_id)
- Saves a like
- Checks if it's a mutual like
- Creates a match if mutual
- Returns TRUE if match created, FALSE otherwise

**Usage in code:**
```typescript
const { data: isMatch } = await supabase.rpc('check_and_create_match', {
  liker_user_id: currentUser.id,
  liked_user_id: profileId
});

if (isMatch) {
  // Show match modal!
}
```

### 2. record_pass(passer_id, passed_id)
- Saves a pass (swipe left)
- Prevents profile from showing again

**Usage in code:**
```typescript
await supabase.rpc('record_pass', {
  passer_user_id: currentUser.id,
  passed_user_id: profileId
});
```

### 3. send_message(match_id, sender_id, content)
- Sends a message in a match
- Updates last_message_at
- Increments unread count for recipient
- Returns message ID

**Usage in code:**
```typescript
const { data: messageId } = await supabase.rpc('send_message', {
  p_match_id: matchId,
  p_sender_id: currentUser.id,
  p_content: 'Hello!'
});
```

### 4. mark_messages_read(match_id, user_id)
- Marks all messages as read for a user
- Resets unread count

**Usage in code:**
```typescript
await supabase.rpc('mark_messages_read', {
  p_match_id: matchId,
  p_user_id: currentUser.id
});
```

---

## 🔒 Security (RLS Policies)

All tables have Row Level Security enabled:

### likes table
- ✅ Users can view their own likes
- ✅ Users can create their own likes
- ✅ Users can delete their own likes

### passes table
- ✅ Users can only see/manage their own passes

### matches table
- ✅ Users can only see matches they're part of
- ✅ System can create matches (via function)

### messages table
- ✅ Users can only see messages in their matches
- ✅ Users can only send messages in their matches

---

## 🎨 UI Flow

### 1. Swiping Flow
```
User sees profile
  ↓
Swipe left → record_pass() → Hide profile
  ↓
Swipe right → check_and_create_match()
  ↓
  ├─ No match → Show "Liked!" toast
  └─ Match! → Show match modal → Navigate to chat
```

### 2. Messaging Flow
```
User opens match
  ↓
mark_messages_read() → Reset unread count
  ↓
User types message
  ↓
send_message() → Save to DB + Update metadata
  ↓
Real-time subscription updates other user's UI
```

### 3. Booking Flow
```
Match created
  ↓
Users chat via messages
  ↓
Owner clicks "Book" button in chat
  ↓
Navigate to BookingRequestPage with sitter_id
  ↓
Create booking in bookings table
  ↓
Sitter receives notification
```

---

## 🐛 Troubleshooting

### Profiles not filtering correctly
- Check Supabase → Table Editor → `likes` and `passes` tables
- Verify user IDs are being saved correctly
- Check browser console for errors

### Matches not creating
- Verify both users have liked each other in `likes` table
- Check `matches` table for existing match
- Look for errors in browser console

### Messages not sending
- Verify match exists in `matches` table
- Check RLS policies are enabled
- Ensure user is part of the match

### Cross-device not syncing
- Clear browser cache and localStorage
- Verify user is logged in with same account
- Check network tab for API calls to Supabase

---

## 📈 Next Steps

1. **Implement real-time subscriptions** for instant match notifications
2. **Add message notifications** when user receives new message
3. **Integrate booking system** with match/message flow
4. **Add payment processing** for bookings
5. **Implement review system** after completed bookings

---

## 🎉 You're Done!

Your app now has a complete Tinder-style matching system with:
- ✅ Persistent swipe data
- ✅ Cross-device sync
- ✅ Real-time matching
- ✅ Built-in messaging
- ✅ Ready for booking integration

Both users (aliattiaa@gmail.com and attiaali85@gmail.com) will now see different profiles based on their own swipe history stored in Supabase!
