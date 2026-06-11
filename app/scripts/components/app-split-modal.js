export const AppSplitModal = {
  name: 'AppSplitModal',
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
<div v-if="showSplitModal" class="modal-overlay z-[11000]" @click.self="showSplitModal=false">
    <div class="modal-window w-[90vw] sm:w-[400px] p-6 animate-[bubblePop_0.2s] flex flex-col items-center">

        <h3 class="font-bold text-xl mb-1 mt-2">拆分任务</h3>
        <p class="text-xs opacity-50 mb-8">拖动滑块设定分割点</p>

        <div class="flex justify-between items-end w-full mb-6 px-4">
            <div class="flex flex-col items-center">
                <span class="text-[10px] font-bold uppercase tracking-wider text-red-500 opacity-80 mb-1">本次完成</span>
                <span class="text-3xl font-mono font-bold text-red-500">{{ splitState.part1Str }}</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-bold mt-1">PART 1</span>
            </div>

            <i class="fa-solid fa-arrow-right text-gray-300 dark:text-gray-600 mb-4"></i>

            <div class="flex flex-col items-center">
                <span class="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1">留给下次</span>
                <span class="text-3xl font-mono font-bold opacity-60">{{ splitState.part2Str }}</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 opacity-50 font-bold mt-1">PART 2</span>
            </div>
        </div>

        <div class="w-full px-2 mb-8 relative flex items-center justify-center">
            <input type="range"
                   min="0"
                   :max="splitState.totalSec"
                   v-model.number="splitState.splitPoint"
                   @input="onSplitSliderInput"
                   class="custom-slider"
                   :style="{backgroundSize: (splitState.splitPoint / splitState.totalSec * 100) + '% 100%'}"
            >
            <div class="absolute left-2 top-[50%] -translate-y-[50%] h-[12px] bg-red-500 rounded-l-full pointer-events-none z-0"
                 :style="{width: \`calc(\${(splitState.splitPoint / splitState.totalSec * 100)}% - 10px)\`}"></div>
        </div>

        <div class="flex gap-3 w-full">
            <button @click="showSplitModal=false"
                    class="flex-1 py-3 rounded-xl font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 transition text-sm">
                取消
            </button>
            <button @click="confirmSplitSlider"
                    class="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition text-sm">
                确认拆分
            </button>
        </div>

    </div>
</div>
  `,
};
