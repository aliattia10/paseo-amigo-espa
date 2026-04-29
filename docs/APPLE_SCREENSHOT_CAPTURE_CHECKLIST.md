# Apple App Store Screenshot Capture Checklist (Paseo)

Use this to capture all required screenshots in one pass.

## 1) Device targets and image specs

Capture at least one full set for iPhone. Recommended:

- iPhone 6.9" display class (e.g. iPhone 15 Pro Max)
- iPhone 6.7" display class (optional fallback if your primary set is 6.9")

General rules:

- Portrait orientation unless a feature truly requires landscape.
- No status bar glitches (time/battery/signal should look normal).
- Keep language consistent across all shots (prefer English for first submission unless your primary locale is Spanish).
- Use realistic demo data only (no placeholders like "Test User 123").

## 2) Pre-capture setup (must do first)

- [ ] Use production-like build and styling.
- [ ] Log in with clean demo accounts (owner + sitter, if needed).
- [ ] Remove debug banners, test badges, and unfinished feature flags from visible UI.
- [ ] Ensure legal links and support email are correct in app (`info@petflik.com`).
- [ ] Prepare stable sample bookings/messages so every screenshot is easy to understand.

## 3) Suggested screenshot sequence (iPhone)

Capture in this order to tell a coherent story:

1. **App Landing (simple swipe style)**  
   Screen: `/app-home`  
   Goal: immediately communicate "swipe + pet care matching".

2. **Sign In / Sign Up entry**  
   Screen: auth page  
   Goal: show secure onboarding access.

3. **Discover / Dashboard**  
   Screen: main owner feed/dashboard  
   Goal: show finding sitters/walkers near user.

4. **Profile or Walker card detail**  
   Screen: sitter profile with rating/reviews  
   Goal: trust and verification proof.

5. **Booking request flow**  
   Screen: booking form or scheduling step  
   Goal: clear "book a walk" action.

6. **Payment step**  
   Screen: checkout/payment page  
   Goal: demonstrate in-app secure payment path.

7. **Messaging/chat**  
   Screen: active owner-sitter chat  
   Goal: coordination and communication.

8. **Notifications or booking confirmation**  
   Screen: booking confirmed/completed state  
   Goal: closure and reliability of flow.

## 4) Optional additional shots (good for conversion)

- Walker onboarding/profile setup
- Reviews and rating modal/page
- Privacy/terms/support access page
- Account settings with account deletion path

## 5) Capture quality checklist (each screenshot)

- [ ] Single clear value proposition per image.
- [ ] No clipped UI, no overlapping modals unless intentional.
- [ ] No personal data from real users.
- [ ] Currency/pricing format matches target market.
- [ ] Same visual theme and branding across all images.

## 6) File naming convention

Use deterministic names so upload is easy:

- `01-app-landing-iphone-69.png`
- `02-auth-iphone-69.png`
- `03-discover-iphone-69.png`
- `04-profile-iphone-69.png`
- `05-booking-iphone-69.png`
- `06-payment-iphone-69.png`
- `07-messaging-iphone-69.png`
- `08-confirmation-iphone-69.png`

If capturing a second device class, duplicate with `iphone-67`.

## 7) Upload checklist in App Store Connect

- [ ] Screenshots uploaded in narrative order.
- [ ] First screenshot communicates core app value instantly.
- [ ] Metadata text (subtitle/description) matches screenshot claims.
- [ ] No mention of unsupported platforms/features.

## 8) Final verification before submission

- [ ] Re-open every uploaded screenshot in preview mode.
- [ ] Confirm no typo in support/legal references.
- [ ] Confirm screenshots reflect current production UX (not outdated UI).
