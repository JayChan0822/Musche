import { defineShellState } from './shell-state-factory.js';

export const createAuthModalShellState = defineShellState('createAuthModalShellState', {
    reads: [
        'refs.authLoading',
    ],
    models: [
        'refs.showAuthModal',
        'refs.authPasswordRef',
    ],
    values: [
        'refs.authForm',
        'helpers.handleLogin',
        'helpers.handleRegister',
        'helpers.handleResetPwd',
    ],
});
