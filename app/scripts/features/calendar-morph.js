export function calendarWeekDates(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(day.getDate() + index);
    return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
  });
}

export function monthWeekRect(row, viewport) {
  return {
    top: Math.max(0, row.top - viewport.top),
    right: Math.max(0, viewport.right - row.right),
    bottom: Math.max(0, viewport.bottom - row.bottom),
    left: Math.max(0, row.left - viewport.left),
  };
}

export function revealFrames(rect) {
  const inset = ({ top, right, bottom, left }) => `inset(${top}px ${right}px ${bottom}px ${left}px)`;
  return [{ clipPath: inset(rect) }, { clipPath: inset({ top: 0, right: 0, bottom: 0, left: 0 }) }];
}

function findMonthWeekRect(month, date) {
  const days = calendarWeekDates(date);
  const cells = days.map(day => month.querySelector(`[data-date="${day}"]`)).filter(Boolean);
  if (cells.length !== 7) return null;
  const bounds = cells.map(cell => cell.getBoundingClientRect());
  const viewport = month.getBoundingClientRect();
  const row = {
    top: Math.min(...bounds.map(rect => rect.top)),
    right: Math.max(...bounds.map(rect => rect.right)),
    bottom: Math.max(...bounds.map(rect => rect.bottom)),
    left: Math.min(...bounds.map(rect => rect.left)),
  };
  if (row.bottom <= viewport.top || row.top >= viewport.bottom) return null;
  return monthWeekRect(row, viewport);
}

function findSharedTasks(month, week, root) {
  const monthTasks = new Map([...month.querySelectorAll('[data-calendar-task]')].map(node => [node.dataset.calendarTask, node]));
  return [...week.querySelectorAll('[data-calendar-task]')].flatMap(target => {
    const source = monthTasks.get(target.dataset.calendarTask);
    if (!source) return [];
    const from = source.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    if (from.width <= 0 || from.height <= 0 || to.width <= 0 || to.height <= 0) return [];
    return [{ source, from: { left: from.left - root.left, top: from.top - root.top, width: from.width, height: from.height }, to: { left: to.left - root.left, top: to.top - root.top, width: to.width, height: to.height } }];
  });
}

export function createCalendarMorph({ getDate, prepareMonth = async () => {}, afterRender = async () => {}, getWindow = () => window }) {
  let active = null;
  const reset = panel => {
    panel.classList.remove('calendar-morph-panel', 'calendar-morph-month', 'calendar-morph-week');
    panel.style.clipPath = '';
    panel.style.visibility = '';
    panel.inert = false;
  };
  const cancel = () => active?.finish();

  const beforeEnter = panel => {
    panel.classList.add('calendar-morph-panel');
    panel.classList.add(panel.dataset.calendarView === 'week' ? 'calendar-morph-week' : 'calendar-morph-month');
    panel.style.visibility = 'hidden';
    panel.inert = true;
  };

  const leave = (panel, done) => {
    cancel();
    const job = { from: panel, date: new Date(getDate()), to: null, enterDone: null, animation: null, shared: [] };
    let finished = false;
    job.finish = () => {
      if (finished) return;
      finished = true;
      if (active === job) active = null;
      // Remove the outgoing view before dropping its clip to avoid a one-frame flash.
      done();
      job.animation?.cancel();
      job.shared.forEach(({ node, animation }) => { animation.cancel(); node.remove(); });
      job.sharedOverlay?.remove();
      reset(panel);
      if (job.to) reset(job.to);
      job.enterDone?.();
    };
    active = job;
    panel.classList.add('calendar-morph-panel');
    panel.classList.add(panel.dataset.calendarView === 'week' ? 'calendar-morph-week' : 'calendar-morph-month');
    panel.inert = true;
  };

  const enter = async (panel, done) => {
    const job = active;
    if (!job) { reset(panel); done(); return; }
    job.to = panel;
    job.enterDone = done;
    try {
      await afterRender();
      if (panel.dataset.calendarView === 'month') await prepareMonth();
      if (active !== job) return;
      const month = panel.dataset.calendarView === 'month' ? panel : job.from;
      const rect = findMonthWeekRect(month, job.date);
      const win = getWindow();
      if (!rect || win.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof panel.animate !== 'function') {
        job.finish();
        return;
      }
      const expanding = panel.dataset.calendarView === 'week';
      const week = expanding ? panel : job.from;
      const frames = revealFrames(rect);
      const keyframes = expanding ? frames : frames.toReversed();
      // Both real views remain opaque. Only the week viewport's visible area changes.
      week.style.clipPath = keyframes[0].clipPath;
      panel.style.visibility = '';
      const sharedSource = expanding ? job.from : panel;
      const sharedTarget = expanding ? panel : job.from;
      const root = panel.parentElement.getBoundingClientRect();
      const pairs = findSharedTasks(sharedSource, sharedTarget, root);
      if (pairs.length) {
        const overlay = panel.ownerDocument.createElement('div');
        overlay.className = 'calendar-morph-shared';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.inert = true;
        panel.parentElement.appendChild(overlay);
        job.sharedOverlay = overlay;
        for (const pair of pairs) {
          const node = panel.ownerDocument.createElement('div');
          node.className = 'calendar-morph-item';
          Object.assign(node.style, { left: `${pair.from.left}px`, top: `${pair.from.top}px`, width: `${pair.from.width}px`, height: `${pair.from.height}px` });
          const clone = pair.source.cloneNode(true);
          clone.removeAttribute('data-calendar-task');
          node.appendChild(clone);
          overlay.appendChild(node);
          const animation = node.animate([
            { transform: 'translate3d(0, 0, 0) scale(1, 1)' },
            { transform: `translate3d(${pair.to.left - pair.from.left}px, ${pair.to.top - pair.from.top}px, 0) scale(${pair.to.width / pair.from.width}, ${pair.to.height / pair.from.height})` },
          ], { duration: expanding ? 440 : 400, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' });
          job.shared.push({ node, animation });
        }
      }
      job.animation = week.animate(keyframes, {
        duration: expanding ? 440 : 400,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both',
      });
      job.animation.finished.then(() => {
        if (active === job) job.finish();
      }, () => {
        if (active === job) job.finish();
      });
    } catch {
      if (active === job) job.finish();
    }
  };

  return { beforeEnter, enter, leave, cancel };
}
