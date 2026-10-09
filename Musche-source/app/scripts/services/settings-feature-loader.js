export function createSettingsFeatureLoader({
    importSettingsFeature = () => import('../features/settings.js'),
} = {}) {
    if (typeof importSettingsFeature !== 'function') {
        throw new TypeError('createSettingsFeatureLoader requires an importSettingsFeature function');
    }

    return () => importSettingsFeature()
        .then((settingsModule) => settingsModule.registerSettingsFeature);
}
