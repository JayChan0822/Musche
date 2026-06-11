import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  assertNoAppRegistration,
  assertNoStaticAppImport,
  appScript,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers sidebar stats through the sidebar stats registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/sidebar-stats.js',
    label: 'sidebar-stats feature',
  });
  assertAppFeatureRegistrarRegistry({
    factoryName: 'createSidebarStatsFeatureRegistrar',
    registerName: 'wireSidebarStatsFeature',
    modulePath: 'sidebar-stats-feature-registrar.js',
    label: 'sidebar stats',
  });
  assertNoStaticAppImport({
    modulePath: './features/sidebar-stats-shell.js',
    label: 'the pass-through sidebar-stats shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerSidebarStatsShellFeature\(/,
    label: 'the pass-through sidebar-stats shell feature',
  });
});
