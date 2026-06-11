import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appScript,
  ratioFeatureRegistrarModule,
  splitViewFeatureRegistrarModule,
  assertGroupedUtilityBoundary,
} from './helpers/app-boundary-assertions.mjs';

const splitUtilityNames = [
  'createHiddenSplitState',
  'deactivateItemInView',
  'ensureItemSplitViews',
  'getConnectedSplitItemIds',
  'getItemSplitState',
  'hasVisibleSplitStateInAnyView',
  'isItemVisibleInView',
  'normalizeSplitViewType',
  'peekItemSplitState',
  'peekItemVisibilityInView',
  'rebalanceSplitFamilyDuration',
  'setItemSplitState',
  'syncFamilyTotalDuration',
  'syncLegacySplitFields',
];

test('app bootstrap consumes split-state helpers through a grouped utility surface', () => {
  assertGroupedUtilityBoundary({
    surfaceName: 'splitStateUtils',
    helperNames: splitUtilityNames,
    label: 'split-state helpers',
    registryPattern: /const\s+splitStateUtils\s*=\s*\{[\s\S]*createHiddenSplitState[\s\S]*syncLegacySplitFields[\s\S]*\};[\s\S]*return\s*\{[\s\S]*splitStateUtils[\s\S]*\};/,
    appPassThroughs: [
      ['normalizeSplitViewType', 'normalizeSplitViewType'],
    ],
  });
  assert.match(
    ratioFeatureRegistrarModule,
    /ensureItemSplitViews:\s*splitStateUtils\.ensureItemSplitViews/,
    'ratio registrar should pass ensureItemSplitViews through the grouped splitStateUtils surface',
  );
  assert.match(
    splitViewFeatureRegistrarModule,
    /registerSplitViewFeature\(\{[\s\S]*split:\s*splitStateUtils[\s\S]*\}\);/,
    'split-view registrar should pass the grouped split-state utility surface into the split-view feature',
  );
  assert.match(
    appScript,
    /registerSplitTaskFeature\(\{[\s\S]*split:\s*\{[\s\S]*\.\.\.splitStateUtils[\s\S]*getSplitViewState[\s\S]*peekSplitViewState[\s\S]*\}[\s\S]*\}\);/,
    'app.js should extend the grouped split-state utility surface only with app-local split helpers for split-task',
  );
  assert.match(
    appScript,
    /registerTaskEditorFeature\(\{[\s\S]*split:\s*\{[\s\S]*\.\.\.splitStateUtils[\s\S]*getSplitViewState[\s\S]*syncFamilyLegacyFields[\s\S]*\}[\s\S]*\}\)/,
    'app.js should extend the grouped split-state utility surface only with split-task helpers for task editor',
  );
});
