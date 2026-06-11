export function registerMobileAutoScrollFeature(context = {}) {
  const { actions = {} } = context;
  const {
    setIntervalFn = setInterval,
    clearIntervalFn = clearInterval,
    setTimeoutFn = setTimeout,
  } = actions;

  let autoScrollInterval = null;
  let isScrollingProgrammatically = false;
  const currentScrollSpeed = { x: 0, y: 0 };
  const maxSpeed = 25;

  const startAutoScroll = (vx, vy, xContainer, yContainer) => {
    if (autoScrollInterval) return;

    currentScrollSpeed.x = vx;
    currentScrollSpeed.y = vy;

    autoScrollInterval = setIntervalFn(() => {
      isScrollingProgrammatically = true;

      if (Math.abs(currentScrollSpeed.y) > 0 && yContainer) {
        yContainer.scrollTop += currentScrollSpeed.y * maxSpeed;
      }

      if (Math.abs(currentScrollSpeed.x) > 0 && xContainer) {
        xContainer.scrollLeft += currentScrollSpeed.x * maxSpeed;
      }

      setTimeoutFn(() => {
        isScrollingProgrammatically = false;
      }, 50);
    }, 16);
  };

  const updateAutoScrollDirection = (vx, vy) => {
    currentScrollSpeed.x = vx;
    currentScrollSpeed.y = vy;
  };

  const stopAutoScroll = () => {
    if (!autoScrollInterval) return;

    clearIntervalFn(autoScrollInterval);
    autoScrollInterval = null;
    currentScrollSpeed.x = 0;
    currentScrollSpeed.y = 0;
    isScrollingProgrammatically = false;
  };

  const isAutoScrollActive = () => !!autoScrollInterval;

  return {
    startAutoScroll,
    updateAutoScrollDirection,
    stopAutoScroll,
    isAutoScrollActive,
  };
}
