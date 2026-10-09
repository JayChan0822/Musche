# REC / EDIT workflow refactor implementation

Goal: task identity remains project + instrument/part; recording and editing have independent assignees and records, with explicit schedule stages and safe legacy migration.

Current implementation boundary: retain `musician/project` view aliases and split/record containers as a compatibility adapter, introduce rec/edit business stages and independent editorId, role-based people, stage-specific scheduling/deletion and versioned persistence. Do not infer editor from metadata or rewrite historical recordings. Further physical normalization into separate tables must not be falsely claimed complete by this increment.

Work streams:
1. Shared workflow helpers: explicit stage, owner and role lookup; legacy stage inference only here.
2. Assignment UI: independent REC/EDIT assignment, allow unassigned tasks, person roles, task-edit propagation.
3. Scheduling: stage-aware creation, grouping, ghost display, conflict by assignee/resource, stage-isolated removal and track list context.
4. Statistics/splitting: editor grouping and recorded time, independent stage ratios and assignments in family operations.
5. Persistence: schema version, idempotent migration, backup, unknown-field preservation, cloud old-client safeguards.
6. Focused tests then full suite/build; review all agent changes for contract consistency. No external data edits or production rollout.

Verification must cover: unassigned task creation; independent editor/musician selection; recording preserved while editing; different people parallel, same person cross-stage conflict; split stage durations; old project EDIT schedules with no editor; snapshot round trip, undo/redo and migration idempotence.

## Delivered increment (2026-09-28)

- Shared stage/owner helpers and legacy schedule adapter; new calendar allocations carry explicit stage and independent editorId.
- People registry retains its legacy `musicians` storage key with roles; creation/editing supports optional REC/EDIT assignees. EDIT pool groups by editor, with unassigned group. No name-based merging of people or assigning editor from project/metadata.
- Stage-specific completion controls and independent stage estimates; actual records no longer automatically change booked time or person defaults. Calendar allocation removal preserves actual history.
- Stage-specific split synchronization, calendar conflict checks and track-list selection; REC and EDIT statistics can be selected in detail dialogs. Historical records snapshot execution owner and content duration.
- Schema v10 migration, original backups, isolated local storage, cloud draft recovery, server capability gate and SQL write-guard artifact. Current native client refuses unsupported newer cloud schema rather than discard fields.
- CSV schedules persist stage; schedule exports and ICS resolve stage/assignee explicitly.

## Explicit remaining architecture work

This is not the final normalized design described in the domain document. Pool rows still contain stage data under legacy `records.musician/project` and `splitViews.musician/project`; they are compatibility-backed stage containers, not separate Task/StageWork/WorkPart tables. `sectionIndex` remains the section association; stable allocation IDs and append-only multiple WorkLogs per part require a subsequent migration. Re-recording still edits a single record rather than creating independent attempts. Personnel REC/EDIT roles are unified, but engineer/operator/assistant Metadata remain separate lists with name-based associations. Alternate grouping controls (project/instrument) in REC/EDIT are not implemented in this increment. Native workflow UI is not ported.

## Validation and rollout

Full suite: 414 pass, 1 optional MIDI fixture skipped, 1 pre-existing `capacitor-removal` failure due to the native iOS folder. Modularization and split-state checks pass. Production build and diff check pass. Swift service syntax parses; native application target not built.

Browser preview could not start because the configured automatic-approval endpoint returned HTTP 502. No live data or SQL was changed. Before deploying, review/apply `supabase/migrations/20260928_workflow_schema_guard.sql`; new-format cloud saves intentionally remain blocked until this guard is installed. See `2026-09-28-workflow-migration-rollout.md` for backup and recovery procedures. Do not claim old native clients support schema v10.
