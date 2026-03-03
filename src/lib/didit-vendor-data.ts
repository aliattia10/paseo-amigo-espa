/**
 * Vendor data for Didit identity verification during account creation.
 * Pass this object when creating a Didit session so webhooks/callbacks can link the result to the right user.
 *
 * --- What to fill in "Vendor data" (in Didit dashboard or when creating a session via API) ---
 *
 * If you verify AFTER the user has signed up (recommended):
 *   Fill in: user_id, user_type
 *   - user_id: the Supabase Auth user id (UUID) — e.g. currentUser.id
 *   - user_type: "owner" or "walker"
 *
 * If you verify BEFORE creating the account:
 *   Fill in: email, signup_session_id, and optionally user_type
 *   - email: the email they entered in the signup form
 *   - signup_session_id: a temporary UUID you generate (e.g. crypto.randomUUID()) and store until signup completes
 *   - user_type: "owner" or "walker" if already known
 *
 * Optional for both: source = "paseo-amigo-espa" (app identifier).
 *
 * Example JSON for "after signup" flow:  { "user_id": "uuid-from-supabase-auth", "user_type": "walker", "source": "paseo-amigo-espa" }
 * Example JSON for "before signup" flow: { "email": "user@example.com", "signup_session_id": "temp-uuid", "user_type": "owner", "source": "paseo-amigo-espa" }
 *
 * Didit Create Session API: vendor_data must be sent as a STRING. Use JSON.stringify(getDiditVendorDataForSignup(...)).
 */

export type DiditVendorData = {
  /** Your app's user id (Supabase Auth / users.id). Use when user already exists (e.g. verify right after signup). */
  user_id?: string;
  /** User role: owner or walker. Helps route and display in your dashboard. */
  user_type?: 'owner' | 'walker';
  /** Email used at signup. Use when starting verification before the account exists. */
  email?: string;
  /** Temporary id for pending signup (e.g. UUID). Use when verifying before creating the account, so the webhook can complete signup. */
  signup_session_id?: string;
  /** Optional: app/source identifier. */
  source?: string;
};

const APP_SOURCE = 'paseo-amigo-espa';

/**
 * Build vendor data for a Didit session when the user is verifying during signup.
 *
 * Use "after signup" when you create the account first, then send the user to Didit:
 * - Pass user_id (Supabase Auth user id) and user_type so your webhook can update verification status.
 *
 * Use "before signup" when you start verification before creating the account:
 * - Pass email and a signup_session_id (generate a UUID, store in sessionStorage); when Didit calls your webhook with success, create the account and link verification.
 */
export function getDiditVendorDataForSignup(options: {
  /** Supabase Auth user id (available after signUp). Omit if verifying before account exists. */
  userId?: string;
  /** owner | walker */
  userType?: 'owner' | 'walker';
  /** Email from signup form. Include when verifying before account exists. */
  email?: string;
  /** Temporary session id for pending signup (e.g. crypto.randomUUID()). Include when verifying before account exists. */
  signupSessionId?: string;
}): DiditVendorData {
  const vendor: DiditVendorData = { source: APP_SOURCE };

  if (options.userId) {
    vendor.user_id = options.userId;
  }
  if (options.userType) {
    vendor.user_type = options.userType;
  }
  if (options.email) {
    vendor.email = options.email;
  }
  if (options.signupSessionId) {
    vendor.signup_session_id = options.signupSessionId;
  }

  return vendor;
}

/**
 * Returns vendor data as a JSON string for the Didit Create Session API.
 * The API expects vendor_data to be a string (e.g. for session tracking and webhook echo).
 */
export function getDiditVendorDataString(options: Parameters<typeof getDiditVendorDataForSignup>[0]): string {
  return JSON.stringify(getDiditVendorDataForSignup(options));
}
