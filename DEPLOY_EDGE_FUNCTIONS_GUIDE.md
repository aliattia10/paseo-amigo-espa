# Complete Guide: Deploy Supabase Edge Functions & Fix 404 Errors

## The Problem
You're getting a 404 error: `POST https://zxbfygofxxmfivddwdqt.supabase.co/functions/v1/create-payment-wit... 404 (Not Found)`

This means the Edge Function is **not deployed** to Supabase servers.

## Solution: Deploy Your Edge Functions

### Step 1: Install Supabase CLI (if not already installed)

```bash
# Windows (PowerShell)
scoop install supabase

# Or using npm
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser window for authentication.

### Step 3: Link Your Project

```bash
supabase link --project-ref zxbfygofxxmfivddwdqt
```

You'll be prompted to enter your database password.

### Step 4: Set Environment Secrets

Your Edge Functions need these secrets to work:

```bash
# Set Stripe Secret Key
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Verify secrets are set
supabase secrets list
```

### Step 5: Deploy All Edge Functions

```bash
# Deploy all functions at once
supabase functions deploy

# Or deploy specific function
supabase functions deploy create-payment-with-connect
```

### Step 6: Verify Deployment

```bash
# List all deployed functions
supabase functions list
```

You should see output like:
```
┌─────────────────────────────────┬─────────┬─────────────────────┐
│ NAME                            │ VERSION │ CREATED AT          │
├─────────────────────────────────┼─────────┼─────────────────────┤
│ create-payment-with-connect     │ 1       │ 2024-01-15 10:30:00 │
│ capture-payment                 │ 1       │ 2024-01-15 10:30:00 │
│ refund-payment                  │ 1       │ 2024-01-15 10:30:00 │
└─────────────────────────────────┴─────────┴─────────────────────┘
```

## Complete Deployment Commands (Copy & Paste)

```bash
# 1. Login
supabase login

# 2. Link project
supabase link --project-ref zxbfygofxxmfivddwdqt

# 3. Set secrets (replace with your actual keys)
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here
supabase secrets set SUPABASE_URL=https://zxbfygofxxmfivddwdqt.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# 4. Deploy all functions
supabase functions deploy

# 5. Verify
supabase functions list
```

## Your Current File Structure (Correct ✅)

```
supabase/
└── functions/
    ├── create-payment-with-connect/
    │   └── index.ts
    ├── capture-payment/
    │   └── index.ts
    ├── refund-payment/
    │   └── index.ts
    ├── create-connect-account/
    │   └── index.ts
    ├── create-onboarding-link/
    │   └── index.ts
    └── stripe-webhook/
        └── index.ts
```

## Frontend Code (Already Correct ✅)

Your PaymentPage.tsx is calling it correctly:

```typescript
const { data, error } = await supabase.functions.invoke('create-payment-with-connect', {
  body: {
    bookingId: bookingData.id,
    amount: amount,
  },
});
```

The function name matches the folder name: ✅ `create-payment-with-connect`

## Troubleshooting

### Issue: "Function not found" after deployment
**Solution:** Wait 30-60 seconds after deployment for functions to become available.

### Issue: "Unauthorized" error
**Solution:** Make sure you're passing the auth token:
```typescript
const { data: { session } } = await supabase.auth.getSession();
// The supabase client automatically includes the token
```

### Issue: "Sitter has not completed payout setup"
**Solution:** This is expected! The sitter needs to complete Stripe Connect onboarding first.

### Issue: Environment variables not working
**Solution:** 
```bash
# List current secrets
supabase secrets list

# Set missing secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```

## Testing After Deployment

1. Open your app in the browser
2. Try to make a payment
3. Check the Network tab - you should see:
   - Status: 200 (or 400 with a clear error message)
   - NOT 404

## Quick Deploy Script

Save this as `deploy-functions.sh`:

```bash
#!/bin/bash
echo "🚀 Deploying Supabase Edge Functions..."

# Deploy all functions
supabase functions deploy

echo "✅ Deployment complete!"
echo "📋 Listing deployed functions:"
supabase functions list
```

Run with:
```bash
bash deploy-functions.sh
```

## Next Steps After Deployment

1. ✅ Run the database migration: `database/add_stripe_fields_to_bookings.sql`
2. ✅ Test the payment flow
3. ✅ Set up Stripe webhooks (see STRIPE_DEPLOYMENT_FINAL.md)

## Important Notes

- Edge Functions are deployed to Supabase's global edge network
- Changes require redeployment (not automatic like database changes)
- Secrets are encrypted and only available to your functions
- Each deployment creates a new version (you can rollback if needed)

## Common Deployment Errors

### Error: "Project not linked"
```bash
supabase link --project-ref zxbfygofxxmfivddwdqt
```

### Error: "Not logged in"
```bash
supabase login
```

### Error: "Invalid project reference"
Check your project URL: `https://zxbfygofxxmfivddwdqt.supabase.co`
The project ref is: `zxbfygofxxmfivddwdqt`

## Success Indicators

After successful deployment, you should see:
- ✅ No 404 errors in console
- ✅ Functions appear in `supabase functions list`
- ✅ Functions visible in Supabase Dashboard > Edge Functions
- ✅ Clear error messages (not 404) if something goes wrong

---

**TL;DR:** Run these commands:
```bash
supabase login
supabase link --project-ref zxbfygofxxmfivddwdqt
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key
supabase functions deploy
```
