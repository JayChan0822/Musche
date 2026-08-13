export function registerRatioFeature(context) {
  const { refs, state, actions = {} } = context;
  const {
    trackListData,
    showTrackList,
    sidebarTab,
    itemPool,
    scheduledTasks,
    currentSessionId,
    musicianStats = { value: [] },
  } = refs;
  const { settings } = state;
  const { parseTime, formatSecs } = context.utils;
  const {
    ensureItemSplitViews = () => {},
    pushHistory = () => {},
    openConfirmModal = () => {},
    openAlertModal = () => {},
  } = actions;

  const ensureItemRecords = (item) => {
    ensureItemSplitViews(item);

    if (!item.records) {
      item.records = { musician: {}, project: {}, instrument: {} };
      if (item.actualDuration || item.recStart || item.recEnd) {
        item.records.musician = {
          recStart: item.recStart || '',
          recEnd: item.recEnd || '',
          actualDuration: item.actualDuration || '',
          breakMinutes: item.breakMinutes || 0,
        };
      }
    }
    if (!item.records.musician) item.records.musician = {};
    if (!item.records.project) item.records.project = {};
    if (!item.records.instrument) item.records.instrument = {};

    if (!item.ratios) {
      const oldRatio = item.ratio || 20;

      item.ratios = {
        musician: item.musicianId ? oldRatio : null,
        project: null,
        instrument: null,
      };
    }

    if (item.ratios.musician === undefined) item.ratios.musician = null;
    if (item.ratios.project === undefined) item.ratios.project = null;
    if (item.ratios.instrument === undefined) item.ratios.instrument = null;

    return item;
  };

  const getDefaultRatio = (id, type = 'musician') => {
    let list = [];

    if (type === 'project') list = settings.projects;
    else if (type === 'instrument') list = settings.instruments;
    else list = settings.musicians;

    if (!list || !Array.isArray(list)) return 20;

    const item = list.find((entry) => entry.id === id);
    if (item && item.defaultRatio && item.defaultRatio > 0) {
      return item.defaultRatio;
    }

    return 20;
  };

  const calculateEstTime = (duration, ratio) => formatSecs(parseTime(duration) * (ratio || 1));

  const getActiveRatioType = (contextType = null) => {
    if (contextType) return contextType;
    if (trackListData.value && showTrackList.value) {
      return trackListData.value.viewType;
    }
    return sidebarTab.value || 'musician';
  };

  const getTaskRatio = (item, contextType = null) => {
    if (!item.ratios) ensureItemRecords(item);

    const type = getActiveRatioType(contextType);
    const localRatio = item.ratios[type];
    if (localRatio && localRatio > 0) {
      return localRatio;
    }

    let targetId = null;
    if (type === 'project') targetId = item.projectId;
    else if (type === 'instrument') targetId = item.instrumentId;
    else targetId = item.musicianId;

    return getDefaultRatio(targetId, type);
  };

  const calculateSingleRatio = (item) => {
    const type = getActiveRatioType();
    const record = item.records?.[type];
    if (!record || !record.actualDuration || !item.musicDuration) return '-';

    const actualSeconds = parseTime(record.actualDuration);
    const musicSeconds = parseTime(item.musicDuration);
    if (musicSeconds === 0) return '-';

    return (actualSeconds / musicSeconds).toFixed(1);
  };

  const isDefaultRatio = (item) => {
    if (!item.ratio) return true;

    const value = Number(item.ratio);
    if (item.musicianId) {
      const musician = settings.musicians.find((entry) => entry.id === item.musicianId);
      if (musician && musician.defaultRatio) {
        return value === Number(musician.defaultRatio);
      }
    }

    return value === 20;
  };

  const autoUpdateEfficiency = (targetId, viewType, shouldPushHistory = true) => {
    if (!targetId || !viewType) return;

    let idKey = 'musicianId';
    let list = settings.musicians;
    if (viewType === 'project') {
      idKey = 'projectId';
      list = settings.projects;
    } else if (viewType === 'instrument') {
      idKey = 'instrumentId';
      list = settings.instruments;
    }

    const items = itemPool.value.filter((item) =>
      item[idKey] === targetId &&
      (item.sessionId || 'S_DEFAULT') === currentSessionId.value);

    let totalActual = 0;
    let totalMusic = 0;

    items.forEach((item) => {
      ensureItemRecords(item);
      const record = item.records[viewType];
      if (record && record.actualDuration && item.musicDuration) {
        const actualSeconds = parseTime(record.actualDuration);
        const musicSeconds = parseTime(item.musicDuration);
        if (actualSeconds > 0 && musicSeconds > 0) {
          totalActual += actualSeconds;
          totalMusic += musicSeconds;
        }
      }
    });

    let newRatio = 0;
    if (totalMusic > 0) {
      newRatio = parseFloat((totalActual / totalMusic).toFixed(1));
    }

    const settingItem = list.find((item) => item.id === targetId);
    let oldDefaultRatio = 20;

    if (settingItem) {
      oldDefaultRatio = settingItem.defaultRatio || 20;
      if (newRatio > 0) {
        settingItem.defaultRatio = newRatio;
      } else {
        newRatio = oldDefaultRatio;
      }
    } else if (newRatio === 0) {
      newRatio = 20;
    }

    const updateTask = (task) => {
      if (task[idKey] !== targetId || !task.musicDuration) return;
      if ((task.sessionId || 'S_DEFAULT') !== currentSessionId.value) return;

      ensureItemRecords(task);
      const currentDimRatio = task.ratios[viewType];
      if (!currentDimRatio || currentDimRatio == oldDefaultRatio || parseFloat(currentDimRatio) === 20) {
        task.ratios[viewType] = null;

        if (task.ratio !== newRatio) {
          task.ratio = newRatio;
          task.estDuration = calculateEstTime(task.musicDuration, newRatio);
        }
      }
    };

    itemPool.value.forEach(updateTask);
    scheduledTasks.value.forEach(updateTask);
  };

  const cleanOldRatios = () => {
    openConfirmModal(
      '清理旧倍率数据',
      '此操作将把所有倍率为 x20 (默认值) 的任务重置为“自动跟随模式”。\n\n清理后，这些任务将不再锁定倍率，而是实时跟随大卡片的平均效率计算时长。\n(手动设置的其他特殊倍率不会受影响)',
      () => {
        let count = 0;

        const processItem = (item) => {
          let changed = false;

          ensureItemRecords(item);

          ['musician', 'project', 'instrument'].forEach((type) => {
            if (parseFloat(item.ratios[type]) === 20) {
              item.ratios[type] = null;
              changed = true;
            }
          });

          if (changed) count += 1;
        };

        itemPool.value.forEach(processItem);
        scheduledTasks.value.forEach(processItem);

        pushHistory();

        if (musicianStats.value.length > 0) {
          const firstId = musicianStats.value[0].id;
          autoUpdateEfficiency(firstId, 'musician', false);
        }


        openAlertModal('清理完成', `已成功将 ${count} 个任务重置为自动跟随模式。\n现在它们会乖乖跟随大卡片的效率了！`);
      },
      false,
      '立即清理',
    );
  };

  return {
    ensureItemRecords,
    getDefaultRatio,
    calculateEstTime,
    getTaskRatio,
    calculateSingleRatio,
    isDefaultRatio,
    autoUpdateEfficiency,
    cleanOldRatios,
  };
}
