import { createApp, nextTick, ref } from 'vue';

// Only explicit foreground operations use this overlay; autosave stays quiet.
export async function withLoadingDialog(title, description, operation) {
  if (typeof document === 'undefined') return operation();
  const host = document.createElement('div');
  document.body.appendChild(host);
  const previousFocus = document.activeElement;
  const slow = ref(false);
  const app = createApp({
    setup: () => ({ title, description, slow }),
    template: `<div class="modal-overlay z-[5400]" @keydown.stop @click.stop>
      <section role="dialog" aria-modal="true" aria-label="正在加载" aria-busy="true" tabindex="-1" class="modal-window w-[360px] max-w-[90vw] !p-6">
        <div class="flex items-center gap-3 mb-4"><i class="fa-solid fa-circle-notch fa-spin text-blue-500" aria-hidden="true"></i><h2 class="font-semibold text-base">{{ title }}</h2></div>
        <p role="status" aria-live="polite" class="text-sm text-gray-500 dark:text-gray-400 mb-5">{{ slow ? '等待时间较长，仍在处理中…' : description }}</p>
        <div role="progressbar" aria-label="正在处理" class="loading-dialog-track"><div class="loading-dialog-bar"></div></div>
      </section></div>`,
  });
  app.mount(host);
  const timer = setTimeout(() => { slow.value = true; }, 5000);
  try {
    await nextTick();
    host.querySelector('section')?.focus({ preventScroll: true });
    // Paint the loading state before synchronous session filtering begins.
    await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
    const result = await operation();
    await nextTick();
    await new Promise(resolve => requestAnimationFrame(resolve));
    return result;
  } finally {
    clearTimeout(timer);
    const ownsFocus = host.contains(document.activeElement);
    app.unmount(); host.remove();
    if (ownsFocus && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  }
}
