import { nextTick } from 'vue';

export function registerDurationPickerFeature(context) {
  const { refs, utils, actions } = context;
  const {
    showDurationPicker,
    tempDuration,
    pickerMinRef,
    pickerSecRef,
    pickerPos,
  } = refs;
  const { calculateEstTime } = utils;
  const {
    pushHistory,

    addWindowListener = (type, handler) => window.addEventListener(type, handler),
    removeWindowListener = (type, handler) => window.removeEventListener(type, handler),
    getWindowInnerWidth = () => window.innerWidth,
  } = actions;

  let pickerCallback = null;
  let isDraggingMouse = false;
  let startMouseY = 0;
  let startScrollTop = 0;
  let activeColRef = null;
  let scrollTimeout = null;

  const scrollToValue = (el, val) => {
    if (el) el.scrollTop = val * 44;
  };

  const onDragStart = (e, type) => {
    if (e.button !== 0) return;

    e.preventDefault();
    isDraggingMouse = true;
    startMouseY = e.clientY;
    activeColRef = type === 'm' ? pickerMinRef.value : pickerSecRef.value;
    startScrollTop = activeColRef.scrollTop;

    addWindowListener('mousemove', onDragMove);
    addWindowListener('mouseup', onDragEnd);
  };

  function onDragMove(e) {
    if (!isDraggingMouse) return;
    e.preventDefault();

    const deltaY = e.clientY - startMouseY;
    activeColRef.scrollTop = startScrollTop - deltaY;
  }

  function onDragEnd() {
    if (!isDraggingMouse) return;

    isDraggingMouse = false;
    removeWindowListener('mousemove', onDragMove);
    removeWindowListener('mouseup', onDragEnd);

    activeColRef.dispatchEvent(new Event('scroll'));
  }

  const openDurationPicker = (event, targetObj, key) => {
    const targetEl = event.target;
    const rect = targetEl.getBoundingClientRect();

    const boxWidth = 280;
    const boxHeight = 320;

    let left = rect.left + (rect.width / 2) - (boxWidth / 2);
    left = Math.max(10, Math.min(getWindowInnerWidth() - boxWidth - 10, left));

    let top = rect.top - boxHeight - 15;
    if (top < 10) {
      top = rect.bottom + 15;
    }

    pickerPos.top = top;
    pickerPos.left = left;

    const currentVal = targetObj[key] || '';
    let m = 0;
    let s = 0;
    if (currentVal.includes(':')) {
      const parts = currentVal.split(':');
      m = parseInt(parts[0]) || 0;
      s = parseInt(parts[1]) || 0;
    }
    tempDuration.m = m;
    tempDuration.s = s;
    showDurationPicker.value = true;

    pickerCallback = (isReset = false) => {
      const finalStr = isReset ? '' : `${String(tempDuration.m).padStart(2, '0')}:${String(tempDuration.s).padStart(2, '0')}`;
      targetObj[key] = finalStr;

      if (targetObj.ratio && targetObj.estDuration !== undefined) {
        if (typeof calculateEstTime === 'function') {
          targetObj.estDuration = calculateEstTime(finalStr, targetObj.ratio);
        }
      }
      pushHistory();
    };

    nextTick(() => {
      scrollToValue(pickerMinRef.value, m);
      scrollToValue(pickerSecRef.value, s);
    });
  };

  const closePicker = () => {
    showDurationPicker.value = false;
  };

  const onScroll = (e, type) => {
    clearTimeout(scrollTimeout);
    const el = e.target;
    const newIndex = Math.round(el.scrollTop / 44);
    const oldIndex = type === 'm' ? tempDuration.m : tempDuration.s;

    if (newIndex !== oldIndex) {
      if (type === 'm') tempDuration.m = newIndex;
      if (type === 's') tempDuration.s = newIndex;

    }

    scrollTimeout = setTimeout(() => {}, 100);
  };

  const confirmDurationPicker = () => {
    if (pickerCallback) pickerCallback(false);
    showDurationPicker.value = false;
  };

  const resetDuration = () => {
    if (pickerCallback) pickerCallback(true);
    showDurationPicker.value = false;
  };

  return {
    onDragStart,
    onDragMove,
    onDragEnd,
    openDurationPicker,
    closePicker,
    onScroll,
    confirmDurationPicker,
    resetDuration,
  };
}
