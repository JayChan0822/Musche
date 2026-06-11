export function createImportDataState({ computed, reactive }) {
    if (typeof computed !== 'function' || typeof reactive !== 'function') {
        throw new TypeError('createImportDataState requires Vue computed and reactive factories');
    }

    let groupedCsvData = computed(() => []);
    let isAllSelected = computed(() => false);
    let availableInstrumentGroups = computed(() => []);
    let midiGroupData = computed(() => []);
    let currentMidiDisplayList = computed(() => []);
    let filteredImportOptions = computed(() => []);
    let midiGroupExpanded = reactive(new Set());

    return {
        groupedCsvData,
        isAllSelected,
        availableInstrumentGroups,
        midiGroupData,
        currentMidiDisplayList,
        filteredImportOptions,
        midiGroupExpanded,
    };
}
