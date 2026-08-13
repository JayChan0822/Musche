import { createTrackListLayout } from './track-list-layout.js';
import { createTrackListRecords } from './track-list-records.js';
import { createTrackListDragHandlers } from './track-list-drag.js';

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
    isDark,
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
    moveDivider,
    pruneEmptySchedules,
    calculateSingleRatio = () => '-',
  } = actions;

  const getViewType = () => trackListData.value.viewType || 'musician';

  const getTargetId = (item, viewType) => {
    if (viewType === 'project') return item.projectId;
    if (viewType === 'instrument') return item.instrumentId;
    return item.musicianId;
  };

  const layout = createTrackListLayout({
    trackListData,
    scheduledTasks,
    settings,
    parseTime,
    formatSecs,
    getNameById,
    openAlertModal,
    pushHistory,
    getViewType,
  });

  const records = createTrackListRecords({
    trackListData,
    itemPool,
    scheduledTasks,
    showTrackList,
    formatSecs,
    openInputModal,
    openAlertModal,
    pushHistory,
    autoUpdateEfficiency,
    checkCanDeleteSplit,
    restoreSplitTime,
    pruneEmptySchedules,
    getViewType,
    getTargetId,
    autoResizeScheduleByRecords: layout.autoResizeScheduleByRecords,
  });

  const drag = createTrackListDragHandlers({
    trackListData,
    trackListContainerRef,
    draggingSectionIndex,
    isMobile,
    isDark,
    moveDivider,
    pushHistory,
    syncTrackItemScheduleSection: records.syncTrackItemScheduleSection,
  });

  return {
    ...layout,
    ...records,
    ...drag,
    calculateSingleRatio,
  };
}
