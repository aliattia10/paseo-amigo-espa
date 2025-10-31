# 💰 Payment Escrow System with 3-Day Hold

## Overview

This system holds payment securely until the service is complete and confirmed, with a 3-day waiting period before funds are transferred to the sitter. This protects both pet owners and sitters.

---

## 🔄 Complete Payment Flow

### 1. **Booking & Payment**
```
Owner creates booking → Status: requested
                     ↓
Sitter accepts      → Status: confirmed
                     ↓
Owner pays          → Payment Status: held (funds in escrow)
                     → Status: confirmed
```

### 2. **Service Completion**
```
Sitter completes service
                     ↓
Sitter clicks "Mark Service Complete"
                     ↓
Status: completed
completed_at: [timestamp]
                     ↓
Owner receives notification
```

### 3. **Owner Confirmation**
```
Owner clicks "Confirm & Review"
                     ↓
completion_confirmed_at: [timestamp]
eligible_for_release_at: [timestamp + 3 days]
                     ↓
Review modal opens automatically
                     ↓
Owner leaves rating & review
```

### 4. **3-Day Hold Period**
```
Day 1-3: Payment held in escrow
         ↓
         Owner can release early (optional)
         OR
         Automatic release after 3 days
         ↓
Day 3+:  Payment Status: released
         Funds transferred to sitter
         ↓
         Sitter receives notification
```

---

## 🎯 Key Features

### ✅ Payment Protection
- Funds held until service completion confirmed
- 3-day dispute window
- Owner can release early if satisfied
- Automatic release after waiting period

### ✅ Review System
- Review modal opens when owner confirms completion
- Rating (1-5 stars) required
- Optional written comment
- Updates sitter's average rating automatically

### ✅ Automatic Release
- Scheduled job checks for eligible payments hourly
- Releases funds after 3-day period automatically
- Notifications sent to sitter

### ✅ Transparency
- Real-time countdown shows time remaining
- Clear status indicators for both parties
- Notification at each step

---

## 🎨 UI Flow for Users

### For SITTERS:

**Step 1: After Service**
```
[✅ Mark Service Complete] button appears
```

**Step 2: After Marking Complete**
```
⏳ Waiting for owner confirmation
```

**Step 3: After Owner Confirms**
```
✅ Service Confirmed
Payment release: 2d 15h remaining
Payment will be automatically released after 3 days
```

**Step 4: Payment Released**
```
💵 Payment Released - Transferred to sitter
```

### For OWNERS:

**Step 1: After Payment**
```
✓ Payment secured - Waiting for service
```

**Step 2: After Sitter Marks Complete**
```
🎉 Service completed! Please confirm and review
[✓ Confirm & Review] button
```

**Step 3: After Confirming**
```
Review Modal Opens Automatically:
- Rate 1-5 stars
- Leave optional comment
- Submit review
```

**Step 4: Waiting Period**
```
✅ Service Confirmed
Payment release: 2d 15h remaining
[💰 Release Payment Now] button (optional early release)
```

---

## 📋 Database Fields Added

### bookings table:
```sql
completed_at                -- When sitter marked service complete
completion_confirmed_by     -- Owner's user ID
completion_confirmed_at     -- When owner confirmed
eligible_for_release_at     -- Date when payment can be released (confirmation + 3 days)
payment_released_at         -- When payment was actually released
```

---

## 🔧 Functions Created

### 1. `mark_service_completed(p_booking_id)`
- Called by sitter after completing service
- Updates status to 'completed'
- Notifies owner to confirm

### 2. `confirm_service_completion(p_booking_id)`
- Called by owner to confirm completion
- Sets 3-day hold period
- Returns release date
- Notifies sitter

### 3. `release_payment_to_sitter(p_booking_id, p_force_release)`
- Releases payment to sitter
- Checks if 3 days passed OR owner forcing early release
- Updates payment status to 'released'
- Notifies sitter

### 4. `create_review(p_booking_id, p_reviewee_id, p_rating, p_comment)`
- Creates review for booking
- Updates sitter's average rating
- Notifies sitter of new review

### 5. `get_bookings_for_auto_release()`
- Finds all bookings eligible for auto-release
- Used by scheduled job
- Returns booking IDs and payment details

---

