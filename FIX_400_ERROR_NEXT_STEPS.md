# Fix 400 Error - Next Steps

## 🎉 Progress!

✅ **404 Error is FIXED!** The Edge Function is now being called successfully.

Now you're getting a **400 Bad Request** error, which means the function is working but returning an error for a specific reason.

---

## 🔍 What's Causing the 400 Error?

The 400 error is likely caused by one of these issues:

1. **Missing database fields** - The bookings table doesn't have the Stripe payment fields yet
2. **Sitter hasn't set up Stripe Connect** - The sitter needs to complete payout setup
3. **Missing payments table** - The payments table might not exist

---

## ✅ Solution: Run Database Migrations

### Step 1: Run the Stripe Fields Migration

Open your Supabase SQL Editor and run this:

```sql
-- Add Stripe payment fields to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'held', 'released', 'refunded', 'failed')),
ADD COLUMN IF NOT EXISTS commission_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_payment_intent 
ON bookings(stripe_payment_intent_id);

-- Add comments
COMMENT ON COLUMN bookings.stripe_payment_intent_id IS 'Stripe Payment Intent ID for this booking';
COMMENT ON COLUMN bookings.payment_status IS 'Status of payment: pending, held, released, refunded, failed';
COMMENT ON COLUMN bookings.commission_fee IS 'Platform commission fee for this booking';
```

**File:** `database/add_stripe_fields_to_bookings.sql`

### Step 2: Check if Payments Table Exists

Run this diagnostic query:

```sql
-- Check if payments table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'payments'
) as payments_table_exists;
```

**File:** `database/CHECK_BOOKINGS_SCHEMA.sql`

If it returns `false`, you need to create the payments table. Check your existing migration files for the payments table creation.

### Step 3: Verify Stripe Connect Accounts Table

```sql
-- Check if stripe_connect_accounts table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'stripe_connect_accounts'
) as stripe_connect_accounts_exists;
```

---

## 🧪 Test After Migration

After running the migrations:

1. **Refresh your browser** (hard refresh: Ctrl+Shift+R)
2. **Try clicking "Pay Now" again**
3. **Check the console for the new error message**

You'll likely see one of these:

### Expected Error 1: "Sitter has not completed payout setup"
```
400 Bad Request
Error: Sitter has not completed payout setup
```

**This is good!** It means:
- ✅ The function is working
- ✅ The database fields exist
- ❌ The sitter needs to set up Stripe Connect

**Solution:** The sitter needs to:
1. Go to their profile
2. Click "Set up payouts"
3. Complete the Stripe Connect onboarding

### Expected Error 2: "Booking not found"
```
400 Bad Request
Error: Booking not found
```

**This means:**
- The booking ID is invalid or doesn't exist
- Check that the booking exists in the database

### Expected Error 3: Payments table doesn't exist
```
400 Bad Request
Error: relation "payments" does not exist
```

**Solution:** Create the payments table (check your migration files)

---

## 🎯 Quick Checklist

Run these in order:

- [ ] Run `database/add_stripe_fields_to_bookings.sql` in Supabase SQL Editor
- [ ] Run `database/CHECK_BOOKINGS_SCHEMA.sql` to verify
- [ ] Refresh browser and test again
- [ ] Check console for the specific error message
- [ ] If "Sitter has not completed payout setup" → Set up Stripe Connect for the sitter
- [ ] If "Payments table doesn't exist" → Create payments table

---

## 📊 Understanding the Errors

### 404 (FIXED ✅)
- Function doesn't exist or isn't deployed
- **You fixed this!**

### 400 (Current Issue)
- Function exists and is working
- But there's a validation error or missing data
- The error message tells you exactly what's wrong

### 200 (Success - Your Goal)
- Everything works!
- Payment intent created successfully
- You get a `clientSecret` back

---

## 🔧 Debug Commands

### Check if migration was applied:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name = 'stripe_payment_intent_id';
```

If this returns a row, the migration worked!

### Check if sitter has Stripe Connect:
```sql
SELECT * FROM stripe_connect_accounts 
WHERE user_id = 'SITTER_USER_ID';
```

Replace `SITTER_USER_ID` with the actual sitter's user ID.

---

## 🎬 Next Steps After Fixing 400

Once you get past the 400 error, you'll need to:

1. **Set up Stripe Connect for test sitter**
   - Go to sitter profile
   - Click "Set up payouts"
   - Complete Stripe Connect flow

2. **Test the payment flow**
   - Create a booking
   - Click "Pay Now"
   - Complete payment with test card: `4242 4242 4242 4242`

3. **Verify payment in Stripe Dashboard**
   - Check Stripe Dashboard for the payment
   - Verify the platform fee is correct (20%)

---

## 💡 Pro Tip

To see the exact error message from the Edge Function, check the browser's Network tab:

1. Open DevTools (F12)
2. Go to Network tab
3. Click "Pay Now"
4. Find the `create-payment-with-connect` request
5. Click on it
6. Go to "Response" tab
7. You'll see the exact error message like:
   ```json
   {
     "error": "Sitter has not completed payout setup"
   }
   ```

---

## 🆘 Still Stuck?

If you're still getting 400 errors after running migrations:

1. Share the exact error message from the Network tab Response
2. Run the diagnostic queries in `CHECK_BOOKINGS_SCHEMA.sql`
3. Check if the sitter has a Stripe Connect account
4. Verify the booking exists and has the correct sitter_id

---

**TL;DR:** 
1. Run `database/add_stripe_fields_to_bookings.sql` in Supabase
2. Refresh browser and test again
3. Check the specific error message
4. Set up Stripe Connect for the sitter if needed
