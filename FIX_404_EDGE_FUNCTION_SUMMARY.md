# Fix 404 Edge Function Error - Complete Solution

## 🔴 The Problem

**Error:** `POST https://zxbfygofxxmfivddwdqt.supabase.co/functions/v1/create-payment-wit... 404 (Not Found)`

**Root Cause:** The Edge Function `create-payment-with-connect` exists in your code but is **NOT DEPLOYED** to Supabase servers.

---

## ✅ The Solution (3 Commands)

Open your terminal and run:

```bash
# 1. Login to Supabase
supabase login

# 2. Link your project
supabase link --project-ref zxbfygofxxmfivddwdqt

# 3. Deploy all functions
supabase functions deploy
```

**That's it!** Your 404 error will be fixed.

---

## 🎯 What This Does

1. **`supabase login`** - Authenticates you with Supabase
2. **`supabase link`** - Connects your local code to your Supabase project
3. **`supabase functions deploy`** - Uploads all Edge Functions to Supabase servers

---

## 📋 Verification

After deployment, verify it worked:

```bash
supabase functions list
```

You should see:
```
┌─────────────────────────────────┬─────────┐
│ NAME                            │ VERSION │
├─────────────────────────────────┼─────────┤
│ create-payment-with-connect     │ 1       │
│ capture-payment                 │ 1       │
│ refund-payment                  │ 1       │
└─────────────────────────────────┴─────────┘
```

---

## 🧪 Test It

1. Open your app: http://localhost:5173 (or your dev URL)
2. Navigate to a booking
3. Click "Pay Now - €15.00"
4. Check the browser console - **NO MORE 404!**

You might see a different error like "Sitter has not completed payout setup" - **that's good!** It means the function is working, just the sitter needs to set up Stripe Connect.

---

## 🔐 Set Stripe Secret (Important!)

Your function needs the Stripe API key:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_KEY_HERE
```

Get your Stripe key from: https://dashboard.stripe.com/test/apikeys

---

## 📁 Your File Structure (Already Correct ✅)

```
supabase/
└── functions/
    └── create-payment-with-connect/
        └── index.ts  ✅ Exists
```

**Frontend call (Already Correct ✅):**
```typescript
supabase.functions.invoke('create-payment-with-connect', { ... })
```

The names match perfectly! You just need to deploy.

---

## 🚨 Common Issues After Deployment

### Issue 1: "Unauthorized" Error
**Fix:** Make sure user is logged in before calling the function.

### Issue 2: "Sitter has not completed payout setup"
**Fix:** This is expected! The sitter needs to complete Stripe Connect onboarding first.
- Go to Payout Setup page
- Complete the Stripe Connect flow

### Issue 3: "Booking not found"
**Fix:** Make sure the booking exists in the database and the bookingId is correct.

### Issue 4: Still getting 404 after deployment
**Fix:** Wait 60 seconds for the function to propagate, then refresh your browser.

---

## 🎬 Complete Deployment Workflow

```bash
# One-time setup (if not done already)
supabase login
supabase link --project-ref zxbfygofxxmfivddwdqt
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY

# Deploy functions (run this every time you update function code)
supabase functions deploy

# Verify deployment
supabase functions list

# Watch logs in real-time (optional, for debugging)
supabase functions logs create-payment-with-connect --follow
```

---

## 📊 Before vs After

### Before Deployment ❌
```
POST /functions/v1/create-payment-with-connect
Status: 404 Not Found
Error: Edge Function returned a non-2xx status code
```

### After Deployment ✅
```
POST /functions/v1/create-payment-with-connect
Status: 200 OK (or 400 with clear error message)
Response: { clientSecret: "pi_xxx", platformFee: 3.00, sitterAmount: 12.00 }
```

---

## 🎯 Next Steps After Fixing 404

1. ✅ Deploy Edge Functions (you're doing this now!)
2. ✅ Run database migration: `database/add_stripe_fields_to_bookings.sql`
3. ✅ Set up Stripe Connect for sitters
4. ✅ Test the complete payment flow
5. ✅ Set up Stripe webhooks for production

---

## 💡 Pro Tips

- **Local Development:** Use `supabase functions serve` to test locally
- **View Logs:** Use `supabase functions logs <name> --follow` to debug
- **Rollback:** If something breaks, you can rollback to previous version
- **Environment Variables:** Use different Stripe keys for test/production

---

## 🆘 Still Stuck?

1. Check you're logged into the correct Supabase account
2. Verify project reference: `zxbfygofxxmfivddwdqt`
3. Check Supabase Dashboard > Edge Functions tab
4. View function logs: `supabase functions logs create-payment-with-connect`
5. Try deploying with debug: `supabase functions deploy --debug`

---

## 📚 Additional Resources

- **Full Deployment Guide:** See `DEPLOY_EDGE_FUNCTIONS_GUIDE.md`
- **Quick Commands:** See `QUICK_DEPLOY_COMMANDS.md`
- **PowerShell Script:** Run `.\deploy-functions.ps1`
- **Supabase Docs:** https://supabase.com/docs/guides/functions

---

## ✅ Success Checklist

- [ ] Ran `supabase login`
- [ ] Ran `supabase link --project-ref zxbfygofxxmfivddwdqt`
- [ ] Set Stripe secret key
- [ ] Ran `supabase functions deploy`
- [ ] Verified with `supabase functions list`
- [ ] Tested in browser - no more 404!
- [ ] Ran database migration
- [ ] Set up Stripe Connect for test sitter

---

**TL;DR:** Your function code is perfect. You just need to deploy it. Run these 3 commands:

```bash
supabase login
supabase link --project-ref zxbfygofxxmfivddwdqt
supabase functions deploy
```

Done! 🎉
