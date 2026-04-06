# Didit ID verification (Petflik)

Petflik integrates **[Didit ID Verification](https://docs.didit.me/core-technology/id-verification/overview)** for enterprise-grade document authentication, OCR/MRZ, liveness, and related checks. The **API key never ships to the browser**; sessions are created by a Supabase Edge Function.

## Architecture

| Piece | Role |
|--------|------|
| `supabase/functions/didit-create-session` | `POST` with user JWT → `POST https://verification.didit.me/v3/session/` → returns `verification_url`, `session_token` |
| `@didit-protocol/sdk-web` | Opens Didit UI (modal) from the returned URL |
| `supabase/functions/didit-webhook` | Receives Didit status updates; updates `public.users` via service role |
| `kyc_service` (optional) | Legacy self-hosted `/verify` flow still available under “Upload documents” |

## One-time setup (Didit Console)

1. Create an account at [Didit Console](https://business.didit.me/).
2. Create a **Workflow** (e.g. KYC template) and copy **Workflow ID**.
3. Create **API Key** and **Webhook secret** (Settings → API & Webhooks).
4. Set webhook URL to your deployed function:  
   `https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/didit-webhook`

## Supabase secrets

```bash
supabase secrets set DIDIT_API_KEY=your_key DIDIT_WORKFLOW_ID=your_workflow_uuid DIDIT_WEBHOOK_SECRET=your_webhook_secret PUBLIC_APP_URL=https://petflik.com
```

Deploy functions:

```bash
supabase functions deploy didit-create-session
supabase functions deploy didit-webhook
```

## Frontend

- **Verify identity** (`/verify-identity`): primary button **Verify with Didit**; legacy upload remains below.
- Callback after redirect: `/verify-identity-done` (configured in create-session as `callback`).

## References

- [ID Verification overview](https://docs.didit.me/core-technology/id-verification/overview)
- [API full flow](https://docs.didit.me/integration/api-full-flow.md)
- [JavaScript SDK](https://docs.didit.me/integration/web-sdks/javascript-sdk.md)
- [Verification statuses](https://docs.didit.me/integration/verification-statuses.md)
