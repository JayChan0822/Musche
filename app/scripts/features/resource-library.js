import { computed, reactive, ref } from 'vue';

export const resourceTabs = [
  { type: 'instrument', label: '乐器', icon: 'fa-guitar', color: '#3b82f6' },
  { type: 'musician', label: '乐手', icon: 'fa-user', color: '#a855f7' },
  { type: 'project', label: '项目', icon: 'fa-folder', color: '#ca8a04' },
];

export function createResourceLibrary(ctx) {
  const activeType = ref('instrument');
  const queries = reactive({ instrument: '', musician: '', project: '' });
  const collapsed = reactive(new Set());
  const creating = ref(false);
  const saving = ref(false);
  const activeTab = computed(() => resourceTabs.find((tab) => tab.type === activeType.value));
  const search = computed({ get: () => queries[activeType.value], set: (value) => { queries[activeType.value] = value; } });
  const list = computed(() => ctx.settings[`${activeType.value}s`]);
  const totalCount = computed(() => list.value.length);
  const groupNames = computed(() => [...new Set(list.value.map((item) => item.group?.trim()).filter(Boolean))].sort());
  const groups = computed(() => {
    const query = search.value.trim().toLowerCase();
    const map = new Map();
    for (const item of list.value) {
      if (query && !`${item.name} ${item.group || ''}`.toLowerCase().includes(query)) continue;
      const group = item.group?.trim() || '';
      if (!map.has(group)) map.set(group, []);
      map.get(group).push(item);
    }
    return [...map].sort(([a], [b]) => a === '' ? 1 : b === '' ? -1 : a.localeCompare(b, 'zh-CN'))
      .map(([name, items]) => ({ name, items: items.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true })) }));
  });
  const form = computed(() => ctx.newSettingsItem[activeType.value]);
  const isExpanded = (group) => !!search.value.trim() || !collapsed.has(`${activeType.value}|${group}`);
  const toggleGroup = (group) => {
    const key = `${activeType.value}|${group}`;
    if (collapsed.has(key)) collapsed.delete(key); else collapsed.add(key);
  };
  const allExpanded = computed(() => groups.value.every((group) => isExpanded(group.name)));
  const toggleAll = () => {
    const collapse = allExpanded.value;
    groups.value.forEach(({ name }) => {
      const key = `${activeType.value}|${name}`;
      if (collapse) collapsed.add(key); else collapsed.delete(key);
    });
  };
  const selectType = (type) => {
    if (!resourceTabs.some((tab) => tab.type === type)) return;
    activeType.value = type;
    creating.value = false;
  };
  const beginCreate = () => {
    if (!form.value.name) form.value.name = search.value.trim();
    creating.value = true;
  };
  const saveNew = async () => {
    if (saving.value || !form.value.name.trim()) return;
    saving.value = true;
    const type = activeType.value;
    const group = form.value.group.trim();
    try {
      await ctx.addSettingsItem(type);
      if (!ctx.newSettingsItem[type].name) {
        queries[type] = '';
        collapsed.delete(`${type}|${group}`);
        if (activeType.value === type) creating.value = false;
      }
    } finally { saving.value = false; }
  };
  const updateGroup = (item, value) => {
    const group = value.trim();
    if ((item.group || '') === group) return;
    item.group = group;
    collapsed.delete(`${activeType.value}|${group}`);
    ctx.pushHistory();
  };
  const updateRatio = (item, value) => {
    const ratio = Number(value);
    if (!Number.isFinite(ratio) || ratio <= 0 || item.defaultRatio === ratio) return;
    item.defaultRatio = ratio;
    ctx.pushHistory();
  };
  return { resourceTabs, activeType, activeTab, search, totalCount, groupNames, groups, form, creating, saving,
    isExpanded, toggleGroup, allExpanded, toggleAll, selectType, beginCreate, saveNew, updateGroup, updateRatio };
}
