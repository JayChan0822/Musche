import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appRootContextWiringModule,
  assertAppFeatureRegistrarRegistry,
  appStateFactoriesModule,
  appScript,
  assertNoAppRegistration,
  assertNoStaticAppImport,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers the sidebar composition feature through the sidebar registrar', () => {
  assertNoStaticAppImport({
    modulePath: './features/sidebar.js',
    label: 'sidebar composition feature',
  });
  assertAppFeatureRegistrarRegistry({
    factoryName: 'createSidebarFeatureRegistrar',
    registerName: 'wireSidebarFeature',
    modulePath: 'sidebar-feature-registrar.js',
    label: 'sidebar',
  });

  assertNoStaticAppImport({
    modulePath: './features/sidebar-shell.js',
    label: 'the sidebar shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerSidebarShellFeature\(/,
    label: 'the sidebar shell feature',
  });
  assert.doesNotMatch(
    appScript,
    /sidebarShellFeature/,
    'app.js should use sidebar feature variables instead of sidebar shell variables',
  );
  assert.match(
    appStateFactoriesModule,
    /import \{ createSidebarShellState \} from '\.\.\/state\/sidebar-shell-state\.js';/,
    'app state factories should import the sidebar shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootSidebarShellState\(options\)\s*\{[\s\S]*return createSidebarShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the sidebar shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootSidebarShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the sidebar shell ctx factory from createAppDependencies()',
  );
  assert.match(
    appRootContextWiringModule,
    /const appSidebar\s*=\s*createRootSidebarShellState\(\{[\s\S]*dragEnterPool[\s\S]*dropToPool[\s\S]*switchSidebarTab[\s\S]*handlePoolTouchStart[\s\S]*calculateSingleRatio[\s\S]*\}\);/,
    'app.js should create the sidebar ctx through the focused shell ctx factory',
  );
  assert.doesNotMatch(
    appScript,
    /const appSidebar\s*=\s*reactive\(\{[\s\S]*get isMobile\(\)[\s\S]*getTaskRatio[\s\S]*\}\);/,
    'app.js should not own the sidebar reactive ctx object after shell ctx extraction',
  );
});
