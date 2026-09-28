import { ref, onMounted, onUnmounted } from 'vue';
import { formatSecs } from '../utils/format.js';

export const AppRatioComparison = {
  name: 'AppRatioComparison',
  props: { comparison: { type: Object, required: true } },
  setup() {
    const open = ref(false), trigger = ref(null), popup = ref(null);
    const position = ref({});
    const close = () => { open.value = false; };
    const toggle = () => {
      if (open.value) { close(); return; }
      const rect = trigger.value.getBoundingClientRect();
      position.value = { left: Math.max(8, Math.min(rect.right - 288, window.innerWidth - 296)) + 'px', top: Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - 160)) + 'px' };
      open.value = true;
    };
    const outside = event => { if (!trigger.value?.contains(event.target) && !popup.value?.contains(event.target)) close(); };
    const keydown = event => { if (open.value && event.key === 'Escape') { event.stopPropagation(); close(); trigger.value?.focus({ preventScroll: true }); } };
    onMounted(() => { document.addEventListener('pointerdown', outside); document.addEventListener('keydown', keydown, true); window.addEventListener('resize', close); document.addEventListener('scroll', close, true); });
    onUnmounted(() => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', keydown, true); window.removeEventListener('resize', close); document.removeEventListener('scroll', close, true); });
    return { open, trigger, popup, position, toggle, formatSecs };
  },
  template: `
    <button ref="trigger" type="button" @click.stop="toggle" @pointerdown.stop @touchstart.stop @touchend.stop @dblclick.stop @dragstart.prevent.stop :aria-expanded="open" aria-label="查看平均与安排倍率" title="查看平均与安排倍率" class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/5 dark:bg-white/10 text-xs font-mono whitespace-nowrap focus-visible:ring-2 focus-visible:ring-blue-500">
      <i aria-hidden="true" class="w-1.5 h-1.5 rounded-full" :class="comparison.differencePercent === null ? 'bg-gray-400' : comparison.differencePercent < 0 ? 'bg-orange-400' : 'bg-teal-400'"></i>
      {{ comparison.scheduledRatio === null ? '×—' : '×' + comparison.scheduledRatio.toFixed(1) }}
    </button>
    <Teleport to="body"><div v-if="open" ref="popup" :style="position" class="ratio-detail-popover" @click.stop role="region" aria-label="倍率详情">
    <div class="flex flex-wrap items-center gap-x-2 gap-y-1.5 px-3 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 text-xs" role="group" :aria-label="comparison.stage === 'edit' ? '剪辑平均与安排倍数对照' : '演奏员平均与安排倍数对照'">
      <span class="inline-flex items-baseline gap-1 text-gray-600 dark:text-gray-400"
            :title="comparison.averageRatio === null ? '当前日程暂无有效' + (comparison.stage === 'edit' ? '剪辑' : '录音') + '记录' : '当前日程历史' + (comparison.stage === 'edit' ? '剪辑' : '录音') + ' ' + formatSecs(comparison.actualSeconds) + ' / 对应曲目 ' + formatSecs(comparison.recordedMusicSeconds)">
        <span>平均</span>
        <span class="font-mono tabular-nums">{{ comparison.averageRatio === null ? '—' : '×' + comparison.averageRatio.toFixed(1) }}</span>
      </span>
      <span aria-hidden="true" class="text-gray-400 dark:text-gray-500">→</span>
      <span class="inline-flex items-baseline gap-1 text-gray-900 dark:text-gray-100"
            :title="comparison.scheduledRatio === null ? '尚未排期或缺少对应曲目时长' : '本次安排 ' + formatSecs(comparison.blockSeconds) + ' / 对应曲目 ' + formatSecs(comparison.scheduledMusicSeconds)">
        <span>安排</span>
        <span class="font-mono tabular-nums text-sm font-bold">{{ comparison.scheduledRatio === null ? '—' : '×' + comparison.scheduledRatio.toFixed(1) }}</span>
      </span>
      <span v-if="comparison.differencePercent !== null"
            class="rounded-md px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap"
            :class="comparison.differencePercent > 0 ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300' : comparison.differencePercent < 0 ? 'bg-orange-500/10 text-orange-700 dark:text-orange-300' : 'bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-400'"
            title="安排倍数相对平均倍数的时间余量">
        {{ comparison.differencePercent > 0 ? '余量 +' + comparison.differencePercent + '%' : comparison.differencePercent < 0 ? '偏紧 −' + Math.abs(comparison.differencePercent) + '%' : '与平均一致' }}
      </span>
    </div>
    </div></Teleport>
  `,
};
