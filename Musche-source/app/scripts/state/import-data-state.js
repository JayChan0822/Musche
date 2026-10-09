// import-data 懒加载 feature 的根级占位。
// 这些对象在 setup() 同步阶段就被钉进根 ctx（见 services/app-root-context-wiring.js），
// 而 feature 要到首次使用时才加载，所以占位必须是**稳定的转发引用**：
// 身份永不改变，取值时才从 importDataFeatureRef 上取真实派生量。
export function createImportDataState({ computed, reactive, shallowRef }) {
    if (typeof computed !== 'function' || typeof reactive !== 'function' || typeof shallowRef !== 'function') {
        throw new TypeError('createImportDataState requires Vue computed, reactive, and shallowRef factories');
    }

    const importDataFeatureRef = shallowRef(null);
    const forward = (key, fallback) => computed(() => importDataFeatureRef.value?.[key]?.value ?? fallback);

    const groupedCsvData = forward('groupedCsvData', []);
    const availableInstrumentGroups = forward('availableInstrumentGroups', []);
    const midiGroupData = forward('midiGroupData', []);
    const currentMidiDisplayList = forward('currentMidiDisplayList', []);
    const filteredImportOptions = forward('filteredImportOptions', []);

    // feature 侧的 midiGroupExpanded 是自带响应式版本号的集合外壳（features/import-data.js），
    // 这里再包一层同形状的转发壳，未加载时落回本地集合。
    const fallbackMidiGroupExpanded = reactive(new Set());
    const resolveMidiGroupExpanded = () => importDataFeatureRef.value?.midiGroupExpanded ?? fallbackMidiGroupExpanded;
    const midiGroupExpanded = {
        has: (value) => resolveMidiGroupExpanded().has(value),
        add: (value) => resolveMidiGroupExpanded().add(value),
        delete: (value) => resolveMidiGroupExpanded().delete(value),
        clear: () => resolveMidiGroupExpanded().clear(),
    };

    return {
        importDataFeatureRef,
        groupedCsvData,
        availableInstrumentGroups,
        midiGroupData,
        currentMidiDisplayList,
        filteredImportOptions,
        midiGroupExpanded,
    };
}
