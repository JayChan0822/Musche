import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { buildResourceInsights, insightDimensions } from '../utils/resource-insights.js';
import { formatSecs } from '../utils/format.js';
import { metadataTypes, metadataAvatarColor } from '../utils/metadata-types.js';

export const AppResourceInfoModal = {
  name: 'AppResourceInfoModal',
  props: { ctx: { type: Object, required: true }, selection: { type: Object, required: true } },
  emits: ['close'],
  setup(props, { emit }) {
    const tab = ref('overview');
    const scope = ref('all');
    const stage = ref('rec');
    const workLabel = computed(() => stage.value === 'edit' ? '剪辑' : '录音');
    const query = ref('');
    const status = ref('all');
    const page = ref(1);
    const panel = ref(null);
    const closeButton = ref(null);
    let previousFocus;
    const typeLabel = computed(() => [...insightDimensions, ...metadataTypes].find((dim) => dim.type === props.selection.type)?.label || '资料');
    const entity = computed(() => props.ctx.settings[`${props.selection.type}s`]?.find((item) => item.id === props.selection.id));
    const data = computed(() => buildResourceInsights({
      stage: stage.value, type: props.selection.type, id: props.selection.id, settings: props.ctx.settings,
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
    watch([query, status, scope, stage, () => props.selection.id], () => { page.value = 1; });
    watch(pageCount, (count) => { page.value = Math.min(page.value, count); });
    const trend = computed(() => data.value.trend.slice(-6));
    const maxRatio = computed(() => Math.max(1, ...trend.value.map((row) => row.averageRatio || 0)));
    const formatRatio = (value) => value === null ? '—' : `×${value.toFixed(1)}`;
    const statusLabel = (value) => ({ recorded: stage.value === 'edit' ? '已剪辑' : '已录制', 'in-progress': '进行中', pending: stage.value === 'edit' ? '待剪辑' : '待录制', skipped: '已跳过' }[value]);
    const metadataCategory = computed(() => metadataTypes.find((entry) => entry.type === props.selection.type));
    const avatarColor = computed(() => metadataCategory.value ? metadataAvatarColor(entity.value, props.selection.type) : entity.value?.color || '#64748b');
    const avatarIcon = computed(() => metadataCategory.value?.icon || ({ musician: 'fa-user', instrument: 'fa-guitar', project: 'fa-folder' }[props.selection.type]));
    const recentRows = computed(() => data.value.rows.filter((row) => row.status === 'recorded').slice(0, 4));
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
    return { tab, scope, stage, workLabel, query, status, page, panel, closeButton, typeLabel, entity, data, filteredRows, pageCount,
      historyRows, trend, maxRatio, metadataCategory, avatarColor, avatarIcon, recentRows, formatSecs, formatRatio, statusLabel, keydown, tabs, tabKey };
  },
  template: `
    <Teleport to="body">
      <div class="modal-overlay z-[5500]" @click.self="$emit('close')" @keydown="keydown">
        <section ref="panel" role="dialog" aria-modal="true" aria-labelledby="resource-info-title" class="resource-info-modal modal-window w-[800px] max-w-[94vw] max-h-[88dvh] flex flex-col overflow-hidden !p-0">
          <div class="flex items-center gap-3 p-4 sm:p-5 border-b border-black/5 dark:border-white/10 shrink-0">
            <div class="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-white" :style="{backgroundColor: avatarColor}"><i class="fa-solid" :class="avatarIcon" aria-hidden="true"></i></div>
            <div class="min-w-0 flex-1"><h2 id="resource-info-title" class="font-bold text-lg truncate">{{ entity?.name || '条目已删除' }}</h2><p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ typeLabel }}<span v-if="!metadataCategory"> · {{ entity?.group || '未分组' }}</span></p></div>
            <button v-if="entity" @click="ctx.openColorPicker(entity, selection.type)" title="修改颜色" aria-label="修改颜色" class="w-9 h-9 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-500"><i class="fa-solid fa-palette" aria-hidden="true"></i></button>
            <button ref="closeButton" @click="$emit('close')" aria-label="关闭资料详情" class="w-9 h-9 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
          </div>
          <div class="px-4 sm:px-6 flex flex-wrap gap-3 items-center justify-between border-b border-black/5 dark:border-white/10 shrink-0">
            <div class="flex gap-5" role="tablist" aria-label="资料详情视图" @keydown="tabKey">
              <button v-for="item in tabs" :key="item.id" :id="'insight-tab-' + item.id" role="tab" aria-controls="insight-content" :aria-selected="tab === item.id" :tabindex="tab === item.id ? 0 : -1" @click="tab = item.id" class="py-4 border-b-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-blue-500" :class="tab === item.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400'">{{ item.label }}</button>
            </div>
            <div class="flex gap-2"><select v-model="stage" aria-label="工作阶段" class="glass-input h-8 text-xs my-2"><option value="rec">REC 录音</option><option value="edit">EDIT 剪辑</option></select><select v-model="scope" aria-label="统计范围" class="glass-input h-8 text-xs my-2"><option value="all">全部历史</option><option value="current">当前日程</option></select></div>
          </div>
          <div id="insight-content" role="tabpanel" :aria-labelledby="'insight-tab-' + tab" class="px-4 sm:px-6 py-5 overflow-y-auto min-h-0 flex-1 custom-scrollbar">
            <template v-if="tab === 'overview'">
              <div class="grid grid-cols-3 gap-3 pb-5 border-b border-black/5 dark:border-white/10">
                <div><p class="text-xs text-gray-500 dark:text-gray-400">{{ metadataCategory ? '关联' + workLabel + '倍率' : stage === 'edit' ? '平均剪辑倍率' : '平均录制倍率' }}</p><p class="font-mono text-2xl sm:text-3xl font-semibold mt-2">{{ formatRatio(data.summary.averageRatio) }}</p><p class="text-[11px] text-gray-500 mt-1">{{ data.summary.sampleCount === 1 ? '仅 1 首有效样本' : data.summary.sampleCount + ' 首有效样本' }}</p></div>
                <div><p class="text-xs text-gray-500 dark:text-gray-400">{{ stage === 'edit' ? '已剪曲目' : '已录曲目' }}</p><p class="font-mono text-2xl sm:text-3xl font-semibold mt-2">{{ data.summary.completedCount }}<span class="text-sm text-gray-500 font-normal"> / {{ data.summary.trackCount }}</span></p><p class="text-[11px] text-gray-500 mt-1">{{ data.summary.pendingCount }} 首待完成</p></div>
                <div><p class="text-xs text-gray-500 dark:text-gray-400">{{ workLabel }}耗时</p><p class="font-mono text-lg sm:text-2xl font-semibold mt-2 leading-9">{{ formatSecs(data.summary.actualSeconds) }}</p><p class="text-[11px] text-gray-500 mt-1">净{{ workLabel }}时间</p></div>
              </div>
              <section class="py-5 border-b border-black/5 dark:border-white/10">
                <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">{{ workLabel }}汇总</h3>
                <dl class="grid sm:grid-cols-2 gap-x-10 gap-y-3 text-xs">
                  <div class="flex justify-between gap-3"><dt class="text-gray-500 dark:text-gray-400">已录曲目时长</dt><dd class="font-mono">{{ formatSecs(data.summary.recordedMusicSeconds) }}</dd></div>
                  <div class="flex justify-between gap-3"><dt class="text-gray-500 dark:text-gray-400">单曲倍率中位数</dt><dd class="font-mono">{{ formatRatio(data.summary.medianRatio) }}</dd></div>
                  <div class="flex justify-between gap-3"><dt class="text-gray-500 dark:text-gray-400">曲目总时长</dt><dd class="font-mono">{{ formatSecs(data.summary.musicSeconds) }}</dd></div>
                  <div class="flex justify-between gap-3"><dt class="text-gray-500 dark:text-gray-400">休息 / 中断</dt><dd class="font-mono">{{ formatSecs(data.summary.breakSeconds) }}</dd></div>
                  <div class="flex justify-between gap-3"><dt class="text-gray-500 dark:text-gray-400">最近{{ workLabel }}关联日程</dt><dd class="font-mono">{{ data.summary.latestDate || '—' }}</dd></div>
                  <div class="flex justify-between gap-3"><dt class="text-gray-500 dark:text-gray-400">部分录制 / 已跳过</dt><dd>{{ data.summary.partialCount }} / {{ data.summary.skippedCount }} 首</dd></div>
                  <div v-for="group in data.breakdowns" :key="group.type" class="flex justify-between gap-3"><dt class="text-gray-500 dark:text-gray-400">关联{{ group.label }}</dt><dd>{{ group.items.filter(item => item.id).length }}</dd></div>
                </dl>
              </section>
              <section class="pt-4">
                <div class="flex justify-between items-center mb-2"><h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400">最近{{ workLabel }}</h3><button @click="tab = 'history'" class="text-xs text-blue-600 dark:text-blue-400 py-1">查看全部 →</button></div>
                <div v-for="row in recentRows" :key="row.key" class="flex items-center gap-4 py-3 border-b border-black/5 dark:border-white/5 last:border-0">
                  <div class="min-w-0 flex-1"><p class="text-sm font-medium truncate" :title="row.name">{{ row.name }} <span class="text-xs text-gray-500">{{ row.splitTag }}</span></p><p class="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">{{ row.date || '日期未记录' }} · {{ row.project }}</p></div>
                  <span class="font-mono text-xs text-gray-500">{{ formatSecs(row.actualSeconds) }}</span><span class="font-mono text-sm w-16 text-right">{{ formatRatio(row.ratio) }}</span>
                </div>
                <p v-if="!recentRows.length" class="py-6 text-center text-sm text-gray-500">{{ data.summary.trackCount ? '暂无已录制曲目' : '暂无关联曲目' }}</p>
              </section>
            </template>
            <template v-else-if="tab === 'breakdown'">
              <section class="mb-6" v-if="trend.length">
                <h3 class="text-sm font-semibold mb-3">月度{{ stage === 'edit' ? '剪辑' : '录制' }}倍率</h3>
                <div v-for="point in trend" :key="point.month" class="flex items-center gap-3 py-2 text-xs"><span class="font-mono text-gray-500">{{ point.month }}</span><div class="flex-1 h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden"><div class="bg-blue-500/60 h-full" :style="{width: point.averageRatio / maxRatio * 100 + '%'}"></div></div><span class="font-mono w-16 text-right">{{ formatRatio(point.averageRatio) }}</span><span class="text-gray-500">{{ point.sampleCount }}首</span></div>
              </section>
              <section v-for="group in data.breakdowns" :key="group.type" class="mb-5"><h3 class="text-sm font-bold mb-2">按{{ group.label }}统计</h3><div class="overflow-x-auto"><table class="w-full text-xs text-left whitespace-nowrap"><thead class="bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400"><tr><th class="p-3">{{ group.label }}</th><th class="p-3">录制倍率</th><th class="p-3">有效样本</th><th class="p-3">已录曲目时长</th><th class="p-3">{{ workLabel }}耗时</th></tr></thead><tbody><tr v-for="item in group.items" :key="item.id" class="border-t border-black/5 dark:border-white/5"><td class="p-3 font-semibold">{{ item.name }}</td><td class="p-3 font-mono">{{ formatRatio(item.averageRatio) }}</td><td class="p-3">{{ item.sampleCount }} 首 / {{ item.sampleSegments }} 段</td><td class="p-3 font-mono">{{ formatSecs(item.recordedMusicSeconds) }}</td><td class="p-3 font-mono">{{ formatSecs(item.actualSeconds) }}</td></tr><tr v-if="!group.items.length"><td colspan="5" class="p-6 text-center text-gray-500">暂无关联记录</td></tr></tbody></table></div></section>
            </template>
            <template v-else>
              <div class="flex flex-wrap gap-2 mb-3"><input v-model="query" aria-label="搜索历史曲目" placeholder="搜索曲目、乐手、乐器或项目…" class="glass-input h-9 min-w-0 flex-1 text-xs"><select v-model="status" aria-label="录制状态" class="glass-input h-9 text-xs"><option value="all">全部状态</option><option value="recorded">已完成</option><option value="in-progress">进行中</option><option value="pending">待完成</option><option value="skipped">已跳过</option></select></div>
              <div class="overflow-x-auto"><table class="w-full text-xs text-left whitespace-nowrap"><thead class="bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400"><tr><th class="p-3">关联日程日期</th><th class="p-3">曲目 / 项目</th><th class="p-3">{{ stage === 'edit' ? '剪辑员' : '演奏员' }} / 乐器</th><th class="p-3">曲目时长</th><th class="p-3">{{ workLabel }}耗时</th><th class="p-3">倍率</th><th class="p-3">状态</th></tr></thead><tbody><tr v-for="row in historyRows" :key="row.key" class="border-t border-black/5 dark:border-white/5"><td class="p-3"><div class="font-mono">{{ row.date || '日期未记录' }}</div><div class="text-[10px] text-gray-500 mt-1">{{ row.sessionName }}</div></td><td class="p-3"><div class="font-semibold">{{ row.name }} <span v-if="row.attemptNumber" class="text-[10px] text-gray-500">第 {{ row.attemptNumber }} 次</span> <span v-if="row.splitTag" class="text-[10px] text-gray-500">{{ row.splitTag }}</span></div><div class="text-[10px] text-gray-500 mt-1">{{ row.project }}</div></td><td class="p-3"><div>{{ row.musician }}</div><div class="text-[10px] text-gray-500 mt-1">{{ row.instrument }}</div></td><td class="p-3 font-mono">{{ row.musicSeconds ? formatSecs(row.musicSeconds) : '—' }}</td><td class="p-3 font-mono">{{ row.actualSeconds ? formatSecs(row.actualSeconds) : '—' }}</td><td class="p-3 font-mono">{{ formatRatio(row.ratio) }}</td><td class="p-3"><span class="rounded px-2 py-1" :class="row.status === 'recorded' ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300' : 'bg-black/5 dark:bg-white/10 text-gray-500'">{{ statusLabel(row.status) }}</span></td></tr><tr v-if="!filteredRows.length"><td colspan="7" class="p-8 text-center text-gray-500">没有匹配的曲目</td></tr></tbody></table></div>
              <div class="flex items-center justify-between text-xs mt-3"><span class="text-gray-500">{{ filteredRows.length }} 个录音分段 · {{ page }} / {{ pageCount }}</span><div class="flex gap-2"><button @click="page--" :disabled="page <= 1" class="px-3 py-2 rounded-lg bg-black/5 dark:bg-white/10 disabled:opacity-30">上一页</button><button @click="page++" :disabled="page >= pageCount" class="px-3 py-2 rounded-lg bg-black/5 dark:bg-white/10 disabled:opacity-30">下一页</button></div></div>
            </template>
            <details class="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-4 pt-3 border-t border-black/5 dark:border-white/10"><summary class="cursor-pointer py-1">统计口径与数据说明</summary><p class="mt-2">
              仅统计当前所选阶段的记录，REC 与 EDIT 独立计算；倍率按总耗时加权。拆分曲目合并计数、分段累计时长。历史范围限当前保存的数据。
              <span v-if="data.summary.unratedCount"> {{ data.summary.unratedCount }} 个已录分段缺少曲目时长，不参与倍率。</span>
              <span v-if="data.summary.undatedRecordedCount"> {{ data.summary.undatedRecordedCount }} 个已录分段无法确认关联日期，不参与月度趋势。</span>
              <span v-if="metadataCategory">按录音资料名称精确关联；倍率描述相关录音，不代表该人员个人效率。关联不明确的记录不计入。</span>
            </p></details>
          </div>
        </section>
      </div>
    </Teleport>
  `,
};
