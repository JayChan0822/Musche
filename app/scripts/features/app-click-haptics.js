export function registerAppClickHapticsFeature(context = {}) {
  const { actions = {} } = context;
  const {
    getAppElement = () => document.getElementById('app'),
    triggerTouchHaptic = () => {},
  } = actions;

  const clickableSelector = 'button, a, [role="button"], .cursor-pointer, .segment-btn';
  const ignoredTags = ['INPUT', 'TEXTAREA'];

  const handleClick = (event) => {
    const target = event.target.closest(clickableSelector);
    if (!target) return;
    if (ignoredTags.includes(target.tagName)) return;
    if (target.hasAttribute('disabled')) return;

    triggerTouchHaptic('Medium');
  };

  const attachClickHaptics = () => {
    const appElement = getAppElement();
    if (!appElement) return;

    appElement.addEventListener('click', handleClick);
  };

  return {
    attachClickHaptics,
  };
}
