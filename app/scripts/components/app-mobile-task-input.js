export const AppMobileTaskInput = {
  name: 'AppMobileTaskInput',
  props: {
    ctx: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    return props.ctx;
  },
  template: `
<div v-if="showMobileTaskInput" class="modal-overlay z-[1000]" @click.self="showMobileTaskInput=false">
    <div class="modal-window w-[90vw] sm:w-[300px] p-5 animate-[bubblePop_0.3s] relative bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl">
        <h3 class="text-lg font-bold mb-5 text-center opacity-60 uppercase tracking-widest">添加新任务</h3>

        <div class="space-y-3 relative">

            <div class="mobile-input-group transition-all duration-200"
                 :class="activeDropdown === 'project' ? 'z-[100] relative' : 'z-20 relative'">
                <button @click.stop="toggleDropdown('project')"
                        class="w-full h-[64px] flex items-center justify-between px-4 bg-transparent active:bg-black/5 rounded-xl transition">
                    <div class="flex flex-col items-start min-w-0"><span
                            class="text-[10px] opacity-40 font-bold uppercase tracking-wider mb-0.5">Project</span>
                        <div class="flex items-center gap-2 w-full">
                            <div class="w-1.5 h-4 rounded-full shrink-0"
                                 :style="{backgroundColor: newItem.projectId ? getGroupColor({projectId: newItem.projectId}, 'projectId', true) : '#3b82f6'}"></div>
                            <span class="font-bold text-lg truncate leading-tight">{{ getNameById(newItem.projectId, 'project') === '未知项目' ? '选择项目' : getNameById(newItem.projectId, 'project')
                                }}</span></div>
                    </div>
                    <i class="fa-solid fa-chevron-down opacity-30 text-xs transition-transform duration-300"
                       :class="{'rotate-180': activeDropdown === 'project'}"></i>
                </button>
                <div v-if="activeDropdown === 'project'" class="custom-dropdown-menu">
                    <div class="sticky top-0 bg-white/10 dark:bg-black/10 backdrop-blur-sm p-2 border-b border-black/5 dark:border-white/5 z-20">
                        <input v-model="dropdownSearch" placeholder="搜索项目..."
                               class="w-full bg-transparent text-base px-2 py-1 outline-none placeholder:text-black/30 dark:placeholder:text-white/30"
                               @click.stop></div>

                    <div class="max-h-[35vh] overflow-y-auto">
                        <div v-for="group in getGroupedOptions(filteredOptions)" :key="group.name">

                            <div class="sticky top-0 z-10 w-full px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50/95 dark:bg-[#2c2c2e]/95 backdrop-blur-md border-y border-black/5 dark:border-white/10 shadow-sm flex justify-between items-center cursor-pointer select-none"
                                 @click.stop="toggleDropdownGroup(group.name)">
                                <span>{{ group.name }}</span>

                                <i class="fa-solid fa-chevron-right text-[10px] opacity-50 transition-transform duration-200"
                                   :class="{'rotate-90': dropdownExpandedGroups.has(group.name) || dropdownSearch}"></i>
                            </div>

                            <div v-show="dropdownExpandedGroups.has(group.name) || dropdownSearch">

                                <div v-if="activeDropdown !== 'musician'" v-for="item in group.items" :key="item.id"
                                     @click="selectOption(activeDropdown === 'project' ? 'project' : 'instrument', item)"
                                     class="px-4 py-3 text-base border-b border-black/5 dark:border-white/5 active:bg-black/5 flex items-center gap-3">

                                    <div class="w-3 h-3 rounded-full shrink-0"
                                         :style="{backgroundColor: item.color ? item.color : (activeDropdown === 'project' ? '#eab308' : '#3b82f6')}">
                                    </div>

                                    {{ item.name }}
                                </div>

                                <div v-if="activeDropdown === 'musician'" v-for="m in group.items" :key="m.id"
                                     @click="selectOption('musician', m)"
                                     class="px-4 py-3 text-base border-b border-black/5 dark:border-white/5 active:bg-black/5 flex justify-between items-center">

                                    <div class="flex items-center gap-3">
                                        <div class="w-3 h-3 rounded-full shrink-0"
                                             :style="{backgroundColor: m.color || '#a855f7'}">
                                        </div>
                                        <span>{{ m.name }}</span>
                                    </div>

                                    <span class="text-xs opacity-50 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono">x{{m.defaultRatio}}</span>
                                </div>

                            </div>
                        </div>
                        <div v-if="filteredOptions.length===0" class="p-8 text-center opacity-40 text-sm">无结果
                        </div>
                    </div>
                    <button @click.stop="openQuickAdd('project')"
                            class="w-full py-3 text-sm font-bold text-[#007aff] bg-black/5 dark:bg-white/5 hover:bg-[#007aff] hover:text-white transition flex items-center justify-center gap-2 border-t border-black/5 dark:border-white/5 sticky bottom-0 backdrop-blur-md">
                        <i class="fa-solid fa-plus"></i> 新建项目
                    </button>
                </div>
            </div>

            <div class="mobile-input-group transition-all duration-200"
                 :class="activeDropdown === 'instrument' ? 'z-[90] relative' : 'z-10 relative'">
                <button @click.stop="toggleDropdown('instrument')"
                        class="w-full h-[64px] flex items-center justify-between px-4 bg-transparent active:bg-black/5 rounded-xl transition">
                    <div class="flex flex-col items-start min-w-0"><span
                            class="text-[10px] opacity-40 font-bold uppercase tracking-wider mb-0.5">Instrument</span>
                        <div class="flex items-center gap-2 w-full">
                            <div class="w-1.5 h-4 rounded-full shrink-0"
                                 :style="{backgroundColor: newItem.instrumentId ? getGroupColor({instrumentId: newItem.instrumentId}, 'instrumentId', true) : '#3b82f6'}"></div>
                            <span class="font-bold text-lg truncate leading-tight">{{ getNameById(newItem.instrumentId, 'instrument') === '未知乐器' ? '选择乐器' : getNameById(newItem.instrumentId, 'instrument')
                                }}</span></div>
                    </div>
                    <i class="fa-solid fa-chevron-down opacity-30 text-xs transition-transform duration-300"
                       :class="{'rotate-180': activeDropdown === 'instrument'}"></i>
                </button>
                <div v-if="activeDropdown === 'instrument'" class="custom-dropdown-menu">
                    <div class="sticky top-0 bg-white/10 dark:bg-black/10 backdrop-blur-sm p-2 border-b border-black/5 dark:border-white/5 z-20">
                        <input v-model="dropdownSearch" placeholder="搜索乐器..."
                               class="w-full bg-transparent text-base px-2 py-1 outline-none placeholder:text-black/30 dark:placeholder:text-white/30"
                               @click.stop></div>

                    <div class="max-h-[35vh] overflow-y-auto">
                        <div v-for="group in getGroupedOptions(filteredOptions)" :key="group.name">

                            <div class="sticky top-0 z-10 w-full px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50/95 dark:bg-[#2c2c2e]/95 backdrop-blur-md border-y border-black/5 dark:border-white/10 shadow-sm flex justify-between items-center cursor-pointer select-none"
                                 @click.stop="toggleDropdownGroup(group.name)">
                                <span>{{ group.name }}</span>

                                <i class="fa-solid fa-chevron-right text-[10px] opacity-50 transition-transform duration-200"
                                   :class="{'rotate-90': dropdownExpandedGroups.has(group.name) || dropdownSearch}"></i>
                            </div>

                            <div v-show="dropdownExpandedGroups.has(group.name) || dropdownSearch">

                                <div v-if="activeDropdown !== 'musician'" v-for="item in group.items" :key="item.id"
                                     @click="selectOption(activeDropdown === 'project' ? 'project' : 'instrument', item)"
                                     class="px-4 py-3 text-base border-b border-black/5 dark:border-white/5 active:bg-black/5 flex items-center gap-3">

                                    <div class="w-3 h-3 rounded-full shrink-0"
                                         :style="{backgroundColor: item.color ? item.color : (activeDropdown === 'project' ? '#eab308' : '#3b82f6')}">
                                    </div>

                                    {{ item.name }}
                                </div>

                                <div v-if="activeDropdown === 'musician'" v-for="m in group.items" :key="m.id"
                                     @click="selectOption('musician', m)"
                                     class="px-4 py-3 text-base border-b border-black/5 dark:border-white/5 active:bg-black/5 flex justify-between items-center">

                                    <div class="flex items-center gap-3">
                                        <div class="w-3 h-3 rounded-full shrink-0"
                                             :style="{backgroundColor: m.color || '#a855f7'}">
                                        </div>
                                        <span>{{ m.name }}</span>
                                    </div>

                                    <span class="text-xs opacity-50 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono">x{{m.defaultRatio}}</span>
                                </div>

                            </div>
                        </div>
                        <div v-if="filteredOptions.length===0" class="p-8 text-center opacity-40 text-sm">无结果
                        </div>
                    </div>
                    <button @click.stop="openQuickAdd('instrument')"
                            class="w-full py-3 text-sm font-bold text-[#007aff] bg-black/5 dark:bg-white/5 hover:bg-[#007aff] hover:text-white transition flex items-center justify-center gap-2 border-t border-black/5 dark:border-white/5 sticky bottom-0 backdrop-blur-md">
                        <i class="fa-solid fa-plus"></i> 新建乐器
                    </button>
                </div>
            </div>

            <div class="mobile-input-group transition-all duration-200"
                 :class="activeDropdown === 'musician' ? 'z-[80] relative' : 'z-10 relative'">
                <button @click.stop="toggleDropdown('musician')"
                        class="w-full h-[64px] flex items-center justify-between px-4 bg-transparent active:bg-black/5 rounded-xl transition">
                    <div class="flex flex-col items-start min-w-0"><span
                            class="text-[10px] opacity-40 font-bold uppercase tracking-wider mb-0.5">Musician</span>
                        <div class="flex items-center gap-2 w-full">
                            <div class="w-1.5 h-4 rounded-full shrink-0"
                                 :style="{backgroundColor: newItem.musicianId ? getGroupColor({musicianId: newItem.musicianId}, 'musicianId', true) : '#3b82f6'}"></div>
                            <span class="font-bold text-lg truncate leading-tight">{{ getNameById(newItem.musicianId, 'musician') === '未知演奏员' ? '选择人员' : getNameById(newItem.musicianId, 'musician')
                                }}</span></div>
                    </div>
                    <i class="fa-solid fa-chevron-down opacity-30 text-xs transition-transform duration-300"
                       :class="{'rotate-180': activeDropdown === 'musician'}"></i>
                </button>
                <div v-if="activeDropdown === 'musician'" class="custom-dropdown-menu">
                    <div class="sticky top-0 bg-white/10 dark:bg-black/10 backdrop-blur-sm p-2 border-b border-black/5 dark:border-white/5 z-20">
                        <input v-model="dropdownSearch" placeholder="搜索人员..."
                               class="w-full bg-transparent text-base px-2 py-1 outline-none placeholder:text-black/30 dark:placeholder:text-white/30"
                               @click.stop></div>

                    <div class="max-h-[35vh] overflow-y-auto">
                        <div v-for="group in getGroupedOptions(filteredOptions)" :key="group.name">

                            <div class="sticky top-0 z-10 w-full px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50/95 dark:bg-[#2c2c2e]/95 backdrop-blur-md border-y border-black/5 dark:border-white/10 shadow-sm flex justify-between items-center cursor-pointer select-none"
                                 @click.stop="toggleDropdownGroup(group.name)">
                                <span>{{ group.name }}</span>

                                <i class="fa-solid fa-chevron-right text-[10px] opacity-50 transition-transform duration-200"
                                   :class="{'rotate-90': dropdownExpandedGroups.has(group.name) || dropdownSearch}"></i>
                            </div>

                            <div v-show="dropdownExpandedGroups.has(group.name) || dropdownSearch">

                                <div v-if="activeDropdown !== 'musician'" v-for="item in group.items" :key="item.id"
                                     @click="selectOption(activeDropdown === 'project' ? 'project' : 'instrument', item)"
                                     class="px-4 py-3 text-base border-b border-black/5 dark:border-white/5 active:bg-black/5 flex items-center gap-3">

                                    <div class="w-3 h-3 rounded-full shrink-0"
                                         :style="{backgroundColor: item.color ? item.color : (activeDropdown === 'project' ? '#eab308' : '#3b82f6')}">
                                    </div>

                                    {{ item.name }}
                                </div>

                                <div v-if="activeDropdown === 'musician'" v-for="m in group.items" :key="m.id"
                                     @click="selectOption('musician', m)"
                                     class="px-4 py-3 text-base border-b border-black/5 dark:border-white/5 active:bg-black/5 flex justify-between items-center">

                                    <div class="flex items-center gap-3">
                                        <div class="w-3 h-3 rounded-full shrink-0"
                                             :style="{backgroundColor: m.color || '#a855f7'}">
                                        </div>
                                        <span>{{ m.name }}</span>
                                    </div>

                                    <span class="text-xs opacity-50 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono">x{{m.defaultRatio}}</span>
                                </div>

                            </div>
                        </div>
                        <div v-if="filteredOptions.length===0" class="p-8 text-center opacity-40 text-sm">无结果
                        </div>
                    </div>
                    <button @click.stop="openQuickAdd('musician')"
                            class="w-full py-3 text-sm font-bold text-[#007aff] bg-black/5 dark:bg-white/5 hover:bg-[#007aff] hover:text-white transition flex items-center justify-center gap-2 border-t border-black/5 dark:border-white/5 sticky bottom-0 backdrop-blur-md">
                        <i class="fa-solid fa-plus"></i> 新建演奏员
                    </button>
                </div>
            </div>

            <div class="flex gap-3 items-stretch relative z-0">
                <div class="mobile-input-group flex-1 mb-0 flex items-center justify-center relative bg-white/80 dark:bg-black/40 h-[64px]">
                    <input
                            :value="newItem.musicDuration"
                            @click="isMobile && openDurationPicker($event, newItem, 'musicDuration')"
                            :readonly="isMobile"
                            @input="newItem.musicDuration = $event.target.value"
                            placeholder="00:00"
                            class="w-full h-full bg-transparent text-center font-mono text-3xl font-bold outline-none text-[#8e8e93] tracking-widest placeholder:text-gray-300"
                            :class="isMobile ? 'cursor-pointer' : 'cursor-text'">
                </div>
                <button @click="addItemToPool()"
                        class="w-20 h-[64px] bg-[#007aff] hover:bg-[#0062cc] text-white rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center active:scale-95 transition">
                    <i class="fa-solid fa-plus text-3xl"></i>
                </button>
            </div>
        </div>

        <button @click="showMobileTaskInput=false"
                class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition z-[150]">
            <i class="fa-solid fa-xmark opacity-50"></i></button>
    </div>
</div>
  `,
};
