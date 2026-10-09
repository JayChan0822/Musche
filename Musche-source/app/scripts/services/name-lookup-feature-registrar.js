import { registerNameLookupFeature } from '../features/name-lookup.js';

export function wireNameLookupFeature(assembly) {
    const { settings } = assembly.state;
    return registerNameLookupFeature({
        state: {
            settings,
        },
    });
}
