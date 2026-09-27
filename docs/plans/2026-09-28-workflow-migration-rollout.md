# Workflow v10 persistence rollout

This change adds explicit schedule `stage` (`rec`/`edit`), independent `editorId`,
and personnel `roles` in `settings.musicians`. Legacy record, ratio, and split-view
keys remain intact. `schemaVersion: 10` is independent of the cloud revision column.

## Deployment prerequisite

Before allowing new clients to save migrated content, run
`supabase/migrations/20260928_workflow_schema_guard.sql` as database owner. This
repository change does not execute SQL or alter the live database. The SQL adds
an enabled-trigger capability RPC, rejects overwrites from old schemas after a
row is upgraded, and rejects duplicate/out-of-order revisions on upgraded rows.
RLS and ownership policies on `user_data` remain unchanged.

The Web client checks that capability on each v10 write. If the RPC is absent,
errors, or reports another version, saving fails visibly. Do not disable this
check to work around deployment errors. An already-installed old native client
otherwise silently drops new fields when encoding the whole content blob.

The native service in this checkout rejects schema >9 before Codable decoding
and before saving. It does not implement the new workflow UI. Older installed
native binaries are protected by the database trigger once a row is upgraded.

## Backups and recovery

- Migration preserves the original source snapshot under
  `musche_pre_workflow_v10:<encoded source>`, before normalizing any records.
- Guest writes use `v10_data`, preserving the original `v9_data`.
- Signed-in cache writes use `musche_cloud_cache_v10`; legacy cache is read as a
  fallback. Normal logout clears both account caches; migration backups remain.
- A cloud save first writes `musche_workflow_unsynced:<user ID>`. If upload is
  blocked, the draft remains. On restart, a draft matching the cloud revision is
  restored with an unsaved status. When cloud revision changed, cloud data wins
  and an alert explains the preserved draft; no automatic merge occurs.
- JSON import backs up both the original import and the previous live state
  before replacement. Storage quota/backup errors abort the import/migration.
- Successful cloud save removes the corresponding unsynced draft.

Backup keys contain private user data and must not be sent to others. For manual
recovery, export the desired local snapshot as JSON and use the normal import
path. Retained backups are intentionally not automatically pruned.

## Validation performed

Focused migration, auth restore, JSON portability, history, and service tests
cover idempotence, unknown-field preservation, stages/roles, future-schema
rejection, backup failure without mutation, JSON round trips, server capability
gating, and offline draft recovery. SQL has not been executed against a database;
native service changes require an iOS application build (not covered by Web tests).
