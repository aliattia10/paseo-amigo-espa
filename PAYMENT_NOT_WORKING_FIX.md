# Payment Not Working - Quick Fix

## The Problem

You're seeing:
- ❌ Payment form doesn't appear
- ❌ "IntegrationError: Could not retrieve data from Elements"
- ❌ "Failed to connect to Netmask"
- ❌ Status 400 error from Edge Function

## Root Cause

**Missing Stripe Publishable Key!**

The payment form can't load because `VITE_STRIPE_PUBLISHABLE_KEY` is not set in your environment variables.

## Quick Fix (5 Minutes)

### Step 1: Get Your Stripe Key

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy the "Publishable key" (starts with `pk_test_`)
3. Keep this tab open

### Step 2: Create .env File

Create a file named `.env` in your project root:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

Replace:
- `pk_test_YOUR_KEY_HERE` with your actual Stripe publishable key
- `YOUR_ANON_KEY_HERE` with your Supabase anon key

### Step 3: Add Stripe Secret Key to Supabase

1. Go to https://app.supabase.com
2. Select your project
3. Go to Edge Functions → Manage secrets
4. Click "Add secret"
5. Name: `STRIPE_SECRET_KEY`
6. Value: Your Stripe **secret** key (starts with `sk_test_`)
7. Click "Save"

### Step 4: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Test

1. Go to bookings page
2. Click "Payer Maintenant"
3. You should now see the Stripe payment form!

## Verify It's Working

### In Browser Console (F12):

You should see:
```
✅ Stripe Key: pk_test_...
✅ Creating payment for booking: ...
✅ Payment intent created successfully
```

You should NOT see:
```
❌ VITE_STRIPE_PUBLISHABLE_KEY is not set
❌ Failed to create payment
```

### On Payment Page:

You should see:
- ✅ "Complete Your Booking" title
- ✅ Booking details (service, amount)
- ✅ Stripe payment form with card input
- ✅ "Pay €15.00" button

## Test Payment

Use Stripe test card:
- **Card Number:** 4242 4242 4242 4242
- **Expiry:** 12/34 (any future date)
- **CVC:** 123 (any 3 digits)
- **ZIP:** 12345 (any 5 digits)

Click "Pay €15.00" and it should work!

## Still Not Working?

### Check 1: Environment Variables

Run in terminal:
```bash
# Windows PowerShell
Get-Content .env

# Mac/Linux
cat .env
```

Should show your keys (not empty).

### Check 2: Stripe Keys Are Correct

- Publishable key starts with `pk_test_` or `pk_live_`
- Secret key starts with `sk_test_` or `sk_live_`
- Both from the same Stripe account
- Keys are not expired or revoked

### Check 3: Edge Function Logs

```bash
supabase functions logs create-payment-with-connect --tail
```

Look for errors about missing keys or Stripe API errors.

### Check 4: Browser Console

Open DevTools (F12) → Console tab

Look for:
- Red errors about Stripe
- Warnings about missing keys
- Network errors (400, 401, 403)

## Common Mistakes

### ❌ Wrong: Key in quotes
```env
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### ✅ Correct: No quotes
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### ❌ Wrong: Spaces around =
```env
VITE_STRIPE_PUBLISHABLE_KEY = pk_test_...
```

### ✅ Correct: No spaces
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### ❌ Wrong: Using secret key in frontend
```env
VITE_STRIPE_PUBLISHABLE_KEY=sk_test_...
```

### ✅ Correct: Using publishable key
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## For Netlify Deployment

After local testing works:

1. Go to Netlify Dashboard
2. Site settings → Environment variables
3. Add:
   - `VITE_STRIPE_PUBLISHABLE_KEY` = Your publishable key
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your anon key
4. Trigger deploy → Clear cache and deploy

## Summary

The payment form needs:
1. ✅ `.env` file with `VITE_STRIPE_PUBLISHABLE_KEY`
2. ✅ Stripe secret key in Supabase Edge Functions
3. ✅ Dev server restarted after adding keys
4. ✅ CSP headers allowing Stripe (already done)

Once you add the Stripe keys, everything will work! 🎉

---

**Quick Commands:**

```bash
# Create .env file
echo VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY > .env

# Restart server
npm run dev

# Check if key is loaded
# Open browser console and run:
# console.log(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
```

**Need your keys?**
- Stripe: https://dashboard.stripe.com/test/apikeys
- Supabase: https://app.supabase.com → Settings → API
