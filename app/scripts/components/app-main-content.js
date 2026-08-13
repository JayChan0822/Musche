export const AppMainContent = {
  name: 'AppMainContent',
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
            <main id="main-content"
                  v-show="!isMobile || mobileTab==='schedule'"
                  class="flex-1 flex flex-col relative bg-white/30 dark:bg-[#1e1e1e]/60 backdrop-blur-md"
                  :class="isMobile ? 'w-full absolute inset-0 z-30' : ''"
                  @touchstart="onMainTouchStart"
                  @touchend="onMainTouchEnd"

                  @mousedown="onMainMouseDown"
                  @mouseup="onMainMouseUp"
                  @mouseleave="isMouseViewDrag = false"
                  @wheel="onMainWheel">
                <div class="flex items-center justify-between pr-4 shrink-0 z-50 relative">
                    <button @click="toggleSidebar"
                            class="hidden sm:flex w-14 h-14 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 items-center justify-center transition text-gray-500 hover:text-[#007aff] ml-4 shrink-0"
                            :title="isSidebarOpen ? '收起侧边栏' : '展开侧边栏'">
                        <i class="fa-solid text-lg transition-transform duration-300"
                           :class="isSidebarOpen ? 'fa-outdent' : 'fa-indent'"></i>
                    </button>
                    <div class="mobile-header-nav flex-1 !ml-2">
                        <button @click="changeDate(-1)"
                                class="w-12 h-10 flex items-center justify-center text-xl text-[#007aff] active:opacity-50">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>

                        <button @click="jumpToToday"
                                class="flex-1 flex flex-col items-center justify-center leading-none">
                            <span class="text-xs opacity-50 font-bold uppercase mb-0.5">{{ isToday(formatDate(viewDate)) ? 'Today' : 'Date'
                                }}</span>
                            <span class="text-base font-bold">{{ currentDateLabel }}</span>
                        </button>

                        <button @click="changeDate(1)"
                                class="w-12 h-10 flex items-center justify-center text-xl text-[#007aff] active:opacity-50">
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>

                    <button id="tour-view-switch"
                            @click="switchView(currentView === 'week' ? 'month' : 'week')"
                            class="ml-2 w-14 h-14 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center active:bg-[#007aff] active:text-white transition shrink-0">
                        <i class="fa-solid" :class="currentView==='week'?'fa-calendar-week':'fa-calendar-days'"></i>
                    </button>

                    <button @click="cycleDayWidth"
                            class="ml-4 w-14 h-14 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center active:bg-[#007aff] active:text-white transition shrink-0">
                        <i class="fa-solid" :class="widthIcon"></i>
                    </button>
                </div>

                <div class="flex-1 relative w-full overflow-hidden flex flex-col">

                    <Transition :name="viewTransitionName">

                        <div v-if="currentView === 'week'"
                             key="view-week"
                             class="w-full h-full flex flex-col overflow-y-auto relative no-scrollbar overscroll-none"

                             :class="{ 'touch-pan-y': dayColWidth < 60, 'is-zooming-now': isZooming }"

                             :ref="(el) => { weekContainer = el; }"
                             :style="{ '--slot-height': slotHeight + 'px' }"
                             @click="clearSelection">
                            <!-- 星期头行：sticky top-0，切周 slide 动画时不随内容位移；z 高于时间列，重叠处盖住时间列 -->
                            <div class="sticky top-0 z-[900] flex bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl border-b border-glass-border dark:border-glass-borderDark shadow-sm">
                                <div class="shrink-0 border-r border-glass-border dark:border-glass-borderDark" style="width: var(--time-col-width)"></div>
                                <div v-for="day in currentWeekDays" :key="'weekday-' + day.dateStr"
                                     class="h-14 flex-1 flex flex-col items-center justify-center border-r border-glass-border dark:border-glass-borderDark cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                                     :style="{ minWidth: dayColWidth + 'px' }"
                                     @dblclick="switchView('month')"
                                     @touchend="handleHeaderDoubleTap($event)"
                                     title="双击返回月视图">
                                    <span class="text-xs uppercase font-bold opacity-60 mb-0.5">{{ day.weekday }}</span>
                                    <div class="w-8 h-8 flex items-center justify-center rounded-full text-base font-bold"
                                         :class="isToday(day.dateStr) ? 'bg-[#ff3b30] text-white' : 'opacity-90'">
                                        {{ day.dateShort.split('/')[1] }}
                                    </div>
                                </div>
                            </div>

                            <!-- 时间列 + 任务格区 -->
                            <div class="flex min-w-full" :ref="(el) => { weekGridWrapper = el; }">
                                <!-- 时间列：sticky left-0，切周 slide 动画时不随内容位移 -->
                                <div class="shrink-0 sticky left-0 z-[800] bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl border-r border-glass-border dark:border-glass-borderDark shadow-sm"
                                     style="width: var(--time-col-width)">
                                    <div v-for="t in timeSlots" :key="t" class="time-label-slot">
                                        {{ t.endsWith('00') ? t : '' }}
                                    </div>
                                    <div class="time-label-slot">
                                        {{ settings.endHour === 24 ? '00:00' : settings.endHour + ':00' }}
                                    </div>
                                </div>

                                <!-- 任务格容器：relative 让 leave 元素 absolute 锚定在时间列右侧 -->
                                <div class="relative flex-1 min-w-0">
                                    <Transition :name="weekTransitionName"
                                                @before-leave="onBeforeLeave"
                                                @after-leave="onAfterLeave">
                                        <div :key="currentWeekDays[0].dateStr" class="flex">
                                            <div v-for="day in currentWeekDays" :key="day.dateStr"
                                                 class="flex-1 border-r border-glass-border dark:border-glass-borderDark flex flex-col relative transition-all duration-300 ease-in-out"
                                                 :style="{ minWidth: dayColWidth + 'px' }"
                                                 :data-date-str="day.dateStr">
                                                <div class="relative" style="min-height: 1000px;">
                                                <div v-for="t in timeSlots" :key="t"
                                                     class="grid-slot droppable-slot"
                                                     :data-time="t"
                                                     @dragenter="dragEnterSlot" @dragleave="dragLeaveSlot"
                                                     @dragover.prevent
                                                     @drop="dropToSchedule($event, day.dateStr)"></div>

                                                <div v-for="task in (tasksByDateMap[day.dateStr] || [])"
                                                     :key="task.scheduleId"
                                                     class="task-block group"
                                                     :draggable="!isMobile"
                                                     @dragstart.stop="dragStart($event, task, 'schedule')"
                                                     @dragend="handleDragEnd"

                                                     @touchstart.stop="handleTouchStart($event, task, day.dateStr)"
                                                     @touchmove="handleTouchMove"
                                                     @touchend.stop="handleTouchEnd"

                                                     @dblclick.stop="handleTaskDblClick($event, task)"

                                                     @dragover.prevent
                                                     @drop.stop="dropToSchedule($event, day.dateStr)"

                                                     :class="{
                                                       'is-selected': selectedTaskId === task.scheduleId,
                                                       'is-overlapping': getOverlapCount(task) > 0,
                                                       'is-flashing': flashingTaskId === task.scheduleId,
                                                       'is-ghost': isTaskGhost(task)
                                                     }"
                                                     :style="getTaskStyle(task)"
                                                     @click.stop="selectTask(task.scheduleId, 'schedule')">

                                                    <div class="flex flex-col h-full justify-between pointer-events-none">
                                                        <div class="font-bold leading-tight truncate pr-1">
                                                            {{ getBlockTitle(task) }}
                                                        </div>
                                                        <div class="mt-auto text-[10px] sm:text-[11px] font-mono opacity-80 leading-none">
                                                            <div class="flex flex-col items-start">
                                                                <span class="whitespace-nowrap">{{task.startTime}}</span>
                                                                <span class="font-bold whitespace-nowrap text-[10px] opacity-70 mt-0.5">
                                                                    {{task.estDuration}}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="resize-handle"
                                                         @mousedown.stop="initResize($event, task)"></div>
                                                    <div v-if="hasRecordingInfo(task)"
                                                         class="absolute bottom-[1px] right-[2px] z-[15] pointer-events-none">
                                                        <i class="fa-solid fa-circle-info text-[10px] opacity-90"></i>
                                                    </div>
                                                    <div v-if="isMobile" class="mobile-resize-handle"
                                                         @touchstart.stop.prevent="initMobileResize($event, task)">
                                                        <div class="mobile-resize-bar"></div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </Transition>
                                </div>
                            </div>
                        </div>

                        <div v-else-if="currentView === 'month'"
                             key="view-month"
                             class="w-full h-full overflow-y-auto overflow-x-hidden relative scroll-pt-[34px]"
                             @scroll="handleInfiniteScroll"
                             @click="clearSelection">

                            <Transition :name="dateTransitionName" v-if="monthViewMode === 'paged'">
                                <div :key="viewDate.getFullYear() + '-' + viewDate.getMonth()"
                                     class="w-full min-h-full"
                                     :class="isMobile ? 'p-2 pb-40' : 'p-4'">

                                    <div class="grid grid-cols-7 border-t border-l border-glass-border dark:border-glass-borderDark bg-white/50 dark:bg-[#1e1e1e]/50 rounded-xl overflow-hidden shadow-liquid"
                                         :class="isMobile ? 'w-full min-h-[50vh]' : 'min-w-[800px]'">

                                        <div v-for="w in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']"
                                             class="p-3 text-right text-xs uppercase font-bold opacity-40 border-b border-r border-glass-border dark:border-glass-borderDark bg-black/5 dark:bg-white/5">
                                            {{w}}
                                        </div>

                                        <div v-for="day in currentMonthDays" :key="day.fullDate"
                                             class="min-h-[100px] sm:h-48 p-1.5 border-b border-r border-glass-border dark:border-glass-borderDark relative transition droppable-slot group flex flex-col"
                                             :class="day.isCurrentMonth ? 'hover:bg-black/5 dark:hover:bg-white/5' : 'bg-black/5 dark:bg-white/5 opacity-60'"
                                             :data-date="day.fullDate"
                                             @dblclick="switchToWeek(day.fullDate)"
                                             @touchend="handleMonthCellDoubleTap($event, day.fullDate)"
                                             @dragover.prevent @drop="dropToMonth($event, day.fullDate)">

                                            <div class="text-right mb-1 shrink-0">
                                                <span class="text-sm font-bold w-7 h-7 inline-flex items-center justify-center rounded-full"
                                                      :class="[isToday(day.fullDate) ? 'bg-[#ff3b30] text-white' : (day.isCurrentMonth ? 'opacity-80' : 'opacity-30')]">
                                                    {{ day.dayNum }}
                                                </span>
                                            </div>

                                            <div class="space-y-1 overflow-y-auto max-h-[90px] no-scrollbar flex-1">
                                                <div v-for="task in (tasksByDateMap[day.fullDate] || [])"
                                                     :key="task.scheduleId"
                                                     class="text-[11px] px-2 py-1 rounded-md truncate flex items-center gap-1.5 cursor-grab hover:brightness-110 shadow-sm"
                                                     :class="{
                                                                 'ring-1 ring-white': selectedTaskId === task.scheduleId,
                                                                 'is-flashing': flashingTaskId === task.scheduleId,
                                                                 'is-ghost': isTaskGhost(task)
                                                             }"
                                                     :style="{
                                                                 backgroundColor: task.projectId ? '#eab308' : (task.instrumentId ? '#3b82f6' : '#a855f7'),
                                                                 color: 'white'
                                                             }"
                                                     @click.stop="selectTask(task.scheduleId, 'schedule')"
                                                     @dblclick.stop="handleTaskDblClick($event, task)"
                                                     :draggable="!isMobile"
                                                     @dragstart.stop="dragStart($event, task, 'schedule')"
                                                     @dragend="handleDragEnd"
                                                     @touchstart="handleTouchStart($event, task, day.fullDate)"
                                                     @touchmove="handleTouchMove"
                                                     @touchend.stop="handleTouchEnd">
                                                    <div class="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                                                    <span class="font-mono opacity-80">{{task.startTime}}</span>
                                                    <span class="font-bold truncate">{{ getBlockTitle(task) }}</span>
                                                    <i v-if="hasRecordingInfo(task)" class="fa-solid fa-circle-info text-[8px] opacity-60 ml-auto mr-0.5"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Transition>

                            <div v-else class="w-full pb-20 animate-[fadeIn_0.3s]">
                                <div class="sticky top-0 z-[100] grid grid-cols-7 bg-gray-100/95 dark:bg-[#1c1c1e]/95 backdrop-blur-md border-b border-glass-border dark:border-glass-borderDark shadow-sm">
                                    <div v-for="w in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']"
                                         class="p-2 text-center text-[10px] uppercase font-bold opacity-50">
                                        {{w}}
                                    </div>
                                </div>

                                <div class="grid grid-cols-7 border-l border-glass-border dark:border-glass-borderDark bg-white/50 dark:bg-[#1e1e1e]/50"
                                     :class="isMobile ? 'w-full' : 'min-w-[800px]'">

                                    <div v-for="day in flatScrolledDays" :key="day.fullDate"
                                         class="min-h-[100px] sm:h-48 p-1.5 border-b border-r border-glass-border dark:border-glass-borderDark relative transition droppable-slot group flex flex-col"
                                         :class="day.monthKey === activeMonthKey ? 'hover:bg-black/5 dark:hover:bg-white/5' : 'bg-black/5 dark:bg-white/5 opacity-60'"
                                         :data-date="day.fullDate"
                                         :data-month-key="day.monthKey"
                                         :data-month-start="day.isFirstDay ? day.fullDate : null"
                                         :ref="day.isFirstDay ? setMonthRef : null"
                                         @dblclick="day.isCurrentMonth && switchToWeek(day.fullDate)"
                                         @touchend="day.isCurrentMonth && handleMonthCellDoubleTap($event, day.fullDate)"
                                         @dragover.prevent
                                         @drop="day.isCurrentMonth && dropToMonth($event, day.fullDate)">

                                        <div class="text-right mb-1 shrink-0">
                <span v-if="day.dayNum === 1" class="float-left ml-1 text-xs font-bold text-[#007aff] opacity-80">
                    {{ day.dateObj.getMonth() + 1 }}月
                </span>

                                            <span class="text-sm font-bold w-7 h-7 inline-flex items-center justify-center rounded-full"
                                                  :class="[isToday(day.fullDate) ? 'bg-[#ff3b30] text-white' : (day.monthKey === activeMonthKey ? 'opacity-80' : 'opacity-30')]">
                    {{ day.dayNum }}
                </span>
                                        </div>

                                        <div class="space-y-1 overflow-y-auto no-scrollbar flex-1">
                                            <div v-for="task in (tasksByDateMap[day.fullDate] || [])"
                                                 :key="task.scheduleId"
                                                 class="text-[11px] px-2 py-1 rounded-md truncate flex items-center gap-1.5 cursor-grab hover:brightness-110 shadow-sm"
                                                 :class="{
                         'ring-1 ring-white': selectedTaskId === task.scheduleId,
                         'is-flashing': flashingTaskId === task.scheduleId,
                         'is-ghost': isTaskGhost(task)
                     }"
                                                 :style="{
                         backgroundColor: task.projectId ? '#eab308' : (task.instrumentId ? '#3b82f6' : '#a855f7'),
                         color: 'white'
                     }"
                                                 @click.stop="selectTask(task.scheduleId, 'schedule')"
                                                 @dblclick.stop="handleTaskDblClick($event, task)"
                                                 :draggable="!isMobile"
                                                 @dragstart.stop="dragStart($event, task, 'schedule')"
                                                 @dragend="handleDragEnd"
                                                 @touchstart="handleTouchStart($event, task, day.fullDate)"
                                                 @touchmove="handleTouchMove"
                                                 @touchend.stop="handleTouchEnd">
                                                <div class="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                                                <span class="font-mono opacity-80">{{task.startTime}}</span>
                                                <span class="font-bold truncate">{{ getBlockTitle(task) }}</span>
                                                <i v-if="hasRecordingInfo(task)" class="fa-solid fa-circle-info text-[8px] opacity-60 ml-auto mr-0.5"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>
            </main>
  `,
};
