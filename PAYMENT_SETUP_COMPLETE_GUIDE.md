# Complete Payment Setup Guide - Summary

## 🎉 What We've Accomplished

✅ Fixed 404 Edge Function error  
✅ Fixed `walker_id` → `sitter_id` bug  
✅ Deployed all Edge Functions  
✅ Created database migration for Stripe fields  
✅ Identified the final issue: Sitter needs Stripe Connect  

---

## 🎯 What You Need to Do Now

### 1. Run Database Migration (2 minutes)

Open Supabase SQL Editor and run:

**File:** `database/add_stripe_fields_to_bookings.sql`

```sql
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS commission_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_bookings_stripe_payment_intent 
ON bookings(stripe_payment_intent_id);
```

### 2. Set Up Stripe Connect for Sitter (5 minutes)

**Option A: Use Your Current Account**
1. Log in as a sitter (or switch role)
2. Go to: http://localhost:5173/payout-setup
3. Click "Set up payouts"
4. Use test values (see below)

**Option B: Create Test Sitter**
1. Open incognito browser
2. Sign up: testsitter@test.com
3. Choose "I'm a Sitter"
4. Go to payout setup
5. Use test values (see below)

**Test Values for Stripe Connect:**
- **IBAN:** `ES91 2100 0418 4502 0005 1332` ⚠️ IMPORTANT!
- **Name:** Test Sitter
- **DOB:** 01/01/1990
- **Address:** Calle Test 123, Madrid, 28001

### 3. Test Payment (2 minutes)

1. Log in as pet owner
2. Go to bookings
3. Click "Pay Now - €15.00"
4. Enter test card: `4242 4242 4242 4242`
5. Expiry: 12/25, CVC: 123
6. Click "Pay"
7. Success! 🎉

---

## 📚 Documentation Created

I've created these guides for you:

1. **TEST_PAYMENT_FLOW_NOW.md** - Quick test guide (START HERE!)
2. **STRIPE_CONNECT_TEST_SETUP.md** - Detailed Stripe Connect setup
3. **FIX_400_ERROR_NEXT_STEPS.md** - Troubleshooting 400 errors
4. **DEPLOY_NOW.md** - Edge Function deployment
5. **FIX_404_EDGE_FUNCTION_SUMMARY.md** - How we fixed the 404

---

## 🔍 How to Verify Everything is Working

### Check 1: Database Migration
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name = 'stripe_payment_intent_id';
```
✅ Should return a row

### Check 2: Edge Functions Deployed
```bash
supabase functions list
```
✅ Should show `create-payment-with-connect` as ACTIVE

### Check 3: Stripe Connect Set Up
```sql
SELECT * FROM stripe_connect_accounts 
WHERE payouts_enabled = true;
```
✅ Should return at least one row

### Check 4: Payment Works
- Go to bookings
- Click "Pay Now"
- ✅ Should see Stripe payment form (not 404 or 400 error)

---

## 🚨 Common Issues & Solutions

### Issue: Still getting 404
**Solution:** Redeploy Edge Functions
```bash
supabase functions deploy
```

### Issue: Getting 400 "Sitter has not completed payout setup"
**Solution:** Complete Stripe Connect onboarding (see TEST_PAYMENT_FLOW_NOW.md)

### Issue: "Invalid IBAN"
**Solution:** Use test IBAN: `ES91 2100 0418 4502 0005 1332`

### Issue: "Booking not found"
**Solution:** 
- Make sure booking exists
- Check booking has correct sitter_id
- Run database migration

### Issue: "Payments table doesn't exist"
**Solution:** Check your migration files for payments table creation

---

## 📊 Payment Flow Diagram

```
Pet Owner                    System                      Sitter
    |                          |                           |
    | 1. Click "Pay Now"       |                           |
    |------------------------->|                           |
    |                          |                           |
    |                          | 2. Check sitter has       |
    |                          |    Stripe Connect         |
    |                          |-------------------------->|
    |                          |                           |
    |                          | 3. Create payment intent  |
    |                          |    with 20% platform fee  |
    |                          |                           |
    | 4. Show Stripe form      |                           |
    |<-------------------------|                           |
    |                          |                           |
    | 5. Enter card details    |                           |
    |------------------------->|                           |
    |                          |                           |
    |                          | 6. Process payment        |
    |                          |    €15.00 total           |
    |                          |    €3.00 platform fee     |
    |                          |    €12.00 to sitter       |
    |                          |                           |
    | 7. Payment success!      |                           |
    |<-------------------------|                           |
    |                          |                           |
    |                          | 8. Update booking status  |
    |                          |    to "confirmed"         |
    |                          |                           |
