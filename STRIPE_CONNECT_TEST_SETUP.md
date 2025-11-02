# Stripe Connect Test Setup Guide

## 🎯 Current Issue

The payment is failing with a 400 error because:
**"Sitter has not completed payout setup"**

This is expected! The sitter needs to complete Stripe Connect onboarding before they can receive payments.

---

## ✅ Solution: Set Up Stripe Connect for Test Sitter

### Step 1: Create a Test Sitter Account

If you don't have a test sitter account yet:

1. **Open an incognito/private browser window**
2. Go to your app: http://localhost:5173 (or your dev URL)
3. Sign up with a different email (e.g., `testsitter@example.com`)
4. Choose "I'm a Sitter" during role selection
5. Complete the sitter profile setup

### Step 2: Set Up Stripe Connect for the Sitter

1. **Log in as the sitter** (in the incognito window)
2. Go to the sitter's profile or dashboard
3. Look for **"Set up payouts"** or **"Complete payout setup"** button
4. Click it - this will call the `create-connect-account` Edge Function
5. You'll be redirected to Stripe Connect onboarding

### Step 3: Complete Stripe Connect Onboarding (Test Mode)

Stripe will ask for business information. For testing, use these **test values**:

#### Business Information
- **Business type:** Individual
- **Country:** Spain (or your country)
- **Business name:** Test Sitter Business
- **Business website:** https://example.com

#### Personal Information
- **First name:** Test
- **Last name:** Sitter
- **Date of birth:** 01/01/1990
- **Email:** testsitter@example.com
- **Phone:** +34 600 000 000

#### Bank Account (IMPORTANT - Use Test Values)

For **Spain (SEPA)**:
- **IBAN:** `ES91 2100 0418 4502 0005 1332` (Stripe test IBAN)
- **Account holder name:** Test Sitter

For **US** (if testing with US):
- **Routing number:** `110000000` (Stripe test routing)
- **Account number:** `000123456789` (Stripe test account)

#### Address
- **Street:** Calle Test 123
- **City:** Madrid
- **Postal code:** 28001
- **Country:** Spain

#### Identity Verification

Stripe may ask for identity verification. In **test mode**, you can use:
- **Test SSN (US):** `000-00-0000`
- **Test ID number:** Any test value

### Step 4: Complete Onboarding

1. Click through all the steps
2. Accept Stripe's terms
3. Submit the form
4. You'll be redirected back to your app
5. The sitter's Stripe Connect account is now active!

---

## 🧪 Test the Payment Flow

Now that the sitter has Stripe Connect set up:

1. **Log out of the sitter account**
2. **Log in as the pet owner** (your main account)
3. **Go to a booking**
4. **Click "Pay Now - €15.00"**
5. **You should now see the Stripe payment form!** 🎉

### Test Card Numbers

Use these Stripe test cards:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

**Declined Payment (for testing):**
- Card: `4000 0000 0000 0002`

**Requires Authentication (3D Secure):**
- Card: `4000 0025 0000 3155`

---

## 🔍 Verify Stripe Connect Setup

### Check in Supabase

Run this query in Supabase SQL Editor:

```sql
-- Check if sitter has Stripe Connect account
SELECT 
    u.email,
    u.name,
    sca.stripe_account_id,
    sca.payouts_enabled,
    sca.charges_enabled,
    sca.created_at
FROM users u
LEFT JOIN stripe_connect_accounts sca ON u.id = sca.user_id
WHERE u.role = 'sitter';
```

You should see:
- `stripe_account_id`: `acct_xxxxx` (Stripe account ID)
- `payouts_enabled`: `true`
- `charges_enabled`: `true`

### Check in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/connect/accounts
2. You should see your test sitter's connected account
3. Status should be "Active"

---

## 🚨 Common Issues

### Issue 1: "Onboarding link creation failed"

**Cause:** The `create-connect-account` or `create-onboarding-link` Edge Function isn't deployed.

**Fix:**
```bash
supabase functions deploy create-connect-account
supabase functions deploy create-onboarding-link
```

### Issue 2: "Account already exists"

**Cause:** The sitter already has a Stripe Connect account.

**Fix:** 
- Check the database for existing account
- Or create a new test sitter account

### Issue 3: "Invalid IBAN"

**Cause:** Using a real IBAN in test mode.

**Fix:** Use Stripe's test IBAN: `ES91 2100 0418 4502 0005 1332`

### Issue 4: "Payouts not enabled"

**Cause:** Onboarding not completed or verification pending.

**Fix:** 
- Complete all onboarding steps
- In test mode, verification is instant
- Check Stripe Dashboard for account status

---

## 📊 Expected Flow

### Before Stripe Connect Setup ❌
```
Owner clicks "Pay Now"
  ↓
Edge Function checks sitter's Stripe account
  ↓
❌ 400 Error: "Sitter has not completed payout setup"
```

### After Stripe Connect Setup ✅
```
Owner clicks "Pay Now"
  ↓
Edge Function checks sitter's Stripe account
  ↓
✅ Sitter has active Stripe Connect account
  ↓
Create payment intent with 20% platform fee
  ↓
Return client secret to frontend
  ↓
Show Stripe payment form
  ↓
Owner enters card details
  ↓
Payment successful!
  ↓
80% goes to sitter, 20% to platform
```

---

## 🎬 Quick Setup Script

Here's the complete flow:

1. **Create test sitter account** (incognito browser)
   - Email: `testsitter@example.com`
   - Password: `TestPassword123!`
   - Role: Sitter

2. **Set up Stripe Connect** (as sitter)
   - Click "Set up payouts"
   - Use test values above
   - Complete onboarding

3. **Create a booking** (as owner)
   - Find the test sitter
   - Create a booking
   - Sitter accepts booking

4. **Make payment** (as owner)
   - Go to bookings
   - Click "Pay Now"
   - Use test card: `4242 4242 4242 4242`
   - Complete payment

5. **Verify in Stripe Dashboard**
   - Check payment was created
   - Verify 20% platform fee
   - Confirm 80% goes to sitter

---

## 🔐 Important Notes

### Test Mode vs Production

**Test Mode (Current):**
- Use test card numbers
- Use test bank accounts
- No real money involved
- Instant verification

**Production Mode (Later):**
- Real card numbers
- Real bank accounts
- Real money transfers
- Real identity verification required
- May take 1-2 days for verification

### Stripe Connect Account Types

Your app uses **Express accounts**:
- ✅ Easiest to set up
- ✅ Stripe handles compliance
- ✅ Stripe handles payouts
- ✅ Best for marketplaces

---

## 🎯 Next Steps After Setup

Once Stripe Connect is working:

1. ✅ Test the complete payment flow
2. ✅ Test payment capture (after service completion)
3. ✅ Test refunds (for cancellations)
4. ✅ Set up Stripe webhooks
5. ✅ Test payout schedule (Stripe pays sitters automatically)

---

## 📞 Need Help?

### Check Stripe Connect Status
```sql
SELECT * FROM stripe_connect_accounts 
WHERE user_id = 'SITTER_USER_ID';
```

### Check Edge Function Logs
```bash
# In Supabase Dashboard
# Go to Edge Functions > create-connect-account > Logs
```

### Test Stripe API Key
Make sure you're using the **test** key:
- Starts with `sk_test_`
- NOT `sk_live_`

---

**TL;DR:**
1. Create test sitter account (incognito browser)
2. Log in as sitter
3. Click "Set up payouts"
4. Use test values (IBAN: `ES91 2100 0418 4502 0005 1332`)
5. Complete onboarding
6. Log in as owner
7. Try payment again - should work! 🎉
