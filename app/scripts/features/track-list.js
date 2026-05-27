export function registerTrackListFeature(context) {
  const { refs, state, utils, actions } = context;
  const {
    trackListData,
    trackListContainerRef,
    draggingSectionIndex,
    itemPool,
    scheduledTasks,
    showTrackList,
    isMobile,
  } = refs;
  const { settings } = state;
  const { parseTime, formatSecs, getNameById } = utils;
  const {
    openAlertModal,
    openInputModal,
    pushHistory,
    autoUpdateEfficiency,
    checkCanDeleteSplit,
    restoreSplitTime,
    updateTaskNotification,
    triggerTouchHaptic,
    moveDivider,
    pruneEmptySchedules,
  } = actions;

  let dividerDragState = null;
  let trackListScrollTimer = null;
  let trackSaveTimer = null;

  const getViewType = () => trackListData.value.viewType || 'musician';

  const getTargetId = (item, viewType) => {
    if (viewType === 'project') return item.projectId;
    if (viewType === 'instrument') return item.instrumentId;
    return item.musicianId;
  };

  const autoDistributeSections = () => {
    const listData = trackListData.value;
    const viewType = listData.viewType || 'musician';

    if (!listData.items || !listData.schedules || listData.schedules.length === 0) return;

    const capacities = listData.schedules.map((schedule) => parseTime(schedule.estDuration));
    const totalScheduleCapacity = capacities.reduce((sum, value) => sum + value, 0);

    if (totalScheduleCapacity === 0) {
      openAlertModal('无法分配', '日程块的总时长为 0。');
      return;
    }

    const lockedItems = [];
    const movableItems = [];

    const usedTimePerSection = new Array(capacities.length).fill(0);
    let totalLockedDuration = 0;

    listData.items.forEach((item) => {
      if (item.isSkipped) return;

      const rec = item.records?.[viewType];
      const hasRecord = rec && (
        (rec.actualDuration && rec.actualDuration !== '00:00') ||
        (rec.recStart && rec.recStart !== '')
      );

      if (hasRecord) {
        lockedItems.push(item);

        let occupiedSec = 0;
        if (rec.actualDuration && rec.actualDuration !== '00:00') {
          occupiedSec = parseTime(rec.actualDuration);
        } else {
          occupiedSec = parseTime(item.estDuration);
        }

        totalLockedDuration += occupiedSec;

        if (item.sectionIndex >= 0 && item.sectionIndex < usedTimePerSection.length) {
          usedTimePerSection[item.sectionIndex] += occupiedSec;
        }
      } else {
        movableItems.push(item);
      }
    });

    if (movableItems.length === 0) return;

    const totalRemainingCapacity = Math.max(0, totalScheduleCapacity - totalLockedDuration);

    let totalMovableMusicSec = 0;
    movableItems.forEach((item) => {
      totalMovableMusicSec += parseTime(item.musicDuration || '00:00');
    });

    movableItems.forEach((item) => {
      let allocatedSec = 0;
      const itemMusicSec = parseTime(item.musicDuration || '00:00');

      if (totalMovableMusicSec > 0 && totalRemainingCapacity > 0) {
        allocatedSec = (itemMusicSec / totalMovableMusicSec) * totalRemainingCapacity;
      } else {
        allocatedSec = 30;
      }

      allocatedSec = Math.max(30, Math.floor(allocatedSec));
      item.estDuration = formatSecs(allocatedSec);

      if (itemMusicSec > 0) {
        item.ratio = (allocatedSec / itemMusicSec).toFixed(1);
      }
    });

    movableItems.sort((a, b) => {
      const sizeA = isOrchestraGroup(a) ? getOrchSize(a.orchestration) : 0;
      const sizeB = isOrchestraGroup(b) ? getOrchSize(b.orchestration) : 0;
      return sizeB - sizeA;
    });

    let currentSection = 0;

    movableItems.forEach((item) => {
      const itemDuration = parseTime(item.estDuration);

      while (currentSection < capacities.length - 1) {
        const capacity = capacities[currentSection];
        const used = usedTimePerSection[currentSection];

        if (used + itemDuration <= capacity + 5) {
          break;
        }
        currentSection++;
      }

      item.sectionIndex = currentSection;

      if (currentSection < usedTimePerSection.length) {
        usedTimePerSection[currentSection] += itemDuration;
      }
    });

    pushHistory();
    triggerTouchHaptic('Success');
  };

  const autoResizeScheduleByRecords = (isSilent = false, shouldPushHistory = true) => {
    const sections = trackListData.value.schedules;
    const items = trackListData.value.items;
    const viewType = getViewType();

    let hasUpdate = false;

    sections.forEach((scheduleRef, sectionIndex) => {
      if (!scheduleRef) return;

      const sectionItems = items.filter((item) => (item.sectionIndex || 0) === sectionIndex);
      if (sectionItems.length === 0) return;

      let minMins = Infinity;
      let maxMins = -Infinity;

      sectionItems.forEach((item) => {
        const rec = item.records[viewType];
        if (!rec) return;

        if (rec.recStart) {
          const [h, m] = rec.recStart.split(':').map(Number);
          const startVal = h * 60 + m;
          if (startVal < minMins) minMins = startVal;
        }
        if (rec.recEnd) {
          const [h, m] = rec.recEnd.split(':').map(Number);
          let endVal = h * 60 + m;
          if (rec.recStart) {
            const [sh, sm] = rec.recStart.split(':').map(Number);
            if (endVal < (sh * 60 + sm)) endVal += 24 * 60;
          }
          if (endVal > maxMins) maxMins = endVal;
        }
      });

      if (minMins === Infinity || maxMins === -Infinity) return;

      const newStartMins = minMins;
      const newEndMins = maxMins;
      const durationMins = newEndMins - newStartMins;

      if (durationMins <= 0) return;

      const taskInMainArray = scheduledTasks.value.find(
        (task) => task.scheduleId === scheduleRef.scheduleId,
      );

      if (taskInMainArray) {
        const sh = Math.floor(newStartMins / 60);
        const sm = newStartMins % 60;
        const newStartTimeStr = `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
        const newDurationStr = formatSecs(durationMins * 60);

        if (
          taskInMainArray.startTime !== newStartTimeStr ||
          taskInMainArray.estDuration !== newDurationStr
        ) {
          taskInMainArray.startTime = newStartTimeStr;
          taskInMainArray.estDuration = newDurationStr;
          hasUpdate = true;
        }
      }
    });

    if (hasUpdate) {
      if (!isSilent) {
        triggerTouchHaptic('Success');
        openAlertModal('自动调整完成', '日程块已根据实际录音时间精确调整。');
      }
    } else if (!isSilent) {
      openAlertModal('无需调整', '未找到有效的时间记录，或当前日程已匹配。');
    }
  };

  const startDividerDrag = (event, sectionIndex) => {
    if (dividerDragState) return;
    const isTouch = event.type === 'touchstart';
    if (event.cancelable) event.preventDefault();

    const triggerEl = event.currentTarget;
    const targetEl = triggerEl.closest('.group\\/divider');
    const actualTarget = targetEl || triggerEl;

    actualTarget.style.opacity = '0';

    const rect = actualTarget.getBoundingClientRect();
    const clientY = isTouch ? event.touches[0].clientY : event.clientY;
    const container = trackListContainerRef.value;
    const initialScrollTop = container ? container.scrollTop : 0;

    const taskEls = Array.from(container.querySelectorAll('.track-card'));
    const taskHeights = taskEls.map((el) => {
      const style = window.getComputedStyle(el);
      return el.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    });

    const dividerStyle = window.getComputedStyle(targetEl);
    const ghostHeight = targetEl.offsetHeight +
      parseFloat(dividerStyle.marginTop) +
      parseFloat(dividerStyle.marginBottom);

    let startIndex = trackListData.value.items.findIndex(
      (item) => item.sectionIndex === sectionIndex,
    );
    if (startIndex === -1) startIndex = trackListData.value.items.length;

    const ghost = actualTarget.cloneNode(true);
    Object.assign(ghost.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      zIndex: '9999',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      transform: 'none',
      transition: 'none',
      pointerEvents: 'none',
      opacity: '1',
    });
    document.body.appendChild(ghost);

    draggingSectionIndex.value = sectionIndex;

    dividerDragState = {
      targetEl: actualTarget,
      ghost,
      ghostHeight,
      taskEls,
      fingerOffset: clientY - rect.top,
      lastClientY: clientY,
      lastScrollTop: initialScrollTop,
      cumulativeDelta: 0,
      taskHeights,
      virtualIndex: startIndex,
      startIndex,
      sectionIndex,
    };

    triggerTouchHaptic('Medium');

    if (isTouch) {
      window.addEventListener('touchmove', onDividerDragMove, { passive: false });
      window.addEventListener('touchend', onDividerDragEnd);
      window.addEventListener('touchcancel', onDividerDragEnd);
    } else {
      window.addEventListener('mousemove', onDividerDragMove);
      window.addEventListener('mouseup', onDividerDragEnd);
    }
  };

  const onDividerDragMove = (event) => {
    if (!dividerDragState) return;
    if (event.cancelable) event.preventDefault();

    const clientY = event.type.includes('touch') ? event.touches[0].clientY : event.clientY;
    const newTop = clientY - dividerDragState.fingerOffset;
    dividerDragState.ghost.style.top = `${newTop}px`;

    const container = trackListContainerRef.value;
    const currentScrollTop = container ? container.scrollTop : 0;
    const dy = clientY - dividerDragState.lastClientY;
    const dScroll = currentScrollTop - dividerDragState.lastScrollTop;

    dividerDragState.lastClientY = clientY;
    dividerDragState.lastScrollTop = currentScrollTop;
    dividerDragState.cumulativeDelta += dy + dScroll;

    const { taskHeights, startIndex, ghostHeight, taskEls } = dividerDragState;
    let indexChanged = false;

    while (dividerDragState.cumulativeDelta < 0) {
      if (dividerDragState.virtualIndex <= 0) break;
      const targetIndex = dividerDragState.virtualIndex - 1;
      const threshold = taskHeights[targetIndex];
      if (!threshold || threshold < 10) break;

      if (dividerDragState.cumulativeDelta < -threshold) {
        dividerDragState.cumulativeDelta += threshold;
        dividerDragState.virtualIndex--;
        indexChanged = true;
      } else {
        break;
      }
    }

    while (dividerDragState.cumulativeDelta > 0) {
      if (dividerDragState.virtualIndex >= taskHeights.length) break;
      const targetIndex = dividerDragState.virtualIndex;
      const threshold = taskHeights[targetIndex];
      if (!threshold || threshold < 10) break;

      if (dividerDragState.cumulativeDelta > threshold) {
        dividerDragState.cumulativeDelta -= threshold;
        dividerDragState.virtualIndex++;
        indexChanged = true;
      } else {
        break;
      }
    }

    if (indexChanged || isMobile.value) {
      const virtualIndex = dividerDragState.virtualIndex;
      if (indexChanged) triggerTouchHaptic('Light');

      taskEls.forEach((el, index) => {
        let translateY = 0;
        if (virtualIndex > startIndex) {
          if (index >= startIndex && index < virtualIndex) translateY = -ghostHeight;
        } else if (virtualIndex < startIndex) {
          if (index >= virtualIndex && index < startIndex) translateY = ghostHeight;
        }

        if (translateY !== 0) {
          el.style.transform = `translateY(${translateY}px)`;
          el.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)';
        } else {
          el.style.transform = '';
          el.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)';
        }
      });
    }

    handleTrackListAutoScroll(clientY);
  };

  const onDividerDragEnd = () => {
    if (dividerDragState) {
      const { sectionIndex, startIndex, virtualIndex, taskEls, targetEl } = dividerDragState;

      taskEls.forEach((el) => {
        el.style.transform = '';
        el.style.transition = 'none';
      });

      if (targetEl) targetEl.style.opacity = '';

      if (dividerDragState.ghost && document.body.contains(dividerDragState.ghost)) {
        document.body.removeChild(dividerDragState.ghost);
      }

      requestAnimationFrame(() => {
        if (virtualIndex !== startIndex) {
          const diff = virtualIndex - startIndex;
          const direction = diff > 0 ? 'down' : 'up';
          const moves = Math.abs(diff);

          for (let index = 0; index < moves; index++) {
            moveDivider(sectionIndex, direction, false);
          }
          pushHistory();
        }
      });
    }

    dividerDragState = null;
    draggingSectionIndex.value = null;
    stopTrackListAutoScroll();

    window.removeEventListener('touchmove', onDividerDragMove);
    window.removeEventListener('touchend', onDividerDragEnd);
    window.removeEventListener('touchcancel', onDividerDragEnd);
    window.removeEventListener('mousemove', onDividerDragMove);
    window.removeEventListener('mouseup', onDividerDragEnd);
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

  const stopTrackListAutoScroll = () => {
    if (trackListScrollTimer) {
      cancelAnimationFrame(trackListScrollTimer);
      trackListScrollTimer = null;
    }
  };

  const calcTrackDiff = (item) => {
    const viewType = getViewType();
    const record = item.records[viewType];
    if (!record) return;

    if (record.recStart && record.recEnd) {
      const [sh, sm] = record.recStart.split(':').map(Number);
      const [eh, em] = record.recEnd.split(':').map(Number);

      let startMins = sh * 60 + sm;
      let endMins = eh * 60 + em;

      if (endMins < startMins) endMins += 24 * 60;

      let diffMins = endMins - startMins;

      if (record.breakMinutes && record.breakMinutes > 0) {
        diffMins -= parseInt(record.breakMinutes);
      }

      if (diffMins < 0) diffMins = 0;
      const diffSecs = diffMins * 60;

      record.actualDuration = formatSecs(diffSecs);

      saveTrackRecord(item);
      autoResizeScheduleByRecords(true);
    }
  };

  const setTrackBreak = (item) => {
    const viewType = getViewType();
    const record = item.records[viewType];

    openInputModal(
      '设置中断/休息时长',
      record.breakMinutes ? String(record.breakMinutes) : '',
      '请输入分钟数',
      (val) => {
        const mins = parseInt(val);
        record.breakMinutes = (Number.isNaN(mins) || mins < 0) ? 0 : mins;
        calcTrackDiff(item);
        pushHistory();
      },
      '这段时间将从总录制时长中扣除',
    );
  };

  const deleteTrackFromList = (itemToDelete) => {
    if (!checkCanDeleteSplit(itemToDelete)) return;

    const shouldRemoveTask = restoreSplitTime(itemToDelete);

    if (shouldRemoveTask) {
      itemPool.value = itemPool.value.filter((item) => item.id !== itemToDelete.id);
    }

    trackListData.value.items = trackListData.value.items.filter(
      (item) => item.id !== itemToDelete.id,
    );

    if (showTrackList.value) {
      pushHistory();
    }

    triggerTouchHaptic('Medium');
  };

  const autoCalcDuration = () => {
    const start = trackListData.value.actualStart;
    const end = trackListData.value.actualEnd;

    if (start && end) {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);

      let startMins = sh * 60 + sm;
      let endMins = eh * 60 + em;

      if (endMins < startMins) endMins += 24 * 60;

      const diffSecs = (endMins - startMins) * 60;
      trackListData.value.actualDuration = formatSecs(diffSecs);
    }
  };

  const saveScheduleActualTime = () => {
    const currentScheduleId = trackListData.value.taskRef.scheduleId;
    if (!currentScheduleId) return;

    scheduledTasks.value = scheduledTasks.value.map((task) => {
      if (task.scheduleId === currentScheduleId) {
        return {
          ...task,
          actualStartTime: trackListData.value.actualStart,
          actualEndTime: trackListData.value.actualEnd,
          actualDuration: trackListData.value.actualDuration,
        };
      }
      return task;
    });

    pushHistory();
    openAlertModal('✅ 录音时间已保存！\n该演奏员的「真实平均比值」已在侧边栏自动更新。');
  };

  const saveTrackActual = (item) => {
    const task = scheduledTasks.value.find((entry) => entry.scheduleId === item.scheduleId);
    if (task) {
      task.actualDuration = item.actualDuration;
      scheduledTasks.value = [...scheduledTasks.value];
    }
  };

  const onTrackListReminderChange = (task) => {
    if (!task) return;

    if (typeof updateTaskNotification === 'function') {
      updateTaskNotification(task);
    }

    pushHistory();
    triggerTouchHaptic('Light');
  };

  const syncTrackItemScheduleSection = (item, previousSectionIndex = null) => {
    if (!item || !trackListData.value?.schedules) return false;

    let sectionIndex = parseInt(item.sectionIndex, 10);
    if (Number.isNaN(sectionIndex)) sectionIndex = 0;

    const targetSchedule = trackListData.value.schedules[sectionIndex];
    if (!targetSchedule) return false;

    let didUpdate = false;
    const exactSchedule = scheduledTasks.value.find((task) => task.templateId === item.id);

    if (exactSchedule) {
      if (exactSchedule.date !== targetSchedule.date) {
        exactSchedule.date = targetSchedule.date;
        didUpdate = true;
      }
      if (exactSchedule.startTime !== targetSchedule.startTime) {
        exactSchedule.startTime = targetSchedule.startTime;
        didUpdate = true;
      }

      if (didUpdate && typeof updateTaskNotification === 'function') {
        updateTaskNotification(exactSchedule);
      }
    }

    if (
      !exactSchedule &&
      previousSectionIndex !== null &&
      previousSectionIndex !== sectionIndex &&
      typeof pruneEmptySchedules === 'function'
    ) {
      pruneEmptySchedules();
      didUpdate = true;
    }

    return didUpdate;
  };

  const setTrackNow = (item, type) => {
    const viewType = getViewType();
    const record = item.records[viewType];

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (type === 'start') record.recStart = timeStr;
    if (type === 'end') record.recEnd = timeStr;

    calcTrackDiff(item);
    pushHistory();
  };

  const saveTrackRecord = (item) => {
    if (trackSaveTimer) clearTimeout(trackSaveTimer);
    trackSaveTimer = setTimeout(() => {
      const viewType = getViewType();
      const targetId = getTargetId(item, viewType);

      autoUpdateEfficiency(targetId, viewType);
    }, 1500);
  };

  const clearTrackTime = (item) => {
    const viewType = getViewType();
    const record = item.records[viewType];

    record.recStart = '';
    record.recEnd = '';
    record.actualDuration = '';

    autoResizeScheduleByRecords(true, false);

    const targetId = getTargetId(item, viewType);
    autoUpdateEfficiency(targetId, viewType, false);

    pushHistory();
    triggerTouchHaptic('Medium');
  };

  const getOrchSize = (str) => {
    if (!str) return 0;
    const nums = str.match(/\d+/g);
    if (!nums) return 0;
    return nums.reduce((sum, value) => sum + parseInt(value, 10), 0);
  };

  const isOrchestraGroup = (item) => {
    const name = getNameById(item.instrumentId, 'instrument').toLowerCase();
    const group = (settings.instruments.find((inst) => inst.id === item.instrumentId)?.group || '').toLowerCase();
    const text = `${name} ${group}`;
    return /string|str|brass|wind|wood|hn|tpt|tbn|tuba|vln|vla|vc|db|flute|oboe|clar|bsn/.test(text);
  };

  const isPercussionGroup = (item) => {
    const name = getNameById(item.musicianId, 'musician').toLowerCase();
    return /perc/.test(name);
  };

  const isStringGroup = (item) => {
    const name = getNameById(item.musicianId, 'musician').toLowerCase();
    return /\b(strings?|str)\b/i.test(name);
  };

  const sortTrackList = () => {
    if (!trackListData.value.items) return;

    const viewType = getViewType();

    trackListData.value.items = [...trackListData.value.items].sort((a, b) =>
      compareTrackItems(a, b, viewType, true),
    );

    autoResizeScheduleByRecords(true, false);
    pushHistory();
    triggerTouchHaptic('Medium');
  };

  const autoSortTrackList = () => {
    if (!trackListData.value.items) return;

    const viewType = getViewType();
    trackListData.value.items.sort((a, b) => compareTrackItems(a, b, viewType, false));
  };

  const compareTrackItems = (a, b, viewType, sectionFirst) => {
    if (sectionFirst) {
      const secA = a.sectionIndex || 0;
      const secB = b.sectionIndex || 0;
      if (secA !== secB) return secA - secB;
    }

    if (!!a.isSkipped !== !!b.isSkipped) return a.isSkipped ? 1 : -1;

    if (!sectionFirst) {
      const secA = a.sectionIndex || 0;
      const secB = b.sectionIndex || 0;
      if (secA !== secB) return secA - secB;

      if (!!a.isSkipped !== !!b.isSkipped) return a.isSkipped ? 1 : -1;
    }

    const recA = a.records?.[viewType];
    const recB = b.records?.[viewType];
    const timeA = recA && recA.recStart ? recA.recStart : '99:99';
    const timeB = recB && recB.recStart ? recB.recStart : '99:99';
    if (timeA !== timeB) return timeA.localeCompare(timeB);

    const isOrchA = isOrchestraGroup(a);
    const isOrchB = isOrchestraGroup(b);
    if (isOrchA && isOrchB && !isPercussionGroup(a) && !isPercussionGroup(b)) {
      const sizeA = getOrchSize(a.orchestration);
      const sizeB = getOrchSize(b.orchestration);
      if (sizeA !== sizeB) return sizeB - sizeA;
    }

    const nameA = getNameById(a.instrumentId, 'instrument');
    const nameB = getNameById(b.instrumentId, 'instrument');
    const isPercA = isPercussionGroup(a);
    const isPercB = isPercussionGroup(b);

    if (isPercA && isPercB && nameA !== nameB) {
      return nameA.localeCompare(nameB, 'zh-CN');
    }

    return 0;
  };

  return {
    autoDistributeSections,
    autoResizeScheduleByRecords,
    startDividerDrag,
    onDividerDragMove,
    onDividerDragEnd,
    handleTrackListAutoScroll,
    stopTrackListAutoScroll,
    calcTrackDiff,
    setTrackBreak,
    deleteTrackFromList,
    autoCalcDuration,
    saveScheduleActualTime,
    saveTrackActual,
    onTrackListReminderChange,
    syncTrackItemScheduleSection,
    setTrackNow,
    saveTrackRecord,
    clearTrackTime,
    getOrchSize,
    isOrchestraGroup,
    isPercussionGroup,
    isStringGroup,
    sortTrackList,
    autoSortTrackList,
    isDividerDragging: () => !!dividerDragState,
  };
}
