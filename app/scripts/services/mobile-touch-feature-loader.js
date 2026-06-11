export function createMobileTouchFeatureLoader({
    importMobileTouchFeature = () => import('../features/mobile-touch.js'),
} = {}) {
    if (typeof importMobileTouchFeature !== 'function') {
        throw new TypeError('createMobileTouchFeatureLoader requires an importMobileTouchFeature function');
    }

    return () => importMobileTouchFeature()
        .then((mobileTouchModule) => mobileTouchModule.registerMobileTouchFeature);
}
