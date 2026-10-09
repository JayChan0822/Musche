# Calendar View Refactor Design

**Goal:** Move the month/week calendar view and navigation logic out of `app/scripts/app.js` without changing runtime behavior or template bindings.

## Current State

`app/scripts/app.js` is the Vue root component and still contains a large amount of view logic inside `setup()`. Existing modules under `app/scripts/features/` already use a `registerXFeature(context)` pattern, but calendar-specific logic remains inline:

- Week and month date generation
- Month scrolled-mode range management
- Month IntersectionObserver setup
- Date label and date navigation
- Calendar task grouping by date
- Today/week jump scrolling

The template in `app/index.html` calls many root-scope names directly, so a safe refactor should preserve those names while moving implementation behind a feature module.

## Target State

Add `app/scripts/features/calendar-view.js` with a `registerCalendarViewFeature(context)` function. The module returns the same names currently exposed by `app.js`, and `app.js` keeps thin bindings for the template.

The first pass should not rename template bindings, restructure the HTML, or change schedule behavior.

## Feature Boundary

Move these responsibilities into the new feature:

- `timeSlots`
- `currentWeekDays`
- `generateMonthGrid`
- `currentMonthDays`
- scrolled month state helpers such as `renderedRange` and `isLoadingMore`
- `flatScrolledDays`
- `setMonthRef`
- `initMonthObserver`
- month-view watcher setup
- `handleInfiniteScroll`
- `scrollToMonthDate`
- `currentDateLabel`
- `tasksByDateMap`
- `getTasksForDate`
- `switchToWeek`
- `changeDate`
- `jumpToToday`

Keep these in `app.js` for now:

- Drag and drop behavior
- Touch gesture handling
- TrackList behavior
- Sidebar statistics and search
- Modal, auth, import, export, and persistence logic

## Dependencies

`registerCalendarViewFeature` should receive:

- `refs`: `currentView`, `monthViewMode`, `viewDate`, `visibleTopDate`, `monthObserver`, `monthRefs`, `scheduledTasks`, `filteredScheduledTasks`, `weekContainer`, `pxPerMin`, `isMobile`
- `state`: `settings`
- `utils`: `formatDate`, `timeToMinutes`
- `actions`: `triggerTouchHaptic`

The module may import Vue helpers such as `computed`, `reactive`, `ref`, `watch`, and `nextTick` directly.

## Risks

- `initMonthObserver` depends on DOM attributes rendered by `app/index.html`.
- `jumpToToday` depends on week layout measurements and mobile column widths.
- `tasksByDateMap` must continue using `filteredScheduledTasks`, not raw `scheduledTasks`, so search behavior stays intact.
- Initialization order matters because the calendar module needs `isMobile`, which currently appears late in `app.js`.

## Validation

- Add a smoke check that `app/scripts/features/calendar-view.js` exists and passes `node --check`.
- Keep existing template names unchanged.
- Run `npm run verify:modularization`.
- Run `npm test`.
- Run `npm run build` if the refactor touches imports or boot order.
