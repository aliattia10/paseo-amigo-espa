# Troubleshooting Guide

## Payment Errors

### Error: "Edge Function returned a non-2xx status code"

**Cause:** The payment function is failing to create a payment intent.

**Solutions:**

1. **Deploy the updated function:**
   ```bash
   supabase functions deploy create-payment-with-connect
   ```

2. **Check environment variables:**
   - Go to Supabase Dashboard → Settings → Edge Functions
   - Verify `STRIPE_SECRET_KEY` is set
   - Verify `SUPABASE_URL` is set
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is set

3. **Check Stripe key:**
   - Make sure you're using the correct Stripe key (test or live)
   - Verify the key starts with `sk_test_` or `sk_live_`
   - Check it's not expired or revoked

4. **Check function logs:**
   ```bash
   supabase functions logs create-payment-with-connect --tail
   ```

### Error: "No client secret returned"

**Cause:** The payment intent creation failed.

**Solutions:**

1. **Check Stripe account:**
   - Make sure your Stripe account is active
   - Verify you have payment methods enabled
   - Check for any account restrictions

2. **Check the amount:**
   - Make sure the booking has a valid `total_price`
   - Amount should be greater than 0
   - Amount should be in the correct format (decimal)

3. **Check booking data:**
   ```sql
   SELECT * FROM bookings WHERE id = 'YOUR_BOOKING_ID';
   ```

### Error: "Sitter has not set up payout method yet"

**Cause:** Old version of the function that requires payout method.

**Solution:** Deploy the updated function that makes payout check optional:
```bash
supabase functions deploy create-payment-with-connect
```

## Layout Issues

### Filter tabs are cut off

**Cause:** CSS overflow issue.

**Solution:** The fix has been applied. Make sure you have the latest version of `BookingsPage.tsx`.

### Buttons not aligned properly

**Cause:** Inconsistent spacing in the card layout.

**Solution:** The fix has been applied. Check that all action buttons use consistent classes:
- Use `w-full` for full-width buttons
- Use `flex gap-2` for side-by-side buttons
- Use `mb-3` for spacing between sections

### Dark mode colors wrong

**Cause:** Missing dark mode classes.

**Solution:** Make sure all text uses proper color classes:
- `text-text-primary-light dark:text-text-primary-dark`
- `text-text-secondary-light dark:text-text-secondary-dark`
- `bg-card-light dark:bg-card-dark`

## Navigation Issues

### Pay Now button doesn't work

**Cause:** Incorrect route or missing booking ID.

**Solutions:**

1. **Check the navigation:**
   ```typescript
   navigate(`/payment?bookingId=${booking.id}`)
   ```

2. **Verify booking ID exists:**
   ```typescript
   console.log('Booking ID:', booking.id);
   ```

3. **Check the route is registered:**
   - Open `src/App.tsx`
   - Verify `/payment` route exists

### Redirects to wrong page

**Cause:** Incorrect route configuration.

**Solution:** Check `App.tsx` for correct route paths:
```typescript
<Route path="/payment" element={<PaymentPage />} />
<Route path="/bookings" element={<BookingsPage />} />
```

## Database Issues

### Error: "Column does not exist"

**Cause:** Database migration not run yet.

**Solution:** Run the migration:
```bash
supabase db push
```

### Error: "Table does not exist"

**Cause:** Missing database tables.

**Solutions:**

1. **Check if tables exist:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. **Run migrations:**
   ```bash
   supabase db push
   ```

3. **Check migration files:**
   - Look in `supabase/migrations/`
   - Make sure all migration files are present

### Error: "RLS policy violation"

**Cause:** Row Level Security blocking access.

**Solutions:**

1. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'bookings';
   ```

2. **Verify user authentication:**
   - Make sure user is logged in
   - Check `currentUser` is not null
   - Verify JWT token is valid

## Stripe Issues

### Error: "Invalid API key"

**Cause:** Wrong or expired Stripe key.

**Solutions:**

1. **Get new API keys:**
   - Go to https://dashboard.stripe.com/apikeys
   - Copy the secret key (starts with `sk_test_` or `sk_live_`)
   - Copy the publishable key (starts with `pk_test_` or `pk_live_`)

2. **Update environment variables:**
   - Supabase: Add `STRIPE_SECRET_KEY`
   - `.env`: Add `VITE_STRIPE_PUBLISHABLE_KEY`

3. **Restart your app:**
   ```bash
   npm run dev
   ```

### Error: "Payment method not available"

**Cause:** Payment methods not enabled in Stripe.

**Solutions:**

1. **Enable payment methods:**
   - Go to Stripe Dashboard → Settings → Payment methods
   - Enable Card payments
   - Enable other methods if needed

2. **Check country restrictions:**
   - Make sure your country supports the payment methods
   - Verify currency is supported (EUR)

### Error: "Amount too small"

**Cause:** Stripe has minimum amounts for payments.

**Solution:** Make sure the booking amount is at least €0.50 (50 cents).

## TypeScript Errors

### Error: "Property does not exist"

**Cause:** TypeScript types not updated after migration.

**Solution:** Regenerate types:
```bash
supabase gen types typescript --project-id YOUR_PROJECT > src/integrations/supabase/types.ts
```

### Error: "Type instantiation is excessively deep"

**Cause:** Complex type inference.

**Solution:** Add explicit type annotations:
```typescript
const booking: Booking = { ... };
```

## Performance Issues

### Page loads slowly

**Solutions:**

1. **Check database queries:**
   - Add indexes to frequently queried columns
   - Optimize SELECT statements
   - Use pagination for large datasets

2. **Check network:**
   - Use browser DevTools → Network tab
   - Look for slow requests
   - Check for failed requests

3. **Check Edge Functions:**
   - Monitor function execution time
   - Check for timeout errors
   - Optimize function code

### Images load slowly

**Solutions:**

1. **Optimize images:**
   - Compress images before upload
   - Use appropriate image sizes
   - Consider using a CDN

2. **Use lazy loading:**
   ```typescript
   <img loading="lazy" src={imageUrl} />
   ```

## Deployment Issues

### Function deployment fails

**Solutions:**

1. **Check Supabase CLI:**
   ```bash
   supabase --version
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link to project:**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. **Deploy again:**
   ```bash
   supabase functions deploy create-payment-with-connect
   ```

### Migration fails

**Solutions:**

1. **Check SQL syntax:**
   - Review migration file for errors
   - Test SQL in Supabase SQL Editor

2. **Check for conflicts:**
   - Make sure tables don't already exist
   - Check for duplicate column names

3. **Run migrations one by one:**
   ```bash
   supabase db push --dry-run
   ```

## Getting Help

### Check Logs

**Supabase Logs:**
```bash
supabase functions logs create-payment-with-connect --tail
```

**Browser Console:**
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

**Database Logs:**
- Go to Supabase Dashboard → Logs
- Filter by table or function
- Look for error messages

### Debug Mode

Enable debug mode in your app:
```typescript
// Add to your component
useEffect(() => {
  console.log('Booking:', booking);
  console.log('User:', currentUser);
  console.log('Payment status:', booking?.payment_status);
}, [booking, currentUser]);
```

### Test in Isolation

Test each part separately:

1. **Test database query:**
   ```sql
   SELECT * FROM bookings WHERE id = 'YOUR_ID';
   ```

2. **Test Edge Function:**
   ```bash
   curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/create-payment-with-connect \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"bookingId":"YOUR_ID","amount":15.00}'
   ```

3. **Test Stripe:**
   - Use Stripe test cards
   - Check Stripe Dashboard → Logs

### Still Stuck?

1. Read the documentation files:
   - `QUICK_FIX_PAYMENT_ERROR.md`
   - `FIXES_APPLIED_SUMMARY.md`
   - `PAYOUT_SYSTEM_README.md`

2. Check the code comments in:
   - `src/pages/PaymentPage.tsx`
   - `src/pages/BookingsPage.tsx`
   - `supabase/functions/create-payment-with-connect/index.ts`

3. Review the deployment checklist:
   - `DEPLOYMENT_CHECKLIST.md`

---

**Remember:** Most issues are caused by:
1. Missing environment variables
2. Not deploying updated functions
3. Not running database migrations
4. Incorrect Stripe configuration

Check these first before diving deeper!
