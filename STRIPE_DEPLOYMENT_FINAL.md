# Stripe Connect - Final Deployment Steps

## Overview
Your Stripe Connect payment system is ready. Sitters will receive automatic payouts to their bank accounts after completing onboarding.

## Step 1: Set Stripe API Keys in Supabase

1. Go to your Stripe Dashboard (https://dashboard.stripe.com)
2. Get your API keys:
   - **Test Mode**: Use for testing
   - **Live Mode**: Use for production
3. Copy these keys:
   - `STRIPE_SECRET_KEY` (starts with `sk_test_` or `sk_live_`)
   - `STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_` or `pk_live_`)

4. Go to Supabase Dashboard → Settings → Edge Functions → Secrets
5. Add these secrets:
   ```
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
   ```

## Step 2: Deploy Edge Functions to Supabase

Run these commands from your project root:

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy all functions
supabase functions deploy create-connect-account
supabase functions deploy create-onboarding-link
supabase functions deploy create-payment-with-connect
supabase functions deploy stripe-webhook
```

After deployment, note the function URLs (format: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/FUNCTION_NAME`)

## Step 3: Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
   ```
4. Select these events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.succeeded`
   - `transfer.created`
   - `payout.paid`
   - `account.updated`

5. Copy the "Signing secret" (starts with `whsec_`)
6. Add it to Supabase secrets:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

## Step 4: Run Database Migration

Execute the payments table SQL in Supabase SQL Editor:

```bash
# In Supabase Dashboard → SQL Editor
# Run: database/create_payments_table.sql
```

## Step 5: Test the Flow (Test Mode)

### Test Sitter Onboarding:
1. Create a sitter account in your app
2. Go to payout setup page
3. Click "Connect with Stripe"
4. Use Stripe test data:
   - Phone: Any valid format
   - Verification code: `000000`
   - Bank: Use test IBAN `ES9121000418450200051332`

### Test Payment:
1. Create an owner account
2. Book a sitter
3. Use test card: `4242 4242 4242 4242`
4. Expiry: Any future date
5. CVC: Any 3 digits
6. Check payment appears in Stripe Dashboard → Payments

### Verify Transfer:
1. Check Stripe Dashboard → Connect → Transfers
2. Verify the sitter's Connect account received the transfer
3. Check your database `payments` table for the record

## Step 6: Go Live

1. Switch Stripe to Live Mode
2. Update Supabase secrets with live keys:
   ```
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
   ```
3. Update webhook endpoint to use live mode
4. Test with real bank account (small amount first)

## How Payouts Work

### For Sitters:
1. Complete one-time Stripe onboarding (bank details + ID verification)
2. Accept bookings
3. Money automatically transfers to their bank account
4. Payout schedule: Set in Stripe Dashboard (daily/weekly/monthly)

### Payment Breakdown Example:
- Booking: €50
- Platform fee (15%): €7.50
- Stripe fee (~2.9% + €0.25): ~€1.70
- **Sitter receives: ~€40.80**

### Timeline:
- Payment captured: Immediate
- Transfer to sitter's Stripe balance: Immediate
- Payout to bank account: Based on your schedule (default: 2 days)

## Troubleshooting

### Sitter can't complete onboarding:
- Check `stripe_connect_accounts` table for error messages
- Verify sitter is using correct country (Spain)
- Check Stripe Dashboard → Connect → Accounts for details

### Payment fails:
- Check `payments` table for status
- Review Stripe Dashboard → Payments → Logs
- Verify webhook is receiving events

### Transfer not created:
- Ensure sitter's Connect account has `charges_enabled=true`
- Check platform fee calculation is correct
- Review Edge Function logs in Supabase

## Support

- Stripe Connect Docs: https://stripe.com/docs/connect
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Test Cards: https://stripe.com/docs/testing