```

---

## 🎯 Testing Checklist

Complete these in order:

- [ ] Run database migration
- [ ] Verify migration with SQL query
- [ ] Deploy Edge Functions
- [ ] Verify deployment with `supabase functions list`
- [ ] Set up Stripe Connect for test sitter
- [ ] Use test IBAN (not real IBAN!)
- [ ] Complete Stripe onboarding
- [ ] Verify in Supabase: `stripe_connect_accounts` table
- [ ] Log in as pet owner
- [ ] Navigate to bookings
- [ ] Click "Pay Now"
- [ ] Verify Stripe form appears (no 404/400)
- [ ] Enter test card: 4242 4242 4242 4242
- [ ] Complete payment
- [ ] Verify booking status changes to "confirmed"
- [ ] Check Stripe Dashboard for payment
- [ ] Verify platform fee is 20% (€3.00)
- [ ] Verify sitter receives 80% (€12.00)

---

## 🎬 What Happens Next

After successful payment:

1. **Booking status** changes to "confirmed"
2. **Payment is held** by Stripe (not released yet)
3. **When service is completed:**
   - Owner clicks "Release Payment"
   - Calls `capture-payment` Edge Function
   - Sitter receives €12.00
   - Platform keeps €3.00

4. **If booking is cancelled:**
   - Owner/Sitter clicks "Cancel & Refund"
   - Calls `refund-payment` Edge Function
   - Owner gets full refund (€15.00)

---

## 💡 Pro Tips

1. **Always use test values in test mode**
   - Test IBAN: `ES91 2100 0418 4502 0005 1332`
   - Test card: `4242 4242 4242 4242`
   - Never use real bank accounts or cards in test mode!

2. **Keep Stripe Dashboard open** while testing
   - See payments in real-time
   - Verify platform fees
   - Check payout schedule

3. **Use browser DevTools**
   - Network tab shows API calls
   - Console shows errors
   - Response tab shows exact error messages

4. **Test the complete flow**
   - Create booking
   - Make payment
   - Complete service
   - Release payment
   - Check sitter receives payout

---

## 🚀 Production Checklist (For Later)

When ready to go live:

- [ ] Switch to Stripe live keys
- [ ] Update `STRIPE_SECRET_KEY` secret
- [ ] Update frontend Stripe publishable key
- [ ] Set up Stripe webhooks
- [ ] Test with real bank account (your own)
- [ ] Verify identity verification works
- [ ] Test payout schedule (2-7 days)
- [ ] Set up customer support for payment issues
- [ ] Add terms of service for payments
- [ ] Add privacy policy for financial data
- [ ] Comply with local regulations (PSD2, etc.)

---

## 📞 Need Help?

### Quick Diagnostics

**Check Edge Functions:**
```bash
supabase functions list
```

**Check Database:**
```sql
-- Check bookings table
SELECT * FROM bookings LIMIT 1;

-- Check Stripe Connect accounts
SELECT * FROM stripe_connect_accounts;

-- Check payments table
SELECT * FROM payments LIMIT 1;
```

**Check Stripe Dashboard:**
- Payments: https://dashboard.stripe.com/test/payments
- Connect: https://dashboard.stripe.com/test/connect/accounts
- Logs: https://dashboard.stripe.com/test/logs

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ No 404 errors in console
2. ✅ No 400 errors in console
3. ✅ Stripe payment form appears
4. ✅ Test payment succeeds
5. ✅ Booking status updates to "confirmed"
6. ✅ Payment appears in Stripe Dashboard
7. ✅ Platform fee is correct (20%)
8. ✅ Sitter's Stripe account shows pending payout

---

**Ready to test? Start with TEST_PAYMENT_FLOW_NOW.md!** 🚀

---

## 📝 Summary

**What was wrong:**
- Edge Function wasn't deployed (404)
- Function had `walker_id` bug (400)
- Sitter needs Stripe Connect (400)

**What we fixed:**
- ✅ Deployed Edge Functions
- ✅ Fixed `walker_id` → `sitter_id`
- ✅ Created database migration
- ✅ Created setup guides

**What you need to do:**
1. Run database migration
2. Set up Stripe Connect for sitter
3. Test payment with test card

**Time required:** ~10 minutes total

**Result:** Working payment system! 🎉
