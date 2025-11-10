# Admin Payout Page Setup Guide

## Overview
The admin payout page at `/admin/payouts` displays all pending payout requests from sitters and allows you to process them manually.

## Database Tables Required

### 1. Users Table (with payout columns)
Already exists, just needs these columns added:
- `payout_method` - 'paypal' or 'bank'
- `paypal_email` - PayPal email
- `bank_name` - Bank name
- `iban` - IBAN number
- `account_holder_name` - Account holder name

### 2. Payout Requests Table
Stores all payout requests from sitters:

```sql
CREATE TABLE payout_requests (
  id UUID PRIMARY KEY,
  sitter_id UUID REFERENCES users(id),
  amount DECIMAL(10, 2),
  payout_method TEXT,
  payout_details TEXT,
  status TEXT, -- 'pending', 'processing', 'completed', 'failed'
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## Complete Setup Instructions

### Step 1: Run the Main Migration
Go to Supabase SQL Editor and run:

```sql
-- Add payout fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS payout_method TEXT CHECK (payout_method IN ('paypal', 'bank'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS paypal_email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS iban TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_holder_name TEXT;

-- Create payout_requests table
CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payout_method TEXT NOT NULL CHECK (payout_method IN ('paypal', 'bank')),
  payout_details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payout_requests_sitter_id ON payout_requests(sitter_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_created_at ON payout_requests(created_at DESC);

-- Add RLS policies for payout_requests
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

-- Sitters can view their own payout requests
CREATE POLICY "Sitters can view own payout requests"
  ON payout_requests FOR SELECT
  USING (auth.uid() = sitter_id);

-- Sitters can create their own payout requests
CREATE POLICY "Sitters can create own payout requests"
  ON payout_requests FOR INSERT
  WITH CHECK (auth.uid() = sitter_id);
```

### Step 2: Verify Tables Exist

```sql
-- Check users table has payout columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('payout_method', 'paypal_email', 'bank_name', 'iban', 'account_holder_name');

-- Check payout_requests table exists
SELECT * FROM payout_requests LIMIT 1;
```

### Step 3: Access Admin Page

1. Go to: `https://petflik.com/admin/payouts`
2. Login with credentials:
   - **Username**: `admin`
   - **Password**: `aliattiapetflik*10`
3. You'll see all pending payout requests

## How It Works

### Sitter Flow:
1. Sitter goes to `/payout-methods`
2. Adds PayPal email or bank details
3. Data saves to `users` table
4. When they have earnings, clicks "Request Payout"
5. Creates record in `payout_requests` table with status 'pending'

### Admin Flow:
1. Admin goes to `/admin/payouts`
2. Sees all pending requests with sitter info
3. For each request, sees:
   - Sitter name and email
   - Amount to pay
   - PayPal email OR bank details (IBAN, account holder, bank name)
4. Admin processes payment manually (via PayPal or bank transfer)
5. Clicks "Mark as Processed"
6. Status changes to 'completed' in database

## Admin Page Query

The admin page loads data with this query:

```typescript
const { data } = await supabase
  .from('payout_requests')
  .select(`
    *,
    sitter:users!payout_requests_sitter_id_fkey(
      id,
      name,
      email,
      payout_method,
      paypal_email,
      bank_name,
      iban,
      account_holder_name
    )
  `)
  .eq('status', 'pending')
  .order('created_at', { ascending: false });
```

## Testing the Complete Flow

### 1. Test as Sitter:
```bash
# Login as a sitter user
# Go to /payout-methods
# Add PayPal: test@paypal.com
# Click Save
# Click "Request Payout" (if you have balance)
```

### 2. Check Database:
```sql
-- See saved payout info
SELECT name, email, payout_method, paypal_email 
FROM users 
WHERE payout_method IS NOT NULL;

-- See payout requests
SELECT * FROM payout_requests WHERE status = 'pending';
```

### 3. Test as Admin:
```bash
# Go to /admin/payouts
# Login: admin / aliattiapetflik*10
# See the pending request
# Click "Mark as Processed"
```

### 4. Verify Processing:
```sql
-- Check request was marked as completed
SELECT * FROM payout_requests WHERE status = 'completed';
```

## Sample Data for Testing

If you want to test with sample data:

```sql
-- Insert a test payout request
INSERT INTO payout_requests (
  sitter_id,
  amount,
  payout_method,
  payout_details,
  status
) VALUES (
  (SELECT id FROM users WHERE email = 'sitter@example.com' LIMIT 1),
  150.00,
  'paypal',
  'sitter@paypal.com',
  'pending'
);
```

## Troubleshooting

### Admin page shows "No pending payout requests"?
1. Check if `payout_requests` table exists
2. Check if there are any pending requests:
   ```sql
   SELECT * FROM payout_requests WHERE status = 'pending';
   ```
3. Create a test request (see sample data above)

### Can't login to admin page?
- Username: `admin`
- Password: `aliattiapetflik*10`
- These are hardcoded in `src/pages/AdminPayoutsPage.tsx`

### Sitter info not showing?
1. Check if user has payout info saved:
   ```sql
   SELECT * FROM users WHERE id = 'sitter-id-here';
   ```
2. Make sure the foreign key relationship exists
3. Check the join query is working

### Error: "relation payout_requests does not exist"?
Run the migration in Step 1 above to create the table.

## Security Notes

1. **Admin Authentication**: Currently uses simple username/password. Consider adding proper admin roles in production.
2. **RLS Policies**: Sitters can only see their own requests. Admins bypass RLS.
3. **Sensitive Data**: IBAN and bank details are stored in plain text. Consider encryption for production.

## Next Steps

After setup:
1. Test the complete flow (sitter → request → admin → process)
2. Set up email notifications for new payout requests
3. Add automated PayPal integration (optional)
4. Add payout history page for sitters
5. Add reporting/analytics for admin
