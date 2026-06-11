export function registerNotificationsFeature(context) {
  const { services, utils, actions = {} } = context;
  const { deviceService } = services;
  const { getNameById } = utils;
  const {
    logInfo = (...args) => console.log(...args),
    logError = (...args) => console.error(...args),
    openAlertModal = () => {},
  } = actions;

  const updateTaskNotification = async (task) => {
    try {
      const result = await deviceService.updateTaskNotification(task, {
        title: `准备录音: ${getNameById(task.musicianId, 'musician')}`,
        body: `${task.startTime} 开始 (${getNameById(task.projectId, 'project')})`,
      });
      if (!result.skipped) logInfo('✅ 通知已设定');
    } catch (error) {
      logError('设置通知失败:', error);
    }
  };

  const scheduleReminder = async (title, body, delaySeconds = 5) => {
    try {
      const result = await deviceService.scheduleReminder(title, body, delaySeconds);
      if (result.reason === 'permission-denied') {
        openAlertModal('请授权通知权限，否则无法提醒！');
      } else if (result.skipped) {
        logInfo('非 App 环境，跳过通知');
      }
    } catch (error) {
      logError('通知设置失败', error);
      openAlertModal(`通知设置出错：${error.message}`);
    }
  };

  return {
    updateTaskNotification,
    scheduleReminder,
  };
}
