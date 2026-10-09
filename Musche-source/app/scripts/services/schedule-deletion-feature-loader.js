export function createScheduleDeletionFeatureLoader({
    importScheduleDeletionFeature = () => import('../features/schedule-deletion.js'),
} = {}) {
    if (typeof importScheduleDeletionFeature !== 'function') {
        throw new TypeError('createScheduleDeletionFeatureLoader requires an importScheduleDeletionFeature function');
    }

    return () => importScheduleDeletionFeature()
        .then((scheduleDeletionModule) => scheduleDeletionModule.registerScheduleDeletionFeature);
}
