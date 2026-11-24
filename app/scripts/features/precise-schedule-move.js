import { getScheduleStage, viewFromStage } from '../utils/workflow.js';
import { getCurrentScope, onScopeDispose } from 'vue';
import { formatClock } from '../utils/time.js';
import { createDragEdgePaging, dragEdgePressure, dragScrollDistance } from '../utils/calendar-drag-edges.js';

// Week-grid movement starts before native HTML drag-and-drop takes over mouse input.
export function registerPreciseScheduleMoveFeature({ refs, state, actions = {} }) {
  const { scheduledTasks, pxPerMin, isMobile, weekContainer } = refs;
  const { settings } = state;
  const {
    getWindow = () => window,
    getDocument = () => document,
    checkOverlap = () => false,
    openAlertModal = () => {},
    pushHistory = () => {},
    setTimeout: defer = setTimeout,
    changeDate = () => {},
  } = actions;
  let gesture = null;

  const cleanup = () => {
    if (!gesture) return;
    const { win, source, originalOpacity, originalDraggable, ghost, frame } = gesture;
    win.removeEventListener('mousemove', move, true);
    win.removeEventListener('mouseup', finish, true);
    win.removeEventListener('keydown', keydown, true);
    win.removeEventListener('blur', cleanup);
    if (frame) win.cancelAnimationFrame(frame);
    ghost?.remove();
    source.style.opacity = originalOpacity;
    source.draggable = originalDraggable;
    gesture = null;
  };

  const weekBounds = (g) => {
    const rect = g.scroller.getBoundingClientRect();
    const ruler = g.ruler.firstElementChild.getBoundingClientRect();
    return { left: rect.left, right: rect.left + g.scroller.clientWidth, top: rect.top,
      bottom: rect.top + g.scroller.clientHeight, gridLeft: rect.left + ruler.width, gridTop: ruler.bottom };
  };
  const activeWeekPage = scroller => scroller.querySelector('[data-week-page]:not([inert])');

  const insideWeek = (pointer, bounds) => pointer.clientX >= bounds.left && pointer.clientX < bounds.right
    && pointer.clientY >= bounds.top && pointer.clientY < bounds.bottom;

  const updatePreview = (event, bounds = gesture.ruler && weekBounds(gesture)) => {
    const g = gesture;
    let grid, date, columnLeft;
    if (bounds && insideWeek(event, bounds) && event.clientY >= bounds.gridTop) {
      // 按新一周的布局定位，手松开时无需等待表头和任务列的动画结束。
      const page = activeWeekPage(g.scroller);
      const contentLeft = bounds.gridLeft - g.scroller.scrollLeft;
      const x = Math.max(bounds.gridLeft, event.clientX) - contentLeft;
      const column = [...(page?.querySelectorAll('[data-week-header]') || [])]
        .find(el => x >= el.offsetLeft && x < el.offsetLeft + el.offsetWidth);
      date = column?.dataset.weekHeader;
      if (column) columnLeft = Math.max(bounds.gridLeft, contentLeft + column.offsetLeft);
      grid = page?.querySelector('[data-week-grid]');
    } else if (!bounds) {
      const column = g.doc.elementFromPoint(event.clientX, event.clientY)?.closest('[data-date-str]');
      grid = column?.querySelector('[data-week-grid]');
      date = column?.dataset.dateStr;
      columnLeft = column?.getBoundingClientRect().left;
    }
    g.candidate = null;
    const gridBounds = grid?.getBoundingClientRect();
    if (!gridBounds || !date || (bounds && (event.clientY < gridBounds.top || event.clientY >= gridBounds.bottom))) {
      g.ghost.style.opacity = '0.3';
      return;
    }
    const gridTop = gridBounds.top;
    const rawMinutes = settings.startHour * 60 + (event.clientY - gridTop - g.offsetY) / pxPerMin.value;
    const snapMinutes = g.precise || event.metaKey ? 1 : 15;
    const minutes = Math.max(settings.startHour * 60, Math.min(
      settings.endHour * 60 - snapMinutes,
      Math.round(rawMinutes / snapMinutes) * snapMinutes,
    ));
    const startTime = formatClock(Math.floor(minutes / 60), minutes % 60);
    g.candidate = { date, startTime };
    Object.assign(g.ghost.style, {
      top: `${gridTop + (minutes - settings.startHour * 60) * pxPerMin.value}px`,
      left: `${columnLeft + 4}px`,
      opacity: '0.9',
    });
    const label = g.ghost.querySelector('[data-schedule-start]');
    if (label) label.textContent = startTime;
  };

  const updateEdges = (time) => {
    const g = gesture;
    if (!g) return;
    const { scroller, pointer } = g;
    if (!scroller.isConnected || isMobile.value) { cleanup(); return; }
    const elapsed = time - (g.frameTime ?? time);
    g.frameTime = time;
    const bounds = weekBounds(g);
    let direction = 0;
    if (insideWeek(pointer, bounds)) {
      const y = dragEdgePressure(pointer.clientY, bounds.gridTop, bounds.bottom, 56);
      const x = dragEdgePressure(pointer.clientX, bounds.gridLeft, bounds.right, 48);
      if (y) scroller.scrollTop += dragScrollDistance(y, elapsed);
      if (x) {
        const header = activeWeekPage(scroller)?.querySelector('[data-week-scroll-header]');
        const max = Math.max(0, (header?.scrollWidth || 0) + bounds.gridLeft - bounds.left - scroller.clientWidth);
        const canScroll = x < 0 ? scroller.scrollLeft > 0 : scroller.scrollLeft < max - 1;
        if (canScroll) scroller.scrollLeft = Math.min(max, scroller.scrollLeft + dragScrollDistance(x, elapsed));
        else if (pointer.clientY >= bounds.gridTop && Math.abs(x) >= 0.35) direction = Math.sign(x);
      }
    }
    if (g.pageAtEdge(direction, time)) changeDate(direction);
    updatePreview(pointer, bounds);
    g.frame = g.win.requestAnimationFrame(updateEdges);
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
      if (g.ruler) g.frame = g.win.requestAnimationFrame(updateEdges);
    }
    g.pointer = event;
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
    const scroller = weekContainer?.value;
    gesture = {
      scheduleId: task.scheduleId, source, rect, win, doc: getDocument(),
      startX: event.clientX, startY: event.clientY, offsetY: event.clientY - rect.top,
      originalOpacity: source.style.opacity, originalDraggable: source.draggable,
      precise: !!event.metaKey, ghost: null, candidate: null,
      scroller, ruler: scroller?.querySelector('[data-week-ruler]'), pageAtEdge: createDragEdgePaging(),
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
