# QA Full Audit TODO

Date: 2026-04-07

## Environment
- Codebase: `paseo-amigo-espa` (Petflik)
- Local checks: `npm run build` (pass), `npm run lint` (pass with `--max-warnings 0`; exhaustive-deps / react-refresh export rules off — see `eslint.config.js`)
- Runtime checks: browser-based reports from beta + prior live verification testing
- Mobile viewport target: ~390x844 (iPhone-like), plus desktop

## Prioritized Checklist

### P0 - Critical blockers

- [x] **Dog photos not reliably visible in booking flow**
  - **Repro steps**
    1. Create pet with photo in owner setup.
    2. Open booking request flow and select pet.
  - **Expected**: Pet thumbnail appears in selection card.
  - **Actual**: Some pets render blank / broken image when `image_url` is JSON array string.
  - **Suspected root cause**: Inconsistent `image_url` format handling (`string` URL vs JSON array string) in booking UI.
  - **Affected**: `src/pages/BookingRequestPage.tsx`
  - **Fix applied**: Added `resolvePrimaryPetImage()` to normalize `image_url` values (`JSON array` or `string`) and use a stable `image_preview` field for card thumbnails.
  - **Verification notes**
    - Build check after patch: `npm run build` -> pass.
    - Lint check on changed file -> no errors.

- [ ] **KYC iframe CSP / permissions regressions**
  - **Repro steps**
    1. Click "Verify with Didit" in `/verify-identity`.
  - **Expected**: Didit iframe loads and camera/mic work.
  - **Actual**: Prior failures due to CSP `frame-src` / blocked camera policy.
  - **Suspected root cause**: Missing Didit domains in CSP and restrictive permissions policy.
  - **Affected**: `index.html`, `public/_headers`, `netlify.toml`
  - **Code audit (2026-04-07)**: `frame-src` / `connect-src` include `https://verify.didit.me` and `https://*.didit.me`; Permissions-Policy allows `camera` and `microphone` for `https://verify.didit.me` in all three places. **Production smoke test still required** after deploy.

### P1 - Major issues

- [x] **Pet upload/storage hardening for bucket-policy drift**
  - **Repro steps**
    1. Upload multiple pet photos.
    2. Edit/remove photos.
  - **Expected**: Upload + delete stable across all pet pages.
  - **Actual**: Mixed bucket conventions (`avatars`, `profile-images`) and mixed path handling increased failure risk in some environments.
  - **Suspected root cause**: Legacy migration drift + non-unified storage utility.
  - **Affected**: `TinderPhotoGallery`, `PetEditPage`, storage SQL policies.
  - **Fix applied**:
    - Upload fallback from `avatars` to `profile-images`.
    - Safer storage URL delete parsing in photo gallery.
  - **Verification notes**
    - `npm run build` -> pass after patch.
    - `ReadLints` on changed files -> no errors.

- [ ] **Auth + onboarding full mobile pass**
  - **Repro steps**: Sign up (email/google), confirm redirects, role setup, owner/sitter profile.
  - **Expected**: No dead ends, no stuck loading, forms usable on mobile.
  - **Actual**: Not fully re-run end-to-end in this audit pass yet.
  - **Suspected root cause**: Regression risk from recent auth/KYC updates.
  - **Affected**: `AuthNew`, `AuthCallback`, setup pages.

- [ ] **Messaging + notifications end-to-end consistency**
  - **Repro steps**: Send message, open conversation list, verify unread badge, mark read.
  - **Expected**: Realtime chat and counters stay in sync.
  - **Actual**: Needs full runtime verification with two accounts.
  - **Suspected root cause**: Potential realtime subscription or unread counter drift.
  - **Affected**: `MessagesPage`, `ChatWindow`, `NotificationsPage`, unread hooks.
  - **Fix applied (2026-04-07)**: Notifications use the `read` column only (schema renamed `is_read` → `read`). Selecting/updating `is_read` could fail RPC or silently break unread counts. Updated `useUnreadNotificationCount`, mark-read flows, and list display logic.

### P2 - Minor / hardening

- [x] **Initial UI language aligned with device location (timezone)**
  - **Repro steps**
    1. Clear site data / `localStorage` (no `i18nextLng`).
    2. Open the app from different regions (or change OS timezone).
  - **Expected**: First-load language follows location (timezone / locale), not a random mix of English vs browser.
  - **Actual (before fix)**: `i18n` defaulted to English when `i18nextLng` was missing; detection only read `localStorage`, so behavior differed by machine and prior visits.
  - **Fix applied**: `getInitialLanguage()` uses saved `i18nextLng` when valid; otherwise `detectLanguageFromLocation()` (IANA timezone map, then `navigator.languages`, then locale region). `supportedLngs` aligned with shipped resources (`en`–`pl`).
  - **Affected**: `src/lib/i18n.ts`, `src/contexts/LanguageContext.tsx`

- [ ] **Route guard and deep-link sweep**
  - **Repro steps**: Refresh protected routes (`/verify-identity`, `/bookings`, `/messages`, etc.).
  - **Expected**: Correct guard behavior, no unexpected redirects.
  - **Actual**: No blocker found, but full matrix not completed yet.
  - **Affected**: `App.tsx`, auth context, protected route wrappers.
  - **Code audit (2026-04-07)**: `ProtectedRoute` caps loading at 5s then redirects unauthenticated users to `/auth`; admin routes use `AdminGuard`. Formatting fix on `/admin/payouts` route only.

- [ ] **UX consistency pass**
  - **Repro steps**: mobile interactions on cards, lists, forms, and modals.
  - **Expected**: touch-friendly controls, no overflow clipping.
  - **Actual**: No blocker found in code-level review; requires visual runtime sweep.

## Fix Plan (Execution Order)
1. Fix P0 pet image parsing in booking selection.
2. Re-verify KYC CSP/permissions after latest deploy.
3. Run targeted sanity checks for auth, onboarding, messaging, notifications.
4. Log remaining P1/P2 items if not reproducible in local-only mode.

## Verification Log

- [x] Local build check
  - Command: `npm run build`
  - Result: pass
- [x] Lint diagnostics snapshot
  - Tool: `ReadLints`
  - Result: no issues
- [x] Build check after P0/P1 fixes
  - Command: `npm run build`
  - Result: pass (non-blocking chunk-size warnings only)
- [x] Build check after i18n / location-based default language
  - Command: `npm run build`
  - Result: pass
- [x] ESLint
  - Command: `npm run lint` (`eslint . --max-warnings 0`)
  - Result: pass
- [x] Netlify config
  - Removed placeholder `/api/*` → `your-backend-url.com` redirect (would proxy real traffic to a fake host).
- [ ] Runtime two-account E2E (pending full browser execution matrix)
