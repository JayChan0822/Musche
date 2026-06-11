import { registerAuthFeature } from '../features/auth.js';

export function createAuthFeatureRegistrar() {
    return registerAuthFeature;
}
