# Run KYC service live on petflik.com

The KYC service is **lightweight** (pytesseract + DeepFace Facenet512) and fits **Render free tier (512MB RAM)**.

To use identity verification on **petflik.com**, you need to:

1. **Deploy the KYC Python service** to a public URL.
2. **Set the KYC URL** in your frontend (Netlify) so the site calls that URL.

---

## 1. Deploy the KYC service

The service lives in `kyc_service/` and is containerized with **Docker**. Deploy it to one of:

- **Railway** (recommended: simple, free tier)
- **Render** (free tier; cold starts)
- **Fly.io**
- Any host that runs Docker.

### Option A: Railway

1. Go to [railway.app](https://railway.app) and sign in (e.g. GitHub).
2. **New Project** → **Deploy from GitHub repo**.
3. Select your repo and set the **root directory** to `kyc_service` (or deploy only that folder).
4. Railway will detect the `Dockerfile` and build the image. If you deploy the whole repo, set **Root Directory** to `kyc_service` in the service settings.
5. After deploy, open **Settings** → **Networking** → **Generate Domain**. You’ll get a URL like `https://your-kyc-service.up.railway.app`.
6. Copy that URL; you’ll use it as the KYC API URL below.

### Option B: Render

1. Go to [render.com](https://render.com) → **New** → **Web Service**.
2. Connect the repo and set **Root Directory** to `kyc_service`.
3. **Environment**: Docker.
4. Create the service. Render assigns a URL like `https://your-kyc.onrender.com`.
5. (Optional) On the free tier the service sleeps; the first request may take 30–60 seconds.

### Option C: Your own server (VPS)

On a Linux server with Docker:

```bash
cd kyc_service
docker build -t petflik-kyc .
docker run -d -p 8000:8000 -e PORT=8000 --restart unless-stopped petflik-kyc
```

Put Nginx (or Caddy) in front with HTTPS and a domain (e.g. `kyc.petflik.com`).

---

## 2. Configure petflik.com (Netlify) to use the live KYC URL

1. In **Netlify**: your site → **Site configuration** → **Environment variables**.
2. Add:
   - **Key:** `VITE_KYC_API_URL`
   - **Value:** your KYC service URL **without** a trailing slash, e.g.:
     - Railway: `https://your-kyc-service.up.railway.app`
     - Render: `https://your-kyc.onrender.com`
     - Custom: `https://kyc.petflik.com`
3. **Redeploy** the site so the new build picks up the variable.

The app will then call `VITE_KYC_API_URL/verify` from the browser when users submit documents on petflik.com.

---

## 3. CORS

The KYC service allows all origins (`*`), so requests from `https://petflik.com` and `https://www.petflik.com` are allowed. No extra CORS config is needed.

---

## 4. Optional: subdomain kyc.petflik.com

If you host the KYC service yourself:

1. Point DNS: **kyc.petflik.com** → your server (A/CNAME).
2. Configure HTTPS (e.g. Let’s Encrypt) for `kyc.petflik.com`.
3. Set in Netlify: `VITE_KYC_API_URL=https://kyc.petflik.com`.

---

## Summary

| Step | Where | What |
|------|--------|------|
| Deploy KYC | Railway / Render / your server | Use `kyc_service/Dockerfile`; get public HTTPS URL |
| Set URL | Netlify → Environment variables | `VITE_KYC_API_URL=https://your-kyc-url` |
| Redeploy | Netlify | Trigger a new deploy so the build uses the new env var |

After that, identity verification on petflik.com will use your live KYC service.
