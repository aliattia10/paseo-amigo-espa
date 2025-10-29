# Custom Domain Setup: petflik.com

## Overview
This guide will help you set up `petflik.com` as your custom domain for the Petflik app.

## Prerequisites
- Domain registered: `petflik.com` ✅
- Netlify account with deployed app
- Access to domain DNS settings

## Step-by-Step Setup

### 1. Configure Netlify Custom Domain

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site: `perropaseo`
3. Click **Domain settings**
4. Click **Add custom domain**
5. Enter: `petflik.com`
6. Click **Verify**
7. Click **Add domain**

**Also add www subdomain:**
8. Click **Add domain alias**
9. Enter: `www.petflik.com`
10. Click **Add**

### 2. Configure DNS Records

Go to your domain registrar (where you bought petflik.com):

#### Option A: Use Netlify DNS (Recommended - Easiest)

1. In Netlify, go to **Domain settings** → **DNS**
2. Click **Set up Netlify DNS**
3. Follow the wizard
4. You'll get nameservers like:
   ```
   dns1.p03.nsone.net
   dns2.p03.nsone.net
   dns3.p03.nsone.net
   dns4.p03.nsone.net
   ```
5. Go to your domain registrar
6. Update nameservers to Netlify's nameservers
7. Wait 24-48 hours for propagation

#### Option B: Use External DNS (Your Current Registrar)

Add these DNS records at your domain registrar:

**For Root Domain (petflik.com):**
```
Type: A
Name: @ (or leave blank)
Value: 75.2.60.5
TTL: 3600
```

**For WWW Subdomain:**
```
Type: CNAME
Name: www
Value: perropaseo.netlify.app
TTL: 3600
```

**Common Registrars:**

**GoDaddy:**
- My Products → Domain → DNS → Manage DNS
- Add A record and CNAME record

**Namecheap:**
- Domain List → Manage → Advanced DNS
- Add A record and CNAME record

**Cloudflare:**
- Select domain → DNS → Records
- Add A record and CNAME record
- ⚠️ Turn OFF orange cloud (proxy) initially

### 3. Enable HTTPS/SSL

In Netlify:

1. Go to **Domain settings** → **HTTPS**
2. Wait for DNS to propagate (check status)
3. Once verified, click **Verify DNS configuration**
4. Click **Provision certificate**
5. Wait 5-10 minutes
6. SSL certificate will be automatically issued

**Verify HTTPS:**
- Visit `https://petflik.com`
- Should show secure padlock 🔒

### 4. Configure Supabase

