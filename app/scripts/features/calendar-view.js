import { computed, nextTick, reactive, ref, watch } from 'vue';

export function registerCalendarViewFeature(context) {
  const { refs, state, utils, actions } = context;
  const {
    currentView,
    monthViewMode,
    viewDate,
    visibleTopDate,
    monthObserver,
    monthRefs,
    filteredScheduledTasks,
    weekContainer,
    pxPerMin,
    isMobile,
    flashingTaskId,
    mobileTab,
  } = refs;
  const { settings } = state;
  const { formatDate, timeToMinutes } = utils;
  const {
    switchView,
    setViewTransitionName = () => {},
    getNow = () => Date.now(),
    getDate = () => new Date(),
    setTimeoutFn = setTimeout,
    // 手机端已经没有周视图入口（顶部按钮只留桌面端），跳转改成打开当天的日视图
    openMobileDayView = null,
  } = actions;

  const renderedRange = reactive({
    past: 6,
    future: 18,
  });
  const isLoadingMore = ref(false);
  const dateTransitionName = ref('slide-next');
  // 周视图任务格过渡（标尺已固定在外层，只滑任务格，锚定在时间列右侧）
  const weekTransitionName = ref('week-slide-next');
  const monthKeyOf = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  // scrolled 模式的主导月份：可视区域内格子占比最高的月（决定标题 + 灰化）
  const activeMonthKey = ref(monthKeyOf(viewDate.value));
  let activeMonthRaf = null;
  let lastHeaderTap = 0;
  let lastMonthTap = { time: 0, date: null };

  const isToday = (dateStr) => formatDate(getDate()) === dateStr;

  const setMonthRef = (el) => {
    if (el) monthRefs.value.push(el);
  };

  const initMonthObserver = () => {
    if (monthObserver.value) monthObserver.value.disconnect();
    monthRefs.value = [];

    const options = {
      root: document.getElementById('main-content'),
      rootMargin: '0px 0px -90% 0px',
      threshold: 0,
    };

    monthObserver.value = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const dateStr = entry.target.dataset.monthStart;
          if (dateStr) {
            visibleTopDate.value = new Date(dateStr);
          }
        }
      });
    }, options);

    setTimeout(() => {
      monthRefs.value.forEach((el) => {
        monthObserver.value.observe(el);
      });
    }, 100);
  };

  watch(monthViewMode, (newMode) => {
    if (newMode === 'scrolled') {
      visibleTopDate.value = viewDate.value;
      activeMonthKey.value = monthKeyOf(viewDate.value);
      nextTick(() => initMonthObserver());
    } else if (monthObserver.value) {
      monthObserver.value.disconnect();
    }
  });

  const timeSlots = computed(() => {
    const slots = [];
    for (let hour = settings.startHour; hour < settings.endHour; hour++) {
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    return slots;
  });

  const changeDate = (dir) => {
    if (currentView.value === 'week') {
      weekTransitionName.value = dir > 0 ? 'week-slide-next' : 'week-slide-prev';
    } else {
      dateTransitionName.value = dir > 0 ? 'slide-next' : 'slide-prev';
    }

    const nextDate = new Date(viewDate.value);
    if (currentView.value === 'week') {
      nextDate.setDate(nextDate.getDate() + 7 * dir);
    } else {
      nextDate.setDate(1);
      nextDate.setMonth(nextDate.getMonth() + dir);
    }

    viewDate.value = nextDate;
  };

  const currentWeekDays = computed(() => {
    const date = new Date(viewDate.value);
    const day = date.getDay();
    const diff = date.getDate() - day;
    const start = new Date(date.setDate(diff));
    const days = [];

    for (let index = 0; index < 7; index++) {
      const current = new Date(start);
      current.setDate(start.getDate() + index);
      days.push({
        dateStr: formatDate(current),
        weekday: ['日', '一', '二', '三', '四', '五', '六'][current.getDay()],
        dateShort: `${current.getMonth() + 1}/${current.getDate()}`,
      });
    }

    return days;
  });

  const generateMonthGrid = (targetDate) => {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let index = firstDay.getDay(); index > 0; index--) {
      const date = new Date(year, month, 1 - index);
      days.push({
        fullDate: formatDate(date),
        dayNum: date.getDate(),
        isCurrentMonth: false,
        dateObj: date,
      });
    }

    for (let index = 1; index <= lastDay.getDate(); index++) {
      const date = new Date(year, month, index);
      days.push({
        fullDate: formatDate(date),
        dayNum: index,
        isCurrentMonth: true,
        dateObj: date,
      });
    }

    const targetLength = days.length <= 35 ? 35 : 42;
    while (days.length < targetLength) {
      const nextDateNum = days.length - lastDay.getDate() - firstDay.getDay() + 1;
      const date = new Date(year, month + 1, nextDateNum);
      days.push({
        fullDate: formatDate(date),
        dayNum: nextDateNum,
        isCurrentMonth: false,
        dateObj: date,
      });
    }

    return days;
  };

  const currentMonthDays = computed(() => generateMonthGrid(viewDate.value));

  const flatScrolledDays = computed(() => {
    const days = [];
    const bufferMonths = renderedRange.past;
    const totalMonths = renderedRange.past + renderedRange.future;
    const startMonthDate = new Date(
      viewDate.value.getFullYear(),
      viewDate.value.getMonth() - bufferMonths,
      1,
    );

    const firstDayWeekday = startMonthDate.getDay();
    for (let index = firstDayWeekday; index > 0; index--) {
      const date = new Date(startMonthDate);
      date.setDate(date.getDate() - index);
      days.push({
        fullDate: formatDate(date),
        dayNum: date.getDate(),
        isCurrentMonth: false,
        isPadding: true,
        monthKey: monthKeyOf(date),
        dateObj: date,
      });
    }

    for (let monthOffset = 0; monthOffset < totalMonths; monthOffset++) {
      const currentMonth = new Date(
        startMonthDate.getFullYear(),
        startMonthDate.getMonth() + monthOffset,
        1,
      );
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        days.push({
          fullDate: formatDate(dateObj),
          dayNum: day,
          isCurrentMonth: true,
          isFirstDay: day === 1,
          monthKey: monthKeyOf(dateObj),
          dateObj,
        });
      }
    }

    const remaining = days.length % 7;
    if (remaining > 0) {
      const lastDate = days[days.length - 1].dateObj;
      for (let index = 1; index <= 7 - remaining; index++) {
        const date = new Date(lastDate);
        date.setDate(date.getDate() + index);
        days.push({
          fullDate: formatDate(date),
          dayNum: date.getDate(),
          isCurrentMonth: false,
          isPadding: true,
          monthKey: monthKeyOf(date),
          dateObj: date,
        });
      }
    }

    return days;
  });

  // 根据滚动容器可视区域内各月份格子的占比，更新主导月份（标题 + 灰化）
  const updateActiveMonth = (scrollerEl) => {
    if (!scrollerEl || activeMonthRaf) return;

    const run = () => {
      activeMonthRaf = null;
      const viewTop = scrollerEl.scrollTop;
      const viewBottom = viewTop + scrollerEl.clientHeight;
      const counts = new Map();
      const cells = scrollerEl.querySelectorAll('[data-month-key]');
      for (const cell of cells) {
        const top = cell.offsetTop;
        const bottom = top + cell.offsetHeight;
        if (bottom <= viewTop || top >= viewBottom) continue;
        const mk = cell.getAttribute('data-month-key');
        if (mk) counts.set(mk, (counts.get(mk) || 0) + 1);
      }
      let best = null;
      let bestCount = 0;
      for (const [mk, count] of counts) {
        if (count > bestCount) { bestCount = count; best = mk; }
      }
      if (best && best !== activeMonthKey.value) {
        activeMonthKey.value = best;
      }
    };

    if (typeof requestAnimationFrame === 'function') {
      activeMonthRaf = requestAnimationFrame(run);
    } else {
      run();
    }
  };

  const handleInfiniteScroll = (event) => {
    if (currentView.value !== 'month' || monthViewMode.value !== 'scrolled') return;

    const el = event.target;
    updateActiveMonth(el);

    if (isLoadingMore.value) return;

    const threshold = 800;

    if (el.scrollTop < threshold) {
      isLoadingMore.value = true;
      const oldScrollHeight = el.scrollHeight;
      const oldScrollTop = el.scrollTop;

      renderedRange.past += 6;

      nextTick(() => {
        const newScrollHeight = el.scrollHeight;
        el.scrollTop = oldScrollTop + (newScrollHeight - oldScrollHeight);
        isLoadingMore.value = false;
      });
    } else if (el.scrollTop + el.clientHeight > el.scrollHeight - threshold) {
      isLoadingMore.value = true;
      renderedRange.future += 6;

      nextTick(() => {
        isLoadingMore.value = false;
      });
    }
  };

  const scrollToMonthDate = (targetDate, { smooth = false } = {}) => {
    const targetDateStr = formatDate(targetDate);
    const behavior = smooth ? 'smooth' : 'auto';

    setTimeout(() => {
      const el = document.querySelector(`[data-date="${targetDateStr}"]`);

      if (el) {
        // block:'start'：目标月/日贴滚动容器顶部（原 'center' 会把 1 号摆到视口正中）
        el.scrollIntoView({ behavior, block: 'start' });
      } else {
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const monthStartId = `${year}-${month}-01`;
        const monthEl = document.querySelector(`[data-month-start="${monthStartId}"]`);

        if (monthEl) {
          monthEl.scrollIntoView({ behavior, block: 'start' });
        }
      }
    }, 50);
  };

  watch(flatScrolledDays, () => {
    if (monthViewMode.value === 'scrolled') {
      nextTick(() => initMonthObserver());
    }
  });

  watch(viewDate, () => {
    renderedRange.past = 6;
    renderedRange.future = 18;

    // 切月后月份标题立即跟随，不依赖 IntersectionObserver 异步触发
    // （scrollIntoView 是 instant，observer 的顶部 10% 区域可能不覆盖新位置）
    if (currentView.value === 'month' && monthViewMode.value === 'scrolled') {
      // scrolled 模式切月：纵向平滑滚动到目标月（左右箭头语义 = 上下翻页）。
      // 标题/灰化由滚动过程中的占比计算（updateActiveMonth）自然驱动，
      // 不在此预设 activeMonthKey——否则标题会先跳目标月、滚动途中又被
      // 占比计算弹回旧月，造成闪烁。
      scrollToMonthDate(viewDate.value, { smooth: true });
    }
  });

  const currentDateLabel = computed(() => {
    if (currentView.value === 'month' && monthViewMode.value === 'scrolled') {
      const mk = activeMonthKey.value;
      if (mk) {
        const [year, month] = mk.split('-').map(Number);
        return `${year}年 ${month}月`;
      }
    }

    return `${viewDate.value.getFullYear()}年 ${viewDate.value.getMonth() + 1}月`;
  });

  const tasksByDateMap = computed(() => {
    const map = {};

    for (const task of filteredScheduledTasks.value) {
      if (!map[task.date]) {
        map[task.date] = [];
      }
      map[task.date].push(task);
    }

    for (const date in map) {
      // 按分钟数排，历史遗留的没补零时间（"9:00"）也不会被字符串比较排到 "10:00" 后面
      map[date].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    }

    return map;
  });

  const getTasksForDate = (date) => tasksByDateMap.value[date] || [];

  const switchToWeek = (date) => {
    viewDate.value = new Date(date);

    // 手机端没有周视图，落到当天的日视图
    if (isMobile?.value && typeof openMobileDayView === 'function') {
      openMobileDayView(typeof date === 'string' ? date : formatDate(new Date(date)));
      return;
    }

    currentView.value = 'week';
  };

  const handleHeaderDoubleTap = (event) => {
    const now = getNow();

    if (now - lastHeaderTap < 300) {
      event.preventDefault();
      switchView('month');
    }

    lastHeaderTap = now;
  };

  const handleMonthCellDoubleTap = (event, dateStr) => {
    if (event.target.closest('.task-block') || event.target.closest('.text-\\[11px\\]')) {
      return;
    }

    const now = getNow();

    if (now - lastMonthTap.time < 300 && lastMonthTap.date === dateStr) {
      event.preventDefault();
      switchToWeek(dateStr);
    }

    lastMonthTap.time = now;
    lastMonthTap.date = dateStr;
  };

  const smartScrollToTask = (targetTask) => {
    if (!targetTask) return;

    if (isMobile?.value && mobileTab) {
      mobileTab.value = 'schedule';
    }

    const targetDateObj = new Date(targetTask.date.replace(/-/g, '/'));

    // 手机端：直接滑出当天日视图，不再把用户丢进没有返回按钮的周视图
    if (isMobile?.value && typeof openMobileDayView === 'function') {
      viewDate.value = targetDateObj;
      openMobileDayView(targetTask.date);

      if (flashingTaskId) {
        flashingTaskId.value = targetTask.scheduleId;
        setTimeoutFn(() => {
          if (flashingTaskId.value === targetTask.scheduleId) flashingTaskId.value = null;
        }, 2500);
      }
      return;
    }

    // 日期前后关系用 slide 方向动画表达（向后→新内容从右滑入，向前→从左滑入）；
    // 同一天跳转无方向，用无位移的 jump-fade。周视图用独立的 week-* 过渡（标尺固定）。
    const isForward = targetDateObj.getTime() > viewDate.value.getTime();
    const isBackward = targetDateObj.getTime() < viewDate.value.getTime();
    weekTransitionName.value = isForward ? 'week-slide-next' : (isBackward ? 'week-slide-prev' : 'week-fade');

    // month→week 视图切换用无位移淡入：层级变化不抢位移，方向由内层 slide 表达
    if (currentView.value !== 'week') {
      setViewTransitionName('jump-fade');
    }

    currentView.value = 'week';
    viewDate.value = targetDateObj;

    if (flashingTaskId) {
      flashingTaskId.value = targetTask.scheduleId;
      setTimeoutFn(() => {
        if (flashingTaskId.value === targetTask.scheduleId) flashingTaskId.value = null;
      }, 2500);
    }

    // 定位滚动与 slide 动画错开：横向 slide（0.3s）先完整呈现方向感，动画结束后
    // 再纵向 smooth 滚动到任务位置。横向已结束，纵向平滑不会与横向打架。
    // 同天 jump-fade 无位移，渲染落定后立即平滑定位。
    const settleAndScroll = () => {
      const container = weekContainer.value;
      if (!container) return;

      const startMins = timeToMinutes(targetTask.startTime);
      const offsetMins = startMins - settings.startHour * 60;
      const targetTopPixel = offsetMins * pxPerMin.value;
      const scrollTop = Math.max(0, targetTopPixel - 50);

      const dayIndex = targetDateObj.getDay();
      const timeColW = isMobile?.value ? 40 : 70;
      const totalW = container.scrollWidth - timeColW;
      const singleDayW = totalW / 7;
      const targetCenterX = timeColW + dayIndex * singleDayW + singleDayW / 2;
      const scrollLeft = Math.max(0, targetCenterX - container.clientWidth / 2);

      container.scrollTo({
        top: scrollTop,
        left: scrollLeft,
        behavior: 'smooth',
      });
    };

    if (weekTransitionName.value === 'week-fade') {
      nextTick(() => {
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(settleAndScroll);
        } else {
          settleAndScroll();
        }
      });
    } else {
      // slide 动画 0.4s，结束后定位（+50ms 余量）
      setTimeoutFn(settleAndScroll, 450);
    }
  };

  const jumpToToday = () => {
    const now = new Date();

    // 与 smartScrollToTask 一致：日期前后用 slide 方向动画，同日用 jump-fade
    const isForward = now.getTime() > viewDate.value.getTime();
    const isBackward = now.getTime() < viewDate.value.getTime();
    if (currentView.value === 'week') {
      weekTransitionName.value = isForward ? 'week-slide-next' : (isBackward ? 'week-slide-prev' : 'week-fade');
    } else {
      dateTransitionName.value = isForward ? 'slide-next' : (isBackward ? 'slide-prev' : 'jump-fade');
    }

    viewDate.value = now;

    if (currentView.value === 'week') {
      const settleAndScroll = () => {
        if (!weekContainer.value) return;
        const currentMins = now.getHours() * 60 + now.getMinutes();
        const startMins = settings.startHour * 60;
        const targetTop = (currentMins - startMins) * pxPerMin.value;
        const screenHeight = weekContainer.value.clientHeight;
        const scrollTop = Math.max(0, targetTop - screenHeight / 2);

        const dayIndex = now.getDay();
        const timeColWidth = window.innerWidth < 800 ? 40 : 70;
        const dayColWidth = 100;
        const targetCenterX = timeColWidth + dayIndex * dayColWidth + dayColWidth / 2;
        const containerWidth = weekContainer.value.clientWidth;
        const scrollLeft = Math.max(0, targetCenterX - containerWidth / 2);

        weekContainer.value.scrollTo({
          top: scrollTop,
          left: scrollLeft,
          behavior: 'smooth',
        });
      };

      if (weekTransitionName.value === 'week-fade') {
        nextTick(() => {
          if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(settleAndScroll);
          } else {
            settleAndScroll();
          }
        });
      } else {
        // slide 动画 0.4s，结束后定位（+50ms 余量）
        setTimeoutFn(settleAndScroll, 450);
      }
    }
  };

  return {
    renderedRange,
    isLoadingMore,
    setMonthRef,
    initMonthObserver,
    timeSlots,
    dateTransitionName,
    weekTransitionName,
    changeDate,
    currentWeekDays,
    generateMonthGrid,
    currentMonthDays,
    flatScrolledDays,
    handleInfiniteScroll,
    scrollToMonthDate,
    currentDateLabel,
    tasksByDateMap,
    getTasksForDate,
    switchToWeek,
    handleHeaderDoubleTap,
    handleMonthCellDoubleTap,
    smartScrollToTask,
    jumpToToday,
    isToday,
    activeMonthKey,
  };
}
