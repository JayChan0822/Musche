# Index HTML Modularization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the current single-file `www/index.html` app into a progressively modularized structure inside `www/` while keeping behavior and deployment flow stable.

**Architecture:** Keep `www/index.html` as the runtime entry, but move pure helpers, external integrations, styles, and feature logic into dedicated modules. The Vue root app becomes an orchestration layer rather than the home for all logic.

**Tech Stack:** Vue 3 global build, plain JavaScript modules, CSS, Supabase CDN client, JZZ MIDI libraries, Capacitor plugins.

---

### Task 1: Create the modular file skeleton

**Files:**
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/index.html`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/app.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/state/app-state.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/state/defaults.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/utils/time.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/utils/format.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/utils/id.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/utils/midi.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/utils/csv.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/services/storage-service.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/services/supabase-service.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/services/device-service.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/features/schedule.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/features/settings.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/features/import-csv.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/features/import-midi.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/features/auth.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/features/mobile-ui.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/styles/base.css`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/styles/layout.css`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/styles/components.css`
- Create: `/Users/jaychan/Documents/GitHub/Musche/www/styles/mobile.css`

**Step 1: Add empty module files with explicit export stubs**

```js
// www/scripts/utils/time.js
export function parseTime(value) {
  throw new Error('parseTime not implemented');
}
```

```js
// www/scripts/features/schedule.js
export function registerScheduleFeature(context) {
  return {};
}
```

**Step 2: Update `index.html` to load CSS files and `app.js` as a module**

```html
<link rel="stylesheet" href="./styles/base.css">
<link rel="stylesheet" href="./styles/layout.css">
<link rel="stylesheet" href="./styles/components.css">
<link rel="stylesheet" href="./styles/mobile.css">
<script type="module" src="./scripts/app.js"></script>
```

**Step 3: Keep the existing inline app temporarily, but add a migration marker**

Expected result:
- the page still boots
- new files exist
- there is a clear destination structure for later tasks

**Step 4: Run a smoke load**

Run: `python3 -m http.server 4173`

Expected:
- local server starts
- `http://localhost:4173/www/` serves the app shell

**Step 5: Commit**

```bash
git add www/index.html www/scripts www/styles
git commit -m "chore: scaffold modular web app structure"
```

### Task 2: Extract pure time, format, and id helpers

**Files:**
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/index.html`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/app.js`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/utils/time.js`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/utils/format.js`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/utils/id.js`

**Step 1: Move pure helper functions into dedicated modules**

Target candidates from `index.html`:
- `parseTime`
- `formatSecs`
- `formatDate`
- `timeToMinutes`
- `addMinutesToTime`
- `addDaysToDate`
- `generateUniqueId`

```js
// www/scripts/utils/id.js
export function generateUniqueId(prefix = 'ID') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
```

**Step 2: Import helpers into `app.js` and pass them into the app context**

```js
import { parseTime, timeToMinutes, addMinutesToTime, addDaysToDate } from './utils/time.js';
import { formatDate, formatSecs } from './utils/format.js';
import { generateUniqueId } from './utils/id.js';
```

**Step 3: Replace duplicate inline definitions with imported references**

Expected:
- no behavior change
- helper logic is no longer embedded in the giant `setup()`

**Step 4: Run a manual syntax/smoke check**

Run: `node --check www/scripts/app.js`

Expected:
- no syntax errors in `app.js`

**Step 5: Commit**

```bash
git add www/index.html www/scripts/app.js www/scripts/utils
git commit -m "refactor: extract shared time and formatting helpers"
```

### Task 3: Extract MIDI and CSV utility helpers

**Files:**
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/index.html`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/utils/midi.js`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/utils/csv.js`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/app.js`

**Step 1: Move non-Vue MIDI helpers into `midi.js`**

Target candidates:
- `calculateBarQuantizedDuration`
- `buildTempoMap`
- `jzzTicksToSeconds`
- `buildTimeSigMap`
- `extractNotesFromJZZTrack`
- name-normalization helpers used by import flow

**Step 2: Move CSV parsing helpers into `csv.js`**

Target candidates:
- `extractTime`
- `normalizeDate`
- `getOrchString`
- lightweight row/header normalization helpers

**Step 3: Keep feature orchestration in the app, move pure transformations out**

Expected:
- MIDI/CSV logic is easier to isolate
- import feature code gets shorter before full feature extraction

**Step 4: Run smoke checks for import entry points**

Run: `node --check www/scripts/utils/midi.js`

Run: `node --check www/scripts/utils/csv.js`

Expected:
- both modules parse successfully

**Step 5: Commit**

```bash
git add www/index.html www/scripts/app.js www/scripts/utils/midi.js www/scripts/utils/csv.js
git commit -m "refactor: extract midi and csv helper modules"
```

### Task 4: Extract persistence and device services

**Files:**
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/index.html`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/app.js`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/services/storage-service.js`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/services/supabase-service.js`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/services/device-service.js`

**Step 1: Wrap local storage access in `storage-service.js`**

```js
export function loadLocalData(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

export function saveLocalData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
```

**Step 2: Wrap Supabase setup and data calls in `supabase-service.js`**

Target responsibilities:
- create client
- auth helpers
- cloud data load/save
- avatar upload
- factory reset cloud deletion

**Step 3: Wrap Capacitor notifications and haptics in `device-service.js`**

Target responsibilities:
- safe plugin detection
- `triggerTouchHaptic`
- schedule/cancel notifications

**Step 4: Replace direct external API access in app code**

Expected:
- app code stops importing side effects directly
- sync bugs become traceable through service modules

**Step 5: Verify auth and save initialization manually**

Run: `node --check www/scripts/services/storage-service.js`

Run: `node --check www/scripts/services/supabase-service.js`

