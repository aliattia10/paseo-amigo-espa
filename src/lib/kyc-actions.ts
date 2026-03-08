/**
 * KYC admin actions: approve/reject user verification.
 * Used by the password-protected admin dashboard (/admin/verifications).
 * Updates Supabase users.verification_status and users.verified.
 */
import { supabase } from '@/integrations/supabase/client';

export async function approveUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      verification_status: 'verified',
      verified: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
}

export async function rejectUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      verification_status: 'rejected',
      verified: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
}
