import { getPartAllocation, linkWorkPart } from './workflow-ledger.js';
import { stageFromView, getScheduleStage } from './workflow.js';
import { itemMatchesSchedule } from './schedule-context.js';
import { peekItemSplitState, setItemSplitState } from './split-state.js';

export const hasStableScheduleLinks = (settings) => settings?.workflow?.version === 11;
export function resolveItemSchedule(settings, item, view, schedules = []) {
  if (hasStableScheduleLinks(settings)) {
    const link = getPartAllocation(settings, item, stageFromView(view));
    if (link?.scheduleId === null || link?.scheduleId === undefined) return null;
    return schedules.find((block) => String(block.scheduleId) === String(link?.scheduleId)) || null;
  }
  return schedules[Number(peekItemSplitState(item, view).sectionIndex) || 0] || null;
}
export function projectItemSection(settings, item, view, schedules = []) {
  const block = resolveItemSchedule(settings, item, view, schedules);
  const index = block ? schedules.indexOf(block) : -1;
  item.sectionIndex = index;
  setItemSplitState(item, view, { sectionIndex: index });
  return index;
}
export function assignItemSchedule(settings, item, view, schedule, index = -1) {
  if (hasStableScheduleLinks(settings)) linkWorkPart(settings, item, stageFromView(view), schedule?.scheduleId ?? null);
  item.sectionIndex = index;
  setItemSplitState(item, view, { sectionIndex: index });
}
export function unlinkSchedule(settings, pool, block) {
  if (!hasStableScheduleLinks(settings)) return;
  const stage = getScheduleStage(block);
  for (const item of pool) {
    const link = getPartAllocation(settings, item, stage);
    if (link && String(link.scheduleId) === String(block.scheduleId)) linkWorkPart(settings, item, stage, null);
  }
}
export function allocateNewSchedule(settings, pool, block) {
  if (!hasStableScheduleLinks(settings)) return;
  const stage = getScheduleStage(block);
  for (const item of pool) {
    if ((item.sessionId || 'S_DEFAULT') !== (block.sessionId || 'S_DEFAULT')) continue;
    if (block.templateId ? item.id !== block.templateId : !itemMatchesSchedule(item, block)) continue;
    if (peekItemSplitState(item, stage === 'edit' ? 'project' : 'musician').active === false) continue;
    if (!getPartAllocation(settings, item, stage)?.scheduleId) linkWorkPart(settings, item, stage, block.scheduleId);
  }
}
