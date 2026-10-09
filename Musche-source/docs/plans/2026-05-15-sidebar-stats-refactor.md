# Sidebar Stats Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract sidebar statistics and stat-card interaction logic from `app/scripts/app.js` into `app/scripts/features/sidebar-stats.js`.

**Architecture:** Add `registerSidebarStatsFeature(context)` using the existing feature module style. Keep `filteredScheduledTasks` and template bindings in place by returning the same names from the new module and assigning them in `app.js`.

**Tech Stack:** Vue 3 composition API, Vite ES modules, Node.js smoke tests

---

### Task 1: Add the modularization regression

**Files:**
- Modify: `/Users/jaychan/Documents/GitHub/Musche/.worktrees/sidebar-stats-refactor/tests/modularization-smoke.mjs`

**Step 1: Write the failing test**

Add `app/scripts/features/sidebar-stats.js` to the `requiredFiles` array.

**Step 2: Run test to verify it fails**

Run: `npm run verify:modularization`
Expected: FAIL because `app/scripts/features/sidebar-stats.js` does not exist.

### Task 2: Create sidebar-stats feature module

**Files:**
- Create: `/Users/jaychan/Documents/GitHub/Musche/.worktrees/sidebar-stats-refactor/app/scripts/features/sidebar-stats.js`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/.worktrees/sidebar-stats-refactor/app/scripts/app.js`

**Step 1: Move sidebar stats logic into the new module**

Create `registerSidebarStatsFeature(context)` and move:

- `calculateGroupStats`
- `musicianStats`
- `projectStats`
- `instrumentStats`
- `activeTaskCount`
- `currentSidebarList`
- `expandedStatsIds`
- `toggleStatCollapse`
- `updateMusicianRatio`
- `jumpToStatSchedule`
- `handleStatCardClick`

**Step 2: Wire the module into app.js**

Import `registerSidebarStatsFeature`, register it after `isMobile` is declared and before `searchFeature` setup, then assign returned values back to the same local names currently used by template and later functions.

**Step 3: Run test to verify it passes**

Run: `npm run verify:modularization`
Expected: PASS.

### Task 3: Verify runtime and full suite

**Files:**
- Test: `/Users/jaychan/Documents/GitHub/Musche/.worktrees/sidebar-stats-refactor/tests/modularization-smoke.mjs`
- Test: `/Users/jaychan/Documents/GitHub/Musche/.worktrees/sidebar-stats-refactor/package.json`

**Step 1: Syntax-check touched app files**

Run: `node --check app/scripts/app.js && node --check app/scripts/features/sidebar-stats.js`
Expected: PASS.

**Step 2: Run full tests**

Run: `npm test`
Expected: PASS.

**Step 3: Run production build**

Run: `npm run build`
Expected: PASS.

**Step 4: Inspect git diff**

Run: `git diff --stat && git diff --check`
Expected: Only the planned feature extraction, smoke test update, and docs changes; no whitespace errors.
