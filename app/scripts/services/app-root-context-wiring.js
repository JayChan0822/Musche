// 最终模板上下文装配：把组合根发布到 assembly.refs / assembly.helpers 的别名
// 装配成 appRootShell / appRootOverlaysShell 两个根 ctx。
// 在 setup 末尾同步调用，此时全部 feature 已注册、helpers 均已发布完毕，
// 顶部解构没有注册顺序问题（registrar 的「禁止顶部解构」规约针对装配中途的跨 feature 引用）。
export function createAppRootContexts({ assembly, factories }) {
    const {
        createRootAccountModalsShellState, createRootAuthModalShellState, createRootColorPickerModalShellState, createRootConfirmModalShellState, createRootCreditModalShellState, createRootCropModalShellState,
        createRootCsvImportModalShellState, createRootDurationPickerModalShellState, createRootEditModalShellState, createRootExportCreditModalsShellState, createRootExportModalShellState, createRootHeaderShellState,
        createRootImportModalShellState, createRootInputModalShellState, createRootMainContentShellState, createRootMetadataInfoModalsShellState, createRootMidiCsvImportModalsShellState, createRootMidiImportModalShellState,
        createRootMidiManagerModalShellState, createRootMobileControlsShellState, createRootMobileTaskInputShellState, createRootPickerModalsShellState, createRootProjectInfoModalShellState, createRootQuickAddModalShellState,
        createRootRecInfoModalShellState, createRootSettingsModalShellState, createRootShellState, createRootSidebarShellState, createRootSplitModalShellState, createRootStandaloneOverlaysShellState,
        createRootTaskActionModalsShellState, createRootTrackListModalShellState, createRootUniversalModalsShellState, createRootUtilityModalsShellState,
    } = factories;
    const store = assembly.refs;
    const { settings } = assembly.state;
    const { formatUtils } = assembly.utils;
    const {
        activeDropdown, activeRecDropdown, authForm, authLoading, authPasswordRef, availableInstrumentGroups,
        confirmModalConfig, cropImgRef, cropImgSrc, currentSessionId, currentView, currentWeekDays,
        dayColWidth, draggingSectionIndex, dragState, editingItem, editingSource, expandedStatsIds,
        exportFilter, filteredSidebarList, flashingTaskId, generatedCreditText, globalSearchQuery, history,
        historyIndex, inputModalConfig, instrumentStats, isMobile, isSearchFocused, isSidebarOpen,
        isSyncing, isZooming, managingProject, midiManagerExpandedGroups, mobileTab, monthViewMode,
        musicianStats, newItem, newRecInputs, newSettingsItem, projectInfoForm, projectMidiGroups,
        projectStats, quickAddForm, quickAddType, recDropdownSearch, recInfoForm, saveStatus,
        selectedPoolIds, selectedTaskId, settingsExpandedGroups, settingsGroupFocus, settingsNameFocus, showAuthModal,
        showColorPickerModal, showConfirmModal, showCreditModal, showCropModal, showCsvImportModal, showEditor,
        showExportModal, showGroupSuggestions, showImportModal, showInputModal, showMetadataManager, showMidiImportModal,
        showMidiManager, showMobileMenu, showMobileTaskInput, showProfileMenu, showProjectInfoModal, showQuickAddModal,
        showRecInfoModal, showSettings, showSplitModal, showTrackList, sidebarScrollRef, sidebarTab,
        sidebarWidth, slotHeight, sortField, tempNickname, themeMode, trackListContainerRef,
        trackListData, universalInputRef, user, viewDate, weekContainer, weekGridWrapper,
    } = assembly.refs;
    const {
        activeOrchPresets, activeTaskCount, addItemToPool, addPercPlayer, allSettingsGrouped, assignTagsToPlayer,
        autoDistributeSections, autoUpdateEfficiency, calcTrackDiff, calculateSingleRatio, cancelCrop, changeDate,
        clearProjectMidi, clearSelection, clearTrackTime, closeConfirmModal, closeImportMenu, closeInputModal,
        closePicker, confirmCrop, confirmCsvImport, confirmDurationPicker, confirmInputModal, confirmMidiImport,
        confirmQuickAdd, confirmSplitSlider, currentDateLabel, currentMidiDisplayList, currentMonthDays, currentQuickAddGroups,
        currentSessionName, cycleDayWidth, dataIoHandlers, dateTransitionName, deleteCurrentSchedule, deleteEditingItem,
        deleteTrackFromList, dragEnterPool, dragEnterSlot, dragLeavePool, dragLeaveSlot, dragStart,
        dropToMonth, dropToPool, dropToSchedule, dropdownExpandedGroups, dropdownSearch, exportDateRange,
        exportPreviewCount, exportSessionOptions, factoryReset, filteredExportInstruments, filteredExportMusicians, filteredExportProjects,
        filteredImportOptions, filteredMidiGroups, filteredOptions, filteredRecOptions, flatScrolledDays, getBlockTitle,
        getExistingGroups, getFloatingStyle, getGroupColor, getGroupedOptions, getNameById, getOverlapCount,
        getRosterName, getSmartName, getSortIcon, getTaskRatio, getTaskStyle, getThemeLabel,
        getUngroupedItems, groupedCsvData, handleCSVImport, handleConfirmAction, handleDragEnd, handleHeaderDoubleTap,
        handleInfiniteScroll, handleLogin, handleLogout, handleManualSync, handleMidiFile, handleMonthCellDoubleTap,
        handleRegister, handleResetPwd, handleSearchBlur, handleSearchEnter, handleSessionAction, handleStatCardClick,
        handleTaskDblClick, handleTrackListSearchAction, handleUserBtnClick, hasRecordingInfo, initResize, isAllGroupsExpanded,
        isGroupSelected, isMouseViewDrag, isPercussionGroup, isPercussionMode, isStringGroup, isTaskGhost,
        isToday, jumpToStatSchedule, jumpToToday, metadataModalHandlers, midiGroupData, midiGroupExpanded,
        mobileTouchHandlers, onAfterLeave, onBeforeLeave, onDragStart, onFileSelect, onMainMouseDown,
        onMainMouseUp, onMainTouchEnd, onMainTouchStart, onMainWheel, onScroll, onSearchFocus,
        onSettingsScroll, onSidebarTouchEnd, onSidebarTouchStart, onSplitSliderInput, openColorPicker,
        openDurationPicker, openEditModal, openImportMenu, openMidiGroupDropdown, openMidiManager, openQuickAdd,
        openSplitSlider, parsedRoster, percState, presetColors, pushHistory, redo,
        refreshCsvStatus, removeMidiMapping, removePercPlayer, resetColorPicker, resetDuration, saveColorPicker,
        saveEdit, scanPercussionTags, selectImportGroup, selectImportInst, selectImportNewInst, selectOption,
        selectTask, setMonthRef, setTrackBreak, setTrackNow, settingsHandlers, showOrchestrationField,
        sidebarTransitionName, sortTrackList, splitState, startDividerDrag, startTour, startTrackDrag,
        switchSession, switchSidebarTab, switchToWeek, switchView, tasksByDateMap, tempColor,
        timeSlots, toggleAllGroups, toggleAllRows, toggleDropdown, toggleDropdownGroup, toggleGroupSelection,
        toggleMidiGroupExpand, toggleMidiManagerGroup, toggleMobileMenu, togglePercTagSelect, toggleProjectCollapse, toggleSettingsGroup,
        toggleSidebar, toggleSort, toggleTheme, triggerCSV, triggerMidiImportForProject, undo,
        updateInputRect, updateInstrumentGroup, updateMidiDuration, updateNickname, updatePercOrchestration, updateRosterName,
        userAvatar, userDisplayName, viewTransitionName, widthIcon,
    } = assembly.helpers;

        const appSidebar = createRootSidebarShellState({
            refs: {
                isMobile,
                mobileTab,
                isSidebarOpen,
                sidebarWidth,
                showMobileTaskInput,
                sidebarTab,
                activeTaskCount,
                musicianStats,
                projectStats,
                instrumentStats,
                sidebarScrollRef,
                sidebarTransitionName,
                sortField,
                filteredSidebarList,
                selectedPoolIds,
            },
            state: {
                dragState,
                expandedStatsIds,
            },
            actions: {
                dragEnterPool,
                dragLeavePool,
                dropToPool,
                clearSelection,
                onSidebarTouchStart,
                onSidebarTouchEnd,
                switchSidebarTab,
                toggleSort,
                getSortIcon,
                dragStart,
                handleStatCardClick,
                handlePoolTouchStart: mobileTouchHandlers.handlePoolTouchStart,
                handleTouchMove: mobileTouchHandlers.handleTouchMove,
                handleTouchEnd: mobileTouchHandlers.handleTouchEnd,
                jumpToStatSchedule,
                autoUpdateEfficiency,
                selectTask,
                openEditModal,
                getGroupColor,
                getNameById,
                calculateSingleRatio,
                getTaskRatio,
            },
            utils: {
                formatSecs: formatUtils.formatSecs,
            },
        });

        const appMainContent = createRootMainContentShellState({
            refs: {
                isMobile,
                mobileTab,
                isSidebarOpen,
                currentDateLabel,
                viewDate,
                currentView,
                widthIcon,
                viewTransitionName,
                dayColWidth,
                isZooming,
                weekContainer,
                slotHeight,
                weekGridWrapper,
                dateTransitionName,
                currentWeekDays,
                timeSlots,
                tasksByDateMap,
                selectedTaskId,
                flashingTaskId,
                monthViewMode,
                currentMonthDays,
                flatScrolledDays,
            },
            state: {
                settings,
                isMouseViewDrag,
            },
            actions: {
                handleInfiniteScroll,
                onMainTouchStart,
                onMainTouchEnd,
                onMainMouseDown,
                onMainMouseUp,
                onMainWheel,
                toggleSidebar,
                changeDate,
                jumpToToday,
                isToday,
                switchView,
                cycleDayWidth,
                clearSelection,
                onBeforeLeave,
                onAfterLeave,
                handleHeaderDoubleTap,
                dragEnterSlot,
                dragLeaveSlot,
                dropToSchedule,
                dragStart,
                handleDragEnd,
                handleTouchStart: mobileTouchHandlers.handleTouchStart,
                handleTouchMove: mobileTouchHandlers.handleTouchMove,
                handleTouchEnd: mobileTouchHandlers.handleTouchEnd,
                handleTaskDblClick,
                getOverlapCount,
                isTaskGhost,
                getTaskStyle,
                selectTask,
                getBlockTitle,
                initResize,
                hasRecordingInfo,
                initMobileResize: mobileTouchHandlers.initMobileResize,
                switchToWeek,
                handleMonthCellDoubleTap,
                dropToMonth,
                setMonthRef,
            },
            utils: {
                formatDate: formatUtils.formatDate,
            },
        });

        const appSettingsModal = createRootSettingsModalShellState({
            refs: {
                showSettings,
                settingsNameFocus,
                settingsGroupFocus,
                showMetadataManager,
            },
            state: {
                settings,
                settingsExpandedGroups,
                newSettingsItem,
                newRecInputs,
            },
            computedState: {
                allSettingsGrouped,
            },
            actions: {
                pushHistory,
                onSettingsScroll,
                toggleAllGroups,
                isAllGroupsExpanded,
                clearSettingsList: settingsHandlers.clearSettingsList,
                onSettingsDragOver: settingsHandlers.onSettingsDragOver,
                onSettingsDragLeave: settingsHandlers.onSettingsDragLeave,
                onSettingsDrop: settingsHandlers.onSettingsDrop,
                toggleSettingsGroup,
                renameGroup: settingsHandlers.renameGroup,
                onSettingsItemDragStart: settingsHandlers.onSettingsItemDragStart,
                onSettingsItemDragEnd: settingsHandlers.onSettingsItemDragEnd,
                openMidiManager,
                openColorPicker,
                handleItemRename: settingsHandlers.handleItemRename,
                disableRowDrag: settingsHandlers.disableRowDrag,
                enableRowDrag: settingsHandlers.enableRowDrag,
                openProjectInfoModal: metadataModalHandlers.openProjectInfoModal,
                removeSettingsItem: settingsHandlers.removeSettingsItem,
                updateInputRect,
                getFloatingStyle,
                getUngroupedItems,
                getExistingGroups,
                addSettingsItem: settingsHandlers.addSettingsItem,
                handleRecRename: metadataModalHandlers.handleRecRename,
                removeRecItem: metadataModalHandlers.removeRecItem,
                addRecItem: metadataModalHandlers.addRecItem,
                triggerCSV,
                handleCSVImport,
                factoryReset,
            },
        });

        const appMobileControls = createRootMobileControlsShellState({
            refs: {
                isMobile,
                globalSearchQuery,
                isSearchFocused,
                mobileTab,
                showMobileTaskInput,
            },
            actions: {
                onSearchFocus,
                handleSearchBlur,
                handleSearchEnter,
            },
        });

        const appMobileTaskInput = createRootMobileTaskInputShellState({
            refs: {
                showMobileTaskInput,
                activeDropdown,
                dropdownSearch,
                isMobile,
            },
            state: {
                newItem,
                dropdownExpandedGroups,
            },
            computedState: {
                filteredOptions,
            },
            actions: {
                getGroupColor,
                getNameById,
                getGroupedOptions,
                toggleDropdown,
                toggleDropdownGroup,
                selectOption,
                openQuickAdd,
                openDurationPicker,
                addItemToPool,
            },
        });

        const appExportModal = createRootExportModalShellState({
            refs: {
                showExportModal,
            },
            state: {
                exportFilter,
            },
            computedState: {
                exportSessionOptions,
                filteredExportProjects,
                filteredExportMusicians,
                filteredExportInstruments,
                exportDateRange,
                exportPreviewCount,
            },
            actions: {
                toggleFilterItem: dataIoHandlers.toggleFilterItem,
                toggleFilterAll: dataIoHandlers.toggleFilterAll,
                confirmExport: dataIoHandlers.confirmExport,
            },
        });

        const appCreditModal = createRootCreditModalShellState({
            refs: {
                showCreditModal,
                generatedCreditText,
                managingProject,
            },
            midiRefs: {
                midiBpm: store.midiBpm,
                midiTimeSig: store.midiTimeSig,
            },
            actions: {
                copyCreditText: metadataModalHandlers.copyCreditText,
            },
        });

        const appExportCreditModalsShell = createRootExportCreditModalsShellState({
            appExportModal,
            appCreditModal,
        });

        const appMidiManagerModal = createRootMidiManagerModalShellState({
            refs: {
                showMidiManager,
                managingProject,
                activeMidiGroupRow: store.activeMidiGroupRow,
                midiGroupSearchQuery: store.midiGroupSearchQuery,
            },
            state: {
                midiManagerExpandedGroups,
                midiGroupPos: store.midiGroupPos,
                settings,
            },
            computedState: {
                projectMidiGroups,
                filteredMidiGroups,
            },
            actions: {
                triggerMidiImportForProject,
                clearProjectMidi,
                toggleMidiManagerGroup,
                openMidiGroupDropdown,
                updateMidiDuration,
                removeMidiMapping,
                updateInstrumentGroup,
            },
        });

        const appMidiImportModal = createRootMidiImportModalShellState({
            refs: {
                showMidiImportModal,
                midiBpm: store.midiBpm,
                managingProject,
                midiViewMode: store.midiViewMode,
                midiImportData: store.midiImportData,
                importSearchQuery: store.importSearchQuery,
            },
            state: {
                midiGroupExpanded,
                activeImportMenu: store.activeImportMenu,
                importMenuPos: store.importMenuPos,
            },
            computedState: {
                midiGroupData,
                availableInstrumentGroups,
                filteredImportOptions,
                currentMidiDisplayList,
            },
            actions: {
                getNameById,
                getSmartName,
                openImportMenu,
                closeImportMenu,
                toggleGroupSelection,
                toggleMidiGroupExpand,
                confirmMidiImport,
                selectImportNewInst,
                selectImportInst,
                selectImportGroup,
            },
            utils: {
                formatSecs: formatUtils.formatSecs,
            },
        });

        const appCsvImportModal = createRootCsvImportModalShellState({
            refs: {
                showCsvImportModal,
                activeImportTab: store.activeImportTab,
                csvSearchQuery: store.csvSearchQuery,
                csvImportData: store.csvImportData,
                groupedCsvData,
            },
            state: {
                csvImportConfig: store.csvImportConfig,
                collapsedProjects: store.collapsedProjects,
            },
            actions: {
                refreshCsvStatus,
                toggleAllRows,
                toggleProjectCollapse,
                isGroupSelected,
                toggleGroupSelection,
                confirmCsvImport,
            },
        });

        const appMidiCsvImportModalsShell = createRootMidiCsvImportModalsShellState({
            appMidiManagerModal,
            appMidiImportModal,
            appCsvImportModal,
        });

        const appProjectInfoModal = createRootProjectInfoModalShellState({
            refs: {
                showProjectInfoModal,
            },
            state: {
                projectInfoForm,
            },
            actions: {
                saveProjectInfo: metadataModalHandlers.saveProjectInfo,
            },
        });

        const appEditModal = createRootEditModalShellState({
            refs: {
                showEditor,
                editingItem,
                editingSource,
                activeDropdown,
                dropdownSearch,
                isMobile,
            },
            state: {
                dropdownExpandedGroups,
                percState,
            },
            computed: {
                filteredOptions,
                showOrchestrationField,
                parsedRoster,
                activeOrchPresets,
                isPercussionMode,
                timeSlots,
            },
            actions: {
                toggleDropdown,
                getNameById,
                getGroupedOptions,
                toggleDropdownGroup,
                selectOption,
                openDurationPicker,
                getRosterName,
                updateRosterName,
                scanPercussionTags,
                addPercPlayer,
                removePercPlayer,
                togglePercTagSelect,
                assignTagsToPlayer,
                updatePercOrchestration,
                deleteEditingItem,
                saveEdit,
                pushHistory,
            },
        });

        const appAuthModal = createRootAuthModalShellState({
            refs: {
                showAuthModal,
                authLoading,
                authPasswordRef,
            },
            state: {
                authForm,
            },
            actions: {
                handleLogin,
                handleRegister,
                handleResetPwd,
            },
        });

        const appCropModal = createRootCropModalShellState({
            refs: {
                showCropModal,
                cropImgSrc,
                cropImgRef,
                authLoading,
            },
            actions: {
                cancelCrop,
                confirmCrop,
            },
        });

        const appAccountModalsShell = createRootAccountModalsShellState({
            appAuthModal,
            appCropModal,
        });

        const appTrackListModal = createRootTrackListModalShellState({
            refs: {
                showTrackList,
                trackListData,
                trackListSearchQuery: store.trackListSearchQuery,
                trackListContainerRef,
                draggingSectionIndex,
                sidebarTab,
            },
            actions: {
                openRecInfoModal: metadataModalHandlers.openRecInfoModal,
                handleTrackListSearchAction,
                autoDistributeSections,
                sortTrackList,
                startDividerDrag,
                startTrackDrag,
                deleteTrackFromList,
                openSplitSlider,
                getGroupColor,
                getNameById,
                isPercussionGroup,
                isStringGroup,
                pushHistory,
                calcTrackDiff,
                setTrackNow,
                setTrackBreak,
                clearTrackTime,
                calculateSingleRatio,
                deleteCurrentSchedule,
            },
        });

        const appStandaloneOverlaysShell = createRootStandaloneOverlaysShellState({
            appSettingsModal,
            appTrackListModal,
            appMobileTaskInput,
        });

        const appQuickAddModal = createRootQuickAddModalShellState({
            refs: {
                showQuickAddModal,
                quickAddType,
                showGroupSuggestions,
            },
            state: {
                quickAddForm,
                currentQuickAddGroups,
            },
            actions: {
                confirmQuickAdd,
            },
        });

        const appImportModal = createRootImportModalShellState({
            refs: {
                showImportModal,
            },
            actions: {
                triggerFileSelect: dataIoHandlers.triggerFileSelect,
            },
        });

        const appUtilityModalsShell = createRootUtilityModalsShellState({
            appQuickAddModal,
            appImportModal,
        });

        const appRecInfoModal = createRootRecInfoModalShellState({
            refs: {
                showRecInfoModal,
                sidebarTab,
                activeRecDropdown,
                recDropdownSearch,
            },
            state: {
                recInfoForm,
                filteredRecOptions,
            },
            actions: {
                selectRecOption: metadataModalHandlers.selectRecOption,
                createRecOption: metadataModalHandlers.createRecOption,
                saveRecInfo: metadataModalHandlers.saveRecInfo,
            },
        });

        const appMetadataInfoModalsShell = createRootMetadataInfoModalsShellState({
            appProjectInfoModal,
            appRecInfoModal,
        });

        const appColorPickerModal = createRootColorPickerModalShellState({
            refs: {
                showColorPickerModal,
                tempColor,
            },
            state: {
                presetColors,
            },
            actions: {
                resetColorPicker,
                saveColorPicker,
            },
        });

        const appDurationPicker = createRootDurationPickerModalShellState({
            refs: {
                showDurationPicker: store.showDurationPicker,
                pickerMinRef: store.pickerMinRef,
                pickerSecRef: store.pickerSecRef,
            },
            state: {
                pickerPos: store.pickerPos,
                tempDuration: store.tempDuration,
            },
            actions: {
                closePicker,
                onScroll,
                onDragStart,
                resetDuration,
                confirmDurationPicker,
            },
        });

        const appPickerModalsShell = createRootPickerModalsShellState({
            appColorPickerModal,
            appDurationPicker,
        });

        const appSplitModal = createRootSplitModalShellState({
            refs: {
                showSplitModal,
            },
            state: {
                splitState,
            },
            actions: {
                onSplitSliderInput,
                confirmSplitSlider,
            },
        });

        const appTaskActionModalsShell = createRootTaskActionModalsShellState({
            appEditModal,
            appSplitModal,
        });

        const openSettings = () => {
            showSettings.value = true;
            showMobileMenu.value = false;
        };

        const appInputModal = createRootInputModalShellState({
            refs: {
                showInputModal,
                inputModalConfig,
                universalInputRef,
            },
            actions: {
                closeInputModal,
                confirmInputModal,
            },
        });

        const appConfirmModal = createRootConfirmModalShellState({
            refs: {
                showConfirmModal,
                confirmModalConfig,
            },
            actions: {
                closeConfirmModal,
                handleConfirmAction,
            },
        });

        const appUniversalModalsShell = createRootUniversalModalsShellState({
            appInputModal,
            appConfirmModal,
        });

        const appHeader = createRootHeaderShellState({
            refs: {
                showMobileMenu,
                themeMode,
                isSyncing,
                user,
                saveStatus,
                historyIndex,
                history,
                activeDropdown,
                currentSessionId,
                globalSearchQuery,
                userAvatar,
                showProfileMenu,
                tempNickname,
                authLoading,
            },
            state: {
                settings,
            },
            computedState: {
                getThemeLabel,
                currentSessionName,
                userDisplayName,
            },
            actions: {
                openSettings,
                toggleMobileMenu,
                toggleTheme,
                exportCSV: dataIoHandlers.exportCSV,
                exportToICS: dataIoHandlers.exportToICS,
                exportJSON: dataIoHandlers.exportJSON,
                importJSON: dataIoHandlers.importJSON,
                openCreditModal: metadataModalHandlers.openCreditModal,
                handleManualSync,
                undo,
                redo,
                toggleDropdown,
                switchSession,
                handleSessionAction,
                handleSearchEnter,
                handleUserBtnClick,
                updateNickname,
                onFileSelect,
                handleLogout,
                startTour,
                handleJSONFile: dataIoHandlers.handleJSONFile,
                handleMidiFile,
            },
        });

        const { appRootShell, appRootOverlaysShell } = createRootShellState({
            appHeader,
            appSidebar,
            appMainContent,
            appMobileControls,
            appStandaloneOverlaysShell,
            appTaskActionModalsShell,
            appAccountModalsShell,
            appUtilityModalsShell,
            appUniversalModalsShell,
            appPickerModalsShell,
            appExportCreditModalsShell,
            appMidiCsvImportModalsShell,
            appMetadataInfoModalsShell,
        });

    return { appRootShell, appRootOverlaysShell };
}
