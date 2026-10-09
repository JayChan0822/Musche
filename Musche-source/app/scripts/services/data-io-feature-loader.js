export function createDataIoFeatureLoader({
    importDataIoFeature = () => import('../features/data-io.js'),
    loadXlsx,
} = {}) {
    if (typeof importDataIoFeature !== 'function') {
        throw new TypeError('createDataIoFeatureLoader requires an importDataIoFeature function');
    }

    return () => importDataIoFeature()
        .then((dataIoModule) => (context) => dataIoModule.registerDataIoFeature({
            ...context,
            actions: {
                ...context.actions,
                loadXlsx,
            },
        }));
}
