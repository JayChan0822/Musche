import test from 'node:test';
import {
  assertGroupedUtilityBoundary,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap consumes ID helpers through a grouped utility surface', () => {
  assertGroupedUtilityBoundary({
    surfaceName: 'idUtils',
    helperNames: ['generateUniqueId'],
    label: 'ID helpers',
    registryPattern: /const\s+idUtils\s*=\s*\{[\s\S]*generateUniqueId[\s\S]*\};[\s\S]*return\s*\{[\s\S]*idUtils[\s\S]*\};/,
  });
});
