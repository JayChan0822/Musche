export const AppMobileControls = {
  name: 'AppMobileControls',
  props: {
    ctx: {
      type: Object,
      required: true,
    },
  },
  template: `
            <template v-if="ctx.isMobile">
                <!-- 搜索条：平时收在 dock 的放大镜里，只有聚焦中或还留着关键词时才占位 -->
                <div v-if="(ctx.isSearchFocused || ctx.globalSearchQuery) && !ctx.dayViewOpen"
                     class="fixed z-[850] transition-all duration-300 ease-spring"
                     :style="ctx.isSearchFocused
                         ? { top: '45%', left: '16px', right: '16px', height: '50px' }
                         : { top: 'calc(100dvh - 130px)', left: '20px', right: '20px', height: '50px' }">
                    <div class="relative w-full h-full shadow-lg rounded-full">
                        <div class="absolute inset-0 backdrop-blur-xl rounded-full border border-white/40 dark:border-white/10 shadow-sm transition-colors"
                             :class="ctx.isSearchFocused ? 'bg-white/95 dark:bg-[#2c2c2e]' : 'bg-white/80 dark:bg-[#1c1c1e]/80'">
                        </div>

                        <i class="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10"></i>

                        <input ref="mobileSearchInput"
                               v-model="ctx.globalSearchQuery"
                               @focus="ctx.onSearchFocus"
                               @blur="ctx.handleSearchBlur"
                               @keydown.enter="ctx.handleSearchEnter"
                               class="relative w-full h-full bg-transparent pl-12 pr-12 text-base font-bold text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-full outline-none"
                               placeholder="Search..."
                               enterkeyhint="search"
                               style="caret-color: #007aff;">

                        <button v-if="ctx.globalSearchQuery"
                                @mousedown.prevent
                                @click="ctx.globalSearchQuery = ''"
                                class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 active:bg-black/10 dark:active:bg-white/10 transition z-10">
                            <i class="fa-solid fa-circle-xmark text-lg opacity-80"></i>
                        </button>
                    </div>
                </div>

                <div v-if="ctx.isSearchFocused"
                     class="fixed inset-0 z-[840] bg-black/20 dark:bg-black/50 backdrop-blur-[2px] transition-opacity duration-300"
                     @click="ctx.isSearchFocused = false">
                </div>

                <div class="mobile-tab-bar">
                    <button @click="ctx.mobileTab='pool'; ctx.showMobileTaskInput=false"
                            class="mobile-tab-item"
                            :class="{'active': ctx.mobileTab==='pool' && !ctx.showMobileTaskInput && !ctx.isSearchFocused}">
                        <i class="fa-solid fa-layer-group"></i>
                        <span>任务池</span>
                    </button>

                    <button @click="ctx.showMobileTaskInput = true"
                            class="mobile-tab-item"
                            :class="{'active': ctx.showMobileTaskInput && !ctx.isSearchFocused}">
                        <i class="fa-solid fa-circle-plus text-2xl mb-0.5"></i>
                        <span>添加</span>
                    </button>

                    <button @click="ctx.mobileTab='schedule'; ctx.showMobileTaskInput=false"
                            class="mobile-tab-item"
                            :class="{'active': ctx.mobileTab==='schedule' && !ctx.showMobileTaskInput && !ctx.isSearchFocused}">
                        <i class="fa-regular fa-calendar-days"></i>
                        <span>日程表</span>
                    </button>

                    <!-- 搜索：点开才展开成输入框；有关键词时保持高亮提示「还在筛选中」 -->
                    <button @click="ctx.isSearchFocused = true; $nextTick(() => $refs.mobileSearchInput && $refs.mobileSearchInput.focus())"
                            class="mobile-tab-item relative"
                            :class="{'active': ctx.isSearchFocused}">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <span>搜索</span>
                        <div v-if="ctx.globalSearchQuery && !ctx.isSearchFocused"
                             class="absolute top-1.5 right-2.5 w-2 h-2 rounded-full bg-[#007aff]"></div>
                    </button>
                </div>
            </template>
  `,
};
