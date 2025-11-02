# Test Payment Flow - Step by Step

## 🎯 Current Status

✅ Edge Functions deployed  
✅ Database has Stripe fields  
❌ Sitter needs to set up Stripe Connect  

---

## 🚀 Quick Test (5 Minutes)

### Option 1: Set Up Your Current Sitter Account

1. **Log in as a sitter** (or switch to sitter role)
2. **Go to:** http://localhost:5173/payout-setup
3. **Click "Set up payouts"**
4. **Use these test values:**

   **Business Info:**
   - Type: Individual
   - Country: Spain
   
   **Personal Info:**
   - Name: Test Sitter
   - DOB: 01/01/1990
   - Email: Your email
   
   **Bank Account (IMPORTANT):**
   - IBAN: `ES91 2100 0418 4502 0005 1332` (Stripe test IBAN)
   - Name: Test Sitter
   
   **Address:**
   - Street: Calle Test 123
   - City: Madrid
   - Postal: 28001

5. **Complete onboarding**
6. **You'll be redirected back to your app**

### Option 2: Create a New Test Sitter

1. **Open incognito browser**
2. **Sign up:** http://localhost:5173/signup
   - Email: `testsitter@test.com`
   - Password: `Test123!`
   - Choose "I'm a Sitter"
3. **Complete profile**
4. **Follow Option 1 steps above**

---

## 🧪 Test the Payment

After setting up Stripe Connect:

1. **Log in as pet owner** (your main account)
2. **Go to bookings:** http://localhost:5173/bookings
3. **Click "Pay Now - €15.00"**
4. **You should see the Stripe payment form!** 🎉

### Enter Test Card

- **Card:** `4242 4242 4242 4242`
- **Expiry:** `12/25`
- **CVC:** `123`
- **ZIP:** `12345`

5. **Click "Pay €15.00"**
6. **Payment should succeed!**

---

## ✅ Success Indicators

You'll know it's working when:

1. **No more 400 error** in console
2. **Stripe payment form appears** on the page
3. **After payment:** Booking status changes to "Confirmed"
4. **In Stripe Dashboard:** You see the payment with 20% platform fee

---

## 🔍 Verify in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/payments
2. You should see your test payment
3. Click on it to see details:
   - Amount: €15.00
   - Platform fee: €3.00 (20%)
   - Sitter receives: €12.00 (80%)

---

## 🚨 Troubleshooting

### Still getting 400 error?

**Check 1:** Is Stripe Connect set up?
```sql
-- Run in Supabase SQL Editor
SELECT * FROM stripe_connect_accounts 
WHERE user_id = (
  SELECT id FROM users WHERE role = 'sitter' LIMIT 1
);
```

Should return a row with `payouts_enabled = true`

**Check 2:** Did you run the database migration?
```sql
-- Run in Supabase SQL Editor
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name = 'stripe_payment_intent_id';
```

Should return a row

**Check 3:** Are Edge Functions deployed?
```bash
supabase functions list
```

Should show `create-payment-with-connect` with status ACTIVE

### "Onboarding link failed"?

**Fix:** Deploy the Edge Functions:
```bash
supabase functions deploy create-connect-account
supabase functions deploy create-onboarding-link
```

### "Invalid IBAN"?

**Fix:** Make sure you're using the **test IBAN**:
`ES91 2100 0418 4502 0005 1332`

NOT a real IBAN!

---

## 📊 Expected Console Output

### Before Stripe Connect Setup ❌
```
POST .../create-payment-with-connect 400 (Bad Request)
Payment creation error: Edge Function returned a non-2xx status code
Error: Sitter has not completed payout setup
```

### After Stripe Connect Setup ✅
```
POST .../create-payment-with-connect 200 (OK)
Response: {
  clientSecret: "pi_xxx_secret_xxx",
  platformFee: 3.00,
  sitterAmount: 12.00
}
```

---

## 🎬 Complete Test Checklist

- [ ] Run database migration (`add_stripe_fields_to_bookings.sql`)
- [ ] Deploy Edge Functions (`supabase functions deploy`)
- [ ] Create test sitter account (or use existing)
- [ ] Set up Stripe Connect for sitter
- [ ] Use test IBAN: `ES91 2100 0418 4502 0005 1332`
- [ ] Complete onboarding
- [ ] Log in as pet owner
- [ ] Go to bookings
- [ ] Click "Pay Now"
- [ ] See Stripe payment form (success!)
- [ ] Enter test card: `4242 4242 4242 4242`
- [ ] Complete payment
- [ ] Verify in Stripe Dashboard

---

## 🎯 What You're Testing

This test verifies:

1. ✅ Edge Functions are deployed and working
2. ✅ Database has correct schema
3. ✅ Stripe Connect integration works
4. ✅ Payment intent creation works
5. ✅ Platform fee calculation is correct (20%)
6. ✅ Stripe payment form displays
7. ✅ Payment processing works
8. ✅ Booking status updates after payment

---

## 💡 Pro Tips

1. **Keep Stripe Dashboard open** while testing to see payments in real-time
2. **Use browser DevTools Network tab** to see API calls
3. **Check Supabase logs** if something fails
4. **Test with different cards** to see various scenarios
5. **Test refunds** after successful payment

---

## 📞 Next Steps After Success

Once payment works:

1. Test payment capture (when service is completed)
2. Test refunds (when booking is cancelled)
3. Set up Stripe webhooks
4. Test the complete booking lifecycle
5. Add production Stripe keys (when ready to go live)

---

**TL;DR:**
1. Go to `/payout-setup` as sitter
2. Use test IBAN: `ES91 2100 0418 4502 0005 1332`
3. Complete onboarding
4. Try payment again as owner
5. Use test card: `4242 4242 4242 4242`
6. Success! 🎉
