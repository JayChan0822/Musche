export function createMidiManagerFeatureLoader({
    importMidiManagerFeature = () => import('../features/midi-manager.js'),
} = {}) {
    if (typeof importMidiManagerFeature !== 'function') {
        throw new TypeError('createMidiManagerFeatureLoader requires an importMidiManagerFeature function');
    }

    return () => importMidiManagerFeature()
        .then((midiManagerModule) => midiManagerModule.registerMidiManagerFeature);
}
