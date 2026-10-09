export function createMetadataModalState({ ref, reactive, shallowRef }) {
    if (typeof ref !== 'function' || typeof reactive !== 'function' || typeof shallowRef !== 'function') {
        throw new TypeError('createMetadataModalState requires Vue ref, reactive, and shallowRef factories');
    }

    const showRecInfoModal = ref(false);
    const recInfoForm = reactive({
        studio: '',
        engineer: '',
        operator: '',
        assistant: '',
        notes: '',
    });
    const activeRecDropdown = ref(null);
    const recDropdownSearch = ref('');
    const newRecInputs = reactive({
        studio: '',
        engineer: '',
        operator: '',
        assistant: '',
    });
    const projectInfoForm = reactive({
        id: null,
        title: '',
        composer: '',
        arranger: '',
        producer: '',
        mixingEngineer: '',
        mixingStudio: '',
        masteringEngineer: '',
        masteringStudio: '',
        dolbyStudio: '',
        publishedBy: '',
        producedBy: '',
    });
    const metadataModalsFeatureRef = shallowRef(null);

    return {
        showRecInfoModal,
        recInfoForm,
        activeRecDropdown,
        recDropdownSearch,
        newRecInputs,
        projectInfoForm,
        metadataModalsFeatureRef,
    };
}
