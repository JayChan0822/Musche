export function registerMobileAutoScrollFeature(context = {}) {
  const { actions = {} } = context;
  const {
    requestAnimationFrameFn = (callback) => requestAnimationFrame(callback),
    cancelAnimationFrameFn = (id) => cancelAnimationFrame(id),
  } = actions;

  let autoScrollFrame = null;
  let lastFrameTime = null;
  const currentScrollSpeed = { x: 0, y: 0 };
  const maxSpeed = 25; // 满速时每个标准帧（16.7ms）滚动的像素数
  const baseFrameMs = 16.7;

  const startAutoScroll = (vx, vy, xContainer, yContainer) => {
    if (autoScrollFrame !== null) return;

    currentScrollSpeed.x = vx;
    currentScrollSpeed.y = vy;
    lastFrameTime = null;

    // 用 rAF 与渲染帧对齐（setInterval 会和 vsync 错位导致滚动抖动），
    // 并按真实帧间隔归一化速度，保证 60Hz / 120Hz 屏幕滚动速度一致。
    const step = (timestamp) => {
      const elapsed = lastFrameTime === null ? baseFrameMs : Math.min(timestamp - lastFrameTime, 64);
      lastFrameTime = timestamp;
      const scale = elapsed / baseFrameMs;

      if (Math.abs(currentScrollSpeed.y) > 0 && yContainer) {
        yContainer.scrollTop += currentScrollSpeed.y * maxSpeed * scale;
      }

      if (Math.abs(currentScrollSpeed.x) > 0 && xContainer) {
        xContainer.scrollLeft += currentScrollSpeed.x * maxSpeed * scale;
      }

      autoScrollFrame = requestAnimationFrameFn(step);
    };

    autoScrollFrame = requestAnimationFrameFn(step);
  };

  const updateAutoScrollDirection = (vx, vy) => {
    currentScrollSpeed.x = vx;
    currentScrollSpeed.y = vy;
  };

  const stopAutoScroll = () => {
    if (autoScrollFrame === null) return;

    cancelAnimationFrameFn(autoScrollFrame);
    autoScrollFrame = null;
    lastFrameTime = null;
    currentScrollSpeed.x = 0;
    currentScrollSpeed.y = 0;
  };

  const isAutoScrollActive = () => autoScrollFrame !== null;

  return {
    startAutoScroll,
    updateAutoScrollDirection,
    stopAutoScroll,
    isAutoScrollActive,
  };
}