Go to [Supabase Dashboard](https://app.supabase.com):

#### A. Update Site URL

1. Select your project
2. Go to **Authentication** → **URL Configuration**
3. Set **Site URL** to:
   ```
   https://petflik.com
   ```

#### B. Add Redirect URLs

Add these to the **Redirect URLs** whitelist:

```
https://petflik.com/**
https://petflik.com/reset-password
https://petflik.com/auth/callback
https://petflik.com/dashboard
https://www.petflik.com/**
https://perropaseo.netlify.app/**
http://localhost:5173/**
```

**Why keep Netlify URL?**
- For preview deployments
- For testing before DNS propagates
- As a backup

#### C. Save and Wait

- Click **Save**
- Wait 2-3 minutes for changes to propagate

### 5. Update Brevo (Email Service)

If using custom domain for emails:

1. Go to [Brevo Dashboard](https://app.brevo.com)
2. **Senders & IP** → **Domains**
3. Add domain: `petflik.com`
4. Add the DNS records Brevo provides:

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
Value: [Provided by Brevo]
```

**DMARC Record:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@petflik.com
```

5. Wait 24-48 hours
6. Verify in Brevo

**Update Sender Email:**
- Change from `noreply@perropaseo.netlify.app`
- To: `noreply@petflik.com`

### 6. Test Everything

#### Test Website Access
- [ ] `https://petflik.com` loads correctly
- [ ] `https://www.petflik.com` redirects to `https://petflik.com`
- [ ] HTTPS works (padlock icon)
- [ ] All pages load correctly

#### Test Authentication
- [ ] Sign up works
- [ ] Login works
- [ ] Logout works
- [ ] Password reset redirects to `https://petflik.com/reset-password`

#### Test Email Links
- [ ] Password reset email contains `petflik.com` links
- [ ] Email confirmation contains `petflik.com` links
- [ ] Links work correctly

### 7. Update Social Media & Marketing

Update your domain everywhere:

- [ ] Social media profiles (Instagram, Facebook, Twitter)
- [ ] Google My Business
- [ ] App store listings (if applicable)
- [ ] Marketing materials
- [ ] Business cards
- [ ] Email signatures

## Verification Checklist

### DNS Propagation
Check if DNS has propagated:
- [WhatsMyDNS.net](https://www.whatsmydns.net/) - Enter `petflik.com`
- Should show Netlify's IP: `75.2.60.5`

### SSL Certificate
- Visit `https://petflik.com`
- Click padlock icon
- Should show valid certificate

### Redirects
- `http://petflik.com` → `https://petflik.com` ✅
- `https://www.petflik.com` → `https://petflik.com` ✅
- `https://perropaseo.netlify.app` → `https://petflik.com` (optional)

## Troubleshooting

### Issue: "Site not found" Error

**Cause:** DNS not propagated yet

**Fix:** 
- Wait 24-48 hours
- Check DNS propagation at whatsmydns.net
- Clear browser cache

### Issue: "Not Secure" Warning

**Cause:** SSL certificate not provisioned

**Fix:**
- Go to Netlify → Domain settings → HTTPS
- Click "Verify DNS configuration"
- Click "Provision certificate"
- Wait 10 minutes

### Issue: Password Reset Goes to Wrong URL

**Cause:** Supabase Site URL not updated

**Fix:**
- Update Supabase Site URL to `https://petflik.com`
- Add `https://petflik.com/**` to Redirect URLs
- Wait 2-3 minutes

### Issue: Emails Still Show Old Domain

**Cause:** Email templates not updated

**Fix:**
- Update email templates in Supabase
- Use `{{ .SiteURL }}` variable instead of hardcoded URLs
- Or update to `https://petflik.com`

### Issue: WWW Not Working

**Cause:** CNAME record not set

**Fix:**
- Add CNAME record: `www` → `perropaseo.netlify.app`
- Wait for DNS propagation

## Advanced Configuration

### Redirect Netlify URL to Custom Domain

In Netlify:
1. Go to **Domain settings**
2. Find `perropaseo.netlify.app`
3. Click **Options** → **Set as primary domain**
4. Select `petflik.com` as primary
5. Netlify will auto-redirect old URL to new domain

### Set Up Email Subdomain

For better email deliverability:

1. Use `mail.petflik.com` for emails
2. Add CNAME: `mail` → `perropaseo.netlify.app`
3. Configure in Brevo
4. Use `noreply@mail.petflik.com`

### Add Subdomains

For different environments:

**Staging:**
```
Type: CNAME
Name: staging
Value: staging--perropaseo.netlify.app
```

**API:**
```
Type: CNAME
Name: api
Value: your-api-server.com
```

## Timeline

**Immediate (0-5 minutes):**
- Netlify configuration
- Supabase URL updates

**Short (10-30 minutes):**
- SSL certificate provisioning
- Initial DNS propagation

**Medium (2-24 hours):**
- Full DNS propagation worldwide
- Email domain verification

**Long (24-48 hours):**
- Complete DNS propagation
- Email reputation building

## Maintenance

### Regular Checks
- [ ] SSL certificate auto-renews (every 90 days)
- [ ] DNS records are correct
- [ ] Email deliverability is good
- [ ] All redirects work

### Monitoring
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor SSL expiration
- Check email bounce rates

## Cost Considerations

**Free:**
- Netlify hosting (100GB bandwidth/month)
- SSL certificate (Let's Encrypt)
- DNS (if using Netlify DNS)

**Paid:**
- Domain registration: ~$10-15/year
- Brevo email: Free tier (300 emails/day)
- Premium features: As needed

## Support Resources

**Netlify:**
- [Custom Domain Docs](https://docs.netlify.com/domains-https/custom-domains/)
- [SSL Docs](https://docs.netlify.com/domains-https/https-ssl/)

**Supabase:**
- [Auth Configuration](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)

**DNS:**
- [DNS Checker](https://dnschecker.org/)
- [SSL Checker](https://www.sslshopper.com/ssl-checker.html)

## Quick Reference

**Your Configuration:**
```
Domain: petflik.com
Hosting: Netlify (perropaseo)
Database: Supabase
Email: Brevo
SSL: Let's Encrypt (auto)
```

**DNS Records:**
```
A     @    75.2.60.5
CNAME www  perropaseo.netlify.app
```

**Supabase URLs:**
```
Site URL: https://petflik.com
Redirect: https://petflik.com/**
```

**Email:**
```
Sender: noreply@petflik.com
SMTP: Brevo (smtp-relay.brevo.com:587)
```

---

**Status:** Ready to deploy! 🚀

Once DNS propagates, your app will be live at `https://petflik.com`!
