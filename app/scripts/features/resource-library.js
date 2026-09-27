import { computed, reactive, ref } from 'vue';

export const resourceTabs = [
  { type: 'instrument', label: '乐器', icon: 'fa-guitar', color: '#3b82f6' },
  { type: 'musician', label: '人员', icon: 'fa-user', color: '#a855f7' },
  { type: 'project', label: '项目', icon: 'fa-folder', color: '#ca8a04' },
];

export function createResourceLibrary(ctx) {
  const activeType = ref('instrument');
  const personRole = ref('all');
  const newPersonRole = ref('musician');
  const getRoleValue = (item) => (item.roles || ['musician']).includes('editor') ? ((item.roles || []).includes('musician') ? 'both' : 'editor') : 'musician';
  const updateRoles = (item, role) => {
    item.roles = [...new Set([...(item.roles || []).filter((value) => !['musician', 'editor'].includes(value)), ...(role === 'both' ? ['musician', 'editor'] : [role])])];
    ctx.pushHistory();
  };
  const previousType = ref('instrument');
  const queries = reactive({ instrument: '', musician: '', project: '', metadata: '' });
  const expanded = reactive(new Set());
  const creating = ref(false);
  const saving = ref(false);
  const activeTab = computed(() => activeType.value === 'metadata'
    ? { type: 'metadata', label: '录音资料', icon: 'fa-database', color: '#0d9488' }
    : resourceTabs.find((tab) => tab.type === activeType.value));
  const search = computed({ get: () => queries[activeType.value], set: (value) => { queries[activeType.value] = value; } });
  const list = computed(() => activeType.value === 'metadata'
    ? ['studios', 'engineers', 'operators', 'assistants'].flatMap((key) => ctx.settings[key] || [])
    : ctx.settings[`${activeType.value}s`]);
  const totalCount = computed(() => list.value.length);
  const groupNames = computed(() => [...new Set(list.value.map((item) => item.group?.trim()).filter(Boolean))].sort());
  const groups = computed(() => {
    const query = search.value.trim().toLowerCase();
    const map = new Map();
    for (const item of list.value) {
      if (activeType.value === 'musician' && personRole.value !== 'all' && !(item.roles || ['musician']).includes(personRole.value)) continue;
      if (query && !`${item.name} ${item.group || ''}`.toLowerCase().includes(query)) continue;
      const group = item.group?.trim() || '';
      if (!map.has(group)) map.set(group, []);
      map.get(group).push(item);
    }
    return [...map].sort(([a], [b]) => a === '' ? 1 : b === '' ? -1 : a.localeCompare(b, 'zh-CN'))
      .map(([name, items]) => ({ name, items: items.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true })) }));
  });
  const form = computed(() => ctx.newSettingsItem[activeType.value]);
  const isExpanded = (group) => !!search.value.trim() || expanded.has(`${activeType.value}|${group}`);
  const toggleGroup = (group) => {
    const key = `${activeType.value}|${group}`;
    if (expanded.has(key)) expanded.delete(key); else expanded.add(key);
  };
  const allExpanded = computed(() => groups.value.every((group) => isExpanded(group.name)));
  const toggleAll = () => {
    const collapse = allExpanded.value;
    groups.value.forEach(({ name }) => {
      const key = `${activeType.value}|${name}`;
      if (collapse) expanded.delete(key); else expanded.add(key);
    });
  };
  const selectType = (type) => {
    if (type !== 'metadata' && !resourceTabs.some((tab) => tab.type === type)) return;
    if (type === 'metadata' && activeType.value !== 'metadata') previousType.value = activeType.value;
    activeType.value = type;
    creating.value = false;
  };
  const returnToLibrary = () => selectType(previousType.value);
  const beginCreate = () => {
    if (!form.value.name) form.value.name = search.value.trim();
    creating.value = true;
  };
  const saveNew = async () => {
    if (saving.value || !form.value.name.trim()) return;
    saving.value = true;
    const type = activeType.value;
    const group = form.value.group.trim();
    const existingIds = new Set((ctx.settings.musicians || []).map((item) => item.id));
    try {
      await ctx.addSettingsItem(type);
      if (type === 'musician') {
        const added = ctx.settings.musicians.find((item) => !existingIds.has(item.id));
        if (added) updateRoles(added, newPersonRole.value);
      }
      if (!ctx.newSettingsItem[type].name) {
        queries[type] = '';
        expanded.add(`${type}|${group}`);
        if (activeType.value === type) creating.value = false;
      }
    } finally { saving.value = false; }
  };
  const updateGroup = (item, value) => {
    const group = value.trim();
    if ((item.group || '') === group) return;
    item.group = group;
    expanded.add(`${activeType.value}|${group}`);
    ctx.pushHistory();
  };
  return { personRole, newPersonRole, getRoleValue, updateRoles, resourceTabs, activeType, activeTab, search, totalCount, groupNames, groups, form, creating, saving,
    isExpanded, toggleGroup, allExpanded, toggleAll, selectType, returnToLibrary, beginCreate, saveNew, updateGroup };
}
