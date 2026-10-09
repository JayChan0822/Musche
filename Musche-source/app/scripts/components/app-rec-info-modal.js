export const AppRecInfoModal = {
  name: 'AppRecInfoModal',
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
<div v-if="showRecInfoModal" class="modal-overlay z-[12000]" @click.self="showRecInfoModal=false">
    <div class="modal-window w-[350px] p-6 animate-[bubblePop_0.2s] flex flex-col gap-4">

        <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <i class="fa-solid" :class="sidebarTab === 'musician' ? 'fa-microphone-lines' : 'fa-sliders'"></i>
            </div>
            <div>
                <h3 class="font-bold text-lg leading-none">
                    {{ sidebarTab === 'musician' ? 'Recording Info' : 'Editing Info' }}
                </h3>
                <p class="text-[10px] opacity-40 uppercase tracking-wider">Session Details</p>
            </div>
        </div>

        <div class="space-y-3">
            <div class="rec-dropdown-wrapper relative z-50">
                <label class="text-[10px] font-bold opacity-50 uppercase block mb-1 ml-1">
                    {{ sidebarTab === 'musician' ? 'Recording Studio' : 'Editing Studio' }}
                </label>
                <div class="relative">
                    <input v-model="recInfoForm.studio"
                           class="glass-input w-full text-sm pr-8"
                           placeholder="Select or type..."
                           @focus="activeRecDropdown = 'studio'; recDropdownSearch = ''"
                           @input="activeRecDropdown = 'studio'; recDropdownSearch = $event.target.value"
                    >
                    <i class="fa-solid fa-chevron-down absolute right-3 top-3 text-[10px] opacity-30 pointer-events-none transition-transform"
                       :class="{'rotate-180': activeRecDropdown === 'studio'}"></i>

                    <div v-if="activeRecDropdown === 'studio'" class="custom-dropdown-menu !z-[13000] absolute top-full left-0 w-full mt-1 max-h-40 overflow-y-auto p-1 origin-top animate-[fadeIn_0.1s] shadow-xl border border-black/5 dark:border-white/10">
                        <div v-for="item in filteredRecOptions" :key="item.id" @mousedown.prevent="selectRecOption(item)" class="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer text-xs font-bold transition-colors">{{ item.name }}</div>
                        <div v-if="recDropdownSearch && !filteredRecOptions.some(i => i.name === recDropdownSearch)" @mousedown.prevent="createRecOption" class="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 cursor-pointer text-xs font-bold transition-colors flex items-center gap-2"><i class="fa-solid fa-plus"></i> 创建 "{{ recDropdownSearch }}"</div>
                    </div>
                </div>
            </div>

            <div class="rec-dropdown-wrapper relative z-40">
                <label class="text-[10px] font-bold opacity-50 uppercase block mb-1 ml-1">
                    {{ sidebarTab === 'musician' ? 'Recording Engineer' : 'Editing Engineer' }}
                </label>
                <div class="relative">
                    <input v-model="recInfoForm.engineer" class="glass-input w-full text-sm pr-8" placeholder="Name"
                           @focus="activeRecDropdown = 'engineer'; recDropdownSearch = ''"
                           @input="activeRecDropdown = 'engineer'; recDropdownSearch = $event.target.value"
                    >
                    <i class="fa-solid fa-chevron-down absolute right-3 top-3 text-[10px] opacity-30 pointer-events-none transition-transform" :class="{'rotate-180': activeRecDropdown === 'engineer'}"></i>
                    <div v-if="activeRecDropdown === 'engineer'" class="custom-dropdown-menu !z-[13000] absolute top-full left-0 w-full mt-1 max-h-40 overflow-y-auto p-1 origin-top animate-[fadeIn_0.1s] shadow-xl border border-black/5 dark:border-white/10">
                        <div v-for="item in filteredRecOptions" :key="item.id" @mousedown.prevent="selectRecOption(item)" class="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer text-xs font-bold transition-colors">{{ item.name }}</div>
                        <div v-if="recDropdownSearch && !filteredRecOptions.some(i => i.name === recDropdownSearch)" @mousedown.prevent="createRecOption" class="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 cursor-pointer text-xs font-bold transition-colors flex items-center gap-2"><i class="fa-solid fa-plus"></i> 创建 "{{ recDropdownSearch }}"</div>
                    </div>
                </div>
            </div>

            <div class="rec-dropdown-wrapper relative z-30">
                <label class="text-[10px] font-bold opacity-50 uppercase block mb-1 ml-1">
                    {{ sidebarTab === 'musician' ? 'Recording Operator' : 'Editing Operator' }}
                </label>
                <div class="relative">
                    <input v-model="recInfoForm.operator" class="glass-input w-full text-sm pr-8" placeholder="Name"
                           @focus="activeRecDropdown = 'operator'; recDropdownSearch = ''"
                           @input="activeRecDropdown = 'operator'; recDropdownSearch = $event.target.value"
                    >
                    <i class="fa-solid fa-chevron-down absolute right-3 top-3 text-[10px] opacity-30 pointer-events-none transition-transform" :class="{'rotate-180': activeRecDropdown === 'operator'}"></i>
                    <div v-if="activeRecDropdown === 'operator'" class="custom-dropdown-menu !z-[13000] absolute top-full left-0 w-full mt-1 max-h-40 overflow-y-auto p-1 origin-top animate-[fadeIn_0.1s] shadow-xl border border-black/5 dark:border-white/10">
                        <div v-for="item in filteredRecOptions" :key="item.id" @mousedown.prevent="selectRecOption(item)" class="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer text-xs font-bold transition-colors">{{ item.name }}</div>
                        <div v-if="recDropdownSearch && !filteredRecOptions.some(i => i.name === recDropdownSearch)" @mousedown.prevent="createRecOption" class="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 cursor-pointer text-xs font-bold transition-colors flex items-center gap-2"><i class="fa-solid fa-plus"></i> 创建 "{{ recDropdownSearch }}"</div>
                    </div>
                </div>
            </div>

            <div class="rec-dropdown-wrapper relative z-20">
                <label class="text-[10px] font-bold opacity-50 uppercase block mb-1 ml-1">
                    {{ sidebarTab === 'musician' ? 'Recording Assistant' : 'Editing Assistant' }}
                </label>
                <div class="relative">
                    <input v-model="recInfoForm.assistant" class="glass-input w-full text-sm pr-8" placeholder="Name"
                           @focus="activeRecDropdown = 'assistant'; recDropdownSearch = ''"
                           @input="activeRecDropdown = 'assistant'; recDropdownSearch = $event.target.value"
                    >
                    <i class="fa-solid fa-chevron-down absolute right-3 top-3 text-[10px] opacity-30 pointer-events-none transition-transform" :class="{'rotate-180': activeRecDropdown === 'assistant'}"></i>
                    <div v-if="activeRecDropdown === 'assistant'" class="custom-dropdown-menu !z-[13000] absolute top-full left-0 w-full mt-1 max-h-40 overflow-y-auto p-1 origin-top animate-[fadeIn_0.1s] shadow-xl border border-black/5 dark:border-white/10">
                        <div v-for="item in filteredRecOptions" :key="item.id" @mousedown.prevent="selectRecOption(item)" class="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer text-xs font-bold transition-colors">{{ item.name }}</div>
                        <div v-if="recDropdownSearch && !filteredRecOptions.some(i => i.name === recDropdownSearch)" @mousedown.prevent="createRecOption" class="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 cursor-pointer text-xs font-bold transition-colors flex items-center gap-2"><i class="fa-solid fa-plus"></i> 创建 "{{ recDropdownSearch }}"</div>
                    </div>
                </div>
            </div>

            <div class="relative z-10">
                <label class="text-[10px] font-bold opacity-50 uppercase block mb-1 ml-1">Other Information</label>
                <textarea v-model="recInfoForm.notes"
                          class="glass-input w-full text-sm min-h-[80px] resize-none"
                          placeholder="备忘录、注意事项..."
                          @keydown.ctrl.enter="saveRecInfo"></textarea>
            </div>
        </div>

        <div class="flex justify-end gap-2 mt-2">
            <button @click="showRecInfoModal=false"
                    class="px-4 py-2 rounded-lg text-sm font-bold opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition">
                取消
            </button>
            <button @click="saveRecInfo"
                    class="px-6 py-2 rounded-lg text-sm font-bold bg-[#007aff] text-white hover:bg-[#0062cc] transition shadow-lg shadow-blue-500/30 flex items-center gap-2">
                <i class="fa-solid fa-check"></i> 保存
            </button>
        </div>
    </div>
</div>
  `,
};
