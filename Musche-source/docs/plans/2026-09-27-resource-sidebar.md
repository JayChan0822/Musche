# Right resource sidebar

Approved layout: task pool on the left, schedule in the center, resource library on the right. Three tabs: instruments, musicians, projects. Wide screens default open; widths below 1200px use a closed-by-default right drawer. A header button toggles it independently of the task pool. Existing data and confirmation/history behavior are reused.

Implementation:
1. Add a resource-library state helper for tabs, case-insensitive name/group search, group expansion and inline creation. Verify behavior before implementation.
2. Add the resource sidebar component with searchable grouped lists, rename/color/delete, per-item group editing, musician default ratio, and project information/MIDI actions. Reuse the existing settings context/actions so edits propagate to task pickers.
3. Wire header toggle and root layout; expose the existing resource context on root state. Remove the three resource lists from Preferences; keep display range, metadata, CSV, reset.
4. Test component rendering, state behavior and root wiring. Run complete tests and production build. Check layout if preview is available; report limitations.

Completed: right sidebar, header toggle, three searchable tabs, inline creation, name/color/group/delete/clear actions, musician default ratio, project metadata/MIDI entry points. Group changes use editable per-item inputs with existing-group suggestions. Preferences retains schedule range, metadata, CSV, and reset. Overlay includes Escape dismissal, focus return, focus trapping, and arrow-key tabs.

Validation: 8 library behavior/render tests pass; production build and diff check pass. Full suite: 345 pass, 1 external MIDI fixture skipped, 1 pre-existing native-iOS removal assertion fails. Browser verification remains blocked by the configured third-party approval endpoint returning 502 before the preview server can start.
