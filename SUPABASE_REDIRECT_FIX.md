# Fix Supabase Password Reset Redirect

## Problem

When users click the password reset link in their email, they're redirected to:
- ❌ `https://perropaseo.netlify.app/dashboard`

Instead of:
- ✅ `https://perropaseo.netlify.app/reset-password`

## Root Cause

Supabase has a **Site URL** configuration that overrides the `redirectTo` parameter in password reset emails.

## Solution

### Step 1: Update Supabase Site URL

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your Petflik project
3. Navigate to **Authentication** → **URL Configuration**
4. Find **Site URL** setting

**Current (Wrong):**
```
https://perropaseo.netlify.app/dashboard
```

**Change to:**
```
https://perropaseo.netlify.app
```

5. Click **Save**

### Step 2: Add Redirect URLs

In the same **URL Configuration** section:

1. Find **Redirect URLs** (whitelist)
2. Add these URLs (one per line):

```
https://perropaseo.netlify.app/reset-password
https://perropaseo.netlify.app/auth/reset-password
https://perropaseo.netlify.app/auth/callback
https://perropaseo.netlify.app/dashboard
https://perropaseo.netlify.app/**
```

3. For local development, also add:
```
http://localhost:5173/reset-password
http://localhost:5173/auth/callback
http://localhost:5173/**
```

4. Click **Save**

### Step 3: Verify Email Template

1. Go to **Authentication** → **Email Templates**
2. Click on **"Reset password"** template
3. Look for the reset link in the template

**Should contain:**
```html
<a href="{{ .ConfirmationURL }}">Reset Password</a>
```

**NOT:**
```html
<a href="https://perropaseo.netlify.app/dashboard">Reset Password</a>
```

If it's hardcoded, change it to use `{{ .ConfirmationURL }}`

### Step 4: Test

1. Go to forgot password page
2. Enter your email
3. Check the email you receive
4. Click the reset password link
5. Should redirect to `/reset-password` page ✅

## Understanding Supabase URL Configuration

### Site URL
- **Purpose:** Default redirect after authentication
- **Should be:** Your app's home page (e.g., `https://perropaseo.netlify.app`)
- **NOT:** A specific page like `/dashboard`

### Redirect URLs (Whitelist)
- **Purpose:** Allowed redirect destinations
- **Should include:** All pages users might be redirected to
- **Use wildcards:** `https://perropaseo.netlify.app/**` allows all subpages

### How It Works

When you call:
```typescript
supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`
})
```

Supabase checks:
1. Is `redirectTo` in the whitelist? ✅
2. If yes, use `redirectTo`
3. If no, use Site URL instead

## Common Issues

### Issue 1: Still Redirecting to Dashboard

**Cause:** Redirect URL not in whitelist

**Fix:** Add `/reset-password` to Redirect URLs whitelist

### Issue 2: "Invalid redirect URL" Error

**Cause:** Redirect URL not whitelisted

**Fix:** Add the URL to whitelist, or use wildcard `/**`

### Issue 3: Works Locally, Not in Production

**Cause:** Production URL not in whitelist

**Fix:** Add production URLs to whitelist:
```
https://perropaseo.netlify.app/**
```

### Issue 4: Email Link Goes to Wrong Domain

**Cause:** Site URL is wrong

**Fix:** Set Site URL to your production domain

## Best Practice Configuration

### For Production

**Site URL:**
```
https://perropaseo.netlify.app
```

**Redirect URLs:**
```
https://perropaseo.netlify.app/**
```

This allows any page on your domain.

### For Development

**Additional Redirect URLs:**
```
http://localhost:5173/**
http://localhost:3000/**
http://127.0.0.1:5173/**
```

### For Multiple Environments

If you have staging/preview environments:

```
https://perropaseo.netlify.app/**
https://preview--perropaseo.netlify.app/**
https://staging.perropaseo.com/**
http://localhost:5173/**
```

## Verification Checklist

After making changes:

- [ ] Site URL is set to your domain root (no `/dashboard`)
- [ ] `/reset-password` is in Redirect URLs whitelist
- [ ] Wildcard `/**` is in whitelist (recommended)
- [ ] Email template uses `{{ .ConfirmationURL }}`
- [ ] Waited 2-3 minutes for changes to propagate
- [ ] Tested password reset flow
- [ ] Link redirects to `/reset-password` page
- [ ] Can successfully reset password

## Alternative: Use Auth Callback

If you want more control over redirects:

### Step 1: Always Redirect to Callback

In ForgotPassword.tsx:
```typescript
supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/callback`
})
```

### Step 2: Handle in Callback

In AuthCallback.tsx, detect password reset:
```typescript
const urlParams = new URLSearchParams(window.location.search);
const type = urlParams.get('type');

if (type === 'recovery') {
  navigate('/reset-password');
} else {
  navigate('/dashboard');
}
```

This gives you full control over where users go.

## Testing Commands

### Test Password Reset Email

```bash
# Using curl
curl -X POST 'https://your-project.supabase.co/auth/v1/recover' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com"
  }'
```

### Check Current Configuration

```bash
# Get auth config
curl 'https://your-project.supabase.co/auth/v1/settings' \
  -H 'apikey: YOUR_ANON_KEY'
```

## Quick Fix Summary

1. ✅ Set Site URL to `https://perropaseo.netlify.app` (no `/dashboard`)
2. ✅ Add `https://perropaseo.netlify.app/**` to Redirect URLs
3. ✅ Verify email template uses `{{ .ConfirmationURL }}`
4. ✅ Wait 2-3 minutes
5. ✅ Test password reset

**Result:** Password reset links will go to `/reset-password` page! 🎉
