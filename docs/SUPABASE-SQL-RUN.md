# Running Supabase SQL (migrations + one-off scripts)

## What was done

- **Migration history:** Repaired so the remote matches local:
  - `20241110` was marked **reverted** (then re-applied when you push).
  - `20251007111640_create_paseo_schema.sql` was marked **applied** so it is skipped (it is a full schema reset and would drop tables; your DB already has the schema from other migrations).
- **New migrations added** (so they run on next `supabase db push`):
  - `20251101000003_show_matches_in_messages.sql` – same logic as `RUN-THIS-TO-SHOW-MATCHES-IN-MESSAGES.sql` (matches in Messages, RLS, `send_message`).
  - `20251101000004_demo_likes_and_save_like_match.sql` – same logic as `RUN-THIS-FOR-DEMO-LIKES.sql` (demo sitters/owners, likes → `public.users`, `save_like_and_check_match`).

## Option A: Push via CLI (recommended)

1. Get your **database password** from [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Settings** → **Database** → **Database password** (or reset it if needed).
2. In a terminal (PowerShell or CMD), from the project root:
   ```bash
   set SUPABASE_DB_PASSWORD=your_db_password_here
   npx supabase db push --yes
   ```
   (On PowerShell you can use `$env:SUPABASE_DB_PASSWORD = "vUAkN3xU88AZhsHh"` then run the push.)
3. This will apply any pending migrations, including the two new ones above.

If you see **"Remote migration versions not found"** or **"local migration files to be inserted before"**, run:

```bash
npx supabase db push --yes --include-all
```

## Option B: Run SQL in the Dashboard (no CLI)

If you prefer not to use the CLI or don’t have the DB password:

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Run the contents of **one** of these files (copy/paste and run):
   - `supabase/RUN-THIS-TO-SHOW-MATCHES-IN-MESSAGES.sql` (matches visible in Messages, chat, `send_message`).
   - `supabase/RUN-THIS-FOR-DEMO-LIKES.sql` (demo users + fix “Failed to save like”).
3. Run the other file if you want both behaviours.

Each file is idempotent (safe to run more than once).

## Check migration status

```bash
npx supabase migration list
```

Shows which migrations are applied locally vs on the remote.

## Summary

| Goal | Option A (CLI) | Option B (Dashboard) |
|------|----------------|----------------------|
| Apply all pending migrations + new RUN-THIS logic | `set SUPABASE_DB_PASSWORD=...` then `npx supabase db push --yes` | Run the two `RUN-THIS-*.sql` files in SQL Editor |
