# Three Module Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract TrackList, split-task, and MIDI manager workflows from `app/scripts/app.js` into focused feature modules.

**Architecture:** Keep `app.js` as the composition root. Each feature module exports a `register...Feature(context)` function, receives refs/helpers/actions, and returns the functions already used by `app/index.html`.

**Tech Stack:** Vue refs/reactive state, existing split-state utilities, existing MIDI utilities, Node smoke tests, Vite build.

---

### Task 1: Add TrackList Module

**Files:**
- Create: `app/scripts/features/track-list.js`
- Modify: `app/scripts/app.js`
- Modify: `tests/modularization-smoke.mjs`

**Step 1: Write the failing smoke test**

Add `app/scripts/features/track-list.js` to `requiredFiles`.

**Step 2: Run the smoke test**

Run: `npm run verify:modularization`

Expected: FAIL with `app/scripts/features/track-list.js must exist`.

**Step 3: Extract TrackList logic**

Move TrackList section distribution, record calculations, record clearing, record sorting, divider dragging, TrackList auto-scroll, row deletion, and reminder update into `registerTrackListFeature(context)`.

**Step 4: Wire returned functions**

Expose the same names in `app.js`: `autoDistributeSections`, `autoResizeScheduleByRecords`, `startDividerDrag`, `onDividerDragMove`, `onDividerDragEnd`, `handleTrackListAutoScroll`, `stopTrackListAutoScroll`, `calcTrackDiff`, `setTrackBreak`, `deleteTrackFromList`, `autoCalcDuration`, `saveScheduleActualTime`, `saveTrackActual`, `onTrackListReminderChange`, `setTrackNow`, `saveTrackRecord`, `clearTrackTime`, `getOrchSize`, `isOrchestraGroup`, `isPercussionGroup`, `isStringGroup`, `sortTrackList`, and `autoSortTrackList`.

**Step 5: Verify and commit**

Run:
- `node --check app/scripts/app.js`
- `node --check app/scripts/features/track-list.js`
- `npm run verify:modularization`
- `npm test`

Commit: `refactor: extract track list feature`

### Task 2: Add Split Task Module

**Files:**
- Create: `app/scripts/features/split-task.js`
- Modify: `app/scripts/app.js`
- Modify: `tests/modularization-smoke.mjs`

**Step 1: Write the failing smoke test**

Add `app/scripts/features/split-task.js` to `requiredFiles`.

**Step 2: Extract split workflow**

Move split validation, slider state updates, confirmation, direct split entry, and restore-split-time into `registerSplitTaskFeature(context)`.

**Step 3: Verify and commit**

Run:
- `node --check app/scripts/app.js`
- `node --check app/scripts/features/split-task.js`
- `npm run verify:modularization`
- `npm test`

Commit: `refactor: extract split task feature`

### Task 3: Add MIDI Manager Module

**Files:**
- Create: `app/scripts/features/midi-manager.js`
- Modify: `app/scripts/app.js`
- Modify: `tests/modularization-smoke.mjs`

**Step 1: Write the failing smoke test**

Add `app/scripts/features/midi-manager.js` to `requiredFiles`.

**Step 2: Extract manager workflow**

Move MIDI manager grouping/collapse, open manager, manual duration update, mapping removal, clear project MIDI, group dropdown, and duration helper functions into `registerMidiManagerFeature(context)`.

**Step 3: Verify and commit**

Run:
- `node --check app/scripts/app.js`
- `node --check app/scripts/features/midi-manager.js`
- `npm run verify:modularization`
- `npm test`

Commit: `refactor: extract midi manager feature`

### Task 4: Final Verification And Merge

**Files:**
- All files changed in Tasks 1-3

**Step 1: Build in worktree**

Run:
- `npm test`
- `npm run build`

Expected: tests and build pass. Existing Vite large chunk warning is acceptable.

**Step 2: Merge to main**

Fast-forward merge `codex/three-module-refactor` into `main`.

**Step 3: Verify merged main**

Run:
- `npm test`
- `npm run build`

**Step 4: Cleanup**

Remove the worktree and delete the temporary branch.
