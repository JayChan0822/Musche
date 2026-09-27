import { getScheduleStage, viewFromStage } from '../utils/workflow.js';
import { getCurrentScope, onScopeDispose } from 'vue';
import { formatClock } from '../utils/time.js';

// Week-grid movement starts before native HTML drag-and-drop takes over mouse input.
export function registerPreciseScheduleMoveFeature({ refs, state, actions = {} }) {
  const { scheduledTasks, pxPerMin, isMobile } = refs;
  const { settings } = state;
  const {
    getWindow = () => window,
    getDocument = () => document,
    checkOverlap = () => false,
    openAlertModal = () => {},
    pushHistory = () => {},
    setTimeout: defer = setTimeout,
  } = actions;
  let gesture = null;

  const cleanup = () => {
    if (!gesture) return;
    const { win, source, originalOpacity, originalDraggable, ghost } = gesture;
    win.removeEventListener('mousemove', move, true);
    win.removeEventListener('mouseup', finish, true);
    win.removeEventListener('keydown', keydown, true);
    win.removeEventListener('blur', cleanup);
    ghost?.remove();
    source.style.opacity = originalOpacity;
    source.draggable = originalDraggable;
    gesture = null;
  };

  const updatePreview = (event) => {
    const g = gesture;
    const column = g.doc.elementFromPoint(event.clientX, event.clientY)?.closest('[data-date-str]');
    const grid = column?.querySelector('.relative[style*="min-height"]');
    g.candidate = null;
    if (!grid) {
      g.ghost.style.opacity = '0.3';
      return;
    }
    const gridTop = grid.getBoundingClientRect().top;
    const rawMinutes = settings.startHour * 60 + (event.clientY - gridTop - g.offsetY) / pxPerMin.value;
    const snapMinutes = g.precise || event.metaKey ? 1 : 15;
    const minutes = Math.max(settings.startHour * 60, Math.min(
      settings.endHour * 60 - snapMinutes,
      Math.round(rawMinutes / snapMinutes) * snapMinutes,
    ));
    const startTime = formatClock(Math.floor(minutes / 60), minutes % 60);
    g.candidate = { date: column.dataset.dateStr, startTime };
    Object.assign(g.ghost.style, {
      top: `${gridTop + (minutes - settings.startHour * 60) * pxPerMin.value}px`,
      left: `${column.getBoundingClientRect().left + 4}px`,
      opacity: '0.9',
    });
    const label = g.ghost.querySelector('[data-schedule-start]');
    if (label) label.textContent = startTime;
  };

  const move = (event) => {
    if (!gesture) return;
    event.preventDefault();
    const g = gesture;
    if (!g.ghost) {
      if (Math.hypot(event.clientX - g.startX, event.clientY - g.startY) < 3) return;
      g.ghost = g.source.cloneNode(true);
      g.ghost.removeAttribute('id');
      g.ghost.setAttribute('aria-hidden', 'true');
      g.ghost.classList.remove('is-selected', 'is-ghost');
      Object.assign(g.ghost.style, {
        position: 'fixed', width: `${g.rect.width}px`, height: `${g.rect.height}px`,
        top: `${g.rect.top}px`, left: `${g.rect.left}px`,
        margin: '0', right: 'auto', transform: 'none', transition: 'none',
        zIndex: '99999', pointerEvents: 'none', opacity: '0.9',
      });
      g.doc.body.appendChild(g.ghost);
      g.source.style.opacity = '0.35';
    }
    updatePreview(event);
  };

  const finish = (event) => {
    if (!gesture) return;
    const g = gesture;
    if (g.ghost) updatePreview(event);
    const candidate = g.candidate;
    const moved = !!g.ghost;
    cleanup();
    if (moved) {
      // Do not turn the mouseup after a drag into a Command-click selection.
      const swallowClick = (click) => { click.preventDefault(); click.stopPropagation(); };
      g.win.addEventListener('click', swallowClick, { capture: true, once: true });
      defer(() => g.win.removeEventListener('click', swallowClick, true), 0);
    }
    if (!candidate) return;
    const index = scheduledTasks.value.findIndex((task) => task.scheduleId === g.scheduleId);
    if (index < 0) return;
    const task = scheduledTasks.value[index];
    if (task.date === candidate.date && task.startTime === candidate.startTime) return;
    const type = viewFromStage(getScheduleStage(task));
    if (checkOverlap(candidate.date, candidate.startTime, task.estDuration, task.scheduleId, type, task)) {
      openAlertModal('时间冲突', '该时间段已有同类型的其他安排。');
      return;
    }
    scheduledTasks.value[index] = { ...task, ...candidate };
    pushHistory();
  };

  const keydown = (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    cleanup();
  };

  const initPreciseScheduleMove = (event, task) => {
    if (isMobile.value || event.button !== 0) return;
    if (event.target.closest('.resize-handle, .mobile-resize-handle, button, input, select, textarea, a')) return;
    cleanup();
    event.preventDefault();
    event.stopPropagation();
    const source = event.currentTarget;
    const rect = source.getBoundingClientRect();
    const win = getWindow();
    gesture = {
      scheduleId: task.scheduleId, source, rect, win, doc: getDocument(),
      startX: event.clientX, startY: event.clientY, offsetY: event.clientY - rect.top,
      originalOpacity: source.style.opacity, originalDraggable: source.draggable,
      precise: !!event.metaKey, ghost: null, candidate: null,
    };
    source.draggable = false;
    win.addEventListener('mousemove', move, true);
    win.addEventListener('mouseup', finish, true);
    win.addEventListener('keydown', keydown, true);
    win.addEventListener('blur', cleanup);
  };

  if (getCurrentScope()) onScopeDispose(cleanup);
  return { initPreciseScheduleMove };
}
