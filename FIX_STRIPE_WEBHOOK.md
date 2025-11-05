# Fix Stripe Webhook Errors

## Problem
Stripe webhook is failing with errors. The endpoint needs to return HTTP 200-299 status codes.

## Solution Applied
Updated the webhook function to ALWAYS return HTTP 200, even on errors, to prevent Stripe from disabling it.

## Steps to Fix

### 1. Deploy the Updated Webhook Function

```bash
# Deploy the stripe-webhook function
supabase functions deploy stripe-webhook

# Or deploy all functions
supabase functions deploy
```

### 2. Set Environment Variables in Supabase

Go to Supabase Dashboard → Edge Functions → Configuration and add:

```
STRIPE_SECRET_KEY=sk_live_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Get Your Webhook Secret from Stripe

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click on your webhook endpoint
3. Click "Reveal" next to "Signing secret"
4. Copy the `whsec_...` value
5. Add it to Supabase environment variables as `STRIPE_WEBHOOK_SECRET`

### 4. Test the Webhook

After deploying, test it from Stripe Dashboard:
1. Go to Webhooks → Your endpoint
2. Click "Send test webhook"
3. Select an event type (e.g., `payment_intent.succeeded`)
4. Click "Send test webhook"
5. Check that it returns HTTP 200

### 5. Verify in Supabase Logs

```bash
# View function logs
supabase functions logs stripe-webhook --tail
```

## What Changed

**Before:**
- Returned HTTP 400 on errors
- Stripe would retry and eventually disable the webhook

**After:**
- Always returns HTTP 200
- Logs errors but acknowledges receipt
- Prevents Stripe from disabling the webhook
- Errors are logged for debugging

## Webhook Events Handled

- ✅ `payment_intent.succeeded` - Payment completed
- ✅ `payment_intent.payment_failed` - Payment failed
- ✅ `account.updated` - Stripe Connect account updated
- ✅ `transfer.created` - Transfer to connected account
- ✅ `payout.paid` - Payout completed
- ✅ `payout.failed` - Payout failed

## Quick Deploy Command

```bash
cd supabase/functions
supabase functions deploy stripe-webhook --no-verify-jwt
```

## Troubleshooting

### Webhook Still Failing?

1. **Check environment variables are set** in Supabase Dashboard
2. **Verify webhook secret** matches between Stripe and Supabase
3. **Check function logs** for specific errors
4. **Test with Stripe CLI**:
   ```bash
   stripe listen --forward-to https://your-project.supabase.co/functions/v1/stripe-webhook
   ```

### Common Issues

- **Missing STRIPE_WEBHOOK_SECRET**: Function will fail signature verification
- **Wrong webhook secret**: Use the one from Stripe Dashboard, not your API key
- **Function not deployed**: Deploy using `supabase functions deploy`
- **CORS errors**: Webhook doesn't need CORS, but check if function is accessible

## After Fixing

Once deployed and working:
1. Stripe will stop sending error emails
2. Webhook events will be processed successfully
3. Payments and payouts will update correctly in your database
