# Musician ratio comparison

Approved design: display average recorded ratio → scheduled ratio, plus a signed relative difference. Average uses valid, non-skipped recording durations and their music durations in the current session. Scheduled ratio uses the existing association of blocks to music. Both use the complete musician group even during search. Missing evidence displays an em dash rather than a default ratio. Calculations are display-only and do not change estimation defaults or records.

Implementation:
1. Add behavior tests to `tests/schedule-ratio-resize.test.mjs` for weighted averages, all comparison states, missing data, and search independence; verify failures.
2. Extend `app/scripts/features/sidebar-stats.js` with comparison data. Keep existing estimation behavior separate.
3. Add `app/scripts/components/app-ratio-comparison.js` and render it below musician names in `app-sidebar.js`; keep project rendering unchanged. Verify server-rendered markup for labels, tooltips and empty states.
4. Run focused and complete tests, production build, and diff checks. Report the known iOS baseline test failure separately.
