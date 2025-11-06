# Environment Variables Setup

## Required Environment Variables

Your app needs these environment variables to work properly:

### 1. Supabase Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy "Project URL" → Use as `VITE_SUPABASE_URL`
5. Copy "anon public" key → Use as `VITE_SUPABASE_ANON_KEY`

### 2. Stripe Variables

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

**Where to find this:**
1. Go to https://dashboard.stripe.com
2. Go to Developers → API keys
3. Copy "Publishable key" (starts with `pk_test_` for test mode)
4. Use as `VITE_STRIPE_PUBLISHABLE_KEY`

**Important:** 
- Use `pk_test_` keys for development/testing
- Use `pk_live_` keys for production (only after testing!)

### 3. Stripe Secret Key (Supabase Edge Functions)

This goes in Supabase, not in your .env file:

```
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

**Where to set this:**
1. Go to https://app.supabase.com
2. Select your project
3. Go to Edge Functions → Manage secrets
4. Add secret: `STRIPE_SECRET_KEY`
5. Value: Your Stripe secret key (starts with `sk_test_`)

**Where to find the key:**
1. Go to https://dashboard.stripe.com
2. Go to Developers → API keys
3. Copy "Secret key" (starts with `sk_test_`)

## Setup Instructions

### For Local Development:

1. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env file:**
   ```bash
   # On Windows
   notepad .env
   
   # On Mac/Linux
   nano .env
   ```

3. **Add your keys:**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   ```

4. **Restart your dev server:**
   ```bash
   npm run dev
   ```

### For Netlify Deployment:

1. **Go to Netlify Dashboard:**
   - https://app.netlify.com
   - Select your site

2. **Add Environment Variables:**
   - Go to Site settings → Environment variables
   - Click "Add a variable"
   - Add each variable:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_STRIPE_PUBLISHABLE_KEY`

3. **Redeploy:**
   - Go to Deploys
   - Click "Trigger deploy" → "Clear cache and deploy site"

### For Supabase Edge Functions:

1. **Go to Supabase Dashboard:**
   - https://app.supabase.com
   - Select your project

2. **Add Edge Function Secrets:**
   - Go to Edge Functions
   - Click "Manage secrets"
   - Add:
     - `STRIPE_SECRET_KEY` = Your Stripe secret key
     - `SUPABASE_URL` = Your Supabase URL
     - `SUPABASE_SERVICE_ROLE_KEY` = Your service role key

3. **Redeploy functions:**
   ```bash
   supabase functions deploy create-payment-with-connect
   ```

## Verify Setup

### Check Local Environment:

```bash
# On Windows PowerShell
$env:VITE_STRIPE_PUBLISHABLE_KEY

# On Mac/Linux
echo $VITE_STRIPE_PUBLISHABLE_KEY
```

### Check in Browser Console:

```javascript
// Open browser console (F12) and run:
console.log('Stripe Key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
```

### Check Netlify:

1. Go to Site settings → Environment variables
2. Verify all variables are listed
3. Values should show as "Hidden" (for security)

### Check Supabase:

1. Go to Edge Functions → Manage secrets
2. Verify `STRIPE_SECRET_KEY` is listed
3. Value should show as "Hidden"

## Common Issues

### "Stripe key is not set"

**Problem:** `VITE_STRIPE_PUBLISHABLE_KEY` is missing

**Solution:**
1. Create `.env` file in project root
2. Add: `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`
3. Restart dev server: `npm run dev`

### "Failed to create payment"

**Problem:** Stripe secret key not set in Supabase

**Solution:**
1. Go to Supabase → Edge Functions → Manage secrets
2. Add `STRIPE_SECRET_KEY` with your secret key
3. Redeploy function: `supabase functions deploy create-payment-with-connect`

### "Payment form doesn't appear"

**Problem:** Stripe publishable key is wrong or missing

**Solution:**
1. Check browser console for errors
2. Verify key starts with `pk_test_` or `pk_live_`
3. Make sure key is from the correct Stripe account
4. Restart dev server after adding key

### "Environment variables not working on Netlify"

**Problem:** Variables not set or not deployed

**Solution:**
1. Add variables in Netlify dashboard
2. Clear cache and redeploy
3. Check deploy logs for errors
4. Verify variable names match exactly (case-sensitive!)

## Security Notes

### ⚠️ Never Commit These Files:

- `.env` - Contains your actual keys
- `.env.local` - Local overrides
- `.env.production` - Production keys

### ✅ Safe to Commit:

- `.env.example` - Template without real keys
- `.gitignore` - Should include `.env*`

### 🔒 Key Security:

**Publishable Keys (pk_):**
- ✅ Safe to expose in frontend code
- ✅ Can be in browser
- ✅ Limited permissions

**Secret Keys (sk_):**
- ❌ NEVER expose in frontend
- ❌ NEVER commit to git
- ✅ Only in backend/Edge Functions
- ✅ Full permissions

## Test Your Setup

### 1. Check Environment Variables:

```bash
npm run dev
```

Open browser console and check for:
```
✅ Stripe Key: pk_test_...
✅ Supabase URL: https://...supabase.co
```

### 2. Test Payment Flow:

1. Go to bookings page
2. Click "Payer Maintenant"
3. Should see:
   - ✅ Payment page loads
   - ✅ Stripe form appears
   - ✅ No console errors

### 3. Test Payment:

Use Stripe test card:
- **Card:** 4242 4242 4242 4242
- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **ZIP:** Any 5 digits

Should see:
- ✅ Payment processes
- ✅ Booking status updates
- ✅ Success message

## Getting Help

If you're still having issues:

1. **Check browser console** for specific errors
2. **Check Supabase logs** for Edge Function errors
3. **Check Stripe dashboard** for payment attempts
4. **Verify all keys** are correct and active

---

**Quick Checklist:**

- [ ] Created `.env` file
- [ ] Added `VITE_SUPABASE_URL`
- [ ] Added `VITE_SUPABASE_ANON_KEY`
- [ ] Added `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] Added `STRIPE_SECRET_KEY` to Supabase
- [ ] Restarted dev server
- [ ] Tested payment flow
- [ ] Payment form appears
- [ ] Test payment works

Once all checked, your payment system is ready! 🎉
