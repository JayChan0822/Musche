import { formatSecs } from '../utils/format.js';

export const AppRatioComparison = {
  name: 'AppRatioComparison',
  props: { comparison: { type: Object, required: true } },
  methods: { formatSecs },
  template: `
    <div class="flex flex-wrap items-center gap-x-2 gap-y-1.5 my-3 px-3 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 text-xs" role="group" :aria-label="comparison.stage === 'edit' ? '剪辑平均与安排倍数对照' : '演奏员平均与安排倍数对照'">
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
  `,
};
