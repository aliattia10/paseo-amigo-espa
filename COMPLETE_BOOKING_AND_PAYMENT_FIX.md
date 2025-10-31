# 🎯 Complete Booking & Payment Fix Guide

## 🔍 Problems Identified

### 1. **Notifications Table Error**
```
column "related_id" of relation "notifications" does not exist
```
- The `notifications` table is missing the `related_id` column
- Some database migrations have it, others don't

### 2. **Decline Button Not Working**
- The decline button calls `update_booking_status` function which may not exist
- Missing cancellation reason parameter

### 3. **Accept Button Doesn't Redirect to Payment**
- Currently only updates booking status
- Doesn't initiate Stripe payment flow
- No platform commission handling

### 4. **Payment Flow Missing**
- No Stripe Connect integration
- No 20% platform fee implementation
- No redirect to payment page

---

## ✅ Solutions Implemented

### Fix 1: Notifications Table & Booking Functions

**File:** `database/FIX_NOTIFICATIONS_AND_BOOKING_FLOW.sql`
**Migration:** `supabase/migrations/20251101000001_fix_notifications_booking_flow.sql`

**What it does:**
- ✅ Adds `related_id` column to notifications table
- ✅ Renames `is_read` to `read` for consistency
- ✅ Creates `update_booking_status()` function
- ✅ Creates `initiate_booking_payment()` function
- ✅ Adds index on `related_id` for performance

### Fix 2: BookingsPage with Payment Flow

**File:** `src/pages/BookingsPage.tsx`

**Changes:**
1. **Accept Button Logic:**
   - If **Sitter** clicks Accept → Updates booking to 'confirmed'
   - If **Owner** clicks Accept → Redirects to payment page
   - Shows appropriate success messages

2. **Decline Button Logic:**
   - Prompts for cancellation reason
   - Calls `update_booking_status` with reason
   - Notifies both parties via notifications

### Fix 3: PaymentPage with Stripe Connect

**File:** `src/pages/PaymentPage.tsx`

**Changes:**
1. **Uses Query Parameters:**
   - Reads `bookingId` from URL query params
   - Works with navigation from BookingsPage

2. **Stripe Connect Integration:**
   - Calls `create-payment-with-connect` function
   - Automatically splits payment: 80% sitter, 20% platform
   - Shows fee breakdown to user

3. **Better Error Handling:**
   - Shows detailed error messages
   - Redirects back to bookings on failure
   - Updates booking with payment intent ID

---

## 🚀 How to Apply the Fixes

### **Method 1: Via Supabase Dashboard (Recommended)**

#### Step 1: Fix Notifications Table
1. Go to: https://supabase.com/dashboard/project/zxbfygofxxmfivddwdqt/sql/new
2. Open file: `supabase/migrations/20251101000001_fix_notifications_booking_flow.sql`
3. Copy the entire content
4. Paste into SQL Editor
5. Click **Run**

#### Step 2: Fix Availability Table (if not done yet)
1. Still in SQL Editor
2. Open file: `supabase/migrations/20251101000000_fix_availability_time_type.sql`
3. Copy and paste
4. Click **Run**

#### Step 3: Deploy Frontend Changes
```bash
# The code changes are already made to:
# - src/pages/BookingsPage.tsx
# - src/pages/PaymentPage.tsx

# Just rebuild and deploy your app:
npm run build

# If using Netlify:
netlify deploy --prod

# Or push to your git repository for auto-deployment
git add .
git commit -m "Fix booking and payment flow with Stripe Connect"
git push origin main
```

---

### **Method 2: Via Supabase CLI**

```bash
# Install CLI (if not already installed)
npm install -g supabase

# Link project
supabase link --project-ref zxbfygofxxmfivddwdqt

# Push migrations
supabase db push

# Deploy frontend
npm run build
netlify deploy --prod
```

---

## 📋 Payment Flow Explained

### **Complete Booking Flow:**

1. **Owner Creates Booking**
   ```
   Status: requested
   Payment: none
   ```

2. **Sitter Clicks "Accept"**
   ```
   Status: confirmed
   Notification sent to Owner
   ```

3. **Owner Sees Notification / Visits Bookings**
   ```
   Owner clicks "Accept" button
   → Redirects to /payment?bookingId=xxx&amount=yyy
   ```

4. **Payment Page**
   ```
   - Calls create-payment-with-connect
   - Creates Stripe Payment Intent with:
     * Total Amount: Full booking price
     * Platform Fee: 20% (auto-calculated)
     * Sitter Amount: 80% (goes to sitter's Stripe Connect)
   - Shows fee breakdown to owner
   ```

5. **Owner Pays**
   ```
   - Stripe processes payment
   - Funds held in escrow
   - Booking updated: payment_status = 'held'
   - Status: confirmed
   ```

