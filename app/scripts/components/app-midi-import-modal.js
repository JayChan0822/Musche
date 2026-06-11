export const AppMidiImportModal = {
  name: 'AppMidiImportModal',
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
<div v-if="showMidiImportModal" class="modal-overlay z-[99999]" @click.self="showMidiImportModal=false">
    <div class="modal-window w-[950px] max-w-[98vw] h-[85vh] flex flex-col p-0 overflow-hidden animate-[bubblePop_0.2s]">

        <div class="p-5 border-b border-glass-border dark:border-glass-borderDark bg-gray-50/50 dark:bg-white/5 flex justify-between items-center shrink-0">
            <div>
                <h3 class="text-xl font-bold flex items-center gap-2">
                    <i class="fa-solid fa-file-audio text-teal-500"></i>
                    MIDI Import
                </h3>
                <p class="text-[10px] opacity-50 uppercase tracking-wider mt-1">
                    Tempo: {{ midiBpm }} BPM | {{ managingProject?.name }}
                </p>
            </div>

            <div class="bg-black/5 dark:bg-white/10 p-1 rounded-lg flex text-xs font-bold">
                <button @click="midiViewMode = 'tracks'"
                        class="px-3 py-1.5 rounded-md transition-all"
                        :class="midiViewMode === 'tracks' ? 'bg-white dark:bg-white/20 shadow-sm text-teal-600 dark:text-teal-400' : 'opacity-50 hover:opacity-100'">
                    Tracks ({{ midiImportData.length }})
                </button>
                <button @click="midiViewMode = 'groups'"
                        class="px-3 py-1.5 rounded-md transition-all"
                        :class="midiViewMode === 'groups' ? 'bg-white dark:bg-white/20 shadow-sm text-teal-600 dark:text-teal-400' : 'opacity-50 hover:opacity-100'">
                    Groups ({{ midiGroupData.length }})
                </button>
            </div>

            <button @click="showMidiImportModal=false" class="w-8 h-8 ...">✕</button>
        </div>

        <div class="grid grid-cols-[40px_1.5fr_80px_60px_60px_1.5fr_1fr] gap-4 px-6 py-2 border-b border-black/5 dark:border-white/5 text-[10px] font-bold opacity-50 uppercase tracking-wider items-center bg-white/30 dark:bg-black/20">
            <div class="text-center">Import</div>
            <div>Track Name</div>
            <div class="text-right">Time</div>
            <div class="text-center">Bars</div>
            <div class="text-center">Notes</div>
            <div>Target Instrument</div>
            <div>Group</div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1" @scroll="closeImportMenu">

            <template v-if="midiViewMode === 'tracks'">
                <div v-for="track in midiImportData" :key="track.id"
                     class="group grid grid-cols-[40px_1.5fr_80px_60px_60px_1.5fr_1fr] gap-4 items-center p-2 rounded-xl border border-transparent hover:border-black/5 dark:hover:border-white/5 bg-white/40 dark:bg-white/5 transition-all"
                     :class="{'opacity-40 grayscale': !track.selected}">

                    <div class="flex justify-center">
                        <input type="checkbox" v-model="track.selected" class="cursor-pointer accent-teal-500 w-4 h-4">
                    </div>
                    <div class="min-w-0">
                        <input v-model="track.name" class="bg-transparent font-bold text-sm outline-none w-full truncate" :disabled="!track.selected">
                    </div>
                    <div class="text-right font-mono font-bold text-[#007aff]">{{ formatSecs(track.quantizedDuration) }}</div>
                    <div class="text-center font-mono text-xs opacity-60">{{ track.bars }}</div>
                    <div class="text-center font-mono text-xs font-bold opacity-70">{{ track.noteCount }}</div>

                    <div class="relative min-w-0">
                        <button @click.stop="openImportMenu($event, track.id, 'inst')" :disabled="!track.selected"
                                class="w-full h-9 px-3 rounded-lg bg-black/50 border border-white/10 flex items-center justify-between gap-2 text-left text-white hover:border-[#007aff] transition-colors">
                                    <span class="text-xs font-bold truncate">
                                        {{ track.instrumentId
                                            ? getNameById(track.instrumentId, 'instrument')
                                            : '+ Create: ' + getSmartName(track)
                                        }}
                                    </span>
                            <i class="fa-solid fa-chevron-down text-[8px] opacity-50"></i>
                        </button>
                    </div>

                    <div class="relative min-w-0">
                        <button @click.stop="openImportMenu($event, track.id, 'group')" :disabled="!track.selected"
                                class="w-full h-9 px-3 rounded-lg bg-black/50 border border-white/10 flex items-center justify-between gap-2 text-left text-white hover:border-[#007aff] transition-colors">
                            <span class="text-xs font-bold truncate opacity-80">{{ track.group || 'Unassigned' }}</span>
                            <i class="fa-solid fa-chevron-down text-[8px] opacity-50"></i>
                        </button>
                    </div>
                </div>
            </template>

            <template v-else>
                <div v-for="group in midiGroupData" :key="group.id" class="mb-2">

                    <div class="grid grid-cols-[40px_1.5fr_80px_60px_60px_1.5fr_1fr] gap-4 items-center p-2 rounded-xl border border-teal-500/20 bg-teal-50/80 dark:bg-teal-900/20 transition-all"
                         :class="{'opacity-60': !group.selected}">

                        <div class="flex justify-center">
                            <input type="checkbox"
                                   :checked="group.selected"
                                   @change="toggleGroupSelection(group.items, $event.target.checked)"
                                   class="cursor-pointer accent-teal-500 w-4 h-4">
                        </div>

                        <div class="min-w-0 flex items-center gap-2 cursor-pointer select-none"
                             @click="toggleMidiGroupExpand(group.id)">

                            <div class="w-5 h-5 flex items-center justify-center rounded hover:bg-black/5 transition">
                                <i class="fa-solid fa-chevron-right text-xs opacity-50 transition-transform duration-200"
                                   :class="{'rotate-90': midiGroupExpanded.has(group.id)}"></i>
                            </div>

                            <i class="fa-solid fa-layer-group text-teal-500 text-xs"></i>
                            <span class="font-bold text-sm">{{ group.name }}</span>
                            <span class="text-[9px] opacity-40 font-mono bg-black/5 px-1.5 rounded">{{ group.description }}</span>
                        </div>

                        <div class="text-right flex flex-col justify-center">
                            <div class="text-sm font-mono font-bold text-teal-600 dark:text-teal-400">
                                {{ formatSecs(group.quantizedDuration) }}
                            </div>
                        </div>

                        <div class="text-center font-mono text-xs opacity-60">{{ group.bars }}</div>
                        <div class="text-center font-mono text-xs font-bold opacity-70">{{ group.noteCount }}</div>

                        <div class="relative min-w-0">
                            <button @click.stop="openImportMenu($event, group.id, 'inst')"
                                    :disabled="!group.selected"
                                    class="w-full h-9 px-3 rounded-lg bg-black/50 border border-white/10 hover:border-[#007aff] transition flex items-center justify-between gap-2 group/btn text-left text-white">
                                <div class="flex items-center gap-2 truncate flex-1">
                                    <div v-if="group.instrumentId" class="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                                    <span class="text-xs font-bold truncate">
                            {{ group.instrumentId ? getNameById(group.instrumentId, 'instrument') : '+ Create: ' + group.name }}
                        </span>
                                </div>
                                <i class="fa-solid fa-chevron-down text-[8px] opacity-50 group-hover/btn:opacity-100"></i>
                            </button>
                        </div>

                        <div class="text-xs font-bold opacity-50 pl-2">
                            {{ group.group }}
                        </div>
                    </div>

                    <div v-if="midiGroupExpanded.has(group.id)"
                         class="ml-10 mt-1 border-l-2 border-black/5 dark:border-white/5 pl-2 space-y-1 bg-black/5 dark:bg-white/5 rounded-r-xl p-2">

                        <div v-for="track in group.items" :key="track.id"
                             class="grid grid-cols-[1.5fr_80px_1fr] gap-4 items-center p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                             :class="{'opacity-40 grayscale': !track.selected}">

                            <div class="flex items-center gap-3 min-w-0">
                                <input type="checkbox" v-model="track.selected" class="cursor-pointer accent-teal-500 w-3 h-3">
                                <span class="text-xs font-medium truncate" :title="track.originalName">{{ track.originalName }}</span>
                            </div>

                            <div class="text-right font-mono text-xs opacity-70">
                                {{ formatSecs(track.quantizedDuration) }}
                            </div>

                            <div class="text-xs opacity-40 font-mono">
                                {{ track.noteCount }} notes
                            </div>
                        </div>
                    </div>

                </div>
            </template>

        </div>

        <div class="p-5 border-t border-glass-border dark:border-glass-borderDark bg-gray-50/50 dark:bg-white/5 flex justify-between items-center shrink-0">
            <div class="text-xs opacity-50">
                <span class="font-bold">
                    {{ midiViewMode === 'groups'
                        ? midiGroupData.filter(g => g.selected).length
                        : midiImportData.filter(t => t.selected).length
                    }}
                </span>
                {{ midiViewMode === 'groups' ? 'groups' : 'tracks' }} selected
            </div>
            <button @click="confirmMidiImport"
                    class="bg-teal-500 hover:bg-teal-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-teal-500/20 transition text-sm flex items-center gap-2 active:scale-95">
                <i class="fa-solid fa-file-import"></i>
                Import Data
            </button>
        </div>
    </div>

    <Teleport to="body">
        <div v-if="activeImportMenu.rowId !== null" class="fixed inset-0 z-[99999]" @click="closeImportMenu" @contextmenu.prevent>
            <div class="custom-dropdown-menu fixed overflow-hidden flex flex-col animate-[fadeIn_0.1s] origin-top-left shadow-2xl border border-white/20"
                 :style="{
                     top: importMenuPos.top + 'px',
                     left: importMenuPos.left + 'px',
                     width: Math.max(importMenuPos.width, 200) + 'px',
                     maxHeight: '300px'
                 }"
                 @click.stop>

                <div class="p-2 border-b border-black/5 dark:border-white/5 bg-white/95 dark:bg-[#2c2c2e]/95 backdrop-blur shrink-0">
                    <input id="midi-import-search"
                           v-model="importSearchQuery"
                           :placeholder="activeImportMenu.type === 'inst' ? 'Search Instruments...' : 'Search Groups...'"
                           class="w-full bg-black/5 dark:bg-white/10 rounded-md px-2 py-1.5 text-xs font-bold outline-none border border-transparent focus:border-[#007aff] transition-colors">
                </div>

                <div class="overflow-y-auto flex-1 p-1">

                    <div v-if="activeImportMenu.type === 'inst' && !importSearchQuery"
                         @click="selectImportNewInst(midiImportData.find(t => t.id === activeImportMenu.rowId))"
                         class="px-3 py-2 rounded-md bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white cursor-pointer text-xs font-bold transition-colors flex items-center gap-2 mb-1">
                        <i class="fa-solid fa-plus"></i>
                        <span>Create: {{ getSmartName(currentMidiDisplayList.find(t => t.id === activeImportMenu.rowId)) }}</span>
                    </div>

                    <template v-if="activeImportMenu.type === 'inst'">
                        <div v-for="inst in filteredImportOptions" :key="inst.id"
                             @click="selectImportInst(midiImportData.find(t => t.id === activeImportMenu.rowId), inst)"
                             class="px-3 py-2 rounded-md hover:bg-[#007aff] hover:text-white cursor-pointer text-xs font-bold transition-colors flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full shrink-0" :style="{backgroundColor: inst.color}"></div>
                            <span>{{ inst.name }}</span>
                            <span v-if="inst.group" class="opacity-50 text-[10px] ml-auto font-mono">{{ inst.group }}</span>
                        </div>
                    </template>
                    <div v-if="filteredImportOptions.length === 0" class="p-4 text-center text-[10px] opacity-40">
                        No matches found.
                    </div>

                    <template v-if="activeImportMenu.type === 'group'">

                        <div v-if="importSearchQuery && !availableInstrumentGroups.includes(importSearchQuery)"
                             @click="selectImportGroup(midiImportData.find(t => t.id === activeImportMenu.rowId), importSearchQuery)"
                             class="px-3 py-2 rounded-md bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white cursor-pointer text-xs font-bold transition-colors flex items-center gap-2 mb-1">
                            <i class="fa-solid fa-plus"></i>
                            <span>Create "{{ importSearchQuery }}"</span>
                        </div>

                        <div v-for="g in filteredImportOptions" :key="g"
                             @click="selectImportGroup(midiImportData.find(t => t.id === activeImportMenu.rowId), g)"
                             class="px-3 py-2 rounded-md hover:bg-[#007aff] hover:text-white cursor-pointer text-xs font-bold transition-colors">
                            {{ g }}
                        </div>

                    </template>
                </div>
            </div>
        </div>
    </Teleport>
</div>
  `,
};
