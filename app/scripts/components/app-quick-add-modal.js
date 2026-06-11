export const AppQuickAddModal = {
  name: 'AppQuickAddModal',
  props: {
    ctx: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    return props.ctx;
  },
  template: `
<div v-if="showQuickAddModal" class="modal-overlay z-[2000]" @click.self="showQuickAddModal=false">
    <div class="modal-window w-[350px] p-6 animate-[fadeIn_0.2s] flex flex-col gap-4">
        <h3 class="font-bold text-lg capitalize">Add New {{ quickAddType }}</h3>

        <div class="space-y-3">
            <div>
                <label class="text-[10px] font-bold opacity-50 uppercase block mb-1">Name</label>
                <input id="quick-add-name" v-model="quickAddForm.name"
                       class="glass-input w-full text-base"
                       placeholder="Enter name..."
                       @keydown.enter="!$event.isComposing && confirmQuickAdd()">
            </div>

            <div class="quick-add-group-wrapper relative transition-all"
                 :class="showGroupSuggestions ? 'z-50' : 'z-20'">
                <label class="text-[10px] font-bold opacity-50 uppercase block mb-1">Group (Optional)</label>

                <div class="relative">
                    <input v-model="quickAddForm.group"
                           @focus="showGroupSuggestions = true"
                           class="glass-input w-full pr-8"
                           placeholder="输入新分组或选择..."
                           @keydown.enter="!$event.isComposing && confirmQuickAdd()">

                    <i class="fa-solid fa-chevron-down absolute right-3 top-3.5 text-xs transition-transform duration-200 cursor-pointer opacity-50 hover:opacity-100"
                       :class="{'rotate-180': showGroupSuggestions}"
                       @mousedown.prevent="showGroupSuggestions = !showGroupSuggestions"></i>

                    <div v-if="showGroupSuggestions"
                         class="custom-dropdown-menu absolute top-full left-0 w-full mt-1 max-h-40 overflow-y-auto p-1 origin-top animate-[fadeIn_0.1s] z-[100]">

                        <div v-for="g in currentQuickAddGroups" :key="g"
                             @mousedown.prevent="quickAddForm.group = g; showGroupSuggestions = false"
                             class="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer text-sm font-medium transition-colors text-gray-800 dark:text-gray-200">
                            {{ g }}
                        </div>

                        <div v-if="currentQuickAddGroups.length === 0"
                             class="px-3 py-2 opacity-40 text-xs text-center text-gray-800 dark:text-gray-200">
                            暂无分组，直接输入创建
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="quickAddType === 'musician'">
                <label class="text-[10px] font-bold opacity-50 uppercase block mb-1">Default Ratio</label>
                <div class="flex items-center gap-2">
                    <input type="number" v-model="quickAddForm.defaultRatio"
                           class="glass-input w-24 text-center font-mono"
                           @keydown.enter="!$event.isComposing && confirmQuickAdd()">
                    <span class="text-xs opacity-50">x (Efficiency)</span>
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-2 mt-2">
            <button @click="showQuickAddModal=false"
                    class="px-4 py-2 rounded-lg text-sm font-bold opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition">
                Cancel
            </button>
            <button @click="confirmQuickAdd"
                    class="px-6 py-2 rounded-lg text-sm font-bold bg-[#007aff] text-white hover:bg-[#0062cc] transition shadow-lg shadow-blue-500/30">
                Save
            </button>
        </div>
    </div>
</div>
  `,
};
