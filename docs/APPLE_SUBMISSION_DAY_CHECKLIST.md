# Apple Submission Day Checklist (Windows -> Mac)

Use this as the final execution sheet on release day.

## A) Windows prep (do first)

## 1. Code + config freeze

- [ ] Pull latest branch and confirm no unintended local edits.
- [ ] Confirm Capacitor config is set for production URL (`CAPACITOR_SERVER_URL`).
- [ ] Confirm legal/support contact is consistent (`info@petflik.com`).

## 2. Validation commands

Run and confirm success:

- [ ] `npm run lint` (repo root)
- [ ] `npm run build` (repo root)
- [ ] `cd backend && npm run lint`
- [ ] `cd backend && npm run build`

## 3. App Store docs completeness

- [ ] Fill `docs/APPLE_REVIEWER_NOTES_TEMPLATE.md` test account credentials.
- [ ] Confirm `docs/APPLE_APP_STORE_METADATA_CHECKLIST.md` fields are complete (subtitle, categories, etc.).
- [ ] Follow `docs/APPLE_SCREENSHOT_CAPTURE_CHECKLIST.md` and prepare final screenshot files.

## 4. Capacitor sync before handoff

- [ ] Run `npm run cap:sync`.
- [ ] Ensure `ios/` changes are present and up to date before moving to Mac.

---

## B) Mac/Xcode finalization

## 5. Native dependencies and project open

- [ ] Install CocoaPods if missing.
- [ ] From repo root: `npx cap sync ios` (on Mac).
- [ ] Open workspace: `ios/App/App.xcworkspace`.

## 6. Signing and identity

- [ ] Set Apple Team and Signing Certificate.
- [ ] Confirm Bundle Identifier matches App Store Connect app.
- [ ] Set Version + Build number for this release.

## 7. iOS compliance strings and capabilities

- [ ] Verify `Info.plist` usage descriptions for all used permissions.
- [ ] Confirm ATT implementation status is accurate (implemented only if tracking is used).
- [ ] Confirm associated domains/deep links (if used) are production-only.

## 8. Archive and upload

- [ ] Select Any iOS Device (Release).
- [ ] Product -> Archive.
- [ ] Validate archive in Organizer.
- [ ] Upload build to App Store Connect.

---

## C) App Store Connect completion

## 9. Build + metadata binding

- [ ] Attach the uploaded build to the app version.
- [ ] Paste finalized reviewer notes from `docs/APPLE_REVIEWER_NOTES_TEMPLATE.md`.
- [ ] Upload screenshots in correct order.
- [ ] Confirm privacy answers match actual data usage.
- [ ] Confirm support/privacy/terms URLs are correct and live.

## 10. Final go/no-go gate

Submit only if ALL are true:

- [ ] Lint/build checks green (frontend + backend).
- [ ] Screenshots and metadata complete.
- [ ] Reviewer test account works.
- [ ] Payment flow and refund contact verified.
- [ ] No unresolved release blockers in runbook.

---

## Quick links

- Runbook: `docs/APPLE_APP_STORE_PUBLISHING_RUNBOOK.md`
- Metadata checklist: `docs/APPLE_APP_STORE_METADATA_CHECKLIST.md`
- Reviewer notes: `docs/APPLE_REVIEWER_NOTES_TEMPLATE.md`
- Screenshot checklist: `docs/APPLE_SCREENSHOT_CAPTURE_CHECKLIST.md`
