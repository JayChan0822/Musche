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
                <!-- 常驻 dock 上方，输入和清空后都保持原位。 -->
                <div class="mobile-search-bar fixed z-[850]">
                    <div class="relative w-full h-full shadow-lg rounded-full">
                        <div class="mobile-search-surface absolute inset-0 backdrop-blur-xl rounded-full border border-white/40 dark:border-white/10 shadow-sm"></div>

                        <i class="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10"></i>

                        <input ref="mobileSearchInput"
                               v-model="ctx.globalSearchQuery"
                               @focus="ctx.onSearchFocus"
                               @blur="ctx.handleSearchBlur"
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
