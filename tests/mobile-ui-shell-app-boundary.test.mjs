import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appRootContextWiringModule,
  assertAppFeatureRegistrarRegistry,
  assertNoAppRegistration,
  assertNoStaticAppImport,
  appStateFactoriesModule,
  appScript,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers mobile UI through the mobile UI registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/mobile-ui.js',
    label: 'mobile-ui feature',
  });
  assertAppFeatureRegistrarRegistry({
    factoryName: 'createMobileUiFeatureRegistrar',
    registerName: 'wireMobileUiFeature',
    modulePath: 'mobile-ui-feature-registrar.js',
    label: 'mobile UI',
  });
  assertNoStaticAppImport({
    modulePath: './features/mobile-ui-shell.js',
    label: 'the pass-through mobile-ui shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerMobileUiShellFeature\(/,
    label: 'the pass-through mobile-ui shell feature',
  });
  assert.match(
    appStateFactoriesModule,
    /import \{ createMobileControlsShellState \} from '\.\.\/state\/mobile-controls-shell-state\.js';/,
    'app state factories should import the mobile controls shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootMobileControlsShellState\(options\)\s*\{[\s\S]*return createMobileControlsShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the mobile controls shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootMobileControlsShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the mobile controls shell ctx factory from createAppDependencies()',
  );
  assert.match(
    appRootContextWiringModule,
    /const appMobileControls\s*=\s*createRootMobileControlsShellState\(\{[\s\S]*globalSearchQuery[\s\S]*isSearchFocused[\s\S]*mobileTab[\s\S]*showMobileTaskInput[\s\S]*onSearchFocus[\s\S]*handleSearchBlur[\s\S]*handleSearchEnter[\s\S]*\}\);/,
    'app.js should create the mobile controls ctx through the focused shell ctx factory',
  );
  assert.doesNotMatch(
    appScript,
    /const appMobileControls\s*=\s*reactive\(\{[\s\S]*get globalSearchQuery\(\)[\s\S]*handleSearchEnter[\s\S]*\}\);/,
    'app.js should not own the mobile controls reactive ctx object after shell ctx extraction',
  );
});
