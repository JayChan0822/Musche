# Pool reassignment implementation plan

Goal: Drag an individual pool task onto a personnel card to assign REC performer or EDIT editor; remove redundant completion checkbox.
Architecture: Reuse native schedule drag state and sidebar drop delegation. A standalone reassignment helper changes one stage owner, clears its allocation, and preserves historical work logs. Other stage assignments and shared schedules remain intact. Target highlight identifies valid drop areas; undo snapshots encompass the operation.

Approved behavior: New assignee must arrange a new schedule. Unassigned target clears ownership. Same-owner drop is a no-op. Only matching-role personnel are allowed. Recorded schedule blocks remain as history. Remove an empty unrecorded old block only when no other allocation references it.

Steps:
1. Test REC/EDIT reassignment, unassignment, shared/recorded schedule preservation and invalid targets.
2. Implement helper and native drag/drop wiring with target highlight and cleanup.
3. Remove Take List completion checkbox; retain automatic status logic.
4. Run focused tests, full tests and build.
