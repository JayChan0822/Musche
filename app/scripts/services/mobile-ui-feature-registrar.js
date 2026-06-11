import { registerMobileUiFeature } from '../features/mobile-ui.js';

export function createMobileUiFeatureRegistrar() {
    return function wireMobileUiFeature(assembly) {
        const {
            isMobile,
            isSidebarOpen,
            showMobileMenu,
            showProfileMenu,
            activeDropdown,
            themeMode,
            isDark,
        } = assembly.refs;
        const { storageService } = assembly.services;
        return registerMobileUiFeature({
            refs: {
                isMobile,
                isSidebarOpen,
                showMobileMenu,
                showProfileMenu,
                activeDropdown,
                themeMode,
                isDark,
            },
            services: {
                storageService,
            },
            actions: {
                handlePageUnload: (...args) => assembly.features.auth.handlePageUnload(...args),
            },
        });
    };
}
