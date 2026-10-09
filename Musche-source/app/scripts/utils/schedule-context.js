import { getScheduleStage, stageFromView, viewFromStage, getAssigneeId, UNASSIGNED_ID } from './workflow.js';

export function scheduleContext(task) {
  const stage = getScheduleStage(task);
  const view = viewFromStage(stage);
  const field = stage === 'edit' ? 'editorId' : 'musicianId';
  // Old EDIT aggregates belong to a project, never to an inferred editor.
  const legacyProject = stage === 'edit' && !task.editorId && task.projectId && !task.templateId;
  return { stage, view, field: legacyProject ? 'projectId' : field,
    id: legacyProject ? task.projectId : (task[field] || UNASSIGNED_ID), legacyProject };
}
export function scheduleMatches(a, b) {
  const x = scheduleContext(a), y = scheduleContext(b);
  return x.stage === y.stage && x.field === y.field && x.id === y.id;
}
export function itemMatchesSchedule(item, task) {
  const ctx = scheduleContext(task);
  return (item[ctx.field] || UNASSIGNED_ID) === ctx.id;
}
export function scheduleIdentity(item, source, view) {
  if (source === 'schedule') return item;
  const stage = source === 'aggregate' && item.stage ? item.stage : stageFromView(view);
  const assignee = source === 'aggregate' ? (item.assigneeId || item.id) : getAssigneeId(item, stage);
  return { stage, musicianId: stage === 'rec' && assignee !== UNASSIGNED_ID ? assignee || '' : '',
    editorId: stage === 'edit' && assignee !== UNASSIGNED_ID ? assignee || '' : '',
    projectId: source === 'aggregate' ? '' : item.projectId || '' };
}