## 🤖 Automatic Payment Release

### Edge Function: `auto-release-payments`
Located: `supabase/functions/auto-release-payments/index.ts`

**Setup Instructions:**

1. **Deploy the function:**
```bash
supabase functions deploy auto-release-payments
```

2. **Set up cron job (recommended: every hour):**

Using Supabase Dashboard:
- Go to Database → Webhooks
- Create new webhook with cron schedule: `0 * * * *` (every hour)
- Point to: `https://[project].supabase.co/functions/v1/auto-release-payments`
- Set authorization header with your service role key

OR using external service (like GitHub Actions):
```yaml
name: Auto Release Payments
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Call release function
        run: |
          curl -X POST \
            https://[project].supabase.co/functions/v1/auto-release-payments \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}"
```

---

## 💳 Stripe Integration

The payment flow uses Stripe Connect with escrow:

1. **Payment Created**: `payment_status = 'held'`
2. **Service Completed & Confirmed**: Waiting period starts
3. **After 3 Days or Early Release**: 
   - Stripe transfers 80% to sitter
   - Platform keeps 20% commission
   - `payment_status = 'released'`

---

## 🚀 Quick Setup

### Step 1: Run Migration
```bash
# In Supabase SQL Editor, run:
supabase/migrations/20251101000002_payment_escrow_with_hold.sql
```

### Step 2: Deploy Edge Function
```bash
supabase functions deploy auto-release-payments
```

### Step 3: Set Up Cron Job
Schedule the auto-release function to run every hour (see above).

### Step 4: Test the Flow
1. Create a booking
2. Sitter accepts
3. Owner pays
4. Sitter marks complete
5. Owner confirms & reviews
6. Wait 3 days (or test early release)
7. Payment automatically releases

---

## 🔒 Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ User verification on all functions
- ✅ Only sitter can mark service complete
- ✅ Only owner can confirm completion
- ✅ Only owner can force early release
- ✅ Reviews only for completed bookings
- ✅ One review per booking per user

---

## 📊 Notifications Sent

| Event | Recipient | Type | Message |
|-------|-----------|------|---------|
| Service Completed | Owner | `service_completed` | Service completed. Please confirm and review. |
| Completion Confirmed | Sitter | `completion_confirmed` | Owner confirmed. Payment in 3 days. |
| Payment Released | Sitter | `payment_released` | Payment released to your account. |
| Review Received | Sitter | `review_received` | You received a new review! |

---

## 🎉 Benefits

### For Pet Owners:
- ✅ Pay safely with funds held in escrow
- ✅ 3-day window to ensure quality
- ✅ Can release early if very satisfied
- ✅ Leave reviews to help community

### For Sitters:
- ✅ Guaranteed payment after completion
- ✅ Clear timeline (3 days max)
- ✅ Build reputation with reviews
- ✅ Automatic transfer, no action needed

### For Platform:
- ✅ 20% commission on all transactions
- ✅ Reduced disputes with escrow system
- ✅ Better user trust and retention
- ✅ Automated payment processing

---

## 🆘 Troubleshooting

### Payment Not Releasing After 3 Days?
1. Check if cron job is running
2. Check Edge Function logs
3. Manually call `release_payment_to_sitter(booking_id, false)`

### Owner Can't Confirm Completion?
- Verify sitter marked service as complete first
- Check booking status is 'completed'

### Review Not Saving?
- Verify booking is completed
- Check user is part of the booking
- Rating must be between 1-5

---

## 📱 Component Files

- **Migration**: `supabase/migrations/20251101000002_payment_escrow_with_hold.sql`
- **Edge Function**: `supabase/functions/auto-release-payments/index.ts`
- **UI Component**: `src/pages/BookingsPage.tsx`
- **Review Modal**: `src/components/bookings/ReviewModal.tsx`

---

## ✅ Checklist

- [ ] Run database migration
- [ ] Deploy auto-release edge function
- [ ] Set up cron job for automatic releases
- [ ] Test complete flow end-to-end
- [ ] Verify Stripe integration
- [ ] Check notifications are sent
- [ ] Test review system
- [ ] Verify automatic release after 3 days

---

**All set!** Your payment escrow system is now protecting both sitters and owners with a fair 3-day hold period. 🎉

