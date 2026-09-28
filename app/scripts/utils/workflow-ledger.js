import { getAssigneeId, getScheduleStage, stageFromView, viewFromStage } from './workflow.js';
import { peekItemSplitState, getItemSplitParentIds } from './split-state.js';
import { itemMatchesSchedule } from './schedule-context.js';

const copy = value => JSON.parse(JSON.stringify(value));
const session = item => item.sessionId || 'S_DEFAULT';
const key = value => encodeURIComponent(String(value));
const itemKey = item => `${key(session(item))}:${key(item.id)}`;
export const getWorkPartId = (item, stage) => `part:${stageFromView(stage)}:${itemKey(item)}`;
const hasRecord = record => record && (record.actualDuration || record.recStart || record.recEnd);
const collections = ['baseTasks', 'stageWorks', 'workParts', 'allocations', 'workLogs'];

function ledgerFor(settings) {
  if (!settings.workflow) settings.workflow = { version: 11, baseTasks: [], stageWorks: [], workParts: [], allocations: [], workLogs: [] };
  const ledger = settings.workflow;
  if (ledger.version !== 11 || collections.some(name => !Array.isArray(ledger[name]))) throw new Error('Invalid workflow ledger');
  return ledger;
}
const upsert = (rows, row) => {
  const current = rows.find(entry => entry.id === row.id);
  if (current) Object.assign(current, row); else rows.push(row);
  return current || row;
};
function baseTaskId(item, pool) {
  const seen = new Set(); const pending = [item.id];
  while (pending.length) {
    const id = pending.pop(); if (seen.has(id)) continue; seen.add(id);
    for (const candidate of pool.filter(entry => session(entry) === session(item))) {
      const parents = getItemSplitParentIds(candidate);
      if (candidate.id === id || parents.includes(id)) pending.push(candidate.id, ...parents);
    }
  }
  const roots = [...seen].filter(id => !pool.some(entry => session(entry) === session(item) && entry.id === id && getItemSplitParentIds(entry).length));
  return `task:${key(session(item))}:${key((roots.length ? roots : [...seen]).sort()[0])}`;
}

/** Sync structural compatibility adapters. Records and allocations are imported only once. */
export function ensureWorkflowLedger(settings, pool = [], tasks = [], { bootstrap = false, preserveMissing = false } = {}) {
  const ledger = ledgerFor(settings);
  pool.forEach((item, index) => { if (item.id === undefined || item.id === null || item.id === '') item.id = `legacy-item-${index}`; });
  tasks.forEach((block, index) => { if (block.scheduleId === undefined || block.scheduleId === null || block.scheduleId === '') block.scheduleId = `legacy-schedule-${index}`; });
  if (!preserveMissing) {
    const ids = new Set(pool.flatMap(item => [getWorkPartId(item, 'rec'), getWorkPartId(item, 'edit')]));
    ledger.workParts.forEach(part => { part.archived = !ids.has(part.id); });
  }
  for (const item of pool) {
    const existingPart = ledger.workParts.find(part => part.id === getWorkPartId(item, 'rec'));
    const taskId = existingPart?.taskId || baseTaskId(item, pool);
    upsert(ledger.baseTasks, { id: taskId, projectId: item.projectId || '', instrumentId: item.instrumentId || '', sessionId: session(item) });
    for (const stage of ['rec', 'edit']) {
      const split = peekItemSplitState(item, viewFromStage(stage));
      const stageWorkId = `work:${stage}:${taskId}`;
      upsert(ledger.stageWorks, { id: stageWorkId, taskId, stage, sessionId: session(item) });
      const part = upsert(ledger.workParts, { id: getWorkPartId(item, stage), taskId, stageWorkId, itemId: item.id, poolItemId: item.id,
        sessionId: session(item), name: item.name || item.title || '', archived: false, stage, active: split.active, assigneeId: getAssigneeId(item, stage), musicDuration: split.musicDuration,
        estDuration: split.estDuration, status: item.workflowStatus?.[stage] || 'not-started', splitTag: split.splitTag });
      if (!bootstrap) continue;
      const blocks = tasks.filter(block => session(block) === session(item) && getScheduleStage(block) === stage &&
        (block.templateId ? block.templateId === item.id : itemMatchesSchedule(item, block)))
        .sort((a,b) => `${a.date || ''} ${a.startTime || ''}`.localeCompare(`${b.date || ''} ${b.startTime || ''}`));
      const direct = blocks.filter(entry => entry.templateId === item.id);
      const ambiguous = new Set(direct.map(entry => entry.scheduleId)).size > 1;
      const block = ambiguous ? null : direct[0] || blocks[split.sectionIndex || 0];
      if (ambiguous) {
        ledger.migrationIssues ||= [];
        if (!ledger.migrationIssues.some(issue => issue.type === 'ambiguous-schedule' && issue.partId === part.id))
          ledger.migrationIssues.push({ type: 'ambiguous-schedule', partId: part.id, scheduleIds: direct.map(entry => entry.scheduleId) });
        linkWorkPart(settings, item, stage, null);
      }
      if (split.active && block && !getPartAllocation(settings, item, stage)) linkWorkPart(settings, item, stage, block.scheduleId);
      const record = item.records?.[viewFromStage(stage)];
      if (hasRecord(record) && !ledger.workLogs.some(log => log.partId === part.id)) {
        appendWorkLog(settings, item, stage, {
          recordingInfo: record.recordingInfo || item.recordingInfo || block?.recordingInfo || {},
          editInfo: record.editInfo || item.editInfo || block?.editInfo || {},
          ...record,
        }, { scheduleId: block?.scheduleId ?? null, date: record.date || block?.date || '' });
      }
      if (!Object.hasOwn(part, 'activeWorkLogId')) part.activeWorkLogId = null;
    }
  }
  return ledger;
}

