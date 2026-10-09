# Musche Index HTML Modularization Design

**Date:** 2026-03-28

**Goal:** Reduce the maintenance risk of the current single-file application by progressively modularizing the code in `www/index.html` without changing the deployment model or rewriting the UI architecture.

## Current State

The project is effectively a single-page app implemented entirely inside [`www/index.html`](/Users/jaychan/Documents/GitHub/Musche/www/index.html). The file is about 18.6k lines and currently mixes:

- page markup and modal templates
- global styles and responsive overrides
- Vue app bootstrapping
- reactive state initialization
- scheduling logic
- drag and drop behavior
- CSV import logic
- MIDI import and duration calculation
- Supabase authentication and sync
- Capacitor notifications and haptics
- mobile-specific layout and gesture handling

This creates three recurring problems:

- Bug localization is hard because unrelated features share one scope.
- Safe refactoring is hard because functions and state are tightly coupled.
- Reuse is low because pure helpers, external services, and feature logic are not separated.

## Constraints

The approved design constraints for this refactor are:

- Prioritize structure and maintainability over adding new behavior.
- Keep the current release model stable.
- Avoid a full migration to Vite or Vue SFCs in this phase.
- Allow small UI/interaction cleanups only when they help stability.
- Minimize regressions in existing flows.

## Approaches Considered

### 1. Minimal extraction only

Move a few helpers out of `index.html` and stop there.

Pros:

- lowest short-term risk
- fast to start

Cons:

- leaves most business logic coupled
- does not materially improve bug-fixing speed

### 2. Progressive modularization inside `www/`

Keep `www/index.html` as the entry page, but extract scripts and styles into organized modules under `www/`.

Pros:

- large maintainability gain with controlled risk
- preserves current deployment assumptions
- creates a bridge toward future tooling upgrades

Cons:

- requires careful dependency untangling
- some transitional glue code will remain

### 3. Full frontend rebuild

Migrate immediately to a modern `src/` + bundler + component-based architecture.

Pros:

- best long-term engineering model

Cons:

- too risky for the current codebase and user goal
- mixes restructuring with platform migration

## Chosen Approach

Use **progressive modularization inside `www/`**.

The first phase keeps [`www/index.html`](/Users/jaychan/Documents/GitHub/Musche/www/index.html) as the runtime entry point, but reduces it to:

- document shell and root container
- CDN dependencies already required by runtime
- minimal bootstrapping hooks
- script module imports in a predictable order

The rest of the logic moves into dedicated files.

## Target Architecture

### Entry layer

- `www/index.html`
- `www/scripts/app.js`

Responsibility:

- load dependencies
- create and mount the Vue app
- assemble state, services, and features

### Shared state layer

- `www/scripts/state/app-state.js`
- `www/scripts/state/defaults.js`

Responsibility:

- define reactive state containers
- centralize default settings and boot data
- remove scattered inline state initialization

### Utility layer

- `www/scripts/utils/time.js`
- `www/scripts/utils/format.js`
- `www/scripts/utils/id.js`
- `www/scripts/utils/midi.js`
- `www/scripts/utils/csv.js`

Responsibility:

- pure, side-effect-free helpers
- reusable parsing and conversion logic
- easier unit-like verification via direct browser console/manual checks

### Service layer

- `www/scripts/services/storage-service.js`
- `www/scripts/services/supabase-service.js`
- `www/scripts/services/device-service.js`

Responsibility:

- isolate external APIs
- make cloud sync, local persistence, notifications, and haptics easier to debug

### Feature layer

- `www/scripts/features/schedule.js`
- `www/scripts/features/settings.js`
- `www/scripts/features/import-csv.js`
- `www/scripts/features/import-midi.js`
- `www/scripts/features/auth.js`
- `www/scripts/features/mobile-ui.js`

Responsibility:

- group code by user-facing domain
- keep business rules close to the feature they serve
- reduce accidental cross-feature edits

### Style layer

- `www/styles/base.css`
- `www/styles/layout.css`
- `www/styles/components.css`
- `www/styles/mobile.css`

Responsibility:

- split long inline style blocks by concern
- make responsive behavior easier to inspect and adjust

## First-Round Extraction Scope

The first implementation round should only target high-confidence, high-value extractions:

1. Move pure helpers first.
2. Move external-service wrappers second.
3. Move high-value business modules third:
   - scheduling
   - settings library management
   - CSV import
   - MIDI import
4. Shrink the root `setup()` last.

The first round should explicitly avoid:

- a full UI redesign
- changing the current deployment target
- converting templates into component files
- large-scale renaming of data fields
- rewriting fragile mobile interactions unless required by extraction

## Data and Dependency Rules

To keep the refactor safe, the code should follow these rules:

- Utilities must not touch Vue refs directly.
- Services must own all direct calls to Supabase, `localStorage`, and Capacitor plugins.
- Features may depend on shared state and services, but should expose clear setup functions.
- `app.js` should coordinate modules, not contain business logic.
- Any function still needed by the template should be returned from a centralized exposed API instead of being left scattered in one large closure.

## Verification Strategy

Because the project currently lacks a real test suite, phase-one verification will rely on targeted smoke checks:

- page loads without syntax/runtime boot failure
- task pool still renders
- schedule drag/drop still works
- settings library edits still persist
- CSV import preview still opens
- MIDI import preview still opens
- login/logout and local save/cloud save still initialize correctly

After the structure is stable, the next phase can add automated checks around extracted pure utilities.

## Expected Outcome

After phase one:

- `www/index.html` should be substantially shorter
- major logic areas should have clear homes
- bug fixing should start from one module instead of searching one 18k-line file
- future migration to a full build toolchain will be much easier if desired
