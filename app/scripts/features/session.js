import { computed } from 'vue';

export function registerSessionFeature(context) {
  const { refs, state, utils, actions } = context;
  const { currentSessionId, activeDropdown } = refs;
  const { settings } = state;
  const { generateUniqueId } = utils;
  const {
    openInputModal,
    openConfirmModal,
    openAlertModal,
    pushHistory,
    cancelPendingTrackSave = () => {},

  } = actions;

  const currentSessionName = computed(() => {
    const session = settings.sessions.find((item) => item.id === currentSessionId.value);
    return session ? session.name : '未命名日程';
  });

  const switchSession = (id) => {
    cancelPendingTrackSave();
    currentSessionId.value = id;
    activeDropdown.value = null;
  };

  const handleSessionAction = (action) => {
    if (action === 'new') {
      openInputModal('新建日程', '', '请输入日程名称 (例如: 2026 春季录音)', (name) => {
        if (name) {
          const newId = generateUniqueId('S');
          settings.sessions.push({ id: newId, name });
          cancelPendingTrackSave();
          currentSessionId.value = newId;
          pushHistory();
        }
      });
    } else if (action === 'rename') {
      const current = settings.sessions.find((session) => session.id === currentSessionId.value);
      openInputModal('重命名日程', current.name, '请输入新名称', (name) => {
        if (name) {
          current.name = name;
          pushHistory();
        }
      });
    } else if (action === 'delete') {
      if (settings.sessions.length <= 1) {
        openAlertModal('无法删除', '至少需要保留一个日程。');
        return;
      }

      openConfirmModal(
        '删除日程',
        '确定删除当前日程？\n（属于该日程的任务仍然会保留在日程表中）',
        () => {
          const idx = settings.sessions.findIndex((session) => session.id === currentSessionId.value);
          settings.sessions.splice(idx, 1);
          cancelPendingTrackSave();
          currentSessionId.value = settings.sessions[0].id;
          pushHistory();

        },
        true,
      );
    }
    activeDropdown.value = null;
  };

  return {
    currentSessionName,
    switchSession,
    handleSessionAction,
  };
}
