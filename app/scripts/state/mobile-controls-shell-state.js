import { defineShellState } from './shell-state-factory.js';

export const createMobileControlsShellState = defineShellState('createMobileControlsShellState', ({
    refs,
    actions,
}) => {
    const {
        isMobile,
        globalSearchQuery,
        isSearchFocused,
        mobileTab,
        showMobileTaskInput,
    } = refs;
    return {
        reads: {
            isMobile,
        },
        models: {
            globalSearchQuery,
            isSearchFocused,
            mobileTab,
            showMobileTaskInput,
        },
        values: {
            onSearchFocus: actions.onSearchFocus,
            handleSearchBlur: actions.handleSearchBlur,
            handleSearchEnter: actions.handleSearchEnter,
        },
    };
});
