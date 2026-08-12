import { defineShellState } from './shell-state-factory.js';

export const createTrackListModalShellState = defineShellState('createTrackListModalShellState', {
    reads: [
        'refs.trackListData',
        'refs.draggingSectionIndex',
        'refs.sidebarTab',
    ],
    models: [
        'refs.showTrackList',
        'refs.trackListSearchQuery',
        'refs.trackListContainerRef',
    ],
    values: [
        'helpers.metadataModalHandlers.openRecInfoModal',
        'helpers.handleTrackListSearchAction',
        'helpers.autoDistributeSections',
        'helpers.sortTrackList',
        'helpers.startDividerDrag',
        'helpers.startTrackDrag',
        'helpers.deleteTrackFromList',
        'helpers.openSplitSlider',
        'helpers.getGroupColor',
        'helpers.getNameById',
        'helpers.isPercussionGroup',
        'helpers.isStringGroup',
        'helpers.pushHistory',
        'helpers.calcTrackDiff',
        'helpers.setTrackNow',
        'helpers.setTrackBreak',
        'helpers.clearTrackTime',
        'helpers.calculateSingleRatio',
        'helpers.deleteCurrentSchedule',
    ],
});
