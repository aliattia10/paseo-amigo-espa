# BlaBlaCar-like Payout Workflow

## Overview
This document describes the payment and payout workflow similar to BlaBlaCar, where payments are held until service completion and review submission.

## Workflow Steps

### 1. Owner Pays
- Owner books service and pays via Stripe
- Payment status: `held` (money held in escrow)
- Booking status: `confirmed`

### 2. Service Completion
- Sitter marks service as complete
- Booking status: `completed`
- `completed_at` timestamp set
- Payment still `held`

### 3. Owner Confirms & Reviews
- Owner confirms service completion
- `completion_confirmed_at` timestamp set
- Owner is prompted to leave a review
- **Payment remains `held` until review is submitted**

### 4. Review Submission → Payment Release
- Owner submits review (rating + optional comment)
- **Automatic trigger**: Payment is released to sitter's balance
- `review_submitted_at` timestamp set
- `balance_released_at` timestamp set
- Payment status: `released`
- Sitter receives notification

### 5. Balance Calculation
- Balance only includes payments that are:
  - Status: `completed`
  - Payment status: `released`
  - Review submitted: `review_submitted_at IS NOT NULL`
  - Balance released: `balance_released_at IS NOT NULL`

### 6. Withdrawal Restriction (2 Weeks)
- Sitters can only withdraw every **2 weeks (14 days)**
- First withdrawal: Can withdraw immediately
- Subsequent withdrawals: Must wait 14 days from last withdrawal
- System tracks:
  - `last_withdrawal_date`: When sitter last requested payout
  - `next_withdrawal_eligible_date`: When next withdrawal is allowed

## Database Functions

### `release_payment_after_review(p_booking_id)`
- Releases payment to sitter balance after review is submitted
- Validates: booking completed, confirmed, payment held, review exists
- Updates payment status to `released`
- Sets `balance_released_at` timestamp

### `get_sitter_available_balance(p_sitter_id)`
- Calculates available balance from released payments with reviews
- Only counts payments that meet all criteria

### `can_sitter_withdraw(p_sitter_id)`
- Checks if sitter can withdraw (2-week restriction)
- Returns: `can_withdraw`, `days_remaining`, `next_eligible_date`

### `update_withdrawal_date(p_sitter_id)`
- Updates last withdrawal date when sitter requests payout
- Sets next eligible date to 14 days from now

## Automatic Trigger

A database trigger automatically releases payment when a review is submitted:

```sql
CREATE TRIGGER release_payment_on_review
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_release_payment_on_review();
```

This ensures payment is released immediately after review submission.

## User Experience

### For Pet Owners:
1. Pay for service → Payment held
2. Service completed → Confirm completion
3. **Submit review** → Payment automatically released to sitter
4. See confirmation: "Payment released to sitter's balance"

### For Sitters:
1. Complete service → Wait for owner confirmation
2. Owner confirms → Wait for review
3. **Review submitted** → Payment added to balance
4. Check balance → Only released payments with reviews
5. Request payout → Every 2 weeks maximum
6. See withdrawal restriction if not eligible

## Key Features

✅ **Review Required**: Payment only released after review submission
✅ **Automatic Release**: Trigger-based, no manual intervention needed
✅ **2-Week Restriction**: Sitters can withdraw every 14 days
✅ **Accurate Balance**: Only includes payments with completed reviews
✅ **User-Friendly**: Clear messaging at each step

## Migration

Run the migration file:
```bash
supabase/migrations/20250115_review_based_payout_workflow.sql
```

This adds:
- `review_submitted_at` column to bookings
- `balance_released_at` column to bookings
- `last_withdrawal_date` column to users
- `next_withdrawal_eligible_date` column to users
- All necessary functions and triggers

## Testing Checklist

- [ ] Owner pays → Payment status = `held`
- [ ] Sitter completes service → Status = `completed`
- [ ] Owner confirms → `completion_confirmed_at` set
- [ ] Owner submits review → Payment automatically released
- [ ] Balance calculation includes only released payments with reviews
- [ ] First withdrawal works immediately
- [ ] Second withdrawal blocked for 14 days
- [ ] Withdrawal restriction message shows correctly
- [ ] Balance updates after review submission

