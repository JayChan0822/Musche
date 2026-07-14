import { registerUniversalModalFeature } from '../features/universal-modal.js';

export function createUniversalModalFeatureRegistrar() {
    return function wireUniversalModalFeature(assembly) {
        const {
            showConfirmModal,
            confirmModalConfig,
            showInputModal,
            inputModalConfig,
            universalInputRef,
        } = assembly.refs;

        return registerUniversalModalFeature({
            refs: {
                showConfirmModal,
                confirmModalConfig,
                showInputModal,
                inputModalConfig,
                universalInputRef,
            },
            actions: {

                switchView: (...args) => assembly.features.viewNavigation.switchView(...args),
            },
        });
    };
}
