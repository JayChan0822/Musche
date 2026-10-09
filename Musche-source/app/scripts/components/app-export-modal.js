export const AppExportModal = {
  name: 'AppExportModal',
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
<div v-if="showExportModal" class="modal-overlay z-[5500]" @click.self="showExportModal=false">
    <div class="modal-window w-[520px] max-w-[95vw] max-h-[85vh] flex flex-col p-6 animate-[bubblePop_0.2s]">

        <!-- 标题栏 -->
        <div class="flex justify-between items-center mb-5 shrink-0">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
                    <i class="fa-solid fa-table text-lg"></i>
                </div>
                <div>
                    <h3 class="text-lg font-bold">导出表格</h3>
                    <p class="text-[10px] opacity-50">选择需要导出的数据范围</p>
                </div>
            </div>
            <button @click="showExportModal=false" class="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition">✕</button>
        </div>

        <!-- 滚动区域 -->
        <div class="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4 pr-1">

            <!-- 日期范围 -->
            <div class="bg-black/[0.03] dark:bg-white/[0.04] rounded-xl p-3.5">
                <div class="text-xs font-bold opacity-60 mb-2.5 flex items-center gap-1.5">
                    <i class="fa-regular fa-calendar"></i> 日期范围
                </div>
                <div class="flex items-center gap-2">
                    <input type="date" v-model="exportFilter.dateFrom"
                           :min="exportDateRange.min" :max="exportFilter.dateTo || exportDateRange.max"
                           class="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 text-sm outline-none focus:border-teal-400 transition">
                    <span class="text-xs opacity-40">至</span>
                    <input type="date" v-model="exportFilter.dateTo"
                           :min="exportFilter.dateFrom || exportDateRange.min" :max="exportDateRange.max"
                           class="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 text-sm outline-none focus:border-teal-400 transition">
                </div>
            </div>

            <!-- Session -->
            <div class="bg-black/[0.03] dark:bg-white/[0.04] rounded-xl p-3.5">
                <div class="text-xs font-bold opacity-60 mb-2.5 flex items-center gap-1.5">
                    <i class="fa-solid fa-layer-group"></i> Session
                </div>
                <div class="flex flex-wrap gap-1.5">
                    <button v-for="opt in exportSessionOptions" :key="opt.id"
                            @click="toggleFilterItem('sessions', opt.id)"
                            class="px-3 py-1.5 rounded-lg text-xs font-bold transition border"
                            :class="exportFilter.sessions.has(opt.id)
                                ? 'bg-teal-500 text-white border-teal-500'
                                : 'bg-white dark:bg-white/10 border-black/10 dark:border-white/10 opacity-50 hover:opacity-80'">
                        {{ opt.name }}
                    </button>
                </div>
            </div>

            <!-- 任务类型 REC / EDT -->
            <div class="bg-black/[0.03] dark:bg-white/[0.04] rounded-xl p-3.5">
                <div class="text-xs font-bold opacity-60 mb-2.5 flex items-center gap-1.5">
                    <i class="fa-solid fa-tags"></i> 任务类型
                </div>
                <div class="flex gap-2">
                    <button @click="toggleFilterItem('types', 'REC')"
                            class="flex-1 py-2 rounded-lg text-sm font-bold transition border flex items-center justify-center gap-2"
                            :class="exportFilter.types.has('REC')
                                ? 'bg-teal-500 text-white border-teal-500'
                                : 'bg-white dark:bg-white/10 border-black/10 dark:border-white/10 opacity-40 hover:opacity-70'">
                        <i class="fa-solid fa-microphone-lines"></i> REC 录音
                    </button>
                    <button @click="toggleFilterItem('types', 'EDT')"
                            class="flex-1 py-2 rounded-lg text-sm font-bold transition border flex items-center justify-center gap-2"
                            :class="exportFilter.types.has('EDT')
                                ? 'bg-orange-500 text-white border-orange-500'
                                : 'bg-white dark:bg-white/10 border-black/10 dark:border-white/10 opacity-40 hover:opacity-70'">
                        <i class="fa-solid fa-sliders"></i> EDT 编辑
                    </button>
                </div>
            </div>

            <!-- 项目筛选 -->
            <div class="bg-black/[0.03] dark:bg-white/[0.04] rounded-xl p-3.5">
                <div class="flex items-center justify-between mb-2.5">
                    <div class="text-xs font-bold opacity-60 flex items-center gap-1.5">
                        <i class="fa-solid fa-folder"></i> 项目
                        <span class="opacity-50 font-normal" v-if="exportFilter.projects.size > 0">({{ exportFilter.projects.size }})</span>
                        <span class="opacity-40 font-normal" v-else>全部</span>
                    </div>
                    <button @click="toggleFilterAll('projects', filteredExportProjects.map(o=>o.id))"
                            class="text-[10px] text-teal-500 hover:text-teal-600 font-bold transition">
                        {{ filteredExportProjects.every(o => exportFilter.projects.has(o.id)) && exportFilter.projects.size > 0 ? '取消全选' : '全选' }}
                    </button>
                </div>
                <input type="text" v-model="exportFilter.searchProject" placeholder="搜索项目..."
                       class="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 text-xs outline-none focus:border-teal-400 transition mb-2">
                <div class="max-h-[120px] overflow-y-auto custom-scrollbar flex flex-wrap gap-1.5">
                    <button v-for="opt in filteredExportProjects" :key="opt.id"
                            @click="toggleFilterItem('projects', opt.id)"
                            class="px-2.5 py-1 rounded-md text-[11px] font-bold transition border"
                            :class="exportFilter.projects.has(opt.id)
                                ? 'bg-yellow-500 text-white border-yellow-500'
                                : 'bg-white dark:bg-white/10 border-black/10 dark:border-white/10 opacity-50 hover:opacity-80'">
                        {{ opt.name }}
                    </button>
                </div>
            </div>

            <!-- 演奏员筛选 -->
            <div class="bg-black/[0.03] dark:bg-white/[0.04] rounded-xl p-3.5">
                <div class="flex items-center justify-between mb-2.5">
                    <div class="text-xs font-bold opacity-60 flex items-center gap-1.5">
                        <i class="fa-solid fa-user"></i> 演奏员
                        <span class="opacity-50 font-normal" v-if="exportFilter.musicians.size > 0">({{ exportFilter.musicians.size }})</span>
                        <span class="opacity-40 font-normal" v-else>全部</span>
                    </div>
                    <button @click="toggleFilterAll('musicians', filteredExportMusicians.map(o=>o.id))"
                            class="text-[10px] text-teal-500 hover:text-teal-600 font-bold transition">
                        {{ filteredExportMusicians.every(o => exportFilter.musicians.has(o.id)) && exportFilter.musicians.size > 0 ? '取消全选' : '全选' }}
                    </button>
                </div>
                <input type="text" v-model="exportFilter.searchMusician" placeholder="搜索演奏员..."
                       class="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 text-xs outline-none focus:border-teal-400 transition mb-2">
                <div class="max-h-[120px] overflow-y-auto custom-scrollbar flex flex-wrap gap-1.5">
                    <button v-for="opt in filteredExportMusicians" :key="opt.id"
                            @click="toggleFilterItem('musicians', opt.id)"
                            class="px-2.5 py-1 rounded-md text-[11px] font-bold transition border"
                            :class="exportFilter.musicians.has(opt.id)
                                ? 'bg-purple-500 text-white border-purple-500'
                                : 'bg-white dark:bg-white/10 border-black/10 dark:border-white/10 opacity-50 hover:opacity-80'">
                        {{ opt.name }}
                    </button>
                </div>
            </div>

            <!-- 乐器筛选 -->
            <div class="bg-black/[0.03] dark:bg-white/[0.04] rounded-xl p-3.5">
                <div class="flex items-center justify-between mb-2.5">
                    <div class="text-xs font-bold opacity-60 flex items-center gap-1.5">
                        <i class="fa-solid fa-guitar"></i> 乐器
                        <span class="opacity-50 font-normal" v-if="exportFilter.instruments.size > 0">({{ exportFilter.instruments.size }})</span>
                        <span class="opacity-40 font-normal" v-else>全部</span>
                    </div>
                    <button @click="toggleFilterAll('instruments', filteredExportInstruments.map(o=>o.id))"
                            class="text-[10px] text-teal-500 hover:text-teal-600 font-bold transition">
                        {{ filteredExportInstruments.every(o => exportFilter.instruments.has(o.id)) && exportFilter.instruments.size > 0 ? '取消全选' : '全选' }}
                    </button>
                </div>
                <input type="text" v-model="exportFilter.searchInstrument" placeholder="搜索乐器..."
                       class="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 text-xs outline-none focus:border-teal-400 transition mb-2">
                <div class="max-h-[120px] overflow-y-auto custom-scrollbar flex flex-wrap gap-1.5">
                    <button v-for="opt in filteredExportInstruments" :key="opt.id"
                            @click="toggleFilterItem('instruments', opt.id)"
                            class="px-2.5 py-1 rounded-md text-[11px] font-bold transition border"
                            :class="exportFilter.instruments.has(opt.id)
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white dark:bg-white/10 border-black/10 dark:border-white/10 opacity-50 hover:opacity-80'">
                        <span v-if="opt.group" class="opacity-60">{{ opt.group }} · </span>{{ opt.name }}
                    </button>
                </div>
            </div>

        </div>

        <!-- 底部操作栏 -->
        <div class="flex items-center justify-between mt-4 pt-3 border-t border-black/5 dark:border-white/5 shrink-0">
            <span class="text-xs opacity-50">
                <i class="fa-solid fa-list"></i> 共 <strong class="text-teal-600 dark:text-teal-400">{{ exportPreviewCount }}</strong> 条数据
            </span>
            <div class="flex gap-2">
                <button @click="showExportModal=false"
                        class="px-5 py-2.5 rounded-xl font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 transition text-sm">
                    取消
                </button>
                <button @click="confirmExport"
                        :disabled="exportPreviewCount === 0"
                        class="px-5 py-2.5 rounded-xl font-bold bg-teal-500 text-white hover:bg-teal-600 transition text-sm disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2">
                    <i class="fa-solid fa-download"></i> 导出 Excel
                </button>
            </div>
        </div>

    </div>
</div>
  `,
};
