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
        deviceService,
        triggerTouchHaptic,
        wireImportDataFeature,
        wireNotificationsFeature,
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
        createLazyFeatureProxy,
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
            const { itemPool, scheduledTasks, slotHeight, pxPerMin, currentView, monthViewMode, viewDate, selectedTaskId, selectedSource, selectedPoolIds, sidebarWidth, lastPoolClickId, lastPoolFocusId, showSettings, showProjectInfoModal, showMetadataManager, showEditor, showTrackList, trackListData, editingItem, editingSource, weekContainer, flashingTaskId, showProfileMenu, showMobileTaskInput, trackListContainerRef, draggingSectionIndex, dayColWidth, isResizingMobile, saveStatus, globalSearchQuery, isSearchFocused, localDataVersion, isBootstrappingData, showSplitModal, showCreditModal, generatedCreditText, visibleTopDate, monthObserver, monthRefs, showMidiManager, managingProject, showMidiImportModal, showCsvImportModal, currentSessionId, activeDropdown, showMobileMenu, tempNickname, settingsExpandedGroups, newSettingsItem, user, showAuthModal, authLoading, authForm, history, historyIndex, showConfirmModal, confirmModalConfig, showInputModal, universalInputRef, inputModalConfig, showQuickAddModal, quickAddType, quickAddForm, showCropModal, cropImgSrc, cropImgRef, showGroupSuggestions, settingsGroupFocus, sortKey, activeColorKey, expandedGroups, themeMode, isDark } = store;
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
                services: { storageService, supabaseService, deviceService, triggerTouchHaptic },
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
                syncItemForView,
                syncItemsForView,
                isItemVisibleForView,
                getSplitViewState,
                peekSplitViewState,
                getCurrentSplitView,
            } = splitViewFeature;
            // --- 🎹 MIDI 高级导入逻辑 ---
            
            // --- 🟢 [新增] CSV 导入弹窗状态与配置 ---
            let {
                groupedCsvData,
                isAllSelected,
                availableInstrumentGroups,
                midiGroupData,
                currentMidiDisplayList,
                filteredImportOptions,
                midiGroupExpanded,
            } = createRootImportDataState();
            assembly.refs.availableInstrumentGroups = availableInstrumentGroups;
            let importDataFeature;

            let {
                midiManagerExpandedGroups,
                projectMidiGroups,
                projectMidiList,
                filteredMidiGroups,
            } = createRootMidiManagerState();
            Object.assign(assembly.refs, { midiManagerExpandedGroups, projectMidiGroups });

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

            // 🟢 修复: 终极修正版清理函数
            // 修复了 S_DEFAULT 含下划线导致的分组解析错误，防止误删所有日程
            const cleanupEmptySchedules = () => scheduleFeature.cleanupEmptySchedules();

            // 🟢 新增: 强力扫描并清理当前弹窗内的空日程块
            const pruneEmptySchedules = () => scheduleFeature.pruneEmptySchedules();

            const smartScrollToTask = (...args) => viewNavigationFeature.smartScrollToTask(...args);

