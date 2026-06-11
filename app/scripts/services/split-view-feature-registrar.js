import { registerSplitViewFeature } from '../features/split-view.js';

export function createSplitViewFeatureRegistrar() {
    return function wireSplitViewFeature(assembly) {
        const { trackListData, sidebarTab } = assembly.refs;
        const { splitStateUtils } = assembly.utils;
        return registerSplitViewFeature({
            refs: {
                trackListData,
                sidebarTab,
            },
            split: splitStateUtils,
        });
    };
}
