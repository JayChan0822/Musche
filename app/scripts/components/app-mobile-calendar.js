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
  props: { ctx: { type: Object, required: true }, controls: { type: Object, required: true } },
  emits: ['settings'],
  setup(props) { return useMobileCalendar(props.ctx, props.controls); },
  template: `
  <section ref="root" class="mc-calendar" :class="{ 'mc-timeline-mode': mode !== 'month', 'mc-multi': multi }"
      :data-mode="mode" aria-label="日历" @keydown.left="keyNavigate($event,-1)" @keydown.right="keyNavigate($event,1)">
    <div class="mc-top-shade"></div>
    <nav class="mc-toolbar" aria-label="日历导航">
      <button class="mc-glass mc-back" :aria-label="mode === 'month' ? '选择月份' : '返回月视图'" @click="mode === 'month' ? yearOpen = !yearOpen : backToMonth()">
        <calendar-icon name="back"/><span>{{ mode === 'month' ? visibleMonth.slice(0,4) + '年' : selectedMonth }}</span>
      </button>
      <div class="mc-glass mc-toolbar-group">
        <button aria-label="切换日历视图" aria-haspopup="menu" :aria-expanded="menuOpen" @click="toggleMenu()"><calendar-icon :name="mode"/></button>
        <button aria-label="搜索日程" @click="searchOpen = true"><calendar-icon name="search"/></button>
        <button aria-label="新建日程" @click="openEditor()"><calendar-icon name="plus"/></button>
      </div>
    </nav>
    <div class="mc-month-heading" :aria-hidden="mode !== 'month'"><h1>{{ monthName }}</h1></div>
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
      <button v-for="day in week" :key="day.key" :data-week-date="day.key" @click="selectDate(day.key)" :aria-label="day.key" :aria-pressed="selected===day.key">
        <span class="mc-weekday">{{WEEKDAYS[day.weekday]}}</span>
        <span class="mc-week-range" :class="{'is-covered':multi && activeDates.includes(day.key), 'is-range-start':day.key===selected}"></span>
        <span class="mc-date-face" :class="{'is-selected':day.key===selected,'is-today':day.key===today,'is-weekend':day.weekday===0 || day.weekday===6}"><span class="mc-date-number">{{day.number}}</span><span class="mc-lunar">{{day.lunar}}</span></span>
      </button>
    </div>
    <div ref="timePanel" class="mc-time-panel" :inert="mode === 'month'" :aria-hidden="mode === 'month'" @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerUp" @pointercancel="cancelGesture">
      <template v-if="mode !== 'list'">
        <div class="mc-heading-viewport" :style="{height: (58 + allDayHeight) + 'px'}">
          <div v-if="multi" class="mc-all-day-gutter">全天</div>
          <div class="mc-heading-track" :style="{marginLeft:multi ? '65px' : '0'}">
            <div v-for="day in dates" :key="day.offset" class="mc-page-heading" :data-heading-date="day.key" :aria-hidden="!activeDates.includes(day.key)">
              <div class="mc-date-title">{{dayTitle(day.key,!multi)}}</div><div class="mc-date-subtitle">{{lunarLabel(day.key,true)}}</div>
              <div class="mc-all-day-events"><button v-for="task in tasks(day.key).filter(t => t.allDay).slice(0,4)" :key="task.scheduleId" :style="{'--event-color':color(task)}" @click="openEditor(task)">{{title(task)}}</button></div>
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
                    <div v-if="draft?.date===day.key" class="mc-event mc-draft" :style="{top:draft.minutes/60*hourHeight+'px',height:hourHeight+'px','--event-color':'#0a9cda'}">新建日程</div>
                    <div v-for="task in tasks(day.key).filter(t=>!t.allDay)" :key="task.scheduleId" class="mc-event" role="button" tabindex="0"
                      :aria-label="title(task)+' '+eventRange(task)" :style="eventStyle(task)" :class="{'is-selected':selectedEvent===task.scheduleId}"
                      @pointerdown.stop="eventDown($event,task)" @pointermove.stop="eventMove" @pointerup.stop="eventEnd($event)" @pointercancel.stop="eventEnd($event,true)"
                      @click.stop="eventClick(task)" @dblclick.stop="openEditor(task)" @keydown.enter.stop="openEditor(task)">
                      <strong>{{title(task)}}</strong><span class="mc-event-range">{{eventRange(task)}}</span>
                      <button v-if="selectedEvent===task.scheduleId" class="mc-event-handle mc-handle-start" aria-label="调整开始时间" @pointerdown.stop.prevent="eventDown($event,task,'start')"></button>
                      <button v-if="selectedEvent===task.scheduleId" class="mc-event-handle mc-handle-end" aria-label="调整结束时间" @pointerdown.stop.prevent="eventDown($event,task,'end')"></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div><div class="mc-scroll-tail"></div>
        </div>
      </template>
      <div v-else class="mc-agenda"><div v-for="group in filteredAgenda" :key="group.key" class="mc-agenda-day"><h2>{{dayTitle(group.key,true)}}</h2><button v-for="task in group.items" :key="task.scheduleId" @click="openEditor(task)"><time>{{task.allDay?'全天':task.startTime}}</time><i :style="{background:color(task)}"></i><span>{{title(task)}}</span></button></div><p v-if="!filteredAgenda.length" class="mc-empty">没有日程</p></div>
    </div>
    <div ref="transitionLayer" class="mc-transition-layer" aria-hidden="true"></div>
    <div class="mc-bottom-toolbar"><button class="mc-glass mc-today" @click="jumpToday">今天</button><div class="mc-glass mc-bottom-group"><button aria-label="日历信息" @click="infoOpen = !infoOpen"><calendar-icon name="info"/></button><button aria-label="任务池" @click="openPool"><calendar-icon name="inbox"/></button></div></div>
    <div v-if="menuOpen" class="mc-popover-dismiss" @click.self="toggleMenu(false)"><div ref="menuElement" class="mc-mode-menu mc-glass" role="menu"><button v-for="entry in [{id:'day',label:'单日'},{id:'multiday',label:'多日'},{id:'list',label:'列表'}]" :key="entry.id" role="menuitemradio" :aria-checked="mode===entry.id" @click="setMode(entry.id)"><span class="mc-menu-check">{{mode===entry.id?'✓':''}}</span><calendar-icon :name="entry.id"/><span>{{entry.label}}</span></button></div></div>
    <div v-if="yearOpen" class="mc-popover-dismiss" @click.self="yearOpen=false"><div class="mc-year-menu mc-glass"><h2>{{visibleMonth.slice(0,4)}}年</h2><div><button v-for="(name,index) in MONTH_NAMES" :key="name" @click="pickMonth(index)">{{name}}</button></div></div></div>
    <div v-if="infoOpen" class="mc-popover-dismiss" @click.self="infoOpen=false"><div class="mc-info-menu mc-glass"><button @click="infoOpen=false; $emit('settings')">日历与排程设置</button><button @click="openPool">任务池</button></div></div>
    <div v-if="searchOpen" class="mc-search-panel"><div class="mc-search-bar"><calendar-icon name="search"/><input v-model="query" autofocus aria-label="搜索日程" placeholder="搜索"/><button @click="searchOpen=false;query=''">取消</button></div><div class="mc-agenda"><div v-for="group in filteredAgenda" :key="group.key" class="mc-agenda-day"><h2>{{dayTitle(group.key,true)}}</h2><button v-for="task in group.items" :key="task.scheduleId" @click="searchOpen=false;openDate(task.date);openEditor(task)"><time>{{task.startTime}}</time><i :style="{background:color(task)}"></i><span>{{title(task)}}</span></button></div><p v-if="!filteredAgenda.length" class="mc-empty">没有匹配日程</p></div></div>
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
