import { getWorkLogs, getPartAllocation } from '../utils/workflow-ledger.js';
import { getScheduleStage, getAssigneeId, stageFromView, UNASSIGNED_ID } from '../utils/workflow.js';
import { computed, reactive } from 'vue';

export function registerSidebarStatsFeature(context) {
  const { refs, state, utils, actions } = context;
  const {
    itemPool,
    scheduledTasks,
    currentSessionId,
    globalSearchQuery,
    sidebarTab,
    sortField,
    sortAsc,
    statClickIndexMap,
    isMobile,
    expandedGroups,
  } = refs;
  const { settings } = state;
  const {
    parseTime,
    formatSecs,
    calculateEstTime,
    getNameById,
    getFullSearchText,
    smartMatch,
    isItemVisibleForView,
    peekSplitViewState,
  } = utils;
  const {
    pushHistory,
    openAlertModal,
    smartScrollToTask,
  } = actions;

  const toggleSort = (field) => {
    if (sortField.value === field) {
      sortAsc.value = !sortAsc.value;
    } else {
      sortField.value = field;
      sortAsc.value = field === 'name';
    }
  };

  const getSortIcon = (field) => {
    if (sortField.value !== field) return '';
    if (field === 'name') return sortAsc.value ? 'fa-arrow-down-a-z' : 'fa-arrow-up-a-z';
    if (field === 'duration') return sortAsc.value ? 'fa-arrow-up-short-wide' : 'fa-arrow-down-wide-short';
    if (field === 'status') return sortAsc.value ? 'fa-arrow-down-short-wide' : 'fa-arrow-up-wide-short';
    return '';
  };

  const toggleCollapse = (groupKey) => {
    if (expandedGroups.has(groupKey)) {
      expandedGroups.delete(groupKey);
    } else {
      expandedGroups.add(groupKey);
    }
  };

  const calculateGroupStats = (sourceList, filterKey) => {
    const recordTypeMap = {
      musicianId: 'musician',
      projectId: 'project',
      editorId: 'project',
      instrumentId: 'instrument',
    };
    const currentRecordType = recordTypeMap[filterKey] || 'musician';
    const stage = stageFromView(currentRecordType);
    const canonical = settings.workflow?.version >= 11;
    const logsOf = item => getWorkLogs(settings, item, stage);
    const belongsToBlock = (item, block, index) => canonical
      ? getPartAllocation(settings, item, stage)?.scheduleId === block.scheduleId
      : block.templateId ? block.templateId === item.id : (item.sectionIndex || 0) === index;
    const ownerGrouping = filterKey === 'musicianId' || filterKey === 'editorId';
    const groupId = (item) => ownerGrouping ? getAssigneeId(item, stage) || UNASSIGNED_ID : item[filterKey];
    const currentSessionItems = itemPool.value
      .filter((item) =>
        (item.sessionId || 'S_DEFAULT') === currentSessionId.value &&
        isItemVisibleForView(item, currentRecordType),
      )
      .map((item) => {
        const splitState = peekSplitViewState(item, currentRecordType);
        return {
          ...item,
          splitFromId: splitState.splitFromId,
          splitTag: splitState.splitTag,
          musicDuration: splitState.musicDuration,
          estDuration: splitState.estDuration,
          sectionIndex: splitState.sectionIndex,
        };
      });

    const rawQuery = globalSearchQuery.value.trim().toLowerCase();
    const statusDefinitions = {
      '完成': ['completed'],
      finished: ['completed'],
      '进行中': ['in-progress'],
      ing: ['in-progress'],
      '缺时': ['insufficient'],
      missing: ['insufficient'],
      '已排': ['scheduled', 'full', 'completed'],
      full: ['scheduled', 'full', 'completed'],
    };

    const textKeywords = [];
    const statusFilters = new Set();

    if (rawQuery) {
      const tempParts = rawQuery.split(/\s+/).filter((keyword) => keyword);
      const nonStatusParts = [];

      tempParts.forEach((inputWord) => {
        let isStatus = false;
        for (const [key, statuses] of Object.entries(statusDefinitions)) {
          if (key.includes(inputWord) || inputWord.includes(key)) {
            statuses.forEach((status) => statusFilters.add(status));
            isStatus = true;
            break;
          }
        }
        if (!isStatus) nonStatusParts.push(inputWord);
      });

      const cleanQuery = nonStatusParts.join(' ');
      if (cleanQuery) {
        const isSequencePattern = /^[a-zA-Z\u4e00-\u9fa5]+\s+\d+$/.test(cleanQuery);
        if (isSequencePattern) {
          textKeywords.push(cleanQuery);
        } else {
          textKeywords.push(...cleanQuery.split(/\s+/));
        }
      }
    }

    const isSearchMode = textKeywords.length > 0;

    const stats = sourceList.map((group) => {
      let poolItems = currentSessionItems.filter((item) => groupId(item) === group.id);
      const groupPoolItems = poolItems;

      if (isSearchMode) {
        poolItems = poolItems.filter((item) => {
          const groupContext = `${group.name} ${group.group || ''}`;
          const fullText = getFullSearchText(item, groupContext);

          return textKeywords.every((keyword) => smartMatch(fullText, keyword));
        });
      }

      if (poolItems.length === 0) return null;

      const scheduleItems = scheduledTasks.value.filter(
        (task) =>
          groupId(task) === group.id &&
          getScheduleStage(task) === stage &&
          (task.sessionId || 'S_DEFAULT') === currentSessionId.value,
      );
      scheduleItems.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
      const scheduleCount = scheduleItems.length;
      // Use all associated music, even when the sidebar list is search-filtered.
      const scheduledMusicSecs = ownerGrouping
        ? groupPoolItems.filter((item) => !item.isSkipped && scheduleItems.some((block, index) =>
          belongsToBlock(item, block, index),
        )).reduce((sum, item) => sum + parseTime(item.musicDuration), 0)
        : 0;
      const blockSeconds = scheduleItems.reduce((sum, block) => sum + parseTime(block.estDuration), 0);
      const scheduleRatio = scheduledMusicSecs > 0 && blockSeconds > 0
        ? Number((blockSeconds / scheduledMusicSecs).toFixed(1))
        : null;

      let ratioComparison = null;
      if (ownerGrouping) {
        let actualSeconds = 0;
        let recordedMusicSeconds = 0;
        (canonical ? itemPool.value.filter(item => (item.sessionId || 'S_DEFAULT') === currentSessionId.value) : currentSessionItems).forEach((item) => {
          if (item.isSkipped) return;
          if (canonical) {
            const logs = logsOf(item).filter(log => log.assigneeId === group.id && parseTime(log.actualDuration) > 0 && parseTime(log.musicDuration) > 0);
            if (logs.length) { actualSeconds += logs.reduce((sum, log) => sum + parseTime(log.actualDuration), 0); recordedMusicSeconds += parseTime(logs[0].musicDuration); }
            return;
          }
          const record = item.records?.[currentRecordType];
          const historicalOwner = record && Object.hasOwn(record, 'assigneeId') ? record.assigneeId : getAssigneeId(item, stage);
          if (historicalOwner !== group.id) return;
          const actual = parseTime(item.records?.[currentRecordType]?.actualDuration);
          const music = parseTime(record?.musicDuration ?? item.musicDuration);
          if (actual > 0 && music > 0) {
            actualSeconds += actual;
            recordedMusicSeconds += music;
          }
        });
        const averageRatio = recordedMusicSeconds > 0 ? actualSeconds / recordedMusicSeconds : null;
        const scheduledRatio = scheduledMusicSecs > 0 && blockSeconds > 0 ? blockSeconds / scheduledMusicSecs : null;
        ratioComparison = {
          stage,
          averageRatio,
          scheduledRatio,
          differencePercent: averageRatio !== null && scheduledRatio !== null
            ? Math.round((scheduledRatio / averageRatio - 1) * 100)
            : null,
          actualSeconds,
          recordedMusicSeconds,
          blockSeconds,
          scheduledMusicSeconds: scheduledMusicSecs,
        };
      }

      let groupTotalActual = 0;
      let groupTotalMusic = 0;

      poolItems.forEach((item) => {
        if (canonical) {
          const logs = logsOf(item).filter(log => (!ownerGrouping || log.assigneeId === group.id) && parseTime(log.actualDuration) > 0 && parseTime(log.musicDuration) > 0);
          if (logs.length) { groupTotalActual += logs.reduce((sum, log) => sum + parseTime(log.actualDuration), 0); groupTotalMusic += parseTime(logs[0].musicDuration); }
          return;
        }
        const rec = item.records ? item.records[currentRecordType] : null;
        if (rec && rec.actualDuration && item.musicDuration) {
          const actual = parseTime(rec.actualDuration);
          const music = parseTime(item.musicDuration);
          if (actual > 0 && music > 0) {
            groupTotalActual += actual;
            groupTotalMusic += music;
          }
        }
      });

      const avgRealRatio = groupTotalMusic > 0
        ? parseFloat((groupTotalActual / groupTotalMusic).toFixed(1))
        : 0;

      let smartBaseRatio = 20;
      if (ownerGrouping && ratioComparison.averageRatio > 0) {
        smartBaseRatio = ratioComparison.averageRatio;
      } else if (!ownerGrouping && avgRealRatio > 0) {
        smartBaseRatio = avgRealRatio;
      }

      let totalSecs = 0;
      let totalActualSec = 0;
      let recordedCount = 0;
      let completedCount = 0;
      let effectiveCount = 0;

      const displayItems = poolItems.map((rawItem) => {
        const rec = rawItem.records ? rawItem.records[currentRecordType] : null;
        const loggedSeconds = canonical ? logsOf(rawItem).filter(log => !ownerGrouping || log.assigneeId === group.id).reduce((sum, log) => sum + parseTime(log.actualDuration), 0) : 0;
        const actualDur = canonical ? (loggedSeconds > 0 ? formatSecs(loggedSeconds) : null) : rec && rec.actualDuration ? rec.actualDuration : null;

        const manualRatio = rawItem.ratios ? rawItem.ratios[currentRecordType] : null;
        const rawVal = manualRatio ? parseFloat(manualRatio) : 0;
        let validManualRatio = null;

        if (rawVal > 0 && rawVal !== 20 && rawVal !== smartBaseRatio) {
          const defaultRatio = group.defaultRatio && group.defaultRatio > 0
            ? parseFloat(group.defaultRatio)
            : 20;
          if (rawVal !== defaultRatio) {
            validManualRatio = rawVal;
          }
        }

        const isManual = validManualRatio !== null;
        const effectiveRatio = isManual ? validManualRatio : smartBaseRatio;
        const dynEst = calculateEstTime(rawItem.musicDuration, effectiveRatio);

        const explicitStatus = rawItem.workflowStatus?.[stage];
        const isSkipped = rawItem.isSkipped || explicitStatus === 'not-required';
        if (!isSkipped) {
          if (explicitStatus ? explicitStatus === 'completed' : !!actualDur) completedCount++;
          effectiveCount++;
          if (actualDur) {
            recordedCount++;
            totalActualSec += parseTime(actualDur);
          }
          totalSecs += parseTime(dynEst || '00:00');
        }

        return {
          ...rawItem,
          isSkipped,
          actualDuration: actualDur,
          ratio: effectiveRatio,
          isManualRatio: isManual,
          estDuration: dynEst,
          _sortTime: rec && rec.recStart ? rec.recStart : '99:99',
        };
      });

      displayItems.sort((a, b) => {
        if (!!a.isSkipped !== !!b.isSkipped) return a.isSkipped ? 1 : -1;
        if (sortField.value === 'duration' || sortField.value === 'status') {
          const actualA = parseTime(a.actualDuration || '00:00');
          const actualB = parseTime(b.actualDuration || '00:00');
          if (actualA !== actualB) return sortAsc.value ? actualB - actualA : actualA - actualB;
          const estA = parseTime(a.estDuration || '00:00');
          const estB = parseTime(b.estDuration || '00:00');
          if (estA !== estB) return sortAsc.value ? estB - estA : estA - estB;
        } else if (sortField.value === 'name') {
          const nameA = filterKey === 'musicianId'
            ? getNameById(a.projectId, 'project')
            : getNameById(a.musicianId, 'musician');
          const nameB = filterKey === 'musicianId'
            ? getNameById(b.projectId, 'project')
            : getNameById(b.musicianId, 'musician');

          return sortAsc.value
            ? nameA.localeCompare(nameB, 'zh-CN', { numeric: true })
            : nameB.localeCompare(nameA, 'zh-CN', { numeric: true });
        }
        const secA = a.sectionIndex || 0;
        const secB = b.sectionIndex || 0;
        if (secA !== secB) return secA - secB;
        return a._sortTime.localeCompare(b._sortTime);
      });

      let scheduledSecs = 0;

      if (isSearchMode) {
        displayItems.forEach((item) => {
          if (
            (canonical ? scheduleItems.some((block, index) => belongsToBlock(item, block, index)) : item.sectionIndex !== undefined && item.sectionIndex >= 0 && item.sectionIndex < scheduleItems.length) &&
            item.actualDuration &&
            item.actualDuration !== '00:00'
          ) {
            scheduledSecs += parseTime(item.actualDuration);
          }
        });
      } else {
        scheduleItems.forEach((block, blockIndex) => {
          const blockTotalSecs = parseTime(block.estDuration);
          const itemsInBlock = poolItems.filter((item) => {
            const sectionIndex = item.sectionIndex !== undefined ? item.sectionIndex : 0;
            return belongsToBlock(item, block, blockIndex);
          });
          const blockRecords = canonical
            ? currentSessionItems.flatMap(item => logsOf(item)).filter(log => log.scheduleId === block.scheduleId && (!ownerGrouping || log.assigneeId === group.id))
            : itemsInBlock.map(item => item.records?.[currentRecordType]).filter(Boolean);
          const totalBreakSecs = blockRecords.reduce((sum, record) => sum + Math.max(0, Number(record.breakMinutes) || 0) * 60, 0);
          let totalGapSecs = 0;
          const recordedItems = blockRecords.filter(record => record.recStart && record.recEnd)
            .sort((a, b) => a.recStart.localeCompare(b.recStart));
          for (let index = 0; index < recordedItems.length - 1; index++) {
            const currRec = recordedItems[index];
            const nextRec = recordedItems[index + 1];
            const toMins = (time) => {
              const [hours, minutes] = time.split(':').map(Number);
              return hours * 60 + minutes;
            };
            const endMins = toMins(currRec.recEnd);
            const startMins = toMins(nextRec.recStart);
            if (startMins >= endMins) totalGapSecs += (startMins - endMins) * 60;
          }
          let netBlockDuration = blockTotalSecs - totalBreakSecs - totalGapSecs;
          if (netBlockDuration < 0) netBlockDuration = 0;
          scheduledSecs += netBlockDuration;
        });
      }

      const trackCount = poolItems.length;
      const hasMeasuredBaseline = !ownerGrouping || ratioComparison.averageRatio !== null;
      let statusKey = 'unscheduled';

      if (trackCount > 0 && effectiveCount === 0) {
        statusKey = 'completed';
      } else if (effectiveCount > 0 && completedCount === effectiveCount) {
        statusKey = 'completed';
      } else if (hasMeasuredBaseline && scheduledSecs > 0 && scheduledSecs < totalSecs) {
        statusKey = 'insufficient';
      } else if (recordedCount > 0 || poolItems.some(item => item.workflowStatus?.[stage] === 'in-progress')) {
        statusKey = 'in-progress';
      } else if (!hasMeasuredBaseline && scheduleCount > 0) {
        statusKey = 'scheduled';
      } else if (scheduledSecs >= totalSecs && totalSecs > 0) {
        statusKey = 'full';
      }

      if (statusFilters.size > 0 && !statusFilters.has(statusKey)) return null;

      return {
        ...group,
        id: group.id,
        stage,
        assigneeId: ownerGrouping && group.id !== UNASSIGNED_ID ? group.id : '',
        isUnassigned: ownerGrouping && group.id === UNASSIGNED_ID,
        items: displayItems,
        trackCount,
        scheduleCount,
        totalDuration: formatSecs(totalSecs),
        totalSeconds: totalSecs,
        scheduledSeconds: scheduledSecs,
        completedSeconds: totalActualSec,
        statusKey,
        avgRealRatio,
        scheduleRatio,
        ratioComparison,
        recordedCount,
        isFullyScheduled: statusKey === 'full' || statusKey === 'completed',
      };
    }).filter(Boolean);

    return stats.sort((a, b) => {
      if (sortField.value === 'name') {
        return sortAsc.value
          ? a.name.localeCompare(b.name, 'zh-CN', { numeric: true })
          : b.name.localeCompare(a.name, 'zh-CN', { numeric: true });
      }
      if (sortField.value === 'status') {
        const statusWeight = {
          completed: 0,
          'in-progress': 1,
          insufficient: 2,
          full: 3,
          scheduled: 3,
          unscheduled: 4,
        };
        const weightA = statusWeight[a.statusKey] ?? 99;
        const weightB = statusWeight[b.statusKey] ?? 99;
        if (weightA !== weightB) return sortAsc.value ? weightA - weightB : weightB - weightA;
        return a.name.localeCompare(b.name, 'zh-CN');
      }
      const valueA = a.totalSeconds;
      const valueB = b.totalSeconds;
      if (valueA < valueB) return sortAsc.value ? -1 : 1;
      if (valueA > valueB) return sortAsc.value ? 1 : -1;
      return 0;
    });
  };

  const owners = (key, label) => {
    const people = [...settings.musicians];
    const ids = new Set(people.map((person) => person.id));
    itemPool.value.forEach((item) => {
      if (item[key] && !ids.has(item[key])) { people.push({ id: item[key], name: '未知' + label }); ids.add(item[key]); }
    });
    return [...people, { id: UNASSIGNED_ID, name: '待分配' + label, group: '', color: '#64748b' }];
  };
  const musicianStats = computed(() => calculateGroupStats(owners('musicianId', '演奏员'), 'musicianId'));
  const projectStats = computed(() => calculateGroupStats(owners('editorId', '剪辑员'), 'editorId'));
  const instrumentStats = computed(() => calculateGroupStats(settings.instruments, 'instrumentId'));

  const activeTaskCount = computed(() =>
    itemPool.value.filter((item) => (item.sessionId || 'S_DEFAULT') === currentSessionId.value).length,
  );

  const currentSidebarList = computed(() => {
    if (sidebarTab.value === 'project') return projectStats.value;
    if (sidebarTab.value === 'instrument') return instrumentStats.value;
    return musicianStats.value;
  });

  const expandedStatsIds = reactive(new Set());

  const toggleStatCollapse = (id) => {
    if (expandedStatsIds.has(id)) {
      expandedStatsIds.delete(id);
    } else {
      expandedStatsIds.add(id);
    }
  };

  const updateMusicianRatio = (stat) => {
    if (!stat.avgRealRatio || stat.avgRealRatio <= 0) return;

    const newRatio = parseFloat(stat.avgRealRatio);

    const musician = settings.musicians.find((item) => item.id === stat.id);
    if (musician) {
      musician.defaultRatio = newRatio;
    }

    itemPool.value.forEach((item) => {
      if (item.musicianId === stat.id) {
        item.ratio = newRatio;
        if (item.musicDuration) {
          item.estDuration = calculateEstTime(item.musicDuration, newRatio);
        }
      }
    });

    scheduledTasks.value.forEach((task) => {
      if (task.musicianId === stat.id) {
        task.ratio = newRatio;

        if (task.musicDuration) {
          task.estDuration = calculateEstTime(task.musicDuration, newRatio);
        }
      }
    });

    pushHistory();
  };

  const jumpToStatSchedule = (stat) => {
    let relatedTasks = [];
    const stage = stageFromView(sidebarTab.value);
    relatedTasks = scheduledTasks.value.filter((task) =>
      getScheduleStage(task) === stage && (getAssigneeId(task, stage) || UNASSIGNED_ID) === stat.id);

    relatedTasks = relatedTasks.filter((task) => (task.sessionId || 'S_DEFAULT') === currentSessionId.value);

    if (relatedTasks.length === 0) {
      openAlertModal('未排期', '该条目下暂时没有已安排的日程。');
      return;
    }

    relatedTasks.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA - dateB;
    });

    let currentIndex = statClickIndexMap[stat.id] || 0;
    if (currentIndex >= relatedTasks.length) currentIndex = 0;

    const targetTask = relatedTasks[currentIndex];
    statClickIndexMap[stat.id] = (currentIndex + 1) % relatedTasks.length;

    smartScrollToTask(targetTask);
  };

  const handleStatCardClick = (stat) => {
    toggleStatCollapse(stat.id);
  };

  return {
    calculateGroupStats,
    musicianStats,
    projectStats,
    instrumentStats,
    activeTaskCount,
    currentSidebarList,
    expandedStatsIds,
    toggleSort,
    getSortIcon,
    toggleCollapse,
    toggleStatCollapse,
    updateMusicianRatio,
    jumpToStatSchedule,
    handleStatCardClick,
  };
}
