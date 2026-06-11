import { registerSessionFeature } from '../features/session.js';

export function createSessionFeatureRegistrar() {
    return function wireSessionFeature(assembly) {
        const { currentSessionId, activeDropdown } = assembly.refs;
        const { settings } = assembly.state;
        const { idUtils } = assembly.utils;
        const { triggerTouchHaptic } = assembly.services;
        return registerSessionFeature({
            refs: {
                currentSessionId,
                activeDropdown,
            },
            state: {
                settings,
            },
            utils: {
                generateUniqueId: idUtils.generateUniqueId,
            },
            actions: {
                openInputModal: (...args) => assembly.helpers.openInputModal(...args),
                openConfirmModal: (...args) => assembly.helpers.openConfirmModal(...args),
                openAlertModal: (...args) => assembly.helpers.openAlertModal(...args),
                pushHistory: (...args) => assembly.helpers.pushHistory(...args),
                triggerTouchHaptic: triggerTouchHaptic,
            },
        });
    };
}
