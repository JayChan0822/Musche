const { computed } = Vue;

export function registerMobileUiFeature(context) {
  const { refs, services, actions } = context;
  const {
    isMobile,
    isSidebarOpen,
    showMobileMenu,
    showProfileMenu,
    activeDropdown,
    themeMode,
    isDark,
  } = refs;
  const { storageService } = services;
  const { handlePageUnload } = actions;

  let systemThemeMedia = null;
  let handleSystemThemeChange = null;
  let handleVisibilityRefresh = null;
  let handlePageShowRefresh = null;

  function applyTheme() {
    let shouldBeDark = false;

    if (themeMode.value === 'auto') {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      shouldBeDark = themeMode.value === 'dark';
    }

    const html = document.documentElement;
    if (shouldBeDark) {
      html.classList.add('dark');
      isDark.value = true;
    } else {
      html.classList.remove('dark');
      isDark.value = false;
    }
  }

  function toggleTheme() {
    const modes = ['auto', 'light', 'dark'];
    const nextIndex = (modes.indexOf(themeMode.value) + 1) % modes.length;
    themeMode.value = modes[nextIndex];
    storageService.setItem('theme_mode', themeMode.value);
    applyTheme();
  }

  const getThemeLabel = computed(() => {
    if (themeMode.value === 'auto') return { text: '跟随系统', icon: 'fa-desktop' };
    if (themeMode.value === 'dark') return { text: '深色模式', icon: 'fa-moon' };
    return { text: '浅色模式', icon: 'fa-sun' };
  });

  function refreshLayout() {
    const width = window.innerWidth;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    isMobile.value = width < 800 && (isMobileUA || isCoarsePointer);

    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    if (!isMobile.value && width < 1100) {
      if (isSidebarOpen.value) isSidebarOpen.value = false;
    } else if (!isMobile.value && width >= 1100) {
      isSidebarOpen.value = true;
    }

    if (isMobile.value) {
      document.body.style.display = 'none';
      document.body.offsetHeight;
      document.body.style.display = '';
    }
  }

  function toggleMobileMenu() {
    const wasOpen = showMobileMenu.value;
    activeDropdown.value = null;
    showProfileMenu.value = false;
    showMobileMenu.value = !wasOpen;
  }

  function mountShellLifecycle() {
    refreshLayout();
    applyTheme();

    systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    handleSystemThemeChange = () => {
      if (themeMode.value === 'auto') {
        applyTheme();
      }
    };
    systemThemeMedia.addEventListener('change', handleSystemThemeChange);

    handleVisibilityRefresh = () => {
      if (document.visibilityState === 'visible') {
        refreshLayout();
        setTimeout(refreshLayout, 200);
      }
    };

    handlePageShowRefresh = (event) => {
      if (event.persisted) {
        refreshLayout();
      }
    };

    window.addEventListener('resize', refreshLayout);
    document.addEventListener('visibilitychange', handleVisibilityRefresh);
    window.addEventListener('pageshow', handlePageShowRefresh);
    if (handlePageUnload) {
      window.addEventListener('beforeunload', handlePageUnload);
    }
  }

  function unmountShellLifecycle() {
    window.removeEventListener('resize', refreshLayout);
    if (handleVisibilityRefresh) {
      document.removeEventListener('visibilitychange', handleVisibilityRefresh);
    }
    if (handlePageShowRefresh) {
      window.removeEventListener('pageshow', handlePageShowRefresh);
    }
    if (systemThemeMedia && handleSystemThemeChange) {
      systemThemeMedia.removeEventListener('change', handleSystemThemeChange);
    }
    if (handlePageUnload) {
      window.removeEventListener('beforeunload', handlePageUnload);
    }
  }

  return {
    applyTheme,
    toggleTheme,
    getThemeLabel,
    refreshLayout,
    toggleMobileMenu,
    mountShellLifecycle,
    unmountShellLifecycle,
  };
}
