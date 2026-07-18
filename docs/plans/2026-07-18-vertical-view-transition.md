# Vertical View Transition Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the diagonal-looking week/month zoom with reciprocal pure vertical transitions.

**Architecture:** Keep the existing Vue `Transition` boundary and choose a direction-specific transition name in the view navigation feature. Replace the scale-based CSS rules with transform-only vertical enter and leave states while preserving absolute overlap and opacity fading.

**Tech Stack:** Vue 3, CSS transitions, Node test runner, Playwright CLI.

---

### Task 1: Lock the transition contract

**Files:**
- Create: `tests/main-view-transition.test.mjs`

1. Test that switching to month selects `view-slide-up` and switching back to week selects `view-slide-down`.
2. Test that the CSS endpoints use `translate3d(0, +/-30px, 0)` and contain neither `scale` nor horizontal translation.
3. Run `node --test tests/main-view-transition.test.mjs` and confirm it fails because the current implementation still selects zoom transitions.

### Task 2: Implement vertical transitions

**Files:**
- Modify: `app/scripts/features/main-view-navigation.js`
- Modify: `app/styles/components.css`
- Modify: `tests/modularization-smoke.mjs`

1. Select `view-slide-up` when entering month view and `view-slide-down` when returning to week view.
2. Replace the zoom CSS rules with reciprocal vertical translation and opacity rules.
3. Update the existing modularization expectation to the new transition name.
4. Run the focused test and modularization smoke check.

### Task 3: Verify integration

1. Run `npm test`.
2. Run `npm run build`.
3. Use a real browser to switch between week and month views and inspect active keyframes for zero horizontal movement and zero scaling.
