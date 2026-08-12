import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  assertNoAppRegistration,
  assertNoStaticAppImport,
  appScript,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers view navigation through the view navigation registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/view-navigation.js',
    label: 'view-navigation feature',
  });
  assertAppFeatureRegistrarRegistry({
    registerName: 'wireViewNavigationFeature',
    modulePath: 'view-navigation-feature-registrar.js',
    label: 'view navigation',
  });
  assertNoStaticAppImport({
    modulePath: './features/view-navigation-shell.js',
    label: 'the pass-through view-navigation shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerViewNavigationShellFeature\(/,
    label: 'the pass-through view-navigation shell feature',
  });
  assert.doesNotMatch(
    appScript,
    /viewNavigationShellFeature/,
    'app.js should not keep view-navigation shell feature variables after removing the shell',
  );
});
