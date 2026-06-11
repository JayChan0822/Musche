export const AppConfirmModal = {
  name: 'AppConfirmModal',
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
<div v-if="showConfirmModal" class="modal-overlay z-[9999]"
     @click.self="!confirmModalConfig.isAlert && closeConfirmModal()">

    <div class="modal-window w-[90vw] sm:w-[500px] max-h-[80vh] p-6 animate-[bubblePop_0.2s] flex flex-col gap-4 text-center">

        <div class="shrink-0">
            <div class="flex justify-center mb-2">
                <div v-if="confirmModalConfig.isDestructive"
                     class="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-2xl">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div v-else-if="confirmModalConfig.isAlert"
                     class="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-2xl">
                    <i class="fa-solid fa-circle-info"></i>
                </div>
                <div v-else
                     class="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 text-2xl">
                    <i class="fa-solid fa-circle-question"></i>
                </div>
            </div>

            <h3 class="font-bold text-lg leading-tight">{{ confirmModalConfig.title }}</h3>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar w-full bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5 text-left p-3 min-h-0">
            <p class="text-sm opacity-70 whitespace-pre-wrap leading-relaxed font-mono text-xs break-all">
                {{ confirmModalConfig.content }}
            </p>
        </div>

        <div class="flex gap-3 justify-center shrink-0 mt-2">
            <button v-if="!confirmModalConfig.isAlert"
                    @click="closeConfirmModal"
                    class="flex-1 py-2.5 rounded-xl font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition text-sm">
                {{ confirmModalConfig.cancelText || '取消' }}
            </button>

            <button @click="handleConfirmAction"
                    class="flex-1 py-2.5 rounded-xl font-bold text-white shadow-lg transition text-sm flex items-center justify-center gap-2"
                    :class="confirmModalConfig.isDestructive ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-[#007aff] hover:bg-[#0062cc] shadow-blue-500/30'">
                {{ confirmModalConfig.confirmText || '确定' }}
            </button>
        </div>
    </div>
</div>
  `,
};
