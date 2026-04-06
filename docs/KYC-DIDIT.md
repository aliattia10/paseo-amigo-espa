# Didit ID verification (Petflik)

Petflik integrates **[Didit ID Verification](https://docs.didit.me/core-technology/id-verification/overview)** for enterprise-grade document authentication, OCR/MRZ, liveness, and related checks. The **API key never ships to the browser**; sessions are created by a Supabase Edge Function.

## Architecture

| Piece | Role |
|--------|------|
| `supabase/functions/didit-create-session` | `POST` with user JWT → `POST https://verification.didit.me/v3/session/` → Didit returns `url` + `session_token`; function maps to `verification_url` for the SDK |
| `@didit-protocol/sdk-web` | Opens Didit UI (modal) from the returned URL |
| `supabase/functions/didit-webhook` | Receives Didit status updates; updates `public.users` via service role |
| `kyc_service` (optional) | Legacy self-hosted `/verify` flow still available under “Upload documents” |

## One-time setup (Didit Console)

1. Create an account at [Didit Console](https://business.didit.me/).
2. Create a **Workflow** (e.g. KYC template) and copy **Workflow ID**.
3. Create **API Key** and **Webhook secret** (Settings → API & Webhooks).
4. Set webhook URL to your deployed function:  
   `https://zxbfygofxxmfivddwdqt.supabase.co/functions/v1/didit-webhook`

## Supabase secrets

```bash
supabase secrets set DIDIT_API_KEY=your_key DIDIT_WORKFLOW_ID=your_workflow_uuid DIDIT_WEBHOOK_SECRET=your_webhook_secret PUBLIC_APP_URL=https://petflik.com
```

Use **`PUBLIC_APP_URL` = site origin only** (e.g. `https://petflik.com`, no path). The function appends `/verify-identity` for the Didit callback.

Deploy functions:

```bash
supabase functions deploy didit-create-session
supabase functions deploy didit-webhook
```

## Content Security Policy (production)

The Didit web SDK loads **`https://verify.didit.me`** in an iframe. **CSP** must allow `frame-src` and `connect-src` for `https://*.didit.me` (see `index.html`, `netlify.toml`, `public/_headers`). **Permissions-Policy** must allow `camera` and `microphone` for `https://verify.didit.me` (document + ID capture). Redeploy the site after changing headers.

## Frontend

- **Verify identity** (`https://petflik.com/verify-identity`): primary button **Verify with Didit**; legacy upload is under an expandable “Alternative” section.
- **Didit redirect callback** (configured in `didit-create-session` as `callback`): `https://petflik.com/verify-identity` — users return here with query params (`status`, `verificationSessionId`). The route `/verify-identity-done` redirects to `/verify-identity` with the same query string for old links.

## Troubleshooting `502` on `didit-create-session`

The Edge Function returns **502** when [Didit’s create-session API](https://docs.didit.me/integration/api-full-flow.md) responds with an error (wrong key, workflow, or callback). It is **not** a Petflik frontend bug.

1. **Secrets** — In Supabase: **Project Settings → Edge Functions → Secrets**, confirm `DIDIT_API_KEY` and `DIDIT_WORKFLOW_ID` match the **same Application** in [Didit Console](https://business.didit.me/) → **API & Webhooks** (workflow ID must be from **Workflows** for that app). Redeploy after changing secrets:  
   `supabase functions deploy didit-create-session`
2. **Callback URL** — `PUBLIC_APP_URL` should be `https://petflik.com` (no trailing slash). The function sends `callback`: `https://petflik.com/verify-identity`. If Didit or your workflow requires **allowed redirect/callback URLs**, add that exact URL in the Didit Console for the workflow/application.
3. **Read the real error** — After deploying the latest app + function, the verify page toast should show Didit’s message (e.g. `Invalid or missing API key`, `401`). Check **Supabase → Edge Functions → didit-create-session → Logs** for the full Didit response body.

### `You do not have permission to perform this action`

Didit returns this when the **API key is not allowed** to create a session for the given workflow (or the workflow does not belong to the same [Didit Application](https://business.didit.me/) as the key). Fix: copy **Workflow ID** and **API key** from the **same** application in Didit Console; update Supabase secrets and redeploy `didit-create-session`. If it persists, check Didit account/billing or contact [support@didit.me](mailto:support@didit.me).

**Ignore** unrelated browser console noise: `content.js`, `WebAssembly`, `localhost:8081` WebSocket, `MutationObserver` — those come from **Chrome extensions**, not from Petflik.

## References

- [ID Verification overview](https://docs.didit.me/core-technology/id-verification/overview)
- [API full flow](https://docs.didit.me/integration/api-full-flow.md)
- [JavaScript SDK](https://docs.didit.me/integration/web-sdks/javascript-sdk.md)
- [Verification statuses](https://docs.didit.me/integration/verification-statuses.md)
