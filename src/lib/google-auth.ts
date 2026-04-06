import { supabase } from '@/integrations/supabase/client';

/**
 * Browser redirect to Google OAuth. Supabase redirects back to `redirectTo` with ?code= (PKCE).
 * Add these URLs in Supabase Dashboard → Authentication → URL Configuration → Redirect URLs:
 * - https://petflik.com/auth/callback
 * - http://localhost:5173/auth/callback
 */
export async function signInWithGoogle(): Promise<void> {
  const redirectTo = `${window.location.origin}/auth/callback`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });
  if (error) throw error;
  if (data?.url) {
    window.location.assign(data.url);
  }
}
