export function createMidiManagerState({ reactive, computed }) {
    if (typeof reactive !== 'function' || typeof computed !== 'function') {
        throw new TypeError('createMidiManagerState requires Vue reactive and computed factories');
    }

    const emptyMidiManagerSet = reactive(new Set());
    const emptyMidiManagerList = computed(() => []);

    return {
        midiManagerExpandedGroups: emptyMidiManagerSet,
        projectMidiList: emptyMidiManagerList,
        projectMidiGroups: emptyMidiManagerList,
        filteredMidiGroups: emptyMidiManagerList,
    };
}
