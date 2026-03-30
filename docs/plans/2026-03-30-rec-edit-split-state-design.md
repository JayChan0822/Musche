# REC/EDIT Split State Independence Design

## Context

The current REC and EDIT columns are separate views over the same task objects in `itemPool`. Splitting a task from the TrackList modal mutates shared fields such as `musicDuration`, `splitTag`, `splitFromId`, and `sectionIndex`, then pushes the child task into the same pool. Because both views consume the same objects, a REC split is immediately visible in EDIT.

## Goal

Make REC and EDIT maintain independent split chains while still sharing the same base task metadata.

## Shared vs. Independent Data

Shared base fields remain on the root task:

- `projectId`
- `instrumentId`
- `musicianId`
- `group`
- `orchestration`
- `roster`
- `recordingInfo`
- `editInfo`
- ratio and record data that already vary by view type

Independent split-state fields move behind a view-specific container:

- `splitFromId`
- `splitTag`
- `musicDuration`
- `estDuration`
- `sectionIndex`

The new shape is:

```js
item.splitViews = {
  musician: {
    splitFromId: null,
    splitTag: '',
    musicDuration: '03:20',
    estDuration: '01:07',
    sectionIndex: 0
  },
  project: {
    splitFromId: null,
    splitTag: '',
    musicDuration: '03:20',
    estDuration: '01:07',
    sectionIndex: 0
  }
};
```

`musician` maps to REC and `project` maps to EDIT, matching the existing sidebar/view identifiers.

## Behavioral Rules

### REC

- REC TrackList reads and writes only `splitViews.musician`.
- REC split/delete/merge operations only affect the REC chain.
- EDIT remains visually and structurally unchanged.

### EDIT

- EDIT TrackList reads and writes only `splitViews.project`.
- EDIT split/delete/merge operations only affect the EDIT chain.
- REC remains visually and structurally unchanged.

### Sidebar and Editor

- Sidebar lists render the split tag and visible duration for the active tab from that tab's split view.
- Saving task metadata from the editor must not overwrite the other view's split state.
- Editing base metadata still updates all related parts because the parts remain shared task records.

## Migration Strategy

Existing tasks may still store legacy top-level split fields. On read:

1. Initialize `splitViews.musician` and `splitViews.project` if missing.
2. Seed both views from legacy top-level fields so old data keeps rendering.
3. Keep legacy top-level fields synchronized only as a compatibility bridge during this change, with the long-term source of truth becoming `splitViews`.

## Implementation Approach

1. Introduce a small helper module to normalize and access view-specific split state.
2. Update TrackList population/sorting code to read `musicDuration`, `splitTag`, and `sectionIndex` from the active split view.
3. Rewrite split/merge/delete logic to operate through view helpers instead of top-level task fields.
4. Update editor save flows so they preserve split views and only recompute visible durations for the edited view when necessary.
5. Add focused regression tests for:
   - initializing split views from legacy tasks
   - splitting REC without changing EDIT
   - splitting EDIT without changing REC
   - merge/delete only repairing the active chain

## Risks

- There are many direct reads of `task.musicDuration`, `task.splitTag`, and `task.sectionIndex` in `app.js`; missing one would produce partial regressions.
- Auto-sort and TrackList refresh paths rebuild item lists in several places, so helper-based access must be applied consistently.
- Import/export compatibility depends on preserving legacy fields long enough for old saves to round-trip safely.

## Validation

- Run a new regression test script for the helper module.
- Run `npm test` to ensure the existing smoke verification still passes.
