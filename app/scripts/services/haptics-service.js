export function createHapticsService({ deviceService, globalTarget = globalThis.window } = {}) {
  if (typeof deviceService?.triggerTouchHaptic !== 'function') {
    throw new TypeError('createHapticsService requires a device service with triggerTouchHaptic');
  }

  const triggerTouchHaptic = (style = 'Light') => deviceService.triggerTouchHaptic(style);

  if (globalTarget) {
    globalTarget.triggerTouchHaptic = triggerTouchHaptic;
  }

  return {
    triggerTouchHaptic,
  };
}
