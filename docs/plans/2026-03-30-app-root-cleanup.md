# App Root Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the runtime web app from `www/` to `app/`, remove approved clutter, and keep Capacitor plus local smoke verification working.

**Architecture:** Treat this as a directory relocation rather than a behavior refactor. The existing modularized static app becomes `app/`, Capacitor is repointed to that directory, and smoke tests are updated to validate the new runtime root. Cleanup only targets explicitly approved backup/cache/temp content.

**Tech Stack:** Static HTML/CSS/ES modules, Capacitor, Node.js smoke test script, git

---

### Task 1: Add the new `app/` runtime root

**Files:**
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/`
- Move: `/Users/jaychan/Documents/GitHub/Musche/www/index.html`
- Move: `/Users/jaychan/Documents/GitHub/Musche/www/scripts`
- Move: `/Users/jaychan/Documents/GitHub/Musche/www/styles`

**Step 1: Create `app/` and move the web runtime contents from `www/`**

**Step 2: Confirm `app/index.html`, `app/scripts/app.js`, and `app/styles/*.css` exist**

Run: `find app -maxdepth 2 -mindepth 1 | sort`
Expected: `index.html`, `scripts/`, and `styles/` under `app/`

**Step 3: Commit**

```bash
git add app
git commit -m "refactor: move web app root to app directory"
```

### Task 2: Repoint config and verification to `app/`

**Files:**
- Modify: `/Users/jaychan/Documents/GitHub/Musche/capacitor.config.json`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/tests/modularization-smoke.mjs`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/package.json` only if script text needs path updates

**Step 1: Update Capacitor `webDir` from `www` to `app`**

**Step 2: Update modularization smoke test paths from `www/...` to `app/...`**

**Step 3: Run the smoke test directly**

Run: `node tests/modularization-smoke.mjs`
Expected: `modularization smoke passed ...`

**Step 4: Run package-level verification**

Run: `npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add capacitor.config.json tests/modularization-smoke.mjs package.json
git commit -m "chore: repoint runtime config to app root"
```

### Task 3: Remove old `www/` and verify local serving

**Files:**
- Delete: `/Users/jaychan/Documents/GitHub/Musche/www`

**Step 1: Delete the now-obsolete `www/` directory**

**Step 2: Verify no runtime-critical references still point to `www/`**

Run: `rg -n "www/" . -g '!node_modules/**' -g '!docs/plans/2026-03-28-*'`
Expected: no active runtime/config/test references to `www/`

**Step 3: Verify local static serving from the new root**

Run: `python3 -m http.server 4173`

Check:
- `http://127.0.0.1:4173/app/` returns `200 OK`
- `/app/scripts/app.js` returns `200 OK`
- `/app/styles/base.css` returns `200 OK`

**Step 4: Commit**

```bash
git add -A app www capacitor.config.json tests
git commit -m "refactor: remove legacy www runtime root"
```

### Task 4: Clean approved non-essential files and folders

**Files:**
- Delete: `/Users/jaychan/Documents/GitHub/Musche/__old__`
- Delete: `/Users/jaychan/Documents/GitHub/Musche/test-results`
- Delete: `/Users/jaychan/Documents/GitHub/Musche/ios/DerivedData`
- Delete: repository `.DS_Store` files
- Delete: empty `/Users/jaychan/Documents/GitHub/Musche/.worktrees` if empty after verification

**Step 1: Delete only the user-approved non-essential content**

**Step 2: Verify the remaining top-level structure**

Run: `find . -maxdepth 2 -mindepth 1 | sort`
Expected: `app/`, `docs/`, `icon/`, `ios/`, `tests/`, and project config files remain

**Step 3: Run final verification**

Run: `npm test`
Expected: PASS

Run: `git diff --stat`
Expected: changes concentrated in `app/`, cleanup targets, config, and tests

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: clean project structure and remove obsolete files"
```
