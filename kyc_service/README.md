# KYC Verification Service (Lightweight)

Optimized for **Render free tier (512MB RAM)**:
- **OCR:** pytesseract (Tesseract) instead of EasyOCR to reduce memory.
- **Face:** DeepFace with **Facenet512** (lighter than VGG-Face).
- **Passport:** passporteye / mrz for MRZ.

Default port **8002** locally to avoid conflicts with 8000/8001.

## Run

```bash
# Install (once)
py -m pip install -r requirements.txt

# Start on port 8002 (default)
py -m uvicorn main:app --host 0.0.0.0 --port 8002
```

Or use the script (same default 8002):

```powershell
.\run.ps1
```

If you see `[winerror 10048] only one usage of each socket address`, the port is in use. Use another port:

```powershell
# PowerShell
$env:KYC_PORT="8003"; py -m uvicorn main:app --host 0.0.0.0 --port 8003
```

Then in the app `.env`: `VITE_KYC_API_URL=http://localhost:8003` and (for dev proxy): `VITE_KYC_PROXY_TARGET=http://127.0.0.1:8003`.

## Vite proxy (local dev)

The frontend dev server proxies `/api/python/*` to `http://127.0.0.1:8002` (or `VITE_KYC_PROXY_TARGET`). Run the KYC service on that port when using the app in development.

## Run live on petflik.com

To use this service in production, deploy the `kyc_service/` folder (Docker) to Railway, Render, or your own server, then set **VITE_KYC_API_URL** in Netlify to the public KYC URL. See **[../docs/KYC-DEPLOY-LIVE.md](../docs/KYC-DEPLOY-LIVE.md)** for step-by-step instructions.
