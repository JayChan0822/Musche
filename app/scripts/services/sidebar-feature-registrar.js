import { registerSidebarFeature } from '../features/sidebar.js';

export function createSidebarFeatureRegistrar() {
    return function wireSidebarFeature(assembly) {
        const { sidebarWidth, isMobile, sidebarTab, dragState } = assembly.refs;
        const { storageService } = assembly.services;
        return registerSidebarFeature({
            refs: {
                sidebarWidth,
                isMobile,
                sidebarTab,
            },
            services: {
                storageService,
            },
            actions: {
                isDragActive: () => !!dragState.dragElClone,

            },
        });
    };
}
