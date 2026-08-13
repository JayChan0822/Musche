import { defineShellState } from './shell-state-factory.js';

export const createMobileControlsShellState = defineShellState('createMobileControlsShellState', {
    reads: [
        'refs.isMobile',
        // 日视图滑上来时，浮动搜索条要让位
        'refs.dayViewOpen',
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
