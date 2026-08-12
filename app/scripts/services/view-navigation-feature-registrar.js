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

        },
    });
}
