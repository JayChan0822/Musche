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
        loadImportDataFeature,
        loadNotificationsFeature,
        loadDesktopResizeFeature,
        loadScheduleDeletionFeature,
        loadAvatarCropFeature,
        loadDataIoFeature,
        loadMetadataModalsFeature,
        loadTourFeature,
        loadMidiManagerFeature,
        loadTaskEditorFeature,
        loadMobileTouchRegistration,
        loadTrackListFeature,
        loadSettingsFeature,
        registerAppRuntimeFeature,
        registerGlobalKeyboardFeature,
        registerSessionFeature,
        registerHistoryFeature,
        registerRatioFeature,
        registerNameLookupFeature,
        registerSplitViewFeature,
        registerDropdownsFeature,
        registerViewNavigationFeature,
        registerQuickAddFeature,
        registerUniversalModalFeature,
        registerOrchestrationFeature,
        registerSplitTaskFeature,
        registerPickerControlsFeature,
        registerPoolInteractionsFeature,
        registerSearchFeature,
        registerSidebarStatsFeature,
        registerSidebarFeature,
        registerMobileUiFeature,
        registerScheduleFeature,
        registerScheduleInteractionsFeature,
        registerAuthFeature,
        registerSettingsSyncFeature,
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
            splitViewFeature = registerSplitViewFeature({
                refs: {
                    trackListData,
                    sidebarTab,
                },
                split: splitStateUtils,
            });
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
            let importDataFeature;

            let {
                midiManagerExpandedGroups,
                projectMidiGroups,
                projectMidiList,
                filteredMidiGroups,
            } = createRootMidiManagerState();

            const getNameWithGroup = (...args) => searchFeature.getNameWithGroup(...args);

            const sidebarFeature = registerSidebarFeature({
                refs: {
                    sidebarWidth,
                    isMobile,
                    sidebarTab,
                },
                services: {
                    storageService,
                },
                actions: {
                    isDragActive: () => !!dragState.dragElClone,
                    triggerTouchHaptic: triggerTouchHaptic,
                },
            });
            const isSidebarOpen = sidebarFeature.isSidebarOpen;

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

            const mobileTouchFeatureProxy = createLazyFeatureProxy({
                loadFeature: () => loadMobileTouchRegistration()
                    .then((registerMobileTouchFeature) => registerMobileTouchFeature({
                        refs: {
                            isMobile,
                            mobileTab,
                            currentView,
                            weekContainer,
                            scheduledTasks,
                            pxPerMin,
                            sidebarTab,
                            currentSessionId,
                            lastTapState: store.lastTapState,
                            isResizingMobile,
                            mobileResizeState: store.mobileResizeState,
                        },
                        state: dragState,
                        data: {
                            getSettings: () => settings,
                        },
                        utils: {
                            timeToMinutes: timeUtils.timeToMinutes,
                            formatSecs: formatUtils.formatSecs,
                            parseTime: timeUtils.parseTime,
                        },
                        actions: {
                            changeDate: (...args) => changeDate(...args),
                            isTaskGhost: (...args) => isTaskGhost(...args),
                            jumpToGhostContext: (...args) => jumpToGhostContext(...args),
                            handleTaskDblClick: (...args) => handleTaskDblClick(...args),
                            selectTask: (...args) => selectTask(...args),
                            triggerTouchHaptic: triggerTouchHaptic,
                            checkOverlap: (...args) => checkOverlap(...args),
                            openAlertModal: (...args) => openAlertModal(...args),
                            pushHistory: () => pushHistory(),
                        },
                    })),
            });
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

            universalModalFeature = registerUniversalModalFeature({
                refs: {
                    showConfirmModal,
                    confirmModalConfig,
                    showInputModal,
                    inputModalConfig,
                    universalInputRef,
                },
                actions: {
                    triggerTouchHaptic: triggerTouchHaptic,
                    switchView,
                },
            });
            const {
                openAlertModal,
                openConfirmModal,
                closeConfirmModal,
                handleConfirmAction,
                openInputModal,
                closeInputModal,
                confirmInputModal,
            } = universalModalFeature;
            const avatarCropFeatureProxy = createLazyFeatureProxy({
                loadFeature: () => loadAvatarCropFeature()
                    .then((registerAvatarCropFeature) => registerAvatarCropFeature({
                        refs: {
                            showCropModal,
                            cropImgSrc,
                            cropImgRef,
                            authLoading,
                            user,
                        },
                        services: {
                            supabaseService,
                        },
                        actions: {
                            openAlertModal,
                        },
                    })),
            });
            const onFileSelect = avatarCropFeatureProxy.method('onFileSelect');
            const cancelCrop = avatarCropFeatureProxy.method('cancelCrop');
            const confirmCrop = avatarCropFeatureProxy.method('confirmCrop');

            const settings = createRootSettingsState();
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

            const dropdownsFeature = registerDropdownsFeature({
                refs: {
                    activeDropdown,
                    showMobileMenu,
                    showProfileMenu,
                    settingsGroupFocus,
                    showGroupSuggestions,
                    editingItem,
                },
                state: {
                    settings,
                    newItem,
                },
                actions: {
                    onMusicianSelect: () => onMusicianSelect(),
                    getSettingsNameFocus: () => settingsNameFocus,
                    getActiveRecDropdown: () => activeRecDropdown,
                },
            });
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

            ratioFeature = registerRatioFeature({
                refs: {
                    trackListData,
                    showTrackList,
                    sidebarTab,
                    itemPool,
                    scheduledTasks,
                    currentSessionId,
                    musicianStats: { get value() { return musicianStats.value; } },
                },
                state: {
                    settings,
                },
                utils: {
                    parseTime: timeUtils.parseTime,
                    formatSecs: formatUtils.formatSecs,
                },
                actions: {
                    ensureItemSplitViews: splitStateUtils.ensureItemSplitViews,
                    pushHistory: () => pushHistory(),
                    openConfirmModal,
                    openAlertModal,
                },
            });
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

            historyFeature = registerHistoryFeature({
                refs: {
                    itemPool,
                    scheduledTasks,
                    history,
                    historyIndex,
                    showTrackList,
                    trackListData,
                    currentSessionId,
                },
                state: {
                    settings,
                },
                actions: {
                    isItemVisibleForView,
                    syncItemsForView,
                },
            });
            const {
                pushHistory,
                undo,
                redo,
            } = historyFeature;

            sessionFeature = registerSessionFeature({
                refs: {
                    currentSessionId,
                    activeDropdown,
                },
                state: {
                    settings,
                },
                utils: {
                    generateUniqueId: idUtils.generateUniqueId,
                },
                actions: {
                    openInputModal,
                    openConfirmModal,
                    openAlertModal,
                    pushHistory,
                    triggerTouchHaptic: triggerTouchHaptic,
                },
            });
            const {
                currentSessionName,
                switchSession,
                handleSessionAction,
            } = sessionFeature;

            const pickerControlsFeature = registerPickerControlsFeature({
                refs: {
                    showDurationPicker: store.showDurationPicker,
                    tempDuration: store.tempDuration,
                    pickerMinRef: store.pickerMinRef,
                    pickerSecRef: store.pickerSecRef,
                    pickerPos: store.pickerPos,
                },
                utils: {
                    calculateEstTime,
                },
                actions: {
                    pushHistory,
                    triggerTouchHaptic: triggerTouchHaptic,
                },
            });
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

            nameLookupFeature = registerNameLookupFeature({
                state: {
                    settings,
                },
            });
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
            const metadataModalsFeatureProxy = createLazyFeatureProxy({
                loadFeature: () => loadMetadataModalsFeature()
                    .then((registerMetadataModalsFeature) => {
                        const metadataModalsFeature = registerMetadataModalsFeature({
                            refs: {
                                trackListData,
                                sidebarTab,
                                itemPool,
                                scheduledTasks,
                                currentSessionId,
                                showCreditModal,
                                generatedCreditText,
                                showProjectInfoModal,
                                showRecInfoModal,
                                recInfoForm,
                                activeRecDropdown,
                                recDropdownSearch,
                                newRecInputs,
                                projectInfoForm,
                            },
                            state: {
                                settings,
                            },
                            utils: {
                                generateUniqueId: idUtils.generateUniqueId,
                                getNameById,
                            },
                            actions: {
                                pushHistory,
                                triggerTouchHaptic: triggerTouchHaptic,
                                openConfirmModal,
                                openAlertModal,
                            },
                        });
                        metadataModalsFeatureRef.value = metadataModalsFeature;
                        return metadataModalsFeature;
                    }),
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
            const dataIoFeatureProxy = createLazyFeatureProxy({
                loadFeature: () => loadDataIoFeature()
                    .then((registerDataIoFeature) => {
                        const dataIoFeature = registerDataIoFeature({
                            refs: {
                                itemPool,
                                scheduledTasks,
                                currentSessionId,
                            },
                            state: {
                                settings,
                            },
                            utils: {
                                parseTime: timeUtils.parseTime,
                                getNameById,
                            },
                            actions: {
                                openInputModal,
                                openAlertModal,
                                pushHistory,
                            },
                            ioState: {
                                showImportModal,
                                showExportModal,
                                exportFilter,
                            },
                        });
                        dataIoFeatureRef.value = dataIoFeature;
                        return dataIoFeature;
                    }),
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
            const appRuntimeFeature = registerAppRuntimeFeature({
                refs: {
                    itemPool,
                    scheduledTasks,
                    currentSessionId,
                    user,
                    saveStatus,
                    currentView,
                    monthViewMode,
                    viewDate,
                    isBootstrappingData,
                },
                values: {
                    isSidebarOpen,
                },
                handlers: {
                    handleGlobalKey: (...args) => handleGlobalKey(...args),
                    handleResizeMove: (...args) => handleResizeMove(...args),
                    handleResizeEnd: (...args) => handleResizeEnd(...args),
                    closeDropdowns: (...args) => closeDropdowns(...args),
                },
                state: {
                    settings,
                },
                services: {
                    storageService,
                },
                actions: {
                    triggerTouchHaptic: triggerTouchHaptic,
                    scrollToMonthDate: (date) => scrollToMonthDate(date),
                    bootSessionData: (options) => authFeature.bootSessionData(options),
                    saveToCloud: () => saveToCloud(),
                    nextTick,
                },
                vue: {
                    watch,
                },
            });
            appRuntimeFeature.mountAppRuntime();
            onMounted(() => appRuntimeFeature.mountAppLifecycle());
            onUnmounted(() => appRuntimeFeature.unmountAppLifecycle());

            const isScheduled = (...args) => scheduleFeature.isScheduled(...args);

            const handlePoolItemClick = (...args) => poolInteractionsFeature.handlePoolItemClick(...args);

            // 4. 辅助：全局日程块自动调整
            const autoResizeSchedules = (taskIds) => scheduleFeature.autoResizeSchedules(taskIds);

            // --- V9.7.4 名称和颜色查找器 (新增项目类型) ---

            orchestrationFeature = registerOrchestrationFeature({
                refs: {
                    editingItem,
                    showEditor,
                    sidebarTab,
                    itemPool,
                    scheduledTasks,
                    currentSessionId,
                },
                state: {
                    settings,
                },
                utils: {
                    getNameById,
                },
                actions: {
                    triggerTouchHaptic: triggerTouchHaptic,
                },
            });
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

            quickAddFeature = registerQuickAddFeature({
                refs: {
                    quickAddType,
                    quickAddForm,
                    showQuickAddModal,
                    activeDropdown,
                    itemPool,
                    currentSessionId,
                    isMobile,
                    showMobileTaskInput,
                },
                state: {
                    settings,
                    newItem,
                },
                utils: {
                    getExistingGroups: (...args) => getExistingGroups(...args),
                    generateUniqueId: idUtils.generateUniqueId,
                    generateRandomHexColor,
                    getDefaultRatio,
                    getNameById,
                    calculateEstTime,
                    ensureItemRecords,
                },
                actions: {
                    openAlertModal,
                    pushHistory,
                    triggerTouchHaptic: triggerTouchHaptic,
                },
            });
            const {
                currentQuickAddGroups,
                openQuickAdd,
                onMusicianSelect,
                confirmQuickAdd,
                addItemToPool,
            } = quickAddFeature;

            const scheduleInteractionsFeature = registerScheduleInteractionsFeature({
                refs: {
                    scheduledTasks,
                    itemPool,
                    pxPerMin,
                    sidebarTab,
                    currentSessionId,
                    isMobile,
                    trackListData,
                    showTrackList,
                    trackListContainerRef,
                },
                state: {
                    settings,
                },
                utils: {
                    parseTime: timeUtils.parseTime,
                    formatSecs: formatUtils.formatSecs,
                },
                actions: {
                    checkOverlap: (...args) => checkOverlap(...args),
                    openAlertModal,
                    triggerTouchHaptic: triggerTouchHaptic,
                    pushHistory,
                    isResourceCompleted: (...args) => isResourceCompleted(...args),
                    clearPoolRecord: (...args) => clearPoolRecord(...args),
                    clearAggregateRecords: (...args) => clearAggregateRecords(...args),
                    isContextSwitchingActive: () => isContextSwitching.value,
                    isTaskGhost: (...args) => isTaskGhost(...args),
                    jumpToGhostContext: (...args) => jumpToGhostContext(...args),
                    normalizeSplitViewType: splitStateUtils.normalizeSplitViewType,
                    isItemVisibleForView,
                    syncItemForView,
                    ensureItemRecords,
                    getNameById,
                    autoSortTrackList: (...args) => autoSortTrackList(...args),
                    preloadTrackList: () => { getTrackListFeature(); },
                },
            });
            const dragStart = (...args) => scheduleInteractionsFeature.dragStart(...args);
            const handleDragEnd = (...args) => scheduleInteractionsFeature.handleDragEnd(...args);
            const dragEnterPool = (...args) => scheduleInteractionsFeature.dragEnterPool(...args);
            const dragLeavePool = (...args) => scheduleInteractionsFeature.dragLeavePool(...args);
            const dropToPool = (...args) => scheduleInteractionsFeature.dropToPool(...args);
            const dragEnterSlot = (...args) => scheduleInteractionsFeature.dragEnterSlot(...args);
            const dragLeaveSlot = (...args) => scheduleInteractionsFeature.dragLeaveSlot(...args);
            const dropToSchedule = (...args) => scheduleInteractionsFeature.dropToSchedule(...args);
            const dropToMonth = (...args) => scheduleInteractionsFeature.dropToMonth(...args);


            const desktopResizeFeatureProxy = createLazyFeatureProxy({
                loadFeature: () => loadDesktopResizeFeature()
                    .then((registerDesktopResizeFeature) => registerDesktopResizeFeature({
                        refs: {
                            resizing: store.resizing,
                            pxPerMin,
                        },
                        utils: {
                            timeToMinutes: timeUtils.timeToMinutes,
                            formatSecs: formatUtils.formatSecs,
                            parseTime: timeUtils.parseTime,
                        },
                        actions: {
                            checkOverlap: (...args) => checkOverlap(...args),
                            openAlertModal,
                            triggerTouchHaptic: triggerTouchHaptic,
                            pushHistory,
                        },
                    })),
            });
            const initResize = desktopResizeFeatureProxy.method('initResize');
            const handleResizeMove = desktopResizeFeatureProxy.method('handleResizeMove');
            const handleResizeEnd = desktopResizeFeatureProxy.method('handleResizeEnd');

            const scrollToSidebarItem = (...args) => sidebarFeature.scrollToSidebarItem(...args);

            const poolInteractionsFeature = registerPoolInteractionsFeature({
                refs: {
                    selectedSource,
                    selectedTaskId,
                    selectedPoolIds,
                    lastPoolFocusId,
                    lastPoolClickId,
                    itemPool,
                    scheduledTasks,
                    currentSessionId,
                    sidebarTab,
                    isSidebarOpen,
                    isMobile,
                },
                actions: {
                    getGroupedItemPool: () => groupedItemPool.value,
                    getCurrentSidebarList: () => currentSidebarList.value,
                    isGroupExpanded: (key) => expandedGroups.has(key),
                    isStatExpanded: (id) => expandedStatsIds.has(id),
                    scrollToSidebarItem,
                    smartScrollToTask,
                    triggerTouchHaptic: triggerTouchHaptic,
                },
            });
            const getVisiblePoolItems = (...args) => poolInteractionsFeature.getVisiblePoolItems(...args);

            const selectTask = (...args) => poolInteractionsFeature.selectTask(...args);

            const clearSelection = () => poolInteractionsFeature.clearSelection();

            const getOverlapCount = (...args) => scheduleFeature.getOverlapCount(...args);

            const moveTask = (...args) => scheduleFeature.moveTask(...args);

            const scheduleDeletionFeatureProxy = createLazyFeatureProxy({
                loadFeature: () => loadScheduleDeletionFeature()
                    .then((registerScheduleDeletionFeature) => {
                        scheduleDeletionFeature = registerScheduleDeletionFeature({
                            refs: {
                                itemPool,
                                scheduledTasks,
                                currentSessionId,
                                trackListData,
                                showTrackList,
                                sidebarTab,
                            },
                            state: {
                                musicianStats,
                                projectStats,
                                instrumentStats,
                            },
                            actions: {
                                openAlertModal,
                                pushHistory,
                                triggerTouchHaptic: triggerTouchHaptic,
                                autoUpdateEfficiency,
                            },
                        });
                        return scheduleDeletionFeature;
                    }),
            });
            const isResourceCompleted = scheduleDeletionFeatureProxy.method('isResourceCompleted');
            const deleteCurrentSchedule = scheduleDeletionFeatureProxy.method('deleteCurrentSchedule');
            const clearPoolRecord = scheduleDeletionFeatureProxy.method('clearPoolRecord');
            const clearAggregateRecords = scheduleDeletionFeatureProxy.method('clearAggregateRecords');

            const globalKeyboardFeature = registerGlobalKeyboardFeature({
                refs: {
                    showSettings,
                    showEditor,
                    showTrackList,
                    showAuthModal,
                    showCropModal,
                    showMobileMenu,
                    showColorPickerModal,
                    showMobileTaskInput,
                    showQuickAddModal,
                    showRecInfoModal,
                    showConfirmModal,
                    showInputModal,
                    showSplitModal,
                    showCreditModal,
                    showMidiManager,
                    showMidiImportModal,
                    showCsvImportModal,
                    showProjectInfoModal,
                    showDurationPicker: store.showDurationPicker,
                    showImportModal,
                    showProfileMenu,
                    showGroupSuggestions,
                    activeRecDropdown,
                    activeMidiGroupRow: store.activeMidiGroupRow,
                    activeDropdown,
                    settingsGroupFocus,
                    selectedTaskId,
                    selectedPoolIds,
                    selectedSource,
                    isMobile,
                    currentSessionId,
                    currentView,
                    sidebarTab,
                    sortKey,
                    activeColorKey,
                    scheduledTasks,
                    itemPool,
                    lastPoolFocusId,
                    lastPoolClickId,
                },
                state: {
                    activeImportMenu: store.activeImportMenu,
                    expandedGroups,
                    expandedStatsIds: {
                        has: (id) => expandedStatsIds.has(id),
                        add: (id) => expandedStatsIds.add(id),
                        clear: () => expandedStatsIds.clear(),
                    },
                },
                actions: {
                    closePicker,
                    closeConfirmModal,
                    closeInputModal,
                    closeImportMenu: (...args) => closeImportMenu(...args),
                    toggleAllProjectCollapse: (...args) => toggleAllProjectCollapse(...args),
                    undo: (...args) => undo(...args),
                    redo: (...args) => redo(...args),
                    switchView: (...args) => switchView(...args),
                    selectTask: (...args) => selectTask(...args),
                    moveTask: (...args) => moveTask(...args),
                    checkCanDeleteSplit: (...args) => checkCanDeleteSplit(...args),
                    restoreSplitTime: (...args) => restoreSplitTime(...args),
                    cleanupEmptySchedules: (...args) => cleanupEmptySchedules(...args),
                    clearSelection: (...args) => clearSelection(...args),
                    pushHistory: (...args) => pushHistory(...args),
                    isResourceCompleted: (...args) => isResourceCompleted(...args),
                    clearPoolRecord: (...args) => clearPoolRecord(...args),
                    clearAggregateRecords: (...args) => clearAggregateRecords(...args),
                    openAlertModal: (...args) => openAlertModal(...args),
                    triggerTouchHaptic: (...args) => triggerTouchHaptic(...args),
                    getSettings: () => settings,
                    getSettingsNameFocus: () => settingsNameFocus,
                    getFilteredSidebarList: () => filteredSidebarList.value,
                    getProjectMidiGroups: () => projectMidiGroups.value,
                    getMidiManagerExpandedGroups: () => midiManagerExpandedGroups,
                    getGroupedItemPool: () => groupedItemPool.value,
                    getMusicianStats: () => musicianStats.value,
                },
            });
            const handleGlobalKey = (...args) => globalKeyboardFeature.handleGlobalKey(...args);

            const handleTaskDblClick = (...args) => scheduleInteractionsFeature.handleTaskDblClick(...args);

            // 🟢 修改: checkOverlap (支持分层检测)
            const checkOverlap = (date, startTime, durationStr, excludeId, checkType) =>
                scheduleFeature.checkOverlap(date, startTime, durationStr, excludeId, checkType);

            // 🟢 修改: 增加 shouldSaveHistory 参数，防止拖动时卡顿
            const moveDivider = (dividerIndex, direction, shouldSaveHistory = true) =>
                scheduleFeature.moveDivider(dividerIndex, direction, shouldSaveHistory);

            const notificationsFeatureProxy = createLazyFeatureProxy({
                loadFeature: () => loadNotificationsFeature()
                    .then((registerNotificationsFeature) => registerNotificationsFeature({
                        services: {
                            deviceService,
                        },
                        utils: {
                            getNameById,
                        },
                        actions: {
                            openAlertModal,
                        },
                    })),
            });
            const updateTaskNotification = notificationsFeatureProxy.method('updateTaskNotification');
            const scheduleReminder = notificationsFeatureProxy.method('scheduleReminder');

            const { trackListReady } = createRootTrackListState();
            const trackListFeatureProxy = createLazyFeatureProxy({
                loadFeature: () => loadTrackListFeature()
                    .then((registerTrackListFeature) => {
                        trackListFeature = registerTrackListFeature({
                            refs: {
                                trackListData,
                                trackListContainerRef,
                                draggingSectionIndex,
                                itemPool,
                                scheduledTasks,
                                showTrackList,
                                isMobile,
                                isDark,
                                sidebarTab,
                            },
                            state: {
                                settings,
                            },
                            utils: {
                                parseTime: timeUtils.parseTime,
                                formatSecs: formatUtils.formatSecs,
                                getNameById,
                            },
                            actions: {
                                openAlertModal,
                                openInputModal,
                                pushHistory,
                                autoUpdateEfficiency,
                                checkCanDeleteSplit: (...args) => checkCanDeleteSplit(...args),
                                restoreSplitTime,
                                updateTaskNotification,
                                triggerTouchHaptic: triggerTouchHaptic,
                                moveDivider,
                                pruneEmptySchedules,
                                calculateSingleRatio,
                            },
                        });
                        trackListReady.value = true;
                        return trackListFeature;
                    }),
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
            const switchSidebarTab = sidebarFeature.switchSidebarTab;

            splitTaskFeature = registerSplitTaskFeature({
                refs: {
                    showSplitModal,
                    itemPool,
                    scheduledTasks,
                    trackListData,
                    currentSessionId,
                    showTrackList,
                },
                split: {
                    ...splitStateUtils,
                    getSplitViewState,
                    isItemVisibleInView: isItemVisibleForView,
                    peekSplitViewState,
                },
                utils: {
                    parseTime: timeUtils.parseTime,
                    timeToMinutes: timeUtils.timeToMinutes,
                    formatSecs: formatUtils.formatSecs,
                    generateUniqueId: idUtils.generateUniqueId,
                    calculateEstTime,
                },
                actions: {
                    getCurrentSplitView,
                    syncItemForView,
                    ensureItemRecords,
                    openAlertModal,
                    openInputModal,
                    pushHistory,
                    autoUpdateEfficiency,
                    autoSortTrackList,
                    triggerTouchHaptic: triggerTouchHaptic,
                },
            });
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

            const taskEditorFeatureProxy = createLazyFeatureProxy({
                loadFeature: () => loadTaskEditorFeature()
                    .then((registerTaskEditorFeature) => registerTaskEditorFeature({
                        refs: {
                            itemPool,
                            scheduledTasks,
                            editingItem,
                            editingSource,
                            showEditor,
                            sidebarTab,
                            trackListData,
                        },
                        split: {
                            ...splitStateUtils,
                            getSplitViewState,
                            syncFamilyLegacyFields,
                            syncFamilySharedIdentity,
                            syncFamilyOrchestration,
                            syncScheduledDurationsFromFamily,
                        },
                        utils: {
                            calculateEstTime,
                            getDefaultRatio,
                        },
                        actions: {
                            checkCanDeleteSplit,
                            restoreSplitTime,
                            clearPoolRecord: (...args) => clearPoolRecord(...args),
                            clearAggregateRecords: (...args) => clearAggregateRecords(...args),
                            cleanupEmptySchedules,
                            openAlertModal,
                            autoUpdateEfficiency,
                            updateTaskNotification,
                            pushHistory,
                            cancelNotification: (notificationId) => deviceService.cancelNotification(notificationId),
                        },
                    })),
            });
            const openEditModal = taskEditorFeatureProxy.method('openEditModal');
            const saveEdit = taskEditorFeatureProxy.method('saveEdit');
            const deleteEditingItem = taskEditorFeatureProxy.method('deleteEditingItem');

            scheduleFeature = registerScheduleFeature({
                refs: {
                    itemPool,
                    scheduledTasks,
                    currentSessionId,
                    trackListData,
                    showTrackList,
                    pxPerMin,
                    sidebarTab,
                    currentView,
                    viewDate,
                },
                state: {
                    settings,
                },
                utils: {
                    parseTime: timeUtils.parseTime,
                    timeToMinutes: timeUtils.timeToMinutes,
                    getNameById,
                    addDaysToDate: timeUtils.addDaysToDate,
                    addMinutesToTimeValue: timeUtils.addMinutesToTimeValue,
                },
                actions: {
                    pushHistory,
                    triggerTouchHaptic: triggerTouchHaptic,
                    getCurrentWeekDays: () => currentWeekDays.value,
                },
            });
            const settingsSyncFeature = registerSettingsSyncFeature({
                refs: {
                    settingsExpandedGroups,
                    settingsGroupFocus,
                },
                state: {
                    settings,
                },
                utils: {
                    generateUniqueId: idUtils.generateUniqueId,
                    generateRandomHexColor,
                },
                actions: {},
            });
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
            let allSettingsGrouped = settingsSyncFeature.allSettingsGrouped;
            const settingsFeatureProxy = createLazyFeatureProxy({
                loadFeature: () => loadSettingsFeature()
                    .then((registerSettingsFeature) => {
                        settingsFeature = registerSettingsFeature({
                            refs: {
                                itemPool,
                                scheduledTasks,
                                settingsExpandedGroups,
                                newSettingsItem,
                                settingsGroupFocus,
                            },
                            state: {
                                settings,
                            },
                            utils: {
                                generateUniqueId: idUtils.generateUniqueId,
                                generateRandomHexColor,
                            },
                            actions: {
                                pushHistory,
                                triggerTouchHaptic: triggerTouchHaptic,
                                openConfirmModal,
                                openAlertModal,
                                cleanupEmptySchedules,
                                autoUpdateEfficiency,
                            },
                        });
                        allSettingsGrouped = computed(() => settingsFeature.getAllSettingsGrouped());
                        return settingsFeature;
                    }),
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

            const importDataFeatureProxy = createLazyFeatureProxy({
                loadFeature: () => loadImportDataFeature().then(({ registerImportDataFeature, csvUtils, midiUtils }) => {
                    importDataFeature = registerImportDataFeature({
                        refs: {
                            csvSearchQuery: store.csvSearchQuery,
                            csvImportData: store.csvImportData,
                            csvImportConfig: store.csvImportConfig,
                            activeImportTab: store.activeImportTab,
                            collapsedProjects: store.collapsedProjects,
                            rawCsvRows: store.rawCsvRows,
                            csvHeadersMap: store.csvHeadersMap,
                            showCsvImportModal,
                            itemPool,
                            scheduledTasks,
                            currentSessionId,
                            managingProject,
                            showMidiImportModal,
                            midiImportData: store.midiImportData,
                            midiBpm: store.midiBpm,
                            midiTempoMap: store.midiTempoMap,
                            midiTimeSigs: store.midiTimeSigs,
                            midiViewMode: store.midiViewMode,
                            midiTimeSig: store.midiTimeSig,
                            activeImportMenu: store.activeImportMenu,
                            importMenuPos: store.importMenuPos,
                            importSearchQuery: store.importSearchQuery,
                        },
                        state: {
                            settings,
                        },
                        utils: {
                            formatSecs: formatUtils.formatSecs,
                            parseTime: timeUtils.parseTime,
                            normalizeDate: csvUtils.normalizeDate,
                            getOrchString: csvUtils.getOrchString,
                            getNameById,
                            getOrCreateSettingItem,
                            calculateEstTime,
                            generateUniqueId: idUtils.generateUniqueId,
                            buildTempoMap: midiUtils.buildTempoMap,
                            buildTimeSigMap: midiUtils.buildTimeSigMap,
                            extractNotesFromJZZTrack: midiUtils.extractNotesFromJZZTrack,
                            calculateBarQuantizedDuration: midiUtils.calculateBarQuantizedDuration,
                            normalizeForMatch: midiUtils.normalizeForMatch,
                            generateRandomHexColor,
                        },
                        actions: {
                            openAlertModal,
                            pushHistory,
                            autoUpdateEfficiency,
                            autoResizeSchedules,
                            triggerTouchHaptic: triggerTouchHaptic,
                            sortedInstruments,
                            nextTick,
                        },
                    });
                    groupedCsvData = importDataFeature.groupedCsvData;
                    isAllSelected = importDataFeature.isAllSelected;
                    availableInstrumentGroups = importDataFeature.availableInstrumentGroups;
                    midiGroupExpanded = importDataFeature.midiGroupExpanded;
                    midiGroupData = importDataFeature.midiGroupData;
                    currentMidiDisplayList = importDataFeature.currentMidiDisplayList;
                    filteredImportOptions = importDataFeature.filteredImportOptions;
                    return importDataFeature;
                }),
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

            authFeature = registerAuthFeature({
                refs: {
                    user,
                    showAuthModal,
                    authLoading,
                    authForm,
                    activeDropdown,
                    showProfileMenu,
                    showMobileMenu,
                    tempAvatarUrl: store.tempAvatarUrl,
                    tempNickname,
                    localDataVersion,
                    saveStatus,
                    isSyncing,
                    itemPool,
                    scheduledTasks,
                    currentSessionId,
                },
                state: {
                    settings,
                },
                utils: {
                    formatDate: formatUtils.formatDate,
                    ensureItemRecords,
                    calculateEstTime,
                    generateUniqueId: idUtils.generateUniqueId,
                },
                services: {
                    storageService,
                    supabaseService,
                },
                actions: {
                    pushHistory,
                    openAlertModal,
                    openConfirmModal,
                    triggerTouchHaptic: triggerTouchHaptic,
                    setSaveStatus: (value) => {
                        saveStatus.value = value;
                    },
                },
            });
            const toggleProjectCollapse = importDataFeatureProxy.method('toggleProjectCollapse');
            const toggleAllProjectCollapse = importDataFeatureProxy.method('toggleAllProjectCollapse');
            const toggleMidiGroupExpand = importDataFeatureProxy.method('toggleMidiGroupExpand');
            const findGroupSmart = importDataFeatureProxy.method('findGroupSmart');
            const openImportMenu = importDataFeatureProxy.method('openImportMenu');
            const closeImportMenu = importDataFeatureProxy.method('closeImportMenu');
            const selectImportInst = importDataFeatureProxy.method('selectImportInst');
            const selectImportNewInst = importDataFeatureProxy.method('selectImportNewInst');
            const selectImportGroup = importDataFeatureProxy.method('selectImportGroup');
            const midiManagerFeatureProxy = createLazyFeatureProxy({
                loadFeature: () => loadMidiManagerFeature()
                    .then((registerMidiManagerFeature) => {
                        midiManagerFeature = registerMidiManagerFeature({
                            refs: {
                                showMidiManager,
                                managingProject,
                                activeMidiGroupRow: store.activeMidiGroupRow,
                                midiGroupPos: store.midiGroupPos,
                                midiGroupSearchQuery: store.midiGroupSearchQuery,
                                newItem,
                                itemPool,
                                scheduledTasks,
                                currentSessionId,
                                showMobileTaskInput,
                                isMobile,
                            },
                            state: {
                                settings,
                            },
                            utils: {
                                calculateEstTime,
                                getNameById,
                            },
                            actions: {
                                getAvailableInstrumentGroups: () => availableInstrumentGroups,
                                openConfirmModal,
                                pushHistory,
                                triggerTouchHaptic: triggerTouchHaptic,
                            },
                        });
                        midiManagerExpandedGroups = midiManagerFeature.midiManagerExpandedGroups;
                        projectMidiList = midiManagerFeature.projectMidiList;
                        projectMidiGroups = midiManagerFeature.projectMidiGroups;
                        filteredMidiGroups = midiManagerFeature.filteredMidiGroups;
                        return midiManagerFeature;
                    }),
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
            searchFeature = registerSearchFeature({
                refs: {
                    itemPool,
                    scheduledTasks,
                    globalSearchQuery,
                    currentSearchIndex: store.currentSearchIndex,
                    searchHighlightTimer: store.searchHighlightTimer,
                    lastHighlightedTrackId: store.lastHighlightedTrackId,
                    lastTrackSearchQuery: store.lastTrackSearchQuery,
                    trackSearchIndex: store.trackSearchIndex,
                    trackListSearchQuery: store.trackListSearchQuery,
                    trackListData,
                    showTrackList,
                    isSearchFocused,
                    isMobile,
                },
                state: {
                    sidebarTab,
                    settings,
                    musicianStats: { get value() { return musicianStats.value; } },
                    projectStats: { get value() { return projectStats.value; } },
                    instrumentStats: { get value() { return instrumentStats.value; } },
                },
                utils: {
                    getNameById,
                },
                actions: {
                    openAlertModal,
                    smartScrollToTask,
                    triggerTouchHaptic: triggerTouchHaptic,
                    getSidebarList: () => currentSidebarList.value,
                },
            });
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

            const sidebarStatsFeature = registerSidebarStatsFeature({
                refs: {
                    itemPool,
                    scheduledTasks,
                    currentSessionId,
                    globalSearchQuery,
                    sidebarTab,
                    sortField,
                    sortAsc,
                    statClickIndexMap: store.statClickIndexMap,
                    isMobile,
                    expandedGroups,
                },
                state: {
                    settings,
                },
                utils: {
                    parseTime: timeUtils.parseTime,
                    formatSecs: formatUtils.formatSecs,
                    calculateEstTime,
                    getNameById,
                    getFullSearchText,
                    smartMatch,
                    isItemVisibleForView,
                    peekSplitViewState,
                },
                actions: {
                    pushHistory,
                    openAlertModal,
                    smartScrollToTask,
                    triggerTouchHaptic: triggerTouchHaptic,
                },
            });
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
            currentSidebarList = sidebarStatsFeature.currentSidebarList;

            const viewNavigationFeature = registerViewNavigationFeature({
                refs: {
                    currentView,
                    monthViewMode,
                    viewDate,
                    visibleTopDate,
                    monthObserver,
                    monthRefs,
                    filteredScheduledTasks,
                    weekContainer,
                    pxPerMin,
                    isMobile,
                    flashingTaskId,
                    mobileTab,
                    dayColWidth,
                    isResizingMobile,
                    currentSessionId,
                    sidebarTab,
                    isContextSwitching,
                },
                state: {
                    settings,
                },
                services: {
                    storageService,
                },
                utils: {
                    formatDate: formatUtils.formatDate,
                    timeToMinutes: timeUtils.timeToMinutes,
                },
                actions: {
                    isDragActive: () => !!dragState.dragElClone,
                    triggerTouchHaptic: triggerTouchHaptic,
                },
            });
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

            const handlePageUnload = authFeature.handlePageUnload;

            // --- 🟢 手机端适配逻辑 ---
            // --- 🟢 手机端适配 & 布局自动修复 ---
            mobileUiFeature = registerMobileUiFeature({
                refs: {
                    isMobile,
                    isSidebarOpen,
                    showMobileMenu,
                    showProfileMenu,
                    activeDropdown,
                    themeMode,
                    isDark,
                },
                services: {
                    storageService,
                },
                actions: {
                    handlePageUnload,
                },
            });
            getThemeLabel = mobileUiFeature.getThemeLabel;

            // 🟢 优化: 增强版布局刷新函数

            const tourFeatureProxy = createLazyFeatureProxy({
                loadFeature: () => loadTourFeature()
                    .then((registerTourFeature) => registerTourFeature({
                        refs: {
                            isMobile,
                            isSidebarOpen,
                            mobileTab,
                            showMobileTaskInput,
                            sidebarScrollRef,
                        },
                        services: {
                            storageService,
                        },
                    })),
            });
            const startTour = tourFeatureProxy.method('startTour');
            const mountTourAutostart = tourFeatureProxy.method('mountTourAutostart');

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
