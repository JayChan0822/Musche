import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { buildResourceInsights, insightDimensions } from '../utils/resource-insights.js';
import { formatSecs } from '../utils/format.js';

export const AppResourceInfoModal = {
  name: 'AppResourceInfoModal',
  props: { ctx: { type: Object, required: true }, selection: { type: Object, required: true } },
  emits: ['close'],
  setup(props, { emit }) {
    const tab = ref('overview');
    const scope = ref('all');
    const query = ref('');
    const status = ref('all');
    const page = ref(1);
    const panel = ref(null);
    const closeButton = ref(null);
    let previousFocus;
    const typeLabel = computed(() => insightDimensions.find((dim) => dim.type === props.selection.type)?.label || '资料');
    const entity = computed(() => props.ctx.settings[`${props.selection.type}s`]?.find((item) => item.id === props.selection.id));
    const data = computed(() => buildResourceInsights({
      type: props.selection.type, id: props.selection.id, settings: props.ctx.settings,
      itemPool: props.ctx.itemPool || [], scheduledTasks: props.ctx.scheduledTasks || [],
      sessionId: scope.value === 'current' ? props.ctx.currentSessionId : null,
    }));
    const filteredRows = computed(() => {
      const words = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      return data.value.rows.filter((row) => (status.value === 'all' || row.status === status.value) &&
        words.every((word) => `${row.name} ${row.musician} ${row.instrument} ${row.project} ${row.sessionName} ${row.date || ''}`.toLowerCase().includes(word)));
    });
    const pageCount = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / 30)));
    const historyRows = computed(() => filteredRows.value.slice((page.value - 1) * 30, page.value * 30));
    watch([query, status, scope, () => props.selection.id], () => { page.value = 1; });
    watch(pageCount, (count) => { page.value = Math.min(page.value, count); });
    const trend = computed(() => data.value.trend.slice(-6));
    const maxRatio = computed(() => Math.max(1, ...trend.value.map((row) => row.averageRatio || 0)));
    const formatRatio = (value) => value === null ? '—' : `×${value.toFixed(1)}`;
    const statusLabel = (value) => ({ recorded: '已录制', pending: '待录制', skipped: '已跳过' }[value]);
    const metrics = computed(() => {
      const s = data.value.summary;
      return [
        { label: '曲目总数', value: s.trackCount, detail: `${s.segmentCount} 个录音分段` },
        { label: '已录曲目', value: s.completedCount, detail: `${s.pendingCount} 首待完成 · ${s.partialCount} 首部分录制` },
        { label: '曲目总时长', value: formatSecs(s.musicSeconds), detail: '已录与待录分段，排除跳过项' },
        { label: '已录曲目时长', value: formatSecs(s.recordedMusicSeconds), detail: '仅含有有效曲目时长的录音样本' },
        { label: '实际录音耗时', value: formatSecs(s.actualSeconds), detail: '净录音时长，休息不重复扣除' },
        { label: '休息 / 中断', value: formatSecs(s.breakSeconds), detail: '已录分段中记录的休息时间' },
      ];
    });
    const keydown = (event) => {
      // Prevent the underlying schedule's global Tab/shortcut handlers from firing.
      event.stopPropagation();
      if (event.key === 'Escape') { event.preventDefault(); emit('close'); return; }
      if (event.key !== 'Tab') return;
      const controls = [...panel.value.querySelectorAll('button:not(:disabled), input, select, [tabindex="0"]')]
        .filter((element) => element.getClientRects().length);
      if (event.shiftKey && event.target === controls[0]) { event.preventDefault(); controls.at(-1)?.focus(); }
      else if (!event.shiftKey && event.target === controls.at(-1)) { event.preventDefault(); controls[0]?.focus(); }
    };
    const tabs = [{ id: 'overview', label: '概览' }, { id: 'breakdown', label: '分类统计' }, { id: 'history', label: '历史曲目' }];
    const tabKey = (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const current = tabs.findIndex((item) => item.id === tab.value);
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (current + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
      tab.value = tabs[index].id;
      event.currentTarget.querySelectorAll('[role="tab"]')[index]?.focus();
    };
    onMounted(async () => { previousFocus = document.activeElement; await nextTick(); closeButton.value?.focus(); });
    onUnmounted(() => { if (previousFocus?.isConnected) previousFocus.focus(); });
    return { tab, scope, query, status, page, panel, closeButton, typeLabel, entity, data, filteredRows, pageCount,
      historyRows, trend, maxRatio, metrics, formatSecs, formatRatio, statusLabel, keydown, tabs, tabKey };
  },
  template: `
    <Teleport to="body">
      <div class="modal-overlay z-[5500]" @click.self="$emit('close')" @keydown="keydown">
        <section ref="panel" role="dialog" aria-modal="true" aria-labelledby="resource-info-title" class="modal-window w-[880px] max-w-[94vw] max-h-[88dvh] flex flex-col overflow-hidden !p-0">
          <header class="flex items-center gap-3 p-4 sm:p-6 border-b border-black/5 dark:border-white/10 shrink-0">
            <div class="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-white" :style="{backgroundColor: entity?.color || '#64748b'}"><i class="fa-solid" :class="selection.type === 'musician' ? 'fa-user' : selection.type === 'instrument' ? 'fa-guitar' : 'fa-folder'" aria-hidden="true"></i></div>
            <div class="min-w-0 flex-1"><h2 id="resource-info-title" class="font-bold text-lg truncate">{{ entity?.name || '条目已删除' }}</h2><p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ typeLabel }} · {{ entity?.group || '未分组' }}</p></div>
            <button v-if="entity" @click="ctx.openColorPicker(entity, selection.type)" title="修改颜色" aria-label="修改颜色" class="w-9 h-9 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-500"><i class="fa-solid fa-palette" aria-hidden="true"></i></button>
            <button ref="closeButton" @click="$emit('close')" aria-label="关闭资料详情" class="w-9 h-9 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
          </header>
          <div class="px-4 sm:px-6 pt-4 pb-3 flex flex-wrap gap-3 items-center justify-between shrink-0">
            <div class="flex p-1 rounded-xl bg-black/5 dark:bg-white/5" role="tablist" aria-label="资料详情视图" @keydown="tabKey">
              <button v-for="item in tabs" :key="item.id" :id="'insight-tab-' + item.id" role="tab" aria-controls="insight-content" :aria-selected="tab === item.id" :tabindex="tab === item.id ? 0 : -1" @click="tab = item.id" class="px-3 py-2 rounded-lg text-xs font-bold focus-visible:ring-2 focus-visible:ring-blue-500" :class="tab === item.id ? 'bg-white dark:bg-white/15 shadow-sm' : 'text-gray-500 dark:text-gray-400'">{{ item.label }}</button>
            </div>
            <select v-model="scope" aria-label="统计范围" class="glass-input h-9 text-xs"><option value="all">全部历史</option><option value="current">当前日程</option></select>
          </div>
          <div id="insight-content" role="tabpanel" :aria-labelledby="'insight-tab-' + tab" class="px-4 sm:px-6 pb-5 overflow-y-auto min-h-0 flex-1 custom-scrollbar">
            <template v-if="tab === 'overview'">
              <div class="p-4 sm:p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex flex-wrap items-center gap-x-8 gap-y-3">
                <div><p class="text-xs text-gray-600 dark:text-gray-400">平均录制倍率</p><div class="font-mono text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{{ formatRatio(data.summary.averageRatio) }}</div></div>
                <div><p class="text-xs text-gray-600 dark:text-gray-400">单曲倍率中位数</p><div class="font-mono text-xl font-semibold mt-1">{{ formatRatio(data.summary.medianRatio) }}</div></div>
                <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{{ data.summary.sampleCount === 1 ? '仅 1 首有效样本' : data.summary.sampleCount + ' 首有效样本' }} · {{ data.summary.sampleSegments }} 段<br>录音总耗时 ÷ 对应已录曲目时长</p>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                <div v-for="metric in metrics" :key="metric.label" class="p-3 rounded-xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/5"><p class="text-xs text-gray-500 dark:text-gray-400">{{ metric.label }}</p><p class="font-mono font-bold text-lg mt-1">{{ metric.value }}</p><p class="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{{ metric.detail }}</p></div>
              </div>
              <div class="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500 dark:text-gray-400 my-4">
                <span>最近录音关联日程：{{ data.summary.latestDate || '—' }}</span><span>已跳过：{{ data.summary.skippedCount }} 首</span>
                <span v-for="group in data.breakdowns" :key="group.type">关联{{ group.label }}：{{ group.items.filter(item => item.id).length }}</span>
              </div>
              <div class="grid sm:grid-cols-2 gap-4">
                <section class="rounded-xl border border-black/5 dark:border-white/10 p-3"><h3 class="text-xs font-bold mb-3">近期录制倍率 <span class="font-normal text-gray-500">· 最近 6 个有记录月份</span></h3>
                  <div v-for="point in trend" :key="point.month" class="flex items-center gap-2 mb-2 text-xs"><span class="font-mono text-gray-500">{{ point.month }}</span><div class="flex-1 h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden"><div class="bg-blue-500 h-full rounded-full" :style="{width: point.averageRatio / maxRatio * 100 + '%'}"></div></div><span class="font-mono">{{ formatRatio(point.averageRatio) }}</span><span class="text-gray-500">{{ point.sampleCount }}首</span></div>
                  <p v-if="!trend.length" class="text-xs text-gray-500 py-4">暂无可关联日期的有效录音样本</p>
                </section>
                <section class="rounded-xl border border-black/5 dark:border-white/10 p-3"><h3 class="text-xs font-bold mb-2">常合作对象 / 录音耗时分布</h3>
                  <div v-for="group in data.breakdowns" :key="group.type" class="mb-2"><p class="text-[10px] text-gray-500 mb-1">按{{ group.label }}</p><div v-for="item in group.items.slice(0, 3)" :key="item.id" class="flex gap-2 justify-between text-xs py-1"><span class="truncate">{{ item.name }}</span><span class="shrink-0 font-mono">{{ formatRatio(item.averageRatio) }} · {{ formatSecs(item.actualSeconds) }}</span></div><p v-if="!group.items.length" class="text-xs text-gray-500">暂无关联记录</p></div>
                </section>
              </div>
              <p v-if="!data.summary.trackCount" class="py-6 text-center text-sm text-gray-500">暂无关联曲目，录音后会自动生成统计。</p>
            </template>
            <template v-else-if="tab === 'breakdown'">
              <section v-for="group in data.breakdowns" :key="group.type" class="mb-5"><h3 class="text-sm font-bold mb-2">按{{ group.label }}统计</h3><div class="overflow-x-auto rounded-xl border border-black/5 dark:border-white/10"><table class="w-full text-xs text-left whitespace-nowrap"><thead class="bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400"><tr><th class="p-3">{{ group.label }}</th><th class="p-3">录制倍率</th><th class="p-3">有效样本</th><th class="p-3">已录曲目时长</th><th class="p-3">录音耗时</th></tr></thead><tbody><tr v-for="item in group.items" :key="item.id" class="border-t border-black/5 dark:border-white/5"><td class="p-3 font-semibold">{{ item.name }}</td><td class="p-3 font-mono text-blue-600 dark:text-blue-400">{{ formatRatio(item.averageRatio) }}</td><td class="p-3">{{ item.sampleCount }} 首 / {{ item.sampleSegments }} 段</td><td class="p-3 font-mono">{{ formatSecs(item.recordedMusicSeconds) }}</td><td class="p-3 font-mono">{{ formatSecs(item.actualSeconds) }}</td></tr><tr v-if="!group.items.length"><td colspan="5" class="p-6 text-center text-gray-500">暂无关联记录</td></tr></tbody></table></div></section>
            </template>
            <template v-else>
              <div class="flex flex-wrap gap-2 mb-3"><input v-model="query" aria-label="搜索历史曲目" placeholder="搜索曲目、乐手、乐器或项目…" class="glass-input h-9 min-w-0 flex-1 text-xs"><select v-model="status" aria-label="录制状态" class="glass-input h-9 text-xs"><option value="all">全部状态</option><option value="recorded">已录制</option><option value="pending">待录制</option><option value="skipped">已跳过</option></select></div>
              <div class="overflow-x-auto rounded-xl border border-black/5 dark:border-white/10"><table class="w-full text-xs text-left whitespace-nowrap"><thead class="bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400"><tr><th class="p-3">关联日程日期</th><th class="p-3">曲目 / 项目</th><th class="p-3">乐手 / 乐器</th><th class="p-3">曲目时长</th><th class="p-3">录音耗时</th><th class="p-3">倍率</th><th class="p-3">状态</th></tr></thead><tbody><tr v-for="row in historyRows" :key="row.key" class="border-t border-black/5 dark:border-white/5"><td class="p-3"><div class="font-mono">{{ row.date || '日期未记录' }}</div><div class="text-[10px] text-gray-500 mt-1">{{ row.sessionName }}</div></td><td class="p-3"><div class="font-semibold">{{ row.name }} <span v-if="row.splitTag" class="text-[10px] text-gray-500">{{ row.splitTag }}</span></div><div class="text-[10px] text-gray-500 mt-1">{{ row.project }}</div></td><td class="p-3"><div>{{ row.musician }}</div><div class="text-[10px] text-gray-500 mt-1">{{ row.instrument }}</div></td><td class="p-3 font-mono">{{ row.musicSeconds ? formatSecs(row.musicSeconds) : '—' }}</td><td class="p-3 font-mono">{{ row.actualSeconds ? formatSecs(row.actualSeconds) : '—' }}</td><td class="p-3 font-mono">{{ formatRatio(row.ratio) }}</td><td class="p-3"><span class="rounded px-2 py-1" :class="row.status === 'recorded' ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300' : 'bg-black/5 dark:bg-white/10 text-gray-500'">{{ statusLabel(row.status) }}</span></td></tr><tr v-if="!filteredRows.length"><td colspan="7" class="p-8 text-center text-gray-500">没有匹配的曲目</td></tr></tbody></table></div>
              <div class="flex items-center justify-between text-xs mt-3"><span class="text-gray-500">{{ filteredRows.length }} 个录音分段 · {{ page }} / {{ pageCount }}</span><div class="flex gap-2"><button @click="page--" :disabled="page <= 1" class="px-3 py-2 rounded-lg bg-black/5 dark:bg-white/10 disabled:opacity-30">上一页</button><button @click="page++" :disabled="page >= pageCount" class="px-3 py-2 rounded-lg bg-black/5 dark:bg-white/10 disabled:opacity-30">下一页</button></div></div>
            </template>
            <div class="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed mt-4 pt-3 border-t border-black/5 dark:border-white/10">
              仅统计录音记录，不包含编辑耗时；倍率按总耗时加权。拆分曲目合并计数、分段累计时长。历史范围限当前保存的数据。
              <span v-if="data.summary.unratedCount"> {{ data.summary.unratedCount }} 个已录分段缺少曲目时长，不参与倍率。</span>
              <span v-if="data.summary.undatedRecordedCount"> {{ data.summary.undatedRecordedCount }} 个已录分段无法确认关联日期，不参与月度趋势。</span>
            </div>
          </div>
        </section>
      </div>
    </Teleport>
  `,
};
