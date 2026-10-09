# Calendar View Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract the month/week calendar view and navigation logic from `app/scripts/app.js` into `app/scripts/features/calendar-view.js` while preserving template bindings and runtime behavior.

**Architecture:** Add a `registerCalendarViewFeature(context)` module that follows the existing feature registration pattern. Keep `app/index.html` unchanged by exposing the same root names from `app.js`.

**Tech Stack:** Vue 3 composition API, Vite ES modules, Node.js smoke tests

---

### Task 1: Add the modularization regression

**Files:**
- Modify: `/Users/jaychan/Documents/GitHub/Musche/.worktrees/calendar-view-refactor/tests/modularization-smoke.mjs`

**Step 1: Write the failing test**

Add `app/scripts/features/calendar-view.js` to the `requiredFiles` array.

**Step 2: Run test to verify it fails**

Run: `npm run verify:modularization`
Expected: FAIL because `app/scripts/features/calendar-view.js` does not exist.

### Task 2: Create calendar-view feature module

**Files:**
- Create: `/Users/jaychan/Documents/GitHub/Musche/.worktrees/calendar-view-refactor/app/scripts/features/calendar-view.js`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/.worktrees/calendar-view-refactor/app/scripts/app.js`

**Step 1: Move calendar logic into the new module**

Create `registerCalendarViewFeature(context)` and move:

- `renderedRange`
- `isLoadingMore`
- `setMonthRef`
- `initMonthObserver`
- `watch(monthViewMode, ...)`
- `timeSlots`
- `dateTransitionName`
- `changeDate`
- `currentWeekDays`
- `generateMonthGrid`
- `currentMonthDays`
- `flatScrolledDays`
- `handleInfiniteScroll`
- `scrollToMonthDate`
- `watch(flatScrolledDays, ...)`
- `currentDateLabel`
- `tasksByDateMap`
- `getTasksForDate`
- `switchToWeek`
- `jumpToToday`

**Step 2: Wire the module into app.js**

Import `registerCalendarViewFeature`, create `calendarViewFeature`, and destructure returned names back to the same local identifiers used by the template.

**Step 3: Run test to verify it passes**

Run: `npm run verify:modularization`
Expected: PASS.

### Task 3: Verify runtime and full suite

**Files:**
- Test: `/Users/jaychan/Documents/GitHub/Musche/.worktrees/calendar-view-refactor/tests/modularization-smoke.mjs`
- Test: `/Users/jaychan/Documents/GitHub/Musche/.worktrees/calendar-view-refactor/package.json`

**Step 1: Syntax-check the touched app files**

Run: `node --check app/scripts/app.js && node --check app/scripts/features/calendar-view.js`
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
