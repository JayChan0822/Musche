import { registerQuickAddFeature } from '../features/quick-add.js';

export function wireQuickAddFeature(assembly) {
    const {
        quickAddType,
        quickAddForm,
        showQuickAddModal,
        activeDropdown,
        itemPool,
        currentSessionId,
        isMobile,
        showMobileTaskInput,
        newItem,
    } = assembly.refs;
    const { settings } = assembly.state;
    const { idUtils } = assembly.utils;

    return registerQuickAddFeature({
        refs: {
            quickAddType,
            quickAddForm,
            showQuickAddModal,
            activeDropdown,
            itemPool,
            currentSessionId,
            isMobile,
            showMobileTaskInput,
        },
        state: {
            settings,
            newItem,
        },
        utils: {
            getExistingGroups: (...args) => assembly.features.settingsSync.getExistingGroups(...args),
            generateUniqueId: idUtils.generateUniqueId,
            generateRandomHexColor: (...args) => assembly.features.pickerControls.generateRandomHexColor(...args),
            getDefaultRatio: (...args) => assembly.features.ratio.getDefaultRatio(...args),
            getNameById: (...args) => assembly.features.nameLookup.getNameById(...args),
            calculateEstTime: (...args) => assembly.features.ratio.calculateEstTime(...args),
            ensureItemRecords: (...args) => assembly.features.ratio.ensureItemRecords(...args),
        },
        actions: {
            openAlertModal: (...args) => assembly.helpers.openAlertModal(...args),
            pushHistory: (...args) => assembly.helpers.pushHistory(...args),

        },
    });
}