// 🟢 新增: 手动同步函数
            const handleManualSync = () => authFeature.handleManualSync();

            const mobileTouchFeatureProxy = wireMobileTouchFeature(assembly);
            const mobileTouchHandlers = mobileTouchFeatureProxy.methods([
                'handleTouchStart',
                'handlePoolTouchStart',
                'handleTouchMove',
                'handleTouchEnd',
                'initMobileResize',
            ]);

            // 🟢 核心修改: 引入三态主题管理 (Auto / Light / Dark)

            // 2. 应用主题的核心函数

            // 3. 切换按钮点击事件 (Auto -> Light -> Dark -> Auto 循环)
            const toggleTheme = () => mobileUiFeature.toggleTheme();

            // 4. 获取当前模式的显示名称和图标 (供 HTML 使用)
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

            const settings = createRootSettingsState();
            assembly.state.settings = settings;
            currentSessionId.value = 'S_DEFAULT';

            // 🟢 修改: 纯粹的登录逻辑 (不再自动跳转注册)
            const handleLogin = () => authFeature.handleLogin();

            // 🟢 新增: 独立的注册逻辑
            const handleRegister = () => authFeature.handleRegister();

            // 🟢 新增: 找回密码逻辑
            const handleResetPwd = () => authFeature.handleResetPwd();

            // 🟢 新增: 个人中心逻辑

            // 计算当前显示的头像 (优先读取 user_metadata)
            let userAvatar;

            // 计算显示名称 (优先显示 full_name，否则显示邮箱前缀)
            let userDisplayName;

            // 更新昵称到 Supabase
            const updateNickname = () => authFeature.updateNickname();

            // 🚩🚩🚩 替换 factoryReset 函数的完整定义 🚩🚩🚩

            const factoryReset = () => authFeature.factoryReset();

            // 处理顶部按钮点击
            // 🔴 修改: 加入互斥逻辑
            // 🔴 修改: 处理顶部头像按钮点击 (合并了之前的互斥逻辑和昵称填充)
            const handleUserBtnClick = () => authFeature.handleUserBtnClick();

            // 更新头像到 Supabase

            // 🟢 新增: 处理头像文件上传

            // 🟢 新增: 登出逻辑
            // 🟢 修改: 暴力清除所有缓存，确保退出后不会自动登录
            // 🟢 修改: 退出登录时，只清除身份信息，保留本地数据 (v9_data)
            const handleLogout = () => authFeature.handleLogout();

            // 🟢 修改: 优化后的加载逻辑 (支持版本控制)

            // 🟢 修改: 增加版本检查的保存逻辑 (解决 Race Condition)
            const saveToCloud = (force = false) => authFeature.saveToCloud(handleManualSync, force);

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

            // 🔴 新增: 切换手机菜单 (互斥其他)
            const toggleMobileMenu = () => mobileUiFeature.toggleMobileMenu();

            // 在 onMounted 里绑定点击外部关闭
            // onMounted(() => { ... window.addEventListener('click', closeDropdowns); ... })
            // 别忘了在 onUnmounted 移除

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

            nameLookupFeature = wireNameLookupFeature(assembly);
            assembly.features.nameLookup = nameLookupFeature;
            const getNameById = (...args) => nameLookupFeature.getNameById(...args);

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
            const appRuntimeFeature = wireAppRuntimeFeature(assembly);
            assembly.features.appRuntime = appRuntimeFeature;
            appRuntimeFeature.mountAppRuntime();
            onMounted(() => appRuntimeFeature.mountAppLifecycle());
            onUnmounted(() => appRuntimeFeature.unmountAppLifecycle());

            const isScheduled = (...args) => scheduleFeature.isScheduled(...args);

            const handlePoolItemClick = (...args) => poolInteractionsFeature.handlePoolItemClick(...args);

            // 4. 辅助：全局日程块自动调整
            const autoResizeSchedules = (taskIds) => scheduleFeature.autoResizeSchedules(taskIds);

            // --- V9.7.4 名称和颜色查找器 (新增项目类型) ---

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

            const getGroupColor = (...args) => pickerControlsFeature.getGroupColor(...args);

            quickAddFeature = wireQuickAddFeature(assembly);
            assembly.features.quickAdd = quickAddFeature;
            const {
                currentQuickAddGroups,
                openQuickAdd,
                onMusicianSelect,
                confirmQuickAdd,
                addItemToPool,
            } = quickAddFeature;

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


            const desktopResizeFeatureProxy = wireDesktopResizeFeature(assembly);
            const initResize = desktopResizeFeatureProxy.method('initResize');
            const handleResizeMove = desktopResizeFeatureProxy.method('handleResizeMove');
            const handleResizeEnd = desktopResizeFeatureProxy.method('handleResizeEnd');

            const scrollToSidebarItem = (...args) => sidebarFeature.scrollToSidebarItem(...args);

            const poolInteractionsFeature = wirePoolInteractionsFeature(assembly);
            assembly.features.poolInteractions = poolInteractionsFeature;
            const getVisiblePoolItems = (...args) => poolInteractionsFeature.getVisiblePoolItems(...args);

            const selectTask = (...args) => poolInteractionsFeature.selectTask(...args);

            const clearSelection = () => poolInteractionsFeature.clearSelection();

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

            const globalKeyboardFeature = wireGlobalKeyboardFeature(assembly);
            assembly.features.globalKeyboard = globalKeyboardFeature;
            const handleGlobalKey = (...args) => globalKeyboardFeature.handleGlobalKey(...args);

            const handleTaskDblClick = (...args) => scheduleInteractionsFeature.handleTaskDblClick(...args);

            // 🟢 修改: checkOverlap (支持分层检测)
            const checkOverlap = (date, startTime, durationStr, excludeId, checkType) =>
                scheduleFeature.checkOverlap(date, startTime, durationStr, excludeId, checkType);

            // 🟢 修改: 增加 shouldSaveHistory 参数，防止拖动时卡顿
            const moveDivider = (dividerIndex, direction, shouldSaveHistory = true) =>
                scheduleFeature.moveDivider(dividerIndex, direction, shouldSaveHistory);

            const notificationsFeatureProxy = wireNotificationsFeature(assembly);
            const updateTaskNotification = notificationsFeatureProxy.method('updateTaskNotification');
            const scheduleReminder = notificationsFeatureProxy.method('scheduleReminder');

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
            const onTrackListReminderChange = withTrackListFeature('onTrackListReminderChange');
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

            // 🟢 修改: getTaskStyle (增加 z-index 控制)
            const getTaskStyle = t => scheduleFeature.getTaskStyle(t);

            // 🟢 新增: 获取日程块显示的标题
            const getBlockTitle = (task) => scheduleFeature.getBlockTitle(task);

            // 🟢 新增: 判断任务是否为"幽灵"状态 (Session不匹配 或 视图类型不匹配)
            const isTaskGhost = (task) => scheduleFeature.isTaskGhost(task);

            const hasRecordingInfo = (task) => scheduleFeature.hasRecordingInfo(task);

            const toggleSidebar = sidebarFeature.toggleSidebar;
            const onSidebarTouchStart = sidebarFeature.onSidebarTouchStart;
            const onSidebarTouchEnd = sidebarFeature.onSidebarTouchEnd;
            const sidebarTransitionName = sidebarFeature.sidebarTransitionName;
            const sidebarScrollRef = sidebarFeature.sidebarScrollRef;
            assembly.refs.sidebarScrollRef = sidebarScrollRef;
            const switchSidebarTab = sidebarFeature.switchSidebarTab;

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

            const taskEditorFeatureProxy = wireTaskEditorFeature(assembly);
            const openEditModal = taskEditorFeatureProxy.method('openEditModal');
            const saveEdit = taskEditorFeatureProxy.method('saveEdit');
            const deleteEditingItem = taskEditorFeatureProxy.method('deleteEditingItem');

            scheduleFeature = wireScheduleFeature(assembly);
            assembly.features.schedule = scheduleFeature;
            const settingsSyncFeature = wireSettingsSyncFeature(assembly);
            assembly.features.settingsSync = settingsSyncFeature;
            const {
                inputRects,
                settingsNameFocus,
                updateInputRect,
                getFloatingStyle,
                onSettingsScroll,
                getUngroupedItems,
                sortedInstruments,
                sortedMusicians,
                sortedProjects,
                isAllGroupsExpanded,
                toggleAllGroups,
                toggleSettingsGroup,
                getSettingsGroupedList,
                findSettingId,
                getOrCreateProjectId,
                getExistingGroups,
                getOrCreateSettingItem,
            } = settingsSyncFeature;
            assembly.refs.settingsNameFocus = settingsNameFocus;
            Object.assign(assembly.refs, { sortedInstruments });
            let allSettingsGrouped = settingsSyncFeature.allSettingsGrouped;
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

            const importDataFeatureProxy = wireImportDataFeature(assembly, {
                onLoaded: (feature) => {
                    importDataFeature = feature;
                    groupedCsvData = feature.groupedCsvData;
                    isAllSelected = feature.isAllSelected;
                    availableInstrumentGroups = feature.availableInstrumentGroups;
                    assembly.refs.availableInstrumentGroups = availableInstrumentGroups;
                    midiGroupExpanded = feature.midiGroupExpanded;
                    midiGroupData = feature.midiGroupData;
                    currentMidiDisplayList = feature.currentMidiDisplayList;
                    filteredImportOptions = feature.filteredImportOptions;
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
            const midiManagerFeatureProxy = wireMidiManagerFeature(assembly, {
                onLoaded: (feature) => {
                    midiManagerFeature = feature;
                    midiManagerExpandedGroups = feature.midiManagerExpandedGroups;
                    assembly.refs.midiManagerExpandedGroups = midiManagerExpandedGroups;
                    projectMidiList = feature.projectMidiList;
                    projectMidiGroups = feature.projectMidiGroups;
                    assembly.refs.projectMidiGroups = projectMidiGroups;
                    filteredMidiGroups = feature.filteredMidiGroups;
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
            userAvatar = authFeature.userAvatar;
            userDisplayName = authFeature.userDisplayName;

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

            const handlePageUnload = authFeature.handlePageUnload;

            // --- 🟢 手机端适配逻辑 ---
            // --- 🟢 手机端适配 & 布局自动修复 ---
            mobileUiFeature = wireMobileUiFeature(assembly);
            assembly.features.mobileUi = mobileUiFeature;
            getThemeLabel = mobileUiFeature.getThemeLabel;

            // 🟢 优化: 增强版布局刷新函数

            const tourFeatureProxy = wireTourFeature(assembly);
            const startTour = tourFeatureProxy.method('startTour');
            const mountTourAutostart = tourFeatureProxy.method('mountTourAutostart');

            Object.assign(assembly.helpers, {
                autoResizeSchedules,
                changeDate,
                getOrCreateSettingItem,
                moveDivider,
                updateTaskNotification,
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
                    triggerTouchHaptic,
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
                    triggerTouchHaptic,
                    calcTrackDiff,
                    setTrackNow,
                    setTrackBreak,
                    clearTrackTime,
                    calculateSingleRatio,
                    onTrackListReminderChange,
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
