# Simplified Payout System

## Overview

This app now uses a **simplified payout system** instead of Stripe Connect. This approach is perfect for students and individuals who want to earn money without the complexity of Stripe Connect onboarding.

## How It Works

### For Sitters (Service Providers)

1. **Add Payout Method**: Sitters add their PayPal email or bank account details (IBAN) in the app
2. **Complete Services**: Earn money by completing bookings
3. **Request Payout**: When they have available balance, sitters can request a payout
4. **Receive Payment**: Payments are processed manually and sent via PayPal or bank transfer within 2-5 business days

### For Pet Owners (Customers)

1. **Book Service**: Pet owners book services as usual
2. **Pay with Stripe**: Payment is made using standard Stripe checkout (credit/debit card)
3. **Funds Held**: Money is held securely in the platform account until service is completed
4. **Automatic Release**: Once service is marked as completed, funds become available for sitter payout

### For Platform Admin

1. **View Payout Requests**: Access `/admin/payouts` to see pending payout requests
2. **Process Manually**: Transfer funds via PayPal or bank transfer
3. **Mark as Processed**: Update the status in the admin panel

## Technical Implementation

### Database Schema

**Users Table** (added fields):
- `payout_method`: 'paypal' or 'bank'
- `paypal_email`: PayPal email address
- `bank_name`: Bank name
- `iban`: International Bank Account Number
- `account_holder_name`: Full name on bank account

**Payout Requests Table** (new):
- `id`: UUID primary key
- `sitter_id`: Reference to users table
- `amount`: Decimal amount to payout
- `payout_method`: 'paypal' or 'bank'
- `payout_details`: JSON with payout information
- `status`: 'pending', 'processing', 'completed', 'failed'
- `processed_at`: Timestamp when processed
- `created_at`, `updated_at`: Timestamps

**Bookings Table** (added fields):
- `payment_status`: 'pending', 'held', 'released'
- `total_amount`: Total booking amount
- `commission_fee`: Platform commission (20%)

### Payment Flow

1. **Payment Intent Creation** (`create-payment-with-connect`):
   - Creates standard Stripe payment intent
   - Money goes to platform Stripe account
   - Calculates platform fee (20%) and sitter amount (80%)
   - Saves payment record in database

2. **Payment Capture** (`capture-payment`):
   - Verifies payment was successful
   - Updates booking `payment_status` to 'held'
   - Funds remain in platform account

3. **Service Completion**:
   - When booking is marked as 'completed'
   - Sitter's balance is updated
   - Sitter can request payout

4. **Payout Processing** (`process-sitter-payout`):
   - Admin reviews payout request
   - Processes payment via PayPal or bank transfer
   - Marks request as 'completed'
   - Updates booking `payment_status` to 'released'

### Key Components

**Frontend**:
- `PayoutMethodsPage.tsx`: Sitters manage payout methods and request payouts
- `AdminPayoutsPage.tsx`: Admin panel to process payout requests
- `PayoutSetupBanner.tsx`: Banner prompting sitters to add payout method

**Backend Functions**:
- `create-payment-with-connect`: Creates payment intent (simplified, no Connect)
- `capture-payment`: Marks payment as held
- `process-sitter-payout`: Processes payout requests

### Migration from Stripe Connect

If you were previously using Stripe Connect:

1. Run the migration: `supabase/migrations/20241106_add_payout_system.sql`
2. Old Stripe Connect accounts are no longer needed
3. Sitters need to add their payout method in the new system
4. Existing bookings continue to work

## Advantages

✅ **Simple Setup**: No complex Stripe Connect onboarding
✅ **Student-Friendly**: Perfect for students and individuals
✅ **Flexible**: Support both PayPal and bank transfers
✅ **Lower Fees**: No Stripe Connect fees
✅ **Full Control**: Platform controls when payouts happen
✅ **Privacy**: Sitters don't need to share sensitive documents

## Disadvantages

⚠️ **Manual Processing**: Admin must manually process payouts
⚠️ **Delayed Payouts**: 2-5 business days instead of automatic
⚠️ **Scalability**: May not scale well with high volume
⚠️ **Compliance**: Platform holds funds (may require money transmitter license in some jurisdictions)

## Future Enhancements

- **Automated PayPal Payouts**: Integrate PayPal Payouts API for automatic transfers
- **Stripe Transfers**: Use Stripe Transfers API for bank payouts
- **Scheduled Payouts**: Automatic weekly/monthly payout schedules
- **Payout History**: Track all past payouts
- **Tax Documents**: Generate 1099/tax forms for sitters

## Security Considerations

- All payout information is encrypted in the database
- RLS policies ensure sitters can only see their own data
- Admin access should be properly secured
- Consider PCI compliance for handling payment data
- Implement fraud detection for payout requests

## Support

For questions or issues with the payout system:
1. Check the admin panel at `/admin/payouts`
2. Review payout request status
3. Contact platform support for manual processing

---

**Note**: This is a simplified system suitable for small to medium platforms. For large-scale operations, consider implementing Stripe Connect or a similar automated solution.
