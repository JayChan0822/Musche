import test from 'node:test';
import {
  assertGroupedUtilityBoundary,
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
  });
});
