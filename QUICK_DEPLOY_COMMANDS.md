# Quick Deploy Commands - Copy & Paste

## 🚀 Deploy Edge Functions (3 Steps)

### 1. Login & Link (One-time setup)
```bash
supabase login
supabase link --project-ref zxbfygofxxmfivddwdqt
```

### 2. Set Secrets (One-time setup)
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

### 3. Deploy Functions (Run every time you update code)
```bash
supabase functions deploy
```

---

## 📋 Verify Deployment
```bash
supabase functions list
```

---

## 🔧 Deploy Single Function
```bash
supabase functions deploy create-payment-with-connect
```

---

## 🔍 View Function Logs (Real-time debugging)
```bash
supabase functions logs create-payment-with-connect --follow
```

---

## 🔐 Manage Secrets
```bash
# List all secrets
supabase secrets list

# Set a secret
supabase secrets set SECRET_NAME=value

# Delete a secret
supabase secrets unset SECRET_NAME
```

---

## 🎯 Your Specific Functions to Deploy

```bash
# Deploy all payment-related functions
supabase functions deploy create-payment-with-connect
supabase functions deploy capture-payment
supabase functions deploy refund-payment
supabase functions deploy create-connect-account
supabase functions deploy create-onboarding-link
supabase functions deploy stripe-webhook
```

---

## ⚡ PowerShell Quick Deploy
```powershell
.\deploy-functions.ps1
```

---

## 🐛 Debug 404 Errors

If you still get 404 after deployment:

1. **Wait 60 seconds** - Functions need time to propagate
2. **Check deployment status:**
   ```bash
   supabase functions list
   ```
3. **View logs:**
   ```bash
   supabase functions logs create-payment-with-connect
   ```
4. **Verify function name matches:**
   - Folder: `supabase/functions/create-payment-with-connect/`
   - Frontend call: `supabase.functions.invoke('create-payment-with-connect')`

---

## 📊 Expected Output After Successful Deployment

```
Deploying function create-payment-with-connect...
✓ Function deployed successfully
Version: 1
URL: https://zxbfygofxxmfivddwdqt.supabase.co/functions/v1/create-payment-with-connect
```

---

## 🎉 Success Checklist

- [ ] Ran `supabase login`
- [ ] Ran `supabase link --project-ref zxbfygofxxmfivddwdqt`
- [ ] Set `STRIPE_SECRET_KEY` secret
- [ ] Ran `supabase functions deploy`
- [ ] Verified with `supabase functions list`
- [ ] Tested in browser (no more 404!)
- [ ] Ran database migration `add_stripe_fields_to_bookings.sql`

---

## 💡 Pro Tips

- **Auto-deploy on save:** Use `supabase functions serve` for local development
- **Environment-specific secrets:** Use different keys for test/production
- **Monitor logs:** Keep `supabase functions logs --follow` running during testing
- **Version control:** Each deployment creates a new version (can rollback)

---

## 🆘 Still Getting 404?

1. Check project reference is correct: `zxbfygofxxmfivddwdqt`
2. Verify you're logged into the correct Supabase account
3. Check function exists: `ls supabase/functions/`
4. Try deploying with verbose flag: `supabase functions deploy --debug`
5. Check Supabase Dashboard > Edge Functions tab

---

## 📞 Need Help?

- Supabase Docs: https://supabase.com/docs/guides/functions
- Check function logs: `supabase functions logs <function-name>`
- Supabase Discord: https://discord.supabase.com
