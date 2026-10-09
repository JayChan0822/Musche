# Sidebar Stats Refactor Design

**Goal:** Move sidebar statistics and stat-card interaction logic out of `app/scripts/app.js` without changing template bindings or runtime behavior.

## Current State

`app/scripts/app.js` still owns the sidebar statistics layer:

- `calculateGroupStats`
- `musicianStats`, `projectStats`, and `instrumentStats`
- `activeTaskCount`
- `currentSidebarList`
- stat-card expansion state
- stat-card click and schedule-jump actions
- `updateMusicianRatio`

This code is a large business-logic island, but it is coupled to global search and scheduling. `filteredScheduledTasks` uses the stats to interpret status search terms, while `calculateGroupStats` uses `globalSearchQuery` to filter sidebar items.

## Target State

Add `app/scripts/features/sidebar-stats.js` with a `registerSidebarStatsFeature(context)` function that follows the existing feature module pattern. `app.js` should keep the same root variable names for `app/index.html`, but those names should be thin bindings to the feature module return values.

The refactor should not move `filteredScheduledTasks` yet. Keeping it in `app.js` avoids changing search behavior and preserves the current initialization order.

## Feature Boundary

Move these responsibilities into the new feature:

- `calculateGroupStats`
- `musicianStats`
- `projectStats`
- `instrumentStats`
- `activeTaskCount`
- `currentSidebarList`
- `expandedStatsIds`
- `toggleStatCollapse`
- `updateMusicianRatio`
- `jumpToStatSchedule`
- `handleStatCardClick`

Keep these in `app.js` for now:

- `filteredScheduledTasks`
- `searchFeature` setup
- `smartScrollToTask`
- keyboard navigation through expanded stats
- task editing, recording, scheduling, and drag/drop behavior

## Dependencies

`registerSidebarStatsFeature` should receive:

- `refs`: `itemPool`, `scheduledTasks`, `currentSessionId`, `globalSearchQuery`, `sidebarTab`, `sortField`, `sortAsc`, `statClickIndexMap`
- `state`: `settings`
- `utils`: `parseTime`, `formatSecs`, `calculateEstTime`, `getNameById`, `getFullSearchText`, `smartMatch`, `isItemVisibleForView`, `peekSplitViewState`
- `actions`: `pushHistory`, `openAlertModal`, `smartScrollToTask`, `triggerTouchHaptic`

The module may import `computed` and `reactive` directly from Vue.

## Risks

- `filteredScheduledTasks` depends on `musicianStats`, `projectStats`, and `instrumentStats`, so `app.js` must register sidebar stats before defining or evaluating dependent search behavior.
- `calculateGroupStats` depends on `getFullSearchText` and `smartMatch`, which currently live in `app.js`.
- Several keyboard paths still read `currentSidebarList` and `expandedStatsIds`; names must remain stable.
- `updateMusicianRatio` has legacy behavior that only updates musician ratios, even when the sidebar can show project/instrument tabs. Preserve that behavior in this pass.

## Validation

- Add a smoke check that `app/scripts/features/sidebar-stats.js` exists and passes `node --check`.
- Keep `app/index.html` unchanged.
- Run `node --check app/scripts/app.js` and `node --check app/scripts/features/sidebar-stats.js`.
- Run `npm run verify:modularization`.
- Run `npm test`.
- Run `npm run build`.
