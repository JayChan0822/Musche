// MIDI Manager 懒加载 feature 的根级占位。
// 与 state/import-data-state.js 同理：根 ctx 在 setup() 同步末尾就绑定了这些对象，
// 所以它们必须是身份稳定的转发引用，取值时才从 midiManagerFeatureRef 上取真实派生量。
export function createMidiManagerState({ reactive, computed, shallowRef }) {
    if (typeof reactive !== 'function' || typeof computed !== 'function' || typeof shallowRef !== 'function') {
        throw new TypeError('createMidiManagerState requires Vue reactive, computed, and shallowRef factories');
    }

    const midiManagerFeatureRef = shallowRef(null);
    const forward = (key) => computed(() => midiManagerFeatureRef.value?.[key]?.value ?? []);

    const fallbackExpandedGroups = reactive(new Set());
    const resolveExpandedGroups = () => midiManagerFeatureRef.value?.midiManagerExpandedGroups ?? fallbackExpandedGroups;
    const midiManagerExpandedGroups = {
        has: (value) => resolveExpandedGroups().has(value),
        add: (value) => resolveExpandedGroups().add(value),
        delete: (value) => resolveExpandedGroups().delete(value),
        clear: () => resolveExpandedGroups().clear(),
    };

    return {
        midiManagerFeatureRef,
        midiManagerExpandedGroups,
        projectMidiGroups: forward('projectMidiGroups'),
        filteredMidiGroups: forward('filteredMidiGroups'),
    };
}
