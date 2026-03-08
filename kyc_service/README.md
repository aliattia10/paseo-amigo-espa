# KYC Verification Service

FastAPI service for ID/passport verification (DeepFace + EasyOCR/MRZ). Runs on **port 8001** by default to avoid conflicts with other tools on 8000.

## Run

```bash
# Install (once)
py -m pip install -r requirements.txt

# Start on port 8001 (default; use this to avoid "port already in use")
py -m uvicorn main:app --host 0.0.0.0 --port 8001
```

If you see `[winerror 10048] only one usage of each socket address`, port 8001 is also in use. Then run on another port, e.g.:

```bash
py -m uvicorn main:app --host 0.0.0.0 --port 8002
```

and set in the app `.env`: `VITE_KYC_API_URL=http://localhost:8002` (so production/build can reach it; in dev the Vite proxy uses 8001).

## Vite proxy

The frontend dev server proxies `/api/python/*` to `http://127.0.0.1:8001`. Ensure the KYC service is running on **8001** when using the app in development.
