import { registerSearchFeature } from '../features/search.js';

export function createSearchFeatureRegistrar() {
    return function wireSearchFeature(assembly) {
        const {
            itemPool,
            scheduledTasks,
            globalSearchQuery,
            currentSearchIndex,
            searchHighlightTimer,
            lastHighlightedTrackId,
            lastTrackSearchQuery,
            trackSearchIndex,
            trackListSearchQuery,
            trackListData,
            showTrackList,
            isSearchFocused,
            isMobile,
            sidebarTab,
        } = assembly.refs;
        const { settings } = assembly.state;
        const { triggerTouchHaptic } = assembly.services;
        return registerSearchFeature({
            refs: {
                itemPool,
                scheduledTasks,
                globalSearchQuery,
                currentSearchIndex,
                searchHighlightTimer,
                lastHighlightedTrackId,
                lastTrackSearchQuery,
                trackSearchIndex,
                trackListSearchQuery,
                trackListData,
                showTrackList,
                isSearchFocused,
                isMobile,
            },
            state: {
                sidebarTab,
                settings,
                musicianStats: { get value() { return assembly.refs.musicianStats.value; } },
                projectStats: { get value() { return assembly.refs.projectStats.value; } },
                instrumentStats: { get value() { return assembly.refs.instrumentStats.value; } },
            },
            utils: {
                getNameById: (...args) => assembly.features.nameLookup.getNameById(...args),
            },
            actions: {
                openAlertModal: (...args) => assembly.helpers.openAlertModal(...args),
                smartScrollToTask: (...args) => assembly.features.viewNavigation.smartScrollToTask(...args),
                triggerTouchHaptic: triggerTouchHaptic,
                getSidebarList: () => assembly.refs.currentSidebarList.value,
            },
        });
    };
}
