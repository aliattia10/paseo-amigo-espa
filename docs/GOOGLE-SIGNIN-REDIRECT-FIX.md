# Google Sign-in Redirect URI Mismatch Fix

Error shown by Google:
- `Error 400: redirect_uri_mismatch`

This project uses Supabase OAuth. Google must redirect to Supabase first, then Supabase redirects back to the app.

## 1) Use the correct redirect URI in Google Cloud

In **Google Cloud Console -> APIs & Services -> Credentials -> OAuth 2.0 Client IDs -> [your web client]**:

- Add this exact URI under **Authorized redirect URIs**:
  - `https://zxbfygofxxmfivddwdqt.supabase.co/auth/v1/callback`

Do not use `https://petflik.com/auth/callback` in Google redirect URIs.

## 2) Keep app callback URLs in Supabase

In **Supabase -> Authentication -> URL Configuration**:

- Site URL:
  - `https://petflik.com`

- Redirect URLs:
  - `https://petflik.com/auth/callback`
  - `http://localhost:5173/auth/callback`

## 3) Match origins in Google Cloud

In the same OAuth client in Google Cloud, set **Authorized JavaScript origins**:

- `https://petflik.com`
- `http://localhost:5173`

Add preview domains if used (for example Netlify preview URLs).

## 4) Verify Google provider in Supabase

In **Supabase -> Authentication -> Providers -> Google**:

- Ensure Google provider is enabled.
- Client ID / Secret must be from the same OAuth client where the redirect URI above is configured.

## 5) Test flow

1. Open app login page.
2. Click "Continue with Google".
3. After consent, browser should return to:
   - `https://petflik.com/auth/callback`
4. App should finish login and redirect inside the app.

## Notes

- Changing only Supabase Redirect URLs does not fix `redirect_uri_mismatch`.
- Google's error is specifically about the redirect URI configured in Google OAuth client settings.
