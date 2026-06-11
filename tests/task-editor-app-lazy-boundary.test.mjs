import test from 'node:test';
import {
  assertNoAppImport,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap delegates task editor imports instead of statically importing it', () => {
  assertNoAppImport({
    modulePath: './features/task-editor.js',
    label: 'task-editor feature',
  });
});
