import { defineShellState } from './shell-state-factory.js';

export const createMobileControlsShellState = defineShellState('createMobileControlsShellState', {
    reads: [
        'refs.isMobile',
    ],
    models: [
        'refs.globalSearchQuery',
        'refs.isSearchFocused',
        'refs.mobileTab',
        'refs.showMobileTaskInput',
    ],
    values: [
        'helpers.onSearchFocus',
        'helpers.handleSearchBlur',
        'helpers.handleSearchEnter',
    ],
});
