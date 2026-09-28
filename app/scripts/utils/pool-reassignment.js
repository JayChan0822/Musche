import { ensureWorkflowLedger, getPartAllocation, linkWorkPart } from './workflow-ledger.js';
import { stageFromView, ownerKeyForStage, UNASSIGNED_ID, peopleForRole } from './workflow.js';
import { setItemSplitState } from './split-state.js';

export function reassignPoolTask(settings, pool, schedules, itemId, view, targetId) {
  if (!['musician', 'project'].includes(view)) return false;
  const item = pool.find(entry => entry.id === itemId);
  const stage = stageFromView(view), ownerKey = ownerKeyForStage(stage);
  const owner = targetId === UNASSIGNED_ID ? '' : targetId;
  if (!item || (item[ownerKey] || '') === owner) return false;
  if (owner && !peopleForRole(settings, stage === 'edit' ? 'editor' : 'musician').some(person => person.id === owner)) return false;
  ensureWorkflowLedger(settings, pool, schedules, { bootstrap: !settings.workflow });
  const oldScheduleId = getPartAllocation(settings, item, stage)?.scheduleId;
  linkWorkPart(settings, item, stage, null);
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
