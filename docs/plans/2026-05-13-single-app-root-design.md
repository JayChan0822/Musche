# Single App Root Design

**Goal:** Keep `app/` as the only application directory and remove `www/` from the active runtime, build, and deployment flow.

## Current State

The repo currently treats `app/` as the source root for Vite development, but still writes built output to `www/` and still points Capacitor at `www/`. That leaves two directories that both look like "the app", even though only `app/` is meant to be edited.

## Target State

- `app/` is the only web app directory the team needs to care about
- `capacitor.config.json` points `webDir` to `app`
- `vite.config.mjs` no longer emits runtime output into `www/`
- `www/` is deleted completely
- runtime-critical tests and verification no longer depend on `www/`

## Approach

Use a direct consolidation:

1. Repoint active config from `www/` to `app/`
2. Remove the Vite copy/output behavior that keeps `www/` alive
3. Delete `www/`
4. Re-run build and tests to confirm the app still serves from `app/`

## Risks

- Capacitor may rely on `webDir` staying aligned with the web runtime root
- Some tests or scripts may still assume `www/`
- Historical docs may mention `www/`, but only active runtime/config/test references need immediate cleanup

## Validation

- `capacitor.config.json` uses `"webDir": "app"`
- `npm test` passes
- `npm run build` passes
- no active runtime/config/test references point to `www/`
