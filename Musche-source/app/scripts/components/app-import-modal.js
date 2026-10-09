export const AppImportModal = {
  name: 'AppImportModal',
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
<div v-if="showImportModal" class="modal-overlay z-[4000]" @click.self="showImportModal=false">
    <div class="modal-window w-[400px] p-8 animate-[bubblePop_0.2s] flex flex-col items-center text-center">

        <h3 class="text-xl font-bold mb-2">恢复数据</h3>
        <p class="text-xs opacity-50 mb-6 max-w-[260px] leading-relaxed">
            请选择之前导出的 .json 备份文件。<br>注意：这将覆盖当前的日程安排。
        </p>

        <div @click="triggerFileSelect"
             class="w-full h-32 rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer flex flex-col items-center justify-center gap-2 group relative overflow-hidden">

            <i class="fa-solid fa-file-import text-6xl absolute opacity-[0.03] group-hover:scale-110 transition-transform duration-500"></i>

            <div class="w-12 h-12 rounded-full bg-blue-500/10 text-[#007aff] flex items-center justify-center text-xl mb-1 group-hover:scale-110 transition-transform">
                <i class="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <span class="text-sm font-bold opacity-70 group-hover:opacity-100 transition">点击选择文件</span>
            <span class="text-[10px] font-mono opacity-40 uppercase">Support: .JSON</span>
        </div>

        <div class="flex gap-3 w-full mt-6">
            <button @click="showImportModal=false"
                    class="flex-1 py-3 rounded-xl font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition text-sm">
                取消
            </button>
        </div>
    </div>
</div>
  `,
};
