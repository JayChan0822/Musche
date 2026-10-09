import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  assertNoAppRegistration,
  assertNoStaticAppImport,
  appDependenciesModule,
  appScript,
  appFeatureRegistrarsModule,
  appSupportLoadersModule,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers search through the search registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/search.js',
    label: 'search feature',
  });
  assertAppFeatureRegistrarRegistry({
    registerName: 'wireSearchFeature',
    modulePath: 'search-feature-registrar.js',
    label: 'search',
  });
  assertNoStaticAppImport({
    modulePath: './features/search-shell.js',
    label: 'the pass-through search shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerSearchShellFeature\(/,
    label: 'the pass-through search shell feature',
  });
});

test('app bootstrap must not retain the removed pinyin search support chain', () => {
  assert.doesNotMatch(
    appSupportLoadersModule,
    /pinyin|createPinyinMatchLoader/,
    'app support loader registry should no longer create a pinyin matcher ref/loader',
  );
  assert.doesNotMatch(
    appDependenciesModule,
    /pinyin|pinyinMatchSupport/,
    'app dependencies should no longer inject pinyin support into the registrar registry',
  );
  assert.doesNotMatch(
    appFeatureRegistrarsModule,
    /createSearchFeatureRegistrar|pinyinMatchSupport/,
    'search registrar should be a plain wire function with no pinyin factory argument',
  );
});
