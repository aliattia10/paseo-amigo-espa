# Apple App Store Publishing Runbook (Paseo)

This runbook tracks the end-to-end work needed to publish this project to the Apple App Store from a web-first codebase.

## 0) What this repo is today

- Frontend: Vite + React web app.
- Deployment style: static hosting (Netlify-style).
- Current gap: iOS project scaffold exists, but release-signing and App Store metadata are not configured yet.

To ship on App Store, add a native shell (recommended: Capacitor) and complete iOS compliance + App Store Connect metadata.

## 1) Execution checklist

## Phase 1 - Production baseline

- [x] Frontend `npm run lint` passes.
- [x] Frontend `npm run build` passes.
- [x] Backend `npm run lint` (inside `backend/`) passes.
- [x] Backend `npm run build` (inside `backend/`) passes.
- [ ] No secrets committed (especially old env dump files).
- [ ] Production Supabase and Stripe live key strategy documented.
- [ ] Only migration-driven DB changes (`supabase/migrations/` + `supabase db push`).
- [ ] Production URLs finalized:
  - [ ] App URL
  - [ ] Privacy Policy URL
  - [ ] Terms URL
  - [ ] Support URL

## Phase 2 - Native shell (Capacitor iOS)

- [x] Add Capacitor dependencies and config.
- [x] Initialize Capacitor app metadata:
  - [x] `appId` (bundle identifier)
  - [x] `appName`
  - [x] web loading strategy (`server.url` for hosted web app or bundled assets)
- [x] Add iOS platform (`npx cap add ios`).
- [ ] Open and verify iOS project in Xcode.
- [ ] Configure signing team, bundle ID, version, build number.

## Phase 3 - iOS compliance and policy

- [ ] Add all required iOS permission usage descriptions (`Info.plist`).
- [ ] Confirm ATT requirement:
  - [ ] If tracking exists, implement ATT prompt and disclose.
  - [ ] If no tracking, do not request ATT.
- [ ] Align in-app legal links with submitted URLs (Privacy/Terms).
- [x] Payment disclosures clear for bookings/subscriptions.
- [x] Support/refund/contact path visible and documented.
- [x] Account deletion flow available (in-app or documented path).

## Phase 4 - Assets and App Store Connect metadata

- [ ] App icons complete for iOS requirements.
- [ ] Splash/launch visuals aligned with app branding.
- [ ] Screenshots prepared for required device classes.
- [ ] App description, subtitle, keywords finalized.
- [ ] App Privacy questionnaire answers match real behavior.
- [ ] Age rating and content declarations complete.
- [x] Reviewer notes drafted (test account + purchase flow).

## Phase 5 - Final QA and go/no-go

- [ ] Test on real iOS device(s), not simulator only.
- [ ] Auth and session persistence verified.
- [ ] Booking flow verified end-to-end.
- [ ] Stripe payment flow verified in production-safe setup.
- [ ] Deep links/OAuth redirects verified on production domain.
- [ ] Error states and network failures handled gracefully.
- [ ] Release checklist signed off.

## 2) Suggested first implementation commands

Run these in order once ready:

```bash
# repo root
npm run lint
npm run build

# backend checks
cd backend
npm run lint
npm run build
```

Then bootstrap iOS shell:

```bash
# repo root
npm i @capacitor/core@^7 @capacitor/cli@^7 @capacitor/ios@^7
npx cap init "Paseo" "es.paseo.app" --web-dir=dist
npx cap add ios
npx cap sync ios
```

> Note: set `CAPACITOR_SERVER_URL` in release environment to your canonical HTTPS production URL.

## 3) Evidence log (fill as you execute)

Use this section to store proof for each completed item.

- Date:
- Step:
- Evidence (command output, screenshot name, App Store Connect field, etc.):
- Owner:
- Next action:

- Date: 2026-04-29
- Step: Phase 1 baseline command checks
- Evidence: `npm run lint` and `npm run build` passed at repo root; `npm run lint` and `npm run build` passed in `backend/`.
- Owner: Release execution
- Next action: Finish remaining Phase 1 production baseline items, then start Capacitor bootstrap (Phase 2).

- Date: 2026-04-29
- Step: Phase 2 Capacitor iOS bootstrap
- Evidence: Installed `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios` (v7), generated `capacitor.config.ts`, added `ios/` via `npx cap add ios`, and verified `npx cap sync ios` success.
- Owner: Release execution
- Next action: Open `ios/App/App.xcworkspace` on macOS, configure signing/versioning, and complete iOS compliance metadata.

- Date: 2026-04-29
- Step: Phase 3 policy/compliance prep
- Evidence: Updated legal/support messaging in `src/pages/ContactPage.tsx`, `src/pages/PrivacyPolicyPage.tsx`, `src/pages/TermsPage.tsx`, and `src/pages/RefundPolicyPage.tsx`; added `docs/APPLE_APP_STORE_METADATA_CHECKLIST.md` and `docs/APPLE_REVIEWER_NOTES_TEMPLATE.md`.
- Owner: Release execution
- Next action: Finalize canonical production legal/support URLs and complete ATT/privacy questionnaire decisions in App Store Connect.

- Date: 2026-04-29
- Step: Footer links/pages completion + web/app landing split
- Evidence: Added routes and pages for `/careers`, `/for-owners`, `/for-sitters`, `/how-it-works`, `/pricing`, and `/app-home`; updated Geneva footer links to route to real pages; changed footer email to `info@petflik.com`; verified route map and ran `npm run lint` + `npm run build` successfully.
- Owner: Release execution
- Next action: Fill final production URLs and capture iOS screenshot assets for App Store Connect.

- Date: 2026-04-29
- Step: Remove Stripe Connect payout onboarding from user flow
- Evidence: `/payout-methods` now routes to `PayoutMethodsPage`; `/payout-setup` redirects to `/payout-methods`; payout banner checks stored payout details from `users` table; payout method UI now collects direct bank details without Stripe Connect onboarding.
- Owner: Release execution
- Next action: Choose compliant processor strategy for direct card payouts (provider-hosted, PCI-safe) before adding any card PAN collection UI.

## 4) Blockers

- [ ] Frontend build produces a large chunk warning (`dist/assets/index-*.js` > 500 kB). Decide whether to split further before submission to reduce startup/perf risk.
- [ ] Native iOS finalization requires macOS tooling (`xcodebuild`/CocoaPods are not available on this Windows machine).
- [ ] Test account credentials are still missing in reviewer notes template.
- [ ] Phase 4 visual assets still pending (final icon set, launch/splash assets, App Store screenshots).

## 5) Phase 4 execution assets

- Screenshot capture runbook: `docs/APPLE_SCREENSHOT_CAPTURE_CHECKLIST.md`
- Metadata checklist: `docs/APPLE_APP_STORE_METADATA_CHECKLIST.md`
- Reviewer notes template: `docs/APPLE_REVIEWER_NOTES_TEMPLATE.md`
- Submission-day checklist: `docs/APPLE_SUBMISSION_DAY_CHECKLIST.md`
