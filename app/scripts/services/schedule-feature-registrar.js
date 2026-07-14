import { registerScheduleFeature } from '../features/schedule.js';

export function createScheduleFeatureRegistrar() {
    return function wireScheduleFeature(assembly) {
        const {
            itemPool,
            scheduledTasks,
            currentSessionId,
            trackListData,
            showTrackList,
            pxPerMin,
            sidebarTab,
            currentView,
            viewDate,
        } = assembly.refs;
        const { settings } = assembly.state;
        const { timeUtils, splitStateUtils } = assembly.utils;

        return registerScheduleFeature({
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
                getNameById: (...args) => assembly.features.nameLookup.getNameById(...args),
                addDaysToDate: timeUtils.addDaysToDate,
                addMinutesToTimeValue: timeUtils.addMinutesToTimeValue,
                setItemSplitState: splitStateUtils.setItemSplitState,
            },
            actions: {
                pushHistory: (...args) => assembly.helpers.pushHistory(...args),

                getCurrentWeekDays: () => assembly.refs.currentWeekDays.value,
            },
        });
    };
}
