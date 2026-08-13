import { reactive } from 'vue';

export function registerSplitTaskFeature(context) {
  const { refs, split, utils, actions } = context;
  const {
    showSplitModal,
    itemPool,
    scheduledTasks,
    trackListData,
    currentSessionId,
    showTrackList,
  } = refs;
  const {
    createHiddenSplitState,
    deactivateItemInView,
    getConnectedSplitItemIds,
    getSplitViewState,
    hasVisibleSplitStateInAnyView,
    isItemVisibleInView,
    peekSplitViewState = getSplitViewState,
    setItemSplitState,
    syncLegacySplitFields,
  } = split;
  const {
    parseTime,
    timeToMinutes,
    formatSecs,
    generateUniqueId,
    calculateEstTime,
  } = utils;
  const {
    getCurrentSplitView,
    syncItemForView,
    ensureItemRecords,
    openAlertModal,
    openInputModal,
    pushHistory,
    autoUpdateEfficiency,
    autoSortTrackList,
  } = actions;

  const splitState = reactive({
    task: null,
    totalSec: 0,
    splitPoint: 0,
    part1Str: '00:00',
    part2Str: '00:00',
  });

  const cloneObject = (value) => (value ? JSON.parse(JSON.stringify(value)) : {});
  const getOtherViewType = (viewType) => (viewType === 'project' ? 'musician' : 'project');

  const checkCanSplit = (item) => {
    const viewType = getCurrentSplitView();
    const directChild = itemPool.value.find((task) => (
      isItemVisibleInView(task, viewType) &&
      getSplitViewState(task, viewType).splitFromId === item.id
    ));

    if (directChild) {
      let lastNode = directChild;
      let safeGuard = 0;

      while (safeGuard < 100) {
        const nextChild = itemPool.value.find((task) => (
          isItemVisibleInView(task, viewType) &&
          getSplitViewState(task, viewType).splitFromId === lastNode.id
        ));
        if (nextChild) {
          lastNode = nextChild;
        } else {
          break;
        }
        safeGuard++;
      }

      const targetName = getSplitViewState(lastNode, viewType).splitTag || '最后一个部分';

      openAlertModal(
        '禁止拆分',
        `当前任务已进行过拆分（存在后续 Part），\n请寻找【${targetName}】进行拆分。`,
      );
      return false;
    }
    return true;
  };

  const checkCanDeleteSplit = (item) => {
    const viewType = getCurrentSplitView();
    const directChild = itemPool.value.find((task) => (
      isItemVisibleInView(task, viewType) &&
      getSplitViewState(task, viewType).splitFromId === item.id
    ));

    if (directChild) {
      const childName = getSplitViewState(directChild, viewType).splitTag || '后续部分';
      openAlertModal(
        '无法删除',
        `检测到后续任务 ${childName} 存在。\n\n为了保证时间计算正确，请务必按顺序先删除最后一个 Part，才能逐级归还时间。`,
      );
      return false;
    }

    return true;
  };

  const getFamilyTotalDuration = (targetItem) => {
    const viewType = getCurrentSplitView();
    const rootId = getSplitViewState(targetItem, viewType).splitFromId || targetItem.id;
    const familyMembers = itemPool.value.filter((item) => (
      isItemVisibleInView(item, viewType) &&
      (item.id === rootId || getSplitViewState(item, viewType).splitFromId === rootId)
    ));

    return familyMembers.reduce((sum, item) => (
      sum + parseTime(getSplitViewState(item, viewType).musicDuration || '00:00')
    ), 0);
  };

  const getSplitFamilyMembers = (item) => {
    const connectedIds = getConnectedSplitItemIds(itemPool.value, item.id);
    return itemPool.value.filter((member) => connectedIds.has(member.id));
  };

  const syncFamilyLegacyFields = (item, viewType) => {
    getSplitFamilyMembers(item).forEach((member) => syncLegacySplitFields(member, viewType));
  };

  const syncFamilySharedIdentity = (item, fields) => {
    const familyMembers = getSplitFamilyMembers(item);
    familyMembers.forEach((member) => {
      if (fields.projectId !== undefined) member.projectId = fields.projectId;
      if (fields.instrumentId !== undefined) member.instrumentId = fields.instrumentId;
      if (fields.musicianId !== undefined) member.musicianId = fields.musicianId;
      if (fields.group !== undefined) member.group = fields.group;
    });

    const familyIds = new Set(familyMembers.map((member) => member.id));
    scheduledTasks.value.forEach((task) => {
      if (!familyIds.has(task.templateId)) return;
      if (fields.projectId !== undefined) task.projectId = fields.projectId;
      if (fields.instrumentId !== undefined) task.instrumentId = fields.instrumentId;
      if (fields.musicianId !== undefined) task.musicianId = fields.musicianId;
    });
  };

  const syncFamilyOrchestration = (item, newOrch) => {
    getSplitFamilyMembers(item).forEach((member) => {
      if (member.orchestration !== newOrch) {
        member.orchestration = newOrch;
      }
    });
  };

  const syncScheduledDurationsFromFamily = (item) => {
    const familyMembers = getSplitFamilyMembers(item);
    const familyById = new Map(familyMembers.map((member) => [member.id, member]));

    scheduledTasks.value.forEach((task) => {
      const template = familyById.get(task.templateId);
      if (!template) return;

      const taskViewType = task.projectId ? 'project' : 'musician';
      const taskState = peekSplitViewState(template, taskViewType);

      task.musicDuration = taskState.musicDuration || template.musicDuration;
      task.estDuration = taskState.estDuration || template.estDuration;
      task.ratio = template.ratio;
    });
  };

  const updateSplitStrings = () => {
    const part1Seconds = splitState.splitPoint;
    const part2Seconds = splitState.totalSec - splitState.splitPoint;
    splitState.part1Str = formatSecs(part1Seconds);
    splitState.part2Str = formatSecs(part2Seconds);
  };

  const openSplitSlider = (item) => {
    if (!checkCanSplit(item)) return;

    const viewType = getCurrentSplitView();
    const totalMusicStr = getSplitViewState(item, viewType).musicDuration;
    if (!totalMusicStr || totalMusicStr === '00:00') {
      openAlertModal('无法拆分', '该曲目没有设置谱面时长。');
      return;
    }

    syncItemForView(item, viewType);
    splitState.task = item;
    splitState.totalSec = parseTime(totalMusicStr);
    splitState.splitPoint = Math.floor(splitState.totalSec / 2);

    updateSplitStrings();
    showSplitModal.value = true;
  };

  const onSplitSliderInput = () => {
    updateSplitStrings();
  };

  const getBaseSplitNumber = (item, viewType) => {
    let baseNum = 1;
    const itemState = getSplitViewState(item, viewType);
    if (itemState.splitTag) {
      const match = String(itemState.splitTag).match(/Part\s*(\d+)/i);
      if (match && match[1]) baseNum = parseInt(match[1], 10);
    }
    return baseNum;
  };

  const createSplitRemainderTask = (item, viewType, remainingStr, baseNum, sectionIndex = 0) => {
    const newRatio = item.ratio || 20;
    const newEst = calculateEstTime(remainingStr, newRatio);
    const newTask = {
      id: generateUniqueId('T'),
      sessionId: item.sessionId || currentSessionId.value,
      projectId: item.projectId,
      instrumentId: item.instrumentId,
      musicianId: item.musicianId,
      ratio: newRatio,
      group: item.group || '',
      recordingInfo: cloneObject(item.recordingInfo),
      editInfo: cloneObject(item.editInfo),
      orchestration: item.orchestration || '',
      roster: cloneObject(item.roster),
      // musicDuration/estDuration/sectionIndex/splitTag/splitFromId 由
      // 下方 syncLegacySplitFields 从视图态回填（顶层赋值会被覆盖，勿在此写）；
      // 注意 sectionIndex 之后还可能被 addRemainderToTrackList 二次改写。
    };

    ensureItemRecords(newTask);
    setItemSplitState(newTask, viewType, {
      active: true,
      splitFromId: item.id,
      splitTag: `Part ${baseNum + 1}`,
      musicDuration: remainingStr,
      estDuration: newEst,
      sectionIndex,
    });
    setItemSplitState(newTask, getOtherViewType(viewType), createHiddenSplitState());
    syncLegacySplitFields(newTask, viewType);

    return newTask;
  };

  const addRemainderToTrackList = (newTask, viewType) => {
    if (!showTrackList.value || !trackListData.value.schedules) return;

    const currentIdx = trackListData.value.currentSectionIndex;
    const currentSchedule = trackListData.value.schedules[currentIdx];
    const nextSchedule = trackListData.value.schedules[currentIdx + 1];

    if (nextSchedule) {
      setItemSplitState(newTask, viewType, { sectionIndex: currentIdx + 1 });
    } else if (currentSchedule) {
      const startMins = timeToMinutes(currentSchedule.startTime);
      const durMins = parseTime(currentSchedule.estDuration) / 60;
      const endMins = startMins + durMins;
      const hours = Math.floor(endMins / 60);
      const minutes = Math.floor(endMins % 60);
      const newStartStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      const scheduleEntry = {
        scheduleId: Date.now(),
        templateId: newTask.id,
        sessionId: currentSessionId.value,
        musicianId: currentSchedule.musicianId ? newTask.musicianId : '',
        projectId: currentSchedule.projectId ? newTask.projectId : '',
        instrumentId: currentSchedule.instrumentId ? newTask.instrumentId : '',
        date: currentSchedule.date,
        startTime: newStartStr,
        estDuration: newTask.estDuration,
        trackCount: 0,
        ratio: newTask.ratio,
        musicDuration: newTask.musicDuration,
      };

      scheduledTasks.value.push(scheduleEntry);
      setItemSplitState(newTask, viewType, { sectionIndex: currentIdx + 1 });
      trackListData.value.schedules.push(scheduleEntry);
      trackListData.value.totalSections++;
    } else {
      setItemSplitState(newTask, viewType, { sectionIndex: 0 });
    }

    syncLegacySplitFields(newTask, viewType);
    trackListData.value.items.push(newTask);
    autoSortTrackList();
  };

  const finishSplit = (item) => {
    pushHistory();
    if (item.musicianId) autoUpdateEfficiency(item.musicianId, 'musician');
  };

  const confirmSplitSlider = () => {
    const viewType = getCurrentSplitView();
    const item = splitState.task;
    const doneStr = splitState.part1Str;
    const remainingStr = splitState.part2Str;

    if (splitState.splitPoint <= 0 || splitState.splitPoint >= splitState.totalSec) {
      openAlertModal('无效拆分', '请拖动滑块选择一个中间的时间点。');
      return;
    }

    const baseNum = getBaseSplitNumber(item, viewType);

    setItemSplitState(item, viewType, {
      active: true,
      musicDuration: doneStr,
      estDuration: calculateEstTime(doneStr, item.ratio || 20),
      splitTag: `Part ${baseNum}`,
    });
    syncLegacySplitFields(item, viewType);

    const nextSectionIndex = showTrackList.value && trackListData.value.schedules
      ? (() => {
        const currentIdx = trackListData.value.currentSectionIndex;
        const currentSchedule = trackListData.value.schedules[currentIdx];
        const nextSchedule = trackListData.value.schedules[currentIdx + 1];

        if (nextSchedule) return currentIdx + 1;
        if (currentSchedule) return currentIdx + 1;
        return 0;
      })()
      : 0;

    const newTask = createSplitRemainderTask(
      item,
      viewType,
      remainingStr,
      baseNum,
      nextSectionIndex,
    );
    itemPool.value.push(newTask);

    addRemainderToTrackList(newTask, viewType);
    finishSplit(item);

    showSplitModal.value = false;
  };

  const splitTrack = (item) => {
    if (!checkCanSplit(item)) return;

    const viewType = getCurrentSplitView();
    const totalMusicStr = getSplitViewState(item, viewType).musicDuration;
    if (!totalMusicStr || totalMusicStr === '00:00') {
      openAlertModal('无法拆分', '该曲目没有设置谱面时长。');
      return;
    }

    openInputModal(
      '拆分任务 (留待下次)',
      '',
      '请输入 剩余 谱面时长 (例如 01:30)',
      (remainingStr) => {
        if (!/^\d{1,2}:\d{2}$/.test(remainingStr)) {
          openAlertModal('格式错误', '请输入正确的时间格式 (MM:SS)');
          return;
        }

        const totalSec = parseTime(totalMusicStr);
        const remainSec = parseTime(remainingStr);

        if (remainSec <= 0 || remainSec >= totalSec) {
          openAlertModal('数值错误', '剩余时长必须小于总时长且大于0。');
          return;
        }

        const doneSec = totalSec - remainSec;
        const doneStr = formatSecs(doneSec);
        const baseNum = getBaseSplitNumber(item, viewType);

        setItemSplitState(item, viewType, {
          active: true,
          musicDuration: doneStr,
          estDuration: calculateEstTime(doneStr, item.ratio || 20),
          splitTag: `Part ${baseNum}`,
        });
        syncLegacySplitFields(item, viewType);

        const newTask = createSplitRemainderTask(item, viewType, remainingStr, baseNum, 0);
        itemPool.value.push(newTask);

        addRemainderToTrackList(newTask, viewType);
        finishSplit(item);
      },
      `总长 ${totalMusicStr}。`,
    );
  };

  const restoreSplitTime = (taskInput) => {
    const viewType = getCurrentSplitView();
    const taskToDelete = itemPool.value.find((item) => item.id === taskInput.id);

    if (!taskToDelete || !getSplitViewState(taskToDelete, viewType).splitFromId) return false;

    const parent = itemPool.value.find(
      (item) => item.id === getSplitViewState(taskToDelete, viewType).splitFromId,
    );
    if (!parent) return false;

    const parentState = getSplitViewState(parent, viewType);
    const childState = getSplitViewState(taskToDelete, viewType);
    const parentSec = parseTime(parentState.musicDuration);
    const childSec = parseTime(childState.musicDuration);

    if (parentSec > 0 && childSec > 0) {
      const newTotal = formatSecs(parentSec + childSec);
      setItemSplitState(parent, viewType, {
        musicDuration: newTotal,
        estDuration: calculateEstTime(newTotal, parent.ratio || 20),
      });
      syncLegacySplitFields(parent, viewType);

      const orphans = itemPool.value.filter((item) => (
        isItemVisibleInView(item, viewType) &&
        getSplitViewState(item, viewType).splitFromId === taskToDelete.id
      ));
      if (orphans.length > 0) {
        orphans.forEach((orphan) => {
          setItemSplitState(orphan, viewType, { splitFromId: parent.id });
          syncLegacySplitFields(orphan, viewType);
        });
      }

      const isParentAlsoChild = !!getSplitViewState(parent, viewType).splitFromId;

      if (isParentAlsoChild) {
        openAlertModal(
          '时间已归还',
          `当前任务已逐级合并回上一层 (${getSplitViewState(parent, viewType).splitTag})。`,
        );
      } else {
        const hasChildren = itemPool.value.some((item) =>
          item.id !== taskToDelete.id &&
          isItemVisibleInView(item, viewType) &&
          getSplitViewState(item, viewType).splitFromId === parent.id,
        );

        if (!hasChildren) {
          setItemSplitState(parent, viewType, { splitTag: '' });
          syncLegacySplitFields(parent, viewType);
          openAlertModal(
            '合并完成',
            `拆分任务已全部合并回原任务。\n现有时长: ${newTotal}`,
          );
        } else {
          openAlertModal(
            '时间已归还',
            '时间已合并回 Part 1。\n(标签保留，因为仍有后续部分存在)',
          );
        }
      }

      deactivateItemInView(taskToDelete, viewType);
      if (hasVisibleSplitStateInAnyView(taskToDelete)) {
        syncLegacySplitFields(taskToDelete, getOtherViewType(viewType));
        return false;
      }
      return true;
    }
    return false;
  };

  return {
    splitState,
    checkCanSplit,
    checkCanDeleteSplit,
    getFamilyTotalDuration,
    getSplitFamilyMembers,
    syncFamilyLegacyFields,
    syncFamilySharedIdentity,
    syncFamilyOrchestration,
    syncScheduledDurationsFromFamily,
    openSplitSlider,
    onSplitSliderInput,
    updateSplitStrings,
    confirmSplitSlider,
    splitTrack,
    restoreSplitTime,
  };
}
