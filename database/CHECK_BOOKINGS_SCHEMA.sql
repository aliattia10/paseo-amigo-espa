-- Check if bookings table has the required Stripe fields
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
AND column_name IN (
    'stripe_payment_intent_id',
    'payment_status',
    'commission_fee',
    'refund_reason',
    'refunded_at',
    'cancellation_reason',
    'sitter_id',
    'owner_id'
)
ORDER BY column_name;

-- Also check if stripe_connect_accounts table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'stripe_connect_accounts'
) as stripe_connect_accounts_exists;

-- Check if payments table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'payments'
) as payments_table_exists;
