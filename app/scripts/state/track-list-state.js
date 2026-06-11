export function createTrackListState({ ref }) {
    if (typeof ref !== 'function') {
        throw new TypeError('createTrackListState requires Vue ref factory');
    }

    const trackListReady = ref(false);

    return {
        trackListReady,
    };
}
