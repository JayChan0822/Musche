import { computed, nextTick, reactive, ref, watch } from 'vue';

export function registerCalendarViewFeature({
    refs,
    utils,
    actions,
}) {
    const {
        currentView,
        monthViewMode,
        viewDate,
        visibleTopDate,
        monthObserver,
        monthRefs,
        isMobile,
        dayColWidth,
        dragElClone,
        isResizingMobile,
    } = refs;
    const { formatDate } = utils;
    const {
        triggerTouchHaptic = () => {},
    } = actions;

    let lastHeaderTap = 0;
    const lastMonthTap = { time: 0, date: null };
    let isWheelLocked = false;

    const viewTransitionName = ref('view-slide-left');
    const dateTransitionName = ref('slide-next');
    const isZooming = ref(false);
    const onBeforeLeave = () => {};
    const onAfterLeave = () => {};
    const touchStartX = ref(0);
    const touchStartY = ref(0);
    const isMouseViewDrag = ref(false);
    const mouseStartX = ref(0);
    const mouseStartY = ref(0);
    const renderedRange = reactive({
        past: 6,
        future: 18,
    });
    const isLoadingMore = ref(false);

    const scrollToMonthDate = (targetDate) => {
        const targetDateStr = formatDate(targetDate);

        setTimeout(() => {
            const el = document.querySelector(`[data-date="${targetDateStr}"]`);

            if (el) {
                el.scrollIntoView({ behavior: 'auto', block: 'center' });
                return;
            }

            const y = targetDate.getFullYear();
            const m = String(targetDate.getMonth() + 1).padStart(2, '0');
            const monthStartId = `${y}-${m}-01`;
            const monthEl = document.querySelector(`[data-month-start="${monthStartId}"]`);

            if (monthEl) {
                monthEl.scrollIntoView({ behavior: 'auto', block: 'center' });
            }
        }, 50);
    };

    const switchView = (targetView) => {
        if (targetView === currentView.value) return;

        if (targetView === 'month') {
            viewTransitionName.value = 'zoom-out';
            currentView.value = targetView;

            if (monthViewMode.value === 'scrolled') {
                scrollToMonthDate(viewDate.value);
            }
        } else {
            viewTransitionName.value = 'zoom-in';
            currentView.value = targetView;
        }
        triggerTouchHaptic('Light');
    };

    const switchToWeek = (dateStr) => {
        viewDate.value = new Date(dateStr);
        currentView.value = 'week';
    };

    const handleHeaderDoubleTap = (e) => {
        const now = Date.now();
        if (now - lastHeaderTap < 300) {
            e.preventDefault();
            switchView('month');
        }
        lastHeaderTap = now;
    };

    const handleMonthCellDoubleTap = (e, dateStr) => {
        if (e.target.closest('.task-block') || e.target.closest('.text-\\[11px\\]')) {
            return;
        }

        const now = Date.now();
        if (now - lastMonthTap.time < 300 && lastMonthTap.date === dateStr) {
            e.preventDefault();
            triggerTouchHaptic('Light');
            switchToWeek(dateStr);
        }
        lastMonthTap.time = now;
        lastMonthTap.date = dateStr;
    };

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
            entries.forEach(entry => {
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

    watch(viewDate, () => {
        renderedRange.past = 6;
        renderedRange.future = 18;

        if (currentView.value === 'month' && monthViewMode.value === 'scrolled') {
            scrollToMonthDate(viewDate.value);
        }
    });

    const onMainMouseDown = (e) => {
        if (isMobile.value) return;
        if (e.button !== 0) return;
        if (e.target.closest('.task-block') || e.target.closest('.resize-handle')) return;

        isMouseViewDrag.value = true;
        mouseStartX.value = e.clientX;
        mouseStartY.value = e.clientY;
    };

    const onMainMouseUp = (e) => {
        if (!isMouseViewDrag.value) return;
        isMouseViewDrag.value = false;

        const diffX = e.clientX - mouseStartX.value;
        const diffY = e.clientY - mouseStartY.value;

        if (Math.abs(diffX) > Math.abs(diffY) * 1.5 && Math.abs(diffX) > 50) {
            const dir = diffX < 0 ? 1 : -1;
            changeDate(dir);
        }
    };

    const onMainWheel = (e) => {
        if (isWheelLocked || e.ctrlKey || e.metaKey) return;

        if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 30) {
            e.preventDefault();

            const dir = e.deltaX > 0 ? 1 : -1;
            changeDate(dir);

            isWheelLocked = true;
            setTimeout(() => {
                isWheelLocked = false;
            }, 800);
        }
    };

    const isDragCloneActive = () => {
        return dragElClone && 'value' in dragElClone ? !!dragElClone.value : !!dragElClone;
    };

    const onMainTouchStart = (e) => {
        if (isDragCloneActive() || isResizingMobile.value) return;

        touchStartX.value = e.touches[0].clientX;
        touchStartY.value = e.touches[0].clientY;
    };

    const onMainTouchEnd = (e) => {
        if (isDragCloneActive() || isResizingMobile.value) return;

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = endX - touchStartX.value;
        const diffY = endY - touchStartY.value;

        if (Math.abs(diffX) > Math.abs(diffY) * 1.5 && Math.abs(diffX) > 50) {
            let dir = 0;
            if (diffX < 0) dir = 1;
            if (diffX > 0) dir = -1;

            if (dir !== 0) {
                if (currentView.value === 'week') {
                    if (dayColWidth.value < 60) {
                        changeDate(dir);
                    }
                } else if (currentView.value === 'month') {
                    changeDate(dir);
                }
            }
        }

        touchStartX.value = 0;
        touchStartY.value = 0;
    };

    const changeDate = (dir) => {
        dateTransitionName.value = dir > 0 ? 'slide-next' : 'slide-prev';

        const d = new Date(viewDate.value);

        if (currentView.value === 'week') {
            d.setDate(d.getDate() + 7 * dir);
        } else {
            d.setDate(1);
            d.setMonth(d.getMonth() + dir);
        }

        viewDate.value = d;
        triggerTouchHaptic('Light');
    };

    const currentWeekDays = computed(() => {
        const d = new Date(viewDate.value);
        const day = d.getDay();
        const diff = d.getDate() - day;
        const s = new Date(d.setDate(diff));
        const r = [];
        for (let i = 0; i < 7; i++) {
            const c = new Date(s);
            c.setDate(s.getDate() + i);
            r.push({
                dateStr: formatDate(c),
                weekday: ['日', '一', '二', '三', '四', '五', '六'][c.getDay()],
                dateShort: `${c.getMonth() + 1}/${c.getDate()}`,
            });
        }
        return r;
    });

    const generateMonthGrid = (targetDate) => {
        const y = targetDate.getFullYear();
        const m = targetDate.getMonth();
        const f = new Date(y, m, 1);
        const l = new Date(y, m + 1, 0);
        const r = [];

        for (let i = f.getDay(); i > 0; i--) {
            const d = new Date(y, m, 1 - i);
            r.push({
                fullDate: formatDate(d),
                dayNum: d.getDate(),
                isCurrentMonth: false,
                dateObj: d,
            });
        }

        for (let i = 1; i <= l.getDate(); i++) {
            const d = new Date(y, m, i);
            r.push({
                fullDate: formatDate(d),
                dayNum: i,
                isCurrentMonth: true,
                dateObj: d,
            });
        }

        const targetLen = r.length <= 35 ? 35 : 42;
        while (r.length < targetLen) {
            const nextDateNum = r.length - l.getDate() - f.getDay() + 1;
            const d = new Date(y, m + 1, nextDateNum);
            r.push({
                fullDate: formatDate(d),
                dayNum: nextDateNum,
                isCurrentMonth: false,
                dateObj: d,
            });
        }
        return r;
    };

    const currentMonthDays = computed(() => generateMonthGrid(viewDate.value));

    const flatScrolledDays = computed(() => {
        const list = [];
        const bufferMonths = renderedRange.past;
        const totalMonths = renderedRange.past + renderedRange.future;
        const startMonthDate = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - bufferMonths, 1);

        const firstDayWeekday = startMonthDate.getDay();
        for (let i = firstDayWeekday; i > 0; i--) {
            const d = new Date(startMonthDate);
            d.setDate(d.getDate() - i);
            list.push({
                fullDate: formatDate(d),
                dayNum: d.getDate(),
                isCurrentMonth: false,
                isPadding: true,
                dateObj: d,
            });
        }

        for (let i = 0; i < totalMonths; i++) {
            const currentM = new Date(startMonthDate.getFullYear(), startMonthDate.getMonth() + i, 1);
            const year = currentM.getFullYear();
            const month = currentM.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let d = 1; d <= daysInMonth; d++) {
                const dateObj = new Date(year, month, d);
                list.push({
                    fullDate: formatDate(dateObj),
                    dayNum: d,
                    isCurrentMonth: true,
                    isFirstDay: d === 1,
                    dateObj,
                });
            }
        }

        const remaining = list.length % 7;
        if (remaining > 0) {
            const lastDate = list[list.length - 1].dateObj;
            for (let i = 1; i <= (7 - remaining); i++) {
                const d = new Date(lastDate);
                d.setDate(d.getDate() + i);
                list.push({
                    fullDate: formatDate(d),
                    dayNum: d.getDate(),
                    isCurrentMonth: false,
                    isPadding: true,
                    dateObj: d,
                });
            }
        }

        return list;
    });

    const handleInfiniteScroll = (e) => {
        if (currentView.value !== 'month' || monthViewMode.value !== 'scrolled') return;
        if (isLoadingMore.value) return;

        const el = e.target;
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

    watch(flatScrolledDays, () => {
        if (monthViewMode.value === 'scrolled') {
            nextTick(() => initMonthObserver());
        }
    });

    const currentDateLabel = computed(() => {
        if (currentView.value === 'month' && monthViewMode.value === 'scrolled') {
            return `${visibleTopDate.value.getFullYear()}年 ${visibleTopDate.value.getMonth() + 1}月`;
        }

        return `${viewDate.value.getFullYear()}年 ${viewDate.value.getMonth() + 1}月`;
    });

    const initializeCalendarView = () => {
        if (currentView.value === 'month' && monthViewMode.value === 'scrolled') {
            nextTick(() => {
                scrollToMonthDate(viewDate.value);
            });
        }
    };

    const cleanupCalendarView = () => {
        if (monthObserver.value) {
            monthObserver.value.disconnect();
        }
    };

    return {
        viewTransitionName,
        dateTransitionName,
        isZooming,
        onBeforeLeave,
        onAfterLeave,
        isMouseViewDrag,
        onMainMouseDown,
        onMainMouseUp,
        onMainWheel,
        onMainTouchStart,
        onMainTouchEnd,
        switchView,
        changeDate,
        currentWeekDays,
        currentMonthDays,
        currentDateLabel,
        flatScrolledDays,
        generateMonthGrid,
        setMonthRef,
        scrollToMonthDate,
        handleInfiniteScroll,
        handleHeaderDoubleTap,
        handleMonthCellDoubleTap,
        switchToWeek,
        initializeCalendarView,
        cleanupCalendarView,
    };
}
