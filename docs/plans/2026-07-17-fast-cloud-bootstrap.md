# Fast Cloud Bootstrap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove application-owned 404 errors and make signed-in cloud data available immediately from a safe local snapshot while bounding startup network waits.

**Architecture:** Keep cache and deadline behavior inside the auth feature so all cloud load/save paths share one snapshot format. Use a serve-only Vite HTML plugin for the existing local runtime config file and Vite's public directory for the favicon.

**Tech Stack:** Vue 3, Vite, Supabase JS, Node test runner.

---

### Task 1: Define cache and timeout behavior

**Files:**
- Modify: `tests/auth-sync-restore.test.mjs`
- Modify: `app/scripts/features/auth.js`

1. Add failing tests for synchronous cache restore, successful cloud cache persistence, deadline fallback, account mismatch, logout cleanup, and factory-reset cleanup.
2. Run `node --test tests/auth-sync-restore.test.mjs` and confirm the new assertions fail because cache/deadline behavior does not exist.
3. Add the minimal cache helpers, snapshot application helper, and startup deadline wrapper.
4. Run the focused test until it passes.

### Task 2: Remove production static-resource errors

**Files:**
- Modify: `tests/config-env.test.mjs`
- Modify: `tests/modularization-smoke.mjs`
- Modify: `app/index.html`
- Modify: `vite.config.mjs`
- Create: `app/public/icon/icon.png`

1. Add failing assertions that source/production HTML does not contain `config.local.js`, the development plugin injects it only while serving, and the public favicon exists.
2. Run the focused tests and confirm they fail on the current static script and missing public icon.
3. Remove the static script, add the serve-only Vite plugin, and copy the favicon into the public directory.
4. Run the focused tests and build until they pass.

### Task 3: Documentation and verification

**Files:**
- Modify: `README.md`
- Modify: `CLAUDE.md`

1. Document that `app/config.local.js` is injected only by the development server and hosted builds use Vite environment variables.
2. Run `node --test tests/auth-sync-restore.test.mjs tests/config-env.test.mjs`.
3. Run `npm test`.
4. Run `npm run build` and inspect `app/dist/index.html` and `app/dist/icon/icon.png`.
5. Run a local browser smoke test and confirm there are no application-owned config or favicon 404 errors.
