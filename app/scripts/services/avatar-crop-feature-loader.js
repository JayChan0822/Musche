export function createAvatarCropFeatureLoader({
    importAvatarCropFeature = () => import('../features/avatar-crop.js'),
    loadCropper,
} = {}) {
    if (typeof importAvatarCropFeature !== 'function') {
        throw new TypeError('createAvatarCropFeatureLoader requires an importAvatarCropFeature function');
    }

    return () => importAvatarCropFeature()
        .then((avatarCropModule) => (context) => avatarCropModule.registerAvatarCropFeature({
            ...context,
            actions: {
                ...context.actions,
                loadCropper,
            },
        }));
}
