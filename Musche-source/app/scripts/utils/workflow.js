// Business stages are independent of the legacy view names retained by the UI adapter.
export const UNASSIGNED_ID = '__UNASSIGNED__';
export const stageFromView = (view) => view === 'edit' || view === 'project' ? 'edit' : 'rec';
export const viewFromStage = (stage) => stageFromView(stage) === 'edit' ? 'project' : 'musician';
export const getScheduleStage = (block = {}) => block.stage === 'rec' || block.stage === 'edit'
  ? block.stage
  : block.editorId || (block.projectId && !block.musicianId) ? 'edit' : 'rec';
export const getAssigneeId = (item = {}, stage = 'rec') => {
  const value = stageFromView(stage) === 'edit' ? item.editorId : item.musicianId;
  return value === UNASSIGNED_ID ? '' : value || '';
};
export const getScheduleOwner = (block) => {
  const stage = getScheduleStage(block);
  return { stage, assigneeId: getAssigneeId(block, stage) };
};
export const peopleForRole = (settings, role) => (settings.musicians || []).filter((person) =>
  Array.isArray(person.roles) ? person.roles.includes(role) : role === 'musician');
export const ownerKeyForStage = (stage) => stageFromView(stage) === 'edit' ? 'editorId' : 'musicianId';

export function stageStatus(item, stage) {
  return item.workflowStatus?.[stageFromView(stage)] || 'not-started';
}
