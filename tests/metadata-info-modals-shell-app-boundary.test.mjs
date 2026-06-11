import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appScript,
  appStateFactoriesModule,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap creates Project/Recording Info modal group ctx through a focused state factory', () => {
  assert.match(
    appStateFactoriesModule,
    /import \{ createMetadataInfoModalsShellState \} from '\.\.\/state\/metadata-info-modals-shell-state\.js';/,
    'app state factories should import the Project/Recording Info modal group shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootMetadataInfoModalsShellState\(options\)\s*\{[\s\S]*return createMetadataInfoModalsShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the Project/Recording Info modal group shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootMetadataInfoModalsShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the Project/Recording Info modal group shell ctx factory from createAppDependencies()',
  );
  assert.match(
    appScript,
    /const appMetadataInfoModalsShell\s*=\s*createRootMetadataInfoModalsShellState\(\{[\s\S]*appProjectInfoModal[\s\S]*appRecInfoModal[\s\S]*\}\);/,
    'app.js should create the Project/Recording Info modal group ctx through the focused shell ctx factory',
  );
  assert.doesNotMatch(
    appScript,
    /const appMetadataInfoModalsShell\s*=\s*reactive\(\{[\s\S]*appProjectInfoModal[\s\S]*appRecInfoModal[\s\S]*\}\);/,
    'app.js should not own the Project/Recording Info modal group reactive ctx object after shell ctx extraction',
  );
});
