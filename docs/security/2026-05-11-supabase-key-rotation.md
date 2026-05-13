# Supabase key rotation warning

Date: 2026-05-11

## Why this exists

The previous Supabase anon key was committed into git history. That means the key must be treated as exposed and rotated in the Supabase dashboard.

## Required human actions

1. Rotate the old anon key in the Supabase console.
2. Update the local `app/config.local.js` with the new `supabaseUrl` and `supabaseKey`.
3. Keep `app/config.local.js` untracked.
4. Review and enforce RLS before exposing any table to the client.

## Current data surface to review

Tables found in the codebase:

- `user_data`

Related storage bucket used by the app:

- `avatars`

## Suggested audit command

Use this to inspect historical references to the leaked key:

```bash
git log -S "qsbuegmcnivwkklxsyqj" --oneline --all
```

## RLS reminder

After rotation, review policies for `user_data` and any future client-facing tables so reads and writes are constrained to the owning user.
