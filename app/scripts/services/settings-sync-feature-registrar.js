import { registerSettingsSyncFeature } from '../features/settings-sync.js';

export function createSettingsSyncFeatureRegistrar() {
    return registerSettingsSyncFeature;
}
