import { getScheduleStage, viewFromStage } from '../utils/workflow.js';

const pad = value => String(value).padStart(2, '0');
const minutes = (value, allowMidnight = false) => {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) return NaN;
  const [h, m] = value.split(':').map(Number);
  return m < 60 && (h < 24 || (allowMidnight && h === 24 && m === 0)) ? h * 60 + m : NaN;
};
const validDate = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  return year > 0 && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};
const seconds = value => typeof value === 'string' ? value.split(':').map(Number).reduce((n, part) => n * 60 + part, 0) : 0;
const failure = error => ({ ok: false, task: null, error });

/** Drafts are detached plain values. Only these two explicit commands mutate persisted schedules. */
export function registerMobileCalendarEvents({ refs, actions = {} }) {
  const { scheduledTasks, currentSessionId } = refs;
  const { checkOverlap = () => false, pushHistory = () => {}, createId = () => `calendar-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}` } = actions;
  const session = () => currentSessionId.value || 'S_DEFAULT';
  const resolve = original => scheduledTasks.value.find(task => task.scheduleId === original?.scheduleId && (task.sessionId || 'S_DEFAULT') === session());

  function commitCalendarEvent(original, draft = {}) {
    const existing = original == null ? null : resolve(original);
    if (original != null && (!existing || (original.sessionId || 'S_DEFAULT') !== session())) return failure('日程不属于当前项目，或已被删除');
    if (!validDate(draft.date)) return failure('请选择有效日期');
    const free = !existing || existing.isCalendarEvent === true;
    const title = typeof draft.title === 'string' ? draft.title.trim() : '';
    if (free && !title) return failure('请输入标题');
    if (!free && draft.allDay) return failure('工作任务需要具体的开始和结束时间');
    const allDay = free && draft.allDay === true;
    const start = allDay ? 0 : minutes(draft.startTime);
    const end = allDay ? 1440 : minutes(draft.endTime, true);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return failure('结束时间必须晚于开始时间，且在同一天内');
    const duration = end - start;
    const next = {
      ...(existing || { scheduleId: createId(), sessionId: session(), isCalendarEvent: true, musicDuration: '00:00:00', ratio: 1 }),
      date: draft.date,
      startTime: `${pad(Math.floor(start / 60))}:${pad(start % 60)}`,
      estDuration: `${pad(Math.floor(duration / 60))}:${pad(duration % 60)}:00`,
    };
    if (free) Object.assign(next, { calendarTitle: title, allDay, notes: typeof draft.notes === 'string' ? draft.notes : '' });
    const musicSeconds = seconds(next.musicDuration);
    if (musicSeconds > 0) next.ratio = (duration * 60 / musicSeconds).toFixed(1);
    if (checkOverlap(next.date, next.startTime, next.estDuration, existing?.scheduleId, viewFromStage(getScheduleStage(next)), next)) return failure('此时间与现有日程冲突');
    if (existing && Object.keys(next).every(key => next[key] === existing[key])) return { ok: true, task: existing, error: null };
    pushHistory();
    if (existing) Object.assign(existing, next);
    else scheduledTasks.value.push(next);
    return { ok: true, task: existing || scheduledTasks.value[scheduledTasks.value.length - 1], error: null };
  }

  function deleteCalendarEvent(original) {
    const task = resolve(original);
    if (!task || (original.sessionId || 'S_DEFAULT') !== session()) return failure('日程不属于当前项目，或已被删除');
    if (task.isCalendarEvent !== true) return failure('请在任务详情中管理工作任务，避免删除关联工作记录');
    pushHistory();
    scheduledTasks.value.splice(scheduledTasks.value.indexOf(task), 1);
    return { ok: true, task, error: null };
  }
  return { commitCalendarEvent, deleteCalendarEvent };
}
