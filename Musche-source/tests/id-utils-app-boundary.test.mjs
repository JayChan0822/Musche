import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertGroupedUtilityBoundary,
  appLazyFeatureWiringsModule,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap consumes ID helpers through a grouped utility surface', () => {
  assertGroupedUtilityBoundary({
    surfaceName: 'idUtils',
    helperNames: ['generateUniqueId'],
    label: 'ID helpers',
    registryPattern: /const\s+idUtils\s*=\s*\{[\s\S]*generateUniqueId[\s\S]*\};[\s\S]*return\s*\{[\s\S]*idUtils[\s\S]*\};/,
    appPassThroughs: [],
  });
  assert.match(
    appLazyFeatureWiringsModule,
    /generateUniqueId:\s*idUtils\.generateUniqueId/,
    'lazy wirings should pass generateUniqueId through the grouped idUtils surface',
  );
});
