import { computed, ref, watch } from 'vue';

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

// 手机端日视图（Apple 日历式）：月视图点某天 → 日视图从下往上滑入，
// 顶部保留一行周日期条，下面是当天的小时时间轴（复用周视图的刻度与任务块）。
export function registerMobileDayViewFeature(context) {
  const { refs, state, utils, actions = {} } = context;
  const {
    selectedDay,
    dayViewOpen,
    dayViewContainer,
    viewDate,
    isMobile,
    mobileTab,
    pxPerMin,
  } = refs;
  const { settings } = state;
  const { formatDate } = utils;
  const {
    getTasksForDate = () => [],
    getDate = () => new Date(),
    setTimeoutFn = setTimeout,
    setIntervalFn = setInterval,
    clearIntervalFn = clearInterval,
    requestAnimationFrameFn = (callback) => {
      if (typeof requestAnimationFrame === 'function') return requestAnimationFrame(callback);
      return setTimeoutFn(callback, 16);
    },
  } = actions;

  // 日期在两个方向上切换用不同的滑动动画（左右滑 = 前后一天）
  const dayTransitionName = ref('day-slide-next');
  // 当前时间红线：日视图打开时每分钟刷新一次
  const nowTick = ref(getDate().getTime());
  let nowTimer = null;

  const parseDayStr = (dateStr) => {
    const [year, month, day] = String(dateStr).split('-').map(Number);
    return new Date(year, (month || 1) - 1, day || 1);
  };

  const shiftDay = (dateStr, offset) => {
    const date = parseDayStr(dateStr);
    date.setDate(date.getDate() + offset);
    return formatDate(date);
  };

  const selectedDayTasks = computed(() => (selectedDay.value ? getTasksForDate(selectedDay.value) : []));

  // 选中日期所在周（周日～周六）：日视图顶部那一行周日期
  const selectedDayWeek = computed(() => {
    if (!selectedDay.value) return [];

    const date = parseDayStr(selectedDay.value);
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const todayStr = formatDate(getDate());

    const days = [];
    for (let index = 0; index < 7; index += 1) {
      const current = new Date(start);
      current.setDate(start.getDate() + index);
      const fullDate = formatDate(current);
      days.push({
        fullDate,
        dayNum: current.getDate(),
        weekday: WEEKDAY_LABELS[current.getDay()],
        isToday: fullDate === todayStr,
        hasTasks: getTasksForDate(fullDate).length > 0,
      });
    }

    return days;
  });

  const selectedDayLabel = computed(() => {
    if (!selectedDay.value) return '';
    const date = parseDayStr(selectedDay.value);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 周${WEEKDAY_LABELS[date.getDay()]}`;
  });

  // 返回按钮上的月份（Apple 日历左上角「‹ 八月」）
  const selectedDayMonthLabel = computed(() => {
    if (!selectedDay.value) return '';
    return `${parseDayStr(selectedDay.value).getMonth() + 1}月`;
  });

  const startMinutes = () => settings.startHour * 60;
  const endMinutes = () => settings.endHour * 60;

  // 当前时间红线：只有选中日期是今天才显示，且需落在设置的可视时段内
  const nowIndicator = computed(() => {
    void nowTick.value;
    const now = getDate();
    if (!selectedDay.value || formatDate(now) !== selectedDay.value) return null;

    const minutes = now.getHours() * 60 + now.getMinutes();
    if (minutes < startMinutes() || minutes > endMinutes()) return null;

    return {
      top: (minutes - startMinutes()) * pxPerMin.value,
      label: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    };
  });

  const nowIndicatorStyle = computed(() => (nowIndicator.value ? { top: `${nowIndicator.value.top}px` } : null));

  // 打开时把时间轴滚到「有内容的地方」：今天滚到当前时刻，其他日期滚到第一个任务，
  // 都没有则落在设置的起始时刻。
  const scrollDayViewToFocus = () => {
    const container = dayViewContainer.value;
    if (!container) return;

    let targetMinutes = startMinutes();
    const tasks = selectedDayTasks.value;

    if (tasks.length > 0) {
      const [hours, minutes] = String(tasks[0].startTime).split(':').map(Number);
      targetMinutes = (hours || 0) * 60 + (minutes || 0);
    } else if (nowIndicator.value) {
      const now = getDate();
      targetMinutes = now.getHours() * 60 + now.getMinutes();
    }

    const top = (targetMinutes - startMinutes()) * pxPerMin.value;
    container.scrollTop = Math.max(0, top - 80);
  };

  const openDayView = (dateStr) => {
    if (!dateStr) return;

    selectedDay.value = dateStr;
    dayViewOpen.value = true;
    nowTick.value = getDate().getTime();
    // 等滑入动画的第一帧渲染出时间轴后再定位，否则容器还没高度
    setTimeoutFn(() => requestAnimationFrameFn(scrollDayViewToFocus), 0);
  };

  const closeDayView = () => {
    if (!dayViewOpen.value) return;

    dayViewOpen.value = false;
    // 在日视图里翻到了别的月份：关闭后让底下的月视图跟上
    if (selectedDay.value) {
      const date = parseDayStr(selectedDay.value);
      const current = viewDate.value;
      if (date.getFullYear() !== current.getFullYear() || date.getMonth() !== current.getMonth()) {
        viewDate.value = date;
      }
    }
  };

  const selectDay = (dateStr) => {
    if (!dateStr || dateStr === selectedDay.value) return;

    dayTransitionName.value = dateStr > selectedDay.value ? 'day-slide-next' : 'day-slide-prev';
    selectedDay.value = dateStr;
    setTimeoutFn(() => requestAnimationFrameFn(scrollDayViewToFocus), 0);
  };

  const changeSelectedDay = (dir) => {
    if (!selectedDay.value || !dir) return;
    selectDay(shiftDay(selectedDay.value, dir));
  };

  // —— 手势：横滑翻天、顶部下拉关闭 ——
  const gesture = {
    startX: 0,
    startY: 0,
    startScrollTop: 0,
    tracking: false,
  };

  const dayViewTouchStart = (event) => {
    // 任务块上的手势归拖拽/拉伸处理，日视图不抢
    if (event.target?.closest?.('.task-block')) {
      gesture.tracking = false;
      return;
    }

    const touch = event.touches?.[0];
    if (!touch) return;

    gesture.startX = touch.clientX;
    gesture.startY = touch.clientY;
    gesture.startScrollTop = dayViewContainer.value?.scrollTop ?? 0;
    gesture.tracking = true;
  };

  const dayViewTouchMove = () => {};

  const dayViewTouchEnd = (event) => {
    if (!gesture.tracking) return;
    gesture.tracking = false;

    const touch = event.changedTouches?.[0];
    if (!touch) return;

    const deltaX = touch.clientX - gesture.startX;
    const deltaY = touch.clientY - gesture.startY;

    if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && Math.abs(deltaX) > 50) {
      changeSelectedDay(deltaX < 0 ? 1 : -1);
      return;
    }

    // 只有已经滚到时间轴顶部时，下拉才是「关闭」而不是滚动
    if (deltaY > 80 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5 && gesture.startScrollTop <= 0) {
      closeDayView();
    }
  };

  const stopNowTimer = () => {
    if (nowTimer !== null) {
      clearIntervalFn(nowTimer);
      nowTimer = null;
    }
  };

  watch(dayViewOpen, (open) => {
    if (open) {
      stopNowTimer();
      nowTimer = setIntervalFn(() => {
        nowTick.value = getDate().getTime();
      }, 60000);
    } else {
      stopNowTimer();
    }
  });

  // 切到任务池 / 变成桌面宽度时，日视图不应该继续挂着
  if (mobileTab) {
    watch(mobileTab, (tab) => {
      if (tab !== 'schedule') closeDayView();
    });
  }
  if (isMobile) {
    watch(isMobile, (mobile) => {
      if (!mobile) closeDayView();
    });
  }

  return {
    openDayView,
    closeDayView,
    selectDay,
    changeSelectedDay,
    scrollDayViewToFocus,
    selectedDayWeek,
    selectedDayTasks,
    selectedDayLabel,
    selectedDayMonthLabel,
    dayTransitionName,
    nowIndicator,
    nowIndicatorStyle,
    dayViewTouchStart,
    dayViewTouchMove,
    dayViewTouchEnd,
  };
}
