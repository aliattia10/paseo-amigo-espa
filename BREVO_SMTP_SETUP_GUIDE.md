# Brevo (Sendinblue) SMTP Setup for Supabase

## Issue: "Email rate limit exceeded"

If you're seeing this error even with Brevo configured, it means Supabase is still using its default email service instead of your Brevo SMTP.

## Correct Brevo SMTP Configuration

### Step 1: Get Your Brevo SMTP Credentials

1. Log in to [Brevo Dashboard](https://app.brevo.com)
2. Go to **Settings** (top right) → **SMTP & API**
3. Click on **SMTP** tab
4. You'll see your credentials:
   - **SMTP Server:** `smtp-relay.brevo.com` (or `smtp-relay.sendinblue.com`)
   - **Port:** `587` (recommended) or `465`
   - **Login:** Your email or SMTP login
   - **SMTP Key:** Click "Generate a new SMTP key" if you don't have one

### Step 2: Configure in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your Petflik project
3. Navigate to **Project Settings** → **Auth**
4. Scroll down to **SMTP Settings**
5. Enable **"Enable Custom SMTP"** toggle

### Step 3: Enter Brevo Settings

**IMPORTANT:** Use these exact settings:

```
SMTP Host: smtp-relay.brevo.com
Port: 587
Username: [Your Brevo email or SMTP login]
Password: [Your Brevo SMTP Key - NOT your account password]
Sender email: noreply@petflik.com (or your verified sender)
Sender name: Petflik
```

**Common Mistakes to Avoid:**
- ❌ Using account password instead of SMTP key
- ❌ Using wrong port (use 587, not 25 or 465)
- ❌ Using unverified sender email
- ❌ Not enabling the "Enable Custom SMTP" toggle

### Step 4: Verify Sender Email in Brevo

Before emails will work, you need to verify your sender email:

1. In Brevo, go to **Senders & IP**
2. Click **Add a sender**
3. Enter your email (e.g., `noreply@petflik.com` or `noreply@yourdomain.com`)
4. Verify it by clicking the link in the verification email

**For Testing:**
- You can use your personal email (e.g., `yourname@gmail.com`)
- For production, use a custom domain email

### Step 5: Test the Configuration

After saving in Supabase:

1. Wait 2-3 minutes for changes to propagate
2. Try the forgot password flow again
3. Check Brevo dashboard → **Statistics** → **Email** to see if email was sent

## Troubleshooting

### Still Getting "Rate Limit Exceeded"?

**Check 1: Is Custom SMTP Actually Enabled?**
- Go back to Supabase → Project Settings → Auth → SMTP Settings
- Make sure the toggle is **ON** (blue/green)
- If it's off, Supabase is still using default email service

**Check 2: Verify SMTP Credentials**
Test your Brevo credentials with this command (in terminal):

```bash
# Test SMTP connection
curl --url 'smtp://smtp-relay.brevo.com:587' \
  --mail-from 'your-email@example.com' \
  --mail-rcpt 'test@example.com' \
  --user 'your-brevo-login:your-smtp-key'
```

**Check 3: Check Supabase Logs**
1. Go to Supabase Dashboard → **Logs** → **Auth Logs**
2. Look for email-related errors
3. Common errors:
   - "SMTP authentication failed" → Wrong credentials
   - "Sender not verified" → Need to verify sender in Brevo
   - "Connection timeout" → Wrong host or port

**Check 4: Brevo Account Status**
- Make sure your Brevo account is active
- Check if you've exceeded Brevo's daily limit (300 emails/day on free plan)
- Go to Brevo → **Statistics** to see usage

### Emails Not Arriving?

**Check Spam Folder**
- Brevo emails sometimes go to spam initially
- Mark as "Not Spam" to train filters

**Check Brevo Logs**
1. Go to Brevo Dashboard
2. Click **Statistics** → **Email**
3. Check if emails were sent successfully
4. Look for bounces or blocks

**Verify Sender Domain (Advanced)**
For better deliverability, set up SPF and DKIM:
1. Go to Brevo → **Senders & IP** → **Domains**
2. Add your domain
3. Add the DNS records they provide to your domain

## Brevo Free Plan Limits

- ✅ 300 emails per day
- ✅ Unlimited contacts
- ✅ SMTP relay included
- ✅ Email templates
- ❌ Brevo branding in emails (can be removed with paid plan)

## Alternative: Increase Supabase Rate Limit Temporarily

While fixing Brevo setup, you can temporarily increase Supabase's rate limit:

1. Go to **Authentication** → **Rate Limits**
2. Find "Email sending rate limit"
3. Change from `4` to `20` per hour
4. This gives you more testing attempts

## Correct Configuration Checklist

- [ ] Brevo SMTP key generated (not account password)
- [ ] Custom SMTP enabled in Supabase (toggle is ON)
- [ ] Using `smtp-relay.brevo.com` as host
- [ ] Using port `587`
- [ ] Sender email verified in Brevo
- [ ] Waited 2-3 minutes after saving settings
- [ ] Tested with a fresh email address
- [ ] Checked Brevo statistics for sent emails
- [ ] Checked spam folder

## Example: Working Brevo Configuration

Here's what a working configuration looks like in Supabase:

```
✅ Enable Custom SMTP: ON (toggle enabled)

SMTP Host: smtp-relay.brevo.com
Port: 587
Username: your-email@example.com
Password: xsmtpsib-a1b2c3d4e5f6g7h8-i9j0k1l2m3n4o5p6
Sender email: noreply@petflik.com
Sender name: Petflik

✅ Minimum interval between emails: 60 seconds
```

## Testing Steps

1. **Clear Rate Limit:**
   - Wait 1 hour, OR
   - Use a different email address

2. **Test Password Reset:**
   - Go to forgot password page
   - Enter email
   - Click "Enviar Enlace de Restablecimiento"
   - Should see success message

3. **Check Brevo Dashboard:**
   - Go to Statistics → Email
   - Should see the email in "Sent" list
   - If not there, SMTP is not configured correctly

4. **Check Email:**
   - Check inbox (and spam)
   - Should receive email within 1-2 minutes
   - Email should use your custom template (if configured)

## Common Brevo Errors

### "Authentication failed"
- **Cause:** Wrong SMTP key or username
- **Fix:** Regenerate SMTP key in Brevo, copy it exactly

### "Sender not verified"
- **Cause:** Sender email not verified in Brevo
- **Fix:** Go to Brevo → Senders & IP → Verify sender

### "Daily limit exceeded"
- **Cause:** Sent more than 300 emails today (free plan)
- **Fix:** Wait until tomorrow, or upgrade Brevo plan

### "Connection timeout"
- **Cause:** Wrong host or port, or firewall blocking
- **Fix:** Use `smtp-relay.brevo.com` and port `587`

## Need More Help?

If still not working:

1. **Screenshot your Supabase SMTP settings** (hide password)
2. **Check Brevo Statistics** - are emails being sent?
3. **Check Supabase Auth Logs** - any error messages?
4. **Try with a different email provider** temporarily to isolate issue

## Pro Tips

### For Development
- Use your personal email as sender (easier to verify)
- Keep rate limit at 20/hour for testing
- Check both Supabase and Brevo logs

### For Production
- Use custom domain email (noreply@petflik.com)
- Set up SPF/DKIM records
- Use email templates in Brevo
- Monitor delivery rates
- Consider upgrading Brevo for higher limits

## Quick Fix Right Now

**If you need to test immediately:**

1. **Use a different email address** - each email has its own rate limit
2. **Wait 1 hour** - rate limit resets
3. **Check spam folder** - emails might already be there
4. **Verify Brevo is actually enabled** in Supabase (toggle ON)

The most common issue is that Custom SMTP toggle is OFF in Supabase, so it's still using the default service with rate limits!
