import { toRefs } from 'vue';

// 手机端日视图：从月视图进入后保留一行周日期，
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
    const animations = new Set();
    const cancelMorph = () => {
      for (const animation of animations) animation.cancel();
      animations.clear();
    };
    const morphWeek = (element, leaving = false) => {
      cancelMorph();
      if (element.ownerDocument.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // 从真实月格读位置，七个日期分别移动，跨月缺少源格时只做容器淡入。
      const pairs = [...element.querySelectorAll('[data-week-date]')].map((target) => {
        const source = element.ownerDocument.querySelector(`[data-date="${target.dataset.weekDate}"] [data-month-day-number]`);
        return source ? { target, from: source.getBoundingClientRect(), to: target.getBoundingClientRect() } : null;
      }).filter(Boolean);
      for (const { target, from, to } of pairs) {
        if (!from.width || !to.width) continue;
        const moved = { transform: `translate(${from.x - to.x}px, ${from.y - to.y}px) scale(${from.width / to.width})` };
        const resting = { transform: 'translate(0, 0) scale(1)' };
        const animation = target.animate(leaving ? [resting, moved] : [moved, resting], {
          duration: leaving ? 240 : 600, easing: 'cubic-bezier(.22, 1, .36, 1)',
        });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    };
    return { ...toRefs(props.ctx), enterDay: (el) => morphWeek(el), leaveDay: (el) => morphWeek(el, true), cancelMorph };
  },
  template: `
            <Transition name="day-view" @enter="enterDay" @leave="leaveDay"
                        @enter-cancelled="cancelMorph" @leave-cancelled="cancelMorph" @after-leave="cancelMorph">
                <div v-if="isMobile && dayViewOpen"
                     data-mobile-day-view role="region" :aria-label="selectedDayLabel"
                     class="mobile-day-view absolute inset-0 z-[500] flex flex-col bg-white dark:bg-[#1c1c1e]"
                     :style="{ '--slot-height': slotHeight + 'px' }"
                     @touchstart.stop="dayViewTouchStart($event)"
                     @touchmove.stop="dayViewTouchMove($event)"
                     @touchend.stop="dayViewTouchEnd($event)"
                     @touchcancel.stop="dayViewTouchCancel"
                     @wheel.stop
                     @keydown.left.prevent="changeSelectedDay(-1)"
                     @keydown.right.prevent="changeSelectedDay(1)">

                    <!-- 顶栏：返回月视图 + 当天日期 -->
                    <div class="shrink-0 flex items-center justify-between pl-1 pr-3">
                        <button @click="closeDayView" aria-label="返回月视图"
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
                                :aria-label="d.fullDate" :aria-pressed="selectedDay === d.fullDate"
                                :aria-current="d.isToday ? 'date' : undefined"
                                class="flex flex-col items-center justify-center py-1 gap-1">
                            <span class="text-[11px] font-bold opacity-40">{{ d.weekday }}</span>
                            <span :data-week-date="d.fullDate" class="w-8 h-8 flex items-center justify-center rounded-full text-base font-bold transition-colors"
                                  :class="selectedDay === d.fullDate
                                      ? (d.isToday ? 'bg-[#ff3b30] text-white' : 'bg-black/10 dark:bg-white/20')
                                      : (d.isToday ? 'text-[#ff3b30]' : 'opacity-80')">
                                {{ d.dayNum }}
                            </span>
                            <span class="w-1 h-1 rounded-full"
                                  :class="d.hasTasks ? 'bg-[#007aff]' : 'bg-transparent'"></span>
                        </button>
                    </div>

                    <!-- 当天时间轴 -->
                    <div class="day-timeline flex-1 overflow-y-auto overscroll-contain no-scrollbar relative"
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
                            <div class="day-pager relative flex-1 min-w-0 overflow-hidden">
                                <div class="day-pager-track flex" :style="dayPagerStyle">
                                    <div v-for="page in dayPages" :key="page.offset"
                                         :data-date-str="page.offset === 0 ? selectedDay : undefined"
                                         :aria-hidden="page.offset !== 0" :inert="page.offset !== 0"
                                         class="w-full shrink-0">
                                        <div class="relative" style="min-height: 1000px;">
                                            <div v-for="t in timeSlots" :key="t"
                                                 class="grid-slot" :class="{ 'droppable-slot': page.offset === 0 }"
                                                 :data-time="t"
                                                 @dragover.prevent
                                                 @drop="dropToSchedule($event, selectedDay)"></div>

                                            <div v-for="task in page.tasks"
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
                                                 :style="getTaskStyle(task)" :title="getBlockTitle(task) + ' · ' + task.startTime + ' · 时长 ' + task.estDuration"
                                                 @click.stop="selectTask(task.scheduleId, 'schedule')">

                                                <div class="schedule-block-content pointer-events-none">
                                                    <strong class="schedule-block-title">{{ getBlockTitle(task) }}</strong>
                                                    <div class="schedule-block-meta">
                                                        <span data-schedule-start class="schedule-block-start">{{ task.startTime }}</span>
                                                        <span class="schedule-block-duration">{{ task.estDuration }}</span>
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
                                            <div v-if="page.offset === 0 && nowIndicatorStyle" class="day-now-line" :style="nowIndicatorStyle">
                                                <span class="day-now-dot"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- 底部留白：别让最后一条日程被 tab bar 压住 -->
                        <div class="h-24"></div>
                    </div>
                </div>
            </Transition>
  `,
};
