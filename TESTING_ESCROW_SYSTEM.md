# 🧪 Testing the Payment Escrow System

## Quick Test Guide

Follow these steps to test the complete payment escrow flow.

---

## ✅ Pre-Test Checklist

- [ ] Database migration applied (`QUICK_SETUP_ESCROW.sql`)
- [ ] Edge function deployed (`auto-release-payments`)
- [ ] Test users created (1 owner, 1 sitter)
- [ ] Test pet/dog created for owner
- [ ] Sitter has Stripe Connect account set up

---

## 🎯 Test Scenario 1: Happy Path (Full Flow)

### Step 1: Create Booking (as Owner)
```
1. Login as pet owner
2. Find sitter profile
3. Create booking request
4. Verify status = 'requested'
5. Check notification sent to sitter
```

### Step 2: Accept Booking (as Sitter)
```
1. Login as sitter
2. Go to Bookings page
3. See pending booking
4. Click "Accept" button
5. Verify status = 'confirmed'
6. Check notification sent to owner
```

### Step 3: Pay for Booking (as Owner)
```
1. Login as owner
2. Go to Bookings page
3. See "Pay Now" button
4. Click and complete payment
5. Verify payment_status = 'held'
6. Check payment held in Stripe
```

### Step 4: Complete Service (as Sitter)
```
1. After service time
2. Login as sitter
3. Click "Mark Service Complete"
4. Verify:
   - status = 'completed'
   - completed_at is set
5. Check notification sent to owner
```

### Step 5: Confirm & Review (as Owner)
```
1. Login as owner
2. See "Confirm & Review" button
3. Click button
4. Verify:
   - completion_confirmed_at is set
   - eligible_for_release_at = NOW + 3 days
5. Review modal opens
6. Leave 5-star rating and comment
7. Submit review
8. Check notification sent to sitter
```

### Step 6: Wait for Auto-Release
```
Option A: Wait 3 days naturally
Option B: Fast-forward for testing:

-- In Supabase SQL Editor:
UPDATE bookings 
SET eligible_for_release_at = NOW() - INTERVAL '1 hour'
WHERE id = '[booking_id]';

-- Then manually trigger release:
SELECT * FROM get_bookings_for_auto_release();

-- Or call edge function:
curl -X POST https://[project].supabase.co/functions/v1/auto-release-payments
```

### Step 7: Verify Payment Released
```
1. Check payment_status = 'released'
2. Check payment_released_at is set
3. Verify notification sent to sitter
4. Check Stripe for transfer
```

**✅ Expected Result**: Payment successfully transferred to sitter after 3-day hold!

---

## 🎯 Test Scenario 2: Early Release (Owner Satisfied)

Follow steps 1-5 from Scenario 1, then:

### Step 6: Early Release (as Owner)
```
1. After confirming but before 3 days
2. Login as owner
3. See countdown: "2d 15h remaining"
4. Click "Release Payment Now" button
5. Verify payment released immediately
6. Check notification sent to sitter
```

**✅ Expected Result**: Owner can release payment early if satisfied!

---

## 🎯 Test Scenario 3: Dispute/Issue

Follow steps 1-4 from Scenario 1, then:

### Step 5: Owner Reports Issue
```
1. Owner doesn't click "Confirm & Review"
2. Payment remains held
3. After 3 days, payment still not released
   (requires confirmation first)
```

**Resolution Flow:**
```
Option 1: Issue resolved
- Owner clicks "Confirm & Review"
- 3-day countdown starts

Option 2: Refund needed
- Contact support
- Admin initiates refund via Stripe
- Update booking status to 'cancelled'
```

**✅ Expected Result**: Payment protected until dispute resolved!

---

## 🔍 SQL Queries for Testing

### Check Booking Status
```sql
SELECT 
  id,
  status,
  payment_status,
  completed_at,
  completion_confirmed_at,
  eligible_for_release_at,
  payment_released_at
FROM bookings
WHERE id = '[booking_id]';
```

### Check Notifications
```sql
SELECT type, title, message, created_at
FROM notifications
WHERE related_id = '[booking_id]'
ORDER BY created_at DESC;
```

### Check Reviews
```sql
SELECT 
  r.*,
  reviewer.name as reviewer_name,
  reviewee.name as reviewee_name
FROM reviews r
JOIN users reviewer ON r.reviewer_id = reviewer.id
JOIN users reviewee ON r.reviewee_id = reviewee.id
WHERE r.booking_id = '[booking_id]';
```

