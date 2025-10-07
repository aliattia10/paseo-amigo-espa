# Supabase Email Configuration Guide

## 📧 Customizing Email Confirmation Templates

This guide will help you customize the email confirmation templates for your Paseo app.

### 🔧 Step 1: Access Supabase Dashboard

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in to your account
3. Select your project: `zxbfygofxxmfivddwdqt`

### 📝 Step 2: Configure Email Templates

1. **Navigate to Authentication Settings:**
   - In the left sidebar, click on "Authentication"
   - Click on "Email Templates" tab

2. **Customize Confirmation Email:**
   - Click on "Confirm signup" template
   - Customize the subject and body

### 🎨 Step 3: Recommended Email Template

#### **Subject Line:**
```
Welcome to Paseo! Please confirm your email address
```

#### **Email Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Paseo</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #3b82f6; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; color: #3b82f6; margin-bottom: 10px; }
        .title { font-size: 24px; color: #1f2937; margin-bottom: 20px; }
        .content { padding: 20px 0; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .button:hover { background-color: #2563eb; }
        .footer { text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb; margin-top: 30px; color: #6b7280; font-size: 14px; }
        .features { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .feature-item { margin: 10px 0; padding-left: 20px; position: relative; }
        .feature-item::before { content: "🐕"; position: absolute; left: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Paseo</div>
            <h1 class="title">Welcome to Paseo!</h1>
        </div>
        
        <div class="content">
            <p>Hi there!</p>
            
            <p>Thank you for signing up for Paseo, the trusted platform connecting dog owners with professional walkers in your neighborhood.</p>
            
            <p>To complete your registration and start connecting with amazing dog walkers, please confirm your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Confirm Email Address</a>
            </div>
            
            <div class="features">
                <h3 style="color: #1f2937; margin-top: 0;">What you can do with Paseo:</h3>
                <div class="feature-item">Find verified, experienced dog walkers in your area</div>
                <div class="feature-item">Book walks instantly with real-time updates</div>
                <div class="feature-item">Get photo updates during your dog's walk</div>
                <div class="feature-item">Read reviews and ratings from other pet owners</div>
                <div class="feature-item">24/7 customer support for peace of mind</div>
            </div>
            
            <p>If you didn't create an account with Paseo, you can safely ignore this email.</p>
            
            <p>Welcome to the Paseo community!</p>
            
            <p>Best regards,<br>
            The Paseo Team</p>
        </div>
        
        <div class="footer">
            <p>This email was sent to {{ .Email }}. If you have any questions, please contact us at support@paseo.com</p>
            <p>&copy; 2024 Paseo. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

### ⚙️ Step 4: Configure Email Settings

1. **Go to Authentication → Settings**
2. **Configure the following:**

   - **Site URL:** `https://perropaseo.netlify.app`
   - **Redirect URLs:** Add your app URLs:
     - `https://perropaseo.netlify.app`
     - `https://perropaseo.netlify.app/auth`
     - `https://perropaseo.netlify.app/dashboard`

3. **Email Settings:**
   - **Enable email confirmations:** ✅ ON
   - **Enable email change confirmations:** ✅ ON
   - **Enable email change:** ✅ ON

### 🔧 Step 5: Advanced Configuration

#### **Custom SMTP (Optional):**
If you want to use your own email service:

1. Go to **Authentication → Settings → SMTP Settings**
2. Configure your SMTP provider:
   - **Host:** Your SMTP server
   - **Port:** 587 (for TLS)
   - **Username:** Your email
   - **Password:** Your email password
   - **Sender name:** Paseo Team
   - **Sender email:** noreply@paseo.com

#### **Email Rate Limiting:**
- **Max emails per hour:** 30 (recommended)
- **Max emails per day:** 300 (recommended)

### 🧪 Step 6: Test Email Flow

1. **Test Registration:**
   - Go to your app: https://perropaseo.netlify.app
   - Try signing up with a test email
   - Check if the confirmation email arrives

2. **Test Email Templates:**
   - In Supabase dashboard, go to Authentication → Email Templates
   - Click "Send test email" to preview

### 📱 Step 7: Mobile-Friendly Templates

The HTML template above is already mobile-responsive, but you can test it by:
1. Opening the email on mobile devices
2. Using email testing tools like Litmus or Email on Acid

### 🔒 Step 8: Security Considerations

1. **Rate Limiting:** Enable to prevent spam
2. **Email Validation:** Supabase handles this automatically
3. **Link Expiration:** Confirmation links expire after 24 hours by default

### 🎨 Step 9: Branding Consistency

Make sure your email template matches your app's branding:
- **Primary Color:** #3b82f6 (blue)
- **Logo:** Use your Paseo logo if available
- **Font:** Arial or system fonts for best compatibility

### 📊 Step 10: Monitor Email Delivery

1. **Check Supabase Logs:**
   - Go to Logs → Auth logs
   - Monitor email send success/failure rates

2. **Analytics:**
   - Track email open rates (if using custom SMTP)
   - Monitor conversion rates from email to app usage

### 🆘 Troubleshooting

**Common Issues:**
1. **Emails not sending:** Check SMTP configuration
2. **Emails going to spam:** Configure SPF/DKIM records
3. **Links not working:** Verify redirect URLs in settings
4. **Template not updating:** Clear browser cache

**Support:**
- Supabase Documentation: https://supabase.com/docs
- Supabase Community: https://github.com/supabase/supabase/discussions

---

## 🎉 You're All Set!

Your Paseo app now has a professional email confirmation system that matches your brand and provides a great user experience.

**Next Steps:**
1. Test the email flow with a real email address
2. Monitor email delivery in Supabase logs
3. Consider setting up custom SMTP for better deliverability
4. Add email analytics if needed

Happy coding! 🐕✨
