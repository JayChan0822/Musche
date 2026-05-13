import { ref } from 'vue';

export function registerDragDropFeature({
    refs,
    state,
    utils,
    actions,
}) {
    const {
        isMobile,
        trackListData,
        trackListContainerRef,
        isDark,
        weekContainer,
        currentView,
        mobileTab,
        lastTapState,
        pxPerMin,
        sidebarTab,
        currentSessionId,
        scheduledTasks,
        isResizingMobile,
        mobileResizeState,
    } = refs;
    const { settings } = state;
    const { formatSecs, timeToMinutes, parseTime } = utils;
    const {
        getDividerDragState = () => null,
        pushHistory,
        triggerTouchHaptic = () => {},
        changeDate,
        isTaskGhost,
        jumpToGhostContext,
        handleTaskDblClick,
        selectTask,
        checkOverlap,
        openAlertModal,
    } = actions;

    const dragElClone = ref(null);
    const dragSourceType = ref('schedule');
    let dragSourceTask = null;
    let longPressTimeout = null;
    let startX = 0;
    let startY = 0;
    let cloneOffsetX = 0;
    let cloneOffsetY = 0;
    let activeDropSlot = null;
    let dragSourceEl = null;
    let dragClickOffsetY = 0;
    let autoScrollInterval = null;
    let monthSwitchTimer = null;
    let trackListScrollTimer = null;
    let resizeRaf = null;
    let trackDragTimer = null;
    let trackDragState = null;
    let isScrollingProgrammatically = false;
    const currentScrollSpeed = { x: 0, y: 0 };

    const stopTrackListAutoScroll = () => {
        if (trackListScrollTimer) {
            cancelAnimationFrame(trackListScrollTimer);
            trackListScrollTimer = null;
        }
    };

    const handleTrackListAutoScroll = (clientY) => {
        const container = trackListContainerRef.value;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const edgeSize = 60;
        const maxSpeed = 15;

        stopTrackListAutoScroll();

        let scrollSpeed = 0;
        if (clientY < rect.top + edgeSize && clientY > rect.top - 50) {
            const intensity = Math.max(0, (rect.top + edgeSize - clientY) / edgeSize);
            scrollSpeed = -maxSpeed * intensity;
        } else if (clientY > rect.bottom - edgeSize && clientY < rect.bottom + 50) {
            const intensity = Math.max(0, (clientY - (rect.bottom - edgeSize)) / edgeSize);
            scrollSpeed = maxSpeed * intensity;
        }

        if (scrollSpeed !== 0) {
            trackListScrollTimer = requestAnimationFrame(function scrollLoop() {
                if (scrollSpeed !== 0 && container) {
                    container.scrollTop += scrollSpeed;
                    trackListScrollTimer = requestAnimationFrame(scrollLoop);
                }
            });
        }
    };

    const startTrackDrag = (e, item) => {
        if (e.target.closest('input, button, select, i.fa-trash-can, i.fa-scissors, i.fa-eraser, .cursor-pointer')) {
            return;
        }

        if (trackDragState || getDividerDragState()) return;

        const isTouch = e.type === 'touchstart';
        const triggerEl = e.currentTarget;
        const touch = isTouch ? e.touches[0] : e;

        const executeDrag = () => {
            triggerEl.style.setProperty('opacity', '0', 'important');

            const rect = triggerEl.getBoundingClientRect();
            const container = trackListContainerRef.value;
            const initialScrollTop = container ? container.scrollTop : 0;
            const allMovableEls = Array.from(container.querySelectorAll('.track-card, .group\\/divider'));
            const domStartIndex = allMovableEls.indexOf(triggerEl);
            if (domStartIndex === -1) return;

            const dataStartIndex = trackListData.value.items.findIndex(i => i.id === item.id);
            const elementHeights = allMovableEls.map(el => {
                const style = window.getComputedStyle(el);
                return el.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
            });

            const ghost = triggerEl.cloneNode(true);
            ghost.style.opacity = '1';
            ghost.classList.remove('hover:border-white/10', 'group');
            Object.assign(ghost.style, {
                position: 'fixed',
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                zIndex: '10000',
                backgroundColor: isDark.value ? '#2c2c2e' : '#F4F4F5',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                transform: 'scale(1.02)',
                transition: 'none',
                pointerEvents: 'none',
                borderRadius: '8px',
            });
            document.body.appendChild(ghost);

            trackDragState = {
                item,
                targetEl: triggerEl,
                ghost,
                allMovableEls,
                elementHeights,
                itemHeight: elementHeights[domStartIndex],
                fingerOffset: touch.clientY - rect.top,
                lastClientY: touch.clientY,
                lastScrollTop: initialScrollTop,
                cumulativeDelta: 0,
                domStartIndex,
                virtualDomIndex: domStartIndex,
                dataStartIndex,
                virtualDataIndex: dataStartIndex,
            };

            triggerTouchHaptic('Medium');
        };

        if (isTouch) {
            trackDragTimer = setTimeout(() => executeDrag(), 300);
            trackDragState = { preStartX: touch.clientX, preStartY: touch.clientY };
            window.addEventListener('touchmove', onTrackDragMove, { passive: false });
            window.addEventListener('touchend', onTrackDragEnd);
            window.addEventListener('touchcancel', onTrackDragEnd);
        } else {
            e.preventDefault();
            executeDrag();
            window.addEventListener('mousemove', onTrackDragMove);
            window.addEventListener('mouseup', onTrackDragEnd);
        }
    };

    const onTrackDragMove = (e) => {
        if (!trackDragState || !trackDragState.ghost) {
            if (trackDragTimer && e.type === 'touchmove') {
                const touch = e.touches[0];
                const moveY = Math.abs(touch.clientY - trackDragState.preStartY);
                if (moveY > 10) {
                    clearTimeout(trackDragTimer);
                    trackDragTimer = null;
                    trackDragState = null;
                }
            }
            return;
        }

        if (e.cancelable) e.preventDefault();

        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        const { ghost, fingerOffset, lastClientY, lastScrollTop, itemHeight, elementHeights, allMovableEls } = trackDragState;

        ghost.style.top = `${clientY - fingerOffset}px`;

        const container = trackListContainerRef.value;
        const currentScrollTop = container ? container.scrollTop : 0;
        const dy = clientY - lastClientY;
        const dScroll = currentScrollTop - lastScrollTop;

        trackDragState.lastClientY = clientY;
        trackDragState.lastScrollTop = currentScrollTop;
        trackDragState.cumulativeDelta += (dy + dScroll);

        let indexChanged = false;

        while (trackDragState.cumulativeDelta > 0) {
            if (trackDragState.virtualDomIndex >= elementHeights.length - 1) break;

            const nextDomIndex = trackDragState.virtualDomIndex + 1;
            const threshold = elementHeights[nextDomIndex] / 2 + itemHeight / 2;

            if (trackDragState.cumulativeDelta > threshold) {
                trackDragState.cumulativeDelta -= elementHeights[nextDomIndex];
                trackDragState.virtualDomIndex++;

                if (allMovableEls[nextDomIndex].classList.contains('track-card')) {
                    trackDragState.virtualDataIndex++;
                }

                indexChanged = true;
            } else break;
        }

        while (trackDragState.cumulativeDelta < 0) {
            if (trackDragState.virtualDomIndex <= 0) break;

            const prevDomIndex = trackDragState.virtualDomIndex - 1;
            const threshold = elementHeights[prevDomIndex] / 2 + itemHeight / 2;

            if (trackDragState.cumulativeDelta < -threshold) {
                trackDragState.cumulativeDelta += elementHeights[prevDomIndex];
                trackDragState.virtualDomIndex--;

                if (allMovableEls[prevDomIndex].classList.contains('track-card')) {
                    trackDragState.virtualDataIndex--;
                }

                indexChanged = true;
            } else break;
        }

        if (indexChanged || true) {
            if (indexChanged) triggerTouchHaptic('Light');

            const vDomIdx = trackDragState.virtualDomIndex;
            const domStartIdx = trackDragState.domStartIndex;

            trackDragState.allMovableEls.forEach((el, i) => {
                if (i === domStartIdx) return;

                let translateY = 0;
                if (domStartIdx < vDomIdx) {
                    if (i > domStartIdx && i <= vDomIdx) translateY = -itemHeight;
                } else if (domStartIdx > vDomIdx) {
                    if (i >= vDomIdx && i < domStartIdx) translateY = itemHeight;
                }

                el.style.transform = translateY !== 0 ? `translate3d(0, ${translateY}px, 0)` : '';
                el.style.transition = 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)';
            });
        }

        handleTrackListAutoScroll(clientY);
    };

    const removeTrackDragListeners = () => {
        window.removeEventListener('touchmove', onTrackDragMove);
        window.removeEventListener('touchend', onTrackDragEnd);
        window.removeEventListener('touchcancel', onTrackDragEnd);
        window.removeEventListener('mousemove', onTrackDragMove);
        window.removeEventListener('mouseup', onTrackDragEnd);
    };

    const onTrackDragEnd = () => {
        if (trackDragTimer) {
            clearTimeout(trackDragTimer);
            trackDragTimer = null;
        }

        if (!trackDragState || !trackDragState.ghost) {
            trackDragState = null;
            removeTrackDragListeners();
            return;
        }

        const { targetEl, ghost, allMovableEls, dataStartIndex, virtualDataIndex, domStartIndex, virtualDomIndex, item } = trackDragState;

        if (targetEl) targetEl.style.opacity = '';
        if (ghost && document.body.contains(ghost)) document.body.removeChild(ghost);

        allMovableEls.forEach(el => {
            el.style.transform = '';
            el.style.transition = '';
        });
        stopTrackListAutoScroll();

        if (domStartIndex !== virtualDomIndex || dataStartIndex !== virtualDataIndex) {
            const items = trackListData.value.items;

            if (dataStartIndex !== virtualDataIndex) {
                items.splice(dataStartIndex, 1);
                items.splice(virtualDataIndex, 0, item);
            }

            const tempDomArray = [...allMovableEls];
            const movedEl = tempDomArray.splice(domStartIndex, 1)[0];
            tempDomArray.splice(virtualDomIndex, 0, movedEl);

            const prevEl = tempDomArray[virtualDomIndex - 1];

            if (prevEl && prevEl.id && prevEl.id.startsWith('sec-divider-')) {
                item.sectionIndex = parseInt(prevEl.id.replace('sec-divider-', ''));
            } else if (items.length > 1) {
                let newSectionIndex = 0;

                if (virtualDataIndex === 0) {
                    newSectionIndex = items[1].sectionIndex;
                } else {
                    newSectionIndex = items[virtualDataIndex - 1].sectionIndex;
                }
                item.sectionIndex = newSectionIndex;
            }

            pushHistory();
            triggerTouchHaptic('Success');
        }

        trackDragState = null;
        removeTrackDragListeners();
    };

    const startMobileDrag = (originalEl, touch) => {
        dragSourceEl = originalEl;
        dragSourceEl.style.opacity = '0.3';

        triggerTouchHaptic('Medium');

        dragElClone.value = originalEl.cloneNode(true);

        Object.assign(dragElClone.value.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: `${originalEl.offsetWidth}px`,
            height: `${originalEl.offsetHeight}px`,
            zIndex: '9999',
            opacity: '0.9',
            pointerEvents: 'none',
            transform: `translate3d(${touch.clientX - cloneOffsetX}px, ${touch.clientY - cloneOffsetY}px, 0)`,
            boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
            transition: 'none',
        });
        dragElClone.value.style.opacity = '0.9';

        document.body.appendChild(dragElClone.value);
    };

    const handleTouchStart = (e, task) => {
        if (!isMobile.value) return;

        dragSourceType.value = 'schedule';

        const touch = e.touches[0];
        const targetEl = e.currentTarget;

        startX = touch.clientX;
        startY = touch.clientY;
        dragSourceTask = task;

        const rect = targetEl.getBoundingClientRect();
        cloneOffsetX = touch.clientX - rect.left;
        cloneOffsetY = touch.clientY - rect.top;
        dragClickOffsetY = touch.clientY - rect.top;

        longPressTimeout = setTimeout(() => {
            if (!isTaskGhost(task)) {
                startMobileDrag(targetEl, touch);
            }
        }, 300);
    };

    const handlePoolTouchStart = (e, item, type = 'pool') => {
        if (!isMobile.value) return;
        if (type === 'pool') return;

        if (
            type === 'aggregate' &&
            (item.statusKey === 'completed' || item.statusKey === 'full' || item.statusKey === 'in-progress')
        ) {
            return;
        }

        dragSourceType.value = type;

        const touch = e.touches[0];
        const targetEl = e.currentTarget;

        startX = touch.clientX;
        startY = touch.clientY;
        dragSourceTask = item;

        const rect = targetEl.getBoundingClientRect();
        cloneOffsetX = touch.clientX - rect.left;
        cloneOffsetY = touch.clientY - rect.top;
        dragClickOffsetY = touch.clientY - rect.top;

        longPressTimeout = setTimeout(() => {
            startMobileDrag(targetEl, touch);

            mobileTab.value = 'schedule';
            triggerTouchHaptic('Heavy');
        }, 300);
    };

    const startAutoScroll = (vx, vy, xContainer, yContainer) => {
        if (autoScrollInterval) return;

        currentScrollSpeed.x = vx;
        currentScrollSpeed.y = vy;

        const maxSpeed = 25;

        autoScrollInterval = setInterval(() => {
            isScrollingProgrammatically = true;

            if (Math.abs(currentScrollSpeed.y) > 0 && yContainer) {
                yContainer.scrollTop += currentScrollSpeed.y * maxSpeed;
            }

            if (Math.abs(currentScrollSpeed.x) > 0 && xContainer) {
                xContainer.scrollLeft += currentScrollSpeed.x * maxSpeed;
            }

            setTimeout(() => {
                isScrollingProgrammatically = false;
            }, 50);
        }, 16);
    };

    const updateAutoScrollDirection = (vx, vy) => {
        currentScrollSpeed.x = vx;
        currentScrollSpeed.y = vy;
    };

    const stopAutoScroll = () => {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
            currentScrollSpeed.x = 0;
            currentScrollSpeed.y = 0;
            isScrollingProgrammatically = false;
        }
    };

    const clearMonthSwitchTimer = () => {
        if (monthSwitchTimer) {
            clearTimeout(monthSwitchTimer);
            monthSwitchTimer = null;
        }
    };

    const handleTouchMove = (e) => {
        const touch = e.touches[0];

        if (longPressTimeout && !dragElClone.value) {
            const deltaX = Math.abs(touch.clientX - startX);
            const deltaY = Math.abs(touch.clientY - startY);

            if (deltaX > 10 || deltaY > 10) {
                clearTimeout(longPressTimeout);
                longPressTimeout = null;
            }
            return;
        }

        if (dragElClone.value) {
            if (e.cancelable) e.preventDefault();

            const x = touch.clientX - cloneOffsetX;
            const y = touch.clientY - cloneOffsetY;
            dragElClone.value.style.transform = `translate3d(${x}px, ${y}px, 0)`;

            const scrollContainer = weekContainer.value;

            if (currentView.value === 'week' && scrollContainer) {
                let vx = 0;
                let vy = 0;
                if (isMobile.value) {
                    const topZone = 500;
                    const bottomZone = window.innerHeight - 150;
                    const leftZone = 60;
                    const rightZone = window.innerWidth - 60;
                    const ramp = 80;

                    if (touch.clientY < topZone) vy = -Math.min(1, (topZone - touch.clientY) / ramp);
                    else if (touch.clientY > bottomZone) vy = Math.min(1, (touch.clientY - bottomZone) / ramp);

                    if (touch.clientX < leftZone) vx = -Math.min(1, (leftZone - touch.clientX) / ramp);
                    else if (touch.clientX > rightZone) vx = Math.min(1, (touch.clientX - rightZone) / ramp);
                }

                if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) {
                    if (!autoScrollInterval) startAutoScroll(vx, vy, scrollContainer, scrollContainer);
                    else updateAutoScrollDirection(vx, vy);
                } else {
                    stopAutoScroll();
                }

                const edgeThreshold = 50;
                let switchDir = 0;

                if (touch.clientX < edgeThreshold) {
                    switchDir = -1;
                } else if (touch.clientX > window.innerWidth - edgeThreshold) {
                    switchDir = 1;
                }

                if (switchDir !== 0) {
                    if (!monthSwitchTimer) {
                        monthSwitchTimer = setTimeout(() => {
                            changeDate(switchDir);
                            triggerTouchHaptic('Medium');
                            monthSwitchTimer = null;
                        }, 800);
                    }
                } else {
                    clearMonthSwitchTimer();
                }
            } else if (currentView.value === 'month' && isMobile.value) {
                const edgeThreshold = 50;
                let switchDir = 0;
                if (touch.clientX < edgeThreshold) switchDir = -1;
                else if (touch.clientX > window.innerWidth - edgeThreshold) switchDir = 1;

                if (switchDir !== 0) {
                    if (!monthSwitchTimer) {
                        monthSwitchTimer = setTimeout(() => {
                            changeDate(switchDir);
                            triggerTouchHaptic('Medium');
                            monthSwitchTimer = null;
                        }, 800);
                    }
                } else {
                    clearMonthSwitchTimer();
                }
            }

            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            if (activeDropSlot) activeDropSlot.classList.remove('drag-over');
            activeDropSlot = null;

            if (target) {
                const slot = target.closest('.grid-slot, .droppable-slot');
                if (slot) {
                    activeDropSlot = slot;
                    activeDropSlot.classList.add('drag-over');
                }
            }
        }
    };

    const handleTouchEnd = (e) => {
        if (longPressTimeout) {
            clearTimeout(longPressTimeout);
            longPressTimeout = null;

            if (!dragElClone.value && dragSourceType.value === 'schedule' && dragSourceTask) {
                const now = Date.now();

                if (lastTapState.id === dragSourceTask.scheduleId && (now - lastTapState.time) < 300) {
                    if (e.cancelable) e.preventDefault();

                    if (isTaskGhost(dragSourceTask)) {
                        jumpToGhostContext(dragSourceTask);
                    } else {
                        handleTaskDblClick(e, dragSourceTask);
                    }

                    lastTapState.id = null;
                    lastTapState.time = 0;
                } else {
                    lastTapState.id = dragSourceTask.scheduleId;
                    lastTapState.time = now;

                    selectTask(dragSourceTask.scheduleId, 'schedule');
                }
            }
        }

        stopAutoScroll();
        clearMonthSwitchTimer();

        if (dragElClone.value) {
            document.body.removeChild(dragElClone.value);
            dragElClone.value = null;
            if (activeDropSlot) activeDropSlot.classList.remove('drag-over');

            const touch = e.changedTouches[0];
            const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
            const dropColumn = targetEl ? targetEl.closest('[data-date-str]') : null;
            const dropMonthCell = targetEl ? targetEl.closest('[data-date]') : null;

            if (dropColumn) {
                const dateStr = dropColumn.dataset.dateStr;
                const timeGridContainer = dropColumn.querySelector('.relative[style*="min-height"]');

                if (timeGridContainer && dragSourceTask) {
                    const gridRect = timeGridContainer.getBoundingClientRect();
                    const touchYInContainer = touch.clientY - gridRect.top;
                    const taskTopPixel = touchYInContainer - dragClickOffsetY;
                    const minsFromStart = taskTopPixel / pxPerMin.value;
                    const totalMins = (settings.startHour * 60) + minsFromStart;
                    const snappedMins = Math.round(totalMins / 30) * 30;
                    const minMins = settings.startHour * 60;
                    const maxMins = settings.endHour * 60 - 30;
                    const finalMins = Math.max(minMins, Math.min(maxMins, snappedMins));
                    const h = Math.floor(finalMins / 60);
                    const m = finalMins % 60;
                    const newTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

                    let checkType = 'musician';
                    let checkDuration = '';
                    let excludeId = null;

                    if (dragSourceType.value === 'aggregate') {
                        checkType = sidebarTab.value;
                        const item = dragSourceTask;
                        const remainingSecs = item.totalSeconds - item.scheduledSeconds;
                        if (remainingSecs <= 0) return;
                        let remainingMins = Math.ceil(remainingSecs / 1800) * 30;
                        if (remainingMins === 0) remainingMins = 30;
                        checkDuration = formatSecs(remainingMins * 60);
                    } else if (dragSourceType.value === 'pool') {
                        const item = dragSourceTask;
                        if (item.projectId) checkType = 'project';
                        else if (item.instrumentId) checkType = 'instrument';
                        else checkType = 'musician';
                        checkDuration = item.estDuration;
                    } else {
                        const item = dragSourceTask;
                        if (item.projectId) checkType = 'project';
                        else if (item.instrumentId) checkType = 'instrument';
                        else checkType = 'musician';
                        checkDuration = item.estDuration;
                        excludeId = item.scheduleId;
                    }

                    if (checkOverlap(dateStr, newTime, checkDuration, excludeId, checkType)) {
                        openAlertModal('时间冲突', '该时间段已有重叠的安排。');
                        triggerTouchHaptic('Error');
                        if (dragSourceEl) dragSourceEl.style.opacity = '';
                        dragSourceEl = null;
                        activeDropSlot = null;
                        return;
                    }

                    if (dragSourceType.value === 'aggregate') {
                        const item = dragSourceTask;
                        const remainingSecs = item.totalSeconds - item.scheduledSeconds;
                        let remainingMins = Math.ceil(remainingSecs / 1800) * 30;
                        if (remainingMins === 0) remainingMins = 30;

                        scheduledTasks.value.push({
                            scheduleId: Date.now(),
                            sessionId: currentSessionId.value,
                            musicianId: sidebarTab.value === 'musician' ? item.id : '',
                            projectId: sidebarTab.value === 'project' ? item.id : '',
                            instrumentId: sidebarTab.value === 'instrument' ? item.id : '',
                            date: dateStr,
                            startTime: newTime,
                            estDuration: formatSecs(remainingMins * 60),
                            trackCount: item.trackCount,
                            ratio: item.defaultRatio || 20,
                            reminderMinutes: 15,
                            sound: 'default',
                        });
                        triggerTouchHaptic('Success');
                        pushHistory();
                    } else if (dragSourceType.value === 'pool') {
                        scheduledTasks.value.push({
                            scheduleId: Date.now(),
                            sessionId: currentSessionId.value,
                            projectId: dragSourceTask.projectId,
                            instrumentId: dragSourceTask.instrumentId,
                            musicianId: dragSourceTask.musicianId,
                            musicDuration: dragSourceTask.musicDuration,
                            ratio: dragSourceTask.ratio,
                            estDuration: dragSourceTask.estDuration,
                            date: dateStr,
                            startTime: newTime,
                            reminderMinutes: 15,
                            sound: 'default',
                        });
                        triggerTouchHaptic('Success');
                        pushHistory();
                    } else if (dragSourceTask.startTime !== newTime || dragSourceTask.date !== dateStr) {
                        dragSourceTask.startTime = newTime;
                        dragSourceTask.date = dateStr;
                        triggerTouchHaptic('Success');
                        pushHistory();
                    }
                }
            } else if (dropMonthCell && dragSourceTask) {
                const dateStr = dropMonthCell.dataset.date;

                if (dragSourceType.value === 'schedule') {
                    if (dragSourceTask.date !== dateStr) {
                        dragSourceTask.date = dateStr;
                        triggerTouchHaptic('Success');
                        pushHistory();
                    }
                } else if (dragSourceType.value === 'aggregate' || dragSourceType.value === 'pool') {
                    const item = dragSourceTask;
                    let mId = '';
                    let pId = '';
                    let iId = '';
                    let ratio = 20;
                    let estDur = '00:30';
                    let tCount = 0;
                    let musDur = '';
                    let checkType = 'musician';

                    if (dragSourceType.value === 'pool') {
                        mId = item.musicianId;
                        pId = item.projectId;
                        iId = item.instrumentId;
                        ratio = item.ratio;
                        estDur = item.estDuration;
                        musDur = item.musicDuration;
                        if (pId) checkType = 'project';
                        else if (iId) checkType = 'instrument';
                    } else {
                        if (sidebarTab.value === 'musician') mId = item.id;
                        else if (sidebarTab.value === 'project') {
                            pId = item.id;
                            checkType = 'project';
                        } else if (sidebarTab.value === 'instrument') {
                            iId = item.id;
                            checkType = 'instrument';
                        }
                        ratio = item.defaultRatio || 20;
                        estDur = item.estDuration || '00:30';
                        tCount = item.trackCount || 0;
                    }

                    const defaultStart = settings.startHour + ':00';
                    if (checkOverlap(dateStr, defaultStart, estDur, null, checkType)) {
                        openAlertModal('冲突', '该日期已有安排，请切换到周视图查看详情。');
                        triggerTouchHaptic('Error');
                    } else {
                        scheduledTasks.value.push({
                            scheduleId: Date.now(),
                            sessionId: currentSessionId.value,
                            musicianId: mId,
                            projectId: pId,
                            instrumentId: iId,
                            date: dateStr,
                            startTime: defaultStart,
                            estDuration: estDur,
                            trackCount: tCount,
                            ratio,
                            musicDuration: musDur,
                        });
                        triggerTouchHaptic('Success');
                        pushHistory();
                    }
                }
            }
        }

        if (dragSourceEl) {
            dragSourceEl.style.opacity = '';
            dragSourceEl = null;
        }
        activeDropSlot = null;
    };

    const initMobileResize = (e, task) => {
        if (!isMobile.value) return;

        e.stopPropagation();
        triggerTouchHaptic('Heavy');

        const touch = e.touches[0];
        const taskEl = e.target.closest('.task-block');
        const rect = taskEl.getBoundingClientRect();

        isResizingMobile.value = true;
        mobileResizeState.task = task;
        mobileResizeState.taskEl = taskEl;
        mobileResizeState.startY = touch.clientY;
        mobileResizeState.startHeight = rect.height;
        mobileResizeState.originalDuration = task.estDuration;

        window.addEventListener('touchmove', handleMobileResizeMove, { passive: false });
        window.addEventListener('touchend', handleMobileResizeEnd, true);
        window.addEventListener('touchcancel', handleMobileResizeEnd, true);
    };

    const handleMobileResizeMove = (e) => {
        if (!isResizingMobile.value) return;

        if (e.cancelable) e.preventDefault();

        const touch = e.touches[0];
        const deltaY = touch.clientY - mobileResizeState.startY;
        const targetHeight = Math.max(5, mobileResizeState.startHeight + deltaY);
        const rawDurationMins = targetHeight / pxPerMin.value;
        const startMins = timeToMinutes(mobileResizeState.task.startTime);
        const rawEndMins = startMins + rawDurationMins;
        const snappedEndMins = Math.round(rawEndMins / 30) * 30;

        let newDurationMins = snappedEndMins - startMins;
        if (newDurationMins < 5) newDurationMins = 5;

        const newDurationStr = formatSecs(newDurationMins * 60);

        if (mobileResizeState.task.estDuration !== newDurationStr) {
            mobileResizeState.task.estDuration = newDurationStr;
            triggerTouchHaptic('Light');
        }
    };

    const handleMobileResizeEnd = () => {
        const wasResizing = isResizingMobile.value;
        isResizingMobile.value = false;

        window.removeEventListener('touchmove', handleMobileResizeMove);
        window.removeEventListener('touchend', handleMobileResizeEnd, true);
        window.removeEventListener('touchcancel', handleMobileResizeEnd, true);

        if (resizeRaf) cancelAnimationFrame(resizeRaf);

        requestAnimationFrame(() => {
            document.body.style.display = 'none';
            document.body.offsetHeight;
            document.body.style.display = '';

            const taskEl = mobileResizeState.taskEl;
            if (taskEl) {
                taskEl.style.opacity = '';
                taskEl.style.transition = '';
            }
        });

        if (wasResizing) {
            setTimeout(() => {
                const t = mobileResizeState.task;
                if (!t) return;

                const newDurationStr = t.estDuration;
                let type = 'musician';
                if (t.projectId) type = 'project';
                else if (t.instrumentId) type = 'instrument';

                if (checkOverlap(t.date, t.startTime, newDurationStr, t.scheduleId, type)) {
                    t.estDuration = mobileResizeState.originalDuration;
                    openAlertModal('冲突', '调整后的时间与现有任务冲突');
                    triggerTouchHaptic('Error');
                } else {
                    const m = parseTime(t.musicDuration);
                    const r = parseTime(t.estDuration);
                    if (m > 0) t.ratio = (r / m).toFixed(1);
                    pushHistory();
                    triggerTouchHaptic('Success');
                }

                mobileResizeState.task = null;
            }, 0);
        }
    };

    const cleanupDragDrop = () => {
        if (longPressTimeout) {
            clearTimeout(longPressTimeout);
            longPressTimeout = null;
        }
        if (trackDragTimer) {
            clearTimeout(trackDragTimer);
            trackDragTimer = null;
        }
        clearMonthSwitchTimer();
        stopAutoScroll();
        stopTrackListAutoScroll();
        removeTrackDragListeners();
        window.removeEventListener('touchmove', handleMobileResizeMove);
        window.removeEventListener('touchend', handleMobileResizeEnd, true);
        window.removeEventListener('touchcancel', handleMobileResizeEnd, true);

        if (dragElClone.value && document.body.contains(dragElClone.value)) {
            document.body.removeChild(dragElClone.value);
        }
        dragElClone.value = null;

        if (dragSourceEl) {
            dragSourceEl.style.opacity = '';
            dragSourceEl = null;
        }
        if (activeDropSlot) {
            activeDropSlot.classList.remove('drag-over');
            activeDropSlot = null;
        }
        trackDragState = null;
    };

    return {
        dragElClone,
        dragSourceType,
        startTrackDrag,
        handleTrackListAutoScroll,
        stopTrackListAutoScroll,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handlePoolTouchStart,
        startAutoScroll,
        stopAutoScroll,
        updateAutoScrollDirection,
        initMobileResize,
        handleMobileResizeMove,
        handleMobileResizeEnd,
        cleanupDragDrop,
    };
}
