import { getAssigneeId, getScheduleStage, stageFromView, viewFromStage } from './workflow.js';
import { parseTime, timeToMinutes } from './time.js';
import { peekItemSplitState } from './split-state.js';
import { getWorkLogs, getWorkPartId, getPartAllocation } from './workflow-ledger.js';
import { metadataTypes } from './metadata-types.js';

export const insightDimensions = [
  { type: 'musician', label: '人员' },
  { type: 'instrument', label: '乐器' },
  { type: 'project', label: '项目' },
];
const sessionOf = (item) => item.sessionId || 'S_DEFAULT';
const seconds = (value) => {
  const parsed = parseTime(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};
const validDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : null;
};
const actualSeconds = (record) => {
  if (record.actualDuration) return seconds(record.actualDuration);
  const clock = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  if (!clock.test(record.recStart || '') || !clock.test(record.recEnd || '')) return 0;
  let minutes = timeToMinutes(record.recEnd) - timeToMinutes(record.recStart);
  if (minutes < 0) minutes += 1440;
  return Math.max(0, minutes - (Number(record.breakMinutes) > 0 ? Number(record.breakMinutes) : 0)) * 60;
};

function summarize(rows) {
  const families = new Map();
  rows.forEach((row) => {
    if (!families.has(row.familyKey)) families.set(row.familyKey, []);
    families.get(row.familyKey).push(row);
  });
  const active = rows.filter((row) => row.status !== 'skipped');
  const recorded = active.filter((row) => row.actualSeconds > 0);
  const samples = recorded.filter((row) => row.musicSeconds > 0);
  const sum = (list, field) => list.reduce((total, row) => total + row[field], 0);
  const uniqueParts = (list) => [...new Map(list.map(row => [row.partKey || row.key, row])).values()];
  const partMusic = (list) => {
    const parts = new Map();
    [...list].sort((a, b) => (a.attemptNumber || 0) - (b.attemptNumber || 0)).forEach(row => {
      const key = row.partKey || row.key;
      if (row.musicSeconds > 0 && !parts.has(key)) parts.set(key, row);
    });
    return sum([...parts.values()], 'musicSeconds');
  };
  const sampleMusic = partMusic(samples);
  const ratios = [];
  let completedCount = 0, pendingCount = 0, skippedCount = 0, partialCount = 0;
  families.forEach((segments) => {
    const eligible = segments.filter((row) => row.status !== 'skipped');
    if (!eligible.length) skippedCount++;
    else if (eligible.every((row) => row.status === 'recorded')) completedCount++;
    else {
      pendingCount++;
      if (eligible.some((row) => row.status === 'recorded' || row.status === 'in-progress')) partialCount++;
    }
    const valid = eligible.filter((row) => row.ratio !== null);
    const music = partMusic(valid);
    if (music > 0) ratios.push(sum(valid, 'actualSeconds') / music);
  });
  ratios.sort((a, b) => a - b);
  const midpoint = Math.floor(ratios.length / 2);
  const dates = recorded.map((row) => row.date).filter(Boolean).sort();
  return {
    trackCount: families.size, segmentCount: uniqueParts(rows).length, attemptCount: rows.filter(row => row.logId).length,
    completedCount, pendingCount, skippedCount, partialCount,
    musicSeconds: partMusic(active), recordedMusicSeconds: sampleMusic,
    actualSeconds: sum(recorded, 'actualSeconds'), breakSeconds: sum(recorded, 'breakSeconds'),
    averageRatio: sampleMusic > 0 ? sum(samples, 'actualSeconds') / sampleMusic : null,
    medianRatio: ratios.length ? (ratios.length % 2 ? ratios[midpoint] : (ratios[midpoint - 1] + ratios[midpoint]) / 2) : null,
    sampleCount: ratios.length, sampleSegments: uniqueParts(samples).length,
    unratedCount: recorded.length - samples.length,
    undatedRecordedCount: recorded.filter((row) => !row.date).length,
    latestDate: dates.at(-1) || null,
  };
}

