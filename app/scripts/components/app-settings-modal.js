export const AppSettingsModal = {
    name: "AppSettingsModal",
    props: {
        ctx: { type: Object, required: true },
    },
    setup(props) {
        return props.ctx;
    },
    template: `    <div v-if="showSettings" class="modal-overlay z-[5000]" @click.self="showSettings=false">
        <div class="modal-window w-[600px] flex flex-col p-8 animate-[fadeIn_0.2s] max-h-[85vh]">
            <div class="flex justify-between items-center mb-6 shrink-0">
                <h3 class="text-2xl font-bold">Preferences</h3>
                <button @click="showSettings=false"
                        class="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 flex items-center justify-center transition">
                    ✕
                </button>
            </div>

            <div class="space-y-8 overflow-y-auto pr-2 flex-1" @scroll="onSettingsScroll">

                <section>
                    <h4 class="text-xs font-bold uppercase opacity-50 mb-3">Schedule View Range / 日程表显示范围</h4>
                    <div class="flex items-center gap-4 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
                        <div class="flex-1">
                            <label class="text-[10px] font-bold opacity-50 uppercase block mb-1">Start Hour (0-23)</label>
                            <input type="number" v-model.number="settings.startHour" min="0" max="23"
                                   class="glass-input w-full font-mono font-bold text-center h-10"
                                   @change="pushHistory">
                        </div>
                        <div class="text-xl opacity-30 pt-4">
                            <i class="fa-solid fa-arrow-right"></i>
                        </div>
                        <div class="flex-1">
                            <label class="text-[10px] font-bold opacity-50 uppercase block mb-1">End Hour (1-24)</label>
                            <input type="number" v-model.number="settings.endHour" min="1" max="24"
                                   class="glass-input w-full font-mono font-bold text-center h-10"
                                   @change="pushHistory">
                        </div>
                    </div>
<!--                    <p class="text-[10px] opacity-40 mt-2 ml-1">-->
<!--                        * 设置日程表的每日起始和结束时间 (例如 10点 到 22点)-->
<!--                    </p>-->
                </section>

                <section class="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 transition-all duration-300">
                    <div class="flex justify-between items-center" :class="{'mb-4': showMetadataManager}">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <i class="fa-solid fa-database"></i>
                            </div>
                            <div>
                                <h4 class="text-xs font-bold uppercase opacity-70">Metadata</h4>
                                <p class="text-[10px] opacity-40">Studios, Engineers, Assistants...</p>
                            </div>
                        </div>

                        <button @click="showMetadataManager = !showMetadataManager"
                                class="px-3 py-1.5 rounded-lg transition text-[10px] font-bold flex items-center gap-2 border"
                                :class="showMetadataManager
                    ? 'bg-[#007aff] text-white border-[#007aff] shadow-lg shadow-blue-500/30'
                    : 'bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 border-black/5 dark:border-white/5'">
                            <i class="fa-solid" :class="showMetadataManager ? 'fa-chevron-up' : 'fa-pen-to-square'"></i>
                            <span>{{ showMetadataManager ? 'Close' : 'Edit MetaData' }}</span>
                        </button>
                    </div>

                    <div v-if="showMetadataManager" class="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-[fadeIn_0.2s]">
                        <template v-for="type in ['studio', 'engineer', 'operator', 'assistant']" :key="type">
                            <div class="bg-white/50 dark:bg-black/20 rounded-xl p-3 border border-black/5 dark:border-white/5">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-xs font-bold capitalize opacity-70">{{ type }}s</span>
                                    <span class="text-[10px] opacity-30 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono">{{ settings[type+'s'].length }}</span>
                                </div>

                                <div class="space-y-1 mb-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                                    <div v-for="item in settings[type+'s']" :key="item.id"
                                         class="flex items-center justify-between p-2 rounded-lg bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 group transition-colors">
                                        <input :value="item.name"
                                               @change="handleRecRename(type, item, $event)"
                                               class="bg-transparent border-none outline-none font-bold flex-1 text-xs cursor-text min-w-0 text-gray-800 dark:text-gray-200"
                                               placeholder="Name"
                                               @mousedown.stop
                                               @click.stop>
                                        <button @click="removeRecItem(type, item.id)" class="w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition">
                                            <i class="fa-solid fa-xmark text-[10px]"></i>
                                        </button>
                                    </div>
                                    <div v-if="settings[type+'s'].length === 0" class="text-[10px] opacity-30 text-center py-4">
                                        No items
                                    </div>
                                </div>

                                <div class="flex gap-2 relative">
                                    <input v-model="newRecInputs[type]"
                                           class="glass-input h-8 text-xs flex-1 min-w-0 pr-7"
                                           :placeholder="'Add ' + type + '...'"
                                           @keydown.enter="addRecItem(type)">

                                    <button @click="addRecItem(type)"
                                            class="absolute right-0 top-0 h-8 w-8 rounded-lg text-gray-400 hover:text-[#007aff] transition flex items-center justify-center">
                                        <i class="fa-solid fa-plus text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </template>
                    </div>
                </section>

                <section class="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <div class="flex justify-between items-center mb-3">
                        <div>
                            <h4 class="text-xs font-bold uppercase text-orange-600 dark:text-orange-400 mb-1">CSV Data Import</h4>
                            <p class="text-[11px] opacity-60">批量导入任务、时间或编制信息</p>
                        </div>
                        <button @click="triggerCSV('general')"
                                class="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition group">
                            <i class="fa-solid fa-file-csv text-lg"></i>
                            <span class="text-xs font-bold">选择 CSV 文件...</span>
                        </button>
                    </div>
                    <input id="csv-import-input" type="file" accept=".csv" class="hidden" @change="handleCSVImport">
                </section>
<!--                <section class="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">-->
<!--                    <div class="flex justify-between items-center">-->
<!--                        <div>-->
<!--                            <h4 class="text-xs font-bold uppercase text-purple-600 dark:text-purple-400 mb-1">Ratio Maintenance</h4>-->
<!--                            <p class="text-[11px] opacity-60 max-w-[250px]">将所有 x20 (默认) 的任务重置为“自动跟随”模式，以应用大卡片的平均效率。</p>-->
<!--                        </div>-->
<!--                        <button @click="cleanOldRatios"-->
<!--                                class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-purple-500/20 transition flex items-center gap-2">-->
<!--                            <i class="fa-solid fa-wand-magic-sparkles"></i> 清除自定义倍率-->
<!--                        </button>-->
<!--                    </div>-->
<!--                </section>-->
            </div>

            <div class="mt-8 pt-4 border-t border-glass-border dark:border-glass-borderDark flex justify-between items-center shrink-0">
                <button @click="factoryReset"
                        class="text-xs font-bold text-red-400 hover:text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg transition flex items-center gap-2">
                    <i class="fa-solid fa-triangle-exclamation"></i> 恢复出厂设置
                </button>

                <button @click="showSettings=false"
                        class="bg-[#007aff] hover:bg-[#0062cc] text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition text-sm">
                    Done
                </button>
            </div>
        </div>
    </div>`
};
