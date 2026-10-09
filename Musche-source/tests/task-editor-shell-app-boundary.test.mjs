import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertNoAppImport,
  assertNoAppRegistration,
  appScript,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap delegates task editor imports without the pass-through shell', () => {
  assertNoAppImport({
    modulePath: './features/task-editor.js',
    label: 'task editor feature',
  });
  assertNoAppImport({
    modulePath: './features/task-editor-shell.js',
    label: 'the pass-through task editor shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerTaskEditorShellFeature\(/,
    label: 'the pass-through task editor shell feature',
  });
});

test('app bootstrap proxies task editor handlers through the shared lazy feature proxy', () => {
  assert.match(
    appScript,
    /const\s+taskEditorFeatureProxy\s*=\s*wireTaskEditorFeature\(assembly[\s\S]*const\s+openEditModal\s*=\s*taskEditorFeatureProxy\.method\('openEditModal'\);[\s\S]*const\s+saveEdit\s*=\s*taskEditorFeatureProxy\.method\('saveEdit'\);[\s\S]*const\s+deleteEditingItem\s*=\s*taskEditorFeatureProxy\.method\('deleteEditingItem'\);/,
    'app.js should use the shared lazy feature proxy for task editor handlers',
  );
  assert.doesNotMatch(
    appScript,
    /taskEditorFeaturePromise|getTaskEditorFeature|withTaskEditorFeature/,
    'app.js should not keep hand-rolled task editor lazy proxy variables',
  );
});
