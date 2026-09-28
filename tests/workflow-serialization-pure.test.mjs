import test from 'node:test';
import assert from 'node:assert/strict';
import { reactive, watch } from 'vue';
import { ensureWorkflowLedger } from '../app/scripts/utils/workflow-ledger.js';
import { serializeWorkflowContent } from '../app/scripts/utils/workflow-migration.js';

test('serialization never mutates live state or triggers autosave watchers', () => {
  const settings = reactive({});
  const pool = reactive([{ id: 'one', projectId: 'p', instrumentId: 'i' }]);
  const tasks = reactive([]);
  let changes = 0;
  const stop = watch([settings, pool, tasks], () => changes++, { deep: true, flush: 'sync' });
  const output = serializeWorkflowContent(settings, pool, tasks);
  stop();
  assert.equal(output.settings.workflow.version, 11);
  assert.equal(changes, 0);
  assert.equal(settings.workflow, undefined);
});

 test('serializing an existing ledger does not schedule another save', () => {
  const settings = reactive({});
  const pool = reactive([{ id: 'existing' }]);
  ensureWorkflowLedger(settings, pool, [], { bootstrap: true });
  let changes = 0;
  const stop = watch(settings, () => changes++, { deep: true, flush: 'sync' });
  serializeWorkflowContent(settings, pool, []);
  serializeWorkflowContent(settings, pool, []);
  stop();
  assert.equal(changes, 0);
});
