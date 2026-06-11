import { registerSettingsSyncFeature } from '../features/settings-sync.js';

export function createSettingsSyncFeatureRegistrar() {
    return function wireSettingsSyncFeature(assembly) {
        const { settingsExpandedGroups, settingsGroupFocus } = assembly.refs;
        const { settings } = assembly.state;
        const { idUtils } = assembly.utils;
        return registerSettingsSyncFeature({
            refs: {
                settingsExpandedGroups,
                settingsGroupFocus,
            },
            state: {
                settings,
            },
            utils: {
                generateUniqueId: idUtils.generateUniqueId,
                generateRandomHexColor: (...args) => assembly.features.pickerControls.generateRandomHexColor(...args),
            },
            actions: {},
        });
    };
}
