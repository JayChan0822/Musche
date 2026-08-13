import { registerViewNavigationFeature } from '../features/view-navigation.js';

export function wireViewNavigationFeature(assembly) {
    const {
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
        dragState,
        selectedDay,
        dayViewOpen,
        dayViewContainer,
    } = assembly.refs;
    const { settings } = assembly.state;
    const { storageService } = assembly.services;
    const { formatUtils, timeUtils } = assembly.utils;
    return registerViewNavigationFeature({
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
            selectedDay,
            dayViewOpen,
            dayViewContainer,
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
            // ghost 任务跨 session 跳转：pending 录音写回需取消
            cancelPendingTrackSave: () => assembly.helpers.cancelPendingTrackSave?.(),

        },
    });
}
