export const AppCsvImportModal = {
  name: 'AppCsvImportModal',
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
<div v-if="showCsvImportModal" class="modal-overlay z-[7000]" @click.self="showCsvImportModal=false">
    <div class="modal-window w-[1000px] max-w-[95vw] max-h-[90vh] flex flex-col p-6 animate-[bubblePop_0.2s]">

        <div class="flex justify-between items-center mb-4 shrink-0">
            <div>
                <h3 class="text-xl font-bold">Import CSV Data</h3>
                <p class="text-[10px] opacity-50 uppercase tracking-wider">批量导入与更新</p>
            </div>

            <div class="flex gap-4 border-b border-black/10 dark:border-white/10 px-2 shrink-0">
                <button @click="activeImportTab = 'rec'"
                        class="pb-2 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2"
                        :class="activeImportTab === 'rec' ? 'border-[#007aff] text-[#007aff]' : 'border-transparent opacity-50 hover:opacity-100'">
                    <i class="fa-solid fa-microphone-lines"></i>
                    Recording Import
                </button>
                <button @click="activeImportTab = 'edt'"
                        class="pb-2 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2"
                        :class="activeImportTab === 'edt' ? 'border-purple-500 text-purple-500' : 'border-transparent opacity-50 hover:opacity-100'">
                    <i class="fa-solid fa-sliders"></i>
                    Editing Import
                </button>
            </div>
            <div class="mb-4 relative w-40 group">
<span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-focus-within:text-blue-400 transition-colors">
    <i class="fa-solid fa-search text-xs"></i>
</span>

                <input type="text"
                       v-model="csvSearchQuery"
                       placeholder="搜索项目、乐器、演奏员..."
                       class="glass-input h-9 w-full pl-9 pr-8 transition-all duration-300 text-xs font-bold bg-white/40 dark:bg-black/20 focus:bg-white dark:focus:bg-white/10 text-gray-200 placeholder-gray-400 rounded-full border-none outline-none focus:ring-0"
                >

                <button v-if="csvSearchQuery"
                        @click="csvSearchQuery = ''"
                        class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors">
                    <i class="fa-solid fa-circle-xmark text-xs"></i>
                </button>
            </div>

            <button @click="showCsvImportModal=false" class="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition">✕</button>
        </div>

        <div class="bg-black/5 dark:bg-white/5 rounded-xl p-4 mb-4 shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div class="flex flex-col h-full">
                <h4 class="text-[10px] font-bold opacity-50 uppercase mb-2">Import Data Types / 导入内容</h4>
                <div class="flex gap-2 h-full">
                    <label class="flex flex-col items-center justify-center gap-1 bg-white/50 dark:bg-black/20 px-2 py-3 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-black/40 transition flex-1 border border-transparent h-full relative"
                           :class="{'border-[#007aff] bg-blue-500/10': csvImportConfig.importTypes.tasks}">
                        <input type="checkbox" v-model="csvImportConfig.importTypes.tasks" @change="refreshCsvStatus" class="hidden">
                        <i class="fa-solid fa-file-circle-plus text-lg mb-1 transition-colors"
                           :class="csvImportConfig.importTypes.tasks ? 'text-[#007aff]' : 'opacity-30'"></i>
                        <span class="text-[10px] font-bold">Tasks (任务)</span>

                        <div v-if="csvImportConfig.importTypes.tasks" class="absolute top-1 right-1 text-[#007aff] text-[8px]">
                            <i class="fa-solid fa-check"></i>
                        </div>
                    </label>

                    <label class="flex flex-col items-center justify-center gap-1 bg-white/50 dark:bg-black/20 px-2 py-3 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-black/40 transition flex-1 border border-transparent h-full relative"
                           :class="{'border-orange-500 bg-orange-500/10': csvImportConfig.importTypes.time}">
                        <input type="checkbox" v-model="csvImportConfig.importTypes.time" @change="refreshCsvStatus" class="hidden">
                        <i class="fa-solid fa-clock text-lg mb-1 transition-colors"
                           :class="csvImportConfig.importTypes.time ? 'text-orange-500' : 'opacity-30'"></i>
                        <span class="text-[10px] font-bold">Time (时间)</span>

                        <div v-if="csvImportConfig.importTypes.time" class="absolute top-1 right-1 text-orange-500 text-[8px]">
                            <i class="fa-solid fa-check"></i>
                        </div>
                    </label>

                    <label class="flex flex-col items-center justify-center gap-1 bg-white/50 dark:bg-black/20 px-2 py-3 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-black/40 transition flex-1 border border-transparent h-full relative"
                           :class="{'border-purple-500 bg-purple-500/10': csvImportConfig.importTypes.orch}">
                        <input type="checkbox" v-model="csvImportConfig.importTypes.orch" @change="refreshCsvStatus" class="hidden">
                        <i class="fa-solid fa-users text-lg mb-1 transition-colors"
                           :class="csvImportConfig.importTypes.orch ? 'text-purple-500' : 'opacity-30'"></i>
                        <span class="text-[10px] font-bold">Orch (编制)</span>

                        <div v-if="csvImportConfig.importTypes.orch" class="absolute top-1 right-1 text-purple-500 text-[8px]">
                            <i class="fa-solid fa-check"></i>
                        </div>
                    </label>
                </div>
            </div>

            <div class="flex flex-col h-full">
                <h4 class="text-[10px] font-bold opacity-50 uppercase mb-2">Naming Strategy / 命名策略</h4>
                <div class="flex gap-2 h-full">
                    <label class="flex flex-col items-center justify-center gap-1 bg-white/50 dark:bg-black/20 px-2 py-3 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-black/40 transition flex-1 border border-transparent h-full relative"
                           :class="{'border-blue-500 bg-blue-500/10': csvImportConfig.nameStrategy === 'merge'}">
                        <input type="radio" value="merge" v-model="csvImportConfig.nameStrategy" class="hidden">
                        <i class="fa-solid fa-layer-group text-lg mb-1 transition-colors"
                           :class="csvImportConfig.nameStrategy === 'merge' ? 'text-blue-500' : 'opacity-30'"></i>
                        <span class="text-[10px] font-bold text-center leading-tight">智能合并<br><span class="opacity-60 text-[9px]">(Strings)</span></span>

                        <div v-if="csvImportConfig.nameStrategy === 'merge'" class="absolute top-1 right-1 text-blue-500 text-[8px]">
                            <i class="fa-solid fa-check"></i>
                        </div>
                    </label>

                    <label class="flex flex-col items-center justify-center gap-1 bg-white/50 dark:bg-black/20 px-2 py-3 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-black/40 transition flex-1 border border-transparent h-full relative"
                           :class="{'border-blue-500 bg-blue-500/10': csvImportConfig.nameStrategy === 'csv'}">
                        <input type="radio" value="csv" v-model="csvImportConfig.nameStrategy" class="hidden">
                        <i class="fa-solid fa-list-ol text-lg mb-1 transition-colors"
                           :class="csvImportConfig.nameStrategy === 'csv' ? 'text-blue-500' : 'opacity-30'"></i>
                        <span class="text-[10px] font-bold text-center leading-tight">保留原名<br><span class="opacity-60 text-[9px]">(Violin 1, 2)</span></span>

                        <div v-if="csvImportConfig.nameStrategy === 'csv'" class="absolute top-1 right-1 text-blue-500 text-[8px]">
                            <i class="fa-solid fa-check"></i>
                        </div>
                    </label>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-[40px_1.2fr_1fr_1fr_80px_80px] gap-2 px-3 py-2 bg-black/10 dark:bg-white/10 rounded-t-lg text-[10px] font-bold uppercase opacity-60 shrink-0">
            <div class="flex items-center justify-center">
                <input type="checkbox"
                       :checked="csvImportData.length > 0 && csvImportData.every(r => r.selected)"
                       @change="toggleAllRows($event.target.checked)">
            </div>
            <div>Task Name ({{ csvImportConfig.nameStrategy === 'csv' ? 'Original' : 'Merged' }})</div>
            <div>Player / Group</div>
            <div>Orchestration</div>
            <div class="text-center">Duration</div>
            <div class="text-center">Status</div>
        </div>

        <div class="flex-1 overflow-y-auto min-h-0 border border-black/5 dark:border-white/5 rounded-lg bg-white/30 dark:bg-black/10 custom-scrollbar flex flex-col w-full">

            <div v-if="groupedCsvData.length === 0" class="flex flex-col items-center justify-center flex-1 opacity-40 min-h-[200px]">
                <i class="fa-solid fa-filter-circle-xmark text-4xl mb-3"></i>
                <span class="text-sm font-bold">没有需要导入的数据</span>
            </div>

            <div class="p-2 min-w-[800px]">
                <div v-for="group in groupedCsvData" :key="group.projectName"
                     class="mb-3 border border-black/5 dark:border-white/5 rounded-xl overflow-hidden bg-white/40 dark:bg-black/20">

                    <div @click="toggleProjectCollapse(group.projectName)"
                         class="flex items-center gap-2 p-2 bg-black/5 dark:bg-white/5 rounded-lg cursor-pointer select-none hover:bg-black/10 dark:hover:bg-white/10 transition">

                        <i class="fa-solid fa-chevron-right text-xs opacity-50 transition-transform duration-200"
                           :class="{'rotate-90': !collapsedProjects.has(group.projectName)}"></i>

                        <div class="flex items-center mr-2" @click.stop>
                            <input type="checkbox"
                                   :checked="isGroupSelected(group.rows)"
                                   @change="toggleGroupSelection(group, $event.target.checked)"
                                   class="w-4 h-4 rounded border-gray-300 text-[#007aff] focus:ring-[#007aff] cursor-pointer">
                        </div>

                        <span class="font-bold text-sm opacity-80">{{ group.projectName }}</span>

                        <span class="text-[10px] opacity-40 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded ml-auto">
                            {{ group.rows.length }} ITEMS
                        </span>
                    </div>

                    <div v-show="!collapsedProjects.has(group.projectName)" class="border-t border-black/5 dark:border-white/5">

                        <div class="grid grid-cols-[30px_1.5fr_1fr_0.8fr_50px_70px_50px_1fr_60px] gap-2 px-3 py-2 bg-black/5 dark:bg-white/5 text-[9px] font-bold uppercase opacity-50">
                            <div class="text-center">Select</div>
                            <div>Task Name</div>
                            <div>Player / Group</div>
                            <div>Orchestration</div>
                            <div class="text-center">Dur</div>
                            <div>Date</div>
                            <div>Time</div>
                            <div>{{ activeImportTab === 'rec' ? 'Rec Engineer' : 'Edit Engineer' }}</div>
                            <div class="text-center">Status</div>
                        </div>

                        <div v-for="(row, idx) in group.rows" :key="idx"
                             class="grid grid-cols-[30px_1.5fr_1fr_0.8fr_50px_70px_50px_1fr_60px] gap-2 px-3 py-2 border-b border-black/5 dark:border-white/5 text-xs hover:bg-black/5 dark:hover:bg-white/5 transition items-center last:border-0"
                             :class="{'opacity-50 grayscale': !row.selected}"
                             @click="row.selected = !row.selected">

                            <div class="flex items-center justify-center">
                                <input type="checkbox" v-model="row.selected" @click.stop
                                       class="cursor-pointer rounded border-gray-500/50 bg-transparent text-[#007aff] focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5">
                            </div>

                            <div class="min-w-0 font-bold truncate"
                                 :title="csvImportConfig.nameStrategy === 'csv' ? row.name_display : row.name_merge"
                                 :class="row.isDuplicate ? 'text-blue-600 dark:text-blue-400' : ''">
                                {{ csvImportConfig.nameStrategy === 'csv' ? row.name_display : row.name_merge }}
                                <span v-if="row.isSplit" class="text-[9px] opacity-50 font-normal ml-1">Part {{ row.partIndex + 1 }}</span>
                            </div>

                            <div class="min-w-0">
                                <div class="truncate font-bold text-[#007aff] text-[11px]" :title="row.playerName">{{ row.playerName || '-' }}</div>
                                <div class="truncate text-[9px] opacity-60" :title="row.group">{{ row.group || '-' }}</div>
                            </div>

                            <div class="min-w-0">
                <span v-if="row.orchestration"
                      class="truncate inline-block max-w-full text-[9px] bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded"
                      :title="row.orchestration">
                    {{ row.orchestration }}
                </span>
                            </div>

                            <div class="text-center font-mono opacity-70 text-[10px]">{{ row.duration }}</div>

                            <div class="font-mono text-[10px] opacity-80 truncate">
                                {{ activeImportTab === 'rec' ? (row.recDate || '-') : (row.edtDate || '-') }}
                            </div>

                            <div class="font-mono text-[10px] font-bold text-[#007aff] truncate">
                                {{ activeImportTab === 'rec' ? (row.recStart || '-') : (row.edtStart || '-') }}
                            </div>

                            <div class="min-w-0 flex flex-col justify-center">
                <span class="truncate font-bold text-[10px]"
                      :title="activeImportTab === 'rec' ? row.recEngineer : row.edtEngineer">
                    {{ activeImportTab === 'rec' ? (row.recEngineer || '-') : (row.edtEngineer || '-') }}
                </span>
                                <span class="truncate text-[9px] opacity-50"
                                      :title="activeImportTab === 'rec' ? row.recStudio : row.edtStudio">
                    {{ activeImportTab === 'rec' ? row.recStudio : row.edtStudio }}
                </span>
                            </div>

                            <div class="text-center flex justify-center">
                 <span v-if="(activeImportTab==='rec'?row.recStatusText:row.editStatusText) === 'NEW'"
                       class="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[9px] font-bold border border-green-500/20">
                     NEW
                 </span>
                                <span v-else-if="(activeImportTab==='rec'?row.recStatusText:row.editStatusText) === 'UPDATE'"
                                      class="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-bold border border-blue-500/20">
                     UPDATE
                 </span>
                                <span v-else
                                      class="px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-500 text-[9px] font-bold border border-gray-500/20">
                     SKIP
                 </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-4 flex justify-between items-center shrink-0">

            <div class="flex items-center gap-3">
                <button @click="csvImportConfig.showSkipRows = !csvImportConfig.showSkipRows"
                        class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border"
                        :class="csvImportConfig.showSkipRows
                ? 'bg-black/5 dark:bg-white/10 border-black/5 dark:border-white/5 opacity-60'
                : 'bg-orange-500/10 text-orange-600 border-orange-500/20'">
                    <i class="fa-solid" :class="csvImportConfig.showSkipRows ? 'fa-eye' : 'fa-eye-slash'"></i>
                    <span>{{ csvImportConfig.showSkipRows ? '显示全部' : '隐藏重复任务 (SKIP)' }}</span>
                </button>

                <span v-if="!csvImportConfig.showSkipRows" class="text-[10px] opacity-40 font-bold uppercase italic">
        * 仅显示 NEW 或 UPDATE 任务
    </span>
            </div>

            <div class="flex gap-3">
                <button @click="showCsvImportModal=false" class="px-5 py-2 rounded-xl font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 transition text-sm">
                    取消
                </button>
                <button @click="confirmCsvImport" class="px-6 py-2 rounded-xl font-bold bg-[#007aff] hover:bg-[#0062cc] text-white shadow-lg shadow-blue-500/30 transition text-sm flex items-center gap-2">
                    <i class="fa-solid fa-file-import"></i>
                    <span>
            确认导入 ({{ csvImportData.filter(r => r.selected && (activeImportTab === 'rec' ? r.hasRecData : r.hasEditData)).length }})
        </span>
                </button>
            </div>
        </div>
    </div>
</div>
  `,
};
