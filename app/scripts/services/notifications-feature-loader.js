export function createNotificationsFeatureLoader({
    importNotificationsFeature = () => import('../features/notifications.js'),
} = {}) {
    if (typeof importNotificationsFeature !== 'function') {
        throw new TypeError('createNotificationsFeatureLoader requires an importNotificationsFeature function');
    }

    return () => importNotificationsFeature()
        .then((notificationsModule) => notificationsModule.registerNotificationsFeature);
}
