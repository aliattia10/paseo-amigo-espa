# Final Setup Checklist - Do This Now! ✅

## 🎯 Current Status

✅ Edge Functions deployed and working  
✅ Code fixed (walker_id → sitter_id)  
✅ All guides created  
⏳ Database migration needed  
⏳ Stripe Connect setup needed  

---

## 📋 Complete These Steps Now

### ✅ Step 1: Verify Edge Functions (Already Done!)

```bash
supabase functions list
```

**Expected output:**
```
create-payment-with-connect | ACTIVE | Version 18+
```

✅ **This is done!** Your functions are deployed.

---

### ⏳ Step 2: Run Database Migration (DO THIS NOW - 2 minutes)

1. **Open Supabase Dashboard:** https://supabase.com/dashboard/project/zxbfygofxxmfivddwdqt
2. **Go to:** SQL Editor (left sidebar)
3. **Click:** "New Query"
4. **Copy and paste this:**

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

5. **Click:** "Run" (or press Ctrl+Enter)
6. **Expected result:** "Success. No rows returned"

**Verify it worked:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('stripe_payment_intent_id', 'payment_status', 'commission_fee');
```

Should return 3 rows. ✅

---

### ⏳ Step 3: Set Up Stripe Connect (DO THIS NOW - 5 minutes)

#### Option A: Use Your Current Account as Sitter

1. **Make sure you have a sitter account**
   - Check your role in the database
   - Or create a sitter profile

2. **Go to:** http://localhost:5173/payout-setup
   - Or navigate to: Profile → Payout Setup

3. **Click:** "Set up payouts" or "Complete payout setup"

4. **Fill in Stripe Connect form with TEST values:**

   **🚨 IMPORTANT: Use these EXACT test values:**

   **Business Information:**
   - Business type: `Individual`
   - Country: `Spain` (or your country)
   - Business name: `Test Sitter Business`

   **Personal Information:**
   - First name: `Test`
   - Last name: `Sitter`
   - Date of birth: `01/01/1990`
   - Email: Your email
   - Phone: `+34 600 000 000`

   **Bank Account (CRITICAL!):**
   - **IBAN:** `ES91 2100 0418 4502 0005 1332` ⚠️ **COPY THIS EXACTLY!**
   - Account holder name: `Test Sitter`

   **Address:**
   - Street: `Calle Test 123`
   - City: `Madrid`
   - Postal code: `28001`
   - Country: `Spain`

5. **Click through all steps**
6. **Accept terms**
7. **Submit**
8. **You'll be redirected back to your app**

#### Option B: Create New Test Sitter Account

1. **Open incognito/private browser**
2. **Go to:** http://localhost:5173/signup
3. **Sign up with:**
   - Email: `testsitter@test.com`
   - Password: `Test123!`
4. **Choose:** "I'm a Sitter"
5. **Complete profile**
6. **Follow Option A steps above**

---

### ⏳ Step 4: Verify Stripe Connect Setup (1 minute)

**In Supabase SQL Editor, run:**

```sql
SELECT 
    u.email,
    u.name,
    u.role,
    sca.stripe_account_id,
    sca.payouts_enabled,
    sca.charges_enabled
