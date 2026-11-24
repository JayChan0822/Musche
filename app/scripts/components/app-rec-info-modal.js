import { computed, reactive, toRefs, watch } from 'vue';
import { formatRecordingInfoNames, recordingInfoNames, RECORDING_INFO_SEPARATOR } from '../utils/recording-info-names.js';

const fields = [
  { key: 'studio', label: 'Studio' },
  { key: 'engineer', label: 'Engineer' },
  { key: 'operator', label: 'Operator' },
  { key: 'assistant', label: 'Assistant' },
];

export const AppRecInfoModal = {
  name: 'AppRecInfoModal',
  props: {
    ctx: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const ctx = props.ctx;
    const drafts = reactive(Object.fromEntries(fields.map(({ key }) => [key, ''])));
    const prefix = computed(() => ctx.sidebarTab === 'musician' ? 'Recording' : 'Editing');
    const namesFor = (key) => recordingInfoNames(ctx.recInfoForm[key]);
    const availableOptions = computed(() => {
      const selected = new Set(namesFor(ctx.activeRecDropdown).map((name) => name.toLowerCase()));
      return ctx.filteredRecOptions.filter((item) => !selected.has(item.name.toLowerCase()));
    });
    const canCreateOption = computed(() => {
      const search = ctx.recDropdownSearch.trim().toLowerCase();
      return !!search && !ctx.filteredRecOptions.some((item) => item.name.toLowerCase() === search);
    });
    const activate = (key) => {
      ctx.activeRecDropdown = key;
      ctx.recDropdownSearch = drafts[key];
    };
    const clearDraft = (key) => {
      drafts[key] = '';
      if (ctx.activeRecDropdown === key) ctx.recDropdownSearch = '';
    };
    const addDraft = (key, event) => {
      if (event?.isComposing || event?.keyCode === 229) return;
      event?.preventDefault();
      if (!drafts[key].trim()) return;
      ctx.recInfoForm[key] = formatRecordingInfoNames([ctx.recInfoForm[key], drafts[key]].join(RECORDING_INFO_SEPARATOR));
      clearDraft(key);
    };
    const removeName = (key, name) => {
      ctx.recInfoForm[key] = namesFor(key).filter((entry) => entry !== name).join(RECORDING_INFO_SEPARATOR);
    };
    const chooseOption = async (key, item, event) => {
      const input = event.currentTarget.closest('.rec-dropdown-wrapper').querySelector('input');
      if (item) await ctx.selectRecOption(item, key);
      else await ctx.createRecOption(key, drafts[key]);
      clearDraft(key);
      if (input.isConnected && ctx.showRecInfoModal && !ctx.activeRecDropdown) {
        input.focus();
        activate(key);
      }
    };
    const pasteNames = (key, event) => {
      const text = event.clipboardData?.getData('text');
      if (!text || !/[\r\n]/.test(text)) return;
      event.preventDefault();
      drafts[key] = [drafts[key], text].join(RECORDING_INFO_SEPARATOR);
      addDraft(key);
    };
    const save = () => {
      fields.forEach(({ key }) => addDraft(key));
      return ctx.saveRecInfo();
    };
    watch(() => ctx.showRecInfoModal, (open) => {
      if (!open) fields.forEach(({ key }) => clearDraft(key));
    });
    return { ...toRefs(ctx), fields, drafts, prefix, namesFor, availableOptions, canCreateOption, activate, addDraft, removeName, chooseOption, pasteNames, save };
  },
  template: `
<div v-if="showRecInfoModal" class="modal-overlay z-[12000]" @click.self="showRecInfoModal=false">
    <div class="rec-info-modal modal-window w-[380px] max-w-[calc(100%-24px)] max-h-[calc(100dvh-24px)] overflow-y-auto p-5 sm:p-6 animate-[bubblePop_0.2s] flex flex-col gap-4"
         role="dialog" aria-modal="true" aria-labelledby="rec-info-title">
        <div class="flex items-center gap-2 mb-1">
            <div class="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <i class="fa-solid" :class="sidebarTab === 'musician' ? 'fa-microphone-lines' : 'fa-sliders'" aria-hidden="true"></i>
            </div>
            <div>
                <h3 id="rec-info-title" class="font-bold text-lg leading-none">{{ prefix }} Info</h3>
                <p class="text-[10px] opacity-40 uppercase tracking-wider">Session Details</p>
            </div>
        </div>

        <div class="space-y-3">
            <div v-for="field in fields" :key="field.key" :data-rec-info-field="field.key" class="rec-dropdown-wrapper relative"
                 :class="{'z-20': activeRecDropdown === field.key}">
                <label :for="'rec-info-' + field.key" class="text-[10px] font-bold opacity-50 uppercase block mb-1 ml-1">
                    {{ prefix }} {{ field.label }}
                </label>
                <ul v-if="namesFor(field.key).length" class="flex flex-wrap gap-1.5 mb-1.5">
                    <li v-for="name in namesFor(field.key)" :key="name" class="flex items-center min-w-0 max-w-full gap-1 rounded-lg bg-blue-500/10 px-2 py-1 text-xs">
                        <span class="break-all">{{ name }}</span>
                        <button type="button" :aria-label="'移除 ' + name" @click="removeName(field.key, name)"
                                class="w-5 h-5 shrink-0 flex items-center justify-center rounded hover:bg-black/10 dark:hover:bg-white/15">
                            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                        </button>
                    </li>
                </ul>
                <div class="relative">
                    <input :id="'rec-info-' + field.key" v-model="drafts[field.key]" class="glass-input w-full !text-base sm:!text-sm !pr-10"
                           type="text" placeholder="选择或输入名称" autocomplete="off"
                           @focus="activate(field.key)" @click="activate(field.key)"
                           @input="activeRecDropdown = field.key; recDropdownSearch = $event.target.value"
                           @keydown.enter="addDraft(field.key, $event)" @paste="pasteNames(field.key, $event)">
                    <button v-if="drafts[field.key].trim()" type="button" :aria-label="'添加 ' + prefix + ' ' + field.label"
                            @mousedown.prevent @click="addDraft(field.key)"
                            class="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg text-[#007aff] hover:bg-blue-500/10">
                        <i class="fa-solid fa-plus" aria-hidden="true"></i>
                    </button>
                    <i v-else class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] opacity-30 pointer-events-none"
                       aria-hidden="true" :class="{'rotate-180': activeRecDropdown === field.key}"></i>

                    <div v-if="activeRecDropdown === field.key && (availableOptions.length || canCreateOption)"
                         class="custom-dropdown-menu !z-[13000] !max-h-40">
                        <button v-for="item in availableOptions" :key="item.id" type="button" @mousedown.prevent @click="chooseOption(field.key, item, $event)"
                                class="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-xs font-bold">{{ item.name }}</button>
                        <button v-if="canCreateOption"
                                type="button" @mousedown.prevent @click="chooseOption(field.key, null, $event)"
                                class="w-full text-left px-3 py-2 mb-1 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 text-xs font-bold break-all">
                            创建「{{ recDropdownSearch.trim() }}」
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <label for="rec-info-notes" class="text-[10px] font-bold opacity-50 uppercase block mb-1 ml-1">Other Information</label>
                <textarea id="rec-info-notes" v-model="recInfoForm.notes"
                          class="glass-input w-full !text-base sm:!text-sm min-h-[80px] resize-none"
                          placeholder="备忘录、注意事项..." @keydown.ctrl.enter="save"></textarea>
            </div>
        </div>

        <div class="relative z-30 flex justify-end gap-2 mt-2">
            <button @click="showRecInfoModal=false"
                    class="px-4 py-2 rounded-lg text-sm font-bold opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition">
                取消
            </button>
            <button @click="save"
                    class="px-6 py-2 rounded-lg text-sm font-bold bg-[#007aff] text-white hover:bg-[#0062cc] transition shadow-lg shadow-blue-500/30 flex items-center gap-2">
                <i class="fa-solid fa-check" aria-hidden="true"></i> 保存
            </button>
        </div>
    </div>
</div>
  `,
};
