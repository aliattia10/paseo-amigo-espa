# Supabase migrations (recommended path)

Production and staging schema changes belong in **`supabase/migrations/`** and are applied with the Supabase CLI.

## CLI (recommended)

1. Database password from [Supabase Dashboard](https://supabase.com/dashboard) → **Settings** → **Database**.
2. From project root (PowerShell example):

```powershell
$env:SUPABASE_DB_PASSWORD = "YOUR_PASSWORD"
npx supabase db push --yes
```

If you hit migration ordering edge cases:

```bash
npx supabase db push --yes --include-all
```

## Migration status

```bash
npx supabase migration list
```

## Notes

Older one-off dashboard scripts under `supabase/RUN-THIS-*.sql` were removed; equivalent logic lives in dated migrations (`20251101*`, `20251108*`, etc.). Use `supabase db push`, not pasted duplicates.
