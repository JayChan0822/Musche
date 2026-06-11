import { createLazyFeatureProxy } from './lazy-feature-proxy.js';

// 懒加载 feature 的接线表：refs/helpers 一律在 loadFeature 执行时（运行期）
// 才从 assembly 取值，此时全部 state 与别名都已发布，无注册顺序问题。
// onLoaded 由 app.js 传入，用于把加载结果回填到组合根的局部别名上。
export function createAppLazyFeatureWirings({ loaders } = {}) {
    if (!loaders) {
        throw new TypeError('createAppLazyFeatureWirings requires the app feature loaders');
    }
    const {
        loadNotificationsFeature,
        loadDesktopResizeFeature,
        loadScheduleDeletionFeature,
        loadAvatarCropFeature,
        loadImportDataFeature,
        loadDataIoFeature,
        loadMetadataModalsFeature,
        loadTourFeature,
        loadMidiManagerFeature,
        loadTaskEditorFeature,
        loadMobileTouchRegistration,
        loadTrackListFeature,
        loadSettingsFeature,
    } = loaders;

    const resolveLoaded = (onLoaded, feature) => (onLoaded ? (onLoaded(feature) ?? feature) : feature);

    function wireNotificationsFeature(assembly) {
        return createLazyFeatureProxy({
            loadFeature: () => loadNotificationsFeature()
                .then((registerNotificationsFeature) => registerNotificationsFeature({
                    services: {
                        deviceService: assembly.services.deviceService,
                    },
                    utils: {
                        getNameById: (...args) => assembly.features.nameLookup.getNameById(...args),
                    },
                    actions: {
                        openAlertModal: (...args) => assembly.helpers.openAlertModal(...args),
                    },
                })),
        });
    }

    function wireDesktopResizeFeature(assembly) {
        return createLazyFeatureProxy({
            loadFeature: () => loadDesktopResizeFeature()
                .then((registerDesktopResizeFeature) => {
                    const { resizing, pxPerMin } = assembly.refs;
                    const { timeUtils, formatUtils } = assembly.utils;
                    return registerDesktopResizeFeature({
                        refs: {
                            resizing,
                            pxPerMin,
                        },
                        utils: {
                            timeToMinutes: timeUtils.timeToMinutes,
                            formatSecs: formatUtils.formatSecs,
                            parseTime: timeUtils.parseTime,
                        },
                        actions: {
                            checkOverlap: (...args) => assembly.helpers.checkOverlap(...args),
                            openAlertModal: (...args) => assembly.helpers.openAlertModal(...args),
                            triggerTouchHaptic: assembly.services.triggerTouchHaptic,
                            pushHistory: (...args) => assembly.helpers.pushHistory(...args),
                        },
                    });
                }),
        });
    }

    function wireScheduleDeletionFeature(assembly, { onLoaded } = {}) {
        return createLazyFeatureProxy({
            loadFeature: () => loadScheduleDeletionFeature()
                .then((registerScheduleDeletionFeature) => {
                    const {
                        itemPool,
                        scheduledTasks,
                        currentSessionId,
                        trackListData,
                        showTrackList,
                        sidebarTab,
                        musicianStats,
                        projectStats,
                        instrumentStats,
                    } = assembly.refs;
                    const feature = registerScheduleDeletionFeature({
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
                            openAlertModal: (...args) => assembly.helpers.openAlertModal(...args),
                            pushHistory: (...args) => assembly.helpers.pushHistory(...args),
                            triggerTouchHaptic: assembly.services.triggerTouchHaptic,
                            autoUpdateEfficiency: (...args) => assembly.features.ratio.autoUpdateEfficiency(...args),
                        },
                    });
                    return resolveLoaded(onLoaded, feature);
                }),
        });
    }

    function wireAvatarCropFeature(assembly) {
        return createLazyFeatureProxy({
            loadFeature: () => loadAvatarCropFeature()
                .then((registerAvatarCropFeature) => {
                    const { showCropModal, cropImgSrc, cropImgRef, authLoading, user } = assembly.refs;
                    return registerAvatarCropFeature({
                        refs: {
                            showCropModal,
                            cropImgSrc,
                            cropImgRef,
                            authLoading,
                            user,
                        },
                        services: {
                            supabaseService: assembly.services.supabaseService,
                        },
                        actions: {
                            openAlertModal: (...args) => assembly.helpers.openAlertModal(...args),
                        },
                    });
                }),
        });
    }

    function wireImportDataFeature(assembly, { onLoaded } = {}) {
        return createLazyFeatureProxy({
            loadFeature: () => loadImportDataFeature().then(({ registerImportDataFeature, csvUtils, midiUtils }) => {
                const refs = assembly.refs;
                const { timeUtils, formatUtils, idUtils } = assembly.utils;
                const { helpers } = assembly;
                const feature = registerImportDataFeature({
                    refs: {
                        csvSearchQuery: refs.csvSearchQuery,
                        csvImportData: refs.csvImportData,
                        csvImportConfig: refs.csvImportConfig,
                        activeImportTab: refs.activeImportTab,
                        collapsedProjects: refs.collapsedProjects,
                        rawCsvRows: refs.rawCsvRows,
                        csvHeadersMap: refs.csvHeadersMap,
                        showCsvImportModal: refs.showCsvImportModal,
                        itemPool: refs.itemPool,
                        scheduledTasks: refs.scheduledTasks,
                        currentSessionId: refs.currentSessionId,
                        managingProject: refs.managingProject,
                        showMidiImportModal: refs.showMidiImportModal,
                        midiImportData: refs.midiImportData,
                        midiBpm: refs.midiBpm,
                        midiTempoMap: refs.midiTempoMap,
                        midiTimeSigs: refs.midiTimeSigs,
                        midiViewMode: refs.midiViewMode,
                        midiTimeSig: refs.midiTimeSig,
                        activeImportMenu: refs.activeImportMenu,
                        importMenuPos: refs.importMenuPos,
                        importSearchQuery: refs.importSearchQuery,
                    },
                    state: {
                        settings: assembly.state.settings,
                    },
                    utils: {
                        formatSecs: formatUtils.formatSecs,
                        parseTime: timeUtils.parseTime,
                        normalizeDate: csvUtils.normalizeDate,
                        getOrchString: csvUtils.getOrchString,
                        getNameById: (...args) => assembly.features.nameLookup.getNameById(...args),
                        getOrCreateSettingItem: (...args) => helpers.getOrCreateSettingItem(...args),
                        calculateEstTime: (...args) => assembly.features.ratio.calculateEstTime(...args),
                        generateUniqueId: idUtils.generateUniqueId,
                        buildTempoMap: midiUtils.buildTempoMap,
                        buildTimeSigMap: midiUtils.buildTimeSigMap,
                        extractNotesFromJZZTrack: midiUtils.extractNotesFromJZZTrack,
                        calculateBarQuantizedDuration: midiUtils.calculateBarQuantizedDuration,
                        normalizeForMatch: midiUtils.normalizeForMatch,
                        generateRandomHexColor: (...args) => assembly.features.pickerControls.generateRandomHexColor(...args),
                    },
                    actions: {
                        openAlertModal: (...args) => helpers.openAlertModal(...args),
                        pushHistory: (...args) => helpers.pushHistory(...args),
                        autoUpdateEfficiency: (...args) => assembly.features.ratio.autoUpdateEfficiency(...args),
                        autoResizeSchedules: (...args) => helpers.autoResizeSchedules(...args),
                        triggerTouchHaptic: assembly.services.triggerTouchHaptic,
                        sortedInstruments: refs.sortedInstruments,
                        nextTick: assembly.vue.nextTick,
                    },
                });
                return resolveLoaded(onLoaded, feature);
            }),
        });
    }

    function wireDataIoFeature(assembly, { onLoaded } = {}) {
        return createLazyFeatureProxy({
            loadFeature: () => loadDataIoFeature()
                .then((registerDataIoFeature) => {
                    const {
                        itemPool,
                        scheduledTasks,
                        currentSessionId,
                        showImportModal,
                        showExportModal,
                        exportFilter,
                    } = assembly.refs;
                    const { timeUtils } = assembly.utils;
                    const feature = registerDataIoFeature({
                        refs: {
                            itemPool,
                            scheduledTasks,
                            currentSessionId,
                        },
                        state: {
                            settings: assembly.state.settings,
                        },
                        utils: {
                            parseTime: timeUtils.parseTime,
                            getNameById: (...args) => assembly.features.nameLookup.getNameById(...args),
                        },
                        actions: {
                            openInputModal: (...args) => assembly.helpers.openInputModal(...args),
                            openAlertModal: (...args) => assembly.helpers.openAlertModal(...args),
                            pushHistory: (...args) => assembly.helpers.pushHistory(...args),
                        },
                        ioState: {
                            showImportModal,
                            showExportModal,
                            exportFilter,
                        },
                    });
                    return resolveLoaded(onLoaded, feature);
                }),
        });
    }

    function wireMetadataModalsFeature(assembly, { onLoaded } = {}) {
        return createLazyFeatureProxy({
            loadFeature: () => loadMetadataModalsFeature()
                .then((registerMetadataModalsFeature) => {
                    const {
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
                    } = assembly.refs;
                    const { idUtils } = assembly.utils;
                    const feature = registerMetadataModalsFeature({
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
                            settings: assembly.state.settings,
                        },
                        utils: {
                            generateUniqueId: idUtils.generateUniqueId,
                            getNameById: (...args) => assembly.features.nameLookup.getNameById(...args),
                        },
                        actions: {
                            pushHistory: (...args) => assembly.helpers.pushHistory(...args),
                            triggerTouchHaptic: assembly.services.triggerTouchHaptic,
                            openConfirmModal: (...args) => assembly.helpers.openConfirmModal(...args),
                            openAlertModal: (...args) => assembly.helpers.openAlertModal(...args),
                        },
                    });
                    return resolveLoaded(onLoaded, feature);
                }),
        });
    }

    function wireTourFeature(assembly) {
        return createLazyFeatureProxy({
            loadFeature: () => loadTourFeature()
                .then((registerTourFeature) => {
                    const {
                        isMobile,
                        isSidebarOpen,
                        mobileTab,
                        showMobileTaskInput,
                        sidebarScrollRef,
                    } = assembly.refs;
                    return registerTourFeature({
                        refs: {
                            isMobile,
                            isSidebarOpen,
                            mobileTab,
                            showMobileTaskInput,
                            sidebarScrollRef,
                        },
                        services: {
                            storageService: assembly.services.storageService,
                        },
                    });
                }),
        });
    }

    function wireMidiManagerFeature(assembly, { onLoaded } = {}) {
        return createLazyFeatureProxy({
            loadFeature: () => loadMidiManagerFeature()
                .then((registerMidiManagerFeature) => {
                    const refs = assembly.refs;
                    const feature = registerMidiManagerFeature({
                        refs: {
                            showMidiManager: refs.showMidiManager,
                            managingProject: refs.managingProject,
                            activeMidiGroupRow: refs.activeMidiGroupRow,
                            midiGroupPos: refs.midiGroupPos,
                            midiGroupSearchQuery: refs.midiGroupSearchQuery,
                            newItem: refs.newItem,
                            itemPool: refs.itemPool,
                            scheduledTasks: refs.scheduledTasks,
                            currentSessionId: refs.currentSessionId,
                            showMobileTaskInput: refs.showMobileTaskInput,
                            isMobile: refs.isMobile,
                        },
                        state: {
                            settings: assembly.state.settings,
                        },
                        utils: {
                            calculateEstTime: (...args) => assembly.features.ratio.calculateEstTime(...args),
                            getNameById: (...args) => assembly.features.nameLookup.getNameById(...args),
                        },
                        actions: {
                            getAvailableInstrumentGroups: () => assembly.refs.availableInstrumentGroups,
                            openConfirmModal: (...args) => assembly.helpers.openConfirmModal(...args),
                            pushHistory: (...args) => assembly.helpers.pushHistory(...args),
                            triggerTouchHaptic: assembly.services.triggerTouchHaptic,
                        },
                    });
                    return resolveLoaded(onLoaded, feature);
                }),
        });
    }

    function wireTaskEditorFeature(assembly) {
        return createLazyFeatureProxy({
            loadFeature: () => loadTaskEditorFeature()
                .then((registerTaskEditorFeature) => {
                    const {
                        itemPool,
                        scheduledTasks,
                        editingItem,
                        editingSource,
                        showEditor,
                        sidebarTab,
                        trackListData,
                    } = assembly.refs;
                    const { splitStateUtils } = assembly.utils;
                    const { helpers } = assembly;
                    return registerTaskEditorFeature({
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
                            getSplitViewState: (...args) => assembly.features.splitView.getSplitViewState(...args),
                            syncFamilyLegacyFields: (...args) => helpers.syncFamilyLegacyFields(...args),
                            syncFamilySharedIdentity: (...args) => helpers.syncFamilySharedIdentity(...args),
                            syncFamilyOrchestration: (...args) => helpers.syncFamilyOrchestration(...args),
                            syncScheduledDurationsFromFamily: (...args) => helpers.syncScheduledDurationsFromFamily(...args),
                        },
                        utils: {
                            calculateEstTime: (...args) => assembly.features.ratio.calculateEstTime(...args),
                            getDefaultRatio: (...args) => assembly.features.ratio.getDefaultRatio(...args),
                        },
                        actions: {
                            checkCanDeleteSplit: (...args) => helpers.checkCanDeleteSplit(...args),
                            restoreSplitTime: (...args) => helpers.restoreSplitTime(...args),
                            clearPoolRecord: (...args) => helpers.clearPoolRecord(...args),
                            clearAggregateRecords: (...args) => helpers.clearAggregateRecords(...args),
                            cleanupEmptySchedules: (...args) => assembly.features.schedule.cleanupEmptySchedules(...args),
                            openAlertModal: (...args) => helpers.openAlertModal(...args),
                            autoUpdateEfficiency: (...args) => assembly.features.ratio.autoUpdateEfficiency(...args),
                            updateTaskNotification: (...args) => helpers.updateTaskNotification(...args),
                            pushHistory: (...args) => helpers.pushHistory(...args),
                            cancelNotification: (notificationId) => assembly.services.deviceService.cancelNotification(notificationId),
                        },
                    });
                }),
        });
    }

    function wireMobileTouchFeature(assembly) {
        return createLazyFeatureProxy({
            loadFeature: () => loadMobileTouchRegistration()
                .then((registerMobileTouchFeature) => {
                    const {
                        isMobile,
                        mobileTab,
                        currentView,
                        weekContainer,
                        scheduledTasks,
                        pxPerMin,
                        sidebarTab,
                        currentSessionId,
                        lastTapState,
                        isResizingMobile,
                        mobileResizeState,
                        dragState,
                    } = assembly.refs;
                    const { timeUtils, formatUtils } = assembly.utils;
                    const { helpers } = assembly;
                    return registerMobileTouchFeature({
                        refs: {
                            isMobile,
                            mobileTab,
                            currentView,
                            weekContainer,
                            scheduledTasks,
                            pxPerMin,
                            sidebarTab,
                            currentSessionId,
                            lastTapState,
                            isResizingMobile,
                            mobileResizeState,
                        },
                        state: dragState,
                        data: {
                            getSettings: () => assembly.state.settings,
                        },
                        utils: {
                            timeToMinutes: timeUtils.timeToMinutes,
                            formatSecs: formatUtils.formatSecs,
                            parseTime: timeUtils.parseTime,
                        },
                        actions: {
                            changeDate: (...args) => helpers.changeDate(...args),
                            isTaskGhost: (...args) => assembly.features.schedule.isTaskGhost(...args),
                            jumpToGhostContext: (...args) => assembly.features.viewNavigation.jumpToGhostContext(...args),
                            handleTaskDblClick: (...args) => assembly.features.scheduleInteractions.handleTaskDblClick(...args),
                            selectTask: (...args) => assembly.features.poolInteractions.selectTask(...args),
                            triggerTouchHaptic: assembly.services.triggerTouchHaptic,
                            checkOverlap: (...args) => helpers.checkOverlap(...args),
                            openAlertModal: (...args) => helpers.openAlertModal(...args),
                            pushHistory: () => helpers.pushHistory(),
                        },
                    });
                }),
        });
    }

    function wireTrackListFeature(assembly, { onLoaded } = {}) {
        return createLazyFeatureProxy({
            loadFeature: () => loadTrackListFeature()
                .then((registerTrackListFeature) => {
                    const {
                        trackListData,
                        trackListContainerRef,
                        draggingSectionIndex,
                        itemPool,
                        scheduledTasks,
                        showTrackList,
                        isMobile,
                        isDark,
                        sidebarTab,
                    } = assembly.refs;
                    const { timeUtils, formatUtils } = assembly.utils;
                    const { helpers } = assembly;
                    const feature = registerTrackListFeature({
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
                            settings: assembly.state.settings,
                        },
                        utils: {
                            parseTime: timeUtils.parseTime,
                            formatSecs: formatUtils.formatSecs,
                            getNameById: (...args) => assembly.features.nameLookup.getNameById(...args),
                        },
                        actions: {
                            openAlertModal: (...args) => helpers.openAlertModal(...args),
                            openInputModal: (...args) => helpers.openInputModal(...args),
                            pushHistory: (...args) => helpers.pushHistory(...args),
                            autoUpdateEfficiency: (...args) => assembly.features.ratio.autoUpdateEfficiency(...args),
                            checkCanDeleteSplit: (...args) => helpers.checkCanDeleteSplit(...args),
                            restoreSplitTime: (...args) => helpers.restoreSplitTime(...args),
                            updateTaskNotification: (...args) => helpers.updateTaskNotification(...args),
                            triggerTouchHaptic: assembly.services.triggerTouchHaptic,
                            moveDivider: (...args) => helpers.moveDivider(...args),
                            pruneEmptySchedules: (...args) => assembly.features.schedule.pruneEmptySchedules(...args),
                            calculateSingleRatio: (...args) => assembly.features.ratio.calculateSingleRatio(...args),
                        },
                    });
                    return resolveLoaded(onLoaded, feature);
                }),
        });
    }

    function wireSettingsFeature(assembly, { onLoaded } = {}) {
        return createLazyFeatureProxy({
            loadFeature: () => loadSettingsFeature()
                .then((registerSettingsFeature) => {
                    const {
                        itemPool,
                        scheduledTasks,
                        settingsExpandedGroups,
                        newSettingsItem,
                        settingsGroupFocus,
                    } = assembly.refs;
                    const { idUtils } = assembly.utils;
                    const { helpers } = assembly;
                    const feature = registerSettingsFeature({
                        refs: {
                            itemPool,
                            scheduledTasks,
                            settingsExpandedGroups,
                            newSettingsItem,
                            settingsGroupFocus,
                        },
                        state: {
                            settings: assembly.state.settings,
                        },
                        utils: {
                            generateUniqueId: idUtils.generateUniqueId,
                            generateRandomHexColor: (...args) => assembly.features.pickerControls.generateRandomHexColor(...args),
                        },
                        actions: {
                            pushHistory: (...args) => helpers.pushHistory(...args),
                            triggerTouchHaptic: assembly.services.triggerTouchHaptic,
                            openConfirmModal: (...args) => helpers.openConfirmModal(...args),
                            openAlertModal: (...args) => helpers.openAlertModal(...args),
                            cleanupEmptySchedules: (...args) => assembly.features.schedule.cleanupEmptySchedules(...args),
                            autoUpdateEfficiency: (...args) => assembly.features.ratio.autoUpdateEfficiency(...args),
                        },
                    });
                    return resolveLoaded(onLoaded, feature);
                }),
        });
    }

    return {
        wireNotificationsFeature,
        wireDesktopResizeFeature,
        wireScheduleDeletionFeature,
        wireAvatarCropFeature,
        wireImportDataFeature,
        wireDataIoFeature,
        wireMetadataModalsFeature,
        wireTourFeature,
        wireMidiManagerFeature,
        wireTaskEditorFeature,
        wireMobileTouchFeature,
        wireTrackListFeature,
        wireSettingsFeature,
    };
}
