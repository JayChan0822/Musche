import { onBeforeUnmount } from 'vue';
import { createCalendarSpring } from './calendar-spring.js';

// Slightly underdamped: a small overshoot, then a quick settle (~4%).
export const DESKTOP_SPRING = Object.freeze({ stiffness: 380, damping: 27, mass: 1 });
const PAGE_SPRING = Object.freeze({ stiffness: 520, damping: 46, mass: 1 });

export function useDesktopSpringTransition(describe) {
  const motions = new Map();
  const handoffs = new Map();
  const ensure = (element, entering) => {
    if (motions.has(element)) return motions.get(element);
    const spec = describe(element);
    const saved = { transform: element.style.transform, opacity: element.style.opacity, transition: element.style.transition };
    const handoff = entering && spec.key ? handoffs.get(spec.key) : null;
    if (spec.key) handoffs.delete(spec.key);
    let position = handoff?.movement.position ?? (entering ? spec.enter ?? 1 : 0);
    let opacity = handoff?.fade.position ?? (entering ? 0 : 1);
    const paint = () => {
      element.style.transform = spec.transform(position);
      element.style.opacity = String(Math.max(0, Math.min(1, opacity)));
    };
    const reducedMotion = () => element.ownerDocument.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let complete = () => {};
    const movement = createCalendarSpring({ initial: position, config: spec.spring ?? DESKTOP_SPRING,
      positionThreshold: .0005, velocityThreshold: .005, reducedMotion,
      onUpdate: value => { position = value; paint(); }, onComplete: () => complete() });
    const fade = createCalendarSpring({ initial: opacity, config: { stiffness: 500, damping: 45, mass: 1 },
      reducedMotion, onUpdate: value => { opacity = value; paint(); }, onComplete: () => complete() });
    let inherited = handoff;
    const motion = {
      saveHandoff() {
        if (spec.key && Math.abs(movement.position - spec.exit) > .001) {
          handoffs.set(spec.key, { movement: movement.snapshot(), fade: fade.snapshot() });
        }
      },
      run(leaving, done) {
        let remaining = 2;
        complete = () => { if (--remaining === 0) done(); };
        element.style.transition = 'none';
        fade.animateTo(leaving ? 0 : 1, inherited?.fade.velocity ?? fade.velocity);
        if (leaving && spec.relativeExit) {
          // A second gesture can reverse a page that is still entering.
          movement.animateTo(movement.position + describe(element).exit, 0);
        } else {
          movement.animateTo(leaving ? spec.exit : 0, inherited?.movement.velocity ?? movement.velocity);
        }
        inherited = null;
      },
      stop() { complete = () => {}; movement.stop(); fade.stop(); },
      restore() { Object.assign(element.style, saved); },
      dispose() { movement.dispose(); fade.dispose(); },
    };
    element.style.transition = 'none';
    paint(); motions.set(element, motion);
    return motion;
  };
  onBeforeUnmount(() => { for (const motion of motions.values()) motion.dispose(); motions.clear(); handoffs.clear(); });
  return {
    onBeforeEnter: element => { ensure(element, true); },
    onEnter: (element, done) => ensure(element, true).run(false, done),
    onLeave: (element, done) => ensure(element, false).run(true, done),
    onEnterCancelled: element => motions.get(element)?.stop(),
    onLeaveCancelled: element => motions.get(element)?.stop(),
    onAfterEnter: element => motions.get(element)?.restore(),
    onAfterLeave: element => { const motion = motions.get(element); motion?.saveHandoff(); motion?.dispose(); motion?.restore(); motions.delete(element); },
  };
}

export function pageSpringSpec(name = '') {
  const direction = name.includes('fade') ? 0 : name.includes('prev') || name.includes('right') ? -1 : 1;
  return {
    enter: direction, exit: -.2 * direction, relativeExit: true, spring: PAGE_SPRING,
    transform: position => position ? `translate3d(${position * 100}%,0,0)` : 'none',
  };
}
