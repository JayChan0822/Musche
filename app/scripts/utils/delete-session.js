const sessionOf = row => row.sessionId || 'S_DEFAULT';

export function deleteSessionData(settings, pool, schedules, sessionId) {
  if (settings.sessions.length <= 1 || !settings.sessions.some(row => row.id === sessionId)) return null;
  const ledger = settings.workflow;
  const sources = [pool, schedules, ledger?.baseTasks || [], ledger?.workLogs || []];
  const candidates = new Set(sources.flat().filter(row => sessionOf(row) === sessionId).map(row => row.projectId).filter(Boolean));
  for (const project of settings.projects || []) if (project.sessionId === sessionId) candidates.add(project.id);
  const retained = new Set(sources.flat().filter(row => sessionOf(row) !== sessionId).map(row => row.projectId).filter(Boolean));
  for (const project of settings.projects || []) if (project.sessionId && project.sessionId !== sessionId) retained.add(project.id);
  const parts = new Set((ledger?.workParts || []).filter(row => sessionOf(row) === sessionId).map(row => row.id));
  if (ledger) {
    for (const name of ['baseTasks', 'stageWorks', 'workParts', 'workLogs', 'allocations']) {
      ledger[name] = (ledger[name] || []).filter(row => sessionOf(row) !== sessionId && !parts.has(row.partId));
    }
    if (ledger.migrationIssues) ledger.migrationIssues = ledger.migrationIssues.filter(row => !parts.has(row.partId));
  }
  settings.projects = (settings.projects || []).filter(project => !candidates.has(project.id) || retained.has(project.id));
  settings.sessions = settings.sessions.filter(row => row.id !== sessionId);
  return { pool: pool.filter(row => sessionOf(row) !== sessionId), tasks: schedules.filter(row => sessionOf(row) !== sessionId) };
}
