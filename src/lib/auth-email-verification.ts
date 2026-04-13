import type { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * True when the user signed up with email/password and must confirm email before using the app.
 * OAuth users (Google, etc.) typically have email_confirmed_at set and are not blocked.
 */
export function requiresEmailVerification(user: SupabaseUser | null): boolean {
  if (!user?.email) return false;
  if (user.email_confirmed_at) return false;
  const identities = user.identities ?? [];
  if (identities.length === 0) {
    const provider = (user.app_metadata as { provider?: string } | undefined)?.provider;
    if (provider && provider !== 'email') return false;
    return true;
  }
  return identities.some((i) => i.provider === 'email');
}
