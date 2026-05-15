# Task Editor Refactor Design

## Goal

Extract the task edit modal actions from `app/scripts/app.js` into a focused feature module without changing the DOM template or edit behavior.

## Scope

This cut moves the core edit lifecycle:

- `openEditModal`
- `saveEdit`
- `deleteEditingItem`

The HTML modal in `app/index.html`, dropdown selection helpers, orchestration helpers, and track-list editing stay in `app.js` for now. They are adjacent, but they have their own state and are better split in later, smaller passes.

## Architecture

Create `app/scripts/features/task-editor.js` with `registerTaskEditorFeature(context)`. The feature receives the refs it mutates, helper functions from `app.js`, and side-effect actions such as history, alerts, notification updates, and efficiency recalculation.

`app.js` remains the composition root. It imports the module, registers it after the dependencies are defined, and exposes the returned functions under the same names the template already uses.

## Data Flow

`openEditModal` clones the selected pool or scheduled item into `editingItem`, normalizes split views, sets the default ratio when needed, stores the source, and opens the modal.

`saveEdit` normalizes the edited item, updates split state, writes either to `itemPool` or `scheduledTasks`, rebalances split-family duration, syncs scheduled instances from the family when needed, updates task notifications for schedule edits, recalculates efficiency, closes the modal, and pushes history.

`deleteEditingItem` preserves current behavior: schedule deletes cancel notifications and optionally clear pool record data; pool deletes check split deletion safety, restore split time, delete scheduled instances, clean empty schedules, close the modal, and push history.

## Error Handling

Split-family duration overflow keeps the current alert behavior and restores snapshots before returning. Delete safety continues to delegate to `checkCanDeleteSplit`; if that helper rejects the deletion, the editor module exits without side effects beyond the helper's existing alert.

## Testing

The modularization smoke test will require the new module and run `node --check` on it. Existing split-state regression coverage remains the behavioral guard for edit/save duration rebalance. Full verification is `npm test` and `npm run build`.
