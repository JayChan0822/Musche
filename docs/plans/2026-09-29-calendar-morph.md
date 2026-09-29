# Calendar week/month spatial transition

## Design
The selected week is the common visual anchor. The real week viewport is
revealed from the measured row of the real month view; closing reverses this
aperture. Both views remain opaque throughout. There are no synthesized tiles
or whole-panel opacity fades, so task blocks and grid geometry remain genuine.
The toolbar and sidebar stay still. Use a restrained 440 ms opening / 400 ms
closing with clip-path only.
Keep the existing light/dark palette. Respect reduced motion and cancel all
transient layers on rapid switches, resize, or component teardown.

## Implementation
1. Add failing geometry and transition-lifecycle tests.
2. Put row measurement and Web Animations cleanup in a focused feature module.
3. Bind Vue transition hooks in AppMainContent, preserving reactive ctx setters.
4. Reuse existing month date markers; keep the outgoing view mounted until the
   real week viewport finishes opening or closing.
5. Preserve the current date, golden-section positioning, and task data.
6. Run focused tests, module checks, full tests/build and visual verification.

No new animation dependency or changes to the task resize behavior are needed.