export function getWorkLogs(settings, item, stage, { includeVoided = false } = {}) {
  const id = getWorkPartId(item, stage);
  return (settings.workflow?.workLogs || []).filter(log => log.partId === id && (includeVoided || !log.voided)).sort((a,b) => a.attemptNumber-b.attemptNumber);
}
export function getPartAllocation(settings, item, stage) {
  return (settings.workflow?.allocations || []).find(row => row.partId === getWorkPartId(item, stage)) || null;
}
export function linkWorkPart(settings, item, stage, scheduleId) {
  const ledger = ledgerFor(settings); const partId = getWorkPartId(item, stage);
  if (!ledger.workParts.some(part => part.id === partId)) ensureWorkflowLedger(settings, [item], [], { preserveMissing: true });
  return upsert(ledger.allocations, { id: `allocation:${partId}`, partId, stage: stageFromView(stage), sessionId: session(item), scheduleId: scheduleId ?? null });
}
export function appendWorkLog(settings, item, stage, record = {}, options = {}) {
  const ledger = ledgerFor(settings); const partId = getWorkPartId(item, stage);
  if (!ledger.workParts.some(part => part.id === partId)) ensureWorkflowLedger(settings, [item], [], { preserveMissing: true });
  const part = ledger.workParts.find(row => row.id === partId);
  const attemptNumber = Math.max(0, ...ledger.workLogs.filter(log => log.partId === partId).map(log => log.attemptNumber || 0)) + 1;
  const log = { recordingInfo: copy(record.recordingInfo || item.recordingInfo || {}), editInfo: copy(record.editInfo || item.editInfo || {}), ...copy(record), id: `log:${partId}:${attemptNumber}`, partId, taskId: part.taskId, stageWorkId: part.stageWorkId,
    name: record.name || item.name || item.title || '', stage: stageFromView(stage), poolItemId: item.id, sessionId: session(item), projectId: item.projectId || '', instrumentId: item.instrumentId || '',
    assigneeId: record.assigneeId ?? getAssigneeId(item, stage), musicDuration: record.musicDuration ?? part.musicDuration,
    scheduleId: options.scheduleId ?? getPartAllocation(settings, item, stage)?.scheduleId ?? null,
    date: options.date ?? record.date ?? '', attemptNumber, voided: false };
  delete log.workLogId;
  ledger.workLogs.push(log); part.activeWorkLogId = log.id;
  if (item.records?.[viewFromStage(stage)]) item.records[viewFromStage(stage)].workLogId = log.id;
  return log;
}
export function updateWorkLog(settings, id, patch) {
  const log = ledgerFor(settings).workLogs.find(row => row.id === id);
  if (!log) throw new Error('Work record not found');
  const { id: ignoredId, partId, taskId, stageWorkId, stage, poolItemId, sessionId, attemptNumber, ...editable } = patch;
  Object.assign(log, copy(editable)); return log;
}
export function invalidateWorkLog(settings, id) { return updateWorkLog(settings, id, { voided: true }); }
export function setActiveWorkLog(settings, item, stage, id) {
  const ledger = ledgerFor(settings), partId = getWorkPartId(item, stage);
  const part = ledger.workParts.find(row => row.id === partId);
  if (!part || (id && !ledger.workLogs.some(log => log.id === id && log.partId === partId && !log.voided))) throw new Error('Invalid active work record');
  part.activeWorkLogId = id || null;
  return hydrateWorkRecord(settings, item, stage);
}
export function hydrateWorkRecord(settings, item, stage) {
  const part = settings.workflow?.workParts.find(row => row.id === getWorkPartId(item, stage));
  if (!part || !Object.hasOwn(part, 'activeWorkLogId')) return item.records?.[viewFromStage(stage)] || {};
  const log = settings.workflow.workLogs.find(row => row.id === part.activeWorkLogId && !row.voided);
  if (!log && !item.records) return {};
  if (!item.records) item.records = {};
  item.records[viewFromStage(stage)] = log ? { ...copy(log), workLogId: log.id } : {};
  return item.records[viewFromStage(stage)];
}

export function getActiveWorkLog(settings, item, stage) {
  const part = settings.workflow?.workParts.find(row => row.id === getWorkPartId(item, stage));
  return settings.workflow?.workLogs.find(log => log.id === part?.activeWorkLogId && !log.voided) || null;
}
