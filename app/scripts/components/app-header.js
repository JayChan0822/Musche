export const AppHeader = {
  name: 'AppHeader',
  props: {
    ctx: {
      type: Object,
      required: true,
    },
  },
  template: `
        <header class="h-16 flex items-center gap-2 px-2 sm:px-6 border-b border-glass-border dark:border-glass-borderDark z-50 shrink-0 relative transition-colors duration-300 dark:bg-black/40">

            <div class="flex items-center gap-2 sm:gap-5 z-50 relative shrink-0">

                <div class="relative custom-select-container">
                    <button @click.stop="ctx.toggleMobileMenu"
                            class="w-11 h-11 rounded-full bg-white/40 dark:bg-black/20 border border-white/20 shadow-sm hover:bg-white/60 dark:hover:bg-black/30 flex items-center justify-center transition group backdrop-blur-md">
                        <i class="fa-solid fa-bars text-lg opacity-70"></i>
                    </button>

                    <div v-if="ctx.showMobileMenu"
                         class="menu-shortcuts-dropdown custom-dropdown-menu w-48 absolute top-full left-0 mt-2 p-1.5 flex flex-col gap-1 bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-xl origin-top-left text-left">

                        <button @click="ctx.toggleTheme"
                                class="flex items-center gap-3 px-3 py-3.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition text-sm font-bold w-full">
                            <div class="w-6 flex justify-center text-lg transition-colors"
                                 :class="{
                                         'text-blue-500': ctx.themeMode === 'auto',
                                         'text-yellow-500': ctx.themeMode === 'light',
                                         'text-purple-400': ctx.themeMode === 'dark'
                                     }">
                                <i class="fa-solid" :class="ctx.getThemeLabel.icon"></i>
                            </div>
                            <div class="flex flex-col items-start leading-none gap-0.5">
                                <span>{{ ctx.getThemeLabel.text }}</span>
                                <span class="text-[9px] opacity-40 font-normal uppercase tracking-wider">{{ ctx.themeMode }}</span>
                            </div>
                        </button>

                        <button @click="ctx.openSettings"
                                class="flex items-center gap-3 px-3 py-3.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition text-sm font-bold w-full">
                            <div class="w-6 flex justify-center text-gray-500 dark:text-gray-400 text-lg"><i
                                    class="fa-solid fa-gear"></i></div>
                            <span>设置选项</span>
                        </button>

                        <!-- 手机端专属：header 里放不下的同步/撤销/重做/引导 -->
                        <div class="sm:hidden h-px bg-black/5 dark:bg-white/5 my-1 mx-2"></div>

                        <button @click="ctx.handleManualSync(); ctx.showMobileMenu=false"
                                :disabled="ctx.isSyncing"
                                class="sm:hidden flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition text-sm font-bold w-full disabled:opacity-50">
                            <div class="w-6 flex justify-center text-lg text-[#007aff]">
                                <i class="fa-solid fa-cloud-arrow-down" :class="{'fa-bounce': ctx.isSyncing}"></i>
                            </div>
                            <div class="flex flex-col items-start leading-none gap-0.5">
                                <span>立即同步</span>
                                <span class="text-[9px] opacity-40 font-normal uppercase tracking-wider">
                                    {{ !ctx.user ? '未登录' : (ctx.saveStatus==='saved' ? '已同步' : (ctx.saveStatus==='saving' ? '正在保存...' : '有未保存更改')) }}
                                </span>
                            </div>
                        </button>

                        <div class="sm:hidden flex gap-1">
                            <button @click="ctx.undo" :disabled="ctx.historyIndex <= 0"
                                    class="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition text-sm font-bold disabled:opacity-30">
                                <i class="fa-solid fa-rotate-left"></i> 撤销
                            </button>
                            <button @click="ctx.redo" :disabled="ctx.historyIndex >= ctx.history.length - 1"
                                    class="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition text-sm font-bold disabled:opacity-30">
                                <i class="fa-solid fa-rotate-right"></i> 重做
                            </button>
                        </div>

                        <button @click="ctx.startTour(); ctx.showMobileMenu=false"
                                class="sm:hidden flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition text-sm font-bold w-full">
                            <div class="w-6 flex justify-center text-gray-500 dark:text-gray-400 text-lg">
                                <i class="fa-solid fa-circle-question"></i>
                            </div>
                            <span>新手引导</span>
                        </button>

                        <div class="h-px bg-black/5 dark:bg-white/5 my-1 mx-2"></div>

                        <button @click="ctx.exportCSV(); ctx.showMobileMenu=false"
                                class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition text-sm font-bold w-full">
                            <div class="w-5 flex justify-center text-teal-500"><i
                                    class="fa-solid fa-table"></i></div>
                            <span>导出表格 (Excel)</span>
                        </button>

                        <button @click="ctx.exportToICS(); ctx.showMobileMenu=false"
                                class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition text-sm font-bold w-full">
                            <div class="w-5 flex justify-center text-[#007aff]"><i
                                    class="fa-regular fa-calendar-check"></i></div>
                            <span>导出 ICS 日历</span>
                        </button>

                        <button @click="ctx.exportJSON(); ctx.showMobileMenu=false"
                                class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition text-sm font-bold w-full">
                            <div class="w-5 flex justify-center text-orange-500"><i class="fa-solid fa-download"></i>
                            </div>
                            <span>备份数据 (JSON)</span>
                        </button>

                        <button @click="ctx.importJSON(); ctx.showMobileMenu=false"
                                class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition text-sm font-bold w-full">
                            <div class="w-5 flex justify-center text-green-500"><i class="fa-solid fa-upload"></i></div>
                            <span>恢复数据 (JSON)</span>
                        </button>

                        <button @click="ctx.openCreditModal(); ctx.showMobileMenu=false"
                                class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition text-sm font-bold w-full">
                            <div class="w-5 flex justify-center text-purple-500"><i class="fa-solid fa-file-contract"></i></div>
                            <span>导出 Credit</span>
                        </button>
                    </div>
                </div>

                <h1 class="text-xl ml-3 mr-2 hidden lg:block select-none tracking-[0.1em]"
                    style="font-family: 'Chango', sans-serif; font-weight: 400;">
                        <span class="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-400 dark:from-white dark:to-gray-500">
                            MUSCHE
                        </span>
                </h1>

                <!-- 同步/撤销/重做：手机端收进汉堡菜单，只在桌面端常驻 -->
                <div class="hidden sm:flex items-center ml-1 gap-1 sm:gap-2">
                    <button id="tour-sync-btn"
                            @click="ctx.handleManualSync"
                            :disabled="ctx.isSyncing"
                            class="w-11 h-11 sm:w-9 sm:h-9 rounded-md hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition disabled:opacity-50 group relative"
                            :title="!ctx.user ? '未登录' : (ctx.saveStatus==='saved'?'已同步':(ctx.saveStatus==='saving'?'正在保存...':'有未保存更改'))">

                        <i class="fa-solid fa-cloud-arrow-down text-lg sm:text-base opacity-80"
                           :class="{'fa-bounce': ctx.isSyncing}"></i>

                        <div v-if="!ctx.user"
                             class="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white/50 dark:border-black/50">
                        </div>

                        <div v-else
                             class="absolute top-2 right-2 w-2 h-2 rounded-full transition-all duration-300 border border-white/80 dark:border-black/50 shadow-sm"
                             :class="{
                                 'bg-green-500 scale-100': ctx.saveStatus === 'saved',
                                 'bg-orange-500 scale-110': ctx.saveStatus === 'unsaved',
                                 'bg-[#007aff] scale-110 animate-pulse': ctx.saveStatus === 'saving',
                                 'bg-red-600': ctx.saveStatus === 'error'
                             }">
                        </div>
                    </button>
                    <button @click="ctx.undo" :disabled="ctx.historyIndex <= 0"
                            class="w-11 h-11 sm:w-9 sm:h-9 rounded-md hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition disabled:opacity-30">
                        <i class="fa-solid fa-rotate-left text-lg"></i>
                    </button>
                    <button @click="ctx.redo" :disabled="ctx.historyIndex >= ctx.history.length - 1"
                            class="w-11 h-11 sm:w-9 sm:h-9 rounded-md hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition disabled:opacity-30">
                        <i class="fa-solid fa-rotate-right text-lg"></i>
                    </button>
                </div>
            </div>

            <div class="flex-1 flex justify-center px-2 min-w-0 z-40">
                <div id="tour-session-select" class="relative custom-select-container w-full max-w-[260px] min-w-0 sm:min-w-[180px]">
                    <button @mousedown.stop="ctx.toggleDropdown('session')"
                            class="flex items-center justify-between gap-2 bg-white/50 dark:bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-glass-border dark:border-glass-borderDark hover:bg-white/80 dark:hover:bg-white/10 transition h-11 w-full shadow-sm group cursor-pointer">

                        <div class="flex items-center gap-2 overflow-hidden flex-1 min-w-0 justify-center sm:justify-start">
                            <i class="fa-solid fa-layer-group text-xs opacity-50 group-hover:text-[#007aff] transition-colors shrink-0"></i>
                            <span class="text-sm font-bold truncate">{{ ctx.currentSessionName }}</span>
                        </div>

                        <i class="fa-solid fa-chevron-down text-[10px] opacity-50 transition-transform duration-300 shrink-0 ml-1"
                           :class="{'rotate-180': ctx.activeDropdown==='session'}"></i>
                    </button>

                    <div v-if="ctx.activeDropdown === 'session'"
                         class="custom-dropdown-menu !w-64 absolute top-full left-0 mt-2 shadow-2xl ring-1 ring-black/5 origin-top">
                        <div class="px-3 py-2 text-[10px] uppercase font-bold opacity-50 tracking-wider border-b border-black/5 dark:border-white/5 text-left">
                            Switch Session
                        </div>
                        <div class="max-h-60 overflow-y-auto py-1 text-left">
                            <div v-for="s in ctx.settings.sessions" :key="s.id"
                                 @mousedown.prevent.stop="ctx.switchSession(s.id)"
                                 class="px-4 py-2.5 text-sm hover:bg-[#007aff] hover:text-white cursor-pointer flex justify-between items-center group transition-colors">
                                <span class="font-medium truncate">{{ s.name }}</span>
                                <i v-if="ctx.currentSessionId === s.id" class="fa-solid fa-check text-xs"></i>
                            </div>
                        </div>
                        <div class="p-2 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 grid grid-cols-1 gap-1">
                            <button @mousedown.prevent.stop="ctx.handleSessionAction('new')"
                                    class="text-left px-3 py-2 text-xs font-bold rounded-md hover:bg-white dark:hover:bg-white/10 flex items-center gap-2 transition cursor-pointer">
                                <i class="fa-solid fa-plus text-green-500"></i> New Session
                            </button>
                            <button @mousedown.prevent.stop="ctx.handleSessionAction('rename')"
                                    class="text-left px-3 py-2 text-xs font-bold rounded-md hover:bg-white dark:hover:bg-white/10 flex items-center gap-2 transition cursor-pointer">
                                <i class="fa-solid fa-pen text-orange-500"></i> Rename
                            </button>
                            <button @mousedown.prevent.stop="ctx.handleSessionAction('delete')"
                                    class="text-left px-3 py-2 text-xs font-bold rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 flex items-center gap-2 transition cursor-pointer">
                                <i class="fa-solid fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="desktop-search-shell hidden sm:flex items-center relative ml-4 mr-2 group">
                <i class="fa-solid fa-magnifying-glass absolute left-3.5 text-gray-400 text-xs group-focus-within:text-[#007aff] transition-colors"></i>

                <input v-model="ctx.globalSearchQuery"
                       @keydown.enter="ctx.handleSearchEnter" class="desktop-search-input glass-input h-9 pr-8 w-40 focus:w-60 transition-all duration-300 text-xs font-bold bg-white/40 dark:bg-black/20 focus:bg-white dark:focus:bg-white/10 rounded-full"
                       placeholder="Search..."
                >

                <button v-if="ctx.globalSearchQuery"
                        @click="ctx.globalSearchQuery = ''"
                        class="absolute right-2 w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer">
                    <i class="fa-solid fa-xmark text-[10px]"></i>
                </button>
            </div>

            <div class="flex items-center gap-2 sm:gap-3 z-50 relative shrink-0">

                <div class="relative z-50 user-menu-container">
                    <button id="tour-user-btn"
                            @click="ctx.handleUserBtnClick"
                            class="relative flex items-center justify-center w-11 h-11 rounded-full transition border cursor-pointer select-none overflow-hidden shrink-0"
                            :class="ctx.user ? 'bg-transparent border-transparent' : 'bg-gray-500/10 text-gray-600 border-gray-500/20 border'">

                        <div v-if="ctx.user && ctx.userAvatar" class="w-full h-full bg-cover bg-center"
                             :style="{backgroundImage: 'url(' + ctx.userAvatar + ')'}"></div>
                        <i v-else class="fa-solid text-lg"
                           :class="ctx.user ? 'fa-user-check text-green-600' : 'fa-user'"></i>
                    </button>

                    <!-- 手机端同步状态：同步按钮已收进汉堡菜单，状态点挂到头像上 -->
                    <div class="sm:hidden absolute top-0 right-0 w-2.5 h-2.5 rounded-full transition-all duration-300 border border-white/80 dark:border-black/60 shadow-sm pointer-events-none"
                         :class="!ctx.user ? 'bg-red-500' : {
                             'bg-green-500': ctx.saveStatus === 'saved',
                             'bg-orange-500': ctx.saveStatus === 'unsaved',
                             'bg-[#007aff] animate-pulse': ctx.saveStatus === 'saving',
                             'bg-red-600': ctx.saveStatus === 'error'
                         }"></div>

                    <div v-if="ctx.showProfileMenu && ctx.user"
                         class="custom-dropdown-menu mobile-user-menu w-72 absolute top-full right-0 mt-2 p-4 flex flex-col gap-4 cursor-default text-left max-h-none">

                        <div class="flex items-center gap-4 border-b border-black/5 dark:border-white/5 pb-4">
                            <div class="w-16 h-16 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center overflow-hidden border-2 border-white/20 shadow-inner relative shrink-0">
                                <div v-if="ctx.userAvatar" class="absolute inset-0 bg-cover bg-center"
                                     :style="{backgroundImage: 'url(' + ctx.userAvatar + ')'}"></div>
                                <span v-else class="text-2xl font-bold opacity-30">{{ ctx.user.email[0].toUpperCase() }}</span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="font-bold text-base truncate">{{ ctx.userDisplayName }}</div>
                                <div class="text-xs opacity-50 truncate">{{ ctx.user.email }}</div>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="text-[10px] uppercase font-bold opacity-50 tracking-wider">设置昵称</label>
                            <div class="flex gap-2">
                                <input v-model="ctx.tempNickname"
                                       placeholder="输入新昵称"
                                       class="glass-input flex-1 min-w-0 h-9 text-sm"
                                       @keydown.enter="ctx.updateNickname">

                                <button @click="ctx.updateNickname"
                                        :disabled="ctx.authLoading"
                                        class="bg-[#007aff] hover:bg-[#0062cc] text-white rounded-lg px-3 h-9 text-xs font-bold transition flex items-center justify-center shadow-lg shadow-blue-500/30 disabled:opacity-50 shrink-0">
                                    <i v-if="ctx.authLoading" class="fa-solid fa-circle-notch fa-spin"></i>
                                    <span v-else>保存</span>
                                </button>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="text-[10px] uppercase font-bold opacity-50 tracking-wider">上传头像</label>
                            <div class="flex gap-2 items-center">
                                <label class="flex-1 cursor-pointer bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition rounded-lg h-9 flex items-center justify-center text-xs font-bold gap-2 text-gray-600 dark:text-gray-300 border border-transparent">
                                    <i class="fa-solid fa-cloud-arrow-up"></i>
                                    <span id="upload-text">选择图片...</span>
                                    <input type="file" accept="image/*" class="hidden" @change="ctx.onFileSelect">
                                </label>
                            </div>
                            <p class="text-[10px] opacity-40 leading-tight">支持 JPG, PNG, GIF。</p>
                        </div>

                        <button @click="ctx.handleLogout"
                                class="w-full py-2.5 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/10 transition text-sm font-bold flex items-center justify-center gap-2">
                            <i class="fa-solid fa-arrow-right-from-bracket"></i> 退出登录
                        </button>
                    </div>
                </div>

                <div class="w-px h-6 bg-black/10 dark:bg-white/10 mx-1 hidden sm:block"></div>

                <button @click="ctx.startTour"
                        class="hidden sm:flex w-11 h-11 sm:w-9 sm:h-9 rounded-md hover:bg-black/5 dark:hover:bg-white/10 items-center justify-center transition group relative"
                        title="新手引导">
                    <i class="fa-solid fa-circle-question text-lg sm:text-base opacity-80 "></i>
                </button>

                <input id="json-upload" type="file" accept=".json" class="hidden" @change="ctx.handleJSONFile">
                <input id="midi-import-input" type="file" accept=".mid,.midi" class="absolute opacity-0 w-0 h-0 overflow-hidden pointer-events-none" @change="ctx.handleMidiFile">
            </div>
        </header>
  `,
};
