export const AppMidiManagerModal = {
  name: 'AppMidiManagerModal',
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
<div v-if="showMidiManager" class="modal-overlay z-[6000]" @click.self="showMidiManager=false">
    <div class="modal-window w-[600px] max-w-[90vw] max-h-[85vh] flex flex-col p-6 animate-[bubblePop_0.2s]">

        <div class="flex justify-between items-center mb-4 shrink-0">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
                    <i class="fa-solid fa-music text-xl"></i>
                </div>
                <div>
                    <h3 class="text-xl font-bold truncate max-w-[200px]">{{ managingProject?.name }}</h3>
                    <p class="text-[10px] opacity-50 uppercase tracking-wider">MIDI 映射管理</p>
                </div>
            </div>
            <button @click="showMidiManager=false" class="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition">✕</button>
        </div>

        <div class="flex gap-2 mb-4 mx-6">
            <button @click="triggerMidiImportForProject"
                    class="flex-1 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2">
                <i class="fa-solid fa-file-import"></i> 导入/更新 MIDI
            </button>
            <button @click="clearProjectMidi"
                    class="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold transition">
                清空
            </button>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 mx-6 mb-6">

            <div v-if="projectMidiGroups.length === 0" class="h-full flex flex-col items-center justify-center opacity-40 gap-2 min-h-[150px]">
                <i class="fa-solid fa-music-slash text-2xl"></i>
                <span class="text-xs">暂无 MIDI 数据</span>
            </div>

            <div v-else v-for="group in projectMidiGroups" :key="group.name" class="rounded-xl overflow-hidden bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/5">

                <div @click="toggleMidiManagerGroup(group.name)"
                     class="px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition select-none group/header bg-white/60 dark:bg-black/20 backdrop-blur-sm">

                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-chevron-right text-[10px] opacity-30 transition-transform duration-200"
                           :class="{'rotate-90': midiManagerExpandedGroups.has(group.name)}"></i>
                        <span class="text-xs font-bold uppercase tracking-wider opacity-70">{{ group.name }}</span>
                        <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 opacity-50">{{ group.items.length }}</span>
                    </div>
                </div>

                <div v-show="midiManagerExpandedGroups.has(group.name)" class="p-1 space-y-1">

                    <div v-for="row in group.items" :key="row.instId + '_' + row.subIndex"
                         class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 border border-transparent transition group">

                        <div class="flex-1 min-w-0 flex items-center gap-2">
                            <div class="w-1.5 h-4 rounded-full bg-teal-500 shrink-0 opacity-50"></div>
                            <span class="text-sm font-bold truncate" :title="row.instName">{{ row.instName }}</span>
                        </div>

                        <div class="relative">
                            <button @click.stop="openMidiGroupDropdown($event, row.instId)"
                                    class="h-7 px-2 rounded-md bg-transparent border border-transparent hover:bg-black/5 dark:hover:bg-white/10 hover:border-black/10 dark:hover:border-white/10 transition flex items-center gap-1 min-w-[20px] max-w-[120px] group/btn">
                                <span class="text-[10px] font-bold truncate opacity-30 group-hover/btn:opacity-100">{{ row.group || 'Unassigned' }}</span>
                                <i class="fa-solid fa-folder-tree text-[10px] opacity-20 group-hover/btn:opacity-60"></i>
                            </button>
                        </div>

                        <div class="relative group/input">
                            <input v-model.lazy="row.duration"
                                   @change="updateMidiDuration(row.instId, row.subIndex, $event.target.value)"
                                   class="glass-input w-20 h-8 text-center font-mono text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-500/5 focus:bg-white focus:w-24 transition-all z-10 relative"
                                   placeholder="00:00">
                        </div>

                        <button @click="removeMidiMapping(row.instId, row.subIndex)"
                                class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition opacity-0 group-hover:opacity-100">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <p class="mt-3 text-[10px] opacity-40 text-center">
            * 修改分组会同步更新该乐器的全局设置
        </p>
    </div>

    <Teleport to="body">
        <div v-if="activeMidiGroupRow" class="fixed inset-0 z-[99999]" @click="activeMidiGroupRow = null" @contextmenu.prevent>
            <div class="custom-dropdown-menu fixed overflow-hidden flex flex-col p-0 animate-[fadeIn_0.1s] origin-top-left shadow-2xl border border-white/20 rounded-xl"
                 :style="{
                     top: midiGroupPos.top + 'px',
                     left: midiGroupPos.left + 'px',
                     minWidth: '200px',
                     maxHeight: '300px',
                     width: 'auto'
                 }"
                 @click.stop>

                <div class="p-2 border-b border-black/5 dark:border-white/5 bg-gray-50/90 dark:bg-[#2c2c2e]/90 backdrop-blur shrink-0">
                    <input id="midi-group-search-input"
                           v-model="midiGroupSearchQuery"
                           placeholder="Search or Create..."
                           class="w-full bg-white/50 dark:bg-black/20 rounded-md px-2 py-1.5 text-xs font-bold outline-none border border-black/5 dark:border-white/10 focus:border-[#007aff] transition-colors"
                           @keydown.enter="updateInstrumentGroup(activeMidiGroupRow, midiGroupSearchQuery)">
                </div>

                <div class="overflow-y-auto flex-1 p-1 custom-scrollbar">

                    <div v-if="midiGroupSearchQuery && !filteredMidiGroups.includes(midiGroupSearchQuery)"
                         @click="updateInstrumentGroup(activeMidiGroupRow, midiGroupSearchQuery)"
                         class="px-3 py-2 rounded-md bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white cursor-pointer text-xs font-bold transition-colors flex items-center gap-2 mb-1">
                        <i class="fa-solid fa-plus"></i>
                        <span>Create "{{ midiGroupSearchQuery }}"</span>
                    </div>

                    <div v-for="g in filteredMidiGroups" :key="g"
                         @click="updateInstrumentGroup(activeMidiGroupRow, g)"
                         class="px-3 py-2.5 rounded-md hover:bg-[#007aff] hover:text-white cursor-pointer text-xs font-bold transition-colors flex justify-between items-center group/item">
                        <span>{{ g }}</span>
                        <i v-if="settings.instruments.find(i => i.id === activeMidiGroupRow)?.group === g"
                           class="fa-solid fa-check text-[10px]"></i>
                    </div>

                    <div v-if="filteredMidiGroups.length === 0 && !midiGroupSearchQuery" class="p-4 text-center text-[10px] opacity-40">
                        No groups found.
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</div>
  `,
};
