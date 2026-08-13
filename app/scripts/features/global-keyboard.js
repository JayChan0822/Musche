export function registerGlobalKeyboardFeature(context) {
  const { refs, state = {}, actions = {} } = context;
  const falseRef = () => ({ value: false });
  const nullRef = () => ({ value: null });
  const setRef = () => ({ value: new Set() });
  const listRef = () => ({ value: [] });

  const {
    showSettings = falseRef(),
    showEditor = falseRef(),
    showTrackList = falseRef(),
    showAuthModal = falseRef(),
    showCropModal = falseRef(),
    showMobileMenu = falseRef(),
    showColorPickerModal = falseRef(),
    showMobileTaskInput = falseRef(),
    showQuickAddModal = falseRef(),
    showRecInfoModal = falseRef(),
    showConfirmModal = falseRef(),
    showInputModal = falseRef(),
    showSplitModal = falseRef(),
    showCreditModal = falseRef(),
    showMidiManager = falseRef(),
    showMidiImportModal = falseRef(),
    showCsvImportModal = falseRef(),
    showProjectInfoModal = falseRef(),
    showDurationPicker = falseRef(),
    showImportModal = falseRef(),
    showProfileMenu = falseRef(),
    showGroupSuggestions = falseRef(),
    activeRecDropdown = nullRef(),
    activeMidiGroupRow = nullRef(),
    activeDropdown = nullRef(),
    settingsGroupFocus = nullRef(),
    selectedTaskId = nullRef(),
    selectedPoolIds = setRef(),
    selectedSource = nullRef(),
    isMobile = falseRef(),
    currentSessionId = nullRef(),
    currentView = nullRef(),
    sidebarTab = nullRef(),
    sortKey = nullRef(),
    activeColorKey = nullRef(),
    scheduledTasks = listRef(),
    itemPool = listRef(),
    lastPoolFocusId = nullRef(),
    lastPoolClickId = nullRef(),
  } = refs;

  const activeImportMenu = state.activeImportMenu || { rowId: null };
  const expandedGroups = state.expandedGroups || new Set();
  const expandedStatsIds = state.expandedStatsIds || new Set();

  const {
    closePicker = () => {},
    closeConfirmModal = () => {},
    closeInputModal = () => {},
    closeImportMenu = () => {},
    toggleAllProjectCollapse = () => {},
    undo = () => {},
    redo = () => {},
    switchView = () => {},
    getSwitchViewTarget = () => undefined,
    selectTask = () => {},
    moveTask = () => {},
    checkCanDeleteSplit = () => true,
    restoreSplitTime = () => true,
    cleanupEmptySchedules = () => {},
    clearSelection = () => {},
    pushHistory = () => {},
    cancelPendingTrackSave = () => {},
    isResourceCompleted = () => false,
    clearPoolRecord = () => {},
    clearAggregateRecords = () => {},
    openAlertModal = () => {},
    getActiveElement = () => document.activeElement,
    queryActiveSidebarSelection = () => (
      document.querySelector('#sidebar .border-blue-600') ||
      document.querySelector('#sidebar .ring-2')
    ),
    setTimeout: setTimeoutFn = (callback, delay) => setTimeout(callback, delay),
    getSettings = () => ({ sessions: [] }),
    getSettingsNameFocus = () => nullRef(),
    getFilteredSidebarList = () => [],
    getProjectMidiGroups = () => [],
    getMidiManagerExpandedGroups = () => new Set(),
    getGroupedItemPool = () => [],
    getMusicianStats = () => [],
  } = actions;

  const isTypingInFormControl = () => {
    const activeElement = getActiveElement();
    return ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement?.tagName);
  };

  const hasAnyModalOpen = () => (
    showSettings.value || showEditor.value || showTrackList.value ||
    showAuthModal.value || showCropModal.value || showMobileMenu.value ||
    showColorPickerModal.value || showMobileTaskInput.value ||
    showQuickAddModal.value || showRecInfoModal.value ||
    showConfirmModal.value || showInputModal.value ||
    showSplitModal.value || showCreditModal.value ||
    showMidiManager.value || showMidiImportModal.value || showCsvImportModal.value ||
    showProjectInfoModal.value
  );

  const handleEscape = (event) => {
    if (showDurationPicker.value) { closePicker(); event.preventDefault(); return true; }
    if (showColorPickerModal.value) { showColorPickerModal.value = false; event.preventDefault(); return true; }
    if (showConfirmModal.value) { closeConfirmModal(); event.preventDefault(); return true; }
    if (showInputModal.value) { closeInputModal(); event.preventDefault(); return true; }

    if (showProjectInfoModal.value) {
      showProjectInfoModal.value = false;
      return true;
    }

    if (showQuickAddModal.value) {
      if (showGroupSuggestions.value) showGroupSuggestions.value = false;
      else showQuickAddModal.value = false;
      event.preventDefault();
      return true;
    }

    if (showRecInfoModal.value) {
      if (activeRecDropdown.value) activeRecDropdown.value = null;
      else showRecInfoModal.value = false;
      event.preventDefault();
      return true;
    }

    if (showSplitModal.value) { showSplitModal.value = false; event.preventDefault(); return true; }
    if (showCreditModal.value) { showCreditModal.value = false; event.preventDefault(); return true; }
    if (showCropModal.value) { showCropModal.value = false; event.preventDefault(); return true; }
    if (showImportModal.value) { showImportModal.value = false; event.preventDefault(); return true; }

    if (showCsvImportModal.value) {
      showCsvImportModal.value = false;
      event.preventDefault();
      return true;
    }

    if (showMidiImportModal.value) {
      if (activeImportMenu.rowId) closeImportMenu();
      else showMidiImportModal.value = false;
      event.preventDefault();
      return true;
    }

    if (showMidiManager.value) {
      if (activeMidiGroupRow.value) activeMidiGroupRow.value = null;
      else showMidiManager.value = false;
      event.preventDefault();
      return true;
    }

    if (showTrackList.value) { showTrackList.value = false; event.preventDefault(); return true; }

    if (showMobileTaskInput.value) {
      if (activeDropdown.value) activeDropdown.value = null;
      else showMobileTaskInput.value = false;
      event.preventDefault();
      return true;
    }

    if (showEditor.value) {
      if (activeDropdown.value && activeDropdown.value.startsWith('edit_')) activeDropdown.value = null;
      else showEditor.value = false;
      event.preventDefault();
      return true;
    }

    if (showSettings.value) {
      const settingsNameFocus = getSettingsNameFocus();
      if (settingsNameFocus.value || settingsGroupFocus.value) {
        settingsNameFocus.value = null;
        settingsGroupFocus.value = null;
      } else {
        showSettings.value = false;
      }
      event.preventDefault();
      return true;
    }

    if (showMobileMenu.value) { showMobileMenu.value = false; event.preventDefault(); return true; }
    if (showProfileMenu.value) { showProfileMenu.value = false; event.preventDefault(); return true; }
    if (showAuthModal.value) { showAuthModal.value = false; event.preventDefault(); return true; }

    if (activeDropdown.value) { activeDropdown.value = null; event.preventDefault(); return true; }

    if (selectedTaskId.value || selectedPoolIds.value.size > 0) {
      clearSelection();
      event.preventDefault();
      return true;
    }

    return false;
  };

  const handleShiftF = (event) => {
    if (!event.shiftKey || event.key.toLowerCase() !== 'f') return false;
    if (isTypingInFormControl()) return true;

    event.preventDefault();

    if (showCsvImportModal.value) {
      toggleAllProjectCollapse();
      return true;
    }

    if (showMidiManager.value) {
      const midiGroups = getMidiManagerExpandedGroups();
      const allGroups = getProjectMidiGroups().map((group) => group.name);
      const isAllExpanded = allGroups.every((name) => midiGroups.has(name));

      if (isAllExpanded) {
        midiGroups.clear();
      } else {
        midiGroups.clear();
        allGroups.forEach((name) => midiGroups.add(name));
      }
      return true;
    }

    const allItems = getFilteredSidebarList();
    if (allItems.length > 0) {
      const isAllExpanded = allItems.every((item) => expandedStatsIds.has(item.id));
      if (isAllExpanded) {
        expandedStatsIds.clear();
      } else {
        allItems.forEach((item) => expandedStatsIds.add(item.id));
      }
    }
    return true;
  };

  const handleUndoRedo = (event) => {
    if (!(event.metaKey || event.ctrlKey)) return false;

    if (event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
      return true;
    }
    if (event.key.toLowerCase() === 'y') {
      event.preventDefault();
      redo();
      return true;
    }
    return false;
  };

  const handleTab = (event) => {
    if (event.key !== 'Tab') return false;

    event.preventDefault();
    if (event.altKey) {
      const sessions = getSettings().sessions;
      const currentIndex = sessions.findIndex((session) => session.id === currentSessionId.value);
      const nextIndex = event.shiftKey
        ? (currentIndex - 1 + sessions.length) % sessions.length
        : (currentIndex + 1) % sessions.length;
      // 只有 session 确实切换时才取消 pending 写回——单/零 session 时
      // 赋的是同一个 id（Vue 同值不触发），此时取消会白丢派生 ratio 重算。
      if (sessions.length > 0 && sessions[nextIndex].id !== currentSessionId.value) {
        cancelPendingTrackSave();
        currentSessionId.value = sessions[nextIndex].id;
      }
    } else if (event.shiftKey) {
      currentView.value = currentView.value === 'week' ? 'month' : 'week';
      switchView(getSwitchViewTarget());
    } else {
      if (sidebarTab.value === 'musician') sidebarTab.value = 'project';
      else sidebarTab.value = 'musician';
    }
    return true;
  };

  const getVisibleSidebarItemsForKeyboard = () => {
    const visibleItems = [];
    if (sidebarTab.value === 'browse') {
      getGroupedItemPool().forEach((group) => {
        if (expandedGroups.has(group.key)) visibleItems.push(...group.items);
      });
    } else {
      getMusicianStats().forEach((stat) => {
        if (expandedStatsIds.has(stat.id)) visibleItems.push(...stat.items);
      });
    }
    return visibleItems;
  };

  const handleSidebarNavigation = (event) => {
    const isArrow = event.key === 'ArrowUp' || event.key === 'ArrowDown' ||
      event.key === 'ArrowLeft' || event.key === 'ArrowRight';
    if (selectedSource.value === 'schedule' || !isArrow) return false;

    if (sidebarTab.value === 'browse' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      const keys = ['projectId', 'musicianId', 'instrumentId'];
      const currentIndex = keys.indexOf(sortKey.value);
      const newIndex = event.key === 'ArrowRight'
        ? (currentIndex + 1) % keys.length
        : (currentIndex - 1 + keys.length) % keys.length;
      sortKey.value = keys[newIndex];
      activeColorKey.value = keys[newIndex];
      return true;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const visibleItems = getVisibleSidebarItemsForKeyboard();
      if (visibleItems.length === 0) return true;

      let currentIdx = -1;
      const focusId = lastPoolFocusId.value || lastPoolClickId.value;
      if (focusId) currentIdx = visibleItems.findIndex((item) => item.id === focusId);

      const newIdx = currentIdx === -1
        ? (event.key === 'ArrowDown' ? 0 : visibleItems.length - 1)
        : (event.key === 'ArrowDown'
          ? Math.min(currentIdx + 1, visibleItems.length - 1)
          : Math.max(currentIdx - 1, 0));

      const targetItem = visibleItems[newIdx];
      if (targetItem) {
        selectTask(targetItem.id, 'pool', event);
        setTimeoutFn(() => {
          const activeEl = queryActiveSidebarSelection();
          if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 0);
      }
      return true;
    }

    return false;
  };

  const handleScheduleMove = (event) => {
    if (!selectedTaskId.value || selectedSource.value !== 'schedule') return false;

    const task = scheduledTasks.value.find((candidate) => candidate.scheduleId === selectedTaskId.value);
    if (!task) return true;

    const keyMap = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    const direction = keyMap[event.key];
    if (direction) {
      event.preventDefault();
      moveTask(task, direction);
      return true;
    }
    return false;
  };

  const deleteSelectedPoolItems = () => {
    let canDeleteAll = true;
    for (const id of selectedPoolIds.value) {
      const task = itemPool.value.find((item) => item.id === id);
      if (task && !checkCanDeleteSplit(task)) {
        canDeleteAll = false;
        break;
      }
    }
    if (!canDeleteAll) return;

    selectedPoolIds.value.forEach((id) => {
      const task = itemPool.value.find((item) => item.id === id);
      if (task) {
        const shouldRemoveTask = restoreSplitTime(task);
        if (!shouldRemoveTask) selectedPoolIds.value.delete(id);
      }
    });
    scheduledTasks.value = scheduledTasks.value.filter((task) => !selectedPoolIds.value.has(task.templateId));
    itemPool.value = itemPool.value.filter((item) => !selectedPoolIds.value.has(item.id));
    cleanupEmptySchedules();
    clearSelection();
    pushHistory();
  };

  const deleteSelectedScheduleTask = async () => {
    const taskToDelete = scheduledTasks.value.find((task) => task.scheduleId === selectedTaskId.value);

    if (taskToDelete && await isResourceCompleted(taskToDelete)) {
      return openAlertModal('无法删除', '该任务处于【完成】保护状态。');
    }

    if (!taskToDelete) return undefined;

    if (taskToDelete.templateId) await clearPoolRecord(taskToDelete.templateId);
    else await clearAggregateRecords(taskToDelete);

    scheduledTasks.value = scheduledTasks.value.filter((task) => task.scheduleId !== selectedTaskId.value);
    clearSelection();
    pushHistory();
    return undefined;
  };

  const handleDelete = (event) => {
    if (event.key !== 'Backspace' && event.key !== 'Delete') return false;

    if (selectedSource.value === 'pool' && selectedPoolIds.value.size > 0) {
      deleteSelectedPoolItems();
      return true;
    }

    if (selectedTaskId.value && selectedSource.value === 'schedule') {
      void deleteSelectedScheduleTask();
      return true;
    }

    return false;
  };

  const handleGlobalKey = (event) => {
    const isAnyModalOpen = hasAnyModalOpen();

    if (event.key === 'Escape' && handleEscape(event)) return;
    if (handleShiftF(event)) return;
    if (handleUndoRedo(event)) return;

    if (isAnyModalOpen) return;
    if (isTypingInFormControl()) return;
    if (handleTab(event)) return;
    if (handleSidebarNavigation(event)) return;
    if (handleScheduleMove(event)) return;
    handleDelete(event);
  };

  return {
    handleGlobalKey,
  };
}
