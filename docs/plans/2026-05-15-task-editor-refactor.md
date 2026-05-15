# Task Editor Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract task edit modal actions from `app/scripts/app.js` into `app/scripts/features/task-editor.js`.

**Architecture:** Keep `app.js` as the composition root. Add a feature registration function that receives refs, split-state helpers, and side-effect actions, then returns the three functions already used by the template.

**Tech Stack:** Vue refs, existing split-state utility module, Node smoke checks, Vite build.

---

### Task 1: Add Smoke Coverage For The New Module

**Files:**
- Modify: `tests/modularization-smoke.mjs`

**Step 1: Write the failing test**

Add `app/scripts/features/task-editor.js` to the `requiredFiles` array.

**Step 2: Run test to verify it fails**

Run: `npm run verify:modularization`

Expected: FAIL with `app/scripts/features/task-editor.js must exist`.

**Step 3: Commit only after implementation passes**

This test change should be committed with the extraction implementation.

### Task 2: Create Task Editor Feature

**Files:**
- Create: `app/scripts/features/task-editor.js`
- Modify: `app/scripts/app.js`

**Step 1: Implement the feature module**

Create `registerTaskEditorFeature(context)`.

Accept refs:
- `itemPool`
- `scheduledTasks`
- `editingItem`
- `editingSource`
- `showEditor`
- `sidebarTab`
- `trackListData`

Accept split helpers:
- `ensureItemSplitViews`
- `normalizeSplitViewType`
- `getSplitViewState`
- `setItemSplitState`
- `syncLegacySplitFields`
- `rebalanceSplitFamilyDuration`
- `syncFamilyLegacyFields`
- `syncFamilySharedIdentity`
- `syncFamilyOrchestration`
- `syncFamilyTotalDuration`
- `syncScheduledDurationsFromFamily`

Accept general helpers and actions:
- `calculateEstTime`
- `getDefaultRatio`
- `checkCanDeleteSplit`
- `restoreSplitTime`
- `clearPoolRecord`
- `cleanupEmptySchedules`
- `openAlertModal`
- `autoUpdateEfficiency`
- `updateTaskNotification`
- `pushHistory`
- `cancelNotification`

Return:
- `openEditModal`
- `saveEdit`
- `deleteEditingItem`

**Step 2: Wire the feature in app.js**

Import `registerTaskEditorFeature`, register it after `isToday`, and replace inline function bodies with returned feature functions.

**Step 3: Run syntax checks**

Run:
- `node --check app/scripts/app.js`
- `node --check app/scripts/features/task-editor.js`

Expected: both commands exit 0.

### Task 3: Verify Behavior And Finish

**Files:**
- Modify: `tests/modularization-smoke.mjs`
- Create: `app/scripts/features/task-editor.js`
- Modify: `app/scripts/app.js`
- Create: `docs/plans/2026-05-15-task-editor-refactor-design.md`
- Create: `docs/plans/2026-05-15-task-editor-refactor.md`

**Step 1: Run modularization smoke**

Run: `npm run verify:modularization`

Expected: PASS and module count increases by one.

**Step 2: Run full tests**

Run: `npm test`

Expected: PASS. Existing module-type warnings are acceptable.

**Step 3: Run production build**

Run: `npm run build`

Expected: PASS. Existing large chunk warning is acceptable.

**Step 4: Commit**

```bash
git add app/scripts/app.js app/scripts/features/task-editor.js tests/modularization-smoke.mjs docs/plans/2026-05-15-task-editor-refactor-design.md docs/plans/2026-05-15-task-editor-refactor.md
git commit -m "refactor: extract task editor feature"
```
