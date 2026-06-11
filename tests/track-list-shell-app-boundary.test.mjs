import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appScript,
  assertNoAppImport,
  assertNoAppRegistration,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap delegates track list imports without the pass-through shell', () => {
  assertNoAppImport({
    modulePath: './features/track-list.js',
    label: 'the low-frequency track-list feature',
  });
  assertNoAppImport({
    modulePath: './features/track-list-shell.js',
    label: 'the pass-through track-list shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerTrackListShellFeature\(/,
    label: 'the pass-through track-list shell feature',
  });
  assert.doesNotMatch(
    appScript,
    /trackListShellFeature|withTrackListShell|getTrackListShellFeature/,
    'app.js should not keep track-list shell feature variables after removing the shell',
  );
});
