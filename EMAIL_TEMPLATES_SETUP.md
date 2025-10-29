# Professional Email Templates Setup Guide

## Overview
This guide will help you set up professional, branded email templates for Petflik in Supabase.

## Email Templates Included

1. **Welcome Email** - Sent when users sign up
2. **Email Confirmation** - Sent to verify email addresses
3. **Password Reset** - Sent when users request password reset

## Features

✨ **Professional Design**
- Modern gradient backgrounds (blue to purple)
- Petflik logo and branding
- Responsive layout for mobile and desktop
- Clean, readable typography

🎨 **Brand Colors**
- Primary: Blue (#3b82f6) to Purple (#8b5cf6) gradient
- Accent colors for different sections
- Consistent with app design

📱 **Mobile Responsive**
- Works perfectly on all devices
- Optimized for email clients (Gmail, Outlook, Apple Mail)

## Setup Instructions

### Step 1: Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your Petflik project
3. Navigate to **Authentication** → **Email Templates**

### Step 2: Configure Each Template

#### A. Confirm Signup Template

1. Click on **"Confirm signup"** template
2. Replace the default HTML with content from `email-templates/email-confirmation.html`
3. **Subject line:** `Confirm your email - Welcome to Petflik! 🐾`
4. Click **Save**

#### B. Reset Password Template

1. Click on **"Reset password"** template
2. Replace the default HTML with content from `email-templates/reset-password.html`
3. **Subject line:** `Reset your Petflik password 🔐`
4. Click **Save**

#### C. Magic Link Template (Optional)

1. Click on **"Magic Link"** template
2. You can use the welcome template or email confirmation template
3. **Subject line:** `Your magic link to Petflik ✨`
4. Click **Save**

### Step 3: Configure Email Settings

1. Go to **Authentication** → **Settings**
2. Scroll to **Email Auth**
3. Configure:
   - **Site URL:** Your production URL (e.g., `https://petflik.com`)
   - **Redirect URLs:** Add your app URLs
   - **Email Rate Limit:** Adjust as needed (default: 4 emails per hour)

### Step 4: Test Your Templates

#### Test Email Confirmation:
```bash
# Sign up a new user
curl -X POST 'https://your-project.supabase.co/auth/v1/signup' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

#### Test Password Reset:
```bash
# Request password reset
curl -X POST 'https://your-project.supabase.co/auth/v1/recover' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com"
  }'
```

### Step 5: Custom SMTP (Optional but Recommended)

For better deliverability and branding, set up custom SMTP:

1. Go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Enable **Custom SMTP**
4. Configure with your email provider:

**Recommended Providers:**
- **SendGrid** (Free tier: 100 emails/day)
- **Mailgun** (Free tier: 5,000 emails/month)
- **AWS SES** (Very cheap, high volume)
- **Postmark** (Great deliverability)

**Example SendGrid Configuration:**
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: YOUR_SENDGRID_API_KEY
Sender email: noreply@petflik.com
Sender name: Petflik
```

## Template Variables

These variables are automatically replaced by Supabase:

- `{{ .ConfirmationURL }}` - Email confirmation or password reset link
- `{{ .Token }}` - Verification token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address

## Customization Tips

### Change Colors
Replace the gradient colors in the templates:
```html
<!-- Current: Blue to Purple -->
background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);

<!-- Example: Green to Blue -->
background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
```

### Add Your Logo
Replace the emoji with your logo image:
```html
<!-- Current: Emoji -->
<span style="font-size: 48px;">🐾</span>

<!-- With Image: -->
<img src="https://your-cdn.com/logo.png" alt="Petflik" style="width: 48px; height: 48px;">
```

### Update Links
Update footer links to your actual pages:
```html
<a href="https://petflik.com/privacy">Privacy Policy</a>
<a href="https://petflik.com/terms">Terms of Service</a>
```

## Email Best Practices

### Deliverability
- ✅ Use a custom domain (e.g., noreply@petflik.com)
- ✅ Set up SPF, DKIM, and DMARC records
- ✅ Use a reputable SMTP provider
- ✅ Keep email size under 100KB
- ✅ Test with multiple email clients

### Content
- ✅ Clear, actionable subject lines
- ✅ Prominent call-to-action button
- ✅ Plain text alternative link
- ✅ Unsubscribe option (for marketing emails)
- ✅ Contact information

### Design
- ✅ Mobile-responsive layout
- ✅ Consistent branding
- ✅ Readable font sizes (14px minimum)
- ✅ High contrast text
- ✅ Alt text for images

## Troubleshooting

### Emails Not Sending
1. Check Supabase logs: **Authentication** → **Logs**
2. Verify email rate limits not exceeded
3. Check spam folder
4. Verify SMTP credentials (if using custom SMTP)

### Emails in Spam
1. Set up SPF/DKIM/DMARC records
2. Use custom SMTP provider
3. Avoid spam trigger words
4. Include unsubscribe link
5. Warm up your sending domain

### Template Not Updating
1. Clear browser cache
2. Wait a few minutes for changes to propagate
3. Test with a new email address
4. Check for HTML syntax errors

## Testing Checklist

- [ ] Email confirmation works
- [ ] Password reset works
- [ ] Emails display correctly in Gmail
- [ ] Emails display correctly in Outlook
- [ ] Emails display correctly on mobile
- [ ] All links work correctly
- [ ] Branding is consistent
- [ ] No broken images
- [ ] Text is readable
- [ ] Buttons are clickable

## Support

If you need help:
- Check [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- Visit [Supabase Discord](https://discord.supabase.com)
- Email: support@petflik.com

## Next Steps

After setting up email templates:
1. ✅ Test all email flows
2. ✅ Set up custom domain
3. ✅ Configure SMTP provider
4. ✅ Monitor email deliverability
5. ✅ Add email analytics (optional)
