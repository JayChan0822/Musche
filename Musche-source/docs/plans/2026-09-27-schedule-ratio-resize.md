# Schedule ratio and precise resizing implementation plan

**Goal:** Display musician ratios from scheduled block durations; snap ordinary edge resizing to 15 minutes and Command resizing to 1 minute.

**Architecture:** Add a derived musician schedule ratio to sidebar statistics without changing estimation defaults or recorded efficiency. Use the stored duration plus pointer displacement when resizing, retaining overlap rollback and history. Desktop checks the current Command modifier on each movement; mobile uses 15 minutes.

**Tech stack:** Vue reactive state, JavaScript, Node test runner, Vite.

## Approved behavior

- Ratio = current-session musician block seconds / associated non-skipped music seconds, with one decimal place. Aggregate sections and individual template references identify music; count each pool item once. Search does not change the ratio. Unscheduled musicians retain the existing display fallback.
- Ordinary bottom-edge dragging snaps the end time to quarter-hours; Command uses whole minutes. The existing five-minute minimum remains.
- Ratio previews react immediately to a block change and roll back on conflicts or undo. No update of musician defaults or other tasks merely for rendering a ratio.

## Work

1. Add behavior tests in `tests/schedule-ratio-resize.test.mjs` for live ratio, multiple blocks, session/search isolation, skipped/missing music, desktop modifiers, mobile snapping, and rollback. Run them before implementation.
2. Update `app/scripts/features/sidebar-stats.js` and `app/scripts/components/app-sidebar.js` to expose/display the derived ratio.
3. Update desktop/mobile resize features and the resize tooltip. Adjust existing smoke expectations from 30-minute to 15-minute snapping.
4. Run focused tests, `npm test`, and `npm run build`. Review the diff; report any unrelated baseline failure separately.

## Added request: quick-create names

Pass each new-task dropdown's current search string into `openQuickAdd(type, initialName)` and trim it into the editable name field. Reset other form fields as before. Cover project/instrument/musician creation and saving with `tests/quick-add-prefill.test.mjs`.

## Validation

- 12 focused behavior tests pass, including live modifier switching, conflict rollback, undo/redo, and all three quick-create forms.
- Full suite: 305 pass, 1 optional external MIDI fixture skipped; 1 pre-existing `capacitor-removal` failure because the repository contains the native iOS project.
- Production build and `git diff --check` pass.
- Browser interaction verification blocked: sandbox prohibits listening on the preview port; approval service returned HTTP 502 when starting the local-only preview server.
