import { parseTime, timeToMinutes, addMinutesToTime as addMinutesToTimeValue, addDaysToDate } from '../utils/time.js';
import { formatDate, formatSecs } from '../utils/format.js';
import { generateUniqueId } from '../utils/id.js';
import {
    createHiddenSplitState,
    deactivateItemInView,
    ensureItemSplitViews,
    getConnectedSplitItemIds,
    getItemSplitState,
    hasVisibleSplitStateInAnyView,
    isItemVisibleInView,
    normalizeSplitViewType,
    peekItemSplitState,
    peekItemVisibilityInView,
    rebalanceSplitFamilyDuration,
    setItemSplitState,
    syncFamilyTotalDuration,
    syncLegacySplitFields,
} from '../utils/split-state.js';

export function createAppUtilityFunctions() {
    const timeUtils = {
        parseTime,
        timeToMinutes,
        addMinutesToTimeValue,
        addDaysToDate,
    };

    const formatUtils = {
        formatDate,
        formatSecs,
    };

    const idUtils = {
        generateUniqueId,
    };

    const splitStateUtils = {
        createHiddenSplitState,
        deactivateItemInView,
        ensureItemSplitViews,
        getConnectedSplitItemIds,
        getItemSplitState,
        hasVisibleSplitStateInAnyView,
        isItemVisibleInView,
        normalizeSplitViewType,
        peekItemSplitState,
        peekItemVisibilityInView,
        rebalanceSplitFamilyDuration,
        setItemSplitState,
        syncFamilyTotalDuration,
        syncLegacySplitFields,
    };

    return {
        parseTime,
        timeToMinutes,
        addMinutesToTimeValue,
        addDaysToDate,
        formatDate,
        formatSecs,
        generateUniqueId,
        timeUtils,
        formatUtils,
        idUtils,
        splitStateUtils,
        createHiddenSplitState,
        deactivateItemInView,
        ensureItemSplitViews,
        getConnectedSplitItemIds,
        getItemSplitState,
        hasVisibleSplitStateInAnyView,
        isItemVisibleInView,
        normalizeSplitViewType,
        peekItemSplitState,
        peekItemVisibilityInView,
        rebalanceSplitFamilyDuration,
        setItemSplitState,
        syncFamilyTotalDuration,
        syncLegacySplitFields,
    };
}
