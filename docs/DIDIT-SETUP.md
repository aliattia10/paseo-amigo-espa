# Didit Identity Verification Setup

This app uses [Didit](https://docs.didit.me/) for the "Verify your identity" flow. To fix **"Temporarily unavailable"** or **400 errors**, configure the following.

## 1. Get Didit credentials

1. Go to **[business.didit.me](https://business.didit.me)** and sign in (or create an account).
2. Create or select an **Application**.
3. Open **API & Webhooks** in the sidebar:
   - Copy your **API Key** (used as `x-api-key` for all verification requests).
   - Copy your **Webhook Secret Key** (to verify webhook signatures).
4. Open **Workflows** in the sidebar:
   - Create a workflow (e.g. **KYC** template) or use an existing one.
   - Copy the **Workflow ID** (UUID).

## 2. Set Supabase secrets

The edge function `create-didit-session` needs these secrets. Set them in the Supabase dashboard or via CLI:

| Secret | Description |
|--------|-------------|
| `DIDIT_API_KEY` | Your API key from Didit Console → API & Webhooks. **Required.** |
| `DIDIT_WORKFLOW_ID` | Workflow UUID from Didit Console → Workflows. **Required.** |
| `DIDIT_CALLBACK_BASE` | Optional. Base URL for redirect after verification (e.g. `https://petflik.com`). If not set, the frontend sends the callback URL. |
| `DIDIT_WEBHOOK_SECRET_KEY` | Optional. For the `didit-webhook` function; from Didit Console → API & Webhooks. |

**Via Supabase Dashboard**

1. Project → **Settings** → **Edge Functions** → **Secrets**.
2. Add:
   - `DIDIT_API_KEY` = your API key
   - `DIDIT_WORKFLOW_ID` = your workflow UUID
   - (Optional) `DIDIT_CALLBACK_BASE` = `https://petflik.com` (or your production URL)
   - (Optional) `DIDIT_WEBHOOK_SECRET_KEY` = webhook secret

**Via CLI**

```bash
supabase secrets set DIDIT_API_KEY=your_api_key_here
supabase secrets set DIDIT_WORKFLOW_ID=your_workflow_uuid_here
supabase secrets set DIDIT_CALLBACK_BASE=https://petflik.com
```

## 3. Configure webhook in Didit (optional)

To get real-time verification status (e.g. Approved/Declined):

1. In Didit Console → **API & Webhooks**, set **Webhook URL** to:
   - `https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/didit-webhook`
2. Ensure the secret matches `DIDIT_WEBHOOK_SECRET_KEY` in Supabase.

## 4. Verify the integration

1. Deploy the edge function (if not already):
   ```bash
   supabase functions deploy create-didit-session
   supabase functions deploy didit-webhook   # optional
   ```
2. In the app, go to **Verify your identity** and click **Start verification**.
3. If you see **Temporarily unavailable** or a 400:
   - Confirm `DIDIT_API_KEY` and `DIDIT_WORKFLOW_ID` are set and correct.
   - In Supabase → Edge Functions → **create-didit-session** → Logs, check the error (e.g. invalid workflow, bad request body).
4. Didit’s Create Session API is **v3**: `POST https://verification.didit.me/v3/session/` with header `x-api-key`. The function uses this; a 400 usually means invalid workflow ID or API key.

## 5. Callback URL

After verification, Didit redirects the user to your **callback** URL with query params `verificationSessionId` and `status` (Approved, Declined, In Review). The app uses:

- **Callback path:** `/verify-identity-done`
- **Full URL:** sent by the frontend as `window.location.origin + '/verify-identity-done'`, or built from `DIDIT_CALLBACK_BASE` + `/verify-identity-done` if that secret is set.

No extra configuration is needed for the callback if you set the secrets above.

## References

- [Didit Quick Start](https://docs.didit.me/getting-started/quick-start)
- [Create Session API (v3)](https://docs.didit.me/sessions-api/create-session)
- [API Authentication](https://docs.didit.me/getting-started/api-authentication)
- [Webhooks](https://docs.didit.me/integration/webhooks)
