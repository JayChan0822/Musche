import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertRootShellCtx,
  appRootContextWiringModule,
  appScript,
  appStateFactoriesModule,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap creates Track List modal ctx through a focused state factory', () => {
  assert.match(
    appStateFactoriesModule,
    /import \{ createTrackListModalShellState \} from '\.\.\/state\/track-list-modal-shell-state\.js';/,
    'app state factories should import the Track List modal shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootTrackListModalShellState\(options\)\s*\{[\s\S]*return createTrackListModalShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the Track List modal shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootTrackListModalShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the Track List modal shell ctx factory from createAppDependencies()',
  );
  assertRootShellCtx({
    ctxName: 'appTrackListModal',
    factoryName: 'createRootTrackListModalShellState',
    dependencies: [
      'showTrackList',
      'trackListData',
      'trackListSearchQuery',
      'trackListContainerRef',
      'draggingSectionIndex',
      'sidebarTab',
      'openRecInfoModal',
      'deleteTrackFromList',
      'openSplitSlider',
      'deleteCurrentSchedule',
    ],
  });
  assert.doesNotMatch(
    appScript,
    /const appTrackListModal\s*=\s*reactive\(\{[\s\S]*showTrackList[\s\S]*trackListData[\s\S]*trackListSearchQuery[\s\S]*trackListContainerRef[\s\S]*draggingSectionIndex[\s\S]*openRecInfoModal[\s\S]*deleteTrackFromList[\s\S]*openSplitSlider[\s\S]*deleteCurrentSchedule[\s\S]*\}\);/,
    'app.js should not own the Track List modal reactive ctx body after shell ctx extraction',
  );
});