FROM users u
LEFT JOIN stripe_connect_accounts sca ON u.id = sca.user_id
WHERE u.role = 'sitter';
```

**Expected result:**
- `stripe_account_id`: `acct_xxxxx` (some value)
- `payouts_enabled`: `true` ✅
- `charges_enabled`: `true` ✅

If you see `null` values, Stripe Connect setup didn't complete. Try again!

---

### ⏳ Step 5: Test Payment (3 minutes)

1. **Log in as pet owner** (your main account)
2. **Go to:** http://localhost:5173/bookings
3. **Find a booking** (or create one if needed)
4. **Click:** "Pay Now - €15.00"

**What should happen:**
- ❌ Before: 400 error "Sitter has not completed payout setup"
- ✅ After: Stripe payment form appears!

5. **Enter test card details:**
   - Card number: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
   - ZIP: `12345`

6. **Click:** "Pay €15.00"

7. **Expected result:**
   - ✅ Payment successful!
   - ✅ Booking status changes to "Confirmed"
   - ✅ You're redirected to bookings page

---

### ⏳ Step 6: Verify in Stripe Dashboard (1 minute)

1. **Go to:** https://dashboard.stripe.com/test/payments
2. **You should see:**
   - Payment of €15.00
   - Status: Succeeded
   - Click on it to see details

3. **Verify platform fee:**
   - Total: €15.00
   - Platform fee: €3.00 (20%)
   - Sitter receives: €12.00 (80%)

4. **Check Connect account:**
   - Go to: https://dashboard.stripe.com/test/connect/accounts
   - You should see your test sitter's account
   - Status: Active ✅

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ Database migration runs without errors
2. ✅ Stripe Connect onboarding completes
3. ✅ SQL query shows `payouts_enabled = true`
4. ✅ No 404 error in console
5. ✅ No 400 error in console
6. ✅ Stripe payment form appears
7. ✅ Test payment succeeds
8. ✅ Booking status updates
9. ✅ Payment appears in Stripe Dashboard
10. ✅ Platform fee is correct (20%)

---

## 🚨 Troubleshooting

### Problem: "Onboarding link failed"

**Solution:**
```bash
supabase functions deploy create-connect-account
supabase functions deploy create-onboarding-link
```

### Problem: "Invalid IBAN"

**Solution:** Make sure you're using the TEST IBAN:
`ES91 2100 0418 4502 0005 1332`

NOT a real IBAN!

### Problem: Still getting 400 error after Stripe Connect

**Check 1:** Verify in database
```sql
SELECT * FROM stripe_connect_accounts WHERE payouts_enabled = true;
```

**Check 2:** Clear browser cache and refresh

**Check 3:** Check Stripe Dashboard
- Go to Connect → Accounts
- Make sure account status is "Active"

### Problem: Payment form doesn't appear

**Check 1:** Open browser console (F12)
- Look for the exact error message
- Check Network tab → Response

**Check 2:** Verify database migration
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name = 'stripe_payment_intent_id';
```

**Check 3:** Redeploy Edge Function
```bash
supabase functions deploy create-payment-with-connect
```

---

## 📊 Progress Tracker

Mark these as you complete them:

- [ ] Step 1: Verified Edge Functions deployed ✅ (Already done!)
- [ ] Step 2: Ran database migration
- [ ] Step 3: Set up Stripe Connect for sitter
- [ ] Step 4: Verified Stripe Connect in database
- [ ] Step 5: Tested payment with test card
- [ ] Step 6: Verified payment in Stripe Dashboard

---

## 🎯 What's Next After This Works?

Once payment is working:

1. **Test payment capture** (when service is completed)
2. **Test refunds** (when booking is cancelled)
3. **Set up Stripe webhooks** (for automatic updates)
4. **Test the complete booking lifecycle**
5. **Add production Stripe keys** (when ready to launch)

---

## 💡 Quick Commands Reference

**Deploy Edge Functions:**
```bash
supabase functions deploy
```

**Check deployment:**
```bash
supabase functions list
```

**Check database:**
```sql
-- Check bookings table
SELECT * FROM bookings LIMIT 1;

-- Check Stripe Connect
SELECT * FROM stripe_connect_accounts;
```

**Check Stripe Dashboard:**
- Payments: https://dashboard.stripe.com/test/payments
- Connect: https://dashboard.stripe.com/test/connect/accounts

---

## 🆘 Need Help?

If you get stuck:

1. **Check the exact error message** in browser console
2. **Check Network tab** → Response for detailed error
3. **Run diagnostic queries** in Supabase SQL Editor
4. **Check Stripe Dashboard** for account status
5. **Share the error message** and I can help debug

---

## ✅ Final Checklist

Before you start:
- [ ] Supabase Dashboard open
- [ ] Stripe Dashboard open (test mode)
- [ ] Browser DevTools open (F12)
- [ ] Ready to use test values (IBAN, card)

Let's do this! 🚀

---

**Start with Step 2 (Database Migration) right now!**

Copy the SQL from Step 2, paste it in Supabase SQL Editor, and run it.

Then move to Step 3 (Stripe Connect setup).

You're 10 minutes away from a working payment system! 💪
