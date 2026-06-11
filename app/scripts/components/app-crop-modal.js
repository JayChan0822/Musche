export const AppCropModal = {
  name: 'AppCropModal',
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
<div v-if="showCropModal" class="modal-overlay z-[1000]" @click.self="cancelCrop">
    <div class="modal-window w-[500px] max-w-[90vw] p-6 animate-[fadeIn_0.2s] flex flex-col">
        <h3 class="font-bold text-xl mb-4">调整头像</h3>

        <div class="w-full h-[300px] bg-black/5 dark:bg-black/50 rounded-lg mb-6 relative z-10">
            <img ref="cropImgRef" :src="cropImgSrc" class="max-w-full block" style="max-height: 100%;">
        </div>

        <div class="flex justify-end gap-3">
            <button @click="cancelCrop"
                    class="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition">
                取消
            </button>
            <button @click="confirmCrop" :disabled="authLoading"
                    class="px-6 py-2 rounded-lg text-sm font-bold bg-[#007aff] text-white hover:bg-[#0062cc] transition shadow-lg shadow-blue-500/30 flex items-center gap-2">
                <i v-if="authLoading" class="fa-solid fa-circle-notch fa-spin"></i>
                {{ authLoading ? '上传中...' : '确认并上传' }}
            </button>
        </div>
    </div>
</div>
  `,
};
