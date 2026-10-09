export function createDesktopResizeFeatureLoader({
    importDesktopResizeFeature = () => import('../features/desktop-resize.js'),
} = {}) {
    if (typeof importDesktopResizeFeature !== 'function') {
        throw new TypeError('createDesktopResizeFeatureLoader requires an importDesktopResizeFeature function');
    }

    return () => importDesktopResizeFeature()
        .then((desktopResizeModule) => desktopResizeModule.registerDesktopResizeFeature);
}
