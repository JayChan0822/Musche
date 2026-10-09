import { registerSidebarNavigationFeature } from './sidebar-navigation.js';
import { registerSidebarPreferencesFeature } from './sidebar-preferences.js';

export function registerSidebarFeature(context) {
  const { refs, services, actions } = context;

  const sidebarPreferencesFeature = registerSidebarPreferencesFeature({
    refs: {
      sidebarWidth: refs.sidebarWidth,
    },
    services: {
      storageService: services.storageService,
    },
  });

  const sidebarNavigationFeature = registerSidebarNavigationFeature({
    refs: {
      isMobile: refs.isMobile,
      isSidebarOpen: sidebarPreferencesFeature.isSidebarOpen,
      sidebarTab: refs.sidebarTab,
    },
    actions: {
      isDragActive: actions.isDragActive,
    },
  });

  return {
    isSidebarOpen: sidebarPreferencesFeature.isSidebarOpen,
    sidebarTransitionName: sidebarNavigationFeature.sidebarTransitionName,
    sidebarScrollRef: sidebarNavigationFeature.sidebarScrollRef,
    toggleSidebar: sidebarNavigationFeature.toggleSidebar,
    scrollToSidebarItem: sidebarNavigationFeature.scrollToSidebarItem,
    switchSidebarTab: sidebarNavigationFeature.switchSidebarTab,
    onSidebarTouchStart: sidebarNavigationFeature.onSidebarTouchStart,
    onSidebarTouchEnd: sidebarNavigationFeature.onSidebarTouchEnd,
  };
}
