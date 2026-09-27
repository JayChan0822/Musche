# Resource insights implementation plan

**Goal:** Clicking an instrument, musician or project avatar opens recording history and statistics for that entity.

**Architecture:** A pure statistics utility reads musician-view pool segments and recording records for every entity type. Never count project/edit records as recording time or add scheduled copies to pool totals. A shared modal renders overview, breakdown and searchable history. All-history is default; current-session is optional. Color editing moves to a secondary modal action.

**Tech stack:** Vue composition API, existing shell context and dialogs, JavaScript utilities, Node behavioral and SSR tests.

## Approved scope and calculation rules

- Weighted recording ratio = actual recorded seconds / music seconds of those same valid records. Explicitly distinguish ratio sample count from completed count; invalid/missing music excludes the sample, not the recorded time total.
- Use `peekItemSplitState(item, 'musician')`; ignore inactive edit-only segments and skipped segments in recording aggregates. Aggregate split families once for unique track counts, while summing visible segment durations once.
- Overview: completed/pending/skipped tracks, segment counts, total/recorded music, net actual time, weighted ratio, median per-track ratio, interruption totals, related entity counts, monthly trend, latest dated recording.
- Dates are derived from exact template schedules or the musician's section index and are labeled as associated schedule dates, not independent recording timestamps. Unknown dates remain unknown.
- Breakdowns by the other two entity dimensions show measured ratio, recorded music, actual time and sample counts. No allocation of an entire musician schedule block to one instrument/project.
- Searchable history includes associated date/session, title, project/instrument/musician, segment tag, music duration, actual duration, ratio and status. Default all-history; current session and status filters available.
- Missing statistics use dashes; no default ratio. Sample count is always shown. Data remains read-only except explicit color/MIDI/project-info actions.

## Steps

1. Write and run failing `tests/resource-insights.test.mjs` for entity separation, split families, skipped/edit-only exclusions, session scoping, dates, weighted/median calculations and non-mutation.
2. Implement `app/scripts/utils/resource-insights.js` and verify the tests.
3. Add `app-resource-info-modal.js`, connect avatar selection in resource sidebar and pool/schedule/session reads through its existing context. Test actual modal render states and click handlers with `tests/resource-info-modal.test.mjs`.
4. Run full suite and build. Report any known baseline failures and browser verification limitations.

## Follow-up and validation

- Metadata moved to a secondary footer entry. Main tabs stay instrument/musician/project; Back restores the previous tab and query.
- Sidebar animation uses 300ms width/opacity on desktop and transform/opacity for the narrow-screen drawer, with reduced-motion support.
- Detail modal implemented with lazy loading, weighted recording statistics, split-family sample counts, dated monthly series, contextual breakdowns, and 30-row history pages. Original pool data is never mutated by aggregation.
- Verification: full suite 368 passed, 1 optional external MIDI fixture skipped, 1 pre-existing native iOS removal test failed. Production build and diff check passed. No browser visual verification was available because the earlier preview/inspection approval requests failed with gateway HTTP 502.
