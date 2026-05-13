# Supabase Key Rotation Notice

Date: 2026-05-11

The old Supabase anon key has been present in public git history and must be rotated manually in the Supabase console.

## Required human actions

1. Rotate the anon key in Supabase.
2. Update hosted environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`, and update local `app/config.local.js` only if you still use local-only overrides during development.
3. Review and enable RLS policies for every table that needs public access.
4. Audit the repository history for the old key reference:
   ```bash
   git log -S "qsbuegmcnivwkklxsyqj"
   ```

## Current data surfaces observed in code

- `user_data` table
- `avatars` storage bucket

Please review the live Supabase project for any additional tables or storage objects that are not referenced in the codebase.
