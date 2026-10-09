# Independent work records and stable allocations

Goal: migrate schema v10 to v11 with normalized base tasks, stage work, parts, allocations and work logs under `settings.workflow`, integrated with the existing reactive snapshots and undo. Keep legacy rows as UI adapters; canonical logs/links must never be overwritten from their projections on save.

Contract: deterministic session-safe part IDs; allocations refer to schedule IDs, not section positions; legacy indices are consumed only once during migration. One part can have multiple numbered work attempts. An attempt captures performer/editor, date, content duration and actual/break time. Adding a rework attempt leaves prior attempts intact. Historical attempts can be selected for correction, and cleared by reversible voiding rather than deleting prior work. All attempts count toward actual time; same part's content counts only once in its aggregate ratio.

Implementation streams: pure ledger + v11 migration; schedule association/read/write refactor; multiple-attempt statistics; record UI/actions and persistence/guard upgrade. Tests cover migration idempotence, reorder-safe schedules, canceling allocations without clearing logs, stage/owner isolation, rework denominator, undo/redo and JSON round trips. SQL is an artifact, not remotely executed. Original v10 storage/backups retained.

## Implemented

- Five logical collections: `baseTasks`, `stageWorks`, `workParts`, `allocations`, `workLogs`. These are separate ID-linked collections within the existing JSON persistence envelope, not five new PostgreSQL tables.
- Canonical work records and schedule links are authoritative. Legacy `records` is a projection of the active attempt; `sectionIndex` is a display projection of allocation IDs. Base task/part structure still synchronizes from compatible pool rows; this version does not eliminate that UI adapter.
- Each part has numbered attempts. UI offers “新增录音/剪辑 / 返工”, attempt selection, actual date, start/end or direct net duration. Editing corrects selected attempt only; clearing voids the selected row and can be undone. Prior attempts retain performer, date, project/instrument and metadata snapshots.
- Statistics sum non-voided attempt time and count the part's content once. History shows attempt number; archived parts with logs remain visible. Range coverage remains part-level because legacy data lacks exact musical ranges.
- Calendar reorder/movement retains explicit schedule IDs. Split calendar block keeps original ID on first half. Deleting assignments and moving work do not erase logs. Explicit auto-resize uses attempts for that schedule and date only.
- CSV import captures each input row independently, protects session boundaries and deduplicates identical attempts. JSON export/import carries all five collections.
- EDIT sidebar subtitle shows project rather than recording musician.

## Migration and rollout

`schemaVersion` is now 11. Legacy data imports indices/records exactly once. Ambiguous duplicate direct schedules produce a null allocation and a `migrationIssues` entry rather than a guessed assignment. Invalid v11 envelopes missing the ledger are rejected.

Local writes use `v11_data`; reads fall back to v10/v9. Cloud cache uses `musche_cloud_cache_v11`; v10 cache and unsynced drafts remain readable. Original snapshots are retained under `musche_pre_workflow_v11:<source>`. The old storage is not overwritten by migration.

Before cloud rollout, apply `supabase/migrations/20260928_workflow_ledger_v11_guard.sql` using the database owner. It enables v11 capability and rejects downgraded or stale-revision writes. This task does not apply it remotely. v10-only capability blocks v11 saves, with recoverable local drafts. iOS workflow UI remains unsupported; the existing native guard prevents unsupported schema editing.

## Verification

- 447 tests: 445 pass, 1 optional external MIDI fixture skipped, 1 existing native-iOS removal assertion fails.
- Modularization and REC/EDIT split-state checks pass.
- Production build and `git diff --check` pass.
- Changed Vue templates compile successfully.
- Browser/native interaction verification and live SQL execution were not performed. Previously attempted preview/inspection was blocked by the approval gateway; no live user data was changed.
