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
    getNow = () => Date.now(),
    getDate = () => new Date(),
    setTimeoutFn = setTimeout,
  } = actions;

  const renderedRange = reactive({
    past: 6,
    future: 18,
  });
  const isLoadingMore = ref(false);
  const dateTransitionName = ref('slide-next');
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
    dateTransitionName.value = dir > 0 ? 'slide-next' : 'slide-prev';

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
          dateObj: date,
        });
      }
    }

    return days;
  });

  const handleInfiniteScroll = (event) => {
    if (currentView.value !== 'month' || monthViewMode.value !== 'scrolled') return;
    if (isLoadingMore.value) return;

    const el = event.target;
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

  const scrollToMonthDate = (targetDate) => {
    const targetDateStr = formatDate(targetDate);

    setTimeout(() => {
      const el = document.querySelector(`[data-date="${targetDateStr}"]`);

      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'center' });
      } else {
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const monthStartId = `${year}-${month}-01`;
        const monthEl = document.querySelector(`[data-month-start="${monthStartId}"]`);

        if (monthEl) {
          monthEl.scrollIntoView({ behavior: 'auto', block: 'center' });
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

    if (currentView.value === 'month' && monthViewMode.value === 'scrolled') {
      scrollToMonthDate(viewDate.value);
    }
  });

  const currentDateLabel = computed(() => {
    if (currentView.value === 'month' && monthViewMode.value === 'scrolled') {
      return `${visibleTopDate.value.getFullYear()}年 ${visibleTopDate.value.getMonth() + 1}月`;
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
      map[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return map;
  });

  const getTasksForDate = (date) => tasksByDateMap.value[date] || [];

  const switchToWeek = (date) => {
    viewDate.value = new Date(date);
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

    if (targetDateObj.getTime() > viewDate.value.getTime()) {
      dateTransitionName.value = 'slide-next';
    } else if (targetDateObj.getTime() < viewDate.value.getTime()) {
      dateTransitionName.value = 'slide-prev';
    }

    currentView.value = 'week';
    viewDate.value = targetDateObj;

    if (flashingTaskId) {
      flashingTaskId.value = targetTask.scheduleId;
      setTimeoutFn(() => {
        if (flashingTaskId.value === targetTask.scheduleId) flashingTaskId.value = null;
      }, 2500);
    }

    setTimeoutFn(() => {
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

      setTimeoutFn(() => {
        if (Math.abs(container.scrollTop - scrollTop) > 10) {
          container.scrollTo({ top: scrollTop, left: scrollLeft, behavior: 'auto' });
        }
      }, 600);
    }, 1000);
  };

  const jumpToToday = () => {
    const now = new Date();

    if (now.getTime() > viewDate.value.getTime()) {
      dateTransitionName.value = 'slide-next';
    } else if (now.getTime() < viewDate.value.getTime()) {
      dateTransitionName.value = 'slide-prev';
    }

    viewDate.value = now;

    if (currentView.value === 'week') {
      setTimeout(() => {
        if (weekContainer.value) {
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
        }
      }, 100);
    }
  };

  return {
    renderedRange,
    isLoadingMore,
    setMonthRef,
    initMonthObserver,
    timeSlots,
    dateTransitionName,
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
  };
}
