# Fix "still loading" / connectivity – step by step

Do these in order. After each step, test the app (hard refresh or incognito).

---

## 1. Netlify – force a clean deploy

- Netlify → your site → **Deploys**
- **Trigger deploy** → **Clear cache and deploy site**
- Wait for the deploy to finish.

This makes sure the build uses the latest env vars (no old cached URL/key).

---

## 2. Netlify – check env vars

- **Site configuration** → **Environment variables**
- You must have **both** (with **exact** values from Supabase):

| Variable | Example value |
|----------|----------------|
| `VITE_SUPABASE_URL` | `https://zxbfygofxxmfivddwdqt.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` (long JWT) |

- URL must end with **dwdqt** and **.co** (not dwdql, not .com).
- Get the anon key from: Supabase → **Settings** → **API** → **Project API keys** → **anon public**.
- If you change anything, trigger **Clear cache and deploy** again.

---

## 3. Supabase – run the RLS fix SQL once

- Supabase Dashboard → **SQL Editor** → **New query**
- Open the file **`docs/RUN_IN_SUPABASE_SQL_EDITOR.sql`** in your project.
- Copy its **entire** contents, paste into the SQL Editor, click **Run**.
- You should see “Success” and no red errors.

This fixes policies for subscription_plans, bookings, users, pets/dogs, sitter_earnings so the app can load data.

---

## 4. Supabase – allow your app URL

- Supabase → **Authentication** → **URL Configuration**
- **Site URL:** your app URL, e.g. `https://petflik.com` or `https://your-site.netlify.app`
- **Redirect URLs:** add (with your real domain):
  - `https://petflik.com/**`
  - `https://your-site.netlify.app/**`
- Save.

---

## 5. Browser – avoid old cache

- Close all tabs of your app.
- Open a **new incognito/private** window.
- Go to your app URL (e.g. petflik.com or the Netlify URL).
- Try login and dashboard.

If it works in incognito but not in a normal tab, do a **hard refresh** on the normal tab (Ctrl+Shift+R or Cmd+Shift+R) or clear site data for that domain.

---

## 6. If it still fails

- In the same Supabase project, open **Settings** → **API** and confirm:
  - **Project URL** is exactly `https://zxbfygofxxmfivddwdqt.supabase.co`
  - **anon public** key matches what you put in Netlify.
- In the browser (on your app page), open **Developer tools** → **Console**.
  - Note any red errors (e.g. 401, 403, “invalid”, “path is invalid”).
- Try from another network (e.g. phone on mobile data) to rule out firewall/DNS blocking Supabase.

Once 1–5 are done and you’ve tested in incognito, the app should either work or show a clear error we can fix next.
