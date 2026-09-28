import { ensureWorkflowLedger, getPartAllocation, linkWorkPart } from './workflow-ledger.js';
import { stageFromView, ownerKeyForStage, UNASSIGNED_ID, peopleForRole, getScheduleStage, getAssigneeId } from './workflow.js';
import { setItemSplitState } from './split-state.js';

export function reassignmentSchedules(schedules, item, view, targetId) {
  if (!item || !targetId || targetId === UNASSIGNED_ID || !['musician', 'project'].includes(view)) return [];
  const stage = stageFromView(view);
  return schedules.filter(block => (block.sessionId || 'S_DEFAULT') === (item.sessionId || 'S_DEFAULT') &&
    getScheduleStage(block) === stage && getAssigneeId(block, stage) === targetId)
    .sort((a, b) => `${a.date || ''} ${a.startTime || ''}`.localeCompare(`${b.date || ''} ${b.startTime || ''}`));
}

export function reassignPoolTask(settings, pool, schedules, itemId, view, targetId, scheduleId) {
  if (!['musician', 'project'].includes(view)) return false;
  const item = pool.find(entry => entry.id === itemId);
  const stage = stageFromView(view), ownerKey = ownerKeyForStage(stage);
  const owner = targetId === UNASSIGNED_ID ? '' : targetId;
  if (!item || (item[ownerKey] || '') === owner) return false;
  if (owner && !peopleForRole(settings, stage === 'edit' ? 'editor' : 'musician').some(person => person.id === owner)) return false;
  const candidates = reassignmentSchedules(schedules, item, view, targetId);
  if (scheduleId === undefined && candidates.length > 1) return false;
  const destination = scheduleId === undefined ? candidates[0] : candidates.find(block => block.scheduleId === scheduleId);
  if (scheduleId !== undefined && !destination) return false;
  ensureWorkflowLedger(settings, pool, schedules, { bootstrap: !settings.workflow });
  const oldScheduleId = getPartAllocation(settings, item, stage)?.scheduleId;
  linkWorkPart(settings, item, stage, destination?.scheduleId ?? null);
  item[ownerKey] = owner;
  setItemSplitState(item, view, { sectionIndex: -1 });
  item.sectionIndex = -1;
  // Execution history belongs to its original assignee; do not rewrite work logs.
  if (oldScheduleId != null && !settings.workflow.allocations.some(link => link.scheduleId === oldScheduleId) &&
      !settings.workflow.workLogs.some(log => log.scheduleId === oldScheduleId)) {
    const index = schedules.findIndex(block => block.scheduleId === oldScheduleId);
    if (index >= 0) schedules.splice(index, 1);
  }
  ensureWorkflowLedger(settings, pool, schedules);
  return true;
}
