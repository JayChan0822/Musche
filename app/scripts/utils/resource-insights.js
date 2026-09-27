import { parseTime, timeToMinutes } from './time.js';
import { peekItemSplitState } from './split-state.js';

export const insightDimensions = [
  { type: 'musician', label: '乐手' },
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
  const recorded = active.filter((row) => row.status === 'recorded');
  const samples = recorded.filter((row) => row.musicSeconds > 0);
  const sum = (list, field) => list.reduce((total, row) => total + row[field], 0);
  const sampleMusic = sum(samples, 'musicSeconds');
  const ratios = [];
  let completedCount = 0, pendingCount = 0, skippedCount = 0, partialCount = 0;
  families.forEach((segments) => {
    const eligible = segments.filter((row) => row.status !== 'skipped');
    if (!eligible.length) skippedCount++;
    else if (eligible.every((row) => row.status === 'recorded')) completedCount++;
    else {
      pendingCount++;
      if (eligible.some((row) => row.status === 'recorded')) partialCount++;
    }
    const valid = eligible.filter((row) => row.ratio !== null);
    const music = sum(valid, 'musicSeconds');
    if (music > 0) ratios.push(sum(valid, 'actualSeconds') / music);
  });
  ratios.sort((a, b) => a - b);
  const midpoint = Math.floor(ratios.length / 2);
  const dates = recorded.map((row) => row.date).filter(Boolean).sort();
  return {
    trackCount: families.size, segmentCount: rows.length,
    completedCount, pendingCount, skippedCount, partialCount,
    musicSeconds: sum(active, 'musicSeconds'), recordedMusicSeconds: sampleMusic,
    actualSeconds: sum(recorded, 'actualSeconds'), breakSeconds: sum(recorded, 'breakSeconds'),
    averageRatio: sampleMusic > 0 ? sum(samples, 'actualSeconds') / sampleMusic : null,
    medianRatio: ratios.length ? (ratios.length % 2 ? ratios[midpoint] : (ratios[midpoint - 1] + ratios[midpoint]) / 2) : null,
    sampleCount: ratios.length, sampleSegments: samples.length,
    unratedCount: recorded.length - samples.length,
    undatedRecordedCount: recorded.filter((row) => !row.date).length,
    latestDate: dates.at(-1) || null,
  };
}

export function buildResourceInsights({ type, id, settings = {}, itemPool = [], scheduledTasks = [], sessionId = null }) {
  const names = Object.fromEntries(insightDimensions.map(({ type: dim }) =>
    [dim, new Map((settings[`${dim}s`] || []).map((item) => [item.id, item.name]))]));
  const sessions = new Map((settings.sessions || []).map((item) => [item.id, item.name]));
  const lookup = new Map(itemPool.map((item) => [`${sessionOf(item)}|${item.id}`, item]));
  const familyKey = (item) => {
    const seen = new Set();
    let current = item;
    while (current && !seen.has(current.id)) {
      seen.add(current.id);
      const parent = peekItemSplitState(current, 'musician').splitFromId;
      if (!parent) return `${sessionOf(item)}|${current.id}`;
      current = lookup.get(`${sessionOf(item)}|${parent}`);
      if (!current) return `${sessionOf(item)}|${parent}`;
    }
    return `${sessionOf(item)}|${[...seen].sort()[0]}`;
  };
  const schedulesByMusician = new Map();
  const schedulesByTemplate = new Map();
  scheduledTasks.forEach((task) => {
    if (task.templateId) {
      const key = `${sessionOf(task)}|${task.templateId}`;
      if (!schedulesByTemplate.has(key)) schedulesByTemplate.set(key, []);
      schedulesByTemplate.get(key).push(task);
    }
    if (task.musicianId) {
      const key = `${sessionOf(task)}|${task.musicianId}`;
      if (!schedulesByMusician.has(key)) schedulesByMusician.set(key, []);
      schedulesByMusician.get(key).push(task);
    }
  });
  schedulesByMusician.forEach((list) => list.sort((a, b) =>
    (a.date || '').localeCompare(b.date || '') || (a.startTime || '').localeCompare(b.startTime || '')));

  const rows = itemPool.filter((item) => item[`${type}Id`] === id && (!sessionId || sessionOf(item) === sessionId))
    .flatMap((item) => {
      const split = peekItemSplitState(item, 'musician');
      if (!split.active) return [];
      // Once per-view records exist, legacy fields may describe EDIT. Never reuse them.
      const record = item.records ? (item.records.musician || {}) : item;
      const actual = actualSeconds(record);
      const music = seconds(split.musicDuration);
      const skipped = !!item.isSkipped;
      const exact = schedulesByTemplate.get(`${sessionOf(item)}|${item.id}`) || [];
      const related = schedulesByMusician.get(`${sessionOf(item)}|${item.musicianId}`) || [];
      const associated = exact.length ? exact : [related[split.sectionIndex]].filter(Boolean);
      const dates = [...new Set(associated.map((task) => validDate(task.date)).filter(Boolean))];
      const date = dates.length === 1 ? dates[0] : null;
      return [{
        id: item.id, key: `${sessionOf(item)}|${item.id}`, familyKey: familyKey(item),
        name: item.name || names.instrument.get(item.instrumentId) || '未命名曲目',
        splitTag: split.splitTag, sessionId: sessionOf(item), sessionName: sessions.get(sessionOf(item)) || '未命名日程',
        musicianId: item.musicianId || '', musician: names.musician.get(item.musicianId) || '未指定乐手',
        instrumentId: item.instrumentId || '', instrument: names.instrument.get(item.instrumentId) || '未指定乐器',
        projectId: item.projectId || '', project: names.project.get(item.projectId) || '未指定项目',
        date, startTime: record.recStart || '', musicSeconds: music, actualSeconds: actual,
        breakSeconds: Number.isFinite(Number(record.breakMinutes)) ? Math.max(0, Number(record.breakMinutes)) * 60 : 0,
        status: skipped ? 'skipped' : actual > 0 ? 'recorded' : 'pending',
        ratio: !skipped && actual > 0 && music > 0 ? actual / music : null,
      }];
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
    return { ...dimension, items };
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
