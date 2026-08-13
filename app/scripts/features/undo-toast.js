import { ref } from 'vue';

// 手机端撤销入口：每次产生可撤销的改动后，在 dock 上方浮出一条「已更改 · 撤销」，
// 几秒后自动消失。撤销多数发生在刚操作完的那一刻，所以不占常驻空间也够用；
// 桌面端有常驻按钮，不打扰。
export function registerUndoToastFeature(context = {}) {
  const { refs = {}, actions = {} } = context;
  const { isMobile = { value: false } } = refs;
  const {
    undo = () => {},
    setTimeoutFn = setTimeout,
    clearTimeoutFn = clearTimeout,
    visibleMs = 3200,
  } = actions;

  const undoToastVisible = ref(false);
  let hideTimer = null;

  const clearHideTimer = () => {
    if (hideTimer !== null) {
      clearTimeoutFn(hideTimer);
      hideTimer = null;
    }
  };

  const hideUndoToast = () => {
    clearHideTimer();
    undoToastVisible.value = false;
  };

  // 由 history feature 在「快照真的入栈」之后调用（空改动不会触发）
  const notifyHistoryPushed = () => {
    if (!isMobile.value) return;

    undoToastVisible.value = true;
    clearHideTimer();
    hideTimer = setTimeoutFn(() => {
      hideTimer = null;
      undoToastVisible.value = false;
    }, visibleMs);
  };

  const undoFromToast = () => {
    hideUndoToast();
    undo();
  };

  return {
    undoToastVisible,
    notifyHistoryPushed,
    hideUndoToast,
    undoFromToast,
  };
}
