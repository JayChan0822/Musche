import { computed, reactive } from 'vue';

const categories = [
  { type: 'studio', label: '录音棚', icon: 'fa-building' },
  { type: 'engineer', label: '工程师', icon: 'fa-sliders' },
  { type: 'operator', label: '操作员', icon: 'fa-headphones' },
  { type: 'assistant', label: '助理', icon: 'fa-user-group' },
];

export const AppMetadataLibrary = {
  name: 'AppMetadataLibrary',
  props: { ctx: { type: Object, required: true }, search: { type: String, default: '' } },
  setup(props) {
    const expanded = reactive(new Set());
    const busy = reactive(new Set());
    const groups = computed(() => {
      const query = props.search.trim().toLowerCase();
      return categories.map((category) => {
        const list = props.ctx.settings[`${category.type}s`] || [];
        const matchesCategory = `${category.label} ${category.type}`.toLowerCase().includes(query);
        return { ...category, total: list.length,
          items: list.filter((item) => !query || matchesCategory || item.name.toLowerCase().includes(query))
            .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true })),
          visible: !query || matchesCategory || list.some((item) => item.name.toLowerCase().includes(query)),
        };
      }).filter((group) => group.visible);
    });
    const isExpanded = (type) => !!props.search.trim() || expanded.has(type);
    const toggle = (type) => { if (expanded.has(type)) expanded.delete(type); else expanded.add(type); };
    const add = async (type) => {
      const name = props.ctx.newRecInputs[type].trim();
      if (!name || busy.has(type)) return;
      busy.add(type);
      try {
        await props.ctx.addRecItem(type, name);
        if (props.ctx.settings[`${type}s`].some((item) => item.name.toLowerCase() === name.toLowerCase())) {
          props.ctx.newRecInputs[type] = '';
        }
      } finally { busy.delete(type); }
    };
    return { groups, isExpanded, toggle, add, busy };
  },
  template: `
    <div class="space-y-3">
      <section v-for="group in groups" :key="group.type" class="rounded-xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 overflow-hidden">
        <button @click="toggle(group.type)" :aria-expanded="isExpanded(group.type)" class="flex items-center gap-2 w-full px-3 py-3 text-xs font-bold text-left hover:bg-black/5 dark:hover:bg-white/5">
          <i class="fa-solid fa-chevron-right text-[10px] text-gray-500 transition-transform" :class="{'rotate-90': isExpanded(group.type)}" aria-hidden="true"></i>
          <i class="fa-solid text-teal-600 dark:text-teal-400" :class="group.icon" aria-hidden="true"></i>
          <span class="flex-1">{{ group.label }}</span><span class="font-mono text-gray-500 dark:text-gray-400">{{ group.total }}</span>
        </button>
        <div v-show="isExpanded(group.type)" class="p-2 pt-0 space-y-1">
          <div v-for="item in group.items" :key="item.id" class="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/60 dark:bg-black/10">
            <input :value="item.name" :aria-label="group.label + '名称'" @change="ctx.handleRecRename(group.type, item, $event)" class="min-w-0 flex-1 py-1 text-sm bg-transparent rounded outline-none focus:ring-1 focus:ring-blue-500">
            <button @click="ctx.removeRecItem(group.type, item.id)" :aria-label="'删除' + item.name" class="w-7 h-7 shrink-0 rounded text-gray-400 hover:text-red-500 hover:bg-red-500/10"><i class="fa-solid fa-trash-can text-[10px]" aria-hidden="true"></i></button>
          </div>
          <p v-if="!group.items.length" class="text-xs text-gray-500 dark:text-gray-400 text-center py-3">暂无{{ group.label }}</p>
          <form @submit.prevent="add(group.type)" class="flex gap-2 pt-2">
            <input v-model="ctx.newRecInputs[group.type]" :aria-label="'新增' + group.label" :placeholder="'新增' + group.label + '…'" class="glass-input min-w-0 flex-1 h-9 text-xs">
            <button :disabled="busy.has(group.type) || !ctx.newRecInputs[group.type].trim()" :aria-label="'添加' + group.label" class="w-9 h-9 shrink-0 rounded-lg bg-[#007aff] text-white disabled:opacity-40"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>
          </form>
        </div>
      </section>
      <p v-if="!groups.length" class="py-12 text-center text-xs text-gray-500 dark:text-gray-400">没有匹配的元数据</p>
    </div>
  `,
};
