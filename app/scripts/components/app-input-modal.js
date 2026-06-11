export const AppInputModal = {
  name: 'AppInputModal',
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
<div v-if="showInputModal" class="modal-overlay z-[10000]" @click.self="closeInputModal">
    <div class="modal-window w-[350px] p-6 animate-[fadeIn_0.2s] flex flex-col gap-4">
        <h3 class="font-bold text-lg">{{ inputModalConfig.title }}</h3>

        <div>
            <input :ref="(el) => { universalInputRef = el; }"
                   v-model="inputModalConfig.value"
                   :placeholder="inputModalConfig.placeholder"
                   class="glass-input w-full text-base p-3"
                   @keydown.enter="!$event.isComposing && confirmInputModal()">
            <p v-if="inputModalConfig.hint" class="text-[10px] opacity-50 mt-1.5 ml-1">{{ inputModalConfig.hint
                }}</p>
        </div>

        <div class="flex justify-end gap-2 mt-2">
            <button @click="closeInputModal"
                    class="px-4 py-2 rounded-lg text-sm font-bold opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition">
                取消
            </button>
            <button @click="confirmInputModal"
                    class="px-6 py-2 rounded-lg text-sm font-bold bg-[#007aff] text-white hover:bg-[#0062cc] transition shadow-lg shadow-blue-500/30">
                确定
            </button>
        </div>
    </div>
</div>
  `,
};