Run: `node --check www/scripts/services/device-service.js`

Expected:
- service modules parse successfully

**Step 6: Commit**

```bash
git add www/index.html www/scripts/app.js www/scripts/services
git commit -m "refactor: extract storage, cloud, and device services"
```

### Task 5: Extract the scheduling feature

**Files:**
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/index.html`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/app.js`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/features/schedule.js`

**Step 1: Move scheduling-specific behavior behind a feature registration function**

Target candidates:
- `checkOverlap`
- drag/drop scheduling helpers
- schedule resizing helpers
- schedule-specific calculations that depend on shared state

```js
export function registerScheduleFeature(context) {
  const { refs, utils, services } = context;

  function checkOverlap(date, startTime, duration, excludeId, type) {
    // migrated logic
  }

  return {
    checkOverlap,
    dropToSchedule,
    dropToPool,
    autoResizeScheduleByRecords,
  };
}
```

**Step 2: Keep only template wiring in the root app**

Expected:
- drag/drop code is no longer mixed with auth/import/settings concerns

**Step 3: Run manual schedule smoke checks**

Check:
- drag pool item into schedule
- move scheduled item
- reject obvious overlaps
- move task back to pool

**Step 4: Commit**

```bash
git add www/index.html www/scripts/app.js www/scripts/features/schedule.js
git commit -m "refactor: extract schedule feature module"
```

### Task 6: Extract settings management feature

**Files:**
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/index.html`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/app.js`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/features/settings.js`

**Step 1: Move settings-library operations into one module**

Target candidates:
- item add/remove flows
- rename/merge logic
- grouped list utilities that depend on settings state
- bulk clear helpers for instruments, musicians, and projects

**Step 2: Return only template-facing handlers**

Expected:
- settings bugs become isolated from scheduling and import logic

**Step 3: Run manual settings smoke checks**

Check:
- create item
- rename item
- merge into existing item
- clear one library with confirmation

**Step 4: Commit**

```bash
git add www/index.html www/scripts/app.js www/scripts/features/settings.js
git commit -m "refactor: extract settings management feature"
```

### Task 7: Extract CSV and MIDI import features

**Files:**
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/index.html`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/app.js`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/features/import-csv.js`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/features/import-midi.js`

**Step 1: Move CSV modal state and import orchestration into `import-csv.js`**

Target candidates:
- preview prep
- row selection state
- final import execution

**Step 2: Move MIDI modal state and import orchestration into `import-midi.js`**

Target candidates:
- file handling
- track grouping
- smart matching
- project MIDI mapping

**Step 3: Keep imported pure helpers in `utils/` and orchestration in features**

Expected:
- import code is split by domain instead of hidden in root app scope

**Step 4: Run manual import smoke checks**

Check:
- open CSV import modal
- preview data builds
- open MIDI import modal
- MIDI track list renders

**Step 5: Commit**

```bash
git add www/index.html www/scripts/app.js www/scripts/features/import-csv.js www/scripts/features/import-midi.js
git commit -m "refactor: extract import workflow feature modules"
```

### Task 8: Extract auth and mobile-ui features

**Files:**
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/index.html`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/app.js`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/features/auth.js`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/features/mobile-ui.js`

**Step 1: Move auth/profile logic into `auth.js`**

Target candidates:
- login/register/reset/logout
- avatar/nickname updates
- session/load boot flow

**Step 2: Move layout/device interaction logic into `mobile-ui.js`**

Target candidates:
- `refreshLayout`
- mobile menu toggles
- resize listeners
- visibility/page show refresh hooks

**Step 3: Verify app boot flow and mobile-safe layout behavior**

Check:
- app boots
- auth modal still opens
- theme still applies
- mobile mode still toggles on narrow touch viewport

**Step 4: Commit**

```bash
git add www/index.html www/scripts/app.js www/scripts/features/auth.js www/scripts/features/mobile-ui.js
git commit -m "refactor: extract auth and mobile app shell features"
```

### Task 9: Split CSS out of `index.html`

**Files:**
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/index.html`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/styles/base.css`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/styles/layout.css`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/styles/components.css`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/styles/mobile.css`

**Step 1: Move base document and theme rules to `base.css`**

**Step 2: Move layout/grid/sidebar rules to `layout.css`**

**Step 3: Move modal/card/button/task-block rules to `components.css`**

**Step 4: Move responsive overrides and touch-specific styles to `mobile.css`**

**Step 5: Remove the large inline `<style>` block from `index.html`**

Expected:
- CSS concerns are inspectable without scrolling through JS
- mobile overrides stop being buried among unrelated rules

**Step 6: Manual visual smoke check**

Check:
- page shell renders
- modals still style correctly
- schedule columns still align
- mobile sheet behavior still looks intact

**Step 7: Commit**

```bash
git add www/index.html www/styles
git commit -m "refactor: extract stylesheets from index html"
```

### Task 10: Final shrink and verification

**Files:**
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/index.html`
- Modify: `/Users/jaychan/Documents/GitHub/Musche/www/scripts/app.js`

**Step 1: Remove dead inline helpers and transitional duplicates**

**Step 2: Ensure `index.html` contains only shell markup, dependency loading, and mount hooks**

**Step 3: Run final verification**

Run: `node --check www/scripts/app.js`

Run: `python3 -m http.server 4173`

Expected:
- modules parse
- app loads from local server

Manual checks:
- task creation
- task scheduling
- settings edit
- CSV import modal
- MIDI import modal
- login/logout

**Step 4: Inspect git diff for accidental behavior changes**

Run: `git diff --stat`

Expected:
- changes are concentrated in modularization files

**Step 5: Commit**

```bash
git add www/index.html www/scripts www/styles
git commit -m "refactor: modularize single-file web app"
```
