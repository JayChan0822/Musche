import { createApp, ref, onMounted, nextTick } from 'vue';

// Isolated transient chooser; the caller commits only after a selection.
export function chooseAssignmentSchedule(schedules) {
  return new Promise(resolve => {
    const host = document.createElement('div');
    const previousFocus = document.activeElement;
    document.body.appendChild(host);
    let settled = false;
    const finish = value => {
      if (settled) return;
      settled = true;
      app.unmount(); host.remove();
      previousFocus?.isConnected && previousFocus.focus({ preventScroll: true });
      resolve(value);
    };
    const app = createApp({
      setup() {
        const panel = ref(null);
        const keydown = event => {
          event.stopPropagation();
          if (event.key === 'Escape') { event.preventDefault(); finish(null); }
          if (event.key !== 'Tab') return;
          const buttons = [...panel.value.querySelectorAll('button')];
          if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons.at(-1).focus(); }
          else if (!event.shiftKey && document.activeElement === buttons.at(-1)) { event.preventDefault(); buttons[0].focus(); }
        };
        onMounted(async () => { await nextTick(); panel.value?.querySelector('button')?.focus(); });
        return { schedules, panel, finish, keydown };
      },
      template: `<div class="modal-overlay z-[6000]" @click.self="finish(null)" @keydown="keydown">
        <section ref="panel" role="dialog" aria-modal="true" aria-labelledby="assignment-schedule-title" class="modal-window w-[420px] max-w-[94vw] max-h-[80dvh] flex flex-col">
          <div class="flex items-center justify-between gap-3 mb-3"><h2 id="assignment-schedule-title" class="font-bold">选择加入的日程</h2><button aria-label="取消分配" @click="finish(null)" class="w-9 h-9 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">✕</button></div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">该人员有多个日程，选择本次任务的安排。取消会保留原分配。</p>
          <div class="overflow-y-auto space-y-2 min-h-0"><button v-for="block in schedules" :key="block.scheduleId" @click="finish(block.scheduleId)" class="w-full text-left p-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-blue-500/10 focus-visible:ring-2 focus-visible:ring-blue-500">
            <span class="block font-semibold text-sm">{{ block.date || '日期未设置' }} · {{ block.startTime || '时间未设置' }}</span>
            <span class="block text-xs text-gray-500 dark:text-gray-400 mt-1">安排时长 {{ block.estDuration || '未设置' }}</span>
          </button></div>
        </section></div>`,
    });
    app.mount(host);
  });
}
