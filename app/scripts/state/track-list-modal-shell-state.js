import { defineShellState } from './shell-state-factory.js';

export const createTrackListModalShellState = defineShellState('createTrackListModalShellState', ({
    refs,
    state,
    actions,
}) => {
    const {
        showTrackList,
        trackListData,
        trackListSearchQuery,
        trackListContainerRef,
        draggingSectionIndex,
        sidebarTab,
    } = refs;
    const {
        openRecInfoModal,
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
    } = actions;
    return {
        reads: {
            trackListData,
            draggingSectionIndex,
            sidebarTab,
        },
        models: {
            showTrackList,
            trackListSearchQuery,
            trackListContainerRef,
        },
        values: {
            openRecInfoModal,
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
    };
});
