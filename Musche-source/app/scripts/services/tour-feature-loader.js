export function createTourFeatureLoader({
    importTourFeature = () => import('../features/tour.js'),
} = {}) {
    if (typeof importTourFeature !== 'function') {
        throw new TypeError('createTourFeatureLoader requires an importTourFeature function');
    }

    return () => importTourFeature()
        .then((tourModule) => tourModule.registerTourFeature);
}
