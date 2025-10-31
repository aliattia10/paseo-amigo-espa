# Fix: Edge Function Non-2xx Status Code Error

## Problem
The edge functions (`capture-payment` and `refund-payment`) were returning 400 errors because:
1. The `bookings` table was missing Stripe payment fields
2. Bookings were created without payment intents
3. The functions didn't handle cases where no payment was made yet

## Solution Applied

### 1. Database Migration
Created `database/add_stripe_fields_to_bookings.sql` to add missing fields:
- `stripe_payment_intent_id` - Stores Stripe payment intent ID
- `payment_status` - Tracks payment state (pending, held, released, refunded, failed)
- `commission_fee` - Platform commission amount
- `refund_reason` - Reason for refund
- `refunded_at` - Timestamp of refund
- `cancellation_reason` - Reason for cancellation

**Action Required:** Run this SQL in your Supabase SQL Editor

### 2. Updated Edge Functions
Both edge functions now handle missing payment intents gracefully:

**capture-payment:**
- Checks if payment intent exists before attempting capture
- Returns clear error message if no payment was made
- Prevents duplicate releases

**refund-payment:**
- Handles bookings without payment intents
- Simply cancels the booking if no payment was made
- Only processes Stripe refund if payment exists

### 3. Updated Booking Creation
Modified `BookingRequestPage.tsx` to set `payment_status: 'pending'` when creating bookings.

## How It Works Now

1. **Booking Request:** User creates booking with status `requested` and payment_status `pending`
2. **Sitter Accepts:** Sitter accepts the booking (payment intent should be created here)
3. **Service Complete:** Owner can release payment (capture-payment function)
4. **Cancellation:** Either party can cancel (refund-payment function handles with/without payment)

## Next Steps

### Immediate (Required)
1. Run the database migration in Supabase
2. Deploy the updated edge functions:
   ```bash
   supabase functions deploy capture-payment
   supabase functions deploy refund-payment
   ```

### Future Enhancement (Recommended)
Add payment intent creation when sitter accepts booking:
- Create a new edge function or update existing accept logic
- Call `create-payment-with-connect` when booking is accepted
- Store the payment intent ID in the booking record
- This enables the full payment flow: request → accept → pay → complete → release

## Testing
After deploying:
1. Create a test booking
2. Try to cancel it - should work without errors
3. Try to release payment - should show clear error about no payment
4. Once payment flow is added, test the full cycle
