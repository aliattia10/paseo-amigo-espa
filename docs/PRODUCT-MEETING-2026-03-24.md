# Petflik — meeting notes (Mar 24, 2026)

Internal reference; align product and legal copy with `src/pages/TermsPage.tsx`.

## Product & trust

- Swipe-based discovery (owners ↔ sitters), **EN / ES / FR**.
- Trust: location, rates, availability, **reviews**, ratings, filters (distance, pet type, rating, price).
- **Identity verification**: Didit ID verification integrated for KYC; legacy self-hosted flow optional.

## Payments & bookings

- Payment **held** until service completion; release after **owner review** (aligns with escrow / Stripe manual capture).
- **Cancellation**: owner cancelling within **4 hours** of start may owe the sitter a **minimum billable duration** (policy wording in Terms).
- **No-show**: if sitter does not show, owner is refunded; sitter not paid.

## Communication

- **In-app messaging** after match; arrangements should stay on-platform for safety and dispute handling.

## Terms of service (legal)

- **Vet costs**: owner is responsible for reimbursing the sitter for **necessary, non-negligent** veterinary costs when agreed / documented (see Terms page).
- **Circumvention**: monitor for abuse (e.g. many contacts, no bookings); possible warnings / restrictions.

## Referrals

- Referral / ambassador discount (e.g. **5%** on up to **10 hours**) — see booking flow and marketing copy.

## Suggested follow-ups (from discussion)

- **15-minute** reminder before booking (notification).
- **Multi-category reviews** (e.g. pet match, communication, service).
- Sitter notes on pets (in addition to owner-provided info).

## Marketing

- Younger/working: **social media**.
- Older demographics: **flyers**, pet shops, care homes that allow pets.

## Expansion

- Future: other species (e.g. horses) would need different sitter vetting.
