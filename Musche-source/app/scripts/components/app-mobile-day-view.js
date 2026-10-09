// 手机端日视图：月视图点某天后从下往上滑入，顶部保留一行周日期，
// 下面是当天的小时时间轴（刻度、任务块、拖拽/拉伸手势都与周视图同源）。
export const AppMobileDayView = {
  name: 'AppMobileDayView',
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
            <Transition name="day-view">
                <div v-if="isMobile && dayViewOpen"
                     class="absolute inset-0 z-[500] flex flex-col bg-white dark:bg-[#1c1c1e]"
                     :style="{ '--slot-height': slotHeight + 'px' }"
                     @touchstart="dayViewTouchStart($event)"
                     @touchmove="dayViewTouchMove($event)"
                     @touchend="dayViewTouchEnd($event)">

                    <!-- 下拉关闭把手 -->
                    <div class="shrink-0 flex justify-center pt-1.5 pb-0.5">
                        <div class="w-10 h-1 rounded-full bg-black/15 dark:bg-white/20"></div>
                    </div>

                    <!-- 顶栏：返回月视图 + 当天日期 -->
                    <div class="shrink-0 flex items-center justify-between pl-1 pr-3">
                        <button @click="closeDayView"
                                class="flex items-center gap-1 h-11 px-2 text-[#007aff] active:opacity-50">
                            <i class="fa-solid fa-chevron-left text-lg"></i>
                            <span class="text-base font-bold">{{ selectedDayMonthLabel }}</span>
                        </button>
                        <span class="text-sm font-bold opacity-60">{{ selectedDayLabel }}</span>
                    </div>

                    <!-- 周日期条：一行 7 天，选中日高亮，今天用红色 -->
                    <div class="shrink-0 grid grid-cols-7 px-1 pb-2 border-b border-glass-border dark:border-glass-borderDark">
                        <button v-for="d in selectedDayWeek" :key="d.fullDate"
                                @click="selectDay(d.fullDate)"
                                class="flex flex-col items-center justify-center py-1 gap-1">
                            <span class="text-[11px] font-bold opacity-40">{{ d.weekday }}</span>
                            <span class="w-8 h-8 flex items-center justify-center rounded-full text-base font-bold transition-colors"
                                  :class="selectedDay === d.fullDate
                                      ? 'bg-[#ff3b30] text-white'
                                      : (d.isToday ? 'text-[#ff3b30]' : 'opacity-80')">
                                {{ d.dayNum }}
                            </span>
                            <span class="w-1 h-1 rounded-full"
                                  :class="d.hasTasks ? 'bg-[#007aff]' : 'bg-transparent'"></span>
                        </button>
                    </div>

                    <!-- 当天时间轴 -->
                    <div class="flex-1 overflow-y-auto overscroll-contain no-scrollbar relative"
                         :ref="(el) => { dayViewContainer = el; }">
                        <div class="flex min-w-full">
                            <!-- 时间刻度列：翻天时固定不动 -->
                            <div class="shrink-0 border-r border-glass-border dark:border-glass-borderDark"
                                 style="width: var(--time-col-width)">
                                <div v-for="t in timeSlots" :key="t" class="time-label-slot">
                                    {{ t.endsWith('00') ? t : '' }}
                                </div>
                                <div class="time-label-slot">
                                    {{ settings.endHour === 24 ? '00:00' : settings.endHour + ':00' }}
                                </div>
                            </div>

                            <!-- 任务格：左右滑动翻天时只滑这一层 -->
                            <div class="relative flex-1 min-w-0">
                                <Transition :name="dayTransitionName">
                                    <div :key="selectedDay" :data-date-str="selectedDay" class="w-full">
                                        <div class="relative" style="min-height: 1000px;">
                                            <div v-for="t in timeSlots" :key="t"
                                                 class="grid-slot droppable-slot"
                                                 :data-time="t"
                                                 @dragover.prevent
                                                 @drop="dropToSchedule($event, selectedDay)"></div>

                                            <div v-for="task in selectedDayTasks"
                                                 :key="task.scheduleId"
                                                 class="task-block group"
                                                 @touchstart.stop="handleTouchStart($event, task, selectedDay)"
                                                 @touchmove="handleTouchMove"
                                                 @touchend.stop="handleTouchEnd"
                                                 @dblclick.stop="handleTaskDblClick($event, task)"
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
                                                    <div class="mt-auto text-[11px] font-mono opacity-80 leading-none flex items-center gap-2">
                                                        <span class="whitespace-nowrap">{{ task.startTime }}</span>
                                                        <span class="font-bold whitespace-nowrap opacity-70">{{ task.estDuration }}</span>
                                                    </div>
                                                </div>
                                                <div v-if="hasRecordingInfo(task)"
                                                     class="absolute bottom-[1px] right-[2px] z-[15] pointer-events-none">
                                                    <i class="fa-solid fa-circle-info text-[10px] opacity-90"></i>
                                                </div>
                                                <div class="mobile-resize-handle"
                                                     @touchstart.stop.prevent="initMobileResize($event, task)">
                                                    <div class="mobile-resize-bar"></div>
                                                </div>
                                            </div>

                                            <!-- 当前时刻红线（仅今天） -->
                                            <div v-if="nowIndicatorStyle" class="day-now-line" :style="nowIndicatorStyle">
                                                <span class="day-now-dot"></span>
                                            </div>
                                        </div>
                                    </div>
                                </Transition>
                            </div>
                        </div>
                        <!-- 底部留白：别让最后一条日程被 tab bar 压住 -->
                        <div class="h-24"></div>
                    </div>
                </div>
            </Transition>
  `,
};
