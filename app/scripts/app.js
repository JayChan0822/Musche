import { createAppDependencies } from './services/app-dependencies.js';
    const {
        createApp,
        computed,
        onMounted,
        onUnmounted,
        watch,
        nextTick,
        timeUtils,
        formatUtils,
        idUtils,
        splitStateUtils,
        storageService,
        supabaseService,
        wireImportDataFeature,
        wireDesktopResizeFeature,
        wireScheduleDeletionFeature,
        wireAvatarCropFeature,
        wireDataIoFeature,
        wireMetadataModalsFeature,
        wireTourFeature,
        wireMidiManagerFeature,
        wireTaskEditorFeature,
        wireMobileTouchFeature,
        wireTrackListFeature,
        wireSettingsFeature,
        wireAppRuntimeFeature,
        wireGlobalKeyboardFeature,
        wireSessionFeature,
        wireHistoryFeature,
        wireRatioFeature,
        wireNameLookupFeature,
        wireSplitViewFeature,
        wireDropdownsFeature,
        wireViewNavigationFeature,
        wireQuickAddFeature,
        wireUniversalModalFeature,
        wireOrchestrationFeature,
        wireSplitTaskFeature,
        wirePickerControlsFeature,
        wirePoolInteractionsFeature,
        wireSearchFeature,
        wireSidebarStatsFeature,
        wireSidebarFeature,
        wireMobileUiFeature,
        wireScheduleFeature,
        wireScheduleInteractionsFeature,
        wireAuthFeature,
        wireSettingsSyncFeature,
        createMuscheStore,
        createRootAppState,
        createRootSettingsState,
        createRootShellState,
        createRootHeaderShellState,
        createRootSidebarShellState,
        createRootMainContentShellState,
        createRootDataIoState,
        createRootImportDataState,
        createRootTrackListState,
        createRootMidiManagerState,
        createRootMidiManagerModalShellState,
        createRootMidiImportModalShellState,
        createRootSettingsModalShellState,
        createRootMetadataModalState,
        createRootMobileControlsShellState,
        createRootMobileTaskInputShellState,
        createRootStandaloneOverlaysShellState,
        createRootTrackListModalShellState,
        createRootExportModalShellState,
        createRootExportCreditModalsShellState,
        createRootMidiCsvImportModalsShellState,
        createRootCsvImportModalShellState,
        createRootCreditModalShellState,
        createRootProjectInfoModalShellState,
        createRootRecInfoModalShellState,
        createRootMetadataInfoModalsShellState,
        createRootEditModalShellState,
        createRootAccountModalsShellState,
        createRootAuthModalShellState,
        createRootCropModalShellState,
        createRootUtilityModalsShellState,
        createRootImportModalShellState,
        createRootQuickAddModalShellState,
        createRootConfirmModalShellState,
        createRootInputModalShellState,
        createRootSplitModalShellState,
        createRootColorPickerModalShellState,
        createRootDurationPickerModalShellState,
        createRootPickerModalsShellState,
        createRootTaskActionModalsShellState,
        createRootUniversalModalsShellState,
        createAppRootOptions,
        createAppAssembly,
        createAppRootContexts,
    } = createAppDependencies();
    createApp({
        ...createAppRootOptions(),
        setup() {
            let scheduleFeature;
            let settingsFeature;
            let authFeature;
            let mobileUiFeature;
            let searchFeature;
            let trackListFeature;
            let splitTaskFeature;
            let midiManagerFeature;
            let orchestrationFeature;
            let universalModalFeature;
            let quickAddFeature;
            let historyFeature;
            let scheduleDeletionFeature;
            let sessionFeature;
            let ratioFeature;
            let nameLookupFeature;
            let splitViewFeature;
            const store = createMuscheStore(storageService);
            const { currentSessionId, history } = store;
            const {
                sidebarTab,
                isMobile,
                mobileTab,
                newItem,
                sortField,
                sortAsc,
                authPasswordRef,
                initialTouchCoords,
                draggingTaskElement,
                isSyncing,
                isContextSwitching,
                isZooming,
                weekGridWrapper,
                onBeforeLeave,
                onAfterLeave,
                dragState,
            } = createRootAppState();
            // 装配上下文：feature 接线适配器从这里取 refs/state/helpers（见 services/app-assembly.js）
            const assembly = createAppAssembly({
                vue: { computed, watch, nextTick, onMounted, onUnmounted },
                utils: { timeUtils, formatUtils, idUtils, splitStateUtils },
                services: { storageService, supabaseService },
            });
            Object.assign(assembly.refs, store, {
                sidebarTab, isMobile, mobileTab, newItem, sortField, sortAsc,
                authPasswordRef, initialTouchCoords, draggingTaskElement,
                isSyncing, isContextSwitching, isZooming, weekGridWrapper, dragState,
            });
            Object.assign(assembly.helpers, { onBeforeLeave, onAfterLeave });
            splitViewFeature = wireSplitViewFeature(assembly);
            assembly.features.splitView = splitViewFeature;
            const {
                importDataFeatureRef,
                groupedCsvData,
                isAllSelected,
                availableInstrumentGroups,
                midiGroupData,
                currentMidiDisplayList,
                filteredImportOptions,
                midiGroupExpanded,
            } = createRootImportDataState();
            assembly.refs.availableInstrumentGroups = availableInstrumentGroups;
            Object.assign(assembly.helpers, { groupedCsvData, midiGroupData, currentMidiDisplayList, filteredImportOptions, midiGroupExpanded });
            let importDataFeature;

            const {
                midiManagerFeatureRef,
                midiManagerExpandedGroups,
                projectMidiGroups,
                projectMidiList,
                filteredMidiGroups,
            } = createRootMidiManagerState();
            Object.assign(assembly.refs, { midiManagerExpandedGroups, projectMidiGroups });
            Object.assign(assembly.helpers, { filteredMidiGroups });

            const getNameWithGroup = (...args) => searchFeature.getNameWithGroup(...args);

            const sidebarFeature = wireSidebarFeature(assembly);
            assembly.features.sidebar = sidebarFeature;
            const isSidebarOpen = sidebarFeature.isSidebarOpen;
            assembly.refs.isSidebarOpen = isSidebarOpen;

            let splitState;
            let checkCanSplit;
            let openSplitSlider;
            let onSplitSliderInput;
            let confirmSplitSlider;
            let restoreSplitTime;

            const cleanupEmptySchedules = () => scheduleFeature.cleanupEmptySchedules();

            const pruneEmptySchedules = () => scheduleFeature.pruneEmptySchedules();

            const smartScrollToTask = (...args) => viewNavigationFeature.smartScrollToTask(...args);

            const handleManualSync = () => authFeature.handleManualSync();

            const mobileTouchFeatureProxy = wireMobileTouchFeature(assembly);
            const mobileTouchHandlers = mobileTouchFeatureProxy.methods([
                'handleTouchStart',
                'handlePoolTouchStart',
                'handleTouchMove',
                'handleTouchEnd',
                'initMobileResize',
            ]);
            Object.assign(assembly.helpers, { mobileTouchHandlers });

            const toggleTheme = () => mobileUiFeature.toggleTheme();
            Object.assign(assembly.helpers, { toggleTheme });

            let getThemeLabel;
            let switchView;

            universalModalFeature = wireUniversalModalFeature(assembly);
            assembly.features.universalModal = universalModalFeature;
            const {
                openAlertModal,
                openConfirmModal,
                closeConfirmModal,
                handleConfirmAction,
                openInputModal,
                closeInputModal,
                confirmInputModal,
            } = universalModalFeature;
            Object.assign(assembly.helpers, {
                openAlertModal, openConfirmModal, closeConfirmModal, handleConfirmAction,
                openInputModal, closeInputModal, confirmInputModal,
            });
            const avatarCropFeatureProxy = wireAvatarCropFeature(assembly);
            const onFileSelect = avatarCropFeatureProxy.method('onFileSelect');
            const cancelCrop = avatarCropFeatureProxy.method('cancelCrop');
            const confirmCrop = avatarCropFeatureProxy.method('confirmCrop');
            Object.assign(assembly.helpers, { onFileSelect, cancelCrop, confirmCrop });

            const settings = createRootSettingsState();
            assembly.state.settings = settings;
            currentSessionId.value = 'S_DEFAULT';

            const handleLogin = () => authFeature.handleLogin();

            const handleRegister = () => authFeature.handleRegister();

            const handleResetPwd = () => authFeature.handleResetPwd();

            let userAvatar;

            let userDisplayName;

            const updateNickname = () => authFeature.updateNickname();

            const factoryReset = () => authFeature.factoryReset();

            const handleUserBtnClick = () => authFeature.handleUserBtnClick();

            const handleLogout = () => authFeature.handleLogout();

            const saveToCloud = (force = false) => authFeature.saveToCloud(handleManualSync, force);
            Object.assign(assembly.helpers, {
                handleManualSync, handleLogin, handleRegister, handleResetPwd,
                updateNickname, factoryReset, handleUserBtnClick, handleLogout,
            });

            const dropdownsFeature = wireDropdownsFeature(assembly);
            assembly.features.dropdowns = dropdownsFeature;
            const {
                dropdownSearch,
                dropdownExpandedGroups,
                activeGroupFilter,
                availableGroups,
                toggleDropdownGroup,
                toggleDropdown,
                closeDropdowns,
                filteredOptions,
                getGroupedOptions,
                selectOption,
            } = dropdownsFeature;
            Object.assign(assembly.helpers, {
                dropdownSearch, dropdownExpandedGroups, toggleDropdownGroup, toggleDropdown,
                filteredOptions, getGroupedOptions, selectOption,
            });

            const toggleMobileMenu = () => mobileUiFeature.toggleMobileMenu();
            Object.assign(assembly.helpers, { toggleMobileMenu });

            ratioFeature = wireRatioFeature(assembly);
            assembly.features.ratio = ratioFeature;
            const {
                ensureItemRecords,
                getDefaultRatio,
                calculateEstTime,
                getTaskRatio,
                calculateSingleRatio,
                isDefaultRatio,
                autoUpdateEfficiency,
                cleanOldRatios,
            } = ratioFeature;
            Object.assign(assembly.helpers, { autoUpdateEfficiency, calculateSingleRatio, getTaskRatio });

            historyFeature = wireHistoryFeature(assembly);
            assembly.features.history = historyFeature;
            const {
                pushHistory,
                undo,
                redo,
            } = historyFeature;
            Object.assign(assembly.helpers, { pushHistory, undo, redo });

            sessionFeature = wireSessionFeature(assembly);
            assembly.features.session = sessionFeature;
            const {
                currentSessionName,
                switchSession,
                handleSessionAction,
            } = sessionFeature;
            Object.assign(assembly.helpers, { currentSessionName, switchSession, handleSessionAction });

            const pickerControlsFeature = wirePickerControlsFeature(assembly);
            assembly.features.pickerControls = pickerControlsFeature;
            const {
                showColorPickerModal,
                colorPickerTarget,
                tempColor,
                presetColors,
                getTextColor,
                generateRandomHexColor,
                adjustColor,
                getDefaultColorByType,
                openColorPicker,
                resetColorPicker,
                saveColorPicker,
                onDragStart,
                onDragMove,
                onDragEnd,
                openDurationPicker,
                closePicker,
                onScroll,
                confirmDurationPicker,
                resetDuration,
            } = pickerControlsFeature;
            assembly.refs.showColorPickerModal = showColorPickerModal;
            Object.assign(assembly.helpers, {
                tempColor, presetColors, openColorPicker, resetColorPicker, saveColorPicker,
                onDragStart, openDurationPicker, closePicker, onScroll, confirmDurationPicker, resetDuration,
            });

            nameLookupFeature = wireNameLookupFeature(assembly);
            assembly.features.nameLookup = nameLookupFeature;
            const getNameById = (...args) => nameLookupFeature.getNameById(...args);
            Object.assign(assembly.helpers, { getNameById });

            const {
                showRecInfoModal,
                recInfoForm,
                activeRecDropdown,
                recDropdownSearch,
                newRecInputs,
                projectInfoForm,
                metadataModalsFeatureRef,
            } = createRootMetadataModalState();
            assembly.refs.activeRecDropdown = activeRecDropdown;
            Object.assign(assembly.refs, { showRecInfoModal, recInfoForm, recDropdownSearch, newRecInputs, projectInfoForm });
            const metadataModalsFeatureProxy = wireMetadataModalsFeature(assembly, {
                onLoaded: (feature) => {
                    metadataModalsFeatureRef.value = feature;
                },
            });
            const metadataModalHandlers = metadataModalsFeatureProxy.methods([
                'openRecInfoModal',
                'saveRecInfo',
                'selectRecOption',
                'createRecOption',
                'addRecItem',
                'removeRecItem',
                'handleRecRename',
                'openCreditModal',
                'copyCreditText',
                'openProjectInfoModal',
                'saveProjectInfo',
            ]);
            const filteredRecOptions = computed(() => metadataModalsFeatureRef.value?.filteredRecOptions.value || []);
            Object.assign(assembly.helpers, { metadataModalHandlers, filteredRecOptions });
            const {
                showImportModal,
                showExportModal,
                exportFilter,
                dataIoFeatureRef,
            } = createRootDataIoState();
            Object.assign(assembly.refs, { showImportModal, showExportModal, exportFilter });
            const dataIoFeatureProxy = wireDataIoFeature(assembly, {
                onLoaded: (feature) => {
                    dataIoFeatureRef.value = feature;
                },
            });
            const dataIoHandlers = dataIoFeatureProxy.methods([
                'exportToICS',
                'exportJSON',
                'importJSON',
                'triggerFileSelect',
                'handleJSONFile',
                'exportCSV',
                'openExportModal',
                'toggleFilterItem',
                'toggleFilterAll',
                'confirmExport',
            ]);
            const exportSessionOptions = computed(() => dataIoFeatureRef.value?.exportSessionOptions.value || []);
            const filteredExportProjects = computed(() => dataIoFeatureRef.value?.filteredExportProjects.value || []);
            const filteredExportMusicians = computed(() => dataIoFeatureRef.value?.filteredExportMusicians.value || []);
            const filteredExportInstruments = computed(() => dataIoFeatureRef.value?.filteredExportInstruments.value || []);
            const exportDateRange = computed(() => dataIoFeatureRef.value?.exportDateRange.value || { min: '', max: '' });
            const exportPreviewCount = computed(() => dataIoFeatureRef.value?.exportPreviewCount.value || 0);
            Object.assign(assembly.helpers, {
                dataIoHandlers, exportSessionOptions, filteredExportProjects, filteredExportMusicians,
                filteredExportInstruments, exportDateRange, exportPreviewCount,
            });
            const appRuntimeFeature = wireAppRuntimeFeature(assembly);
            assembly.features.appRuntime = appRuntimeFeature;
            appRuntimeFeature.mountAppRuntime();
            onMounted(() => appRuntimeFeature.mountAppLifecycle());
            onUnmounted(() => appRuntimeFeature.unmountAppLifecycle());

            const isScheduled = (...args) => scheduleFeature.isScheduled(...args);

            const handlePoolItemClick = (...args) => poolInteractionsFeature.handlePoolItemClick(...args);

            const autoResizeSchedules = (taskIds) => scheduleFeature.autoResizeSchedules(taskIds);

            orchestrationFeature = wireOrchestrationFeature(assembly);
            assembly.features.orchestration = orchestrationFeature;
            const {
                activeOrchPresets,
                orchTemplates,
                parsedRoster,
                getRosterName,
                updateRosterName,
                showOrchestrationField,
                percKeywords,
                percState,
                isPercussionMode,
                scanPercussionTags,
                addPercPlayer,
                removePercPlayer,
                togglePercTagSelect,
                assignTagsToPlayer,
                updatePercOrchestration,
            } = orchestrationFeature;
            Object.assign(assembly.helpers, {
                activeOrchPresets, parsedRoster, getRosterName, updateRosterName, showOrchestrationField,
                percState, isPercussionMode, scanPercussionTags, addPercPlayer, removePercPlayer,
                togglePercTagSelect, assignTagsToPlayer, updatePercOrchestration,
            });

            const getGroupColor = (...args) => pickerControlsFeature.getGroupColor(...args);
            Object.assign(assembly.helpers, { getGroupColor });

            quickAddFeature = wireQuickAddFeature(assembly);
            assembly.features.quickAdd = quickAddFeature;
            const {
                currentQuickAddGroups,
                openQuickAdd,
                onMusicianSelect,
                confirmQuickAdd,
                addItemToPool,
            } = quickAddFeature;
            Object.assign(assembly.helpers, { currentQuickAddGroups, openQuickAdd, confirmQuickAdd, addItemToPool });

            const scheduleInteractionsFeature = wireScheduleInteractionsFeature(assembly);
            assembly.features.scheduleInteractions = scheduleInteractionsFeature;
            const dragStart = (...args) => scheduleInteractionsFeature.dragStart(...args);
            const handleDragEnd = (...args) => scheduleInteractionsFeature.handleDragEnd(...args);
            const dragEnterPool = (...args) => scheduleInteractionsFeature.dragEnterPool(...args);
            const dragLeavePool = (...args) => scheduleInteractionsFeature.dragLeavePool(...args);
            const dropToPool = (...args) => scheduleInteractionsFeature.dropToPool(...args);
            const dragEnterSlot = (...args) => scheduleInteractionsFeature.dragEnterSlot(...args);
            const dragLeaveSlot = (...args) => scheduleInteractionsFeature.dragLeaveSlot(...args);
            const dropToSchedule = (...args) => scheduleInteractionsFeature.dropToSchedule(...args);
            const dropToMonth = (...args) => scheduleInteractionsFeature.dropToMonth(...args);
            Object.assign(assembly.helpers, {
                dragStart, handleDragEnd, dragEnterPool, dragLeavePool, dropToPool,
                dragEnterSlot, dragLeaveSlot, dropToSchedule, dropToMonth,
            });


            const desktopResizeFeatureProxy = wireDesktopResizeFeature(assembly);
            const initResize = desktopResizeFeatureProxy.method('initResize');
            const handleResizeMove = desktopResizeFeatureProxy.method('handleResizeMove');
            const handleResizeEnd = desktopResizeFeatureProxy.method('handleResizeEnd');
            Object.assign(assembly.helpers, { initResize });

            const scrollToSidebarItem = (...args) => sidebarFeature.scrollToSidebarItem(...args);

            const poolInteractionsFeature = wirePoolInteractionsFeature(assembly);
            assembly.features.poolInteractions = poolInteractionsFeature;
            const getVisiblePoolItems = (...args) => poolInteractionsFeature.getVisiblePoolItems(...args);

            const selectTask = (...args) => poolInteractionsFeature.selectTask(...args);

            const clearSelection = () => poolInteractionsFeature.clearSelection();
            Object.assign(assembly.helpers, { selectTask, clearSelection });

            const getOverlapCount = (...args) => scheduleFeature.getOverlapCount(...args);

            const moveTask = (...args) => scheduleFeature.moveTask(...args);

            const scheduleDeletionFeatureProxy = wireScheduleDeletionFeature(assembly, {
                onLoaded: (feature) => {
                    scheduleDeletionFeature = feature;
                },
            });
            const isResourceCompleted = scheduleDeletionFeatureProxy.method('isResourceCompleted');
            const deleteCurrentSchedule = scheduleDeletionFeatureProxy.method('deleteCurrentSchedule');
            const clearPoolRecord = scheduleDeletionFeatureProxy.method('clearPoolRecord');
            const clearAggregateRecords = scheduleDeletionFeatureProxy.method('clearAggregateRecords');
            Object.assign(assembly.helpers, { deleteCurrentSchedule });

            const globalKeyboardFeature = wireGlobalKeyboardFeature(assembly);
            assembly.features.globalKeyboard = globalKeyboardFeature;
            const handleGlobalKey = (...args) => globalKeyboardFeature.handleGlobalKey(...args);

            const handleTaskDblClick = (...args) => scheduleInteractionsFeature.handleTaskDblClick(...args);
            Object.assign(assembly.helpers, { handleTaskDblClick });

            const checkOverlap = (date, startTime, durationStr, excludeId, checkType) =>
                scheduleFeature.checkOverlap(date, startTime, durationStr, excludeId, checkType);

            const moveDivider = (dividerIndex, direction, shouldSaveHistory = true) =>
                scheduleFeature.moveDivider(dividerIndex, direction, shouldSaveHistory);

            const { trackListReady } = createRootTrackListState();
            const trackListFeatureProxy = wireTrackListFeature(assembly, {
                onLoaded: (feature) => {
                    trackListFeature = feature;
                    trackListReady.value = true;
                },
            });
            const getTrackListFeature = trackListFeatureProxy.getFeature;
            const withTrackListFeature = trackListFeatureProxy.method;
            const autoDistributeSections = withTrackListFeature('autoDistributeSections');
            const autoResizeScheduleByRecords = withTrackListFeature('autoResizeScheduleByRecords');
            const startDividerDrag = withTrackListFeature('startDividerDrag');
            const onDividerDragMove = withTrackListFeature('onDividerDragMove');
            const onDividerDragEnd = withTrackListFeature('onDividerDragEnd');
            const handleTrackListAutoScroll = withTrackListFeature('handleTrackListAutoScroll');
            const stopTrackListAutoScroll = withTrackListFeature('stopTrackListAutoScroll');
            const calcTrackDiff = withTrackListFeature('calcTrackDiff');
            const setTrackBreak = withTrackListFeature('setTrackBreak');
            const deleteTrackFromList = withTrackListFeature('deleteTrackFromList');
            const autoCalcDuration = withTrackListFeature('autoCalcDuration');
            const saveScheduleActualTime = withTrackListFeature('saveScheduleActualTime');
            const saveTrackActual = withTrackListFeature('saveTrackActual');
            const setTrackNow = withTrackListFeature('setTrackNow');
            const saveTrackRecord = withTrackListFeature('saveTrackRecord');
            const clearTrackTime = withTrackListFeature('clearTrackTime');
            const getOrchSize = withTrackListFeature('getOrchSize', 0);
            const isOrchestraGroup = withTrackListFeature('isOrchestraGroup', false);
            const isPercussionGroup = withTrackListFeature('isPercussionGroup', false);
            const isStringGroup = withTrackListFeature('isStringGroup', false);
            const sortTrackList = withTrackListFeature('sortTrackList');
            const autoSortTrackList = withTrackListFeature('autoSortTrackList');
            const startTrackDrag = withTrackListFeature('startTrackDrag');
            const getSessionRatio = withTrackListFeature('getSessionRatio', '-');
            const calculateProportionalDuration = withTrackListFeature('calculateProportionalDuration');
            Object.assign(assembly.helpers, {
                autoResizeScheduleByRecords, saveScheduleActualTime, saveTrackActual,
                autoDistributeSections, startDividerDrag, calcTrackDiff, setTrackBreak, deleteTrackFromList,
                setTrackNow, clearTrackTime, isPercussionGroup, isStringGroup,
                sortTrackList, startTrackDrag,
            });

            const getTaskStyle = t => scheduleFeature.getTaskStyle(t);

            const getBlockTitle = (task) => scheduleFeature.getBlockTitle(task);

            const isTaskGhost = (task) => scheduleFeature.isTaskGhost(task);

            const hasRecordingInfo = (task) => scheduleFeature.hasRecordingInfo(task);
            Object.assign(assembly.helpers, { getOverlapCount, getTaskStyle, getBlockTitle, isTaskGhost, hasRecordingInfo });

            const toggleSidebar = sidebarFeature.toggleSidebar;
            const onSidebarTouchStart = sidebarFeature.onSidebarTouchStart;
            const onSidebarTouchEnd = sidebarFeature.onSidebarTouchEnd;
            const sidebarTransitionName = sidebarFeature.sidebarTransitionName;
            const sidebarScrollRef = sidebarFeature.sidebarScrollRef;
            assembly.refs.sidebarScrollRef = sidebarScrollRef;
            const switchSidebarTab = sidebarFeature.switchSidebarTab;
            Object.assign(assembly.helpers, {
                toggleSidebar, onSidebarTouchStart, onSidebarTouchEnd, sidebarTransitionName, switchSidebarTab,
            });

            splitTaskFeature = wireSplitTaskFeature(assembly);
            assembly.features.splitTask = splitTaskFeature;
            splitState = splitTaskFeature.splitState;
            const {
                checkCanSplit: splitTaskCheckCanSplit,
                checkCanDeleteSplit,
                getFamilyTotalDuration,
                syncFamilyLegacyFields,
                syncFamilySharedIdentity,
                syncFamilyOrchestration,
                syncScheduledDurationsFromFamily,
                openSplitSlider: splitTaskOpenSplitSlider,
                onSplitSliderInput: splitTaskOnSplitSliderInput,
                confirmSplitSlider: splitTaskConfirmSplitSlider,
                restoreSplitTime: splitTaskRestoreSplitTime,
            } = splitTaskFeature;
            checkCanSplit = splitTaskCheckCanSplit;
            openSplitSlider = splitTaskOpenSplitSlider;
            onSplitSliderInput = splitTaskOnSplitSliderInput;
            confirmSplitSlider = splitTaskConfirmSplitSlider;
            restoreSplitTime = splitTaskRestoreSplitTime;
            Object.assign(assembly.helpers, { splitState, openSplitSlider, onSplitSliderInput, confirmSplitSlider });

            const taskEditorFeatureProxy = wireTaskEditorFeature(assembly);
            const openEditModal = taskEditorFeatureProxy.method('openEditModal');
            const saveEdit = taskEditorFeatureProxy.method('saveEdit');
            const deleteEditingItem = taskEditorFeatureProxy.method('deleteEditingItem');
            Object.assign(assembly.helpers, { openEditModal, saveEdit, deleteEditingItem });

            scheduleFeature = wireScheduleFeature(assembly);
            assembly.features.schedule = scheduleFeature;
            const settingsSyncFeature = wireSettingsSyncFeature(assembly);
            assembly.features.settingsSync = settingsSyncFeature;
            const {
                settingsNameFocus,
                updateInputRect,
                getFloatingStyle,
                onSettingsScroll,
                getUngroupedItems,
                sortedInstruments,
                isAllGroupsExpanded,
                toggleAllGroups,
                toggleSettingsGroup,
                getExistingGroups,
                getOrCreateSettingItem,
            } = settingsSyncFeature;
            assembly.refs.settingsNameFocus = settingsNameFocus;
            Object.assign(assembly.refs, { sortedInstruments });
            let allSettingsGrouped = settingsSyncFeature.allSettingsGrouped;
            Object.assign(assembly.helpers, {
                updateInputRect, getFloatingStyle, onSettingsScroll, getUngroupedItems,
                isAllGroupsExpanded, toggleAllGroups, toggleSettingsGroup, getExistingGroups, allSettingsGrouped,
            });
            const settingsFeatureProxy = wireSettingsFeature(assembly, {
                onLoaded: (feature) => {
                    settingsFeature = feature;
                    allSettingsGrouped = computed(() => feature.getAllSettingsGrouped());
                },
            });
            const settingsHandlers = settingsFeatureProxy.methods([
                'onSettingsItemDragStart',
                'onSettingsItemDragEnd',
                'disableRowDrag',
                'enableRowDrag',
                'onSettingsDragOver',
                'onSettingsDragLeave',
                'onSettingsDrop',
                'renameGroup',
                'addSettingsItem',
                'removeSettingsItem',
                'clearSettingsList',
                'handleItemRename',
            ]);
            Object.assign(assembly.helpers, { settingsHandlers });

            const importDataFeatureProxy = wireImportDataFeature(assembly, {
                onLoaded: (feature) => {
                    importDataFeature = feature;
                    importDataFeatureRef.value = feature;
                },
            });
            const calculateRowStatusText = importDataFeatureProxy.method('calculateRowStatusText');
            const refreshCsvStatus = importDataFeatureProxy.method('refreshCsvStatus');
            const toggleCsvSelection = importDataFeatureProxy.method('toggleCsvSelection');
            const confirmCsvImport = importDataFeatureProxy.method('confirmCsvImport');
            const addDataToPrepared = importDataFeatureProxy.method('addDataToPrepared');
            const triggerMidiImportForProject = importDataFeatureProxy.method('triggerMidiImportForProject');
            const triggerMidiImport = importDataFeatureProxy.method('triggerMidiImport');
            const handleMidiFile = importDataFeatureProxy.method('handleMidiFile');
            const processMidiFile = importDataFeatureProxy.method('processMidiFile');
            const isGroupSelected = importDataFeatureProxy.method('isGroupSelected');
            const toggleGroupSelection = importDataFeatureProxy.method('toggleGroupSelection');
            const toggleAllRows = importDataFeatureProxy.method('toggleAllRows');
            const findGroupFromLibrary = importDataFeatureProxy.method('findGroupFromLibrary');
            const onImportInstChange = importDataFeatureProxy.method('onImportInstChange');
            const getSmartName = (row) => importDataFeature?.getSmartName(row) ?? '';
            const confirmMidiImport = importDataFeatureProxy.method('confirmMidiImport');
            const triggerCSV = importDataFeatureProxy.method('triggerCSV');
            const parseCSVLine = importDataFeatureProxy.method('parseCSVLine');
            const parseCSVRobust = importDataFeatureProxy.method('parseCSVRobust');
            const handleCSVImport = importDataFeatureProxy.method('handleCSVImport');
            const refreshCsvPreview = importDataFeatureProxy.method('refreshCsvPreview');
            Object.assign(assembly.helpers, {
                refreshCsvStatus, confirmCsvImport, triggerMidiImportForProject, handleMidiFile,
                isGroupSelected, toggleGroupSelection, toggleAllRows, getSmartName,
                confirmMidiImport, triggerCSV, handleCSVImport,
            });

            authFeature = wireAuthFeature(assembly);
            assembly.features.auth = authFeature;
            const toggleProjectCollapse = importDataFeatureProxy.method('toggleProjectCollapse');
            const toggleAllProjectCollapse = importDataFeatureProxy.method('toggleAllProjectCollapse');
            const toggleMidiGroupExpand = importDataFeatureProxy.method('toggleMidiGroupExpand');
            const findGroupSmart = importDataFeatureProxy.method('findGroupSmart');
            const openImportMenu = importDataFeatureProxy.method('openImportMenu');
            const closeImportMenu = importDataFeatureProxy.method('closeImportMenu');
            const selectImportInst = importDataFeatureProxy.method('selectImportInst');
            const selectImportNewInst = importDataFeatureProxy.method('selectImportNewInst');
            const selectImportGroup = importDataFeatureProxy.method('selectImportGroup');
            Object.assign(assembly.helpers, {
                toggleProjectCollapse, toggleMidiGroupExpand, openImportMenu,
                selectImportInst, selectImportNewInst, selectImportGroup,
            });
            const midiManagerFeatureProxy = wireMidiManagerFeature(assembly, {
                onLoaded: (feature) => {
                    midiManagerFeature = feature;
                    midiManagerFeatureRef.value = feature;
                },
            });
            const getMidiManagerFeature = midiManagerFeatureProxy.getFeature;
            const withMidiManagerFeature = midiManagerFeatureProxy.method;
            const toggleMidiManagerGroup = withMidiManagerFeature('toggleMidiManagerGroup');
            const openMidiGroupDropdown = withMidiManagerFeature('openMidiGroupDropdown');
            const selectMidiGroup = withMidiManagerFeature('selectMidiGroup');
            const openMidiManager = withMidiManagerFeature('openMidiManager');
            const updateMidiDuration = withMidiManagerFeature('updateMidiDuration');
            const removeMidiMapping = withMidiManagerFeature('removeMidiMapping');
            const clearProjectMidi = withMidiManagerFeature('clearProjectMidi');
            const updateInstrumentGroup = withMidiManagerFeature('updateInstrumentGroup');
            const isOverlapping = withMidiManagerFeature('isOverlapping', false);
            const calculateEffectiveDuration = withMidiManagerFeature('calculateEffectiveDuration', 0);
            const calculateAccurateDuration = withMidiManagerFeature('calculateAccurateDuration', 0);
            const convertTicksToSeconds = withMidiManagerFeature('convertTicksToSeconds', 0);
            const calculateQuantizedDuration = withMidiManagerFeature('calculateQuantizedDuration', { seconds: 0 });
            const autoFillMidiDuration = withMidiManagerFeature('autoFillMidiDuration');
            Object.assign(assembly.helpers, {
                toggleMidiManagerGroup, openMidiGroupDropdown, openMidiManager, updateMidiDuration,
                removeMidiMapping, clearProjectMidi, updateInstrumentGroup,
            });
            userAvatar = authFeature.userAvatar;
            userDisplayName = authFeature.userDisplayName;
            Object.assign(assembly.helpers, { userAvatar, userDisplayName });

            let currentSidebarList;
            searchFeature = wireSearchFeature(assembly);
            assembly.features.search = searchFeature;
            const {
                filteredScheduledTasks,
                filteredSidebarList,
                getFullSearchText,
                smartMatch,
                handleSearchEnter,
                handleSearchBlur,
                onSearchFocus,
                handleTrackListSearchAction,
            } = searchFeature;
            assembly.refs.filteredScheduledTasks = filteredScheduledTasks;
            assembly.refs.filteredSidebarList = filteredSidebarList;
            Object.assign(assembly.helpers, { handleSearchEnter, handleSearchBlur, onSearchFocus, handleTrackListSearchAction });

            const sidebarStatsFeature = wireSidebarStatsFeature(assembly);
            assembly.features.sidebarStats = sidebarStatsFeature;
            const {
                calculateGroupStats,
                musicianStats,
                projectStats,
                instrumentStats,
                activeTaskCount,
                expandedStatsIds,
                toggleSort,
                getSortIcon,
                toggleCollapse,
                toggleStatCollapse,
                updateMusicianRatio,
                jumpToStatSchedule,
                handleStatCardClick,
            } = sidebarStatsFeature;
            Object.assign(assembly.refs, { musicianStats, projectStats, instrumentStats, expandedStatsIds });
            currentSidebarList = sidebarStatsFeature.currentSidebarList;
            assembly.refs.currentSidebarList = sidebarStatsFeature.currentSidebarList;
            Object.assign(assembly.helpers, { activeTaskCount, toggleSort, getSortIcon, jumpToStatSchedule, handleStatCardClick });

            const viewNavigationFeature = wireViewNavigationFeature(assembly);
            assembly.features.viewNavigation = viewNavigationFeature;
            const {
                renderedRange,
                isLoadingMore,
                setMonthRef,
                initMonthObserver,
                timeSlots,
                dateTransitionName,
                changeDate,
                currentWeekDays,
                generateMonthGrid,
                currentMonthDays,
                flatScrolledDays,
                handleInfiniteScroll,
                scrollToMonthDate,
                currentDateLabel,
                tasksByDateMap,
                getTasksForDate,
                switchToWeek,
                handleHeaderDoubleTap,
                handleMonthCellDoubleTap,
                jumpToToday,
                isToday,
                viewTransitionName,
                onMainMouseDown,
                onMainMouseUp,
                onMainWheel,
                onMainTouchStart,
                onMainTouchEnd,
                isMouseViewDrag,
                widthIcon,
                cycleDayWidth,
                jumpToGhostContext,
            } = viewNavigationFeature;
            switchView = viewNavigationFeature.switchView;
            assembly.refs.currentWeekDays = currentWeekDays;
            Object.assign(assembly.helpers, {
                currentDateLabel, dateTransitionName, currentMonthDays, flatScrolledDays, handleInfiniteScroll,
                tasksByDateMap, switchToWeek, handleHeaderDoubleTap, handleMonthCellDoubleTap, jumpToToday,
                isToday, viewTransitionName, onMainMouseDown, onMainMouseUp, onMainWheel,
                onMainTouchStart, onMainTouchEnd, isMouseViewDrag, widthIcon, cycleDayWidth,
                timeSlots, setMonthRef, switchView,
            });

            const handlePageUnload = authFeature.handlePageUnload;

            mobileUiFeature = wireMobileUiFeature(assembly);
            assembly.features.mobileUi = mobileUiFeature;
            getThemeLabel = mobileUiFeature.getThemeLabel;
            Object.assign(assembly.helpers, { getThemeLabel });

            const tourFeatureProxy = wireTourFeature(assembly);
            const startTour = tourFeatureProxy.method('startTour');
            const mountTourAutostart = tourFeatureProxy.method('mountTourAutostart');
            Object.assign(assembly.helpers, { startTour });

            Object.assign(assembly.helpers, {
                autoResizeSchedules,
                changeDate,
                getOrCreateSettingItem,
                moveDivider,
                syncFamilyLegacyFields,
                syncFamilySharedIdentity,
                syncFamilyOrchestration,
                syncScheduledDurationsFromFamily,
                checkOverlap,
                isResourceCompleted,
                clearPoolRecord,
                clearAggregateRecords,
                autoSortTrackList,
                getTrackListFeature,
                closeImportMenu,
                toggleAllProjectCollapse,
                checkCanDeleteSplit: (...args) => checkCanDeleteSplit(...args),
                restoreSplitTime: (...args) => restoreSplitTime(...args),
                handleGlobalKey,
                handleResizeMove,
                handleResizeEnd,
                saveToCloud,
            });

            const { appRootShell, appRootOverlaysShell } = createAppRootContexts({
                assembly,
                factories: {
                    createRootAccountModalsShellState, createRootAuthModalShellState, createRootColorPickerModalShellState, createRootConfirmModalShellState, createRootCreditModalShellState, createRootCropModalShellState,
                    createRootCsvImportModalShellState, createRootDurationPickerModalShellState, createRootEditModalShellState, createRootExportCreditModalsShellState, createRootExportModalShellState, createRootHeaderShellState,
                    createRootImportModalShellState, createRootInputModalShellState, createRootMainContentShellState, createRootMetadataInfoModalsShellState, createRootMidiCsvImportModalsShellState, createRootMidiImportModalShellState,
                    createRootMidiManagerModalShellState, createRootMobileControlsShellState, createRootMobileTaskInputShellState, createRootPickerModalsShellState, createRootProjectInfoModalShellState, createRootQuickAddModalShellState,
                    createRootRecInfoModalShellState, createRootSettingsModalShellState, createRootShellState, createRootSidebarShellState, createRootSplitModalShellState, createRootStandaloneOverlaysShellState,
                    createRootTaskActionModalsShellState, createRootTrackListModalShellState, createRootUniversalModalsShellState, createRootUtilityModalsShellState,
                },
            });

            onMounted(() => {
                mobileUiFeature.mountShellLifecycle();
                if (!storageService.getItem('musche_tour_seen')) {
                    mountTourAutostart();
                }
            });

            onUnmounted(() => {
                mobileUiFeature.unmountShellLifecycle();
                // 这里省略了 remove 其他监听，因为这是根组件，销毁即刷新，通常不需要清理
            });


            return {
                appRootShell,
                appRootOverlaysShell,
            };
        }
    }).mount('#app');
