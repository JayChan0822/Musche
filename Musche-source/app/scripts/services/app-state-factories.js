import { createAppState } from '../state/app-state.js';
import { createSettingsState } from '../state/settings-state.js';
import { createRootShellState as createRootShellStateFactory } from '../state/root-shell-state.js';
import { createDataIoState } from '../state/data-io-state.js';
import { createImportDataState } from '../state/import-data-state.js';
import { createTrackListState } from '../state/track-list-state.js';
import { createMidiManagerState } from '../state/midi-manager-state.js';
import { createMidiManagerModalShellState } from '../state/midi-manager-modal-shell-state.js';
import { createMidiImportModalShellState } from '../state/midi-import-modal-shell-state.js';
import { createSettingsModalShellState } from '../state/settings-modal-shell-state.js';
import { createMetadataModalState } from '../state/metadata-modal-state.js';
import { createHeaderShellState } from '../state/header-shell-state.js';
import { createSidebarShellState } from '../state/sidebar-shell-state.js';
import { createMainContentShellState } from '../state/main-content-shell-state.js';
import { createMobileControlsShellState } from '../state/mobile-controls-shell-state.js';
import { createMobileTaskInputShellState } from '../state/mobile-task-input-shell-state.js';
import { createStandaloneOverlaysShellState } from '../state/standalone-overlays-shell-state.js';
import { createTrackListModalShellState } from '../state/track-list-modal-shell-state.js';
import { createExportModalShellState } from '../state/export-modal-shell-state.js';
import { createExportCreditModalsShellState } from '../state/export-credit-modals-shell-state.js';
import { createMidiCsvImportModalsShellState } from '../state/midi-csv-import-modals-shell-state.js';
import { createCsvImportModalShellState } from '../state/csv-import-modal-shell-state.js';
import { createCreditModalShellState } from '../state/credit-modal-shell-state.js';
import { createProjectInfoModalShellState } from '../state/project-info-modal-shell-state.js';
import { createRecInfoModalShellState } from '../state/rec-info-modal-shell-state.js';
import { createMetadataInfoModalsShellState } from '../state/metadata-info-modals-shell-state.js';
import { createEditModalShellState } from '../state/edit-modal-shell-state.js';
import { createAccountModalsShellState } from '../state/account-modals-shell-state.js';
import { createAuthModalShellState } from '../state/auth-modal-shell-state.js';
import { createCropModalShellState } from '../state/crop-modal-shell-state.js';
import { createUtilityModalsShellState } from '../state/utility-modals-shell-state.js';
import { createImportModalShellState } from '../state/import-modal-shell-state.js';
import { createQuickAddModalShellState } from '../state/quick-add-modal-shell-state.js';
import { createConfirmModalShellState } from '../state/confirm-modal-shell-state.js';
import { createInputModalShellState } from '../state/input-modal-shell-state.js';
import { createSplitModalShellState } from '../state/split-modal-shell-state.js';
import { createColorPickerModalShellState } from '../state/color-picker-modal-shell-state.js';
import { createDurationPickerModalShellState } from '../state/duration-picker-modal-shell-state.js';
import { createPickerModalsShellState } from '../state/picker-modals-shell-state.js';
import { createTaskActionModalsShellState } from '../state/task-action-modals-shell-state.js';
import { createUniversalModalsShellState } from '../state/universal-modals-shell-state.js';
import { createMuscheStore } from '../store/index.js';