export function buildResourceInsights({ type, id, settings = {}, itemPool = [], scheduledTasks = [], sessionId = null, stage = 'rec' }) {
  stage = stageFromView(stage);
  const view = viewFromStage(stage);
  const recordOf = (item) => item.records ? (item.records[view] || {}) : stage === 'rec' ? item : {};
  const infoField = stage === 'edit' ? 'editInfo' : 'recordingInfo';
  const names = Object.fromEntries(insightDimensions.map(({ type: dim }) =>
    [dim, new Map((settings[`${dim}s`] || []).map((item) => [item.id, item.name]))]));
  const sessions = new Map((settings.sessions || []).map((item) => [item.id, item.name]));
  const lookup = new Map(itemPool.map((item) => [`${sessionOf(item)}|${item.id}`, item]));
  const familyKey = (item) => {
    const seen = new Set();
    let current = item;
    while (current && !seen.has(current.id)) {
      seen.add(current.id);
      const parent = peekItemSplitState(current, view).splitFromId;
      if (!parent) return `${sessionOf(item)}|${current.id}`;
      current = lookup.get(`${sessionOf(item)}|${parent}`);
      if (!current) return `${sessionOf(item)}|${parent}`;
    }
    return `${sessionOf(item)}|${[...seen].sort()[0]}`;
  };
  const schedulesByMusician = new Map();
  const schedulesByTemplate = new Map();
  scheduledTasks.forEach((task) => {
    if (getScheduleStage(task) !== stage) return;
    if (task.templateId) {
      const key = `${sessionOf(task)}|${task.templateId}`;
      if (!schedulesByTemplate.has(key)) schedulesByTemplate.set(key, []);
      schedulesByTemplate.get(key).push(task);
    }
    const owner = getAssigneeId(task, stage);
    if (owner) {
      const key = `${sessionOf(task)}|${owner}`;
      if (!schedulesByMusician.has(key)) schedulesByMusician.set(key, []);
      schedulesByMusician.get(key).push(task);
    }
  });
  schedulesByMusician.forEach((list) => list.sort((a, b) =>
    (a.date || '').localeCompare(b.date || '') || (a.startTime || '').localeCompare(b.startTime || '')));

  const isMetadata = metadataTypes.some((category) => category.type === type);
  const metadataName = isMetadata ? settings[`${type}s`]?.find((entry) => entry.id === id)?.name : null;
  const normalizedName = (value) => typeof value === 'string' ? value.trim().toLowerCase() : '';
  const canonical = settings.workflow?.version >= 11;
  const archivedItems = canonical ? (settings.workflow.workParts || []).filter(part => part.stage === stage && !itemPool.some(item => getWorkPartId(item, stage) === part.id)).map(part => {
    const base = settings.workflow.baseTasks?.find(task => task.id === part.taskId) || {};
    return { ...base, id: part.poolItemId || part.itemId, sessionId: part.sessionId, musicDuration: part.musicDuration, musicianId: stage === 'rec' ? part.assigneeId : '', editorId: stage === 'edit' ? part.assigneeId : '', workflowStatus: { [stage]: part.status }, splitViews: { [view]: { active: true, musicDuration: part.musicDuration, splitTag: part.splitTag } } };
  }).filter(item => getWorkLogs(settings, item, stage).length) : [];
  const rows = [...itemPool, ...archivedItems].filter((item) => (canonical || isMetadata || type === 'musician' || item[`${type}Id`] === id) && (!sessionId || sessionOf(item) === sessionId))
    .flatMap((item) => {
      const split = peekItemSplitState(item, view);
      if (!split.active && (!canonical || !getWorkLogs(settings, item, stage).length)) return [];
      // Once per-view records exist, legacy fields may describe EDIT. Never reuse them.
      const logs = canonical ? getWorkLogs(settings, item, stage) : [];
      return (logs.length ? logs : [canonical ? {} : recordOf(item)]).flatMap((record) => {
      const owner = Object.hasOwn(record, 'assigneeId') ? record.assigneeId || '' : getAssigneeId(item, stage);
      if (type === 'musician' && owner !== id) return [];
      if (!isMetadata && type !== 'musician' && (record[`${type}Id`] ?? item[`${type}Id`]) !== id) return [];
      const actual = actualSeconds(record);
      const music = seconds(record.musicDuration ?? split.musicDuration);
      const skipped = !!item.isSkipped || item.workflowStatus?.[stage] === 'not-required';
      const exact = schedulesByTemplate.get(`${sessionOf(item)}|${item.id}`) || [];
      const related = schedulesByMusician.get(`${sessionOf(item)}|${owner}`) || [];
      const allocation = canonical ? getPartAllocation(settings, item, stage) : null;
      const associated = canonical ? scheduledTasks.filter(task => task.scheduleId === (record.id ? record.scheduleId : allocation?.scheduleId) && sessionOf(task) === sessionOf(item)) : exact.length ? exact : [related[split.sectionIndex]].filter(Boolean);
      if (isMetadata) {
        if (!metadataName) return [];
        const direct = normalizedName((record[infoField] || record.metadata || item[infoField])?.[type]);
        const assignments = associated.map((task) => normalizedName(task[infoField]?.[type]));
        const target = normalizedName(metadataName);
        if (direct ? direct !== target : !assignments.length || !assignments.every((name) => name === target)) return [];
      }
      const dates = [...new Set(associated.map((task) => validDate(task.date)).filter(Boolean))];
      const date = validDate(record.date) || (dates.length === 1 ? dates[0] : null);
      return [{
        id: item.id, key: record.id || `${sessionOf(item)}|${item.id}`, logId: record.id || null, attemptNumber: record.attemptNumber || null, partKey: canonical ? getWorkPartId(item, stage) : `${sessionOf(item)}|${item.id}`, familyKey: canonical ? (settings.workflow.workParts?.find(part => part.id === getWorkPartId(item, stage))?.taskId || familyKey(item)) : familyKey(item),
        name: item.name || names.instrument.get(item.instrumentId) || '未命名曲目',
        splitTag: split.splitTag, sessionId: sessionOf(item), sessionName: sessions.get(sessionOf(item)) || '未命名日程',
        stage, musicianId: owner, musician: record.assigneeName || names.musician.get(owner) || (stage === 'edit' ? '未指定剪辑员' : '未指定演奏员'),
        instrumentId: record.instrumentId ?? item.instrumentId ?? '', instrument: names.instrument.get(record.instrumentId ?? item.instrumentId) || '未指定乐器',
        projectId: record.projectId ?? item.projectId ?? '', project: names.project.get(record.projectId ?? item.projectId) || '未指定项目',
        date, startTime: record.recStart || '', musicSeconds: music, actualSeconds: actual,
        breakSeconds: Number.isFinite(Number(record.breakMinutes)) ? Math.max(0, Number(record.breakMinutes)) * 60 : 0,
        status: skipped ? 'skipped' : item.workflowStatus?.[stage]
          ? (item.workflowStatus[stage] === 'completed' ? 'recorded' : item.workflowStatus[stage] === 'in-progress' ? 'in-progress' : 'pending')
          : actual > 0 ? 'recorded' : 'pending',
        ratio: !skipped && actual > 0 && music > 0 ? actual / music : null,
      }];
      });
    }).sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.startTime.localeCompare(a.startTime) || a.name.localeCompare(b.name, 'zh-CN'));

  const breakdowns = insightDimensions.filter((dim) => dim.type !== type).map((dimension) => {
    const groups = new Map();
    rows.filter((row) => row.status !== 'skipped').forEach((row) => {
      const key = row[`${dimension.type}Id`];
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    });
    const items = [...groups].map(([key, items]) => ({ id: key, name: items[0][dimension.type], ...summarize(items) }))
      .sort((a, b) => b.actualSeconds - a.actualSeconds || b.trackCount - a.trackCount || a.name.localeCompare(b.name, 'zh-CN'));
    return { ...dimension, label: dimension.type === 'musician' ? (stage === 'edit' ? '剪辑员' : '演奏员') : dimension.label, items };
  });
  const months = new Map();
  rows.filter((row) => row.ratio !== null && row.date).forEach((row) => {
    const month = row.date.slice(0, 7);
    if (!months.has(month)) months.set(month, []);
    months.get(month).push(row);
  });
  const trend = [...months].sort(([a], [b]) => a.localeCompare(b))
    .map(([month, items]) => ({ month, ...summarize(items) }));
  return { rows, summary: summarize(rows), breakdowns, trend };
}
