import { getScheduleStage, getAssigneeId } from './workflow.js';

export const WORKFLOW_SCHEMA_VERSION = 10;
const clone = (value) => JSON.parse(JSON.stringify(value));

export function migrateWorkflowContent(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid workflow content');
  if (Number(input.schemaVersion || 0) > WORKFLOW_SCHEMA_VERSION) throw new Error('This data uses a newer schema; update Musche before opening it.');
  for (const key of ['pool', 'tasks']) {
    if (input[key] !== undefined && !Array.isArray(input[key])) throw new Error(`Invalid ${key}`);
  }
  if (input.settings !== undefined && (!input.settings || typeof input.settings !== 'object' || Array.isArray(input.settings))) throw new Error('Invalid settings');
  const data = clone(input);
  data.schemaVersion = WORKFLOW_SCHEMA_VERSION;
  if (data.pool) data.pool = data.pool.map((item) => ({ ...item, editorId: item.editorId || '' }));
  if (data.tasks) data.tasks = data.tasks.map((task) => ({ ...task, stage: getScheduleStage(task), editorId: task.editorId || '' }));
  // Historical execution belongs to its original owner, not a later task assignment.
  for (const item of [...(data.pool || []), ...(data.tasks || [])]) {
    for (const [view, stage] of [['musician', 'rec'], ['project', 'edit']]) {
      const record = item.records?.[view];
      if (!record || !(record.actualDuration || record.recStart || record.recEnd)) continue;
      if (!Object.hasOwn(record, 'assigneeId')) record.assigneeId = getAssigneeId(item, stage);
      if (!Object.hasOwn(record, 'musicDuration')) record.musicDuration = item.splitViews?.[view]?.musicDuration || item.musicDuration || '';
    }
  }
  if (data.settings?.musicians) data.settings.musicians = data.settings.musicians.map((person) => ({
    ...person, roles: Array.isArray(person.roles) ? person.roles : ['musician'],
  }));
  return data;
}

export function preserveWorkflowBackup(storage, content, source = 'guest') {
  const key = `musche_pre_workflow_v10:${encodeURIComponent(source)}`;
  const read = typeof storage?.getItem === 'function' ? (key) => storage.getItem(key) : typeof storage?.loadData === 'function' ? (key) => storage.loadData(key) : null;
  const write = typeof storage?.setItem === 'function' ? (key, value) => storage.setItem(key, value) : typeof storage?.saveData === 'function' ? (key, value) => storage.saveData(key, JSON.parse(value)) : null;
  if (!read || !write) {
    throw new Error('Cannot preserve original data: backup storage is unavailable.');
  }
  if (!read(key)) write(key, JSON.stringify(content));
  return key;
}

export function createWorkflowContent(base = {}, current = {}) {
  return { ...base, ...current, schemaVersion: WORKFLOW_SCHEMA_VERSION };
}

// Keep envelope extensions outside reactive settings while preserving them through saves.
const envelopes = new WeakMap();
export function rememberWorkflowContent(settings, content) { envelopes.set(settings, clone(content)); }
export function serializeWorkflowContent(settings, pool, tasks, extraSettings = {}) {
  return migrateWorkflowContent(createWorkflowContent(envelopes.get(settings), { pool, tasks, settings: { ...settings, ...extraSettings } }));
}

const protectedSettings = new WeakSet();
export function setWorkflowWriteBlocked(settings, blocked) {
  if (blocked) protectedSettings.add(settings); else protectedSettings.delete(settings);
}
export function isWorkflowWriteBlocked(settings) { return protectedSettings.has(settings); }
