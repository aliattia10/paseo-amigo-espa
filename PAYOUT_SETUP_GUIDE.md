# Payout System Setup Guide

## Quick Start

Follow these steps to set up the simplified payout system:

### 1. Run Database Migration

Apply the database migration to add the necessary tables and columns:

```bash
# If using Supabase CLI
supabase db push

# Or run the SQL directly in Supabase Dashboard
# Go to SQL Editor and run: supabase/migrations/20241106_add_payout_system.sql
```

### 2. Deploy Edge Functions

Deploy the updated Supabase Edge Functions:

```bash
# Deploy all functions
supabase functions deploy create-payment-with-connect
supabase functions deploy capture-payment
supabase functions deploy process-sitter-payout

# Or deploy individually
supabase functions deploy create-payment-with-connect
```

### 3. Configure Environment Variables

Make sure these environment variables are set in your Supabase project:

```
STRIPE_SECRET_KEY=sk_test_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Test the System

#### As a Sitter:
1. Navigate to Profile → Payment Methods
2. Add PayPal email or bank details
3. Complete a booking
4. Request a payout when balance is available

#### As Admin:
1. Navigate to `/admin/payouts`
2. View pending payout requests
3. Process payments manually via PayPal or bank transfer
4. Mark requests as processed

### 5. Update Frontend Routes

The following routes are now available:

- `/payout-methods` - Sitters manage payout methods
- `/admin/payouts` - Admin processes payout requests

Old routes removed:
- `/payout-setup` - No longer needed (Stripe Connect)

## Testing Checklist

- [ ] Sitter can add PayPal email
- [ ] Sitter can add bank details (IBAN)
- [ ] Sitter can view available balance
- [ ] Sitter can request payout
- [ ] Pet owner can make payment via Stripe
- [ ] Payment is held until service completion
- [ ] Admin can view payout requests
- [ ] Admin can mark payouts as processed
- [ ] Balance updates correctly after payout

## Common Issues

### "payout_requests table does not exist"
**Solution**: Run the database migration

### "Column 'payout_method' does not exist"
**Solution**: Run the database migration to add columns to users table

### "Cannot access /admin/payouts"
**Solution**: Make sure you're logged in and the route is added to App.tsx

### Payout request not showing
**Solution**: Check that:
- Booking status is 'completed'
- Payment status is 'held'
- Sitter has added payout method

## Manual Payout Process

### For PayPal Payouts:

1. Log into your PayPal business account
2. Go to "Send & Request" → "Send money"
3. Enter the sitter's PayPal email
4. Enter the payout amount
5. Add note: "Payout for booking services"
6. Send payment
7. Mark as processed in admin panel

### For Bank Transfers (SEPA):

1. Log into your business bank account
2. Create new SEPA transfer
3. Enter sitter's IBAN and name
4. Enter the payout amount
5. Add reference: "Payout - [Sitter Name]"
6. Submit transfer
7. Mark as processed in admin panel

## Automation Options

### Option 1: PayPal Payouts API

Integrate PayPal Payouts API for automatic transfers:

```typescript
// Example implementation
const paypal = require('@paypal/payouts-sdk');

async function processPayPalPayout(email: string, amount: number) {
  const request = new paypal.payouts.PayoutsPostRequest();
  request.requestBody({
    sender_batch_header: {
      email_subject: "You have a payout!",
      email_message: "You have received a payout from Paseo!"
    },
    items: [{
      recipient_type: "EMAIL",
      amount: {
        value: amount.toString(),
        currency: "EUR"
      },
      receiver: email
    }]
  });
  
  const response = await client.execute(request);
  return response;
}
```

### Option 2: Stripe Transfers

Use Stripe Transfers API for bank payouts:

```typescript
// Example implementation
const transfer = await stripe.transfers.create({
  amount: Math.round(amount * 100),
  currency: 'eur',
  destination: 'bank_account_id',
  description: 'Payout for services'
});
```

## Security Best Practices

1. **Admin Access**: Implement proper admin authentication
2. **Rate Limiting**: Limit payout requests per sitter
3. **Fraud Detection**: Monitor unusual payout patterns
4. **Encryption**: Ensure all payout data is encrypted
5. **Audit Logs**: Keep logs of all payout transactions
6. **Two-Factor Auth**: Require 2FA for admin payout processing

## Monitoring

Track these metrics:

- Total pending payouts
- Average payout processing time
- Failed payout attempts
- Total payouts per month
- Platform revenue (commission fees)

## Support

For technical support:
- Check the PAYOUT_SYSTEM_README.md for detailed documentation
- Review Supabase logs for errors
- Test in development environment first

---

**Ready to go!** Your simplified payout system is now set up and ready to use.
