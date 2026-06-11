import test from 'node:test';
import {
  assertGroupedUtilityBoundary,
} from './helpers/app-boundary-assertions.mjs';

const timeUtilityNames = [
  'parseTime',
  'timeToMinutes',
  'addMinutesToTimeValue',
  'addDaysToDate',
];

test('app bootstrap consumes time helpers through a grouped utility surface', () => {
  assertGroupedUtilityBoundary({
    surfaceName: 'timeUtils',
    helperNames: timeUtilityNames,
    label: 'time helpers',
    registryPattern: /const\s+timeUtils\s*=\s*\{[\s\S]*parseTime[\s\S]*timeToMinutes[\s\S]*addMinutesToTimeValue[\s\S]*addDaysToDate[\s\S]*\};[\s\S]*return\s*\{[\s\S]*timeUtils[\s\S]*\};/,
  });
});
