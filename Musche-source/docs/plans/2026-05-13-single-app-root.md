# Single App Root Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove `www/` entirely and make `app/` the only web app directory used for development, verification, and Capacitor runtime.

**Architecture:** Treat this as a path consolidation, not a behavior refactor. Repoint active configuration to `app/`, remove the build-output mirror into `www/`, delete `www/`, and verify that development and test flows still work from `app/`.

**Tech Stack:** Vite, static HTML/CSS/ES modules, Capacitor, Node.js test scripts

---

### Task 1: Repoint active runtime configuration to `app`

**Files:**
- Modify: `/Users/jaychan/Documents/GitHub/Musche/capacitor.config.json`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/vite.config.mjs`

**Step 1: Remove the `www/`-specific Vite output/copy behavior**

**Step 2: Point Capacitor `webDir` at `app`**

**Step 3: Run the build to confirm config remains valid**

Run: `npm run build`
Expected: PASS

### Task 2: Delete `www/` and clean active references

**Files:**
- Delete: `/Users/jaychan/Documents/GitHub/Musche/www`
- Modify: active runtime/config/test references only if needed

**Step 1: Delete the `www/` directory**

**Step 2: Search for remaining active references to `www/`**

Run: `rg -n "www/" capacitor.config.json vite.config.mjs app tests package.json`
Expected: no results

### Task 3: Verify the consolidated structure

**Files:**
- Test: `/Users/jaychan/Documents/GitHub/Musche/tests/modularization-smoke.mjs`
- Test: `/Users/jaychan/Documents/GitHub/Musche/tests/rec-edit-split-state.mjs`
- Test: `/Users/jaychan/Documents/GitHub/Musche/tests/supabase-keepalive.test.mjs`

**Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS

**Step 2: Confirm the remaining app root shape**

Run: `find app -maxdepth 2 -type f | sort`
Expected: the web runtime files remain under `app/`

**Step 3: Check git status**

Run: `git status --short`
Expected: `www/` deletions plus config updates only