export function createAppStateFactories({ ref, reactive, shallowRef, computed } = {}) {
    function createRootAppState() {
        return createAppState({
            ref,
            reactive,
            getWindowWidth: () => globalThis.window?.innerWidth ?? 1024,
        });
    }

    function createRootDataIoState() {
        return createDataIoState({
            ref,
            reactive,
            shallowRef,
        });
    }

    function createRootImportDataState() {
        return createImportDataState({
            computed,
            reactive,
            shallowRef,
        });
    }

    function createRootTrackListState() {
        return createTrackListState({
            ref,
        });
    }

    function createRootMidiManagerState() {
        return createMidiManagerState({
            reactive,
            computed,
            shallowRef,
        });
    }

    function createRootMidiManagerModalShellState(options) {
        return createMidiManagerModalShellState({
            reactive,
            ...options,
        });
    }

    function createRootMidiImportModalShellState(options) {
        return createMidiImportModalShellState({
            reactive,
            ...options,
        });
    }

    function createRootSettingsModalShellState(options) {
        return createSettingsModalShellState({
            reactive,
            ...options,
        });
    }

    function createRootMetadataModalState() {
        return createMetadataModalState({
            ref,
            reactive,
            shallowRef,
        });
    }

    function createRootSettingsState() {
        return createSettingsState({
            reactive,
        });
    }

    function createRootShellState(options) {
        return createRootShellStateFactory({
            reactive,
            ...options,
        });
    }

    function createRootMobileControlsShellState(options) {
        return createMobileControlsShellState({
            reactive,
            ...options,
        });
    }

    function createRootMobileTaskInputShellState(options) {
        return createMobileTaskInputShellState({
            reactive,
            ...options,
        });
    }

    function createRootStandaloneOverlaysShellState(options) {
        return createStandaloneOverlaysShellState({
            reactive,
            ...options,
        });
    }

    function createRootTrackListModalShellState(options) {
        return createTrackListModalShellState({
            reactive,
            ...options,
        });
    }

    function createRootExportModalShellState(options) {
        return createExportModalShellState({
            reactive,
            ...options,
        });
    }

    function createRootHeaderShellState(options) {
        return createHeaderShellState({
            reactive,
            ...options,
        });
    }

    function createRootSidebarShellState(options) {
        return createSidebarShellState({
            reactive,
            ...options,
        });
    }

    function createRootMainContentShellState(options) {
        return createMainContentShellState({
            reactive,
            ...options,
        });
    }

    function createRootExportCreditModalsShellState(options) {
        return createExportCreditModalsShellState({
            reactive,
            ...options,
        });
    }

    function createRootMidiCsvImportModalsShellState(options) {
        return createMidiCsvImportModalsShellState({
            reactive,
            ...options,
        });
    }

    function createRootCsvImportModalShellState(options) {
        return createCsvImportModalShellState({
            reactive,
            ...options,
        });
    }

    function createRootCreditModalShellState(options) {
        return createCreditModalShellState({
            reactive,
            ...options,
        });
    }

    function createRootProjectInfoModalShellState(options) {
        return createProjectInfoModalShellState({
            reactive,
            ...options,
        });
    }

    function createRootRecInfoModalShellState(options) {
        return createRecInfoModalShellState({
            reactive,
            ...options,
        });
    }

    function createRootMetadataInfoModalsShellState(options) {
        return createMetadataInfoModalsShellState({
            reactive,
            ...options,
        });
    }

    function createRootEditModalShellState(options) {
        return createEditModalShellState({
            reactive,
            ...options,
        });
    }

    function createRootAccountModalsShellState(options) {
        return createAccountModalsShellState({
            reactive,
            ...options,
        });
    }

    function createRootAuthModalShellState(options) {
        return createAuthModalShellState({
            reactive,
            ...options,
        });
    }

    function createRootCropModalShellState(options) {
        return createCropModalShellState({
            reactive,
            ...options,
        });
    }

    function createRootUtilityModalsShellState(options) {
        return createUtilityModalsShellState({
            reactive,
            ...options,
        });
    }

    function createRootImportModalShellState(options) {
        return createImportModalShellState({
            reactive,
            ...options,
        });
    }

    function createRootQuickAddModalShellState(options) {
        return createQuickAddModalShellState({
            reactive,
            ...options,
        });
    }

    function createRootConfirmModalShellState(options) {
        return createConfirmModalShellState({
            reactive,
            ...options,
        });
    }

    function createRootInputModalShellState(options) {
        return createInputModalShellState({
            reactive,
            ...options,
        });
    }

    function createRootSplitModalShellState(options) {
        return createSplitModalShellState({
            reactive,
            ...options,
        });
    }

    function createRootColorPickerModalShellState(options) {
        return createColorPickerModalShellState({
            reactive,
            ...options,
        });
    }

    function createRootDurationPickerModalShellState(options) {
        return createDurationPickerModalShellState({
            reactive,
            ...options,
        });
    }

    function createRootPickerModalsShellState(options) {
        return createPickerModalsShellState({
            reactive,
            ...options,
        });
    }

    function createRootTaskActionModalsShellState(options) {
        return createTaskActionModalsShellState({
            reactive,
            ...options,
        });
    }

    function createRootUniversalModalsShellState(options) {
        return createUniversalModalsShellState({
            reactive,
            ...options,
        });
    }

    return {
        createMuscheStore,
        createAppState,
        createRootAppState,
        createSettingsState,
        createRootSettingsState,
        createRootShellState,
        createDataIoState,
        createRootDataIoState,
        createImportDataState,
        createRootImportDataState,
        createTrackListState,
        createRootTrackListState,
        createMidiManagerState,
        createRootMidiManagerState,
        createMidiManagerModalShellState,
        createRootMidiManagerModalShellState,
        createMidiImportModalShellState,
        createRootMidiImportModalShellState,
        createSettingsModalShellState,
        createRootSettingsModalShellState,
        createMetadataModalState,
        createRootMetadataModalState,
        createHeaderShellState,
        createRootHeaderShellState,
        createSidebarShellState,
        createRootSidebarShellState,
        createMainContentShellState,
        createRootMainContentShellState,
        createMobileControlsShellState,
        createRootMobileControlsShellState,
        createMobileTaskInputShellState,
        createRootMobileTaskInputShellState,
        createStandaloneOverlaysShellState,
        createRootStandaloneOverlaysShellState,
        createTrackListModalShellState,
        createRootTrackListModalShellState,
        createExportModalShellState,
        createRootExportModalShellState,
        createExportCreditModalsShellState,
        createRootExportCreditModalsShellState,
        createMidiCsvImportModalsShellState,
        createRootMidiCsvImportModalsShellState,
        createCsvImportModalShellState,
        createRootCsvImportModalShellState,
        createCreditModalShellState,
        createRootCreditModalShellState,
        createProjectInfoModalShellState,
        createRootProjectInfoModalShellState,
        createRecInfoModalShellState,
        createRootRecInfoModalShellState,
        createMetadataInfoModalsShellState,
        createRootMetadataInfoModalsShellState,
        createEditModalShellState,
        createRootEditModalShellState,
        createAccountModalsShellState,
        createRootAccountModalsShellState,
        createAuthModalShellState,
        createRootAuthModalShellState,
        createCropModalShellState,
        createRootCropModalShellState,
        createUtilityModalsShellState,
        createRootUtilityModalsShellState,
        createImportModalShellState,
        createRootImportModalShellState,
        createQuickAddModalShellState,
        createRootQuickAddModalShellState,
        createConfirmModalShellState,
        createRootConfirmModalShellState,
        createInputModalShellState,
        createRootInputModalShellState,
        createSplitModalShellState,
        createRootSplitModalShellState,
        createColorPickerModalShellState,
        createRootColorPickerModalShellState,
        createDurationPickerModalShellState,
        createRootDurationPickerModalShellState,
        createPickerModalsShellState,
        createRootPickerModalsShellState,
        createTaskActionModalsShellState,
        createRootTaskActionModalsShellState,
        createUniversalModalsShellState,
        createRootUniversalModalsShellState,
    };
}
