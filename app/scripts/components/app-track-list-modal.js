export const AppTrackListModal = {
  name: 'AppTrackListModal',
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
<div v-if="showTrackList" class="modal-overlay" @click.self="showTrackList=false">
    <div class="modal-window w-[450px] max-w-[90vw] max-h-[80vh] flex flex-col p-0 overflow-hidden animate-[fadeIn_0.1s]">

        <div class="p-5 bg-white/50 dark:bg-black/20 backdrop-blur border-b border-glass-border dark:border-glass-borderDark flex justify-between items-center shrink-0 gap-4">

            <div class="flex items-center gap-3 min-w-0">
                <h3 class="font-bold text-lg truncate" :title="trackListData.name">
                    {{ trackListData.name }}
                </h3>

                <button @click="openRecInfoModal"
                        class="w-7 h-7 rounded-full bg-blue-500/10 hover:bg-blue-500 text-blue-600 hover:text-white flex items-center justify-center transition shadow-sm group shrink-0"
                        :title="sidebarTab === 'musician' ? '填写录音信息 (Recording Info)' : '填写编辑信息 (Editing Info)'">
                    <i class="fa-solid fa-clipboard-user text-xs"></i>
                </button>
            </div>

            <div class="flex items-center gap-2 shrink-0">
                <div class="relative group mr-2">
                    <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 group-focus-within:text-[#007aff] transition-colors pointer-events-none"></i>
                    <input
                            v-model="trackListSearchQuery"
                            @input="handleTrackListSearchAction(false)"
                            @keydown.enter.prevent="handleTrackListSearchAction(true)"
                            type="text"
                            placeholder="Search..."
                            class="track-list-search-input glass-input h-8 pr-2 text-xs w-24 focus:w-40 transition-all duration-300 rounded-full bg-black/5 dark:bg-white/10 border-transparent focus:bg-white dark:focus:bg-black/40 placeholder:text-gray-400"
                    >
                </div>
                <button @click="autoDistributeSections"
                        class="w-8 h-8 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition group"
                        title="根据日程时长自动分配曲目 (Auto Distribute)">
                    <i class="fa-solid fa-wand-magic-sparkles text-xs opacity-50 group-hover:opacity-100 group-hover:text-purple-500 transition-all"></i>
                </button>
                <button @click="sortTrackList"
                        class="w-8 h-8 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition group"
                        title="按时间排序">
                    <i class="fa-solid fa-arrow-down-short-wide text-xs opacity-50 group-hover:opacity-100 group-hover:text-[#007aff] transition-all"></i>
                </button>

                <button @click="showTrackList=false"
                        class="w-8 h-8 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition">
                    ✕
                </button>
            </div>
        </div>

        <div ref="trackListContainerRef" class="p-3 overflow-y-auto flex-1 min-h-[100px] relative">
            <TransitionGroup name="list" tag="div" class="space-y-1 relative">
                <template v-for="(item, index) in trackListData.items" :key="item.id">

                    <div v-if="index === 0 || (index > 0 && item.sectionIndex !== trackListData.items[index-1].sectionIndex)"
                         :key="'div-sec-' + item.sectionIndex"
                         :id="'sec-divider-' + item.sectionIndex"
                         class="py-3 flex items-center gap-3 select-none group/divider transition-opacity duration-0"
                         :class="{ 'opacity-0': draggingSectionIndex === item.sectionIndex }">

                        <div class="h-px bg-black/10 dark:bg-white/10 flex-1 group-hover/divider:bg-[#007aff]/50 transition-colors"></div>

                        <div class="px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 flex items-center gap-2 text-[10px] font-bold transition-all shadow-sm touch-none"
                             :class="index === 0
                    ? 'cursor-default opacity-80'
                    : 'cursor-ns-resize opacity-60 group-hover/divider:opacity-100 group-hover/divider:text-[#007aff] group-hover/divider:bg-[#007aff]/10'"
                             @mousedown="index > 0 && startDividerDrag($event, item.sectionIndex)"
                             @touchstart.prevent.stop="index > 0 && startDividerDrag($event, item.sectionIndex)">

                            <i v-if="index > 0" class="fa-solid fa-grip-lines-vertical mr-1 opacity-50"></i>

                            <i class="fa-regular fa-calendar"></i>

                            <span>
                    {{ trackListData.schedules[item.sectionIndex] ? trackListData.schedules[item.sectionIndex].date.split('-').slice(1).join('/') : \`Session \${item.sectionIndex + 1}\` }}
                    <span class="opacity-50 ml-1 font-mono">
                        ({{ trackListData.schedules[item.sectionIndex]?.startTime }})
                    </span>
                </span>
                        </div>
                        <div class="h-px bg-black/10 dark:bg-white/10 flex-1 group-hover/divider:bg-[#007aff]/50 transition-colors"></div>
                    </div>

                    <div :id="'track-item-' + item.id"
                         class="track-card p-2.5 rounded-lg border border-transparent hover:border-white/10 transition-colors relative flex flex-col gap-2 mb-2 group transition-all duration-300"
                         :class="[
                             item.sectionIndex === trackListData.currentSectionIndex
                                 ? 'bg-black/5 dark:bg-white/10'
                                 : 'bg-black/[0.02] dark:bg-white/[0.02] opacity-60 hover:opacity-100',
                             item.isSkipped ? '!opacity-50 grayscale' : ''
                         ]"
                         @mousedown="startTrackDrag($event, item)"
                         @touchstart="startTrackDrag($event, item)"
                         @contextmenu.prevent
                    >

                        <label class="absolute top-2 right-[60px] h-4 flex items-center justify-center z-20 cursor-pointer transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100"
                               :class="{'!opacity-100': item.isSkipped}"
                               @click.stop
                               title="跳过/恢复 (Skip)">

                            <div class="relative w-8 h-4 rounded-full transition-colors duration-200 border border-black/10 dark:border-white/10"
                                 :class="item.isSkipped ? 'bg-red-500 border-red-500' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'">

                                <input type="checkbox"
                                       v-model="item.isSkipped"
                                       class="hidden"
                                       @change="pushHistory()">

                                <div class="absolute top-0.45 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200"
                                     :class="item.isSkipped ? 'translate-x-4' : 'translate-x-0'"></div>
                            </div>
                        </label>

                        <button @click.stop="deleteTrackFromList(item)"
                                class="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-md text-gray-400/50 hover:text-white hover:bg-red-500 transition-all z-20 cursor-pointer sm:opacity-0 sm:group-hover:opacity-100"
                                :class="{'!opacity-100': item.isSkipped}"> <i class="fa-solid fa-trash-can text-[10px]"></i>
                        </button>

                        <button v-if="!item.isSkipped && item.musicDuration && item.musicDuration !== '00:00'"
                                @click.stop="openSplitSlider(item)"
                                title="拆分任务：录了一半，剩下的下次录"
                                class="absolute top-1 right-8 w-6 h-6 flex items-center justify-center rounded-md text-gray-400/50 hover:text-orange-500 hover:bg-orange-500/10 transition-all z-20 cursor-pointer sm:opacity-0 sm:group-hover:opacity-100">
                            <i class="fa-solid fa-scissors text-[10px]"></i>
                        </button>

                        <div class="flex items-center gap-3 overflow-hidden flex-1">
                            <div class="w-2.5 h-2.5 rounded-full shadow-sm shrink-0 mt-0.5"
                                 :style="{backgroundColor: trackListData.viewType === 'project' ? getGroupColor(item, 'instrumentId', true) : getGroupColor(item, 'projectId', true)}">
                            </div>

                            <div class="flex flex-col min-w-0 w-full">

                                <span class="text-xs font-bold leading-tight flex items-center gap-1.5 min-w-0"
                                      :class="{'line-through decoration-black/50 dark:decoration-white/50': item.isSkipped}">

                                    <span class="truncate">
                                        {{
                                            (trackListData.viewType || sidebarTab) === 'instrument'
                                                    ? getNameById(item.musicianId, 'musician')
                                                    : (item.name || getNameById(item.instrumentId, 'instrument'))
                                        }}
                                    </span>

                                    <span v-if="item.splitTag"
                                          class="text-[9px] px-1 py-0.5 rounded-sm font-mono font-bold uppercase tracking-wider shrink-0 bg-red-500/10 text-red-500 no-underline inline-block">
                                        {{ item.splitTag }}
                                    </span>

                                    <span v-if="item.orchestration && !isPercussionGroup(item) && !isStringGroup(item)"
                                          class="text-[10px] font-mono font-bold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/20 shrink-0 ml-1 select-none max-w-[200px] whitespace-normal text-left leading-tight">
                                        {{ item.orchestration }}
                                    </span>

                                    <span v-if="item.isSkipped"
                                          class="text-[9px] px-1 py-0.5 rounded-sm font-mono font-bold uppercase tracking-wider shrink-0 bg-black/10 dark:bg-white/20 text-black dark:text-white no-underline inline-block">
                                        SKIP
                                    </span>
                                </span>

                                <div class="flex items-center justify-between mt-0.5 min-w-0">

    <span class="text-[10px] opacity-50 truncate">
        <template v-if="(trackListData.viewType || sidebarTab) === 'project'">
            {{ getNameById(item.musicianId, 'musician') }}
        </template>

        <template v-else>
            {{ getNameById(item.projectId, 'project') }}
        </template>
    </span>

                                    <span v-if="item.musicDuration && item.musicDuration !== '00:00'"
                                          class="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 opacity-60 shrink-0 ml-2">
        {{ item.musicDuration }}
    </span>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 bg-white/50 dark:bg-black/20 rounded-md p-1.5 border border-black/5 dark:border-white/5 transition-opacity duration-200"
                             :class="{'opacity-20 pointer-events-none select-none': item.isSkipped}">

                            <div class="flex items-center gap-1 flex-1">
                                <input type="time"
                                       v-model="item.records[trackListData.viewType].recStart"
                                       @change="calcTrackDiff(item)"
                                       class="glass-input flex-1 h-7 text-xs text-center font-mono bg-white/60 dark:bg-black/30 focus:bg-white dark:focus:bg-black/50 rounded-md transition-colors p-0 cursor-text">

                                <button @click="setTrackNow(item, 'start')" title="设为当前时间"
                                        class="h-7 w-7 rounded-md bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 hover:bg-[#007aff] hover:border-[#007aff] hover:text-white flex items-center justify-center transition shrink-0 group/btn">
                                    <i class="fa-solid fa-clock text-[10px] opacity-60 group-hover/btn:opacity-100"></i>
                                </button>
                            </div>

                            <button @click="setTrackBreak(item)"
                                    class="h-6 min-w-[20px] px-1 flex items-center justify-center rounded cursor-pointer transition hover:bg-black/5 dark:hover:bg-white/10 group/break"
                                    :title="item.records[trackListData.viewType].breakMinutes > 0 ? \`已扣除 \${item.records[trackListData.viewType].breakMinutes} 分钟休息\` : '设置休息时间'">

                                <div v-if="item.records[trackListData.viewType].breakMinutes > 0"
                                     class="flex items-center gap-0.5 text-[9px] font-bold text-orange-500">
                                    <span>-{{ item.records[trackListData.viewType].breakMinutes }}m</span>
                                </div>

                                <span v-else
                                      class="text-[10px] opacity-20 font-bold group-hover/break:opacity-100 group-hover/break:text-[#007aff] transition-all">-</span>
                            </button>

                            <div class="flex items-center gap-1 flex-1">
                                <input type="time"
                                       v-model="item.records[trackListData.viewType].recEnd"
                                       @change="calcTrackDiff(item)"
                                       class="glass-input flex-1 h-7 text-xs text-center font-mono bg-white/60 dark:bg-black/30 focus:bg-white dark:focus:bg-black/50 rounded-md transition-colors p-0 cursor-text">

                                <button @click="setTrackNow(item, 'end')" title="设为当前时间"
                                        class="h-7 w-7 rounded-md bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 hover:bg-[#007aff] hover:border-[#007aff] hover:text-white flex items-center justify-center transition shrink-0 group/btn">
                                    <i class="fa-solid fa-clock text-[10px] opacity-60 group-hover/btn:opacity-100"></i>
                                </button>
                            </div>

                            <button @click="clearTrackTime(item)"
                                    :disabled="!item.records[trackListData.viewType].recStart && !item.records[trackListData.viewType].recEnd"
                                    title="清除时间记录"
                                    class="w-7 h-7 ml-1 flex items-center justify-center rounded-md transition shrink-0"
                                    :class="(!item.records[trackListData.viewType].recStart && !item.records[trackListData.viewType].recEnd) ? 'opacity-20 cursor-default text-gray-400' : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer'">
                                <i class="fa-solid fa-eraser text-xs"></i>
                            </button>

                            <div class="w-px h-5 bg-black/10 dark:bg-white/10 mx-1"></div>

                            <div class="flex flex-col items-end min-w-[50px] leading-none gap-1">
                                <span class="font-mono text-xs font-bold"
                                      :class="item.records[trackListData.viewType].actualDuration ? 'text-indigo-500' : 'opacity-30'">
                                    {{ item.records[trackListData.viewType].actualDuration || '--:--' }}
                                </span>

                                <div class="flex items-center gap-1" title="效率比值">
                                    <span class="text-[8px] opacity-40 uppercase">EFF</span>
                                    <span class="font-mono text-[10px] font-bold"
                                          :class="calculateSingleRatio(item) > item.ratio ? 'text-red-500' : 'text-green-500'">
                                        x{{ calculateSingleRatio(item) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <template v-if="trackListData.items.length > 0">
                    <template v-for="secIndex in (trackListData.totalSections - 1)" :key="'end-div-'+secIndex">
                        <div v-if="secIndex > trackListData.items[trackListData.items.length-1].sectionIndex"
                             :id="'sec-divider-' + secIndex"
                             class="py-3 flex items-center gap-3 select-none group/divider transition-opacity duration-0"
                             :class="{ 'opacity-0': draggingSectionIndex === secIndex }">

                            <div class="h-px bg-black/10 dark:bg-white/10 flex-1 group-hover/divider:bg-[#007aff]/50 transition-colors"></div>

                            <div class="px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 flex items-center gap-2 text-[10px] font-bold opacity-60 group-hover/divider:opacity-100 group-hover/divider:text-[#007aff] group-hover/divider:bg-[#007aff]/10 transition-all shadow-sm cursor-ns-resize touch-none"
                                 @mousedown="startDividerDrag($event, secIndex)"
                                 @touchstart.prevent.stop="startDividerDrag($event, secIndex)">
                                <i class="fa-solid fa-grip-lines-vertical mr-1 opacity-50"></i>
                                <i class="fa-regular fa-calendar"></i>
                                <span>
                                  {{ trackListData.schedules[secIndex] ? trackListData.schedules[secIndex].date.split('-').slice(1).join('/') : \`Session \${secIndex + 1}\`
                                }}
                                    <span class="opacity-50 ml-1 font-mono">
                                        ({{ trackListData.schedules[secIndex]?.startTime }})
                                    </span>
                                </span>
                            </div>

                            <div class="h-px bg-black/10 dark:bg-white/10 flex-1 group-hover/divider:bg-[#007aff]/50 transition-colors"></div>
                        </div>
                    </template>
                </template>

            </TransitionGroup>
        </div>

        <div class="p-4 border-t border-glass-border dark:border-glass-borderDark bg-gray-50/50 dark:bg-white/5 shrink-0 flex justify-between items-center">

            <button @click="deleteCurrentSchedule"
                    class="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white border border-red-500/20 transition text-xs font-bold flex items-center gap-2 shadow-sm">
                <i class="fa-solid fa-trash-can"></i> DELETE
            </button>
        </div>
    </div>
</div>
  `,
};
