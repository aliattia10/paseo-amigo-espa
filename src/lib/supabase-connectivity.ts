/**
 * Supabase connectivity check.
 * Use this to verify the app can reach Supabase (auth + REST).
 */
import { supabase } from '@/integrations/supabase/client';

export type ConnectivityResult = {
  ok: boolean;
  auth: boolean;
  rest: boolean;
  error?: string;
};

const CHECK_TIMEOUT_MS = 8000;

/**
 * Check if Supabase is reachable: auth (getSession) and REST (simple select).
 * Returns within CHECK_TIMEOUT_MS; on timeout or failure, returns ok: false.
 */
export async function checkSupabaseConnectivity(): Promise<ConnectivityResult> {
  const result: ConnectivityResult = { ok: false, auth: false, rest: false };

  try {
    // 1. Auth reachability (lightweight)
    const authPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Auth check timed out')), CHECK_TIMEOUT_MS)
    );
    await Promise.race([authPromise, timeoutPromise]);
    result.auth = true;

    // 2. REST reachability: use a table that allows public/anonymous read so local dev without login still passes
    const restPromise = supabase.from('subscription_plans').select('id').limit(1).maybeSingle();
    const restTimeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('REST check timed out')), CHECK_TIMEOUT_MS)
    );
    const restResult = await Promise.race([restPromise, restTimeout]) as Awaited<typeof restPromise>;
    result.rest = true;
    if (restResult?.error) {
      if (restResult.error.message?.includes('Failed to fetch') || restResult.error.message?.includes('fetch')) {
        result.rest = false;
        result.error = result.error || restResult.error.message;
      }
      // RLS/permission errors still mean we reached Supabase (REST ok)
    }
    result.ok = result.auth && result.rest;
  } catch (e: any) {
    result.error = e?.message ?? String(e);
    result.ok = false;
  }

  return result;
}

/**
 * Log connectivity result to console (for debugging).
 */
export function logConnectivityResult(result: ConnectivityResult): void {
  if (result.ok) {
    console.log('[Supabase] Connectivity OK (auth + REST)');
  } else {
    console.warn('[Supabase] Connectivity issue:', {
      auth: result.auth,
      rest: result.rest,
      error: result.error,
    });
  }
}
