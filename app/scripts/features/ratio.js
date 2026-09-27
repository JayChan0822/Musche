import { stageFromView, viewFromStage, getAssigneeId } from '../utils/workflow.js';
import { peekItemSplitState } from '../utils/split-state.js';
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
    const stage = stageFromView(type);
    const view = viewFromStage(stage);
    let actual = 0, music = 0;
    if (id) itemPool.value.forEach((item) => {
      const record = item.records?.[view];
      const owner = record && Object.hasOwn(record, 'assigneeId') ? record.assigneeId : getAssigneeId(item, stage);
      if (owner !== id || item.isSkipped || (item.sessionId || 'S_DEFAULT') !== currentSessionId.value) return;
      const part = peekItemSplitState(item, view);
      const duration = parseTime(record?.actualDuration);
      const content = parseTime(record?.musicDuration ?? part.musicDuration);
      if (part.active && duration > 0 && content > 0) { actual += duration; music += content; }
    });
    // Initial estimate only. Never present this fallback as observed efficiency.
    return music > 0 ? Number((actual / music).toFixed(1)) : 20;
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
    if (type === 'project') targetId = item.editorId;
    else if (type === 'instrument') targetId = item.instrumentId;
    else targetId = item.musicianId;

    return getDefaultRatio(targetId, type);
  };

  const calculateSingleRatio = (item) => {
    const type = getActiveRatioType();
    const record = item.records?.[type];
    const musicDuration = peekItemSplitState(item, type).musicDuration;
    if (!record || !record.actualDuration || !musicDuration) return '-';

    const actualSeconds = parseTime(record.actualDuration);
    const musicSeconds = parseTime(musicDuration);
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

  const autoUpdateEfficiency = (targetId, viewType) => {
    // Statistics are derived. Recording changes must not rewrite booked schedules,
    // the other stage's estimates, or a person's stored historical identity.
    if (!targetId || !viewType) return;
    return getDefaultRatio(targetId, viewType);
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
          autoUpdateEfficiency(firstId, 'musician');
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
