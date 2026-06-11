export function createMobileControlsShellState({
    reactive,
    refs,
    actions,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createMobileControlsShellState requires Vue reactive factory');
    }

    const {
        isMobile,
        globalSearchQuery,
        isSearchFocused,
        mobileTab,
        showMobileTaskInput,
    } = refs;

    return reactive({
        get isMobile() { return isMobile.value; },
        get globalSearchQuery() { return globalSearchQuery.value; },
        set globalSearchQuery(value) { globalSearchQuery.value = value; },
        get isSearchFocused() { return isSearchFocused.value; },
        set isSearchFocused(value) { isSearchFocused.value = value; },
        get mobileTab() { return mobileTab.value; },
        set mobileTab(value) { mobileTab.value = value; },
        get showMobileTaskInput() { return showMobileTaskInput.value; },
        set showMobileTaskInput(value) { showMobileTaskInput.value = value; },
        onSearchFocus: actions.onSearchFocus,
        handleSearchBlur: actions.handleSearchBlur,
        handleSearchEnter: actions.handleSearchEnter,
    });
}