6. **Service Completed**
   ```
   - Owner clicks "Release Payment"
   - Calls capture-payment function
   - 80% transferred to sitter's account
   - 20% kept by platform (you)
   - Status: completed
   ```

### **If Owner Cancels:**
```
- Owner clicks "Decline" / "Cancel & Refund"
- Funds returned to owner
- Status: cancelled
```

---

## 💰 Commission Breakdown

For every booking:

| Amount | Goes To | Percentage |
|--------|---------|------------|
| €100   | **€80** to Sitter | 80% |
| €100   | **€20** to Platform (You) | 20% |

**Example:**
- Booking Price: €50
- Sitter Receives: €40
- Platform Receives: €10

---

## 🔧 Database Functions Created

### 1. `update_booking_status()`
```sql
update_booking_status(
  p_booking_id UUID,
  p_new_status TEXT,
  p_cancellation_reason TEXT DEFAULT NULL
)
```

**Usage:**
- Updates booking status
- Handles availability changes
- Sends notifications

### 2. `initiate_booking_payment()`
```sql
initiate_booking_payment(
  p_booking_id UUID
)
```

**Returns:**
- booking_id
- amount
- commission_fee
- sitter_amount
- sitter_id
- owner_email
- description

---

## 🎨 UI Changes

### BookingsPage

**Before:**
```
[Accept] [Decline]
↓
Just updates status
```

**After:**
```
[Accept] [Decline]
↓
SITTER: Updates to confirmed
OWNER: Redirects to payment
```

### PaymentPage

**Before:**
```
Total: €50
[Pay]
```

**After:**
```
Total: €50
  Goes to Sitter (80%): €40
  Platform Fee (20%): €10
[Pay €50]
```

---

## ✅ Testing Checklist

### 1. Test Notifications Fix
```sql
-- Run in Supabase SQL Editor:
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'notifications';
```

**Expected:** Should see `related_id` column

### 2. Test Sitter Accept Flow
1. Login as **Sitter**
2. Go to Bookings
3. See booking with status "Requested"
4. Click **Accept**
5. ✅ Should see success message
6. ✅ Booking status changes to "Confirmed"

### 3. Test Owner Payment Flow
1. Login as **Owner**
2. Go to Bookings
3. See booking with status "Confirmed"
4. Click **Accept** (to pay)
5. ✅ Should redirect to `/payment?bookingId=xxx&amount=yyy`
6. ✅ Should see payment form with fee breakdown
7. Enter test card: `4242 4242 4242 4242`
8. Click **Pay**
9. ✅ Payment should process
10. ✅ Redirect back to bookings
11. ✅ Booking shows "Paid" status

### 4. Test Decline Flow
1. Login as **Sitter** or **Owner**
2. Go to Bookings
3. See booking with status "Requested"
4. Click **Decline**
5. ✅ Should prompt for cancellation reason
6. Enter reason and confirm
7. ✅ Booking status changes to "Cancelled"
8. ✅ Notification sent to other party

---

## 🆘 Troubleshooting

### Error: "related_id column does not exist"
**Solution:** Run the notifications fix migration:
```sql
ALTER TABLE notifications ADD COLUMN related_id UUID;
```

### Error: "function update_booking_status does not exist"
**Solution:** Run the complete migration file:
- `supabase/migrations/20251101000001_fix_notifications_booking_flow.sql`

### Error: "time without time zone <= timestamp"
**Solution:** Run the availability fix:
- `supabase/migrations/20251101000000_fix_availability_time_type.sql`

### Payment not redirecting
**Check:**
1. BookingsPage.tsx is updated
2. Router has `/payment` route defined
3. PaymentPage.tsx is imported in routes

### Stripe Connect not working
**Check:**
1. Sitter has completed Stripe Connect onboarding
2. `create-payment-with-connect` function exists
3. Stripe secret key is configured in Supabase

---

## 📞 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/zxbfygofxxmfivddwdqt
- **SQL Editor:** https://supabase.com/dashboard/project/zxbfygofxxmfivddwdqt/sql/new
- **Your App:** https://petflik.com
- **Stripe Dashboard:** https://dashboard.stripe.com

---

## 🎉 Success Indicators

After applying all fixes, you should see:

1. ✅ No "related_id" error on bookings page
2. ✅ Accept button redirects to payment
3. ✅ Payment page shows 20% platform fee
4. ✅ Decline button works with reason prompt
5. ✅ Notifications sent to both parties
6. ✅ Payment splits automatically (80/20)
7. ✅ Sitter can receive payouts
8. ✅ Platform earns 20% commission

---

**Ready to fix everything? Follow Method 1 or Method 2 above!** 🚀

