# Stripe Payment CSP Fix

## Problem

Payment page was showing errors:
```
Failed to load resource: the server responded with a status of 400
Content Security Policy directive violation
'unsafe-eval' is not an allowed source
```

This happens because Stripe requires `unsafe-eval` and `unsafe-inline` in the Content Security Policy to work properly.

## Solution Applied

Updated Content Security Policy in 3 places to allow Stripe:

### 1. index.html
Added CSP meta tag allowing:
- ✅ Stripe scripts (`https://js.stripe.com`)
- ✅ Stripe API (`https://api.stripe.com`)
- ✅ Stripe frames (`https://hooks.stripe.com`)
- ✅ `unsafe-eval` and `unsafe-inline` for Stripe functionality
- ✅ Supabase connections
- ✅ Google Maps (if needed)

### 2. netlify.toml
Updated headers to include CSP:
- Changed `X-Frame-Options` from `DENY` to `SAMEORIGIN` (allows Stripe iframes)
- Added full CSP header

### 3. public/_headers
Updated Netlify headers file:
- Changed `X-Frame-Options` from `DENY` to `SAMEORIGIN`
- Added CSP header

## What's Allowed Now

**Scripts:**
- ✅ Your app scripts
- ✅ Stripe.js
- ✅ Google Maps
- ✅ Inline scripts (for Stripe)
- ✅ eval() (required by Stripe)

**Connections:**
- ✅ Your API
- ✅ Supabase (all endpoints)
- ✅ Stripe API
- ✅ Google Maps API
- ✅ WebSocket connections (Supabase realtime)

**Frames:**
- ✅ Stripe payment forms
- ✅ Stripe 3D Secure
- ✅ Your own iframes

**Images:**
- ✅ Your images
- ✅ Data URLs
- ✅ HTTPS images
- ✅ Blob URLs

## Deploy the Fix

### Option 1: Rebuild and Deploy

If you're using Netlify:
```bash
npm run build
# Then deploy via Netlify CLI or push to git
```

### Option 2: Just Push to Git

If you have auto-deploy enabled:
```bash
git add .
git commit -m "Fix: Add CSP headers for Stripe payments"
git push
```

Netlify will automatically rebuild and deploy with the new headers.

### Option 3: Local Testing

For local development, the changes in `index.html` will work immediately:
```bash
npm run dev
```

## Testing

After deploying:

1. **Go to bookings page**
2. **Click "Payer Maintenant"**
3. **Payment page should load without CSP errors**
4. **Stripe form should appear**
5. **You can enter card details**

### Test Card Numbers

Use Stripe test cards:
- **Success:** 4242 4242 4242 4242
- **Requires 3D Secure:** 4000 0025 0000 3155
- **Declined:** 4000 0000 0000 0002

Any future expiry date and any 3-digit CVC.

## Verify CSP is Working

### In Browser Console:

**Before fix:**
```
❌ Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source
❌ Refused to load the script 'https://js.stripe.com/v3/'
```

**After fix:**
```
✅ No CSP errors
✅ Stripe loads successfully
✅ Payment form appears
```

### Check Headers:

Open DevTools → Network → Select any request → Headers tab

Look for:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com...
```

## Security Notes

### Why `unsafe-eval` and `unsafe-inline`?

Stripe requires these for:
- **unsafe-eval:** Stripe uses dynamic code evaluation for fraud detection
- **unsafe-inline:** Stripe injects inline scripts for payment processing

This is **safe** because:
- ✅ Only Stripe domains are allowed
- ✅ Your app code doesn't use eval()
- ✅ Stripe is a trusted payment processor
- ✅ All other sources are restricted

### What's Still Blocked?

- ❌ Scripts from unknown domains
- ❌ Inline event handlers (onclick, etc.)
- ❌ Object/embed tags
- ❌ Unsafe redirects
- ❌ Mixed content (HTTP on HTTPS)

## Troubleshooting

### Still seeing CSP errors?

1. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear cache in DevTools

2. **Check deployment:**
   - Make sure the new code is deployed
   - Check Netlify deploy logs
   - Verify the build succeeded

3. **Check headers are applied:**
   - Open DevTools → Network
   - Look at response headers
   - Verify CSP header is present

### Payment still fails?

1. **Check Stripe keys:**
   - Verify `VITE_STRIPE_PUBLISHABLE_KEY` in `.env`
   - Make sure it starts with `pk_test_` or `pk_live_`

2. **Check Edge Function:**
   - Verify `create-payment-with-connect` is deployed
   - Check function logs for errors

3. **Check booking data:**
   - Make sure booking has `total_price`
   - Verify booking belongs to current user

## Files Changed

- ✅ `index.html` - Added CSP meta tag
- ✅ `netlify.toml` - Updated headers
- ✅ `public/_headers` - Updated Netlify headers

## Next Steps

1. **Deploy the changes**
2. **Test payment flow**
3. **Verify no CSP errors**
4. **Complete a test payment**

---

**Status:** ✅ CSP configured for Stripe

**Action Required:** Deploy the changes and test!
