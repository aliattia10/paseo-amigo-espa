# Mobile login stuck or "Connection timed out"

If login works on desktop but gets stuck or shows "Connection timed out" on **multiple phones**, the app is usually unable to reach Supabase Auth from the mobile browser. Check the following.

## 1. Supabase Dashboard – URL configuration

- Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **URL Configuration**.
- Set **Site URL** to your production URL, e.g. `https://petflik.com` (or `https://www.petflik.com` if that’s what users see).
- In **Redirect URLs**, add:
  - `https://petflik.com/**`
  - `https://www.petflik.com/**` (if you use www)
  - Your Netlify deploy URL if you test there, e.g. `https://your-site.netlify.app/**`

If the auth server doesn’t see your site in these URLs, it can reject or hang requests from mobile.

## 2. Netlify – environment variables

- In Netlify: **Site configuration** → **Environment variables**.
- Ensure **Build** (and optionally **Deploy**) has:
  - `VITE_SUPABASE_URL` = your Supabase project URL (e.g. `https://xxxx.supabase.co`)
  - `VITE_SUPABASE_ANON_KEY` = your Supabase **anon** key (Settings → API in Supabase).

Redeploy after changing these so the built app uses the correct project.

## 3. What the app does now

- **Login** stops waiting after **10 seconds** and shows an error so the button is no longer stuck on "Chargement...".
- If the error looks like a connection/timeout issue, a **connection hint** and **Retry** are shown.
- The **session check** on the login page also times out after 5 seconds so the form can still appear if Supabase is slow.

## 4. If it still fails on mobile only

- Try from the same phone on **Wi‑Fi** vs **mobile data** to see if one network works.
- In the phone browser, open `https://zxbfygofxxmfivddwdqt.supabase.co` (or your project URL). If it doesn’t load, the network or carrier may be blocking it.
- Confirm in Supabase **Authentication** → **Providers** that **Email** is enabled and there are no extra restrictions that could affect mobile.
