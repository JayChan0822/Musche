import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appScript,
  assertNoAppImport,
  assertNoAppRegistration,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap delegates schedule deletion imports without the pass-through shell', () => {
  assertNoAppImport({
    modulePath: './features/schedule-deletion.js',
    label: 'schedule-deletion feature',
  });
  assertNoAppImport({
    modulePath: './features/schedule-deletion-shell.js',
    label: 'the pass-through schedule-deletion shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerScheduleDeletionShellFeature\(/,
    label: 'the pass-through schedule-deletion shell feature',
  });
  assert.doesNotMatch(
    appScript,
    /scheduleDeletionShellFeature|withScheduleDeletionShellFeature|getScheduleDeletionShellFeature/,
    'app.js should not keep schedule-deletion shell feature variables after removing the shell',
  );
});

test('app bootstrap proxies schedule deletion handlers through the shared lazy feature proxy', () => {
  assert.match(
    appScript,
    /const\s+scheduleDeletionFeatureProxy\s*=\s*wireScheduleDeletionFeature\(assembly[\s\S]*const\s+isResourceCompleted\s*=\s*scheduleDeletionFeatureProxy\.method\('isResourceCompleted'\);[\s\S]*const\s+deleteCurrentSchedule\s*=\s*scheduleDeletionFeatureProxy\.method\('deleteCurrentSchedule'\);[\s\S]*const\s+clearPoolRecord\s*=\s*scheduleDeletionFeatureProxy\.method\('clearPoolRecord'\);[\s\S]*const\s+clearAggregateRecords\s*=\s*scheduleDeletionFeatureProxy\.method\('clearAggregateRecords'\);/,
    'app.js should use the shared lazy feature proxy for schedule deletion handlers',
  );
  assert.doesNotMatch(
    appScript,
    /scheduleDeletionFeaturePromise|getScheduleDeletionFeature|withScheduleDeletionFeature/,
    'app.js should not keep hand-rolled schedule deletion lazy proxy variables',
  );
});
