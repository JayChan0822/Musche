# Instant Month Positioning Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make continuous month view positioning immediate instead of animating through the six-month history buffer.

**Architecture:** Keep `scrollToMonthDate` unchanged because it already requests automatic positioning. Remove the conflicting CSS smooth-scroll utility from the month view container and lock the template contract with a boundary test.

**Tech Stack:** Vue 3 runtime templates, Tailwind CSS, Node test runner, Playwright CLI.

---

### Task 1: Add the regression test

**Files:**
- Modify: `tests/main-content-shell-app-boundary.test.mjs`

1. Assert that the month scroller retains `overflow-y-auto` and does not contain `scroll-smooth`.
2. Run `node --test tests/main-content-shell-app-boundary.test.mjs`.
3. Confirm the test fails because the current template includes `scroll-smooth`.

### Task 2: Remove conflicting smooth scrolling

**Files:**
- Modify: `app/scripts/components/app-main-content.js`

1. Remove only `scroll-smooth` from the month view container class list.
2. Run the focused test and confirm it passes.

### Task 3: Verify integration

1. Run `npm test`.
2. Run `npm run build`.
3. Open the local app, switch to continuous month view, and verify the scrolling container computes to `scroll-behavior: auto` and positions without a long animated journey.
