import { computed, ref, watch } from 'vue';

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

// 手机端日视图：周日期条与共享时间轴，横向分页保留纵向时间位置。
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
  const pagerOffset = ref(0);
  const pagerSettling = ref(false);
  let settleVersion = 0;
  const dayPagerStyle = computed(() => ({
    transform: `translate3d(calc(-100% + ${pagerOffset.value}px), 0, 0)`,
    transition: pagerSettling.value ? 'transform 240ms cubic-bezier(.22, 1, .36, 1)' : 'none',
  }));
  const resetPager = () => {
    settleVersion += 1;
    pagerSettling.value = false;
    pagerOffset.value = 0;
  };
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

  const dayPages = computed(() => selectedDay.value ? [-1, 0, 1].map((offset) => {
    const date = shiftDay(selectedDay.value, offset);
    return { offset, date, tasks: getTasksForDate(date) };
  }) : []);

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

  // 首次打开时先定位第一个任务；无任务的今天定位当前时刻，
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

    resetPager();
    selectedDay.value = dateStr;
    dayViewOpen.value = true;
    nowTick.value = getDate().getTime();
    // 等滑入动画的第一帧渲染出时间轴后再定位，否则容器还没高度
    setTimeoutFn(() => requestAnimationFrameFn(() => {
      if (dayViewOpen.value && selectedDay.value === dateStr) scrollDayViewToFocus();
    }), 0);
  };

  const closeDayView = () => {
    if (!dayViewOpen.value) return;

    resetPager();
    gesture.tracking = false;
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

    resetPager();
    dayTransitionName.value = dateStr > selectedDay.value ? 'day-slide-next' : 'day-slide-prev';
    selectedDay.value = dateStr;
    // 同一个滚动容器贯穿所有日期，切换不改变用户正在查看的小时。
  };

  const changeSelectedDay = (dir) => {
    if (!selectedDay.value || !dir) return;
    selectDay(shiftDay(selectedDay.value, dir));
  };

  // 单指横向手势锁轴；竖向滚动和任务拖拽由各自的处理器负责。
  const gesture = { tracking: false, axis: null, startX: 0, startY: 0, lastX: 0, lastTime: 0, velocity: 0, width: 320 };
  const dayViewTouchCancel = () => {
    gesture.tracking = false;
    resetPager();
  };
  const dayViewTouchStart = (event) => {
    if (event.touches?.length !== 1 || event.target?.closest?.('.task-block') || pagerSettling.value) {
      gesture.tracking = false;
      return;
    }
    const touch = event.touches[0];
    gesture.startX = gesture.lastX = touch.clientX;
    gesture.startY = touch.clientY;
    gesture.lastTime = event.timeStamp || 0;
    gesture.velocity = 0;
    gesture.axis = null;
    gesture.width = dayViewContainer.value?.querySelector?.('.day-pager')?.clientWidth || 320;
    gesture.tracking = true;
  };
  const dayViewTouchMove = (event) => {
    if (event.touches?.length !== 1) { dayViewTouchCancel(); return; }
    if (!gesture.tracking) return;
    const touch = event.touches[0];
    const dx = touch.clientX - gesture.startX;
    const dy = touch.clientY - gesture.startY;
    if (!gesture.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
      gesture.axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'x' : 'y';
    }
    if (gesture.axis !== 'x') return;
    if (event.cancelable) event.preventDefault();
    const elapsed = (event.timeStamp || 0) - gesture.lastTime;
    if (elapsed > 0) gesture.velocity = (touch.clientX - gesture.lastX) / elapsed;
    gesture.lastX = touch.clientX;
    gesture.lastTime = event.timeStamp || 0;
    pagerOffset.value = Math.max(-gesture.width, Math.min(gesture.width, dx));
  };
  const dayViewTouchEnd = (event) => {
    if (!gesture.tracking) return;
    gesture.tracking = false;
    const touch = event.changedTouches?.[0];
    if (!touch) { resetPager(); return; }
    const dx = touch.clientX - gesture.startX;
    const dy = touch.clientY - gesture.startY;
    const horizontal = gesture.axis === 'x' || (!gesture.axis && Math.abs(dx) > Math.abs(dy) * 1.5);
    const recent = (event.timeStamp || 0) - gesture.lastTime < 100;
    const flick = recent && Math.abs(gesture.velocity) > 0.45 && Math.abs(dx) > 16 && Math.sign(dx) === Math.sign(gesture.velocity);
    const commit = horizontal && (Math.abs(dx) > gesture.width * 0.22 || flick);
    const direction = dx < 0 ? 1 : -1;
    pagerSettling.value = true;
    pagerOffset.value = commit ? -direction * gesture.width : 0;
    const version = ++settleVersion;
    setTimeoutFn(() => {
      if (version !== settleVersion) return;
      if (commit && dayViewOpen.value) changeSelectedDay(direction);
      else resetPager();
    }, 240);
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
    dayPages,
    dayPagerStyle,
    dayViewTouchCancel,
    nowIndicator,
    nowIndicatorStyle,
    dayViewTouchStart,
    dayViewTouchMove,
    dayViewTouchEnd,
  };
}
