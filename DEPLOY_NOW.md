# 🚀 DEPLOY YOUR EDGE FUNCTIONS NOW

## Copy & Paste These Commands

Open PowerShell or Terminal and run:

```bash
supabase login
```
↓ Browser opens, click "Authorize"

```bash
supabase link --project-ref zxbfygofxxmfivddwdqt
```
↓ Enter your database password when prompted

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_KEY_HERE
```
↓ Replace with your actual Stripe test key from https://dashboard.stripe.com/test/apikeys

```bash
supabase functions deploy
```
↓ Wait for deployment to complete (30-60 seconds)

```bash
supabase functions list
```
↓ Verify your functions are deployed

## ✅ Done!

Now test your app - the 404 error should be gone!

---

## 🎯 What You Just Did

1. ✅ Logged into Supabase
2. ✅ Connected your local code to your Supabase project
3. ✅ Set your Stripe API key as a secret
4. ✅ Deployed all Edge Functions to Supabase servers
5. ✅ Verified deployment

---

## 🧪 Test It Now

1. Open your app in the browser
2. Go to a booking
3. Click "Pay Now"
4. Check the console - **NO MORE 404!**

---

## 🔍 Expected Results

### Before Deployment ❌
```
POST .../create-payment-wit... 404 (Not Found)
```

### After Deployment ✅
```
POST .../create-payment-with-connect 200 (OK)
```

Or you might see:
```
POST .../create-payment-with-connect 400 (Bad Request)
Error: "Sitter has not completed payout setup"
```

**This is good!** It means the function is working. The sitter just needs to complete Stripe Connect onboarding.

---

## 🎉 Success!

Your Edge Functions are now live and working!

Next steps:
1. Run the database migration: `database/add_stripe_fields_to_bookings.sql`
2. Test the complete payment flow
3. Set up Stripe Connect for your test sitter account

---

## 🆘 Need Help?

If you get any errors during deployment:

1. **"Not logged in"** → Run `supabase login` again
2. **"Project not found"** → Check the project ref is correct: `zxbfygofxxmfivddwdqt`
3. **"Invalid credentials"** → Make sure you're logged into the correct Supabase account
4. **Still getting 404** → Wait 60 seconds and refresh your browser

---

## 📞 Quick Support

- View logs: `supabase functions logs create-payment-with-connect --follow`
- Check status: `supabase functions list`
- Redeploy: `supabase functions deploy create-payment-with-connect`

---

**Ready? Copy the commands above and run them now!** 🚀
