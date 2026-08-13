export const AppSidebar = {
  name: 'AppSidebar',
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
            <aside id="sidebar"
                   v-show="!isMobile || mobileTab==='pool' || (isMobile && dragElClone && dragSourceType === 'pool')"

                   :style="{
                           width: isMobile ? '100%' : (isSidebarOpen ? sidebarWidth + 'px' : '0px'),
                           opacity: (isMobile || isSidebarOpen) ? 1 : 0
                       }"

                   class="glass-sidebar flex flex-col relative z-20"

                   :class="[
                           isMobile ? 'w-full absolute inset-0 bg-white dark:bg-[#1e1e1e] transition-none' : 'min-w-0 transition-all duration-300 ease-in-out',
                           (isMobile && dragElClone && dragSourceType === 'pool') ? 'z-[-1] opacity-0' : 'z-40',
                           !isSidebarOpen && !isMobile ? 'border-none overflow-hidden' : ''
                       ]"
                   @dragover.prevent @dragenter="dragEnterPool" @dragleave="dragLeavePool" @drop="dropToPool"
                   @click="clearSelection"

                   @touchstart="onSidebarTouchStart"
                   @touchend="onSidebarTouchEnd">

                <div class="flex flex-col px-8 py-5 sm:px-3 sm:py-3 border-b border-glass-border dark:border-glass-borderDark gap-4 sm:gap-3 shrink-0">

                    <button id="tour-new-task"
                            @click="showMobileTaskInput = true"
                            class="hidden sm:flex w-full h-16 sm:h-auto sm:py-2.5 rounded-[24px] sm:rounded-full bg-[#007aff] hover:bg-[#0062cc] text-white font-bold text-xl sm:text-sm shadow-lg shadow-blue-500/30 transition items-center justify-center gap-2 group active:scale-95">
                        <i class="fa-solid fa-plus text-xl sm:text-base group-hover:scale-110 transition-transform"></i>
                        <span>New Task</span>
                    </button>

                    <div class="flex gap-2 w-full bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                        <button @click="switchSidebarTab('musician')"
                                class="flex-1 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition uppercase tracking-wide flex items-center justify-center gap-1"
                                :class="sidebarTab==='musician' ? 'bg-white dark:bg-white/20 text-black dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'">
                            <i class="fa-solid fa-microphone"></i> REC
                        </button>

                        <button @click="switchSidebarTab('project')"
                                class="flex-1 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition uppercase tracking-wide flex items-center justify-center gap-1"
                                :class="sidebarTab==='project' ? 'bg-white dark:bg-white/20 text-black dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'">
                            <i class="fa-solid fa-pen-to-square"></i> EDIT
                        </button>

