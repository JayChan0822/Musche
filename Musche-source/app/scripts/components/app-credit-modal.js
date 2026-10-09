export const AppCreditModal = {
  name: 'AppCreditModal',
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
<div v-if="showCreditModal" class="modal-overlay z-[5000]" @click.self="showCreditModal=false">
    <div class="modal-window w-[600px] max-w-[95vw] h-[80vh] flex flex-col p-6 animate-[bubblePop_0.2s]">

        <div class="flex justify-between items-center mb-4 shrink-0">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <i class="fa-solid fa-file-signature text-xl"></i>
                </div>
                <div>
                    <h3 class="text-xl font-bold">Project Credits</h3>
                    <p class="text-[10px] opacity-50 uppercase tracking-wider">
                        Tempo: {{ midiBpm }} BPM | Sig: {{ midiTimeSig[0] }}/{{ midiTimeSig[1] }} | Project: {{ managingProject?.name }}
                    </p>
                </div>
            </div>
            <button @click="showCreditModal=false" class="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition">✕</button>
        </div>

        <div class="flex-1 min-h-0 relative bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 overflow-hidden flex flex-col">
            <div class="absolute top-2 right-2 z-10">
                <button @click="copyCreditText" class="px-3 py-1.5 rounded-lg bg-[#007aff] hover:bg-[#0062cc] text-white text-xs font-bold shadow-lg transition flex items-center gap-2">
                    <i class="fa-regular fa-copy"></i> 复制全部
                </button>
            </div>
            <textarea v-model="generatedCreditText"
                      class="w-full h-full bg-transparent p-4 resize-none outline-none font-mono text-xs leading-relaxed text-gray-700 dark:text-gray-300 custom-scrollbar"
                      spellcheck="false"></textarea>
        </div>

        <p class="mt-3 text-[10px] opacity-40 text-center">
            * 名单基于当前日程表(Schedule)中【已排期】的任务自动生成。<br>
            * 请检查并手动补充指挥、乐团名称等未录入信息。
        </p>
    </div>
</div>
  `,
};
