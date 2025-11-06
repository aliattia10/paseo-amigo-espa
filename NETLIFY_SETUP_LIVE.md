# Netlify Environment Variables Setup - LIVE MODE

## ⚠️ IMPORTANT: You're Using LIVE Stripe Keys!

Your key starts with `pk_live_` which means **REAL MONEY** will be charged!

### Before Going Live:

- ✅ Make sure you've tested everything with test keys first
- ✅ Verify your Stripe account is fully activated
- ✅ Understand that real payments will be processed
- ✅ Have a plan for handling real customer payments

## Step-by-Step: Add Environment Variables to Netlify

### 1. Go to Netlify Dashboard

Open: https://app.netlify.com

### 2. Select Your Site

Click on your site (probably "paseo-amigo-espa" or similar)

### 3. Go to Site Settings

Click the "Site settings" button

### 4. Navigate to Environment Variables

- In the left sidebar, click **"Environment variables"**
- Or go directly to: Site settings → Build & deploy → Environment

### 5. Add Variables

Click **"Add a variable"** button and add these **one by one**:

#### Variable 1: Stripe Publishable Key (LIVE)
```
Key: VITE_STRIPE_PUBLISHABLE_KEY
Value: pk_live_51Mv1dLAKjpyONsXTbR8MsgLOOLSZ4U7k90REOMy6EFvCeuoev38eDYzTVcdBDhIViIxeeeZXpWm2vbBSSvMORPJ9006LEAW6v8
Scopes: All scopes (or select specific deploy contexts)
```

#### Variable 2: Supabase URL
```
Key: VITE_SUPABASE_URL
Value: https://your-project-id.supabase.co
Scopes: All scopes
```

#### Variable 3: Supabase Anon Key
```
Key: VITE_SUPABASE_ANON_KEY
Value: your_actual_supabase_anon_key_here
Scopes: All scopes
```

### 6. Save Variables

Click "Save" or "Create variable" for each one.

### 7. Add Stripe Secret Key to Supabase

**IMPORTANT:** You also need to add the Stripe **SECRET** key to Supabase Edge Functions!

1. Go to: https://app.supabase.com (select your project)
2. Click **Edge Functions** in the left sidebar
3. Click **"Manage secrets"** button
4. Add a new secret:
   ```
   Name: STRIPE_SECRET_KEY
   Value: sk_live_YOUR_SECRET_KEY_HERE
   ```
   (Get this from https://dashboard.stripe.com/apikeys)
5. Click "Save"

### 8. Trigger New Deploy

Back in Netlify:

1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** button
3. Select **"Clear cache and deploy site"**
4. Wait for deployment to complete (2-3 minutes)

### 9. Verify Deployment

Once deployed, check the deploy log:

- Look for: ✅ "Site is live"
- Check for any build errors
- Verify environment variables were loaded

## Test Your Live Site

### 1. Visit Your Site

Go to your live URL (e.g., https://paseo-amigo-espa.netlify.app)

### 2. Test Payment Flow

⚠️ **WARNING: This will charge REAL money!**

1. Login as owner
2. Go to bookings page
3. Click "Payer Maintenant"
4. You should see Stripe payment form
5. **DO NOT use real card yet!**

### 3. Use Stripe Test Cards (Even in Live Mode)

You can still test with these cards in live mode (they won't charge):

```
Card: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

This will simulate a successful payment without charging.

## Important: Live Mode Checklist

Before accepting real payments:

- [ ] Stripe account is fully activated (not in test mode)
- [ ] Business information completed in Stripe
- [ ] Bank account connected to Stripe for payouts
- [ ] Terms of service and privacy policy on your site
- [ ] Customer support email/contact set up
- [ ] Refund policy defined
- [ ] Test the full payment flow
- [ ] Test the payout system
- [ ] Verify email notifications work
- [ ] Check booking confirmation flow
- [ ] Test cancellation and refunds

## Switching Between Test and Live

### For Testing (Recommended First):

Use test keys:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### For Production (Live):

Use live keys:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

## Monitoring Live Payments

### Stripe Dashboard:

- Go to: https://dashboard.stripe.com
- Switch to "Live mode" (toggle in top right)
- Monitor:
  - Payments
  - Customers
  - Disputes
  - Refunds

### Supabase Dashboard:

- Go to: https://app.supabase.com
- Check:
  - Bookings table
  - Payments table
  - Edge Function logs

## Troubleshooting

### "Payment failed" in live mode

1. Check Stripe dashboard for error details
2. Verify secret key is set in Supabase
3. Check Edge Function logs
4. Ensure Stripe account is activated

### Environment variables not working

1. Make sure you clicked "Save" for each variable
2. Trigger a new deploy (clear cache)
3. Check deploy logs for errors
4. Verify variable names are exact (case-sensitive)

### Still seeing test mode

1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check that live keys are actually set
4. Verify you're on the production URL

## Security Notes

### ⚠️ Never Commit Live Keys to Git!

- Live keys should ONLY be in:
  - Netlify environment variables
  - Supabase Edge Function secrets
  - Your local `.env` file (which is in .gitignore)

### ✅ Keys Are Safe When:

- In Netlify dashboard (encrypted)
- In Supabase secrets (encrypted)
- In `.env` file (not committed to git)

### ❌ Keys Are NOT Safe When:

- Committed to git
- Shared in chat/email
- Posted in public forums
- Hardcoded in source files

## Support

If you need help:

1. Check Stripe dashboard for payment errors
2. Check Supabase Edge Function logs
3. Check Netlify deploy logs
4. Check browser console for errors

---

**Current Status:**

- ✅ Code pushed to GitHub
- ⏳ Waiting for you to add environment variables to Netlify
- ⏳ Waiting for Stripe secret key in Supabase
- ⏳ Waiting for new deploy

**Next Steps:**

1. Add the 3 environment variables to Netlify (see Step 5 above)
2. Add Stripe secret key to Supabase (see Step 7 above)
3. Trigger new deploy
4. Test the live site!

Good luck! 🚀
