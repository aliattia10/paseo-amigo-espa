# Email Deliverability Guide - Stop Emails Going to Spam

## Current Issue

Your Petflik emails are:
- ✅ Being sent successfully via Brevo
- ❌ Going to spam folder
- ❌ Showing "This message might be dangerous" warning in Gmail

## Why This Happens

Gmail and other email providers mark emails as spam when:
1. Sender domain not authenticated (no SPF/DKIM/DMARC)
2. New sender with no reputation
3. Suspicious content or links
4. Using a generic sender (info@petflik.com from Brevo's servers)

## Solutions (In Order of Priority)

### 🔥 Solution 1: Authenticate Your Domain (MOST IMPORTANT)

This is the #1 way to avoid spam. You need to set up SPF, DKIM, and DMARC records.

#### Step 1: Add Your Domain to Brevo

1. Go to [Brevo Dashboard](https://app.brevo.com)
2. Navigate to **Senders & IP** → **Domains**
3. Click **"Add a domain"**
4. Enter your domain: `petflik.com`

#### Step 2: Get DNS Records from Brevo

Brevo will provide you with DNS records like:

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:spf.brevo.com ~all
```

**DKIM Record:**
```
Type: TXT
Name: mail._domainkey
Value: [Long string provided by Brevo]
```

**DMARC Record:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@petflik.com
```

#### Step 3: Add Records to Your Domain Provider

Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

**For Cloudflare:**
1. Log in to Cloudflare
2. Select your domain
3. Go to **DNS** → **Records**
4. Click **Add record**
5. Add each record from Brevo
6. Save

**For GoDaddy:**
1. Log in to GoDaddy
2. My Products → Domain → DNS
3. Add TXT records
4. Save

**For Namecheap:**
1. Log in to Namecheap
2. Domain List → Manage → Advanced DNS
3. Add TXT records
4. Save

#### Step 4: Verify in Brevo

1. Wait 24-48 hours for DNS propagation
2. Go back to Brevo → Domains
3. Click **"Verify"** next to your domain
4. Should show green checkmarks ✅

### 🎯 Solution 2: Use a Dedicated Sending Domain

Instead of `noreply@petflik.com`, use a subdomain:

**Better:** `noreply@mail.petflik.com`

**Why?** 
- Separates marketing/transactional emails from main domain
- Protects your main domain reputation
- Industry best practice

**Setup:**
1. In Brevo, add `mail.petflik.com` as a domain
2. Add DNS records for this subdomain
3. Use `noreply@mail.petflik.com` as sender in Supabase

### 📧 Solution 3: Improve Email Content

#### Remove Suspicious Elements

**Current Issues:**
- Generic sender name "Petflik Team"
- Links might look suspicious
- No physical address in footer

**Fixes:**

1. **Add Physical Address to Footer**
```html
<p style="margin: 0; color: #9ca3af; font-size: 12px;">
    Petflik Inc.<br>
    123 Pet Street, Suite 100<br>
    San Francisco, CA 94102<br>
    United States
</p>
```

2. **Add Unsubscribe Link** (even for transactional emails)
```html
<a href="{{ .SiteURL }}/unsubscribe" style="color: #9ca3af; text-decoration: none; font-size: 12px;">
    Unsubscribe
</a>
```

3. **Use Branded Links**
Instead of: `https://yourproject.supabase.co/auth/v1/verify`
Use: `https://petflik.com/verify?token=...`

### 🚀 Solution 4: Warm Up Your Sending Domain

New senders need to build reputation gradually.

**Week 1:** Send 10-20 emails/day
**Week 2:** Send 50-100 emails/day
**Week 3:** Send 200-500 emails/day
**Week 4+:** Normal volume

**Tips:**
- Start with engaged users (people who signed up recently)
- Monitor bounce rates and spam complaints
- Don't send to old/inactive emails

### ✅ Solution 5: Get Users to Whitelist You

Add this to your welcome email:

```html
<div style="padding: 16px; background-color: #dbeafe; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0; color: #1e40af; font-size: 14px;">
        <strong>📬 To ensure you receive our emails:</strong><br>
        Add noreply@petflik.com to your contacts or mark this email as "Not Spam"
    </p>
</div>
```

### 🔍 Solution 6: Monitor Your Sender Reputation

**Check Your Domain Reputation:**
- [Google Postmaster Tools](https://postmaster.google.com/)
- [Microsoft SNDS](https://sendersupport.olc.protection.outlook.com/snds/)
- [Sender Score](https://www.senderscore.org/)

**Check if You're Blacklisted:**
- [MXToolbox Blacklist Check](https://mxtoolbox.com/blacklists.aspx)
- Enter your domain or IP

### 📊 Solution 7: Use Brevo's Dedicated IP (Paid)

**Free Plan:** Shared IP (lower reputation)
**Paid Plan:** Dedicated IP (your own reputation)

If you send 10,000+ emails/month, consider upgrading to get a dedicated IP.

## Quick Wins (Do These Now)

### 1. Update Email Templates

Add these to ALL email templates:

**Physical Address:**
```html
<p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
    Petflik • 123 Pet Street, San Francisco, CA 94102
</p>
```

**Clear Sender Identity:**
```html
<p style="margin: 0; color: #6b7280; font-size: 14px;">
    This email was sent by Petflik, your trusted pet care community.
</p>
```

**Contact Information:**
```html
<p style="margin: 0; color: #6b7280; font-size: 14px;">
    Questions? Email us at <a href="mailto:support@petflik.com">support@petflik.com</a>
</p>
```

### 2. Update Supabase Email Settings

In Supabase → Authentication → Email Templates:

**Subject Lines:**
- ✅ "Reset your Petflik password"
- ❌ "Reset Your Password" (too generic)

**From Name:**
- ✅ "Petflik Support"
- ❌ "Petflik Team" (sounds automated)

### 3. Test Your Emails

Use these tools to check spam score:

**Mail Tester:**
1. Go to [Mail-Tester.com](https://www.mail-tester.com/)
2. Send a test email to the address they provide
3. Check your spam score (aim for 8+/10)

**GlockApps:**
- Tests deliverability across multiple providers
- Shows exactly why emails go to spam

## Implementation Checklist

### Immediate (Do Today)
- [ ] Add physical address to email templates
- [ ] Add contact information
- [ ] Update sender name to "Petflik Support"
- [ ] Test with Mail-Tester.com

### This Week
- [ ] Add your domain to Brevo
- [ ] Get SPF/DKIM/DMARC records
- [ ] Add DNS records to domain provider
- [ ] Verify domain in Brevo

### This Month
- [ ] Set up dedicated sending subdomain (mail.petflik.com)
- [ ] Monitor sender reputation
- [ ] Gradually increase sending volume
- [ ] Ask users to whitelist emails

## Expected Results

**After DNS Authentication:**
- ✅ Emails go to inbox (not spam)
- ✅ No "dangerous" warnings
- ✅ Better deliverability (95%+ inbox rate)
- ✅ Professional appearance

**Timeline:**
- DNS setup: 1-2 hours
- DNS propagation: 24-48 hours
- Full reputation: 2-4 weeks

## Temporary Workaround

While setting up DNS:

1. **Ask users to check spam folder**
2. **Add this to signup confirmation:**
   ```
   "Check your email (and spam folder) for the verification link"
   ```

3. **Add a "Resend Email" button** in your app

4. **Use a different email provider temporarily:**
   - Gmail (for testing only)
   - Your company email

## Common Mistakes to Avoid

❌ Using "noreply@" without authentication
❌ Sending from Brevo without DNS setup
❌ Generic subject lines ("Reset Password")
❌ No physical address in footer
❌ Sending too many emails too fast
❌ Using URL shorteners in emails
❌ ALL CAPS or excessive punctuation!!!
❌ Spam trigger words ("FREE", "URGENT", "ACT NOW")

## Best Practices

✅ Authenticate your domain (SPF/DKIM/DMARC)
✅ Use a dedicated sending subdomain
✅ Include physical address
✅ Clear, specific subject lines
✅ Professional email design
✅ Monitor bounce rates
✅ Remove inactive subscribers
✅ Make unsubscribe easy
✅ Send consistently (not in bursts)
✅ Personalize when possible

## Need Help?

**Brevo Support:**
- [Brevo Help Center](https://help.brevo.com/)
- Live chat in dashboard

**DNS Setup Help:**
- Your domain registrar's support
- Cloudflare community

**Email Deliverability:**
- [Return Path](https://returnpath.com/)
- [Validity](https://www.validity.com/)

## Pro Tips

1. **Test Before Launch**
   - Send to Gmail, Outlook, Yahoo
   - Check spam folder on all
   - Fix issues before going live

2. **Monitor Metrics**
   - Open rate (should be 20%+)
   - Bounce rate (should be <2%)
   - Spam complaints (should be <0.1%)

3. **Segment Your Emails**
   - Transactional (password reset, confirmations)
   - Marketing (newsletters, promotions)
   - Use different subdomains for each

4. **Keep Lists Clean**
   - Remove bounced emails
   - Remove inactive users (6+ months)
   - Verify emails before sending

## Quick Fix Summary

**To stop emails going to spam RIGHT NOW:**

1. ✅ Add your domain to Brevo
2. ✅ Set up SPF/DKIM/DMARC records
3. ✅ Add physical address to email templates
4. ✅ Use "Petflik Support" as sender name
5. ✅ Wait 24-48 hours for DNS propagation

**Result:** 95%+ of emails will go to inbox instead of spam!
