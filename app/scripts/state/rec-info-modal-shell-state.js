import { defineShellState } from './shell-state-factory.js';

export const createRecInfoModalShellState = defineShellState('createRecInfoModalShellState', {
    reads: [
        'refs.sidebarTab',
        'helpers.filteredRecOptions',
    ],
    models: [
        'refs.showRecInfoModal',
        'refs.activeRecDropdown',
        'refs.recDropdownSearch',
    ],
    values: [
        'refs.recInfoForm',
        'helpers.metadataModalHandlers.selectRecOption',
        'helpers.metadataModalHandlers.createRecOption',
        'helpers.metadataModalHandlers.saveRecInfo',
    ],
});
