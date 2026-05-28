export function registerTaskEditorFeature(context) {
  const { refs, split, utils, actions } = context;
  const {
    itemPool,
    scheduledTasks,
    editingItem,
    editingSource,
    showEditor,
    sidebarTab,
    trackListData,
  } = refs;
  const {
    ensureItemSplitViews,
    normalizeSplitViewType,
    getSplitViewState,
    setItemSplitState,
    syncLegacySplitFields,
    rebalanceSplitFamilyDuration,
    syncFamilyLegacyFields,
    syncFamilySharedIdentity,
    syncFamilyOrchestration,
    syncFamilyTotalDuration,
    syncScheduledDurationsFromFamily,
  } = split;
  const { calculateEstTime, getDefaultRatio } = utils;
  const {
    checkCanDeleteSplit,
    restoreSplitTime,
    clearPoolRecord,
    cleanupEmptySchedules,
    openAlertModal,
    autoUpdateEfficiency,
    updateTaskNotification,
    pushHistory,
    cancelNotification,
  } = actions;

  const getEditViewType = () => normalizeSplitViewType(
    editingSource.value === 'pool'
      ? sidebarTab.value
      : ((trackListData.value && trackListData.value.viewType) || sidebarTab.value),
  );

  const estimateDurationForItem = (item, musicDuration) => calculateEstTime(
    musicDuration,
    item.ratio || getDefaultRatio(item.musicianId),
  );

  const showSplitDurationAlert = (rebalanceResult) => {
    openAlertModal(
      '超过总时长',
      `当前拆分任务的总时长固定为 ${rebalanceResult.totalMusicDuration}，不能设置得更长。`,
    );
  };

  const normalizeEditingItemBeforeSave = (editViewType) => {
    if (editingItem.value.orchestration) {
      editingItem.value.orchestration = editingItem.value.orchestration.trim();
    }

    if (!editingItem.value.ratio || editingItem.value.ratio <= 0) {
      editingItem.value.ratio = getDefaultRatio(editingItem.value.musicianId);
    }

    editingItem.value.estDuration = calculateEstTime(
      editingItem.value.musicDuration,
      editingItem.value.ratio,
    );

    setItemSplitState(editingItem.value, editViewType, {
      active: true,
      splitFromId: getSplitViewState(editingItem.value, editViewType).splitFromId,
      splitTag: editingItem.value.splitTag || '',
      musicDuration: editingItem.value.musicDuration,
      estDuration: editingItem.value.estDuration,
      sectionIndex: editingItem.value.sectionIndex || 0,
    });
    syncLegacySplitFields(editingItem.value, editViewType);
  };

  const savePoolEdit = (editViewType) => {
    const idx = itemPool.value.findIndex((item) => item.id === editingItem.value.id);
    if (idx === -1) return true;

    const previousItem = itemPool.value[idx];
    const previousSnapshot = JSON.parse(JSON.stringify(previousItem));
    const sharedIdentityChanged = (
      previousItem.projectId !== editingItem.value.projectId ||
      previousItem.instrumentId !== editingItem.value.instrumentId ||
      previousItem.musicianId !== editingItem.value.musicianId ||
      previousItem.group !== editingItem.value.group
    );
    const orchestrationChanged = previousItem.orchestration !== editingItem.value.orchestration;

    itemPool.value[idx] = editingItem.value;
    const savedItem = itemPool.value[idx];
    const rebalanceResult = rebalanceSplitFamilyDuration(
      itemPool.value,
      savedItem.id,
      editViewType,
      savedItem.id,
      editingItem.value.musicDuration,
      estimateDurationForItem,
    );

    if (!rebalanceResult.ok) {
      itemPool.value[idx] = previousSnapshot;
      showSplitDurationAlert(rebalanceResult);
      return false;
    }

    syncFamilyLegacyFields(savedItem, editViewType);
    if (sharedIdentityChanged) {
      syncFamilySharedIdentity(savedItem, {
        projectId: editingItem.value.projectId,
        instrumentId: editingItem.value.instrumentId,
        musicianId: editingItem.value.musicianId,
        group: editingItem.value.group,
      });
    }
    if (orchestrationChanged) {
      syncFamilyOrchestration(savedItem, editingItem.value.orchestration);
    }
    syncFamilyTotalDuration(itemPool.value, savedItem.id, editViewType, estimateDurationForItem);
    syncScheduledDurationsFromFamily(savedItem);

    scheduledTasks.value
      .filter((task) => task.templateId === editingItem.value.id)
      .forEach((task) => {
        task.musicDuration = editingItem.value.musicDuration;
        task.ratio = editingItem.value.ratio;
        task.estDuration = editingItem.value.estDuration;
        if (sharedIdentityChanged) {
          if (task.projectId) task.projectId = editingItem.value.projectId;
          if (task.instrumentId) task.instrumentId = editingItem.value.instrumentId;
          if (task.musicianId) task.musicianId = editingItem.value.musicianId;
        }
      });

    return true;
  };

  const saveScheduleEdit = (editViewType) => {
    const idx = scheduledTasks.value.findIndex(
      (task) => task.scheduleId === editingItem.value.scheduleId,
    );
    const previousScheduleSnapshot = idx !== -1
      ? JSON.parse(JSON.stringify(scheduledTasks.value[idx]))
      : null;

    if (idx !== -1) {
      scheduledTasks.value[idx] = editingItem.value;
    }

    if (editingItem.value.templateId) {
      const poolIdx = itemPool.value.findIndex((item) => item.id === editingItem.value.templateId);
      if (poolIdx !== -1) {
        const poolItem = itemPool.value[poolIdx];
        const previousPoolSnapshot = JSON.parse(JSON.stringify(poolItem));
        const poolState = getSplitViewState(poolItem, editViewType);

        setItemSplitState(poolItem, editViewType, {
          active: true,
          splitFromId: poolState.splitFromId,
          splitTag: poolState.splitTag || '',
          musicDuration: editingItem.value.musicDuration,
          estDuration: estimateDurationForItem(poolItem, editingItem.value.musicDuration),
          sectionIndex: poolState.sectionIndex || 0,
        });
        syncLegacySplitFields(poolItem, editViewType);

        const rebalanceResult = rebalanceSplitFamilyDuration(
          itemPool.value,
          poolItem.id,
          editViewType,
          poolItem.id,
          editingItem.value.musicDuration,
          estimateDurationForItem,
        );

        if (!rebalanceResult.ok) {
          itemPool.value[poolIdx] = previousPoolSnapshot;
          if (idx !== -1 && previousScheduleSnapshot) {
            scheduledTasks.value[idx] = previousScheduleSnapshot;
          }
          showSplitDurationAlert(rebalanceResult);
          return false;
        }

        syncFamilyLegacyFields(poolItem, editViewType);
        syncFamilyTotalDuration(itemPool.value, poolItem.id, editViewType, estimateDurationForItem);
        syncScheduledDurationsFromFamily(poolItem);
      }
    }

    if (idx !== -1) {
      updateTaskNotification(scheduledTasks.value[idx]);
    }

    return true;
  };

  const updateEditedItemEfficiency = () => {
    if (editingItem.value.musicianId) {
      autoUpdateEfficiency(editingItem.value.musicianId, 'musician', false);
    }
    if (editingItem.value.projectId) {
      autoUpdateEfficiency(editingItem.value.projectId, 'project', false);
    }
  };

  const openEditModal = (item, source) => {
    editingItem.value = JSON.parse(JSON.stringify(item));
    ensureItemSplitViews(editingItem.value);
    if (source === 'pool') {
      syncLegacySplitFields(editingItem.value, sidebarTab.value);
    }

    if (!editingItem.value.ratio || editingItem.value.ratio <= 0) {
      editingItem.value.ratio = getDefaultRatio(editingItem.value.musicianId);
    }

    editingSource.value = source;
    showEditor.value = true;
  };

  const saveEdit = () => {
    const editViewType = getEditViewType();
    normalizeEditingItemBeforeSave(editViewType);

    const didSave = editingSource.value === 'pool'
      ? savePoolEdit(editViewType)
      : saveScheduleEdit(editViewType);

    if (!didSave) return;

    showEditor.value = false;
    updateEditedItemEfficiency();
    pushHistory();
  };

  const deleteEditingItem = () => {
    if (editingSource.value !== 'pool') {
      const notifId = editingItem.value.scheduleId % 2147483647;
      cancelNotification(notifId);
    }

    if (editingSource.value === 'pool') {
      if (!checkCanDeleteSplit(editingItem.value)) return;

      const editViewType = getEditViewType();
      const isSplitChild = !!getSplitViewState(editingItem.value, editViewType).splitFromId;
      const shouldRemoveTask = isSplitChild ? restoreSplitTime(editingItem.value) : true;

      scheduledTasks.value = scheduledTasks.value.filter(
        (task) => task.templateId !== editingItem.value.id,
      );
      if (shouldRemoveTask) {
        itemPool.value = itemPool.value.filter((item) => item.id !== editingItem.value.id);
      }
      cleanupEmptySchedules();
    } else {
      if (editingItem.value.templateId) {
        clearPoolRecord(editingItem.value.templateId);
      }
      scheduledTasks.value = scheduledTasks.value.filter(
        (task) => task.scheduleId !== editingItem.value.scheduleId,
      );
    }

    showEditor.value = false;
    pushHistory();
  };

  return {
    openEditModal,
    saveEdit,
    deleteEditingItem,
  };
}
