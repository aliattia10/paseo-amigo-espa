# Didit Identity Verification – Step-by-Step Guide

This guide walks you through integrating Didit KYC into **paseo-amigo-espa** so users verify their identity when creating an account.

---

## Overview

1. **Didit Console** – Create workflow, get API key, set webhook URL and secret.
2. **Supabase** – Deploy the webhook Edge Function and set the webhook secret.
3. **Backend** – Create a session (via Didit API or an Edge Function) and return the verification URL.
4. **Frontend** – After signup (or before), get the session URL and open Didit with the Web SDK using your vendor data.

---

## Step 1: Didit account and workflow

1. Go to [Didit Business Console](https://business.didit.me) and sign in.
2. Create or select your **Application**.
3. In the sidebar, open **Workflows**.
4. Create a workflow or use an existing one (e.g. **Custom KYC**).
5. Note your **Workflow ID** (you’ll need it when creating sessions).

---

## Step 2: Get API credentials

1. In Didit Console, go to **API & Webhooks** (or **Get Application Credentials** in the docs).
2. Copy:
   - **API Key** (or `x-api-key`) – used to call Create Session and other APIs.
   - Keep it secret; use it only from your backend or Edge Function.

---

## Step 3: Configure the webhook in Didit

1. Still in **API & Webhooks**, find **Webhook URL**.
2. Set it to your Supabase Edge Function URL:
   ```text
   https://zxbfygofxxmfivddwdqt.supabase.co/functions/v1/didit-webhook
   ```
   Replace `<YOUR_PROJECT_REF>` with your Supabase project reference (e.g. from Project Settings → API).
3. Copy the **Webhook Secret Key** – you’ll add it to Supabase in the next step.
4. Save.

---

## Step 4: Deploy the webhook and set the secret in Supabase

1. In your project root, deploy the Didit webhook function:
   ```bash
   supabase functions deploy didit-webhook
   ```
2. In **Supabase Dashboard** → **Edge Functions** → select `didit-webhook` → **Secrets** (or Project Settings → Edge Functions → Secrets).
3. Add a secret:
   - **Name:** `DIDIT_WEBHOOK_SECRET_KEY`
   - **Value:** the Webhook Secret Key from Didit Console (Step 3).
4. Redeploy if needed so the function picks up the new secret:
   ```bash
   supabase functions deploy didit-webhook
   ```

The webhook will:
- Verify the request signature (when the secret is set).
- Parse `vendor_data` (JSON string) and on status **Approved** set `users.verified = true` for the `user_id` in vendor data.

---

## Step 5: Create a Didit session (backend) — done in code

The project includes a Supabase Edge Function **`create-didit-session`** that:

- Reads the current user from the `Authorization` header.
- Gets `userType` from the request body (defaults to `owner`).
- Builds `vendor_data` and calls Didit’s Create Session API.
- Returns `{ url, session_id }` to the frontend.

**You need to:**

1. **Set Edge Function secrets** in Supabase (Dashboard → Edge Functions → create-didit-session → Secrets, or Project Settings → Edge Functions → Secrets):
   - **`DIDIT_API_KEY`** – your Didit API key (from Didit Console → API & Webhooks).
   - **`DIDIT_WORKFLOW_ID`** – your workflow ID (from Didit Console → Workflows).

2. **Deploy the function:**
   ```bash
   supabase functions deploy create-didit-session
   ```

The frontend calls it with `supabase.functions.invoke('create-didit-session', { body: { userType } })` and uses the returned `url` with the Didit Web SDK.

---

## Step 6: Vendor data – what to send

When creating a session, **vendor_data must be a string** (e.g. JSON string).

- **Verify after signup (recommended):**  
  Send the Supabase Auth user id and role so the webhook can set `users.verified = true`:
  ```ts
  import { getDiditVendorDataString } from '@/lib/didit-vendor-data';

  const vendorDataString = getDiditVendorDataString({
    userId: currentUser.id,
    userType: userProfile.userType, // 'owner' | 'walker'
  });
  ```
  Use this string as `vendor_data` in the Create Session request.

- **Verify before account exists:**  
  Use `email` and `signupSessionId` (and optionally `userType`) in `getDiditVendorDataForSignup`, then `JSON.stringify` that object (or use `getDiditVendorDataString` with the same options) as `vendor_data`.

---

## Step 7: Frontend – Web SDK and flow (done in code)

The app already includes:

1. **`@didit-protocol/sdk-web`** – installed.
2. **`/verify-identity` page** (`src/pages/VerifyIdentityPage.tsx`):
   - Calls `create-didit-session` with the current user’s `userType`.
   - Opens Didit with `DiditSdk.shared.startVerification({ url })`.
   - On completion, refreshes the profile and redirects to the dashboard.
   - “Skip for now” sends the user to profile setup or dashboard.
3. **Dashboard banner** – On the main dashboard (NewHomePage), if the user is not verified (`userProfile.verified === false`), a banner appears with a “Verify” button that goes to `/verify-identity`.

You can also send users to `/verify-identity` right after signup (e.g. redirect there from the auth flow) so they see the verify step before profile setup.

---

## Step 8: When to trigger verification

- **After signup (recommended):**  
  Right after the user signs up and you have `currentUser.id` and profile (e.g. `userType`), call your “create Didit session” endpoint with that user and type, then open the Web SDK with the returned URL. Vendor data will contain `user_id` and `user_type`; when Didit sends **Approved** to your webhook, the handler sets `users.verified = true` for that `user_id`.

- **Before signup:**  
  Create the session with `email` and `signup_session_id` (and optional `user_type`). After Didit approves, your webhook can store the result for that `signup_session_id`; when the user completes signup, you can mark them verified using that stored result.

---

## Step 9: Testing

1. **Webhook:** In Didit Console → API & Webhooks, use **Try Webhook** to send a test event to your `didit-webhook` URL. Check Supabase Edge Function logs to confirm it receives the payload and, for a test payload with `status: "Approved"` and `vendor_data` containing a valid `user_id`, that it updates the user.
2. **End-to-end:** Sign up a test user, trigger “Verify identity” (or your post-signup flow), complete Didit verification, and confirm the user’s row in `users` has `verified = true` after Didit sends the webhook.

---

## Checklist

- [ ] Didit workflow created; Workflow ID noted.
- [ ] Didit API key and Webhook Secret Key copied from Console.
- [ ] Webhook URL in Didit set to `https://<PROJECT_REF>.supabase.co/functions/v1/didit-webhook`.
- [ ] `didit-webhook` deployed; `DIDIT_WEBHOOK_SECRET_KEY` set in Supabase.
- [ ] `create-didit-session` deployed; `DIDIT_API_KEY` and `DIDIT_WORKFLOW_ID` set in Supabase.
- [ ] Frontend: `/verify-identity` page and dashboard banner (when not verified) are in place.
- [ ] Test webhook and one full verification flow; confirm `users.verified` updates.

---

## Files in this project

| File | Purpose |
|------|--------|
| `src/lib/didit-vendor-data.ts` | Builds vendor data object and string for Create Session. |
| `supabase/functions/didit-webhook/index.ts` | Receives Didit webhooks, verifies signature, parses `vendor_data`, sets `users.verified` on Approved. |
| `supabase/functions/create-didit-session/index.ts` | Creates a Didit session and returns the verification URL; requires `DIDIT_API_KEY` and `DIDIT_WORKFLOW_ID`. |
| `src/pages/VerifyIdentityPage.tsx` | Page that starts Didit verification (calls create-didit-session, then opens Web SDK); "Skip for now" goes to profile setup or dashboard. |
| Dashboard (NewHomePage) | Shows a "Verify your identity" banner when `userProfile.verified === false`; button links to `/verify-identity`. |

---

## References

- [Didit docs index](https://docs.didit.me/llms.txt)
- [Create Session API](https://docs.didit.me/sessions-api/create-session.md)
- [Webhooks](https://docs.didit.me/integration/webhooks.md)
- [JavaScript / Web SDK](https://docs.didit.me/integration/web-sdks/javascript-sdk.md)