### Check Sitter Rating Update
```sql
SELECT 
  w.user_id,
  u.name,
  w.rating,
  w.total_reviews
FROM walker_profiles w
JOIN users u ON w.user_id = u.id
WHERE w.user_id = '[sitter_id]';
```

### Find Bookings Eligible for Auto-Release
```sql
SELECT * FROM get_bookings_for_auto_release();
```

### Manually Release Payment (Testing)
```sql
SELECT release_payment_to_sitter('[booking_id]'::uuid, false);
```

### Force Release (as Owner)
```sql
SELECT release_payment_to_sitter('[booking_id]'::uuid, true);
```

---

## 🐛 Common Issues & Fixes

### Issue: "Payment cannot be released yet"
**Cause**: 3 days haven't passed AND owner isn't forcing release
**Fix**: 
```sql
-- Option 1: Fast-forward time
UPDATE bookings SET eligible_for_release_at = NOW() - INTERVAL '1 hour'
WHERE id = '[booking_id]';

-- Option 2: Force release as owner
SELECT release_payment_to_sitter('[booking_id]'::uuid, true);
```

### Issue: "Service must be completed by sitter first"
**Cause**: Sitter hasn't clicked "Mark Service Complete"
**Fix**: Sitter needs to mark service as complete first

### Issue: "Only the owner can confirm service completion"
**Cause**: Wrong user trying to confirm
**Fix**: Login as the booking owner

### Issue: Review not saving
**Cause**: Booking not completed yet
**Fix**: Complete the service and mark as completed first

### Issue: Auto-release not working
**Cause**: Cron job not set up or not running
**Fix**: 
```bash
# Manually call the function
curl -X POST \
  https://[project].supabase.co/functions/v1/auto-release-payments \
  -H "Authorization: Bearer [service-role-key]"
```

---

## 📊 Test Data Template

### Create Test Booking
```sql
INSERT INTO bookings (
  owner_id, 
  sitter_id, 
  dog_id, 
  start_time, 
  end_time, 
  total_price, 
  commission_fee,
  status,
  payment_status
) VALUES (
  '[owner_user_id]'::uuid,
  '[sitter_user_id]'::uuid,
  '[dog_id]'::uuid,
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day 2 hours',
  50.00,
  10.00,
  'requested',
  'pending'
) RETURNING id;
```

---

## ✅ Test Completion Checklist

- [ ] Booking created and accepted
- [ ] Payment held in escrow
- [ ] Service marked complete by sitter
- [ ] Owner confirmed and reviewed
- [ ] 3-day countdown displays correctly
- [ ] Early release works (optional)
- [ ] Auto-release works after 3 days
- [ ] Payment transferred to sitter
- [ ] All notifications sent correctly
- [ ] Sitter rating updated
- [ ] UI updates in real-time

---

## 🎉 Success Criteria

Your escrow system is working if:

1. ✅ Payments are held until service completion
2. ✅ Owner must confirm before release countdown
3. ✅ 3-day hold period enforced
4. ✅ Owner can release early
5. ✅ Auto-release works after waiting period
6. ✅ Reviews are created and update ratings
7. ✅ Notifications sent at each step
8. ✅ UI shows correct status for both parties

---

## 🚀 Load Testing (Optional)

Test with multiple concurrent bookings:

```sql
-- Create 10 test bookings
DO $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    INSERT INTO bookings (
      owner_id, sitter_id, dog_id, start_time, end_time,
      total_price, commission_fee, status, payment_status,
      completed_at, completion_confirmed_at, eligible_for_release_at
    ) VALUES (
      '[owner_id]'::uuid,
      '[sitter_id]'::uuid,
      '[dog_id]'::uuid,
      NOW(),
      NOW() + INTERVAL '2 hours',
      50.00, 10.00, 'completed', 'held',
      NOW() - INTERVAL '1 day',
      NOW() - INTERVAL '1 day',
      NOW() - INTERVAL '1 hour'  -- Eligible for release
    );
  END LOOP;
END $$;

-- Test auto-release on all 10
SELECT * FROM get_bookings_for_auto_release();
```

---

**Happy Testing!** 🧪✨

