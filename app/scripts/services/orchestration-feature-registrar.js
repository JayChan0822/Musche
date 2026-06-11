import { registerOrchestrationFeature } from '../features/orchestration.js';

export function createOrchestrationFeatureRegistrar() {
    return function wireOrchestrationFeature(assembly) {
        const {
            editingItem,
            showEditor,
            sidebarTab,
            itemPool,
            scheduledTasks,
            currentSessionId,
        } = assembly.refs;
        const { settings } = assembly.state;
        const { triggerTouchHaptic } = assembly.services;
        return registerOrchestrationFeature({
            refs: {
                editingItem,
                showEditor,
                sidebarTab,
                itemPool,
                scheduledTasks,
                currentSessionId,
            },
            state: {
                settings,
            },
            utils: {
                getNameById: (...args) => assembly.features.nameLookup.getNameById(...args),
            },
            actions: {
                triggerTouchHaptic: triggerTouchHaptic,
            },
        });
    };
}
