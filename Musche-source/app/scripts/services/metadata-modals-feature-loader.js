export function createMetadataModalsFeatureLoader({
    importMetadataModalsFeature = () => import('../features/metadata-modals.js'),
} = {}) {
    if (typeof importMetadataModalsFeature !== 'function') {
        throw new TypeError('createMetadataModalsFeatureLoader requires an importMetadataModalsFeature function');
    }

    return () => importMetadataModalsFeature()
        .then((metadataModalsModule) => metadataModalsModule.registerMetadataModalsFeature);
}
