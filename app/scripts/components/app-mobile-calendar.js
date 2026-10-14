import { watch } from 'vue';
import { useMobileCalendar } from '../features/mobile-calendar.js';

const paths = {
  back: 'm15 5-7 7 7 7', plus: 'M12 4v16M4 12h16', search: 'M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Zm5.5-2 5 5',
  month: 'M5 8h14a3 3 0 0 1 0 6H5a3 3 0 0 1 0-6Zm2 0v6m5-6v6m5-6v6',
  day: 'M7 4h13v5H7zM7 13h13v7H7zM3 4h.01M3 9h.01M3 14h.01M3 20h.01',
  multiday: 'M7 4h5v5H7zM16 4h5v5h-5zM7 13h5v7H7zM16 13h5v7h-5zM3 4h.01M3 9h.01M3 14h.01M3 20h.01',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 10v7m0-11h.01',
  inbox: 'M3 8 6 4h12l3 4v12H3V8Zm0 5h5l2 3h4l2-3h5',
  close: 'm6 6 12 12M6 18 18 6', check: 'm5 12 4 4L20 5',
};
const CalendarIcon = { props: ['name'], setup: () => ({ paths }), template: '<svg class="mc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="paths[name] || paths.day"/></svg>' };

export const AppMobileCalendar = {
  name: 'AppMobileCalendar', components: { CalendarIcon },
  props: { ctx: { type: Object, required: true } },
  emits: ['label'],
  setup(props, { emit }) {
    const calendar = useMobileCalendar(props.ctx);
    watch(() => [calendar.mode.value, calendar.selected.value, calendar.visibleMonth.value], () => {
      emit('label', calendar.mode.value === 'month' ? calendar.visibleMonth.value.replace('-', '年')+'月' : calendar.dayTitle(calendar.selected.value));
    }, { immediate:true });
    return calendar;
  },
  template: `
  <section ref="root" class="mc-calendar" :class="{ 'mc-timeline-mode': mode !== 'month', 'mc-multi': multi }"
      :data-mode="mode" aria-label="日历" @touchstart.stop @touchmove.stop @touchend.stop @mousedown.stop @mouseup.stop @wheel.stop @keydown.left="keyNavigate($event,-1)" @keydown.right="keyNavigate($event,1)">
    <div v-if="mode !== 'month'" class="mc-calendar-navigation">
      <button aria-label="返回月视图" @click="backToMonth"><calendar-icon name="back"/><span>{{selectedMonth}}</span></button>
      <span>{{dayTitle(selected)}}</span>
    </div>
    <div class="mc-month-weekdays" :aria-hidden="mode !== 'month'"><span v-for="w in WEEKDAYS" :key="w">{{w}}</span></div>
    <div ref="monthScroller" class="mc-month-scroller" :inert="mode !== 'month'" @scroll.passive="monthScroll" data-mobile-month-scroller>
      <div ref="monthContent" class="mc-month-content">
        <section v-for="month in months" :key="month.key" :data-month-section="month.key" class="mc-month-section">
          <div class="mc-month-label" :class="{'is-current':month.key === today.slice(0,7)}" :style="{paddingLeft: 'calc(' + month.start + ' * 100% / 7 + 12px)'}">{{month.month+1}}月</div>
          <div class="mc-month-grid">
            <template v-for="(day,index) in month.days" :key="day?.key || index">
              <button v-if="day" class="mc-month-day" :data-month-date="day.key" :aria-label="day.key + '，' + tasks(day.key).length + '项日程'"
                :aria-current="day.key === today ? 'date' : undefined" @click="openDate(day.key)">
                <span class="mc-date-face" :class="{'is-today':day.key===today, 'is-weekend':day.weekday===0 || day.weekday===6}">
                  <span class="mc-date-number">{{day.number}}</span><span class="mc-lunar">{{day.lunar}}</span>
                </span>
                <span class="mc-day-marks" aria-hidden="true"><i v-for="task in tasks(day.key).slice(0,3)" :key="task.scheduleId" :style="{background:color(task)}"></i></span>
              </button><div v-else class="mc-month-blank"></div>
            </template>
          </div>
        </section>
      </div>
    </div>
    <div ref="weekStrip" class="mc-week-strip" :inert="mode === 'month'" :aria-hidden="mode === 'month'">
      <div class="mc-week-track">
        <span v-if="multi" class="mc-week-range" aria-hidden="true"></span>
        <div class="mc-week-selection" aria-hidden="true"><div class="mc-week-selection-labels">
          <span v-for="day in stripDays" :key="day.key" class="mc-week-label-cell"><span class="mc-date-face"><span class="mc-date-number">{{day.number}}</span><span class="mc-lunar">{{day.lunar}}</span></span></span>
        </div></div>
        <button v-for="day in stripDays" :key="day.key" :data-week-date="day.key" :inert="day.weekOffset !== 0" :aria-hidden="day.weekOffset !== 0" @click="selectDate(day.key)" :aria-label="day.key" :aria-pressed="selected===day.key">
          <span class="mc-weekday">{{WEEKDAYS[day.weekday]}}</span>
          <span class="mc-date-face" :class="{'is-today':day.key===today,'is-weekend':day.weekday===0 || day.weekday===6}"><span class="mc-date-number">{{day.number}}</span><span class="mc-lunar">{{day.lunar}}</span></span>
        </button>
      </div>
    </div>
    <div ref="timePanel" class="mc-time-panel" :inert="mode === 'month'" :aria-hidden="mode === 'month'" @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerUp" @pointercancel="cancelGesture">
      <template v-if="mode !== 'list'">
        <div class="mc-heading-viewport" :style="{height: (58 + allDayHeight) + 'px'}">
          <div v-if="multi" class="mc-all-day-gutter">全天</div>
          <div class="mc-heading-track" :style="{marginLeft:multi ? '65px' : '0'}">
            <div v-for="day in dates" :key="day.offset" class="mc-page-heading" :data-heading-date="day.key" :aria-hidden="!activeDates.includes(day.key)">
              <div class="mc-date-title">{{dayTitle(day.key,!multi)}}</div><div class="mc-date-subtitle">{{lunarLabel(day.key,true)}}</div>
              <div class="mc-all-day-events"><button v-for="task in tasks(day.key).filter(t => t.allDay).slice(0,4)" :key="task.scheduleId" :style="{'--event-color':color(task)}" @click="openTask(task,$event)">{{title(task)}}</button></div>
            </div>
          </div>
        </div>
        <div ref="timeline" class="mc-timeline-scroll" @scroll.passive="timelineScroll">
          <div class="mc-time-canvas" :style="{height:24*hourHeight+'px'}">
            <div v-if="multi" class="mc-ruler mc-fixed-ruler"><span v-for="hour in rows" :key="hour" :style="{top:hour*hourHeight+'px'}">{{String(hour%24).padStart(2,'0')}}:00</span></div>
            <div class="mc-days-viewport" :style="{marginLeft:multi ? '65px' : '0'}">
              <div class="mc-days-track">
                <div v-for="day in dates" :key="day.offset" class="mc-day-page" :data-page-date="day.key" :aria-hidden="!activeDates.includes(day.key)" :inert="!activeDates.includes(day.key)" :data-active-date="activeDates.includes(day.key) ? day.key : undefined">
                  <div v-if="!multi" class="mc-ruler"><span v-for="hour in rows" :key="hour" :style="{top:hour*hourHeight+'px'}">{{String(hour%24).padStart(2,'0')}}:00</span></div>
                  <div class="mc-time-grid" :class="{'has-ruler':!multi}" :data-time-grid="day.key">
                    <div v-for="hour in rows" :key="hour" class="mc-hour-line" :style="{top:hour*hourHeight+'px'}"></div>
                    <div v-if="day.key===today" class="mc-now-line" :style="{top:nowMinutes/60*hourHeight+'px'}" aria-hidden="true"><i></i></div>
                    <div v-if="draft?.date===day.key" class="mc-event task-block mc-draft" :style="{top:draft.minutes/60*hourHeight+'px',height:hourHeight+'px','--event-color':'#0a9cda'}">新建日程</div>
                    <div v-for="task in tasks(day.key).filter(t=>!t.allDay)" :key="task.scheduleId" class="mc-event task-block group" role="button" tabindex="0"
                      :aria-label="title(task)+' '+eventRange(task)" :style="eventStyle(task)" :class="{'is-selected':selectedEvent===task.scheduleId,'is-ghost':isTaskGhost(task)}"
                      @pointerdown.stop="eventDown($event,task)" @pointermove.stop="eventMove" @pointerup.stop="eventEnd($event)" @pointercancel.stop="eventEnd($event,true)"
                      @click.stop="eventClick(task)" @dblclick.stop="openTask(task,$event)" @keydown.enter.stop="openTask(task,$event)">
                      <div class="flex flex-col h-full justify-between pointer-events-none">
                        <strong class="font-bold leading-tight truncate pr-1">{{title(task)}}</strong>
                        <span class="mc-event-range mt-auto text-[11px] font-mono opacity-80 leading-none flex items-center gap-2"><span>{{task.startTime}}</span><span class="font-bold opacity-70">{{task.estDuration}}</span></span>
                      </div>
                      <div v-if="hasRecordingInfo(task)" class="absolute bottom-[1px] right-[2px] z-[15] pointer-events-none"><i class="fa-solid fa-circle-info text-[10px] opacity-90"></i></div>
                      <button v-if="selectedEvent===task.scheduleId" class="resize-handle mc-event-resize" aria-label="调整结束时间" @pointerdown.stop.prevent="eventDown($event,task,'end')"></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div><div class="mc-scroll-tail"></div>
        </div>
      </template>
      <div v-else class="mc-agenda"><div v-for="group in filteredAgenda" :key="group.key" class="mc-agenda-day"><h2>{{dayTitle(group.key,true)}}</h2><button v-for="task in group.items" :key="task.scheduleId" @click="openTask(task,$event)"><time>{{task.allDay?'全天':task.startTime}}</time><i :style="{background:color(task)}"></i><span>{{title(task)}}</span></button></div><p v-if="!filteredAgenda.length" class="mc-empty">没有日程</p></div>
    </div>
    <div ref="transitionLayer" class="mc-transition-layer" aria-hidden="true"></div>
    <div v-if="menuOpen" class="mc-popover-dismiss" @click.self="toggleMenu(false)"><div ref="menuElement" class="mc-mode-menu mc-glass" role="menu"><button v-for="entry in [{id:'day',label:'单日'},{id:'multiday',label:'多日'},{id:'list',label:'列表'}]" :key="entry.id" role="menuitemradio" :aria-checked="mode===entry.id" @click="setMode(entry.id)"><span class="mc-menu-check">{{mode===entry.id?'✓':''}}</span><calendar-icon :name="entry.id"/><span>{{entry.label}}</span></button></div></div>
    <Transition :css="false" @enter="sheetEnter" @leave="sheetLeave"><div v-if="editor" class="mc-editor-backdrop" @click.self="closeEditor"><form class="mc-editor-sheet" @submit.prevent="saveEditor" aria-label="编辑日程">
      <div class="mc-editor-toolbar"><button type="button" class="mc-glass" aria-label="取消编辑" @click="closeEditor"><calendar-icon name="close"/></button><span class="mc-editor-segment">日程</span><button type="submit" class="mc-save" aria-label="保存日程"><calendar-icon name="check"/></button></div>
      <div class="mc-editor-scroll"><div class="mc-editor-title"><input class="mc-event-title-input" v-model="editor.title" placeholder="标题" aria-label="日程标题" :readonly="editor.original && !editor.original.isCalendarEvent"/></div>
        <div class="mc-form-group"><label>日期<input type="date" v-model="editor.date" required/></label><label>开始<input type="time" v-model="editor.startTime" required :disabled="editor.allDay"/></label><label>结束<input type="text" inputmode="numeric" v-model="editor.endTime" pattern="([01][0-9]|2[0-3]):[0-5][0-9]|24:00" aria-label="结束时间" required :disabled="editor.allDay"/></label><label>全天<input type="checkbox" role="switch" v-model="editor.allDay" :disabled="editor.original && !editor.original.isCalendarEvent"/></label></div>
        <div v-if="!editor.original || editor.original.isCalendarEvent" class="mc-form-group"><textarea v-model="editor.notes" placeholder="备注" aria-label="备注" rows="3"></textarea></div>
        <p v-if="error" class="mc-form-error" role="alert">{{error}}</p><button v-if="editor.original?.isCalendarEvent" type="button" class="mc-delete" @click="deleteEvent">删除日程</button>
      </div></form></div></Transition>
    <button v-if="error && !editor" class="mc-error-toast" @click="closeError" role="alert">{{error}} · 关闭</button>
  </section>`,
};
