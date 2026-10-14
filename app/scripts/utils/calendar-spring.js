// Scalar springs use units/second; no DOM or reactive state is owned here.
export const CALENDAR_SPRINGS = Object.freeze({
  navigation: Object.freeze({ stiffness: 300, damping: 34, mass: 1 }),
  pager: Object.freeze({ stiffness: 360, damping: 38, mass: 1 }),
  menu: Object.freeze({ stiffness: 420, damping: 32, mass: 1 }),
});

function configuration(options = {}) {
  const config = { ...CALENDAR_SPRINGS.navigation, ...options };
  for (const key of ['stiffness', 'damping', 'mass']) {
    if (!Number.isFinite(config[key]) || config[key] <= 0) {
      throw new RangeError(`${key} must be a finite positive number`);
    }
  }
  return config;
}

// Exact damped oscillator solution. Advancing by a long background interval is
// stable, and splitting the same interval across 60/120 Hz produces the same state.
export function stepSpring({ position, velocity, target }, deltaSeconds, options = {}) {
  const { stiffness, damping, mass } = configuration(options);
  if (![position, velocity, target, deltaSeconds].every(Number.isFinite) || deltaSeconds < 0) {
    throw new RangeError('Spring state and nonnegative elapsed time must be finite');
  }
  if (deltaSeconds === 0) return { position, velocity, target };
  const decay = damping / (2 * mass);
  const frequencySquared = stiffness / mass;
  const difference = frequencySquared - decay * decay;
  const displacement = position - target;
  let nextDisplacement;
  let nextVelocity;
  if (Math.abs(difference) < 1e-8 * frequencySquared) {
    const coefficient = velocity + decay * displacement;
    const envelope = Math.exp(-decay * deltaSeconds);
    nextDisplacement = envelope * (displacement + coefficient * deltaSeconds);
    nextVelocity = envelope * (velocity - decay * coefficient * deltaSeconds);
  } else if (difference > 0) {
    const frequency = Math.sqrt(difference);
    const phase = frequency * deltaSeconds;
    const coefficient = (velocity + decay * displacement) / frequency;
    const envelope = Math.exp(-decay * deltaSeconds);
    const wave = displacement * Math.cos(phase) + coefficient * Math.sin(phase);
    nextDisplacement = envelope * wave;
    nextVelocity = envelope * (
      -decay * wave - displacement * frequency * Math.sin(phase)
      + coefficient * frequency * Math.cos(phase)
    );
  } else {
    // Separate negative roots avoid exp(-a*t)*cosh(b*t) overflowing on resume.
    const root = Math.sqrt(-difference);
    const slowRoot = -frequencySquared / (decay + root);
    const fastRoot = -decay - root;
    const slowCoefficient = (velocity - fastRoot * displacement) / (slowRoot - fastRoot);
    const fastCoefficient = displacement - slowCoefficient;
    const slow = slowCoefficient * Math.exp(slowRoot * deltaSeconds);
    const fast = fastCoefficient * Math.exp(fastRoot * deltaSeconds);
    nextDisplacement = slow + fast;
    nextVelocity = slowRoot * slow + fastRoot * fast;
  }
  return { position: target + nextDisplacement, velocity: nextVelocity, target };
}

export function createCalendarSpring({
  initial = 0,
  config = CALENDAR_SPRINGS.navigation,
  positionThreshold = 0.001,
  velocityThreshold = 0.01,
  raf = (callback) => requestAnimationFrame(callback),
  cancelRaf = (id) => cancelAnimationFrame(id),
  now = () => performance.now(),
  reducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  onUpdate = () => {},
  onComplete = () => {},
} = {}) {
  const physics = configuration(config);
  if (!Number.isFinite(initial)) throw new RangeError('initial must be finite');
  if (![positionThreshold, velocityThreshold].every((value) => Number.isFinite(value) && value > 0)) {
    throw new RangeError('Spring thresholds must be finite and positive');
  }
  let state = { position: initial, velocity: 0, target: initial };
  let frame = null;
  let active = false;
  let disposed = false;
  let revision = 0;
  let lastTime = 0;
  const snapshot = () => ({ ...state, active });
  const stop = () => {
    revision += 1;
    if (frame !== null) cancelRaf(frame);
    frame = null;
    active = false;
    return snapshot();
  };
  const reduced = () => typeof reducedMotion === 'function' ? reducedMotion() : reducedMotion;
  const finish = (version) => {
    state = { position: state.target, velocity: 0, target: state.target };
    active = false;
    onUpdate(state.position, snapshot());
    if (!disposed && version === revision) onComplete(snapshot());
  };
  const tick = (version) => {
    if (disposed || !active || version !== revision) return;
    frame = null;
    const time = now();
    state = stepSpring(state, Math.max(0, time - lastTime) / 1000, physics);
    lastTime = time;
    if (reduced() || (Math.abs(state.position - state.target) <= positionThreshold
      && Math.abs(state.velocity) <= velocityThreshold)) {
      finish(version);
      return;
    }
    onUpdate(state.position, snapshot());
    if (!disposed && active && revision === version) frame = raf(() => tick(version));
  };
  return {
    get position() { return state.position; },
    get velocity() { return state.velocity; },
    get target() { return state.target; },
    get active() { return active; },
    snapshot,
    animateTo(target, velocity = state.velocity) {
      if (disposed) return snapshot();
      if (![target, velocity].every(Number.isFinite)) throw new RangeError('Target and velocity must be finite');
      stop();
      state = { ...state, target, velocity };
      active = true;
      lastTime = now();
      const version = revision;
      if (reduced() || (state.position === target && velocity === 0)) finish(version);
      else frame = raf(() => tick(version));
      return snapshot();
    },
    // For direct gesture tracking. Optional velocity carries finger momentum into release.
    jump(position, velocity = 0) {
      if (disposed) return snapshot();
      if (![position, velocity].every(Number.isFinite)) throw new RangeError('Position and velocity must be finite');
      stop();
      state = { position, velocity, target: position };
      onUpdate(position, snapshot());
      return snapshot();
    },
    stop,
    dispose() { stop(); disposed = true; },
  };
}
