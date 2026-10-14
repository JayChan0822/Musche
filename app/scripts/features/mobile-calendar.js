import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { createCalendarSpring, CALENDAR_SPRINGS } from '../utils/calendar-spring.js';
import { weekStripGeometry } from '../utils/calendar-week-motion.js';
import { dateFromKey, dateWeek, describeDate, lunarLabel, monthKey, monthWindow, MONTH_NAMES, shiftDate, WEEKDAYS } from '../utils/mobile-calendar-dates.js';
import { formatDate } from '../utils/format.js';
import { parseTime, timeToMinutes, formatClock } from '../utils/time.js';

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const clock = (minutes) => formatClock(Math.floor(minutes / 60), minutes % 60);

// 手机浏览层单独持有几何/手势状态，业务变更只通过 calendarEvents 提交。
export function useMobileCalendar(ctx) {
  const root = ref(null), monthScroller = ref(null), monthContent = ref(null), timeline = ref(null);
  const weekStrip = ref(null), transitionLayer = ref(null), timePanel = ref(null), menuElement = ref(null);
  const mode = ref(ctx.dayViewOpen ? 'multiday' : 'month');
  const lastMode = ref('multiday');
  const anchor = ref(new Date(ctx.viewDate));
  const visibleMonth = ref(monthKey(anchor.value));
  const menuOpen = ref(false);
  const query = ref(''), editor = ref(null), error = ref(''), selectedEvent = ref(null);
  const width = ref(402), hourHeight = ref(47);
  const today = ref(formatDate(new Date()));
  const nowMinutes = ref(new Date().getHours()*60+new Date().getMinutes());
  const draft = ref(null);
  const months = computed(() => monthWindow(anchor.value));
  const selected = computed(() => ctx.selectedDay || today.value);
  const week = computed(() => dateWeek(selected.value));
  const stripDays = computed(() => Array.from({length:21}, (_, i) => ({...describeDate(shiftDate(week.value[0].key,i-7)), weekOffset:Math.floor(i/7)-1})));
  const todayWeekIndex = computed(() => stripDays.value.findIndex(day => day.key===today.value)-7);
  const multi = computed(() => mode.value === 'multiday');
  const dates = computed(() => (multi.value ? [-2, -1, 0, 1, 2, 3] : [-1, 0, 1]).map(offset => ({ ...describeDate(shiftDate(selected.value, offset)), offset })));
  const activeDates = computed(() => multi.value ? [selected.value, shiftDate(selected.value, 1)] : [selected.value]);
  const pageWidth = () => multi.value ? (width.value - 65) / 2 : width.value;
  const preceding = () => multi.value ? 2 : 1;
  const rows = Array.from({ length: 25 }, (_, h) => h);
  const tasks = (key) => ctx.tasksByDateMap[key] || [];
  const allDayHeight = computed(() => {
    const n = Math.max(0, ...activeDates.value.map(key => tasks(key).filter(t => t.allDay).length));
    return n ? Math.min(n, 4) * 23 + 8 : (multi.value ? 22 : 0);
  });
  const monthName = computed(() => MONTH_NAMES[Number(visibleMonth.value.slice(5, 7)) - 1]);
  const selectedMonth = computed(() => MONTH_NAMES[dateFromKey(selected.value).getMonth()]);
  const dayTitle = (key, full = false) => {
    const d = dateFromKey(key);
    return `${full ? d.getFullYear() + '年' : ''}${d.getMonth() + 1}月${d.getDate()}日 – 周${WEEKDAYS[d.getDay()]}`;
  };
  const title = (task) => task.calendarTitle || ctx.getBlockTitle(task);
  const color = (task) => task.isCalendarEvent ? '#007aff' : task.stage === 'edit' ? '#eab308' : '#a855f7';
  const eventStyle = (task) => ({ top: `${timeToMinutes(task.startTime) / 60 * hourHeight.value}px`, height: `${Math.max(23, parseTime(task.estDuration) / 3600 * hourHeight.value)}px`, '--event-color': color(task) });
  const eventRange = (task) => `${task.startTime}–${clock(Math.min(1440, timeToMinutes(task.startTime) + Math.round(parseTime(task.estDuration) / 60)))}`;
  const filteredAgenda = computed(() => {
    const q = query.value.trim().toLowerCase();
    return Object.entries(ctx.tasksByDateMap).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, items]) => ({ key, items: items.filter(t => (!q || `${title(t)} ${t.notes || ''}`.toLowerCase().includes(q))) }))
      .filter(g => g.items.length && (q || g.key >= selected.value)).slice(0, 90);
  });
  let morphRevision = 0;
  let disposed = false, monthMetrics = [], morphGeometry = null, morphNodes = [], monthCopies = [];
  let scrollFrame = 0, observer, minuteTimer, pendingPress = null, ignoreClickUntil = 0;
  let savedScroll = 8 * 47;
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const writePager = (x) => {
    if (!root.value) return;
    root.value.style.setProperty('--mc-page-width', `${pageWidth()}px`);
    root.value.style.setProperty('--mc-page-offset', `${x - preceding() * pageWidth()}px`);
    const dayOffset=-x/pageWidth(), weekday=dateFromKey(selected.value).getDay();
    const geometry=weekStripGeometry(weekday,dayOffset,width.value);
    root.value.style.setProperty('--mc-week-cell', `${geometry.cellWidth}px`);
    root.value.style.setProperty('--mc-week-track', `${geometry.trackOffset}px`);
    root.value.style.setProperty('--mc-week-selection', `${geometry.selectionLeft}px`);
    root.value.style.setProperty('--mc-week-today', `${clamp(1-Math.abs(weekday+dayOffset-todayWeekIndex.value),0,1)*100}%`);
  };
  const pager = createCalendarSpring({ config: CALENDAR_SPRINGS.pager, positionThreshold: .15, velocityThreshold: 1,
    reducedMotion, onUpdate: writePager, onComplete: () => {
      const shift = -Math.round(pager.position / pageWidth());
      if (shift) ctx.selectedDay = shiftDate(selected.value, shift);
      pager.jump(0);
    } });
  const renderMorph = (value) => {
    if (!root.value) return;
    const p = clamp(value, 0, 1);
    root.value.style.setProperty('--mc-depth', p);
    root.value.dataset.depth = p.toFixed(4);
    if (timePanel.value) {
      timePanel.value.style.transform = `translate3d(0, ${(1 - p) * (morphGeometry?.travel || 220)}px, 0)`;
      timePanel.value.style.opacity = clamp(p * 1.7, 0, 1);
    }
    for (const item of morphNodes) {
      const x = item.from.x + (item.to.x - item.from.x) * value;
      const y = item.from.y + (item.to.y - item.from.y) * value;
      item.el.style.transform = `translate3d(${x}px,${y}px,0)`;
      item.el.style.opacity = 1;
    }
    for (const [index, pane] of monthCopies.entries()) {
      pane.style.transform = `translate3d(0, ${value * (index === 0 ? -morphGeometry.upperTravel : morphGeometry.lowerTravel)}px,0)`;
      pane.style.opacity = 1 - p;
    }
  };
  const clearMorph = () => {
    morphRevision += 1;
    transitionLayer.value?.replaceChildren(); morphNodes = []; monthCopies = []; morphGeometry = null;
    root.value?.classList.remove('mc-morphing');
  };
  const navigation = createCalendarSpring({ initial: ctx.dayViewOpen ? 1 : 0, config: CALENDAR_SPRINGS.navigation,
    reducedMotion, onUpdate: renderMorph, onComplete: () => {
      const opened = navigation.target === 1;
      clearMorph();
      if (!opened) { mode.value = 'month'; ctx.dayViewOpen = false; }
      else root.value?.querySelector(`[data-week-date="${selected.value}"]`)?.focus({ preventScroll: true });
    } });
  const menuSpring = createCalendarSpring({ config: CALENDAR_SPRINGS.menu, reducedMotion, onUpdate: p => {
    if (menuElement.value) {
      menuElement.value.style.transform = `translate3d(${(1-p)*35}px,${(1-p)*-8}px,0) scale(${.22 + p * .78})`;
      menuElement.value.style.opacity = clamp(p * 2, 0, 1);
    }
  }, onComplete: () => { if (menuSpring.target === 0) menuOpen.value = false; } });
  async function toggleMenu(force) {
    const open = force ?? menuSpring.target !== 1;
    if (open) { menuOpen.value = true; await nextTick(); }
    menuSpring.animateTo(open ? 1 : 0);
  }
  const measureMonths = () => {
    monthMetrics = [...(monthContent.value?.querySelectorAll('[data-month-section]') || [])].map(el => ({ key: el.dataset.monthSection, top: el.offsetTop, height: el.offsetHeight }));
  };
  async function centerMonth(key, alignDay = false) {
    const d = dateFromKey(key);
    if (!months.value.some(m => m.key === key.slice(0, 7))) { anchor.value = d; await nextTick(); measureMonths(); }
    const section = monthContent.value?.querySelector(`[data-month-section="${key.slice(0, 7)}"]`);
    if (!section || !monthScroller.value) return;
    monthScroller.value.scrollTop = section.offsetTop + (alignDay ? Math.max(0, Math.floor((d.getDate() - 1 + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7) * 70 - 70) : 0);
    visibleMonth.value = key.slice(0, 7);
  }
  const monthScroll = () => {
    if (scrollFrame || mode.value !== 'month') return;
    scrollFrame = requestAnimationFrame(async () => {
      scrollFrame = 0;
      const scroller = monthScroller.value;
      if (!scroller) return;
      const top = scroller.scrollTop;
      const current = monthMetrics.find(m => m.top + m.height > top + 35);
      if (current) visibleMonth.value = current.key;
      // 在接近窗口边界时按现有月份锚点换窗，DOM 数量始终有界。
      if (current && (top < 220 || scroller.scrollHeight - top - scroller.clientHeight < 250)) {
        const offset = top - current.top;
        anchor.value = dateFromKey(`${current.key}-01`);
        await nextTick(); measureMonths();
        const replacement = monthMetrics.find(m => m.key === current.key);
        if (replacement && monthScroller.value) monthScroller.value.scrollTop = replacement.top + offset;
      }
    });
  };
  async function prepareMorph() {
    if (morphGeometry || !root.value || !transitionLayer.value) return;
    const revision = morphRevision;
    const bounds = root.value.getBoundingClientRect();
    const sourceDay = monthContent.value?.querySelector(`[data-month-date="${selected.value}"]`);
    if (sourceDay) {
      const r = sourceDay.getBoundingClientRect();
      if (r.top < bounds.top + 22 || r.bottom > bounds.bottom - 60) await centerMonth(selected.value, true);
    } else await centerMonth(selected.value, true);
    await nextTick();
    if (disposed || revision !== morphRevision || !root.value || !transitionLayer.value || morphGeometry) return;
    const sources = week.value.map(day => monthContent.value?.querySelector(`[data-month-date="${day.key}"] .mc-date-face`));
    const targets = week.value.map(day => weekStrip.value?.querySelector(`[data-week-date="${day.key}"] .mc-date-face`));
    const row = monthContent.value?.querySelector(`[data-month-date="${selected.value}"]`)?.getBoundingClientRect();
    const viewport = monthScroller.value?.getBoundingClientRect();
    const panelTop = timePanel.value?.offsetTop || 114;
    morphGeometry = { travel: Math.max(0, (row?.bottom || bounds.top + 340) - bounds.top - panelTop),
      upperTravel: Math.max(80, (row?.top || bounds.top + 240) - bounds.top - 80), lowerTravel: Math.max(120, bounds.bottom - (row?.bottom || bounds.top + 340)) };
    if (viewport && row) for (let i = 0; i < 2; i++) {
      const pane = document.createElement('div'); pane.className = 'mc-month-copy'; pane.setAttribute('aria-hidden', 'true');
      const clone = monthContent.value.cloneNode(false);
      // Only visible month sections take part in the split transition.
      for (const section of monthContent.value.children) {
        const top=section.offsetTop-monthScroller.value.scrollTop;
        if (top+section.offsetHeight<0 || top>viewport.height) continue;
        const copy=section.cloneNode(true); copy.style.position='absolute';
        copy.style.top=`${section.offsetTop}px`; copy.style.width='100%'; clone.append(copy);
      }
      clone.style.position = 'absolute'; clone.style.top = `${viewport.top - bounds.top - monthScroller.value.scrollTop}px`;
      clone.style.width = `${viewport.width}px`; clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      const upper = i === 0 ? viewport.top - bounds.top : row.bottom - bounds.top;
      const lower = i === 0 ? bounds.bottom - row.top : 0;
      pane.style.clipPath = `inset(${upper}px 0 ${lower}px 0)`;
      pane.append(clone); transitionLayer.value.append(pane); monthCopies.push(pane);
    }
    sources.forEach((source, i) => {
      const target = targets[i]; if (!target) return;
      const to = target.getBoundingClientRect(), from = source?.getBoundingClientRect() || to;
      const el = target.cloneNode(true); if (week.value[i].key===selected.value) el.classList.add('is-selected'); el.classList.add('mc-morph-date'); el.setAttribute('aria-hidden', 'true');
      transitionLayer.value.append(el);
      morphNodes.push({ el, from: { x: from.left-bounds.left, y: from.top-bounds.top }, to: { x: to.left-bounds.left, y: to.top-bounds.top } });
    });
    root.value.classList.add('mc-morphing'); renderMorph(navigation.position);
  }
  async function openDate(key) {
    if (Date.now() < ignoreClickUntil) return;
    const wasMonth = mode.value === 'month';
    ctx.selectedDay = key;
    if (wasMonth) { mode.value = lastMode.value; hourHeight.value = lastMode.value === 'multiday' ? 47 : 50; }
    ctx.dayViewOpen = true;
    await nextTick(); writePager(0);
    if (wasMonth) {
      if (timeline.value) timeline.value.scrollTop = savedScroll;
      await prepareMorph();
    }
    navigation.animateTo(1);
  }
  async function backToMonth() {
    if (navigation.target === 0 && navigation.active) { navigation.animateTo(1); return; }
    savedScroll = timeline.value?.scrollTop ?? savedScroll;
    await prepareMorph(); navigation.animateTo(0);
  }
  const selectDate = (key) => {
    pager.stop(); pager.jump(0); ctx.selectedDay = key;
    if (mode.value === 'month') openDate(key);
  };
  const modeMotions = new Map();
  async function setMode(next) {
    if (mode.value === 'month') { lastMode.value = next; await openDate(selected.value); }
    else if (mode.value !== next) {
      const measured = new Map();
      for (const el of root.value.querySelectorAll('[data-heading-date], [data-page-date]')) {
        const key = (el.dataset.headingDate ? 'heading:' : 'page:') + (el.dataset.headingDate || el.dataset.pageDate);
        const motion = modeMotions.get(key);
        measured.set(key, { rect: el.getBoundingClientRect(), velocity: (motion?.x.velocity || 0) + pager.velocity });
      }
      for (const motion of modeMotions.values()) { motion.x.dispose(); motion.scale.dispose(); }
      modeMotions.clear();
      const minutes = (timeline.value?.scrollTop || savedScroll) / hourHeight.value * 60;
      mode.value = next; lastMode.value = next; pager.jump(0); hourHeight.value = next === 'multiday' ? 47 : 50;
      await nextTick(); if (disposed) return; writePager(0);
      if (timeline.value) timeline.value.scrollTop = minutes / 60 * hourHeight.value;
      for (const el of root.value.querySelectorAll('[data-heading-date], [data-page-date]')) {
        const key = (el.dataset.headingDate ? 'heading:' : 'page:') + (el.dataset.headingDate || el.dataset.pageDate);
        el.style.transform = ''; const before = measured.get(key); if (!before) continue;
        const after = el.getBoundingClientRect(); let x = before.rect.x-after.x, scale = before.rect.width/after.width;
        el.style.transformOrigin = '0 0';
        const paint = () => { el.style.transform = `translate3d(${x}px,0,0) scaleX(${scale})`; };
        const movement = createCalendarSpring({ initial:x, reducedMotion, config:CALENDAR_SPRINGS.navigation,
          positionThreshold:.1, velocityThreshold:1, onUpdate:value=>{x=value;paint();} });
        const sizing = createCalendarSpring({ initial:scale, reducedMotion, config:CALENDAR_SPRINGS.navigation,
          onUpdate:value=>{scale=value;paint();} });
        modeMotions.set(key,{x:movement,scale:sizing}); paint();
        movement.animateTo(0,before.velocity); sizing.animateTo(1);
      }
    }
    toggleMenu(false);
  }
  const jumpToday = async () => {
    today.value = formatDate(new Date());
    if (mode.value === 'month') { ctx.viewDate=new Date(); await centerMonth(today.value); }
    else { selectDate(today.value); savedScroll = Math.max(0, (new Date().getHours() - 2) * hourHeight.value); if (timeline.value) timeline.value.scrollTo({ top: savedScroll, behavior: reducedMotion() ? 'instant' : 'smooth' }); }
  };
  const navigate = dir => { if (mode.value === 'month') { const date=dateFromKey(visibleMonth.value+'-01'); date.setMonth(date.getMonth()+dir); ctx.viewDate=date; } else { pager.stop(); pager.animateTo(-dir*pageWidth()); } };
  watch(() => ctx.viewDate, date => { if (mode.value==='month') centerMonth(formatDate(date)); });

  let gesture = null;
  const cancelPress = () => { if (pendingPress) clearTimeout(pendingPress); pendingPress = null; };
  function pointerDown(event) {
    if (event.button > 0 || event.target.closest('button,input,textarea,.mc-event')) return;
    if (edit) { eventEnd({pointerId:edit.id},true); return; }
    if (gesture) { cancelGesture(); return; }
    if (mode.value === 'month' || mode.value === 'list') return;
    const state = pager.stop();
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, start: state.position, axis: null, samples: [[event.timeStamp, event.clientX]], edge: event.clientX-root.value.getBoundingClientRect().left < 22 };
    if (gesture.edge) navigation.stop();
    const grid = event.target.closest('[data-time-grid]');
    if (grid) {
      const r = grid.getBoundingClientRect(); const key = grid.dataset.timeGrid;
      pendingPress = setTimeout(() => {
        if (!gesture || gesture.axis) return;
        const minutes = clamp(Math.round((event.clientY-r.top)/hourHeight.value*60/15)*15, 0, 1380);
        gesture.axis = 'draft'; ignoreClickUntil = Date.now()+400;
        draft.value = {date:key, minutes};
        timePanel.value?.setPointerCapture?.(gesture.id);
      }, 450);
    }
  }
  function pointerMove(event) {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX-gesture.x, dy = event.clientY-gesture.y;
    if (!gesture.axis && Math.hypot(dx,dy)>7) { gesture.axis = Math.abs(dx)>Math.abs(dy)*1.2 ? 'x' : 'y'; cancelPress(); }
    if (gesture.axis !== 'x') return;
    if (event.cancelable) event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    gesture.samples.push([event.timeStamp,event.clientX]);
    gesture.samples = gesture.samples.filter(sample => event.timeStamp-sample[0] < 90);
    if (gesture.edge) {
      if (!morphGeometry) { prepareMorph(); }
      navigation.jump(clamp(1-dx/width.value,0,1));
    } else pager.jump(clamp(gesture.start+dx,-pageWidth()*1.6,pageWidth()*1.6));
  }
  function pointerUp(event) {
    cancelPress();
    if (!gesture || event.pointerId !== gesture.id) return;
    const g = gesture; gesture = null;
    if (g.axis === 'draft') { const pending=draft.value; draft.value=null; if(pending) openEditor(null,pending.date,pending.minutes); return; }
    if (g.axis !== 'x') { if (pager.position) pager.animateTo(0); return; }
    ignoreClickUntil = Date.now()+250;
    const first = g.samples[0], elapsed = event.timeStamp-first[0];
    const velocity = elapsed > 0 && elapsed < 160 ? (event.clientX-first[1])/elapsed*1000 : 0;
    if (g.edge) { navigation.animateTo(navigation.position < .65 || velocity>450 ? 0 : 1, -velocity/width.value); return; }
    const projected = pager.position + velocity*.16;
    const shift = clamp(Math.round(projected/pageWidth()),-1,1);
    pager.animateTo(shift*pageWidth(), velocity);
  }
  function cancelGesture() { cancelPress(); draft.value=null; if (gesture?.edge) navigation.animateTo(1); else pager.animateTo(0); gesture = null; }

  function openEditor(task = null, key = selected.value, minutes = Math.min(1380, Math.ceil((new Date().getHours()*60+new Date().getMinutes())/15)*15)) {
    selectedEvent.value = task?.scheduleId ?? null;
    const start = task ? timeToMinutes(task.startTime) : minutes;
    editor.value = { original: task, title: task ? title(task) : '', date: task?.date || key, startTime: clock(start), endTime: clock(Math.min(1440,start+(task ? Math.round(parseTime(task.estDuration)/60) : 60))), allDay: !!task?.allDay, notes: task?.notes || '' };
    error.value = '';
    if (!task) nextTick(() => root.value?.querySelector('.mc-event-title-input')?.focus());
  }
  function saveEditor() {
    const result = ctx.calendarEvents.commitCalendarEvent(editor.value.original, editor.value);
    if (!result.ok) { error.value = result.error; return; }
    selectedEvent.value = result.task.scheduleId;
    const key = result.task.date; editor.value = null;
    if (mode.value === 'month') openDate(key); else selectDate(key);
  }
  function deleteEvent() {
    const result = ctx.calendarEvents.deleteCalendarEvent(editor.value.original);
    if (!result.ok) error.value = result.error; else { editor.value = null; selectedEvent.value = null; }
  }
  let edit = null, editFrame = 0;
  function editAutoScroll() {
    if (!edit?.active || !timeline.value) { editFrame=0; return; }
    const bounds=timeline.value.getBoundingClientRect();
    const speed=edit.lastY<bounds.top+45 ? -Math.min(12,(bounds.top+45-edit.lastY)/4) : edit.lastY>bounds.bottom-70 ? Math.min(12,(edit.lastY-bounds.bottom+70)/4) : 0;
    if (speed) {
      timeline.value.scrollTop+=speed;
      eventMove({pointerId:edit.id,clientX:edit.lastX,clientY:edit.lastY,preventDefault() {}});
    }
    editFrame=requestAnimationFrame(editAutoScroll);
  }

  function eventDown(event, task, edge = 'move') {
    if (event.button > 0) return;
    if (edit) { eventEnd({pointerId:edit.id},true); return; }
    cancelGesture(); cancelPress();
    const el = event.target.closest('.mc-event');
    const initialTop = timeToMinutes(task.startTime), initialDuration = Math.round(parseTime(task.estDuration)/60);
    edit = { id: event.pointerId, task, el, edge, x:event.clientX, y:event.clientY, lastX:event.clientX, lastY:event.clientY, start:initialTop, duration:initialDuration,
      top:initialTop, bottom:initialTop+initialDuration, date:task.date, scroll:timeline.value?.scrollTop || 0, active:edge !== 'move', changed:false, origin:null };
    selectedEvent.value = task.scheduleId;
    el.setPointerCapture?.(event.pointerId);
    if (edge === 'move') pendingPress = setTimeout(() => { if (edit) { edit.active = true; el.classList.add('mc-event-editing'); editAutoScroll(); } }, 350);
    else { el.classList.add('mc-event-editing'); editAutoScroll(); }
  }
  function eventMove(event) {
    if (!edit || event.pointerId !== edit.id) return;
    edit.lastX=event.clientX; edit.lastY=event.clientY;
    const dy = event.clientY-edit.y+(timeline.value?.scrollTop || 0)-edit.scroll;
    if (!edit.active) { if (Math.abs(dy)>8) { cancelPress(); if (timeline.value) timeline.value.scrollTop = edit.scroll-(event.clientY-edit.y); } return; }
    event.preventDefault();
    if (!edit.origin) { edit.origin = edit.el.cloneNode(true); edit.origin.classList.add('mc-event-origin'); edit.origin.removeAttribute('id'); edit.origin.setAttribute('aria-hidden','true'); edit.el.parentNode.append(edit.origin); }
    const delta = Math.round(dy/hourHeight.value*60/15)*15;
    if (edit.edge === 'start') edit.top = clamp(edit.start+delta,0,edit.bottom-15);
    else if (edit.edge === 'end') edit.bottom = clamp(edit.start+edit.duration+delta,edit.top+15,1440);
    else { edit.top = clamp(edit.start+delta,0,1440-edit.duration); edit.bottom=edit.top+edit.duration; }
    if (edit.edge === 'move' && multi.value) {
      const dayDelta=clamp(Math.round((event.clientX-edit.x)/pageWidth()),-1,1);
      edit.date=shiftDate(edit.task.date,dayDelta);
      edit.el.style.transform=`translateX(${dayDelta*pageWidth()}px)`;
    }
    edit.changed = edit.top !== edit.start || edit.bottom !== edit.start+edit.duration || edit.date !== edit.task.date;
    edit.el.style.top = `${edit.top/60*hourHeight.value}px`;
    edit.el.style.height = `${Math.max(23,(edit.bottom-edit.top)/60*hourHeight.value)}px`;
    const label = edit.el.querySelector('.mc-event-range'); if (label) label.textContent = `${clock(edit.top)}–${clock(edit.bottom)}`;
  }
  function eventEnd(event, cancelled = false) {
    if (!edit || event.pointerId !== edit.id) return;
    cancelPress(); cancelAnimationFrame(editFrame); editFrame=0; const g=edit; edit=null;
    g.origin?.remove(); g.el.style.transform=''; g.el.classList.remove('mc-event-editing');
    g.el.style.top=`${g.start/60*hourHeight.value}px`; g.el.style.height=`${Math.max(23,g.duration/60*hourHeight.value)}px`;
    const label=g.el.querySelector('.mc-event-range'); if(label) label.textContent=eventRange(g.task);
    if (!cancelled && g.changed) {
      const result=ctx.calendarEvents.commitCalendarEvent(g.task,{title:title(g.task),date:g.date,startTime:clock(g.top),endTime:clock(g.bottom),allDay:false,notes:g.task.notes||''});
      if(!result.ok) error.value=result.error;
    }
    if(g.active) ignoreClickUntil=Date.now()+350;
  }
  function eventClick(task) { if(Date.now()>=ignoreClickUntil) { selectedEvent.value=task.scheduleId; ctx.selectTask(task.scheduleId,'schedule'); } }
  function openTask(task,event) { if(task.isCalendarEvent) openEditor(task); else ctx.handleTaskDblClick(event,task); }
  const sheetMotions = new Map();
  function animateSheet(el, done, entering) {
    let motion = sheetMotions.get(el);
    if (!motion) {
      motion = { done:null, spring:null };
      motion.spring = createCalendarSpring({ initial:entering ? 0 : 1, reducedMotion, config:CALENDAR_SPRINGS.navigation,
        onUpdate:p=>{ el.style.background=`rgba(0,0,0,${clamp(p,0,1)*.3})`; el.querySelector('.mc-editor-sheet').style.transform=`translate3d(0,${(1-p)*100}%,0)`; },
        onComplete:()=>{ const complete=motion.done; motion.done=null; complete?.(); if(motion.spring.target===0) { motion.spring.dispose(); sheetMotions.delete(el); } } });
      sheetMotions.set(el,motion);
    }
    motion.done=done; motion.spring.animateTo(entering?1:0);
  }
  const closeEditor = () => { editor.value=null; error.value=''; };

  watch(() => ctx.dayViewOpen, open => { if (open && mode.value==='month') openDate(selected.value); });
  watch(() => ctx.selectedDay, () => { nextTick(() => writePager(pager.position)); });
  watch(timeline, el => { ctx.dayViewContainer=el; if(el) el.scrollTop=savedScroll; });
  onMounted(async () => {
    await nextTick(); width.value=root.value.clientWidth;
    observer=new ResizeObserver(() => { width.value=root.value?.clientWidth || 402; writePager(pager.position); measureMonths(); if(morphGeometry) { clearMorph(); navigation.jump(mode.value==='month'?0:1); } });
    observer.observe(root.value); measureMonths(); await centerMonth(formatDate(ctx.viewDate));
    writePager(0); renderMorph(navigation.position);
    minuteTimer=setInterval(() => { today.value=formatDate(new Date()); nowMinutes.value=new Date().getHours()*60+new Date().getMinutes(); },60000);
  });
  onBeforeUnmount(() => { disposed=true; cancelAnimationFrame(editFrame); for (const motion of sheetMotions.values()) motion.spring.dispose(); for (const motion of modeMotions.values()) { motion.x.dispose(); motion.scale.dispose(); } ctx.dayViewContainer=null; cancelPress(); navigation.dispose(); pager.dispose(); menuSpring.dispose(); observer?.disconnect(); clearInterval(minuteTimer); cancelAnimationFrame(scrollFrame); clearMorph(); edit?.origin?.remove(); });
  return { root, monthScroller, monthContent, timeline, weekStrip, transitionLayer, timePanel, menuElement,
    mode, selected, selectedEvent, today, nowMinutes, draft, months, visibleMonth, monthName, selectedMonth, week, stripDays, dates, activeDates, multi, rows, hourHeight, allDayHeight,
    menuOpen, query, editor, error, filteredAgenda, MONTH_NAMES, WEEKDAYS,
    tasks, title, color, eventStyle, eventRange, lunarLabel, dayTitle, openDate, backToMonth, selectDate, setMode, jumpToday, navigate, monthScroll, toggleMenu,
    pointerDown, pointerMove, pointerUp, cancelGesture, openEditor, saveEditor, closeEditor, deleteEvent,
    eventDown, eventMove, eventEnd, eventClick, openTask,
    sheetEnter: (el,done)=>animateSheet(el,done,true), sheetLeave:(el,done)=>animateSheet(el,done,false),
    timelineScroll: () => { if (!edit) selectedEvent.value=null; },
    keyNavigate: (event, dir) => { if (event.target.closest('input,textarea') || editor.value || mode.value==='month') return; event.preventDefault(); pager.stop(); pager.animateTo(-dir*pageWidth()); },
    closeError: () => { error.value=''; },
  };
}
