import { ref } from 'vue';

import { SIDEBAR_TABS } from '../utils/sidebar-tabs.js';

export function registerSidebarNavigationFeature(context) {
  const { refs, actions = {} } = context;
  const { isMobile, isSidebarOpen, sidebarTab } = refs;
  const {
    isDragActive = () => false,

    setTimeoutFn = setTimeout,
  } = actions;

  const sidebarTouchStartX = ref(0);
  const sidebarTouchStartY = ref(0);
  const sidebarTransitionName = ref('slide-next');
  const sidebarScrollRef = ref(null);
  // 手机端左右滑翻分类：顺序与可用分类都取自 utils/sidebar-tabs.js，
  // 桌面端下线了的分类（如乐器）不会再被滑出来。
  const sidebarTabsOrder = SIDEBAR_TABS;

  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  };

  const scrollSidebarToTop = () => {
    if (sidebarScrollRef.value) {
      sidebarScrollRef.value.scrollTop = 0;
    }
  };

  const scrollToSidebarItem = (targetId) => {
    if (!targetId) return;

    setTimeoutFn(() => {
      const container = sidebarScrollRef.value;
      const el = container?.querySelector(`[data-stat-id="${targetId}"]`);

      if (el) {
        const card = el.getBoundingClientRect();
        const viewport = container.getBoundingClientRect();
        const targetTop = container.scrollTop + card.top - viewport.top - container.clientTop
          + card.height / 2 - container.clientHeight * 0.382;
        container.scrollTo({
          top: Math.max(0, Math.min(container.scrollHeight - container.clientHeight, targetTop)),
          behavior: 'smooth',
        });

        el.classList.add('ring-2', 'ring-[#ffffff]');
        setTimeoutFn(() => {
          el.classList.remove('ring-2', 'ring-[#ffffff]');
        }, 800);
      }
    }, 50);
  };

  const switchSidebarTab = (targetTab) => {
    if (sidebarTab.value === targetTab) return;

    const oldIdx = sidebarTabsOrder.indexOf(sidebarTab.value);
    const newIdx = sidebarTabsOrder.indexOf(targetTab);

    sidebarTransitionName.value = newIdx > oldIdx ? 'slide-next' : 'slide-prev';
    sidebarTab.value = targetTab;
    scrollSidebarToTop();
  };

  const onSidebarTouchStart = (event) => {
    if (isDragActive()) return;

    sidebarTouchStartX.value = event.touches[0].clientX;
    sidebarTouchStartY.value = event.touches[0].clientY;
  };

  const onSidebarTouchEnd = (event) => {
    if (isDragActive() || !isMobile.value) return;

    const endX = event.changedTouches[0].clientX;
    const endY = event.changedTouches[0].clientY;
    const diffX = endX - sidebarTouchStartX.value;
    const diffY = endY - sidebarTouchStartY.value;

    if (Math.abs(diffX) > Math.abs(diffY) * 1.5 && Math.abs(diffX) > 50) {
      const currentIndex = sidebarTabsOrder.indexOf(sidebarTab.value);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;
      let direction = '';

      if (diffX < 0) {
        if (currentIndex < sidebarTabsOrder.length - 1) {
          nextIndex++;
          direction = 'next';
        }
      } else if (currentIndex > 0) {
        nextIndex--;
        direction = 'prev';
      }

      if (nextIndex !== currentIndex) {
        sidebarTransitionName.value = direction === 'next' ? 'slide-next' : 'slide-prev';
        sidebarTab.value = sidebarTabsOrder[nextIndex];

        scrollSidebarToTop();
      }
    }

    sidebarTouchStartX.value = 0;
    sidebarTouchStartY.value = 0;
  };

  return {
    sidebarTransitionName,
    sidebarScrollRef,
    toggleSidebar,
    scrollToSidebarItem,
    switchSidebarTab,
    onSidebarTouchStart,
    onSidebarTouchEnd,
  };
}
