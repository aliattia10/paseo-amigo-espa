# Deploy to Netlify (one-off guide)

Summary: this repo is ready for Netlify. The `netlify.toml` is configured to build with `npm run build` and publish `dist`.

Quick steps (recommended - GitHub integration):

1. Push your latest code to GitHub (already done):

```powershell
git add .
git commit -m "Prepare for Netlify" || echo "no changes"
git push origin main
```

2. In Netlify dashboard: "Add new site" → "Import an existing project" → select GitHub repo.

3. Set build settings:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18

4. Add environment variables (see `netlify-env-vars.txt`). Required:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`

Optional:

- `VITE_API_URL`, `VITE_APP_NAME`, `VITE_APP_DESCRIPTION`, `VITE_APP_URL`

5. Deploy and monitor logs. If you need help, see `NETLIFY_DEPLOYMENT.md` in the repo.

Notes:
- This file is a small quickstart; the repo already contains `netlify.toml` and `NETLIFY_DEPLOYMENT.md` with more details.

