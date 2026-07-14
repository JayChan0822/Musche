import { registerAppRuntimeFeature } from '../features/app-runtime.js';

export function createAppRuntimeFeatureRegistrar() {
    return function wireAppRuntimeFeature(assembly) {
        const {
            itemPool,
            scheduledTasks,
            currentSessionId,
            user,
            saveStatus,
            currentView,
            monthViewMode,
            viewDate,
            isBootstrappingData,
            isSidebarOpen,
        } = assembly.refs;
        const { settings } = assembly.state;
        const { storageService } = assembly.services;
        const { watch, nextTick } = assembly.vue;
        const { helpers } = assembly;
        return registerAppRuntimeFeature({
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
                handleGlobalKey: (...args) => helpers.handleGlobalKey(...args),
                handleResizeMove: (...args) => helpers.handleResizeMove(...args),
                handleResizeEnd: (...args) => helpers.handleResizeEnd(...args),
                closeDropdowns: (...args) => assembly.features.dropdowns.closeDropdowns(...args),
            },
            state: {
                settings,
            },
            services: {
                storageService,
            },
            actions: {
                scrollToMonthDate: (date) => assembly.features.viewNavigation.scrollToMonthDate(date),
                bootSessionData: (options) => assembly.features.auth.bootSessionData(options),
                saveToCloud: () => helpers.saveToCloud(),
                nextTick,
            },
            vue: {
                watch,
            },
        });
    };
}
