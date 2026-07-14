export function registerMobileDragGhostFeature(context) {
  const { state, actions = {} } = context;
  const {
    getDocumentBody = () => document.body,
  } = actions;

  const startMobileDrag = (originalEl, touch) => {
    state.dragSourceEl = originalEl;
    state.dragSourceEl.style.opacity = '0.3';

    state.dragElClone = originalEl.cloneNode(true);
    const documentBody = getDocumentBody();

    Object.assign(state.dragElClone.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: `${originalEl.offsetWidth}px`,
      height: `${originalEl.offsetHeight}px`,
      zIndex: '9999',
      opacity: '0.9',
      pointerEvents: 'none',
      transform: `translate3d(${touch.clientX - state.cloneOffsetX}px, ${touch.clientY - state.cloneOffsetY}px, 0)`,
      boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
      transition: 'none',
    });
    state.dragElClone.style.opacity = '0.9';

    documentBody.appendChild(state.dragElClone);
  };

  return {
    startMobileDrag,
  };
}
