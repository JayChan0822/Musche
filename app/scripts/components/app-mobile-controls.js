import { ref, onMounted, onBeforeUnmount } from 'vue';

export const AppMobileControls = {
  name: 'AppMobileControls',
  props: {
    ctx: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const viewportInset = ref(0);
    const searchTop = ref(null);
    const mobileSearchInput = ref(null);
    let revealFrame = 0;
    const activateSearch = (event) => {
      const input = mobileSearchInput.value;
      if (!input || document.activeElement === input) return;
      event.preventDefault();
      // iOS 会对可见的底部输入框执行自动滚动；聚焦这一刻暂时隐藏文字层。
      // 外层搜索框仍然可见，键盘仍在用户手势内同步唤起。
      input.style.opacity = '0';
      input.focus({ preventScroll: true });
      revealFrame = requestAnimationFrame(() => {
        input.style.removeProperty('opacity');
      });
    };
    const focusSearch = () => {
      document.documentElement.style.setProperty('--search-page-height', `${window.innerHeight}px`);
      document.documentElement.classList.add('mobile-search-focused');
      props.ctx.onSearchFocus();
      update();
    };
    const blurSearch = () => {
      document.documentElement.classList.remove('mobile-search-focused');
      document.documentElement.style.removeProperty('--search-page-height');
      document.documentElement.style.removeProperty('--search-page-offset');
      searchTop.value = null;
      props.ctx.handleSearchBlur();
    };
    const viewport = window.visualViewport;
    const update = () => {
        // 键盘可能只缩小 visual viewport；同时扣除 Safari 自动平移的 offsetTop。
        // Android 若已缩小布局视口，差值为零，不重复上移。
        viewportInset.value = viewport && Math.abs(viewport.scale - 1) < .01
          ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) : 0;
        if (props.ctx.isSearchFocused) {
          // Safari 会平移 visual viewport，即使画布高度固定仍需补偿这个偏移。
          const offset = viewport?.pageTop ?? window.scrollY;
          document.documentElement.style.setProperty('--search-page-offset', `${offset}px`);
          const bottom = (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight);
          searchTop.value = Math.max(12, bottom - 42 - 16);
        }
    };
    onMounted(() => {
      viewport?.addEventListener('resize', update);
      viewport?.addEventListener('scroll', update);
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update);
      update();
    });
    onBeforeUnmount(() => {
      cancelAnimationFrame(revealFrame);
      viewport?.removeEventListener('resize', update);
      viewport?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
      document.documentElement.classList.remove('mobile-search-focused');
      document.documentElement.style.removeProperty('--search-page-height');
      document.documentElement.style.removeProperty('--search-page-offset');
    });
    return { viewportInset, searchTop, mobileSearchInput, activateSearch, focusSearch, blurSearch };
  },
  template: `
            <template v-if="ctx.isMobile">
                <Teleport to="body">
                <div v-if="ctx.isSearchFocused" class="mobile-search-backdrop"
                     aria-hidden="true" @pointerdown.prevent="mobileSearchInput?.blur()"></div>
                <!-- 常驻 dock 上方，输入和清空后都保持原位。 -->
                <div class="mobile-search-bar fixed z-[850]" :style="searchTop === null ? {'--mobile-keyboard-inset':viewportInset+'px'} : {top:searchTop+'px',bottom:'auto'}">
                    <div class="relative w-full h-full shadow-lg rounded-full">
                        <div class="mobile-search-surface absolute inset-0 backdrop-blur-xl rounded-full border border-white/40 dark:border-white/10 shadow-sm"></div>

                        <i class="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10"></i>

                        <input ref="mobileSearchInput"
                               v-model="ctx.globalSearchQuery"
                               @pointerdown="activateSearch"
                               @focus="focusSearch"
                               @blur="blurSearch"
                               @keydown.enter="ctx.handleSearchEnter"
                               class="relative w-full h-full bg-transparent pl-12 pr-12 text-base font-bold text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-full outline-none"
                               placeholder="Search..." aria-label="搜索日程和任务"
                               enterkeyhint="search"
                               style="caret-color: #007aff;">

                        <button v-if="ctx.globalSearchQuery"
                                @mousedown.prevent
                                aria-label="清空搜索" @click="ctx.globalSearchQuery = ''"
                                class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 active:bg-black/10 dark:active:bg-white/10 transition z-10">
                            <i class="fa-solid fa-circle-xmark text-lg opacity-80"></i>
                        </button>
                    </div>
                </div>

                </Teleport>

                <!-- 撤销条：产生可撤销改动后浮在 dock 上方，几秒后自动消失 -->
                <Transition name="undo-toast">
                    <div v-if="ctx.undoToastVisible && !ctx.isSearchFocused"
                         class="undo-toast fixed z-[880] flex items-center gap-3 h-11 pl-4 pr-1.5 rounded-full bg-[#1c1c1e]/95 dark:bg-white/95 text-white dark:text-black shadow-lg backdrop-blur-xl">
                        <span class="text-sm font-bold whitespace-nowrap">已更改</span>
                        <button @click="ctx.undoFromToast"
                                class="h-8 px-3 rounded-full bg-white/15 dark:bg-black/10 text-[#0a84ff] dark:text-[#007aff] text-sm font-bold active:opacity-60 transition flex items-center gap-1.5 whitespace-nowrap">
                            <i class="fa-solid fa-rotate-left text-xs"></i> 撤销
                        </button>
                        <button @click="ctx.hideUndoToast"
                                class="w-8 h-8 flex items-center justify-center rounded-full text-white/50 dark:text-black/40 active:opacity-60 transition">
                            <i class="fa-solid fa-xmark text-sm"></i>
                        </button>
                    </div>
                </Transition>

                <div class="mobile-tab-bar">
                    <button aria-label="任务池" @click="ctx.mobileTab='pool'; ctx.showMobileTaskInput=false"
                            class="mobile-tab-item"
                            :class="{'active': ctx.mobileTab==='pool' && !ctx.showMobileTaskInput && !ctx.isSearchFocused}">
                        <i class="fa-solid fa-layer-group"></i>
                        <span>任务池</span>
                    </button>

                    <button id="tour-mobile-new-task" @click="ctx.showMobileTaskInput = true"
                            class="mobile-tab-item"
                            :class="{'active': ctx.showMobileTaskInput && !ctx.isSearchFocused}">
                        <i class="fa-solid fa-circle-plus text-2xl mb-0.5"></i>
                        <span>添加</span>
                    </button>

                    <button aria-label="日程表" @click="ctx.mobileTab='schedule'; ctx.showMobileTaskInput=false"
                            class="mobile-tab-item"
                            :class="{'active': ctx.mobileTab==='schedule' && !ctx.showMobileTaskInput && !ctx.isSearchFocused}">
                        <i class="fa-regular fa-calendar-days"></i>
                        <span>日程表</span>
                    </button>

                </div>
            </template>
  `,
};
