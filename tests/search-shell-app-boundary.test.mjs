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
    factoryName: 'createSearchFeatureRegistrar',
    registerName: 'registerSearchFeature',
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

test('app bootstrap keeps search pinyin support inside the search registrar boundary', () => {
  assert.match(
    appSupportLoadersModule,
    /pinyinMatchSupport:\s*createPinyinMatchLoader\(\{\s*ref\s*\}\)/,
    'app support loader registry should keep the pinyin matcher ref and loader grouped as search support',
  );
  assert.match(
    appDependenciesModule,
    /createAppFeatureRegistrars\(\{[\s\S]*pinyinMatchSupport:\s*supportLoaders\.pinyinMatchSupport[\s\S]*\}\)/,
    'app dependencies should inject pinyin support into the feature registrar registry',
  );
  assert.doesNotMatch(
    appScript,
    /\b(pinyinMatch|loadPinyinMatch)\b[\s\S]*=\s*createAppDependencies\(\);/,
    'app.js should not unpack search-only pinyin support from the root dependency registry',
  );
  assert.doesNotMatch(
    appScript,
    /utils:\s*\{[\s\S]*\bpinyinMatch\b[\s\S]*\bensurePinyinMatch:\s*loadPinyinMatch[\s\S]*\}/,
    'app.js should not manually pass search-only pinyin support into search registration',
  );
  assert.match(
    appFeatureRegistrarsModule,
    /createSearchFeatureRegistrar\(\{\s*pinyinMatchSupport\s*\}\)/,
    'search registrar registry should inject pinyin support into the search registrar',
  );
});
