// 布局与排序：日程块自动分配、按录音记录自动调整、排序比较器、会话比例与分配时长。
// 从 track-list.js 抽取（2026-08 模块化重构 P2b）。纯领域逻辑，不触碰 DOM。
export function createTrackListLayout(deps) {
  const {
    trackListData,
    scheduledTasks,
    settings,
    parseTime,
    formatSecs,
    getNameById,
    openAlertModal,
    pushHistory,
    getViewType,
  } = deps;

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
  };

  const autoResizeScheduleByRecords = (isSilent = false) => {
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
        openAlertModal('自动调整完成', '日程块已根据实际录音时间精确调整。');
      }
    } else if (!isSilent) {
      openAlertModal('无需调整', '未找到有效的时间记录，或当前日程已匹配。');
    }
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

    autoResizeScheduleByRecords(true);
    pushHistory();
  };

  const autoSortTrackList = () => {
    if (!trackListData.value.items) return;

    const viewType = getViewType();
    trackListData.value.items.sort((a, b) => compareTrackItems(a, b, viewType, false));
  };

  const getSessionRatio = () => {
    const actual = trackListData.value.actualDuration;
    const items = trackListData.value.items;

    if (!actual || !items || items.length === 0) return '-';

    const actualSeconds = parseTime(actual);
    if (actualSeconds === 0) return '-';

    const totalMusicSeconds = items.reduce(
      (sum, item) => sum + parseTime(item.musicDuration),
      0,
    );

    if (totalMusicSeconds === 0) return '-';

    return (actualSeconds / totalMusicSeconds).toFixed(1);
  };

  const calculateProportionalDuration = (item) => {
    if (!trackListData.value.taskRef || !trackListData.value.items || trackListData.value.items.length === 0) {
      return item.estDuration;
    }

    const blockSeconds = parseTime(trackListData.value.taskRef.estDuration);
    const totalMusicSeconds = trackListData.value.items.reduce(
      (sum, trackItem) => sum + parseTime(trackItem.musicDuration || '00:00'),
      0,
    );

    if (totalMusicSeconds === 0) return item.estDuration;

    const itemMusicSeconds = parseTime(item.musicDuration || '00:00');
    const allocatedSeconds = (itemMusicSeconds / totalMusicSeconds) * blockSeconds;

    return formatSecs(Math.round(allocatedSeconds));
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
    getOrchSize,
    isOrchestraGroup,
    isPercussionGroup,
    isStringGroup,
    sortTrackList,
    autoSortTrackList,
    getSessionRatio,
    calculateProportionalDuration,
  };
}
