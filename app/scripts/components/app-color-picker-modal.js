export const AppColorPickerModal = {
  name: 'AppColorPickerModal',
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
<div v-if="showColorPickerModal" class="modal-overlay z-[6000]" @click.self="showColorPickerModal=false">
    <div class="modal-window w-[340px] p-6 animate-[bubblePop_0.2s] flex flex-col gap-5">

        <div class="text-center">
            <h3 class="font-bold text-lg mb-1">选择颜色</h3>
            <p class="text-[10px] opacity-40 uppercase tracking-widest">Color Picker</p>
        </div>

        <div class="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-black/5 dark:border-white/5">
            <div class="w-10 h-10 rounded-full shadow-sm shrink-0 border border-black/10 dark:border-white/10 transition-colors duration-300"
                 :style="{backgroundColor: tempColor}"></div>

            <div class="flex-1 relative">
                <span class="absolute left-3 top-2.5 text-xs font-bold opacity-30">#</span>
                <input v-model="tempColor"
                       class="glass-input w-full pl-6 font-mono uppercase text-sm"
                       maxlength="7">
            </div>
        </div>

        <div class="grid grid-cols-5 gap-3 justify-items-center">
            <button v-for="color in presetColors" :key="color"
                    @click="tempColor = color"
                    class="w-9 h-9 rounded-full shadow-sm border border-black/5 dark:border-white/10 hover:scale-110 active:scale-95 transition-all flex items-center justify-center relative group"
                    :style="{backgroundColor: color}">

                <i v-if="tempColor.toLowerCase() === color.toLowerCase()"
                   class="fa-solid fa-check text-white text-xs drop-shadow-md"></i>
            </button>
        </div>

        <div class="flex items-center gap-3 mt-2">
            <button @click="resetColorPicker"
                    class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 transition flex items-center justify-center shrink-0"
                    title="重置为默认颜色">
                <i class="fa-solid fa-rotate-left"></i>
            </button>

            <button @click="saveColorPicker"
                    class="flex-1 h-10 rounded-xl bg-[#007aff] hover:bg-[#0062cc] text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition">
                Done
            </button>
        </div>

    </div>
</div>
  `,
};
