import { registerNameLookupFeature } from '../features/name-lookup.js';

export function createNameLookupFeatureRegistrar() {
    return function wireNameLookupFeature(assembly) {
        const { settings } = assembly.state;
        return registerNameLookupFeature({
            state: {
                settings,
            },
        });
    };
}
