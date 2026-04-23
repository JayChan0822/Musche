# Supabase Keepalive Design

**Goal:** Keep the Supabase project active by calling a safe public Supabase Auth endpoint from GitHub Actions once per week, without exposing business data or weakening the existing `user_data` access rules.

## Current State

The repository already uses Supabase for authentication and `user_data` persistence, but it does not contain any GitHub Actions workflow or keepalive endpoint.

The live Supabase project currently has:

- one table in `public`: `user_data`
- Row Level Security enabled
- a `SELECT` policy that only allows a signed-in user to read rows where `auth.uid() = user_id`

This means a GitHub Action cannot safely keep the project alive by querying `user_data` with only the `anon` key, because the workflow has no user session.

During implementation, the public Auth endpoint `GET /auth/v1/settings` was verified to return `200 OK` with the project `anon` key. That makes it a better keepalive target than a custom SQL function.

## Target State

The system should have a dedicated keepalive request with these properties:

- GitHub Actions runs on a weekly schedule
- the action calls `GET /auth/v1/settings` with the `anon` key
- the endpoint does not expose application row data
- existing `user_data` RLS behavior stays unchanged
- the workflow can also be triggered manually for debugging

## Non-Goals

- no change to `user_data` table policies
- no service-role key usage
- no new application feature exposed in the UI
- no Supabase CLI migration setup for this repository
- no database schema changes

## Approach Options

### 1. Recommended: Public Auth settings request

Call `GET /auth/v1/settings` with the project `anon` key from GitHub Actions.

Why this is recommended:

- keeps the existing table permissions intact
- avoids database schema changes entirely
- does not expose application row data
- easy to audit and easy to call with plain `fetch`
- keeps the repository lightweight because no extra SDK dependency is needed

### 2. Public keepalive RPC

Create a tiny SQL function such as `public.keepalive_ping()` and grant `anon` execute access.

Why this is not the current recommendation:

- requires database changes for a problem that already has a safe public endpoint
- adds more operational steps
- still creates a new public surface area, even if it is small

### 3. Authenticated user session in GitHub Actions

Log in as a real user and call `user_data` under the existing policy.

Why this is not recommended:

- more fragile because it depends on credential flow and session state
- higher operational risk than a purpose-built RPC
- violates the goal of keeping the keepalive endpoint minimal

## Risks And Mitigations

### Risk 1: The workflow silently stops working

Mitigation:

- make the script fail loudly on non-2xx responses
- print status code and response body snippet in the action log
- keep `workflow_dispatch` enabled for manual checks

### Risk 2: The keepalive endpoint exposes too much

Mitigation:

- use the existing Auth settings endpoint instead of creating a new public database surface
- avoid reading from application tables

### Risk 3: Cron timing is confusing

Mitigation:

- use one explicit weekly UTC cron expression in the workflow
- document the local China Standard Time equivalent in the final handoff

## Validation Strategy

The change is successful when all of the following are true:

- the repository contains a workflow at `.github/workflows/supabase-keepalive.yml`
- the repository contains a script that requests `/auth/v1/settings` using `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- automated tests cover success and failure handling for the script
- the workflow can be manually dispatched after the required GitHub Secrets are set

## Recommendation

Proceed with the weekly GitHub Actions workflow plus the existing public Auth settings endpoint. This is the smallest secure change that matches the project’s current RLS setup and avoids unnecessary database changes.
