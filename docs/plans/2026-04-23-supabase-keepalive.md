# Supabase Keepalive Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a weekly GitHub Actions keepalive that calls a safe Supabase Auth endpoint with the project `anon` key.

**Architecture:** Keep the application code untouched and add an operational keepalive layer around it. A small Node script will call the public Supabase Auth settings endpoint, and a GitHub Actions workflow will schedule that script weekly. This avoids changing database schema or RLS.

**Tech Stack:** Node.js, GitHub Actions, Supabase Auth HTTP API, Node test runner

---

### Task 1: Document the approved approach

**Files:**
- Create: `/Users/jaychan/Documents/GitHub/Musche/docs/plans/2026-04-23-supabase-keepalive-design.md`
- Create: `/Users/jaychan/Documents/GitHub/Musche/docs/plans/2026-04-23-supabase-keepalive.md`

**Step 1: Save the design document with the confirmed RPC-based approach**

**Step 2: Save this implementation plan**

### Task 2: Write the failing keepalive test

**Files:**
- Create: `/Users/jaychan/Documents/GitHub/Musche/tests/supabase-keepalive.test.mjs`

**Step 1: Write a test that expects a keepalive script module at `/Users/jaychan/Documents/GitHub/Musche/scripts/supabase-keepalive.mjs`**

**Step 2: Write a test that expects a workflow file at `/Users/jaychan/Documents/GitHub/Musche/.github/workflows/supabase-keepalive.yml`**

**Step 3: Run the test to confirm it fails**

Run: `node --test tests/supabase-keepalive.test.mjs`
Expected: FAIL because the keepalive script and workflow do not exist yet

### Task 3: Implement the keepalive script

**Files:**
- Create: `/Users/jaychan/Documents/GitHub/Musche/scripts/supabase-keepalive.mjs`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/package.json`

**Step 1: Create a script that reads `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and optional `SUPABASE_KEEPALIVE_PATH`**

**Step 2: Make the script send a `GET` request to `/auth/v1/settings`**

**Step 3: Make non-2xx responses fail with a useful error message**

**Step 4: Expose a reusable test command in `package.json`**

### Task 4: Add the GitHub Actions workflow

**Files:**
- Create: `/Users/jaychan/Documents/GitHub/Musche/.github/workflows/supabase-keepalive.yml`

**Step 1: Add a weekly cron schedule**

**Step 2: Add `workflow_dispatch` for manual runs**

**Step 3: Use Node to run `/Users/jaychan/Documents/GitHub/Musche/scripts/supabase-keepalive.mjs`**

### Task 5: Verify the implementation

**Files:**
- Modify: `/Users/jaychan/Documents/GitHub/Musche/tests/modularization-smoke.mjs`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/package.json`

**Step 1: Update package-level verification so the new keepalive test is included**

**Step 2: Run the keepalive test directly**

Run: `node --test tests/supabase-keepalive.test.mjs`
Expected: PASS

**Step 3: Run package-level verification**

Run: `npm test`
Expected: PASS

**Step 4: Inspect the diff**

Run: `git diff --stat`
Expected: changes limited to docs, workflow, script, package metadata, and tests
