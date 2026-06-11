import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appScript,
  appStateFactoriesModule,
  assertAppFeatureRegistrarRegistry,
  assertNoAppRegistration,
  assertNoStaticAppImport,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers app runtime through the runtime registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/app-runtime.js',
    label: 'app runtime feature',
  });
  assertAppFeatureRegistrarRegistry({
    factoryName: 'createAppRuntimeFeatureRegistrar',
    registerName: 'wireAppRuntimeFeature',
    modulePath: 'app-runtime-feature-registrar.js',
    label: 'app runtime',
  });
  assertNoStaticAppImport({
    modulePath: './features/app-runtime-shell.js',
    label: 'the pass-through app runtime shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerAppRuntimeShellFeature\(/,
    label: 'the pass-through app runtime shell feature',
  });
});

test('app bootstrap only consumes Vue runtime helpers it calls directly', () => {
  assert.match(
    appStateFactoriesModule,
    /function createRootShellState\(options\)\s*\{[\s\S]*return createRootShellStateFactory\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the top-level root shell state factory',
  );
  assert.match(
    appScript,
    /const\s+\{(?=[\s\S]*\bcreateApp\b)(?=[\s\S]*\bcomputed\b)(?=[\s\S]*\bonMounted\b)(?=[\s\S]*\bonUnmounted\b)(?=[\s\S]*\bwatch\b)(?=[\s\S]*\bnextTick\b)[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should consume the Vue runtime helpers it still calls directly',
  );
  assert.doesNotMatch(
    appScript,
    /const\s+\{[\s\S]*\b(?:ref|reactive|shallowRef)\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should not consume Vue ref/reactive/shallowRef once state factories bind those helpers',
  );
  assert.match(
    appScript,
    /const\s+\{ appRootShell,\s*appRootOverlaysShell \}\s*=\s*createRootShellState\(\{(?![\s\S]*\breactive\b)[\s\S]*appHeader[\s\S]*appMetadataInfoModalsShell[\s\S]*\}\);/,
    'app.js should create top-level root shell wrappers through the bound root shell state factory',
  );
});
