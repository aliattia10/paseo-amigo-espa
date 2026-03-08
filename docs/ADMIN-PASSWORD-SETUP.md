# Admin password setup

The admin dashboard (`/admin`, `/admin/verifications`, etc.) is protected by a **simple password**. The app checks `VITE_ADMIN_PASSWORD` in the **frontend** (at build time), so you set it where the **frontend is built and deployed**.

## Where to set it

### Netlify (recommended if you deploy the app on Netlify)

1. Netlify dashboard → your site → **Site configuration** → **Environment variables**.
2. Add a variable:
   - **Key:** `VITE_ADMIN_PASSWORD`
   - **Value:** your secret admin password
   - **Scopes:** All (or only “Build” if you want it only at build time).
3. Trigger a new **deploy** so the build picks up the value (Vite bakes `VITE_*` vars into the client bundle when you run `npm run build`).

So: **set the admin password in Netlify environment variables**, not in Supabase.

### Supabase Edge secrets

**Do not use Supabase Edge secrets for this admin password.**

- Edge secrets are for **Supabase Edge Functions** (server-side).
- Our admin login runs **in the browser** and reads `VITE_ADMIN_PASSWORD` from the built JS.
- So the password is supplied by the place that **builds the frontend** (e.g. Netlify), not by Supabase.

If you later move to a **server-side** admin login (e.g. an Edge Function that checks a secret and sets a signed cookie), then you would store the admin password in **Supabase Edge secrets** and stop using `VITE_ADMIN_PASSWORD` in the client.

### Local development

- In the project root, copy `.env.example` to `.env` and set:
  - `VITE_ADMIN_PASSWORD=your_admin_password_here`
- Restart the dev server after changing `.env`.

## Summary

| Where you deploy the frontend | Where to set admin password        |
|------------------------------|------------------------------------|
| **Netlify**                  | Netlify → Environment variables → `VITE_ADMIN_PASSWORD` |
| **Vercel**                   | Vercel → Project → Settings → Environment Variables → `VITE_ADMIN_PASSWORD` |
| **Other (e.g. Docker, VPS)** | In the env used when running `npm run build` (e.g. `.env` or CI env vars) |

**Not:** Supabase Edge secrets (unless you switch to a server-side admin login).
