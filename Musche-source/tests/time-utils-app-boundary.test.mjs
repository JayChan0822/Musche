import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertGroupedUtilityBoundary,
  scheduleFeatureRegistrarModule,
  appLazyFeatureWiringsModule,
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
    appPassThroughs: [],
  });
  assert.match(
    appLazyFeatureWiringsModule,
    /parseTime:\s*timeUtils\.parseTime/,
    'lazy wirings should pass parseTime through the grouped timeUtils surface',
  );
  assert.match(
    scheduleFeatureRegistrarModule,
    /addMinutesToTimeValue:\s*timeUtils\.addMinutesToTimeValue[\s\S]*|addDaysToDate:\s*timeUtils\.addDaysToDate/,
    'schedule registrar should pass day/minute helpers through the grouped timeUtils surface',
  );
});
