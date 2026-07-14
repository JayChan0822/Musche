export const AppEditModal = {
  name: 'AppEditModal',
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
<div v-if="showEditor" class="modal-overlay" @click.self="showEditor=false">
    <div class="modal-window w-96 max-h-[85vh] flex flex-col p-6 animate-[fadeIn_0.1s] relative">

        <div v-if="editingSource === 'pool'" class="absolute top-6 right-6 z-10">
            <label class="flex items-center gap-2 cursor-pointer select-none group" title="该曲目不计入总时长，不参与排期计算">
            <span class="text-[10px] font-bold uppercase tracking-wider transition-colors"
                  :class="editingItem.isSkipped ? 'text-red-500' : 'opacity-30 group-hover:opacity-100'">
                {{ editingItem.isSkipped ? 'Skip / 不录' : 'Active' }}
            </span>
                <div class="relative w-10 h-5 rounded-full transition-colors duration-300 border border-black/5 dark:border-white/5"
                     :class="editingItem.isSkipped ? 'bg-red-500' : 'bg-black/10 dark:bg-white/10'">
                    <input type="checkbox" v-model="editingItem.isSkipped" class="hidden">
                    <div class="absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300"
                         :class="editingItem.isSkipped ? 'translate-x-5' : 'translate-x-0'"></div>
                </div>
            </label>
        </div>

        <h3 class="font-bold text-xl mb-4 shrink-0">Edit Event</h3>

        <div class="space-y-4 text-sm flex-1 min-h-0 pr-1 custom-scrollbar edit-event-scroll-area" :class="{ 'overflow-visible': activeDropdown && activeDropdown.startsWith('edit_'), 'overflow-y-auto': !activeDropdown || !activeDropdown.startsWith('edit_') }">

            <div class="grid grid-cols-2 gap-3 relative">
                <div class="relative transition-all" :class="activeDropdown === 'edit_project' ? 'z-[50]' : 'z-20'">
                    <button @click.stop="toggleDropdown('edit_project')" class="glass-input w-full h-[42px] flex items-center px-3 font-bold text-sm group">
                        <span class="flex-1 truncate text-center">{{ getNameById(editingItem.projectId, 'project') }}</span>
                        <i class="fa-solid fa-chevron-down opacity-30 text-[10px] transition-transform duration-200" :class="{'rotate-180': activeDropdown === 'edit_project'}"></i>
                    </button>
                    <div v-if="activeDropdown === 'edit_project'" class="custom-dropdown-menu">
                        <div class="sticky top-0 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-md p-2 border-b border-black/5 dark:border-white/5 z-20">
                            <input v-model="dropdownSearch" placeholder="搜索项目..." class="w-full bg-transparent text-sm px-2 py-1 outline-none placeholder:opacity-50" @click.stop>
                        </div>
                        <div class="max-h-[200px] overflow-y-auto">
                            <div v-for="group in getGroupedOptions(filteredOptions)" :key="group.name">
                                <div class="sticky top-0 z-10 w-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider opacity-50 bg-gray-50/90 dark:bg-[#2c2c2e]/90 backdrop-blur border-y border-black/5 dark:border-white/5 flex justify-between items-center cursor-pointer" @click.stop="toggleDropdownGroup(group.name)">
                                    {{ group.name }} <i class="fa-solid fa-chevron-right transition-transform" :class="{'rotate-90': dropdownExpandedGroups.has(group.name) || dropdownSearch}"></i>
                                </div>
                                <div v-for="item in group.items" :key="item.id" @click="selectOption('project', item)" class="px-3 py-2.5 text-sm border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer flex items-center gap-2">
                                    <div class="w-2 h-2 rounded-full shrink-0" :style="{backgroundColor: item.color || '#eab308'}"></div>
                                    {{ item.name }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="relative transition-all" :class="activeDropdown === 'edit_instrument' ? 'z-[50]' : 'z-20'">
                    <button @click.stop="toggleDropdown('edit_instrument')" class="glass-input w-full h-[42px] flex items-center px-3 font-bold text-sm group">
                        <span class="flex-1 truncate text-center">{{ getNameById(editingItem.instrumentId, 'instrument') }}</span>
                        <i class="fa-solid fa-chevron-down opacity-30 text-[10px] transition-transform duration-200" :class="{'rotate-180': activeDropdown === 'edit_instrument'}"></i>
                    </button>
                    <div v-if="activeDropdown === 'edit_instrument'" class="custom-dropdown-menu">
                        <div class="sticky top-0 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-md p-2 border-b border-black/5 dark:border-white/5 z-20">
                            <input v-model="dropdownSearch" placeholder="搜索乐器..." class="w-full bg-transparent text-sm px-2 py-1 outline-none placeholder:opacity-50" @click.stop>
                        </div>
                        <div class="max-h-[200px] overflow-y-auto">
                            <div v-for="group in getGroupedOptions(filteredOptions)" :key="group.name">
                                <div class="sticky top-0 z-10 w-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider opacity-50 bg-gray-50/90 dark:bg-[#2c2c2e]/90 backdrop-blur border-y border-black/5 dark:border-white/5 flex justify-between items-center cursor-pointer" @click.stop="toggleDropdownGroup(group.name)">
                                    {{ group.name }} <i class="fa-solid fa-chevron-right transition-transform" :class="{'rotate-90': dropdownExpandedGroups.has(group.name) || dropdownSearch}"></i>
                                </div>
                                <div v-show="dropdownExpandedGroups.has(group.name) || dropdownSearch">
                                    <div v-for="item in group.items" :key="item.id" @click="selectOption('instrument', item)" class="px-3 py-2.5 text-sm border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer flex items-center gap-2">
                                        <div class="w-2 h-2 rounded-full shrink-0" :style="{backgroundColor: item.color || '#3b82f6'}"></div>
                                        {{ item.name }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <input :value="editingItem.musicDuration" @input="editingItem.musicDuration = $event.target.value" :readonly="isMobile" @click="isMobile && openDurationPicker($event, editingItem, 'musicDuration')" class="glass-input w-full font-mono font-bold tracking-widest text-center text-lg h-[42px]" :class="isMobile ? 'cursor-pointer caret-transparent' : 'cursor-text'" placeholder="00:00">

                <div class="relative transition-all" :class="activeDropdown === 'edit_musician' ? 'z-[50]' : 'z-20'">
                    <button @click.stop="toggleDropdown('edit_musician')" class="glass-input w-full h-[42px] flex items-center px-3 font-bold text-sm group">
                        <span class="flex-1 truncate text-center">{{ getNameById(editingItem.musicianId, 'musician') }}</span>
                        <i class="fa-solid fa-chevron-down opacity-30 text-[10px] transition-transform duration-200" :class="{'rotate-180': activeDropdown === 'edit_musician'}"></i>
                    </button>
                    <div v-if="activeDropdown === 'edit_musician'" class="custom-dropdown-menu">
                        <div class="sticky top-0 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-md p-2 border-b border-black/5 dark:border-white/5 z-20">
                            <input v-model="dropdownSearch" placeholder="搜索人员..." class="w-full bg-transparent text-sm px-2 py-1 outline-none placeholder:opacity-50" @click.stop>
                        </div>
                        <div class="max-h-[200px] overflow-y-auto">
                            <div v-for="group in getGroupedOptions(filteredOptions)" :key="group.name">
                                <div class="sticky top-0 z-10 w-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider opacity-50 bg-gray-50/90 dark:bg-[#2c2c2e]/90 backdrop-blur border-y border-black/5 dark:border-white/5 flex justify-between items-center cursor-pointer" @click.stop="toggleDropdownGroup(group.name)">
                                    {{ group.name }} <i class="fa-solid fa-chevron-right transition-transform" :class="{'rotate-90': dropdownExpandedGroups.has(group.name) || dropdownSearch}"></i>
                                </div>
                                <div v-show="dropdownExpandedGroups.has(group.name) || dropdownSearch">
                                    <div v-for="m in group.items" :key="m.id" @click="selectOption('musician', m)" class="px-3 py-2.5 text-sm border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer flex justify-between items-center">
                                        <div class="flex items-center gap-2">
                                            <div class="w-2 h-2 rounded-full shrink-0" :style="{backgroundColor: m.color || '#a855f7'}"></div>
                                            <span>{{ m.name }}</span>
                                        </div>
                                        <span class="text-[10px] opacity-50 font-mono bg-black/5 dark:bg-white/10 px-1 rounded">x{{m.defaultRatio}}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="showOrchestrationField" class="mt-3">
                <label class="text-[10px] font-bold opacity-50 uppercase block mb-1 ml-1">Orchestration / 编制</label>
                <div class="flex items-center gap-2">
                    <input v-model="editingItem.orchestration"
                           class="glass-input flex-1 text-sm font-mono placeholder:text-gray-400"
                           placeholder="例如: 4 Fl, 3 Ob (自动生成名单)"
                           @keydown.enter="saveEdit">

                    <div class="flex gap-1">
                        <button @click="editingItem.orchestration = activeOrchPresets.full"
                                class="px-2 py-1 rounded bg-black/5 hover:bg-black/10 text-[10px] font-mono transition"
                                :title="activeOrchPresets.full">
                            Full
                        </button>
                        <button @click="editingItem.orchestration = activeOrchPresets.std"
                                class="px-2 py-1 rounded bg-black/5 hover:bg-black/10 text-[10px] font-mono transition"
                                :title="activeOrchPresets.std">
                            Std
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="showOrchestrationField && parsedRoster.length > 0" class="mt-3 bg-black/5 dark:bg-white/5 rounded-xl p-3 border border-black/5 dark:border-white/5">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-[10px] font-bold uppercase opacity-50 tracking-wider">Musician Roster / 乐手名单</span>
                    <button @click="editingItem.roster = {}" class="text-[9px] opacity-40 hover:opacity-100 hover:text-red-500 transition">Clear</button>
                </div>

                <div class="space-y-3">
                    <div v-for="section in parsedRoster" :key="section.label" class="flex flex-col gap-1">
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] font-bold w-8 text-right shrink-0 opacity-60">{{ section.label }}</span>
                            <div class="h-px bg-black/5 dark:bg-white/5 flex-1"></div>
                        </div>

                        <div class="grid grid-cols-2 gap-2 pl-10">
                            <input v-for="n in section.count"
                                   :key="section.label + n"
                                   :value="getRosterName(section.label, n-1)"
                                   @input="updateRosterName(section.label, n-1, $event.target.value)"
                                   class="glass-input h-7 text-xs px-2 bg-white/50 dark:bg-black/20"
                                   :placeholder="section.label + ' ' + n"
                            >
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="isPercussionMode" class="mt-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 overflow-hidden animate-[fadeIn_0.3s]">
                <div class="px-3 py-2 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-gray-100/50 dark:bg-black/20">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-bold uppercase tracking-wider opacity-60">Percussion Dist. / 打击乐分部</span>
                        <button @click="scanPercussionTags" class="w-5 h-5 rounded hover:bg-black/10 flex items-center justify-center transition" title="重新扫描任务">
                            <i class="fa-solid fa-rotate text-[10px] opacity-50"></i>
                        </button>
                    </div>
                    <button @click="addPercPlayer" class="text-[9px] font-bold bg-[#007aff] text-white px-2 py-1 rounded hover:brightness-110 transition">
                        + Player
                    </button>
                </div>

                <div class="p-3 grid grid-cols-1 gap-3">

                    <div class="flex flex-wrap gap-1.5 min-h-[30px] content-start">
                        <div v-for="(tag, idx) in percState.tags" :key="idx"
                             @click="togglePercTagSelect(idx)"
                             class="px-2 py-1 rounded text-[10px] font-bold cursor-pointer border transition-all duration-200 select-none flex items-center gap-1"
                             :class="[
                                 // 选中态 (高亮)
                                 percState.selectedTagIndices.has(idx)
                                    ? 'bg-[#007aff] text-white border-[#007aff] shadow-md transform scale-105'
                                    : (tag.assignedTo ? 'bg-green-500/10 text-green-600 border-transparent opacity-50' : 'bg-white dark:bg-white/10 border-black/10 dark:border-white/10 hover:border-[#007aff]')
                             ]">
                            {{ tag.fullName }}
                            <span v-if="tag.name !== tag.fullName" class="opacity-60 font-mono">({{ tag.name }})</span>

                            <span v-if="tag.assignedTo" class="ml-1.5 px-1.5 h-4 min-w-[16px] rounded-full bg-green-500 text-white flex items-center justify-center text-[9px] font-bold shadow-sm whitespace-nowrap transform scale-90 sm:scale-100 origin-left">
                                {{ percState.players.find(p => p.id === tag.assignedTo)?.name.replace('Perc ', '') }}
                            </span>
                        </div>
                        <div v-if="percState.tags.length === 0" class="text-[10px] opacity-30 w-full text-center py-2">
                            未检测到打击乐任务 (请确保任务名包含 Snare, Cymbal 等)
                        </div>
                    </div>

                    <div v-if="percState.selectedTagIndices.size > 0" class="flex justify-center -my-1 animate-bounce text-[#007aff]">
                        <i class="fa-solid fa-arrow-down text-xs"></i>
                    </div>

                    <div class="space-y-1.5">
                        <div v-for="(player, pIdx) in percState.players" :key="player.id"
                             @click="assignTagsToPlayer(player.id)"
                             class="flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer group"
                             :class="percState.selectedTagIndices.size > 0 ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/20' : 'bg-white/50 dark:bg-black/20 border-transparent'">

                            <div class="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">
                                {{ player.id }}
                            </div>

                            <input v-model="player.name" @change="updatePercOrchestration" @click.stop class="bg-transparent font-bold text-xs w-16 outline-none">

                            <div class="flex-1 flex flex-wrap gap-1">
                                <span v-for="tag in percState.tags.filter(t => t.assignedTo === player.id)"
                                      class="text-[9px] font-mono px-1 rounded bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                                    {{ tag.name }}
                                </span>
                            </div>

                            <button @click.stop="removePercPlayer(pIdx)" class="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <div v-if="!isPercussionMode && showOrchestrationField" class="mt-3">
            </div>

            <div v-if="isPercussionMode" class="mt-2">
                <label class="text-[9px] font-bold opacity-40 uppercase ml-1">Summary Preview</label>
                <textarea v-model="editingItem.orchestration" readonly class="glass-input w-full text-xs font-mono h-16 resize-none opacity-80 bg-black/5"></textarea>
            </div>

            <div v-if="editingSource === 'schedule'" class="pt-4 border-t border-white/10 mt-2">
                <div class="flex gap-3">
                    <input type="date" v-model="editingItem.date" class="glass-input flex-1 font-bold text-center">
                    <select v-model="editingItem.startTime" class="glass-input w-24 font-mono font-bold text-center">
                        <option v-for="t in timeSlots" :value="t">{{t}}</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="flex justify-between mt-4 pt-4 border-t border-black/5 dark:border-white/5 shrink-0">
            <button @click="deleteEditingItem"
                    class="text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg transition text-sm font-bold">
                Delete
            </button>
            <button @click="pushHistory(); saveEdit()"
                    class="bg-[#007aff] text-white px-6 py-2 rounded-lg font-bold shadow hover:shadow-lg transition text-sm">
                Save
            </button>
        </div>
    </div>
</div>
  `,
};
