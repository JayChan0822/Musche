import { defineShellState } from './shell-state-factory.js';

export const createAuthModalShellState = defineShellState('createAuthModalShellState', ({
    refs,
    state,
    actions,
}) => {
    const {
        showAuthModal,
        authLoading,
        authPasswordRef,
    } = refs;
    return {
        reads: {
            authLoading,
        },
        models: {
            showAuthModal,
            authPasswordRef,
        },
        raw: {
            authForm: () => state.authForm,
        },
        values: {
            handleLogin: actions.handleLogin,
            handleRegister: actions.handleRegister,
            handleResetPwd: actions.handleResetPwd,
        },
    };
});
