# Revision conflict retry incident

The production PostgREST 14.5 service repeatedly retried the application-level
revision error raised by `musche_guard_workflow_write()` as SQLSTATE `40001`.
Between 2026-09-28 13:50 and 16:51 UTC, the two backends emitted 478,836
revision-conflict errors. Normal API traffic was low.

## Applied database fix

Applied `supabase/migrations/20260929_workflow_revision_conflict_no_retry.sql`
through the authenticated Supabase SQL Editor. The function now raises `PT409`
for a stale revision. Version validation and schema downgrade protection remain.
No production user content or revisions were changed by the repair.

Before commit, a temporary table using the same trigger verified:

- Reusing revision 7 raises `PT409`.
- Updating revision 7 to 8 succeeds.
- Downgrading schema 11 to 10 raises `23514`.

The final `40001` was logged at 2026-09-28 17:21:40.412 UTC. The two requests
then returned `PT409`, the last at 17:21:40.494 UTC. No further revision errors
were present through 17:24:15 UTC. A subsequent narrowly scoped termination
query matched zero rows; the old backends had already exited. Do not reuse
historical PIDs for cleanup without checking their identity and activity.

At approximately 2026-09-29 01:27 Asia/Shanghai, the refreshed database
observability page reported CPU usage of 1.43%, down from the original 98.17%.

## Client repair

`auth.js` recognizes both `PT409` and legacy `40001`, pauses further saves,
and retains the unsynced draft until cloud data is loaded. The regression test
failed before the change (two writes instead of one), then passed. All 33
auth/supabase service tests and the production build passed.

The complete local suite reported 483 passes, one skip, and one unrelated
failure: `capacitor-removal.test.mjs` expects the tracked `ios` directory not to
exist. No unrelated files were removed to satisfy that test.

The client source change is local and must be included in the next frontend
deployment. Existing open clients require a reload after deployment, after
preserving any unsynced work.

Reference: https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b
