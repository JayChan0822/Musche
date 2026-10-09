import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appRootContextWiringModule,
  assertGroupedUtilityBoundary,
  readFixture,
} from './helpers/app-boundary-assertions.mjs';

const formatUtilityNames = [
  'formatDate',
  'formatSecs',
];

test('app bootstrap consumes format helpers through a grouped utility surface', () => {
  assertGroupedUtilityBoundary({
    surfaceName: 'formatUtils',
    helperNames: formatUtilityNames,
    label: 'format helpers',
    registryPattern: /const\s+formatUtils\s*=\s*\{[\s\S]*formatDate[\s\S]*formatSecs[\s\S]*\};[\s\S]*return\s*\{[\s\S]*formatUtils[\s\S]*\};/,
    appPassThroughs: [],
  });
  assert.match(
    readFixture('app/scripts/state/main-content-shell-state.js'),
    /'utils\.formatUtils\.formatDate'/,
    'main-content shell state must declare formatDate through the grouped formatUtils path',
  );
  assert.match(
    readFixture('app/scripts/state/midi-import-modal-shell-state.js'),
    /'utils\.formatUtils\.formatSecs'/,
    'midi-import shell state must declare formatSecs through the grouped formatUtils path',
  );
});
