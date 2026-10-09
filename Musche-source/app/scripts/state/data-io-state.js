export function createDataIoState({ ref, reactive, shallowRef }) {
    if (typeof ref !== 'function' || typeof reactive !== 'function' || typeof shallowRef !== 'function') {
        throw new TypeError('createDataIoState requires Vue ref, reactive, and shallowRef factories');
    }

    const showImportModal = ref(false);
    const showExportModal = ref(false);
    const exportFilter = reactive({
        sessions: new Set(),
        projects: new Set(),
        musicians: new Set(),
        instruments: new Set(),
        types: new Set(['REC', 'EDT']),
        dateFrom: '',
        dateTo: '',
        searchProject: '',
        searchMusician: '',
        searchInstrument: '',
    });
    const dataIoFeatureRef = shallowRef(null);

    return {
        showImportModal,
        showExportModal,
        exportFilter,
        dataIoFeatureRef,
    };
}
