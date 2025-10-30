# 🚀 Stripe Connect Deployment Guide

## Quick Deployment Steps

### 1. Run Database Migration

Go to Supabase SQL Editor and run:
```bash
database/setup_stripe_connect.sql
```

This will:
- ✅ Remove insecure bank account storage
- ✅ Create secure Stripe Connect tables
- ✅ Set up RLS policies
- ✅ Add payment tracking columns

### 2. Deploy Supabase Edge Functions

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

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

### 3. Set Supabase Secrets

```bash
# Set your Stripe keys
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# Verify secrets are set
supabase secrets list
```

### 4. Configure Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
   - `transfer.created`
   - `payout.paid`
   - `payout.failed`
5. Copy the webhook signing secret
6. Update your secret: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`

### 5. Test the Integration

#### Test Sitter Onboarding:
1. Create a sitter account
2. Go to `/payout-setup`
3. Click "Comenzar configuración"
4. Complete Stripe onboarding (use test data)
5. Verify account shows as "verified" in database

#### Test Payment Flow:
1. Create a booking
2. Make payment with test card: `4242 4242 4242 4242`
3. Check payment status in database
4. Verify funds transferred to Connect account

### 6. Go Live

When ready for production:

```bash
# Switch to live keys
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_live_...
```

Update webhook URL to use live mode in Stripe dashboard.

---

## Environment Variables Needed

### Supabase Secrets (set via CLI):
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
- `SUPABASE_URL` - Auto-provided
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided

### Frontend (.env):
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key

---

## Security Checklist

- [x] No bank account details stored in database
- [x] All sensitive data handled by Stripe
- [x] RLS policies enabled on all tables
- [x] Webhook signature verification
- [x] User authentication required for all endpoints
- [x] CORS headers configured
- [x] Input validation on all functions

---

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Edge functions deploy without errors
- [ ] Secrets are set correctly
- [ ] Webhook receives events from Stripe
- [ ] Sitter can complete onboarding
- [ ] Payment intent creates successfully
- [ ] Funds transfer to Connect account
- [ ] Payment status updates in database
- [ ] Booking status updates after payment

---

## Troubleshooting

### Function deployment fails:
```bash
# Check function logs
supabase functions logs create-connect-account

# Test locally
supabase functions serve create-connect-account
```

### Webhook not receiving events:
1. Check webhook URL is correct
2. Verify webhook secret matches
3. Check Stripe dashboard for delivery attempts
4. View function logs: `supabase functions logs stripe-webhook`

### Onboarding link doesn't work:
1. Check CORS headers in function
2. Verify origin is passed correctly
3. Check account exists in database
4. View function logs for errors

### Payment fails:
1. Verify sitter has completed onboarding
2. Check Connect account is verified
3. Verify payment amount is valid
4. Check Stripe dashboard for error details

---

## Monitoring

### Check Connect Account Status:
```sql
SELECT 
  u.email,
  sca.payouts_enabled,
  sca.charges_enabled,
  sca.verification_status,
  sca.onboarding_completed
FROM stripe_connect_accounts sca
JOIN users u ON u.id = sca.user_id;
```

### Check Payment Status:
```sql
SELECT 
  p.id,
  p.amount,
  p.status,
  p.platform_fee,
  p.sitter_payout,
  p.created_at,
  p.paid_at
FROM payments p
ORDER BY p.created_at DESC
LIMIT 10;
```

### Check Recent Transfers:
```sql
SELECT 
  p.id,
  p.amount,
  p.stripe_transfer_id,
  u.email as sitter_email
FROM payments p
JOIN users u ON u.id = p.receiver_id
WHERE p.stripe_transfer_id IS NOT NULL
ORDER BY p.paid_at DESC;
```

---

## Support

If you encounter issues:
1. Check Supabase function logs
2. Check Stripe dashboard for errors
3. Review webhook delivery attempts
4. Check database for data consistency

---

✅ Your platform is now secure and PCI compliant!
