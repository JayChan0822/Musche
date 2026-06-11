export const AppAuthModal = {
  name: 'AppAuthModal',
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
<div v-if="showAuthModal" class="modal-overlay" @click.self="showAuthModal=false">
    <div class="modal-window w-[400px] p-8 animate-[fadeIn_0.2s] text-center">
        <h3 class="text-2xl font-bold mb-2">云端同步</h3>
        <p class="text-sm opacity-60 mb-6">登录后，您的日程将在不同设备间自动同步。</p>

        <div class="space-y-4">
            <input id="auth-email"
                   v-model="authForm.email"
                   type="email"
                   placeholder="Email"
                   class="glass-input w-full text-base p-3"
                   enterkeyhint="next"
                   @keydown.enter.prevent="authPasswordRef.focus()">

            <input id="auth-password"
                   ref="authPasswordRef"
                   v-model="authForm.password"
                   type="password"
                   placeholder="Password"
                   class="glass-input w-full text-base p-3"
                   enterkeyhint="go"
                   @keydown.enter.prevent="handleLogin">

            <button @click="handleLogin" :disabled="authLoading"
                    class="w-full bg-[#007aff] text-white py-3 rounded-xl font-bold hover:bg-[#0062cc] transition disabled:opacity-50 shadow-lg shadow-blue-500/30">
                {{ authLoading ? '处理中...' : '登 录' }}
            </button>

            <div class="flex justify-between items-center text-xs mt-4 px-1">
                <button @click="handleRegister" :disabled="authLoading"
                        class="text-gray-500 dark:text-gray-400 hover:text-[#007aff] transition font-bold">
                    没有账号？注册新号
                </button>

                <button @click="handleResetPwd" :disabled="authLoading"
                        class="text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
                    忘记密码？
                </button>
            </div>
        </div>
    </div>
</div>
  `,
};
