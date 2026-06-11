export function createAuthModalShellState({
    reactive,
    refs,
    state,
    actions,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createAuthModalShellState requires Vue reactive factory');
    }

    const {
        showAuthModal,
        authLoading,
        authPasswordRef,
    } = refs;

    return reactive({
        get showAuthModal() { return showAuthModal.value; },
        set showAuthModal(value) { showAuthModal.value = value; },
        get authForm() { return state.authForm; },
        get authLoading() { return authLoading.value; },
        get authPasswordRef() { return authPasswordRef.value; },
        set authPasswordRef(value) { authPasswordRef.value = value; },
        handleLogin: actions.handleLogin,
        handleRegister: actions.handleRegister,
        handleResetPwd: actions.handleResetPwd,
    });
}
