# Supabase Database Advisor – What We Fix vs Dashboard

Migrations in this repo fix several **Security** and **Performance** advisor issues. The rest require Supabase Dashboard or Auth settings.

## Fixed by migrations

| Issue | Migration | What it does |
|-------|-----------|--------------|
| **Views with SECURITY DEFINER** (`public_profiles`, `sitter_payout_status`) | `20250206000000_view_security_invoker.sql` | Sets `security_invoker = on` so RLS of the caller applies. |
| **Functions with role mutable search_path** (all listed functions) | `20250206000001_function_search_path_and_extension.sql` | `ALTER FUNCTION ... SET search_path = public` for every function in `public` schema. |
| **Extension `btree_gist` in public schema** | Same migration | Moves `btree_gist` to `extensions` schema if it is currently in `public`. |

Apply migrations as usual (e.g. `supabase db push` or run the SQL in Supabase SQL Editor).

---

## Fix in Supabase Dashboard / Auth

### 1. Auth – anonymous sign-ins (0012_auth_allow_anonymous_sign_ins)

- **Where:** [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **Providers** (or **Settings**).
- **What:** Disable or restrict anonymous sign-ins if you do not use them.
- **Doc:** https://supabase.com/docs/guides/database/database-advisors?queryGroups=lint&lint=0012_auth_allow_anonymous_sign_ins

### 2. Auth – HaveIBeenPwned (compromised passwords)

- **Where:** Authentication / Auth settings.
- **What:** Enable the option to check passwords against HaveIBeenPwned.org.

### 3. RLS policies with “always true” WITH CHECK

Advisor flags policies that effectively bypass RLS, for example:

- `discount_usage`: “System can insert discount usage”
- `matches`: “System can create matches”
- `notifications`: “System can insert notifications”
- `payments`: “System can update payments”

These are often intentional (e.g. for Edge Functions or triggers using the service role). Options:

- **Keep as-is** if only backend/service role can perform those operations.
- **Tighten:** Restrict the policy to a specific role (e.g. `current_setting('role') = 'service_role'`) or replace with a **SECURITY DEFINER** function that checks the caller and performs the insert/update, and grant execute only to the service role.

---

## Performance (161 items)

Many reported “slow” queries are **Supabase internal** (e.g. `pg_timezone_names`, table metadata). Those cannot be fixed from this repo. For **your app’s** slow queries, use the Dashboard **Reports** or **Query performance** and add indexes or rewrite queries as needed.
