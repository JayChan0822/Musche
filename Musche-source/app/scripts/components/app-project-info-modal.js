export const AppProjectInfoModal = {
  name: 'AppProjectInfoModal',
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
<div v-if="showProjectInfoModal" class="modal-overlay z-[20000]" @click.self="showProjectInfoModal = false">

    <div class="modal-window w-full max-w-2xl bg-[#f0f2f5] dark:bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-[scaleIn_0.2s_ease-out]">

        <div class="px-6 py-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#252525]">
            <h3 class="text-lg font-bold flex items-center gap-2">
                <i class="fa-solid fa-compact-disc text-blue-500"></i>
                Project Metadata
            </h3>
            <button @click="showProjectInfoModal = false" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div class="space-y-6">

                <div class="space-y-4">
                    <h4 class="text-xs font-bold uppercase opacity-50 tracking-wider">Basic Information</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-[10px] uppercase font-bold opacity-50">Title (Track Name)</label>
                            <input v-model="projectInfoForm.title" class="glass-input w-full h-10 px-3 rounded-xl" placeholder="e.g. Symphony No.5">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[10px] uppercase font-bold opacity-50">Composer</label>
                            <input v-model="projectInfoForm.composer" class="glass-input w-full h-10 px-3 rounded-xl" placeholder="Composer Name">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[10px] uppercase font-bold opacity-50">Arranger</label>
                            <input v-model="projectInfoForm.arranger" class="glass-input w-full h-10 px-3 rounded-xl" placeholder="Arranger Name">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[10px] uppercase font-bold opacity-50">Music Producer</label>
                            <input v-model="projectInfoForm.producer" class="glass-input w-full h-10 px-3 rounded-xl" placeholder="Producer Name">
                        </div>
                    </div>
                </div>

                <hr class="border-black/5 dark:border-white/5">

                <div class="space-y-4">
                    <h4 class="text-xs font-bold uppercase opacity-50 tracking-wider">Audio Engineering</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-[10px] uppercase font-bold opacity-50">Mixing Engineer</label>
                            <input v-model="projectInfoForm.mixingEngineer" class="glass-input w-full h-10 px-3 rounded-xl" placeholder="Name">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[10px] uppercase font-bold opacity-50">Mixing Studio</label>
                            <input v-model="projectInfoForm.mixingStudio" class="glass-input w-full h-10 px-3 rounded-xl" placeholder="Studio Name">
                        </div>

                        <div class="space-y-1">
                            <label class="text-[10px] uppercase font-bold opacity-50">Mastering Engineer</label>
                            <input v-model="projectInfoForm.masteringEngineer" class="glass-input w-full h-10 px-3 rounded-xl" placeholder="Name">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[10px] uppercase font-bold opacity-50">Mastering Studio</label>
                            <input v-model="projectInfoForm.masteringStudio" class="glass-input w-full h-10 px-3 rounded-xl" placeholder="Studio Name">
                        </div>
                    </div>

                    <div class="space-y-1 pt-2">
                        <label class="text-[10px] uppercase font-bold opacity-50 flex items-center gap-1">
                            <span class="bg-black text-white dark:bg-white dark:text-black text-[9px] px-1 rounded">ATMOS</span>
                            Dolby Atmos Mastering Studio
                        </label>
                        <input v-model="projectInfoForm.dolbyStudio" class="glass-input w-full h-10 px-3 rounded-xl" placeholder="Dolby Studio Name">
                    </div>
                </div>

                <hr class="border-black/5 dark:border-white/5">

                <div class="space-y-4">
                    <h4 class="text-xs font-bold uppercase opacity-50 tracking-wider">Copyright & Production</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-[10px] uppercase font-bold opacity-50">Published By (Company)</label>
                            <input v-model="projectInfoForm.publishedBy" class="glass-input w-full h-10 px-3 rounded-xl" placeholder="Publisher / Label">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[10px] uppercase font-bold opacity-50">Produced By (Organization)</label>
                            <input v-model="projectInfoForm.producedBy" class="glass-input w-full h-10 px-3 rounded-xl" placeholder="Production Company / Client">
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <div class="p-4 border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 flex justify-end gap-3">
            <button @click="showProjectInfoModal = false" class="px-5 py-2.5 rounded-xl text-sm font-bold opacity-60 hover:bg-black/5 dark:hover:bg-white/10 transition">
                Cancel
            </button>
            <button @click="saveProjectInfo" class="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#007aff] text-white shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition">
                Save Metadata
            </button>
        </div>
    </div>
</div>
  `,
};
