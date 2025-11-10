# Payout System Database Setup

## Overview
The payout information from `/payout-methods` page is saved to **Supabase** in the `users` table.

## Database Structure

### Users Table Columns
The following columns store payout information:

| Column Name | Type | Description |
|------------|------|-------------|
| `payout_method` | TEXT | Either 'paypal' or 'bank' |
| `paypal_email` | TEXT | PayPal email address |
| `bank_name` | TEXT | Bank name (e.g., Santander, BBVA) |
| `iban` | TEXT | IBAN for SEPA transfers |
| `account_holder_name` | TEXT | Full name of account holder |

### Payout Requests Table
When sitters request a payout, a record is created in `payout_requests`:

| Column Name | Type | Description |
|------------|------|-------------|
| `id` | UUID | Primary key |
| `sitter_id` | UUID | Reference to users table |
| `amount` | DECIMAL | Payout amount |
| `payout_method` | TEXT | paypal or bank |
| `payout_details` | TEXT | Email or bank details |
| `status` | TEXT | pending, processing, completed, failed |
| `created_at` | TIMESTAMP | Request creation time |
| `processed_at` | TIMESTAMP | When admin processed it |

## Setup Instructions

### Step 1: Run the Migration
Go to your Supabase SQL Editor and run:

```sql
-- Add payout-related columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS payout_method TEXT CHECK (payout_method IN ('paypal', 'bank')),
ADD COLUMN IF NOT EXISTS paypal_email TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS iban TEXT,
ADD COLUMN IF NOT EXISTS account_holder_name TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_payout_method ON users(payout_method);

-- Add comment for documentation
COMMENT ON COLUMN users.payout_method IS 'Preferred payout method: paypal or bank';
COMMENT ON COLUMN users.paypal_email IS 'PayPal email address for payouts';
COMMENT ON COLUMN users.bank_name IS 'Bank name for SEPA transfers';
COMMENT ON COLUMN users.iban IS 'IBAN for bank transfers';
COMMENT ON COLUMN users.account_holder_name IS 'Name of the bank account holder';
```

### Step 2: Verify the Columns
Check that the columns were added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('payout_method', 'paypal_email', 'bank_name', 'iban', 'account_holder_name');
```

### Step 3: Test the Payout Page
1. Go to https://petflik.com/payout-methods
2. Select PayPal or Bank Transfer
3. Fill in the details
4. Click "Save Changes"
5. Check Supabase to see the data saved

## How It Works

### Saving Payout Information
When a user saves their payout method:

```typescript
const { error } = await supabase
  .from('users')
  .update({
    payout_method: 'paypal', // or 'bank'
    paypal_email: 'user@example.com', // if PayPal
    bank_name: 'Santander', // if bank
    iban: 'ES91...', // if bank
    account_holder_name: 'John Doe', // if bank
  })
  .eq('id', currentUser.id);
```

### Loading Payout Information
When the page loads:

```typescript
const { data: userData } = await supabase
  .from('users')
  .select('payout_method, paypal_email, bank_name, iban, account_holder_name')
  .eq('id', currentUser.id)
  .single();
```

### Requesting a Payout
When a sitter requests a payout:

```typescript
const { error } = await supabase
  .from('payout_requests')
  .insert({
    sitter_id: currentUser.id,
    amount: balance,
    payout_method: payoutMethod,
    payout_details: payoutMethod === 'paypal' 
      ? formData.paypalEmail 
      : `${formData.bankName} - ${formData.iban}`,
    status: 'pending',
  });
```

## Viewing Saved Data

### Check User's Payout Info
```sql
SELECT 
  id,
  name,
  email,
  payout_method,
  paypal_email,
  bank_name,
  iban,
  account_holder_name
FROM users
WHERE payout_method IS NOT NULL;
```

### Check Payout Requests
```sql
SELECT 
  pr.*,
  u.name as sitter_name,
  u.email as sitter_email
FROM payout_requests pr
JOIN users u ON pr.sitter_id = u.id
ORDER BY pr.created_at DESC;
```

## Security Notes

1. **Encryption**: Sensitive data like IBAN is stored in plain text. Consider encrypting in production.
2. **Access Control**: Only the user can view/edit their own payout info.
3. **Admin Access**: Only admins can see payout requests via `/admin/payouts`.
4. **Validation**: The form validates email format and required fields before saving.

## Troubleshooting

### Data Not Saving?
1. Check if columns exist: Run the migration above
2. Check browser console for errors
3. Verify user is authenticated
4. Check Supabase logs for errors

### Can't See Saved Data?
1. Refresh the page
2. Check Supabase Table Editor
3. Run the SELECT query above
4. Check if user ID matches

### Payout Requests Not Showing?
1. Check if `payout_requests` table exists
2. Run the payout system migration
3. Check admin page at `/admin/payouts`
