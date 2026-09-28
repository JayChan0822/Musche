import { deleteSessionData } from '../utils/delete-session.js';
import { withLoadingDialog } from '../services/loading-dialog.js';
import { computed } from 'vue';

export function registerSessionFeature(context) {
  const { refs, state, utils, actions } = context;
  const { currentSessionId, activeDropdown, itemPool = { value: [] }, scheduledTasks = { value: [] }, showTrackList } = refs;
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

  let switching = false;
  const switchSession = async (id) => {
    if (switching || id === currentSessionId.value || !settings.sessions.some(session => session.id === id)) return;
    switching = true;
    activeDropdown.value = null;
    try {
      await withLoadingDialog('正在切换日程', '正在整理任务与日程视图…', () => {
        cancelPendingTrackSave();
        currentSessionId.value = id;
      });
    } finally { switching = false; }
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

      const deletingSessionId = currentSessionId.value;
      openConfirmModal(
        '删除日程',
        '确定删除当前日程及其中全部任务、排期和工作记录？仅该日程使用的项目也会删除；跨日程共用的项目、人员和乐器保留。可撤销。',
        () => {
          if (!settings.sessions.some(session => session.id === deletingSessionId) || settings.sessions.length <= 1) return;
          cancelPendingTrackSave();
          pushHistory();
          const result = deleteSessionData(settings, itemPool.value, scheduledTasks.value, deletingSessionId);
          if (!result) return;
          itemPool.value = result.pool;
          scheduledTasks.value = result.tasks;
          if (showTrackList) showTrackList.value = false;
          if (currentSessionId.value === deletingSessionId) currentSessionId.value = settings.sessions[0].id;
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
