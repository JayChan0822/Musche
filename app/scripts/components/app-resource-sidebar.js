import { nextTick, ref, watch } from 'vue';
import { createResourceLibrary } from '../features/resource-library.js';

export const AppResourceSidebar = {
  name: 'AppResourceSidebar',
  props: { ctx: { type: Object, required: true }, open: Boolean, overlay: Boolean },
  emits: ['close'],
  setup(props) {
    const library = createResourceLibrary(props.ctx);
    const nameInput = ref(null);
    const panel = ref(null);
    watch(() => props.open && props.overlay, async (open) => {
      if (open) {
        await nextTick();
        panel.value?.querySelector('button')?.focus();
      }
    });
    const trapFocus = (event) => {
      if (!props.overlay || event.key !== 'Tab') return;
      const controls = [...panel.value.querySelectorAll('button:not(:disabled), input, [tabindex="0"]')]
        .filter((element) => element.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && event.target === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && event.target === last) { event.preventDefault(); first?.focus(); }
    };
    const navigateTabs = (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const index = library.resourceTabs.findIndex((tab) => tab.type === library.activeType.value);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
      library.selectType(library.resourceTabs[next].type);
      event.currentTarget.querySelectorAll('[role="tab"]')[next]?.focus();
    };
    const startCreate = async () => {
      library.beginCreate();
      await nextTick();
      nameInput.value?.focus();
    };
    return { ...library, nameInput, panel, startCreate, trapFocus, navigateTabs };
  },
  template: `
    <button v-if="open && overlay" class="absolute inset-0 z-[60] bg-black/25 backdrop-blur-sm" aria-label="关闭资料库遮罩" @click="$emit('close')"></button>
    <aside v-if="open" ref="panel" id="resource-library" aria-label="资料库" :role="overlay ? 'dialog' : 'complementary'" :aria-modal="overlay ? true : undefined"
           class="resource-sidebar flex flex-col min-h-0 shrink-0 border-l border-black/10 dark:border-white/10"
           :class="overlay ? 'absolute inset-y-0 right-0 z-[70] shadow-2xl' : 'relative z-20'"
           @keydown="trapFocus" @keydown.esc.stop="$emit('close')">
      <div class="p-3 border-b border-black/5 dark:border-white/10 shrink-0 space-y-3">
        <div class="flex items-center justify-between h-9">
          <div class="flex items-baseline gap-2"><h2 class="font-bold text-sm">资料库</h2><span class="text-[10px] text-gray-500 dark:text-gray-400">LIBRARY</span></div>
          <button class="w-9 h-9 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="收起资料库" @click="$emit('close')"><i class="fa-solid fa-outdent rotate-180" aria-hidden="true"></i></button>
        </div>
        <div class="flex gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-xl" role="tablist" aria-label="资料分类" @keydown="navigateTabs">
          <button v-for="tab in resourceTabs" :key="tab.type" :id="'library-tab-' + tab.type" role="tab" :aria-selected="activeType === tab.type" aria-controls="library-panel"
                  class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                  :class="activeType === tab.type ? 'bg-white dark:bg-white/15 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                  :tabindex="activeType === tab.type ? 0 : -1" @click="selectType(tab.type)">
            <i class="fa-solid" :class="tab.icon" :style="activeType === tab.type ? {color: tab.color} : {}" aria-hidden="true"></i>{{ tab.label }}
          </button>
        </div>
        <div class="relative">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-xs text-gray-400" aria-hidden="true"></i>
          <input v-model="search" :aria-label="'搜索' + activeTab.label" :placeholder="'搜索' + activeTab.label + '或分组…'" class="glass-input w-full h-9 !pl-8 !pr-8 text-xs">
          <button v-if="search" class="absolute right-0 top-0 w-9 h-9 text-gray-500" aria-label="清除资料搜索" @click="search = ''"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
        </div>
      </div>
      <div class="flex justify-between items-center px-4 py-2 text-[11px] text-gray-500 dark:text-gray-400 shrink-0">
        <span>{{ totalCount }} 个{{ activeTab.label }}</span>
        <div class="flex gap-2"><button :disabled="!!search.trim()" @click="toggleAll" class="hover:text-blue-500 disabled:opacity-30 px-1 py-1">{{ allExpanded ? '全部折叠' : '全部展开' }}</button><button v-if="totalCount" @click="ctx.clearSettingsList(activeType)" class="text-red-500 px-1 py-1">清空</button></div>
      </div>
      <div id="library-panel" role="tabpanel" :aria-labelledby="'library-tab-' + activeType" class="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3 pb-3 space-y-3">
        <section v-for="group in groups" :key="activeType + group.name" class="rounded-xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 overflow-hidden">
          <div class="flex items-center gap-1 px-2 py-1.5 bg-black/[0.025] dark:bg-black/10">
            <button :aria-label="(isExpanded(group.name) ? '折叠' : '展开') + (group.name || '未分组')" :aria-expanded="isExpanded(group.name)" @click="toggleGroup(group.name)" class="w-7 h-8 shrink-0 text-gray-500"><i class="fa-solid fa-chevron-right text-[10px] transition-transform" :class="{'rotate-90': isExpanded(group.name)}" aria-hidden="true"></i></button>
            <input :value="group.name" aria-label="分组名称" placeholder="未分组" :style="{color: activeTab.color}" @change="ctx.renameGroup(activeType, group.name, $event.target.value)" class="min-w-0 flex-1 bg-transparent outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 py-1 text-xs font-bold">
            <span class="text-[10px] text-gray-500 dark:text-gray-400 px-2">{{ group.items.length }}</span>
          </div>
          <div v-show="isExpanded(group.name)" class="p-1 space-y-1">
            <div v-for="item in group.items" :key="item.id" class="group/item p-2 rounded-lg bg-white/60 dark:bg-black/10 hover:bg-white dark:hover:bg-white/10">
              <div class="flex items-center gap-2">
                <button @click="ctx.openColorPicker(item, activeType)" :aria-label="'修改' + item.name + '颜色'" class="w-7 h-7 rounded-lg shrink-0 text-white shadow-sm" :style="{backgroundColor: item.color || activeTab.color}"><i class="fa-solid text-[10px]" :class="activeTab.icon" aria-hidden="true"></i></button>
                <input :value="item.name" :aria-label="activeTab.label + '名称'" @change="ctx.handleItemRename(activeType, item, $event)" @mousedown.stop class="min-w-0 flex-1 bg-transparent outline-none rounded focus:ring-1 focus:ring-blue-500 py-1 text-sm font-semibold">
                <button @click="ctx.removeSettingsItem(activeType, item.id)" :aria-label="'删除' + item.name" class="w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10"><i class="fa-solid fa-trash-can text-[10px]" aria-hidden="true"></i></button>
              </div>
              <div class="mt-1.5 pl-9 flex items-center gap-2">
                <input :value="item.group" :list="'library-groups-' + activeType" aria-label="所属分组" placeholder="未分组" @change="updateGroup(item, $event.target.value)" @mousedown.stop class="min-w-0 flex-1 w-0 bg-transparent text-[11px] text-gray-500 dark:text-gray-400 outline-none rounded focus:ring-1 focus:ring-blue-500 py-1">
                <template v-if="activeType === 'project'">
                  <button @click="ctx.openProjectInfoModal(item)" :aria-label="item.name + '项目信息'" title="项目信息" class="w-7 h-7 rounded text-blue-500 hover:bg-blue-500/10"><i class="fa-solid fa-circle-info" aria-hidden="true"></i></button>
                  <button @click="ctx.openMidiManager(item)" :aria-label="item.name + ' MIDI 管理'" title="MIDI 管理" class="rounded px-2 h-7 text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-500/10">MIDI</button>
                </template>
              </div>
            </div>
          </div>
        </section>
        <div v-if="groups.length === 0" class="py-12 px-3 text-center text-gray-500 dark:text-gray-400 text-xs space-y-2">
          <i class="fa-solid text-2xl opacity-40" :class="activeTab.icon" aria-hidden="true"></i>
          <p>{{ search ? '没有匹配的' + activeTab.label : '暂无' + activeTab.label }}</p>
          <button @click="startCreate" class="text-blue-600 dark:text-blue-400 font-semibold py-2">新增{{ activeTab.label }}</button>
        </div>
      </div>
      <datalist :id="'library-groups-' + activeType"><option v-for="name in groupNames" :key="name" :value="name"></option></datalist>
      <div class="p-3 border-t border-black/5 dark:border-white/10 shrink-0">
        <form v-if="creating" @submit.prevent="saveNew" class="space-y-2">
          <div class="flex justify-between items-center text-xs font-bold"><span>新增{{ activeTab.label }}</span><button type="button" @click="creating = false" class="w-8 h-8 text-gray-500" aria-label="取消新增"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>
          <input ref="nameInput" v-model="form.name" required :aria-label="'新' + activeTab.label + '名称'" placeholder="名称" class="glass-input w-full h-10 text-sm">
          <div class="flex gap-2"><input v-model="form.group" :list="'library-groups-' + activeType" aria-label="新条目分组" placeholder="分组（可选）" class="glass-input min-w-0 flex-1 h-10 text-xs"><button :disabled="saving || !form.name.trim()" class="px-4 h-10 rounded-xl bg-[#007aff] text-white text-xs font-bold disabled:opacity-40">{{ saving ? '保存中' : '添加' }}</button></div>
        </form>
        <button v-else @click="startCreate" class="w-full py-2.5 rounded-xl bg-[#007aff] hover:bg-[#0062cc] text-white text-xs font-bold flex items-center justify-center gap-2"><i class="fa-solid fa-plus" aria-hidden="true"></i>新增{{ activeTab.label }}</button>
      </div>
    </aside>
  `,
};
