import { nextTick } from 'vue';

export function registerUniversalModalFeature(context) {
  const { refs, actions } = context;
  const {
    showConfirmModal,
    confirmModalConfig,
    showInputModal,
    inputModalConfig,
    universalInputRef,
  } = refs;
  const { triggerTouchHaptic } = actions;

  const openAlertModal = (title, content, callback) => {
    confirmModalConfig.title = title;
    confirmModalConfig.content = content;
    confirmModalConfig.isAlert = true;
    confirmModalConfig.isDestructive = false;
    confirmModalConfig.confirmText = '我知道了';
    confirmModalConfig.onConfirm = callback;
    showConfirmModal.value = true;
    triggerTouchHaptic('Light');
  };

  const openConfirmModal = (
    title,
    content,
    onConfirm,
    isDestructive = false,
    confirmText = '确定',
    cancelText = '取消',
  ) => {
    confirmModalConfig.title = title;
    confirmModalConfig.content = content;
    confirmModalConfig.isAlert = false;
    confirmModalConfig.isDestructive = isDestructive;
    confirmModalConfig.confirmText = confirmText;
    confirmModalConfig.cancelText = cancelText;
    confirmModalConfig.onConfirm = onConfirm;
    showConfirmModal.value = true;
    triggerTouchHaptic('Medium');
  };

  const closeConfirmModal = () => {
    if (confirmModalConfig.onCancel) {
      confirmModalConfig.onCancel();
    }

    showConfirmModal.value = false;
    setTimeout(() => {
      confirmModalConfig.onConfirm = null;
      confirmModalConfig.onCancel = null;
    }, 300);
  };

  const handleConfirmAction = () => {
    if (confirmModalConfig.onConfirm) {
      confirmModalConfig.onConfirm();
    }

    confirmModalConfig.onCancel = null;
    closeConfirmModal();
  };

  const openInputModal = (title, initialValue, placeholder, callback, hint = '') => {
    inputModalConfig.title = title;
    inputModalConfig.value = initialValue;
    inputModalConfig.placeholder = placeholder;
    inputModalConfig.callback = callback;
    inputModalConfig.hint = hint;
    showInputModal.value = true;

    nextTick(() => {
      if (universalInputRef.value) universalInputRef.value.focus();
      if (universalInputRef.value) universalInputRef.value.select();
    });
  };

  const closeInputModal = () => {
    showInputModal.value = false;
    inputModalConfig.callback = null;
  };

  const confirmInputModal = () => {
    if (!inputModalConfig.value.trim()) {
      // Preserve the previous permissive empty-input behavior.
    }

    if (inputModalConfig.callback) {
      inputModalConfig.callback(inputModalConfig.value.trim());
    }
    closeInputModal();
  };

  return {
    openAlertModal,
    openConfirmModal,
    closeConfirmModal,
    handleConfirmAction,
    openInputModal,
    closeInputModal,
    confirmInputModal,
  };
}
