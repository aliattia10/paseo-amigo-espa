# Supabase email verification – why it might not be working

After signup, Supabase can send a "Confirm your email" message. If users are no longer receiving it, check the following.

## 1. Enable "Confirm email" in the Dashboard

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Authentication** → **Providers** → **Email**.
3. Turn **"Confirm email"** **ON** if you want users to verify their email before signing in.
4. Save.

If this is OFF, Supabase does not send a confirmation email and users can sign in immediately.

## 2. Use custom SMTP (recommended for production)

The built-in Supabase email provider is for **demo only** and has **very low rate limits**. It may:

- Only send to certain addresses.
- Hit rate limits quickly.
- Be blocked or land in spam (e.g. `@supabase.io` sender).

For production, configure your own SMTP:

1. In the Dashboard: **Project Settings** → **Auth** → **SMTP**.
2. Enable **Custom SMTP** and set:
   - **Sender email** (e.g. `noreply@yourdomain.com`)
   - **Sender name**
   - **Host** (e.g. `smtp.sendgrid.net`, `email-smtp.region.amazonaws.com`)
   - **Port** (e.g. 587)
   - **Username / password** (or API key, depending on provider)

Use a proper email provider (e.g. **SendGrid**, **Resend**, **AWS SES**, **Postmark**, **Mailtrap** for testing). See: [Supabase – Send emails with custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

## 3. Check Auth logs

1. In the Dashboard: **Logs** → **Auth logs**.
2. Look for errors when the user signs up (e.g. SMTP handover errors, invalid config).

If the log shows success but the user gets no email, the problem is usually SMTP or delivery (provider, spam, rate limits).

## 4. Redirect URL for the confirmation link

The app already sets `emailRedirectTo` on signup (e.g. `${origin}/auth?confirmed=true` or `/auth/callback`). Ensure:

- In **Authentication** → **URL Configuration** → **Redirect URLs**, your production and dev URLs are allowed (e.g. `https://petflik.com/auth`, `https://petflik.com/auth/callback`, and your dev URL).
- The link in the email will send users to that URL after they confirm.

## Summary checklist

| Check | Where |
|--------|--------|
| "Confirm email" is ON | Auth → Providers → Email |
| Custom SMTP configured | Project Settings → Auth → SMTP |
| Redirect URLs include your app | Auth → URL Configuration |
| No errors on signup | Logs → Auth logs |

Once "Confirm email" is ON and SMTP is correctly set, new signups should receive the verification email. Existing users who never confirmed may need to use "Forgot password" or a resend-confirmation flow if you add one.
