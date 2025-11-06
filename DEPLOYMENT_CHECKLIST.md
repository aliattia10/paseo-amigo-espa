# Simplified Payout System - Deployment Checklist

## Pre-Deployment

### 1. Database Setup
- [ ] Review migration file: `supabase/migrations/20241106_add_payout_system.sql`
- [ ] Backup existing database
- [ ] Run migration in development environment first
- [ ] Verify all tables and columns created successfully
- [ ] Test RLS policies work correctly

### 2. Code Review
- [ ] Review all modified files
- [ ] Check translation keys in all languages (EN, FR, ES)
- [ ] Verify no TypeScript errors
- [ ] Test all new components render correctly
- [ ] Ensure old Stripe Connect code is removed/deprecated

### 3. Environment Variables
- [ ] `STRIPE_SECRET_KEY` is set
- [ ] `SUPABASE_URL` is set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] All Edge Functions have access to these variables

### 4. Testing

#### Sitter Flow:
- [ ] Sitter can navigate to Payment Methods page
- [ ] Sitter can add PayPal email
- [ ] Sitter can add bank details (IBAN)
- [ ] Sitter can switch between PayPal and bank
- [ ] Sitter can save payout method
- [ ] Sitter sees available balance correctly
- [ ] Sitter can request payout
- [ ] Payout request appears in pending list
- [ ] Sitter cannot request payout without method
- [ ] Sitter cannot request payout with zero balance

#### Pet Owner Flow:
- [ ] Pet owner can book service
- [ ] Payment page loads correctly
- [ ] Stripe payment form appears
- [ ] Payment processes successfully
- [ ] Booking status updates to confirmed
- [ ] Payment status is set to 'held'

#### Admin Flow:
- [ ] Admin can access `/admin/payouts`
- [ ] Pending payout requests display correctly
- [ ] Payout details show correctly (PayPal/Bank)
- [ ] Admin can mark payout as processed
- [ ] Status updates to 'completed'
- [ ] Payout disappears from pending list

#### Edge Cases:
- [ ] Sitter with no bookings sees $0 balance
- [ ] Sitter cannot request payout twice
- [ ] Payment fails gracefully with error message
- [ ] Invalid IBAN shows validation error
- [ ] Invalid email shows validation error

## Deployment Steps

### 1. Deploy Database Changes
```bash
# Connect to production
supabase link --project-ref your-project-ref

# Push migration
supabase db push

# Verify migration
supabase db diff
```

### 2. Deploy Edge Functions
```bash
# Deploy all updated functions
supabase functions deploy create-payment-with-connect
supabase functions deploy capture-payment
supabase functions deploy process-sitter-payout

# Verify deployment
supabase functions list
```

### 3. Deploy Frontend
```bash
# Build production
npm run build

# Deploy to your hosting (Vercel, Netlify, etc.)
# Example for Vercel:
vercel --prod
```

### 4. Verify Deployment
- [ ] Visit production site
- [ ] Check all routes load correctly
- [ ] Test payment flow end-to-end
- [ ] Verify Edge Functions are responding
- [ ] Check Supabase logs for errors

## Post-Deployment

### 1. Monitor
- [ ] Watch Supabase logs for errors
- [ ] Monitor Stripe dashboard for payments
- [ ] Check for user-reported issues
- [ ] Track payout request volume

### 2. Communication
- [ ] Send email to all sitters about new system
- [ ] Update help documentation
- [ ] Create FAQ for common questions
- [ ] Train support team on new process

### 3. Admin Setup
- [ ] Set up admin access controls
- [ ] Create admin user accounts
- [ ] Document payout processing procedure
- [ ] Set up payout processing schedule (e.g., weekly)

## Email Template for Sitters

```
Subject: New Simplified Payout System 🎉

Hi [Sitter Name],

We've made it easier to receive your earnings!

What's New:
✅ No more complex Stripe onboarding
✅ Just add your PayPal or bank details
✅ Request payouts anytime
✅ Receive payments within 2-5 business days

Action Required:
1. Go to Profile → Payment Methods
2. Add your PayPal email OR bank details
3. That's it! You're ready to receive payouts

Questions? Reply to this email or contact support.

Happy walking!
The [Your App Name] Team
```

## Rollback Plan

If issues arise:

### Quick Rollback:
1. Revert frontend deployment
2. Keep database changes (they're backward compatible)
3. Restore old Edge Functions
4. Notify users of temporary issue

### Full Rollback:
1. Restore previous frontend version
2. Restore previous Edge Functions
3. Run rollback migration (if needed)
4. Notify users system is restored

## Success Criteria

After 1 week, verify:
- [ ] At least 50% of sitters added payout method
- [ ] All payout requests processed within 5 days
- [ ] No critical bugs reported
- [ ] Payment success rate > 95%
- [ ] Sitter satisfaction maintained or improved

## Support Resources

- **Documentation**: PAYOUT_SYSTEM_README.md
- **Setup Guide**: PAYOUT_SETUP_GUIDE.md
- **Migration Summary**: PAYOUT_MIGRATION_SUMMARY.md
- **Admin Panel**: `/admin/payouts`
- **Supabase Dashboard**: https://app.supabase.com
- **Stripe Dashboard**: https://dashboard.stripe.com

## Emergency Contacts

- **Technical Lead**: [Name/Email]
- **Database Admin**: [Name/Email]
- **Support Team**: [Email]
- **Stripe Support**: https://support.stripe.com

---

## Final Checklist

Before going live:
- [ ] All tests passing
- [ ] Database migration successful
- [ ] Edge Functions deployed
- [ ] Frontend deployed
- [ ] Monitoring in place
- [ ] Team trained
- [ ] Users notified
- [ ] Rollback plan ready

**Ready to deploy!** 🚀

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Verified By**: _______________
