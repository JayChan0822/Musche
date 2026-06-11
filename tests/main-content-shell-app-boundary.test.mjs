import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appRootContextWiringModule,
  appMainContentComponent,
  appScript,
  appStateFactoriesModule,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap creates main content shell ctx through a focused state factory', () => {
  assert.match(
    appStateFactoriesModule,
    /import \{ createMainContentShellState \} from '\.\.\/state\/main-content-shell-state\.js';/,
    'app state factories should import the main content shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootMainContentShellState\(options\)\s*\{[\s\S]*return createMainContentShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the main content shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootMainContentShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the main content shell ctx factory from createAppDependencies()',
  );
  assert.match(
    appRootContextWiringModule,
    /const appMainContent\s*=\s*createRootMainContentShellState\(\{[\s\S]*currentDateLabel[\s\S]*tasksByDateMap[\s\S]*handleInfiniteScroll[\s\S]*dropToSchedule[\s\S]*initMobileResize[\s\S]*setMonthRef[\s\S]*\}\);/,
    'app.js should create the main content ctx through the focused shell ctx factory',
  );
  assert.doesNotMatch(
    appScript,
    /const appMainContent\s*=\s*reactive\(\{[\s\S]*get currentDateLabel\(\)[\s\S]*setMonthRef[\s\S]*\}\);/,
    'app.js should not own the main content reactive ctx object after shell ctx extraction',
  );
  assert.match(
    appMainContentComponent,
    /:ref="\s*\(el\)\s*=>\s*\{\s*weekContainer\s*=\s*el;\s*\}\s*"/,
    'AppMainContent should write weekContainer through the ctx setter instead of a string ref',
  );
  assert.match(
    appMainContentComponent,
    /:ref="\s*\(el\)\s*=>\s*\{\s*weekGridWrapper\s*=\s*el;\s*\}\s*"/,
    'AppMainContent should write weekGridWrapper through the ctx setter instead of a string ref',
  );
  assert.doesNotMatch(
    appMainContentComponent,
    /\sref="weekContainer"|\sref="weekGridWrapper"/,
    'AppMainContent should avoid string refs for ctx-backed template refs',
  );
});
