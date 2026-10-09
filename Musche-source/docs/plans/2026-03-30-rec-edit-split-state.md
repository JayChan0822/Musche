# REC/EDIT Split State Independence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make REC and EDIT maintain independent task split chains while sharing the same base task metadata.

**Architecture:** Add a view-scoped split-state layer on each task and route all split-related reads and writes through helper functions. Keep legacy top-level fields as compatibility mirrors during the migration so existing saves continue to load.

**Tech Stack:** Vanilla ES modules, Vue 3 app state in `app/scripts/app.js`, Node smoke/regression scripts in `tests/`

---

### Task 1: Add split-state helper module and regression tests

**Files:**
- Create: `app/scripts/utils/split-state.js`
- Create: `tests/rec-edit-split-state.mjs`
- Modify: `package.json`

**Step 1: Write the failing test**

Add tests that prove:
- legacy split fields seed both `musician` and `project`
- mutating `musician` split state leaves `project` untouched
- mutating `project` split state leaves `musician` untouched

**Step 2: Run test to verify it fails**

Run: `node tests/rec-edit-split-state.mjs`
Expected: FAIL because `app/scripts/utils/split-state.js` does not exist yet.

**Step 3: Write minimal implementation**

Implement helpers for:
- ensuring `splitViews`
- getting the split-state bucket for a view
- reading visible split fields
- writing split fields for one view
- syncing legacy top-level fields as a compatibility bridge

**Step 4: Run test to verify it passes**

Run: `node tests/rec-edit-split-state.mjs`
Expected: PASS

### Task 2: Route TrackList and sidebar rendering through split helpers

**Files:**
- Modify: `app/scripts/app.js`
- Modify: `app/index.html`

**Step 1: Write the failing test**

Extend `tests/rec-edit-split-state.mjs` with a small integration-oriented case that demonstrates view-specific visible fields from helper accessors.

**Step 2: Run test to verify it fails**

Run: `node tests/rec-edit-split-state.mjs`
Expected: FAIL with mismatched visible split data.

**Step 3: Write minimal implementation**

Update the app to:
- initialize split views via `ensureItemSplitViews`
- use helper-based visible values for `splitTag`, `musicDuration`, `estDuration`, and `sectionIndex`
- preserve existing shared metadata paths

**Step 4: Run test to verify it passes**

Run: `node tests/rec-edit-split-state.mjs`
Expected: PASS

### Task 3: Make split/merge/delete logic view-specific

**Files:**
- Modify: `app/scripts/app.js`

**Step 1: Write the failing test**

Add regression coverage that simulates split and merge operations over two view buckets and proves only the active view changes.

**Step 2: Run test to verify it fails**

Run: `node tests/rec-edit-split-state.mjs`
Expected: FAIL because the helper workflow for active-view split chains is incomplete.

**Step 3: Write minimal implementation**

Update:
- `checkCanSplit`
- `openSplitSlider`
- `confirmSplitSlider`
- `restoreSplitTime`
- delete guards

so they operate on the active TrackList/sidebar view instead of global top-level fields.

**Step 4: Run test to verify it passes**

Run: `node tests/rec-edit-split-state.mjs`
Expected: PASS

### Task 4: Verify app compatibility and package scripts

**Files:**
- Modify: `package.json`

**Step 1: Write the failing test**

Update the smoke test entrypoint expectations so the split-state regression is included in `npm test`.

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL until the new script is wired in and the implementation is stable.

**Step 3: Write minimal implementation**

Expose a reusable `verify:split-state` script and make `npm test` run both verifications.

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS
