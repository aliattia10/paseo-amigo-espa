-- Custom KYC: add AI confidence score to users (verification_status, kyc_data already exist).
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_confidence NUMERIC(5,4);

COMMENT ON COLUMN public.users.kyc_confidence IS 'AI face-match confidence 0..1 from KYC /verify';

-- Allow admin emails to read all users and update verification (for admin verifications dashboard).
-- Adjust the IN list to match your admin list in AuthContext. Uses lower() for case-insensitive match.
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT
  TO authenticated
  USING (
    lower(trim(auth.jwt() ->> 'email')) IN (lower('attiaali853@gmail.com'), lower('admin@petflik.com'))
  );

DROP POLICY IF EXISTS "Admins can update verification" ON public.users;
CREATE POLICY "Admins can update verification" ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    lower(trim(auth.jwt() ->> 'email')) IN (lower('attiaali853@gmail.com'), lower('admin@petflik.com'))
  )
  WITH CHECK (true);
