# App Root Cleanup Design

**Goal:** Move the web app runtime root from `www/` to `app/`, clean non-essential project clutter, and keep the current Capacitor-based deployment model working without introducing a new build pipeline.

## Current State

The repository currently mixes three different concerns at the top level:

- actual runtime web assets in `www/`
- native/container integration in `ios/` and `capacitor.config.json`
- historical backups, cache artifacts, and temporary outputs such as `__old__/`, `test-results/`, `DerivedData`, and multiple `.DS_Store` files

This makes the repository feel heavier than the real project footprint and leaves the app’s primary source directory nested under `www/`, even though the user wants the maintained project surface to live outside that folder.

## Target State

The repository should be reorganized to this shape:

```text
Musche/
├─ app/
│  ├─ index.html
│  ├─ scripts/
│  └─ styles/
├─ docs/
├─ icon/
├─ ios/
├─ tests/
├─ capacitor.config.json
├─ package.json
└─ package-lock.json
```

Key outcomes:

- `app/` becomes the single runtime web root
- `capacitor.config.json` points `webDir` at `app`
- `www/` is removed completely
- obvious non-essential clutter is deleted

## Non-Goals

- no migration to Vite, Vue SFC, or any bundler
- no change to application behavior beyond path relocation
- no new build or copy step
- no refactor of native iOS structure beyond deleting disposable generated cache output

## Approach Options

### 1. Recommended: Replace `www/` with `app/`

Move all current runtime files from `www/` into `app/`, update configuration and smoke tests, then delete `www/`.

Why this is recommended:

- simplest mental model: one runtime directory, one source of truth
- matches the user’s goal that the project主体 should live outside `www/`
- keeps release flow stable because Capacitor still reads a single static directory

### 2. Keep `www/` as output mirror

Move maintainable source to `app/` but keep a synchronized `www/` copy.

Why not recommended:

- duplicates files or adds sync complexity
- introduces drift risk without solving the root cleanliness problem

### 3. Use `src/` and `dist/`

Split source and output directories and introduce a build/copy step.

Why not recommended:

- over-engineered for the current static runtime setup
- adds tooling and workflow changes unrelated to the user’s request

## Risks and Mitigations

### Risk 1: Hidden references to `www/`

Some scripts, tests, docs, or config may still reference `www/`.

Mitigation:

- search for `www/` before and after the move
- update runtime-critical references first:
  - `capacitor.config.json`
  - `tests/modularization-smoke.mjs`
- leave purely historical docs untouched unless they would mislead active maintenance

### Risk 2: Cleaning files too aggressively

The repository contains historical files and generated folders that are safe to remove only if they are not part of the active product path.

Mitigation:

- only delete categories explicitly approved by the user:
  - `__old__/`
  - `test-results/`
  - `.DS_Store`
  - empty `.worktrees/`
  - `ios/DerivedData`
- do not touch:
  - `docs/`
  - `icon/`
  - `ios/App/`

### Risk 3: Static serving assumptions break

Current smoke checks assume `http://127.0.0.1:4173/www/`.

Mitigation:

- update smoke validation to use `http://127.0.0.1:4173/app/`
- confirm `index.html`, `scripts/app.js`, and CSS all load from the new root

## Validation Strategy

The change is successful when all of the following are true:

- `npm test` passes
- `capacitor.config.json` uses `"webDir": "app"`
- `app/index.html` exists and loads the modularized runtime entrypoint
- key app modules still pass `node --check`
- local static server can serve `/app/`
- `www/` no longer exists
- approved clutter directories/files are removed

## Recommendation

Proceed with the direct `www/` -> `app/` move, then clean the approved non-essential files in the same branch. This keeps the scope strictly organizational, preserves the existing deployment model, and gives the repository a much cleaner primary layout.