<!--                        <button @click="switchSidebarTab('instrument')"-->
<!--                                class="flex-1 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition uppercase tracking-wide flex items-center justify-center gap-1"-->
<!--                                :class="sidebarTab==='instrument' ? 'bg-white dark:bg-white/20 text-black dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'">-->
<!--                            <i class="fa-solid fa-guitar"></i> INST-->
<!--                        </button>-->
                    </div>
                </div>
                <div class="shrink-0 h-8 px-4 border-t border-glass-border dark:border-glass-borderDark bg-white/80 dark:bg-[#1c1c1e] flex justify-between items-center text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 select-none cursor-default z-20">
                    <div class="flex items-center gap-1.5" title="当前日程任务数 / Active Tasks">
                        <i class="fa-solid fa-list-check"></i>
                        <span>{{ activeTaskCount }}</span>
                    </div>
                    <div class="flex items-center gap-1.5" title="当前日程人员数 / Active Musicians">
                        <i class="fa-solid fa-user"></i>
                        <span>{{ musicianStats.length }}</span>
                    </div>
                    <div class="flex items-center gap-1.5" title="当前日程项目数 / Active Projects">
                        <i class="fa-solid fa-folder"></i>
                        <span>{{ projectStats.length }}</span>
                    </div>
                    <div class="flex items-center gap-1.5" title="当前日程乐器数 / Active Instruments">
                        <i class="fa-solid fa-guitar"></i>
                        <span>{{ instrumentStats.length }}</span>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto relative overflow-x-hidden"
                     :ref="(el) => { sidebarScrollRef = el; }">

                    <Transition :name="sidebarTransitionName">

                        <div :key="sidebarTab" class="w-full min-h-full p-3 pb-24">

                            <div class="flex justify-end gap-3 mb-2 px-1">
                                <button @click="toggleSort('name')"
                                        class="text-[10px] uppercase font-bold tracking-wider opacity-50 hover:opacity-100 transition flex items-center gap-1">
                                    Name <i class="fa-solid" :class="getSortIcon('name')" v-show="sortField==='name'"></i>
                                </button>
                                <button @click="toggleSort('status')"
                                        class="text-[10px] uppercase font-bold tracking-wider opacity-50 hover:opacity-100 transition flex items-center gap-1">
                                    Status <i class="fa-solid" :class="getSortIcon('status')" v-show="sortField==='status'"></i>
                                </button>
                                <button @click="toggleSort('duration')"
                                        class="text-[10px] uppercase font-bold tracking-wider opacity-50 hover:opacity-100 transition flex items-center gap-1">
                                    Time <i class="fa-solid" :class="getSortIcon('duration')"
                                            v-show="sortField==='duration'"></i>
                                </button>
                            </div>

                            <div v-for="(stat, index) in filteredSidebarList" :key="stat.id"
                                 :id="index === 0 ? 'tour-first-stat-card' : null"

                                 :data-stat-id="stat.id"

                                 class="mobile-stat-card group py-6 px-5 sm:p-3"
                                 :draggable="!stat.isFullyScheduled && stat.statusKey !== 'in-progress'"
                                 @dragstart="(!stat.isFullyScheduled && stat.statusKey !== 'in-progress') && dragStart($event, stat, 'aggregate')"

                                 @click.stop="handleStatCardClick(stat)"
                                 @touchstart="handlePoolTouchStart($event, stat, 'aggregate')"
                                 @touchmove="handleTouchMove"
                                 @touchend="handleTouchEnd"
                                 @contextmenu.prevent>

                            <button class="absolute left-0 top-0 bottom-0 w-3 sm:w-2 flex items-center justify-center transition-all duration-200 group/btn z-10 cursor-pointer hover:brightness-110 active:scale-95"
                                    :style="{backgroundColor: stat.statusKey === 'completed' ? '#3b82f6'
                                        : stat.statusKey === 'full' ? '#34c759'
                                        : stat.statusKey === 'insufficient' ? '#ff3b30'
                                        : stat.statusKey === 'in-progress' ? '#f59e0b'
                                        : (sidebarTab === 'project' ? '#eab308' : (sidebarTab === 'instrument' ? '#3b82f6' : '#a855f7'))}"
                                    @click.stop="jumpToStatSchedule(stat)"
                                    title="点击跳转到日程">

                            </button>

                            <div class="pl-10">
                                <div class="flex justify-between items-center mb-1">
                                    <div class="flex items-center flex-1 min-w-0 pr-2">
                                        <div class="font-bold text-2xl sm:text-lg leading-none truncate">
                                            {{ stat.name }}
                                        </div>

                                        <span v-if="stat.scheduleCount > 1"
                                              class="ml-1 shrink-0 inline-flex items-center justify-center bg-black/5 dark:bg-white/10 px-1.5 h-4 rounded-md text-[10px] font-bold opacity-50">
                                            {{ stat.scheduleCount }}
                                        </span>
                                    </div>

                                    <div class="flex items-center gap-1 shrink-0">
                                        <span v-if="stat.statusKey === 'completed'" class="px-2 py-1 rounded-md bg-blue-500 text-white text-sm sm:text-xs font-bold shadow-sm whitespace-nowrap">完成</span>
                                        <span v-else-if="stat.statusKey === 'in-progress'" class="px-2 py-1 rounded-md bg-orange-500 text-white text-sm sm:text-xs font-bold shadow-sm whitespace-nowrap">进行中</span>
                                        <span v-else-if="stat.statusKey === 'full'" class="px-2 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-sm sm:text-xs font-bold whitespace-nowrap">已排</span>
                                        <span v-else-if="stat.statusKey === 'insufficient'" class="px-2 py-1 rounded-md bg-red-500/10 text-red-500 dark:text-red-400 text-sm sm:text-xs font-bold whitespace-nowrap">缺时</span>

                                        <button v-if="stat.avgRealRatio > 0"
                                                @click.stop="autoUpdateEfficiency(stat.id, sidebarTab)"
                                                class="px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-sm sm:text-xs font-mono font-bold transition whitespace-nowrap border border-transparent dark:border-purple-500/20 hover:bg-purple-200 active:scale-95 cursor-pointer">
                                            x{{ stat.avgRealRatio }}
                                        </button>

                                        <div v-else-if="stat.items && stat.items.length > 0"
                                             class="px-2 py-1 rounded-md bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-sm sm:text-xs font-mono font-bold transition whitespace-nowrap border border-transparent cursor-default">
                                            x{{ getTaskRatio(stat.items[0]) }}
                                        </div>
                                    </div>
                                </div>

                                <div class="flex justify-between items-baseline">
                                    <div class="text-[14px] opacity-50 font-medium flex items-center gap-2">
                                        <span>{{ stat.trackCount }} Items</span>
                                        <span v-if="stat.scheduledSeconds > 0"
                                              class="text-[13px] font-mono font-bold opacity-60 bg-black/5 dark:bg-white/10 px-1.5 rounded-md">
                                                {{ formatSecs(stat.scheduledSeconds) }}
                                            </span>
                                    </div>
                                    <div class="flex items-baseline gap-1">
                                            <span class="text-2xl sm:text-lg font-mono font-bold tracking-tight"
                                                  :class="{
                                                      'text-blue-500 dark:text-blue-400': stat.statusKey === 'completed',
                                                      'text-orange-500 dark:text-orange-400': stat.statusKey === 'in-progress',
                                                      'text-green-600 dark:text-green-400': stat.statusKey === 'full',
                                                      'text-red-500 dark:text-red-400': stat.statusKey === 'insufficient',
                                                      'text-gray-800 dark:text-gray-100': stat.statusKey === 'unscheduled'
                                                  }">
                                                {{ stat.totalDuration }}
                                            </span>
                                    </div>
                                </div>

                                <div class="mt-2 h-1 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden relative">
                                    <div class="h-full rounded-full transition-all duration-500 relative"
                                         :style="{
                                                width: (stat.totalSeconds > 0)
                                                    ? (stat.statusKey === 'insufficient'
                                                        ? Math.min(100, (stat.scheduledSeconds / stat.totalSeconds) * 100).toFixed(1) + '%'
                                                        : (stat.statusKey === 'completed' ? '100%' : Math.min(100, (stat.completedSeconds / stat.totalSeconds) * 100).toFixed(1) + '%')
                                                      )
                                                    : '0%',
                                                backgroundColor: stat.statusKey === 'completed' ? '#3b82f6'
                                                    : stat.statusKey === 'full' ? '#34c759'
                                                    : stat.statusKey === 'insufficient' ? '#ff3b30'
                                                    : stat.statusKey === 'in-progress' ? '#f59e0b'
                                                    : (sidebarTab === 'project' ? '#eab308' : (sidebarTab === 'instrument' ? '#3b82f6' : '#a855f7'))
                                             }">
                                    </div>
                                </div>

                                <div v-if="expandedStatsIds.has(stat.id)"
                                     class="mt-2 pt-2 border-t border-black/5 dark:border-white/5 space-y-1" @click.stop>
                                    <div v-for="item in stat.items" :key="item.id"
                                         @click.stop="selectTask(item.id, 'pool', $event)"
                                         @dblclick.stop="openEditModal(item, 'pool')"
                                         @touchstart="handlePoolTouchStart($event, item)"
                                         @touchmove="handleTouchMove"
                                         @touchend="handleTouchEnd"
                                         class="flex items-center justify-between p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition border border-transparent"
                                         :class="{
                                             'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800': selectedPoolIds.has(item.id),
                                             'opacity-40 grayscale': item.isSkipped
                                         }">

                                        <div class="flex items-center gap-2 min-w-0 overflow-hidden flex-1 mr-2">
                                            <div class="w-1.5 h-1.5 rounded-full shrink-0"
                                                 :style="{backgroundColor: getGroupColor(item, sidebarTab === 'project' ? 'musicianId' : 'projectId', true)}">
                                            </div>

                                            <div class="flex flex-col min-w-0">
                                                <span class="text-xs font-bold truncate leading-tight flex items-center gap-1.5"
                                                      :class="{'line-through decoration-black/50 dark:decoration-white/50': item.isSkipped}">
                                                     {{
                                                        sidebarTab === 'instrument'
                                                                ? getNameById(item.musicianId, 'musician')
                                                                : (item.name || getNameById(item.instrumentId, 'instrument'))
                                                    }}

                                                   <span v-if="item.splitTag"
                                                         class="text-[8px] px-1 rounded-sm font-mono font-bold uppercase tracking-wider shrink-0 bg-red-500/10 text-red-500 no-underline inline-block">
                                                        {{ item.splitTag }}
                                                    </span>

                                                    <span v-if="item.isSkipped"
                                                          class="text-[8px] px-1 rounded-sm font-mono font-bold uppercase tracking-wider shrink-0 bg-black/10 dark:bg-white/20 text-black dark:text-white no-underline inline-block">
                                                        SKIP
                                                    </span>

                                                </span>

                                                <span class="text-[9px] opacity-50 truncate leading-tight mt-0.5">
                                                      {{
                                                        sidebarTab === 'project'
                                                        ? getNameById(item.musicianId, 'musician')
                                                        : getNameById(item.projectId, 'project')
                                                        }}
                                                </span>
                                            </div>
                                        </div>

                                        <div class="flex items-center justify-end gap-2 shrink-0">
                                            <span v-if="item.actualDuration && item.actualDuration !== '00:00'"
                                                  class="text-xs sm:text-[9px] font-mono font-bold px-1 py-0.5 rounded whitespace-nowrap"
                                                  :class="parseFloat(calculateSingleRatio(item)) > (item.isManualRatio ? item.ratio : getTaskRatio(item)) ? 'text-red-500 bg-red-500/10' : 'text-green-600 bg-green-500/10'">
                                                x{{ calculateSingleRatio(item) }}
                                            </span>

                                            <span v-else
                                                  class="text-xs sm:text-[9px] font-mono font-bold text-gray-400 dark:text-gray-500 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded whitespace-nowrap">
        x{{ item.isManualRatio ? item.ratio : getTaskRatio(item) }}
    </span>

                                            <div class="flex flex-col items-end gap-0.5 leading-none">
                                                    <span class="font-mono text-sm sm:text-xs font-bold tabular-nums tracking-tight block"
                                                          :class="item.actualDuration ? 'text-[#007aff] dark:text-[#0a84ff]' : 'opacity-80'">
                                                        {{ item.actualDuration || item.estDuration }}
                                                    </span>
                                                <span v-if="item.musicDuration && item.musicDuration !== item.estDuration"
                                                      class="text-[9px] sm:text-[8px] font-mono font-bold text-gray-400 dark:text-gray-500 opacity-60 whitespace-nowrap">
                                                        {{ item.musicDuration }}
                                                    </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    </Transition>
                </div>
            </aside>
  `,
};
