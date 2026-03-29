export function createDeviceService(plugins = window.Capacitor?.Plugins || {}) {
  const LocalNotifications = plugins.LocalNotifications || null;
  const Haptics = plugins.Haptics || null;

  async function triggerTouchHaptic(style = 'Light') {
    if (!Haptics) return;
    try {
      await Haptics.impact({ style: style.toUpperCase() });
    } catch (error) {
      console.warn('Haptics API调用失败:', error.message);
    }
  }

  async function ensureNotificationPermission() {
    if (!LocalNotifications) return { display: 'denied' };
    let permission = await LocalNotifications.checkPermissions();
    if (permission.display === 'prompt') {
      permission = await LocalNotifications.requestPermissions();
    }
    return permission;
  }

  async function cancelNotification(id) {
    if (!LocalNotifications) return;
    await LocalNotifications.cancel({ notifications: [{ id }] });
  }

  async function scheduleNotification(notification) {
    if (!LocalNotifications) return;
    await LocalNotifications.schedule({ notifications: [notification] });
  }

  async function scheduleReminder(title, body, delaySeconds = 5) {
    if (!LocalNotifications || !Haptics) return { skipped: true };

    const permission = await ensureNotificationPermission();
    if (permission.display !== 'granted') {
      return { skipped: true, reason: 'permission-denied' };
    }

    const triggerTime = new Date(Date.now() + delaySeconds * 1000);
    await scheduleNotification({
      title,
      body,
      id: Math.floor(Math.random() * 100000),
      schedule: { at: triggerTime },
      sound: 'default',
    });
    await triggerTouchHaptic('Medium');
    return { skipped: false };
  }

  async function updateTaskNotification(task, details) {
    if (!LocalNotifications) return { skipped: true };

    const notificationId = task.scheduleId % 2147483647;

    try {
      await cancelNotification(notificationId);
    } catch (error) {
      // Ignore stale notification cancellation failures.
    }

    if (!task.reminderMinutes || task.reminderMinutes <= 0) {
      return { skipped: true };
    }

    const dateStr = task.date.replace(/-/g, '/');
    const taskTime = new Date(`${dateStr} ${task.startTime}:00`);
    const triggerTime = new Date(taskTime.getTime() - task.reminderMinutes * 60 * 1000);

    if (triggerTime.getTime() < Date.now() - 60 * 1000) {
      return { skipped: true, reason: 'stale-trigger' };
    }

    const permission = await ensureNotificationPermission();
    if (permission.display !== 'granted') {
      return { skipped: true, reason: 'permission-denied' };
    }

    await scheduleNotification({
      title: details.title,
      body: details.body,
      id: notificationId,
      schedule: { at: triggerTime },
      sound: 'default',
      smallIcon: 'ic_stat_icon',
    });

    return { skipped: false, id: notificationId };
  }

  return {
    LocalNotifications,
    Haptics,
    triggerTouchHaptic,
    ensureNotificationPermission,
    cancelNotification,
    scheduleNotification,
    scheduleReminder,
    updateTaskNotification,
  };
}
