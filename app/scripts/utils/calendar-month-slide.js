const activeSlides = new WeakMap();

export function captureScrolledMonth(scroller) {
  const grid = scroller?.querySelector('[data-scrolled-month-grid]');
  const firstCell = grid?.firstElementChild;
  if (!firstCell || !grid.animate || scroller.ownerDocument.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  const viewport = scroller.getBoundingClientRect();
  const rect = grid.getBoundingClientRect();
  const rowHeight = firstCell.offsetHeight;
  if (!rowHeight || !scroller.clientWidth) return null;
  const top = rect.top - viewport.top;
  const firstRow = Math.max(0, Math.floor(-top / rowHeight));
  const lastRow = Math.ceil((scroller.clientHeight - top) / rowHeight);
  const snapshot = grid.cloneNode(false);
  snapshot.removeAttribute('data-scrolled-month-grid');
  snapshot.dataset.monthSlideSnapshot = '';
  const end = Math.min(grid.children.length, lastRow * 7);
  for (let index = firstRow * 7; index < end; index++) {
    const copy = grid.children[index].cloneNode(true);
    for (const attribute of ['data-date', 'data-month-key', 'data-month-start']) copy.removeAttribute(attribute);
    snapshot.append(copy);
  }
  Object.assign(snapshot.style, { position: 'absolute', top: `${top + firstRow * rowHeight}px`, width: `${rect.width}px` });
  return { scroller, snapshot, x: rect.left - viewport.left + scroller.scrollLeft };
}

export function slideScrolledMonth(scroller, top, direction, previous) {
  const grid = scroller.querySelector('[data-scrolled-month-grid]');
  if (!grid || previous?.scroller !== scroller) return false;
  activeSlides.get(scroller)?.();
  const clip = scroller.ownerDocument.createElement('div');
  clip.inert = true;
  clip.setAttribute('aria-hidden', 'true');
  Object.assign(clip.style, { position: 'sticky', top: '0', height: '0', zIndex: '1', pointerEvents: 'none' });
  clip.append(previous.snapshot);
  scroller.prepend(clip);
  scroller.scrollTo({ top, behavior: 'instant' });

  const distance = direction * scroller.clientWidth;
  const translate = x => ({ transform: `translateX(${x}px)` });
  const timing = { duration: 320, easing: 'cubic-bezier(.22, 1, .36, 1)' };
  const outgoing = previous.snapshot.animate([translate(previous.x), translate(previous.x - distance)], timing);
  const incoming = grid.animate([translate(previous.x + distance), translate(0)], timing);
  const cleanup = () => {
    if (activeSlides.get(scroller) !== cleanup) return;
    activeSlides.delete(scroller);
    clip.remove();
    outgoing.cancel();
    incoming.cancel();
  };
  activeSlides.set(scroller, cleanup);
  incoming.onfinish = incoming.oncancel = cleanup;
  return true;
}
