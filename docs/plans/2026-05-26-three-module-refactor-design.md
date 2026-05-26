# Three Module Refactor Design

## Goal

Extract three large remaining feature areas from `app/scripts/app.js` without changing the DOM template or user-facing behavior:

- TrackList recording and section management
- Split task workflow
- MIDI manager workflow

## Scope

This pass creates three feature modules:

- `app/scripts/features/track-list.js`
- `app/scripts/features/split-task.js`
- `app/scripts/features/midi-manager.js`

`app.js` remains the composition root. It will import each module, pass refs/helpers/actions through registration contexts, and expose returned functions under the same names already used by `app/index.html`.

## TrackList Design

`track-list.js` owns TrackList recording data actions, section distribution, divider dragging, auto-scroll for TrackList drags, row deletion, record duration calculation, break minutes, and sorting. It receives `trackListData`, `trackListContainerRef`, `draggingSectionIndex`, `showTrackList`, `itemPool`, and `scheduledTasks` as refs. It receives helper actions such as `openAlertModal`, `openInputModal`, `pushHistory`, `autoUpdateEfficiency`, `checkCanDeleteSplit`, `restoreSplitTime`, `updateTaskNotification`, and `moveDivider`.

The existing card drag implementation in `app.js` still needs TrackList auto-scroll helpers, so the module returns `handleTrackListAutoScroll` and `stopTrackListAutoScroll` as internal-style proxies as well.

## Split Task Design

`split-task.js` owns split validation, split slider state, confirmation, direct split entry, and restore-split-time logic. It continues using the existing `split-state` utility functions. It receives `splitState`, `showSplitModal`, `itemPool`, `scheduledTasks`, `trackListData`, `currentSessionId`, and `sidebarTab`, plus actions such as `openAlertModal`, `openConfirmModal`, `pushHistory`, and `autoUpdateEfficiency`.

This module does not change split data shape. It only moves the current orchestration out of `app.js`.

## MIDI Manager Design

`midi-manager.js` owns the project MIDI manager modal and mapping lifecycle: open manager, grouped/collapsed manager rows, manual duration edits, removing mappings, clearing project MIDI data, MIDI group dropdown, and duration helpers used by the manager/import UI.

The existing `import-midi.js` module remains responsible for file parsing/import confirmation. `midi-manager.js` manages already-attached project MIDI data and UI-side helper calculations.

## Testing

Each module is added to `tests/modularization-smoke.mjs`, which verifies the new file exists and passes `node --check`. After each extraction, run `npm run verify:modularization` and `npm test`. After all three extractions, run `npm test` and `npm run build` in the worktree and again after merging to `main`.
