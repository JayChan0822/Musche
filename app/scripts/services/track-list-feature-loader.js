export function createTrackListFeatureLoader({
    importTrackListFeature = () => import('../features/track-list.js'),
} = {}) {
    if (typeof importTrackListFeature !== 'function') {
        throw new TypeError('createTrackListFeatureLoader requires an importTrackListFeature function');
    }

    return () => importTrackListFeature()
        .then((trackListModule) => trackListModule.registerTrackListFeature);
}
