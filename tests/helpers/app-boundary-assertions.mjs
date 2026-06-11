import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const rootDir = resolve(new URL('../..', import.meta.url).pathname);

export function resolveFixturePath(fixturePath) {
  return resolve(rootDir, fixturePath);
}

export function readFixture(fixturePath) {
  return readFileSync(resolveFixturePath(fixturePath), 'utf8');
}

export function readOptionalFixture(fixturePath) {
  const absoluteFixturePath = resolveFixturePath(fixturePath);
  return existsSync(absoluteFixturePath) ? readFileSync(absoluteFixturePath, 'utf8') : '';
}

export const appScriptPath = resolveFixturePath('app/scripts/app.js');
export const appScript = readFixture('app/scripts/app.js');
export const indexHtml = readFixture('app/index.html');
export const modularizationSmoke = readFixture('tests/modularization-smoke.mjs');
export const appBoundaryAssertions = readFixture('tests/helpers/app-boundary-assertions.mjs');
export const packageJson = JSON.parse(readFixture('package.json'));
export const viteConfigPath = resolveFixturePath('vite.config.mjs');
export const viteConfig = readFixture('vite.config.mjs');
const appDependenciesPath = resolveFixturePath('app/scripts/services/app-dependencies.js');
export const appDependenciesModule = readOptionalFixture(appDependenciesPath);
const appFeatureRegistrarsPath = resolveFixturePath('app/scripts/services/app-feature-registrars.js');
export const appFeatureRegistrarsModule = readOptionalFixture(appFeatureRegistrarsPath);
const appFeatureLoadersPath = resolveFixturePath('app/scripts/services/app-feature-loaders.js');
export const appFeatureLoadersModule = readOptionalFixture(appFeatureLoadersPath);
const appStateFactoriesPath = resolveFixturePath('app/scripts/services/app-state-factories.js');
export const appStateFactoriesModule = readOptionalFixture(appStateFactoriesPath);
const appUtilityFunctionsPath = resolveFixturePath('app/scripts/services/app-utility-functions.js');
export const appUtilityFunctionsModule = readOptionalFixture(appUtilityFunctionsPath);
const appBootstrapServicesPath = resolveFixturePath('app/scripts/services/app-bootstrap-services.js');
export const appBootstrapServicesModule = readOptionalFixture(appBootstrapServicesPath);
const appSupportLoadersPath = resolveFixturePath('app/scripts/services/app-support-loaders.js');
export const appSupportLoadersModule = readOptionalFixture(appSupportLoadersPath);
const appRootComponentsPath = resolveFixturePath('app/scripts/services/app-root-components.js');
export const appRootComponentsModule = readOptionalFixture(appRootComponentsPath);
const appVueRuntimePath = resolveFixturePath('app/scripts/services/app-vue-runtime.js');
export const appVueRuntimeModule = readOptionalFixture(appVueRuntimePath);
export const supabaseServicePath = resolveFixturePath('app/scripts/services/supabase-service.js');
export const supabaseServiceModule = readFixture('app/scripts/services/supabase-service.js');
export const configuredSupabaseServicePath = resolveFixturePath('app/scripts/services/configured-supabase-service.js');
export const configuredSupabaseServiceModule = readOptionalFixture(configuredSupabaseServicePath);
export const hapticsServicePath = resolveFixturePath('app/scripts/services/haptics-service.js');
export const midiSmfLoaderPath = resolveFixturePath('app/scripts/services/midi-smf-loader.js');
export const xlsxLoaderPath = resolveFixturePath('app/scripts/services/xlsx-loader.js');
export const dataIoFeatureLoaderPath = resolveFixturePath('app/scripts/services/data-io-feature-loader.js');
export const metadataModalsFeatureLoaderPath = resolveFixturePath('app/scripts/services/metadata-modals-feature-loader.js');
export const tourFeatureLoaderPath = resolveFixturePath('app/scripts/services/tour-feature-loader.js');
export const midiManagerFeatureLoaderPath = resolveFixturePath('app/scripts/services/midi-manager-feature-loader.js');
export const taskEditorFeatureLoaderPath = resolveFixturePath('app/scripts/services/task-editor-feature-loader.js');
export const mobileTouchFeatureLoaderPath = resolveFixturePath('app/scripts/services/mobile-touch-feature-loader.js');
export const trackListFeatureLoaderPath = resolveFixturePath('app/scripts/services/track-list-feature-loader.js');
export const settingsFeatureLoaderPath = resolveFixturePath('app/scripts/services/settings-feature-loader.js');
export const cropperLoaderPath = resolveFixturePath('app/scripts/services/cropper-loader.js');
export const avatarCropFeatureLoaderPath = resolveFixturePath('app/scripts/services/avatar-crop-feature-loader.js');
export const pinyinMatchLoaderPath = resolveFixturePath('app/scripts/services/pinyin-match-loader.js');
export const importDataDependencyLoaderPath = resolveFixturePath('app/scripts/services/import-data-dependency-loader.js');
export const notificationsFeatureLoaderPath = resolveFixturePath('app/scripts/services/notifications-feature-loader.js');
export const desktopResizeFeatureLoaderPath = resolveFixturePath('app/scripts/services/desktop-resize-feature-loader.js');
export const scheduleDeletionFeatureLoaderPath = resolveFixturePath('app/scripts/services/schedule-deletion-feature-loader.js');
export const appRuntimeFeatureRegistrarPath = resolveFixturePath('app/scripts/services/app-runtime-feature-registrar.js');
export const globalKeyboardFeatureRegistrarPath = resolveFixturePath('app/scripts/services/global-keyboard-feature-registrar.js');
export const sessionFeatureRegistrarPath = resolveFixturePath('app/scripts/services/session-feature-registrar.js');
export const historyFeatureRegistrarPath = resolveFixturePath('app/scripts/services/history-feature-registrar.js');
export const ratioFeatureRegistrarPath = resolveFixturePath('app/scripts/services/ratio-feature-registrar.js');
export const nameLookupFeatureRegistrarPath = resolveFixturePath('app/scripts/services/name-lookup-feature-registrar.js');
export const splitViewFeatureRegistrarPath = resolveFixturePath('app/scripts/services/split-view-feature-registrar.js');
export const dropdownsFeatureRegistrarPath = resolveFixturePath('app/scripts/services/dropdowns-feature-registrar.js');
export const viewNavigationFeatureRegistrarPath = resolveFixturePath('app/scripts/services/view-navigation-feature-registrar.js');
export const quickAddFeatureRegistrarPath = resolveFixturePath('app/scripts/services/quick-add-feature-registrar.js');
export const universalModalFeatureRegistrarPath = resolveFixturePath('app/scripts/services/universal-modal-feature-registrar.js');
export const orchestrationFeatureRegistrarPath = resolveFixturePath('app/scripts/services/orchestration-feature-registrar.js');
export const splitTaskFeatureRegistrarPath = resolveFixturePath('app/scripts/services/split-task-feature-registrar.js');
export const pickerControlsFeatureRegistrarPath = resolveFixturePath('app/scripts/services/picker-controls-feature-registrar.js');
export const poolInteractionsFeatureRegistrarPath = resolveFixturePath('app/scripts/services/pool-interactions-feature-registrar.js');
export const searchFeatureRegistrarPath = resolveFixturePath('app/scripts/services/search-feature-registrar.js');
export const sidebarStatsFeatureRegistrarPath = resolveFixturePath('app/scripts/services/sidebar-stats-feature-registrar.js');
export const sidebarFeatureRegistrarPath = resolveFixturePath('app/scripts/services/sidebar-feature-registrar.js');
export const mobileUiFeatureRegistrarPath = resolveFixturePath('app/scripts/services/mobile-ui-feature-registrar.js');
export const scheduleFeatureRegistrarPath = resolveFixturePath('app/scripts/services/schedule-feature-registrar.js');
export const scheduleInteractionsFeatureRegistrarPath = resolveFixturePath('app/scripts/services/schedule-interactions-feature-registrar.js');
export const authFeatureRegistrarPath = resolveFixturePath('app/scripts/services/auth-feature-registrar.js');
export const settingsSyncFeatureRegistrarPath = resolveFixturePath('app/scripts/services/settings-sync-feature-registrar.js');
export const settingsStatePath = resolveFixturePath('app/scripts/state/settings-state.js');
export const dataIoStatePath = resolveFixturePath('app/scripts/state/data-io-state.js');
export const importDataStatePath = resolveFixturePath('app/scripts/state/import-data-state.js');
export const trackListStatePath = resolveFixturePath('app/scripts/state/track-list-state.js');
export const midiManagerStatePath = resolveFixturePath('app/scripts/state/midi-manager-state.js');
export const midiManagerModalShellStatePath = resolveFixturePath('app/scripts/state/midi-manager-modal-shell-state.js');
export const midiImportModalShellStatePath = resolveFixturePath('app/scripts/state/midi-import-modal-shell-state.js');
export const settingsModalShellStatePath = resolveFixturePath('app/scripts/state/settings-modal-shell-state.js');
export const metadataModalStatePath = resolveFixturePath('app/scripts/state/metadata-modal-state.js');
export const rootShellStatePath = resolveFixturePath('app/scripts/state/root-shell-state.js');
export const sidebarShellStatePath = resolveFixturePath('app/scripts/state/sidebar-shell-state.js');
export const mobileControlsShellStatePath = resolveFixturePath('app/scripts/state/mobile-controls-shell-state.js');
export const creditModalShellStatePath = resolveFixturePath('app/scripts/state/credit-modal-shell-state.js');
export const confirmModalShellStatePath = resolveFixturePath('app/scripts/state/confirm-modal-shell-state.js');
export const inputModalShellStatePath = resolveFixturePath('app/scripts/state/input-modal-shell-state.js');
export const splitModalShellStatePath = resolveFixturePath('app/scripts/state/split-modal-shell-state.js');
export const importDataFeaturePath = resolveFixturePath('app/scripts/features/import-data.js');
export const viewNavigationFeaturePath = resolveFixturePath('app/scripts/features/view-navigation.js');
export const metadataModalsFeaturePath = resolveFixturePath('app/scripts/features/metadata-modals.js');
export const scheduleInteractionsFeaturePath = resolveFixturePath('app/scripts/features/schedule-interactions.js');
export const mobileTouchFeaturePath = resolveFixturePath('app/scripts/features/mobile-touch.js');
export const pickerControlsFeaturePath = resolveFixturePath('app/scripts/features/picker-controls.js');
export const dataIoFeaturePath = resolveFixturePath('app/scripts/features/data-io.js');
export const sidebarFeaturePath = resolveFixturePath('app/scripts/features/sidebar.js');
export const poolInteractionsFeaturePath = resolveFixturePath('app/scripts/features/pool-interactions.js');
export const appRuntimeFeaturePath = resolveFixturePath('app/scripts/features/app-runtime.js');
export const nameLookupFeaturePath = resolveFixturePath('app/scripts/features/name-lookup.js');
export const selectionFeaturePath = resolveFixturePath('app/scripts/features/selection.js');
export const hapticsServiceModule = readOptionalFixture(hapticsServicePath);
export const midiSmfLoaderModule = readOptionalFixture(midiSmfLoaderPath);
export const xlsxLoaderModule = readOptionalFixture(xlsxLoaderPath);
export const dataIoFeatureLoaderModule = readOptionalFixture(dataIoFeatureLoaderPath);
export const metadataModalsFeatureLoaderModule = readOptionalFixture(metadataModalsFeatureLoaderPath);
export const tourFeatureLoaderModule = readOptionalFixture(tourFeatureLoaderPath);
export const midiManagerFeatureLoaderModule = readOptionalFixture(midiManagerFeatureLoaderPath);
export const taskEditorFeatureLoaderModule = readOptionalFixture(taskEditorFeatureLoaderPath);
export const mobileTouchFeatureLoaderModule = readOptionalFixture(mobileTouchFeatureLoaderPath);
export const trackListFeatureLoaderModule = readOptionalFixture(trackListFeatureLoaderPath);
export const settingsFeatureLoaderModule = readOptionalFixture(settingsFeatureLoaderPath);
export const cropperLoaderModule = readOptionalFixture(cropperLoaderPath);
export const avatarCropFeatureLoaderModule = readOptionalFixture(avatarCropFeatureLoaderPath);
export const pinyinMatchLoaderModule = readOptionalFixture(pinyinMatchLoaderPath);
export const importDataDependencyLoaderModule = readOptionalFixture(importDataDependencyLoaderPath);
export const notificationsFeatureLoaderModule = readOptionalFixture(notificationsFeatureLoaderPath);
export const desktopResizeFeatureLoaderModule = readOptionalFixture(desktopResizeFeatureLoaderPath);
export const scheduleDeletionFeatureLoaderModule = readOptionalFixture(scheduleDeletionFeatureLoaderPath);
export const appRuntimeFeatureRegistrarModule = readOptionalFixture(appRuntimeFeatureRegistrarPath);
export const globalKeyboardFeatureRegistrarModule = readOptionalFixture(globalKeyboardFeatureRegistrarPath);
export const sessionFeatureRegistrarModule = readOptionalFixture(sessionFeatureRegistrarPath);
export const historyFeatureRegistrarModule = readOptionalFixture(historyFeatureRegistrarPath);
export const ratioFeatureRegistrarModule = readOptionalFixture(ratioFeatureRegistrarPath);
export const nameLookupFeatureRegistrarModule = readOptionalFixture(nameLookupFeatureRegistrarPath);
export const splitViewFeatureRegistrarModule = readOptionalFixture(splitViewFeatureRegistrarPath);
export const dropdownsFeatureRegistrarModule = readOptionalFixture(dropdownsFeatureRegistrarPath);
export const viewNavigationFeatureRegistrarModule = readOptionalFixture(viewNavigationFeatureRegistrarPath);
export const quickAddFeatureRegistrarModule = readOptionalFixture(quickAddFeatureRegistrarPath);
export const universalModalFeatureRegistrarModule = readOptionalFixture(universalModalFeatureRegistrarPath);
export const orchestrationFeatureRegistrarModule = readOptionalFixture(orchestrationFeatureRegistrarPath);
export const splitTaskFeatureRegistrarModule = readOptionalFixture(splitTaskFeatureRegistrarPath);
export const pickerControlsFeatureRegistrarModule = readOptionalFixture(pickerControlsFeatureRegistrarPath);
export const poolInteractionsFeatureRegistrarModule = readOptionalFixture(poolInteractionsFeatureRegistrarPath);
export const searchFeatureRegistrarModule = readOptionalFixture(searchFeatureRegistrarPath);
export const sidebarStatsFeatureRegistrarModule = readOptionalFixture(sidebarStatsFeatureRegistrarPath);
export const sidebarFeatureRegistrarModule = readOptionalFixture(sidebarFeatureRegistrarPath);
export const mobileUiFeatureRegistrarModule = readOptionalFixture(mobileUiFeatureRegistrarPath);
export const scheduleFeatureRegistrarModule = readOptionalFixture(scheduleFeatureRegistrarPath);
export const scheduleInteractionsFeatureRegistrarModule = readOptionalFixture(scheduleInteractionsFeatureRegistrarPath);
export const authFeatureRegistrarModule = readOptionalFixture(authFeatureRegistrarPath);
export const settingsSyncFeatureRegistrarModule = readOptionalFixture(settingsSyncFeatureRegistrarPath);
export const defaultsState = readFixture('app/scripts/state/defaults.js');
export const settingsStateModule = readOptionalFixture(settingsStatePath);
export const dataIoStateModule = readOptionalFixture(dataIoStatePath);
export const importDataStateModule = readOptionalFixture(importDataStatePath);
export const trackListStateModule = readOptionalFixture(trackListStatePath);
export const midiManagerStateModule = readOptionalFixture(midiManagerStatePath);
export const midiManagerModalShellStateModule = readOptionalFixture(midiManagerModalShellStatePath);
export const midiImportModalShellStateModule = readOptionalFixture(midiImportModalShellStatePath);
export const settingsModalShellStateModule = readOptionalFixture(settingsModalShellStatePath);
export const metadataModalStateModule = readOptionalFixture(metadataModalStatePath);
export const rootShellStateModule = readOptionalFixture(rootShellStatePath);
export const sidebarShellStateModule = readOptionalFixture(sidebarShellStatePath);
export const mobileControlsShellStateModule = readOptionalFixture(mobileControlsShellStatePath);
export const creditModalShellStateModule = readOptionalFixture(creditModalShellStatePath);
export const confirmModalShellStateModule = readOptionalFixture(confirmModalShellStatePath);
export const inputModalShellStateModule = readOptionalFixture(inputModalShellStatePath);
export const splitModalShellStateModule = readOptionalFixture(splitModalShellStatePath);
export const appStateModule = readFixture('app/scripts/state/app-state.js');
export const scheduleFeature = readFixture('app/scripts/features/schedule.js');
export const trackListFeature = readFixture('app/scripts/features/track-list.js');
export const taskEditorFeature = readFixture('app/scripts/features/task-editor.js');
export const sidebarStatsFeature = readFixture('app/scripts/features/sidebar-stats.js');
export const settingsFeature = readFixture('app/scripts/features/settings.js');
export const importCsvFeature = readFixture('app/scripts/features/import-csv.js');
export const importMidiFeature = readFixture('app/scripts/features/import-midi.js');
export const importDataFeature = readOptionalFixture(importDataFeaturePath);
export const midiManagerFeature = readFixture('app/scripts/features/midi-manager.js');
export const searchFeature = readFixture('app/scripts/features/search.js');
export const calendarViewFeature = readFixture('app/scripts/features/calendar-view.js');
export const viewNavigationFeature = readOptionalFixture(viewNavigationFeaturePath);
export const creditsFeature = readFixture('app/scripts/features/credits.js');
export const projectInfoFeature = readFixture('app/scripts/features/project-info.js');
export const recInfoFeature = readFixture('app/scripts/features/rec-info.js');
export const metadataModalsFeature = readOptionalFixture(metadataModalsFeaturePath);
export const authFeature = readFixture('app/scripts/features/auth.js');
export const mobileUiFeature = readFixture('app/scripts/features/mobile-ui.js');
export const scheduleDragDropFeature = readFixture('app/scripts/features/schedule-drag-drop.js');
export const scheduleTaskActivationFeature = readFixture('app/scripts/features/schedule-task-activation.js');
export const scheduleInteractionsFeature = readOptionalFixture(scheduleInteractionsFeaturePath);
export const mobileAutoScrollFeature = readFixture('app/scripts/features/mobile-auto-scroll.js');
export const mobileDragGhostFeature = readFixture('app/scripts/features/mobile-drag-ghost.js');
export const mobileTouchStartFeature = readFixture('app/scripts/features/mobile-touch-start.js');
export const mobileTouchMoveFeature = readFixture('app/scripts/features/mobile-touch-move.js');
export const mobileTouchEndFeature = readFixture('app/scripts/features/mobile-touch-end.js');
export const mobileTouchFeature = readOptionalFixture(mobileTouchFeaturePath);
export const mobileResizeFeature = readFixture('app/scripts/features/mobile-resize.js');
export const desktopResizeFeature = readFixture('app/scripts/features/desktop-resize.js');
export const ratioFeature = readFixture('app/scripts/features/ratio.js');
export const orchestrationFeature = readFixture('app/scripts/features/orchestration.js');
export const universalModalFeature = readFixture('app/scripts/features/universal-modal.js');
export const quickAddFeature = readFixture('app/scripts/features/quick-add.js');
export const durationPickerFeature = readFixture('app/scripts/features/duration-picker.js');
export const pickerControlsFeature = readOptionalFixture(pickerControlsFeaturePath);
export const historyFeature = readFixture('app/scripts/features/history.js');
export const dataPortabilityFeature = readFixture('app/scripts/features/data-portability.js');
export const exportCsvFeature = readFixture('app/scripts/features/export-csv.js');
export const dataIoFeature = readOptionalFixture(dataIoFeaturePath);
export const avatarCropFeature = readFixture('app/scripts/features/avatar-crop.js');
export const scheduleDeletionFeature = readFixture('app/scripts/features/schedule-deletion.js');
export const sessionFeature = readFixture('app/scripts/features/session.js');
export const colorPickerFeature = readFixture('app/scripts/features/color-picker.js');
export const tourFeature = readFixture('app/scripts/features/tour.js');
export const sidebarNavigationFeature = readFixture('app/scripts/features/sidebar-navigation.js');
export const sidebarPreferencesFeature = readFixture('app/scripts/features/sidebar-preferences.js');
export const sidebarFeature = readOptionalFixture(sidebarFeaturePath);
export const mainViewNavigationFeature = readFixture('app/scripts/features/main-view-navigation.js');
export const dropdownsFeature = readFixture('app/scripts/features/dropdowns.js');
export const splitTaskFeature = readFixture('app/scripts/features/split-task.js');
export const splitViewFeature = readFixture('app/scripts/features/split-view.js');
export const notificationsFeature = readFixture('app/scripts/features/notifications.js');
export const appClickHapticsFeature = readFixture('app/scripts/features/app-click-haptics.js');
export const visiblePoolItemsFeature = readFixture('app/scripts/features/visible-pool-items.js');
export const poolInteractionsFeature = readOptionalFixture(poolInteractionsFeaturePath);
export const globalKeyboardFeature = readFixture('app/scripts/features/global-keyboard.js');
export const dataAutosaveFeature = readFixture('app/scripts/features/data-autosave.js');
export const appLifecycleFeature = readFixture('app/scripts/features/app-lifecycle.js');
export const appRuntimeFeature = readOptionalFixture(appRuntimeFeaturePath);
export const nameLookupFeature = readOptionalFixture(nameLookupFeaturePath);
export const selectionFeature = readOptionalFixture(selectionFeaturePath);
export const appRootStaticComponentsPath = resolveFixturePath('app/scripts/components/app-root-static-components.js');
export const appRootStaticComponents = readOptionalFixture(appRootStaticComponentsPath);
export const asyncRootComponentPath = resolveFixturePath('app/scripts/components/async-root-component.js');
export const asyncRootComponent = readOptionalFixture(asyncRootComponentPath);
export const appRootShellComponentPath = resolveFixturePath('app/scripts/components/app-root-shell.js');
export const appRootShellComponentsPath = resolveFixturePath('app/scripts/components/app-root-shell-components.js');
export const appRootOverlaysShellComponentPath = resolveFixturePath('app/scripts/components/app-root-overlays-shell.js');
export const appRootOverlayShellComponentsPath = resolveFixturePath('app/scripts/components/app-root-overlay-shell-components.js');
export const appHeaderComponentPath = resolveFixturePath('app/scripts/components/app-header.js');
export const appSidebarComponentPath = resolveFixturePath('app/scripts/components/app-sidebar.js');
export const appMainContentComponentPath = resolveFixturePath('app/scripts/components/app-main-content.js');
export const appStandaloneOverlaysShellComponentPath = resolveFixturePath('app/scripts/components/app-standalone-overlays-shell.js');
export const appStandaloneOverlayComponentsPath = resolveFixturePath('app/scripts/components/app-standalone-overlay-components.js');
export const appSettingsModalComponentPath = resolveFixturePath('app/scripts/components/app-settings-modal.js');
export const appMobileControlsComponentPath = resolveFixturePath('app/scripts/components/app-mobile-controls.js');
export const appMobileTaskInputComponentPath = resolveFixturePath('app/scripts/components/app-mobile-task-input.js');
export const appExportCreditModalsShellComponentPath = resolveFixturePath('app/scripts/components/app-export-credit-modals-shell.js');
export const appExportCreditModalComponentsPath = resolveFixturePath('app/scripts/components/app-export-credit-modal-components.js');
export const appExportModalComponentPath = resolveFixturePath('app/scripts/components/app-export-modal.js');
export const appCreditModalComponentPath = resolveFixturePath('app/scripts/components/app-credit-modal.js');
export const appMidiCsvImportModalsShellComponentPath = resolveFixturePath('app/scripts/components/app-midi-csv-import-modals-shell.js');
export const appMidiCsvImportModalComponentsPath = resolveFixturePath('app/scripts/components/app-midi-csv-import-modal-components.js');
export const appMidiManagerModalComponentPath = resolveFixturePath('app/scripts/components/app-midi-manager-modal.js');
export const appMidiImportModalComponentPath = resolveFixturePath('app/scripts/components/app-midi-import-modal.js');
export const appCsvImportModalComponentPath = resolveFixturePath('app/scripts/components/app-csv-import-modal.js');
export const appMetadataInfoModalsShellComponentPath = resolveFixturePath('app/scripts/components/app-metadata-info-modals-shell.js');
export const appMetadataInfoModalComponentsPath = resolveFixturePath('app/scripts/components/app-metadata-info-modal-components.js');
export const appProjectInfoModalComponentPath = resolveFixturePath('app/scripts/components/app-project-info-modal.js');
export const appTaskActionModalsShellComponentPath = resolveFixturePath('app/scripts/components/app-task-action-modals-shell.js');
export const appTaskActionModalComponentsPath = resolveFixturePath('app/scripts/components/app-task-action-modal-components.js');
export const appEditModalComponentPath = resolveFixturePath('app/scripts/components/app-edit-modal.js');
export const appAccountModalsShellComponentPath = resolveFixturePath('app/scripts/components/app-account-modals-shell.js');
export const appAccountModalComponentsPath = resolveFixturePath('app/scripts/components/app-account-modal-components.js');
export const appAuthModalComponentPath = resolveFixturePath('app/scripts/components/app-auth-modal.js');
export const appCropModalComponentPath = resolveFixturePath('app/scripts/components/app-crop-modal.js');
export const appUniversalModalsShellComponentPath = resolveFixturePath('app/scripts/components/app-universal-modals-shell.js');
export const appUniversalModalComponentsPath = resolveFixturePath('app/scripts/components/app-universal-modal-components.js');
export const appInputModalComponentPath = resolveFixturePath('app/scripts/components/app-input-modal.js');
export const appConfirmModalComponentPath = resolveFixturePath('app/scripts/components/app-confirm-modal.js');
export const appTrackListModalComponentPath = resolveFixturePath('app/scripts/components/app-track-list-modal.js');
export const appUtilityModalsShellComponentPath = resolveFixturePath('app/scripts/components/app-utility-modals-shell.js');
export const appUtilityModalComponentsPath = resolveFixturePath('app/scripts/components/app-utility-modal-components.js');
export const appQuickAddModalComponentPath = resolveFixturePath('app/scripts/components/app-quick-add-modal.js');
export const appImportModalComponentPath = resolveFixturePath('app/scripts/components/app-import-modal.js');
export const appRecInfoModalComponentPath = resolveFixturePath('app/scripts/components/app-rec-info-modal.js');
export const appPickerModalsShellComponentPath = resolveFixturePath('app/scripts/components/app-picker-modals-shell.js');
export const appPickerModalComponentsPath = resolveFixturePath('app/scripts/components/app-picker-modal-components.js');
export const appColorPickerModalComponentPath = resolveFixturePath('app/scripts/components/app-color-picker-modal.js');
export const appRootAsyncModalsPath = resolveFixturePath('app/scripts/components/app-root-async-modals.js');
export const appDurationPickerComponentPath = resolveFixturePath('app/scripts/components/app-duration-picker.js');
export const appSplitModalComponentPath = resolveFixturePath('app/scripts/components/app-split-modal.js');
export const appRootShellComponent = readOptionalFixture(appRootShellComponentPath);
export const appRootShellComponents = readOptionalFixture(appRootShellComponentsPath);
export const appRootOverlaysShellComponent = readOptionalFixture(appRootOverlaysShellComponentPath);
export const appRootOverlayShellComponents = readOptionalFixture(appRootOverlayShellComponentsPath);
export const appHeaderComponent = readOptionalFixture(appHeaderComponentPath);
export const appSidebarComponent = readOptionalFixture(appSidebarComponentPath);
export const appMainContentComponent = readOptionalFixture(appMainContentComponentPath);
export const appStandaloneOverlaysShellComponent = readOptionalFixture(appStandaloneOverlaysShellComponentPath);
export const appStandaloneOverlayComponents = readOptionalFixture(appStandaloneOverlayComponentsPath);
export const appSettingsModalComponent = readOptionalFixture(appSettingsModalComponentPath);
export const appMobileControlsComponent = readOptionalFixture(appMobileControlsComponentPath);
export const appMobileTaskInputComponent = readOptionalFixture(appMobileTaskInputComponentPath);
export const appExportCreditModalsShellComponent = readOptionalFixture(appExportCreditModalsShellComponentPath);
export const appExportCreditModalComponents = readOptionalFixture(appExportCreditModalComponentsPath);
export const appExportModalComponent = readOptionalFixture(appExportModalComponentPath);
export const appCreditModalComponent = readOptionalFixture(appCreditModalComponentPath);
export const appMidiCsvImportModalsShellComponent = readOptionalFixture(appMidiCsvImportModalsShellComponentPath);
export const appMidiCsvImportModalComponents = readOptionalFixture(appMidiCsvImportModalComponentsPath);
export const appMidiManagerModalComponent = readOptionalFixture(appMidiManagerModalComponentPath);
export const appMidiImportModalComponent = readOptionalFixture(appMidiImportModalComponentPath);
export const appCsvImportModalComponent = readOptionalFixture(appCsvImportModalComponentPath);
export const appMetadataInfoModalsShellComponent = readOptionalFixture(appMetadataInfoModalsShellComponentPath);
export const appMetadataInfoModalComponents = readOptionalFixture(appMetadataInfoModalComponentsPath);
export const appProjectInfoModalComponent = readOptionalFixture(appProjectInfoModalComponentPath);
export const appTaskActionModalsShellComponent = readOptionalFixture(appTaskActionModalsShellComponentPath);
export const appTaskActionModalComponents = readOptionalFixture(appTaskActionModalComponentsPath);
export const appEditModalComponent = readOptionalFixture(appEditModalComponentPath);
export const appAccountModalsShellComponent = readOptionalFixture(appAccountModalsShellComponentPath);
export const appAccountModalComponents = readOptionalFixture(appAccountModalComponentsPath);
export const appAuthModalComponent = readOptionalFixture(appAuthModalComponentPath);
export const appCropModalComponent = readOptionalFixture(appCropModalComponentPath);
export const appUniversalModalsShellComponent = readOptionalFixture(appUniversalModalsShellComponentPath);
export const appUniversalModalComponents = readOptionalFixture(appUniversalModalComponentsPath);
export const appInputModalComponent = readOptionalFixture(appInputModalComponentPath);
export const appConfirmModalComponent = readOptionalFixture(appConfirmModalComponentPath);
export const appTrackListModalComponent = readOptionalFixture(appTrackListModalComponentPath);
export const appUtilityModalsShellComponent = readOptionalFixture(appUtilityModalsShellComponentPath);
export const appUtilityModalComponents = readOptionalFixture(appUtilityModalComponentsPath);
export const appQuickAddModalComponent = readOptionalFixture(appQuickAddModalComponentPath);
export const appImportModalComponent = readOptionalFixture(appImportModalComponentPath);
export const appRecInfoModalComponent = readOptionalFixture(appRecInfoModalComponentPath);
export const appPickerModalsShellComponent = readOptionalFixture(appPickerModalsShellComponentPath);
export const appPickerModalComponents = readOptionalFixture(appPickerModalComponentsPath);
export const appColorPickerModalComponent = readOptionalFixture(appColorPickerModalComponentPath);
export const appRootAsyncModals = readOptionalFixture(appRootAsyncModalsPath);
export const appDurationPickerComponent = readOptionalFixture(appDurationPickerComponentPath);
export const appSplitModalComponent = readOptionalFixture(appSplitModalComponentPath);

function escapedFeaturePath(path) {
  return path.replaceAll('/', '\\/');
}

function escapedModulePath(path) {
  return path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findMatchingBrace(source, openIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  return -1;
}

function extractRootSetupReturnObject(source) {
  const returnIndex = source.lastIndexOf('return {');
  assert.notEqual(returnIndex, -1, 'app.js setup must expose a root return object');

  const openIndex = source.indexOf('{', returnIndex);
  const closeIndex = findMatchingBrace(source, openIndex);
  assert.notEqual(closeIndex, -1, 'app.js setup root return object must have balanced braces');

  return source.slice(openIndex + 1, closeIndex);
}

function extractRootComponentsObject(source, registrySource = '', rootComponentsModuleSource = '') {
  const rootOptionsReferenceMatch = source.match(/\.\.\.createAppRootOptions\(\)/);
  assert.ok(
    rootOptionsReferenceMatch,
    'app.js root Vue app must register components through createAppRootOptions()',
  );
  assert.match(
    rootComponentsModuleSource,
    /components:\s*appRootStaticComponents\b/,
    'app-root-components root options factory must mount the static component registry',
  );

  const registryIndex = registrySource.indexOf('export const appRootStaticComponents = {');
  assert.notEqual(registryIndex, -1, 'app-root-static-components registry must expose the root Vue app components object');

  const openIndex = registrySource.indexOf('{', registryIndex);
  const closeIndex = findMatchingBrace(registrySource, openIndex);
  assert.notEqual(closeIndex, -1, 'app-root-static-components registry object must have balanced braces');

  return registrySource.slice(openIndex + 1, closeIndex);
}

function stripLineComment(source, startIndex) {
  let quote = null;
  let escaped = false;

  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];
    const nextChar = source[index + 1];

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '/' && nextChar === '/') {
      const newlineIndex = source.indexOf('\n', index);
      return newlineIndex === -1 ? source.slice(startIndex, index) : source.slice(startIndex, index) + source.slice(newlineIndex);
    }
  }

  return source.slice(startIndex);
}

function extractRootReturnKeys(source) {
  return source
    .split(',')
    .map((entry) => stripLineComment(entry, 0).trim())
    .filter(Boolean)
    .map((entry) => {
      const aliasMatch = entry.match(/^([A-Za-z_$][\w$]*)\s*:/);
      if (aliasMatch) return aliasMatch[1];
      const shorthandMatch = entry.match(/^([A-Za-z_$][\w$]*)$/);
      if (shorthandMatch) return shorthandMatch[1];
      return entry;
    });
}

export const rootSetupReturnObject = extractRootSetupReturnObject(appScript);
export const rootComponentsObject = extractRootComponentsObject(appScript, appRootStaticComponents, appRootComponentsModule);

export function assertNoStaticAppImport({ modulePath, label }) {
  assert.doesNotMatch(
    appScript,
    new RegExp(`from\\s+['"]${escapedModulePath(modulePath)}['"]`),
    `app.js should not statically import ${label}`,
  );
}

export function assertDynamicAppImport({ modulePath, label }) {
  assert.match(
    appScript,
    new RegExp(`import\\(['"]${escapedModulePath(modulePath)}['"]\\)`),
    `app.js should dynamically import ${label}`,
  );
}

export function assertNoDynamicAppImport({ modulePath, label }) {
  assert.doesNotMatch(
    appScript,
    new RegExp(`import\\(['"]${escapedModulePath(modulePath)}['"]\\)`),
    `app.js should not dynamically import ${label}`,
  );
}

export function assertNoAppImport({ modulePath, label }) {
  assertNoStaticAppImport({ modulePath, label });
  assertNoDynamicAppImport({ modulePath, label });
}

export function assertNoAppRegistration({ registerPattern, label }) {
  assert.doesNotMatch(
    appScript,
    registerPattern,
    `app.js should not register ${label}`,
  );
}

export function assertSharedLazyFeatureProxy({
  proxyName,
  loaderName,
  methods,
  forbiddenPattern,
  label,
}) {
  assert.match(
    appScript,
    new RegExp(`const\\s+${escapedModulePath(proxyName)}\\s*=\\s*createLazyFeatureProxy\\(\\{[\\s\\S]*loadFeature:\\s*\\(\\)\\s*=>\\s*${escapedModulePath(loaderName)}\\(`),
    `app.js must create ${label} through the shared lazy feature proxy`,
  );

  for (const methodName of methods) {
    const escapedProxyName = escapedModulePath(proxyName);
    const escapedMethodName = escapedModulePath(methodName);
    const individualMethodPattern = new RegExp(
      `const\\s+\\w+\\s*=\\s*${escapedProxyName}\\.method\\(['"]${escapedMethodName}['"]\\);`,
    );
    const groupedMethodsPattern = new RegExp(
      `${escapedProxyName}\\.methods\\(\\[[\\s\\S]*['"]${escapedMethodName}['"]`,
    );
    assert.ok(
      individualMethodPattern.test(appScript) || groupedMethodsPattern.test(appScript),
      `app.js must expose ${label} ${methodName} through the shared lazy feature proxy`,
    );
  }

  if (forbiddenPattern) {
    assert.doesNotMatch(
      appScript,
      forbiddenPattern,
      `app.js must not keep hand-rolled ${label} lazy proxy variables`,
    );
  }
}

export function assertPackageTestScriptUsesGlob() {
  const testScript = packageJson.scripts?.test || '';

  assert.match(
    testScript,
    /^npm run verify:modularization && npm run verify:split-state && node --test tests\/\*\.test\.mjs$/,
    'npm test must run fixed non-test-file gates and discover every top-level .test.mjs file through a glob',
  );
  assert.doesNotMatch(
    testScript,
    /tests\/[a-z0-9-]+\.test\.mjs\s+tests\//i,
    'npm test must not maintain a hand-written list of individual .test.mjs files',
  );
}

export function assertPackageDeclaresModuleType() {
  assert.equal(
    packageJson.type,
    'module',
    'package.json must declare ESM package type so app/test .js modules are not reparsed heuristically',
  );
}

export function assertLazyFeatureBoundary({ featurePath, registerName, label }) {
  assert.doesNotMatch(
    appScript,
    new RegExp(`import\\s+\\{\\s*${registerName}\\s*\\}\\s+from\\s+['"]\\.\\/${escapedFeaturePath(featurePath)}\\.js['"]`),
    `app.js should not statically import the ${label}`,
  );
  assert.match(
    appScript,
    new RegExp(`import\\(['"]\\.\\/${escapedFeaturePath(featurePath)}\\.js['"]\\)`),
    `app.js should dynamically import the ${label}`,
  );
}

export function assertStaticFeatureImport({ featurePath, registerName, label }) {
  assert.match(
    appScript,
    new RegExp(`import\\s+\\{\\s*${registerName}\\s*\\}\\s+from\\s+['"]\\.\\/${escapedFeaturePath(featurePath)}\\.js['"]`),
    `app.js should statically import the ${label}`,
  );
}

export function assertAppStaticImportSurface() {
  const staticImportLines = appScript.match(/^import\s+.+;$/gm) || [];
  assert.deepEqual(
    staticImportLines,
    ["import { createAppDependencies } from './services/app-dependencies.js';"],
    'app.js should expose only the app dependency registry as its static import surface',
  );
}

export function assertAppRootSetupReturnSurface() {
  const rootSetupReturnKeys = extractRootReturnKeys(rootSetupReturnObject);

  assert.deepEqual(
    rootSetupReturnKeys,
    ['appRootShell', 'appRootOverlaysShell'],
    'app.js setup should only return the two root shell contexts consumed by index.html',
  );
}

export function assertNoRootSetupReturnFields({ fields, messageForField }) {
  for (const field of fields) {
    assert.doesNotMatch(
      rootSetupReturnObject,
      new RegExp(`\\b${field}\\b`),
      messageForField(field),
    );
  }
}

export function assertAppRootTemplateSurface() {
  assert.match(
    indexHtml,
    /<app-root-shell\b[^>]*:ctx="appRootShell"[^>]*><\/app-root-shell>/,
    'index.html must render the app-root-shell component with only the main root shell ctx',
  );
  assert.match(
    indexHtml,
    /<app-root-overlays-shell\b[^>]*:ctx="appRootOverlaysShell"[^>]*><\/app-root-overlays-shell>/,
    'index.html must render app-root-overlays-shell with only the root overlay shell ctx',
  );
  assert.doesNotMatch(
    indexHtml,
    /<div class="liquid-window[\s\S]*?<app-mobile-controls\b[\s\S]*?<\/div>\s*<\/div>/,
    'index.html should not retain the inline liquid-window child component layout after app-root-shell extraction',
  );
  assert.doesNotMatch(
    indexHtml,
    /<app-(?:standalone-overlays|task-action-modals|account-modals|utility-modals|universal-modals|picker-modals|export-credit-modals|midi-csv-import-modals|metadata-info-modals)-shell\b/,
    'index.html should expose overlay groups only through app-root-overlays-shell',
  );
}

export function assertRootShellStateBoundary({ createRootShellState, vueReactive }) {
  assert.match(
    rootShellStateModule,
    /export function createRootShellState\(\{\s*reactive,\s*appHeader,\s*appSidebar,\s*appMainContent,\s*appMobileControls,\s*appStandaloneOverlaysShell,\s*appTaskActionModalsShell,\s*appAccountModalsShell,\s*appUtilityModalsShell,\s*appUniversalModalsShell,\s*appPickerModalsShell,\s*appExportCreditModalsShell,\s*appMidiCsvImportModalsShell,\s*appMetadataInfoModalsShell,?\s*\}\)\s*\{[\s\S]*const appRootShell\s*=\s*reactive\(\{[\s\S]*appHeader[\s\S]*appSidebar[\s\S]*appMainContent[\s\S]*appMobileControls[\s\S]*\}\);[\s\S]*const appRootOverlaysShell\s*=\s*reactive\(\{[\s\S]*appStandaloneOverlaysShell[\s\S]*appTaskActionModalsShell[\s\S]*appAccountModalsShell[\s\S]*appUtilityModalsShell[\s\S]*appUniversalModalsShell[\s\S]*appPickerModalsShell[\s\S]*appExportCreditModalsShell[\s\S]*appMidiCsvImportModalsShell[\s\S]*appMetadataInfoModalsShell[\s\S]*\}\);[\s\S]*return\s*\{[\s\S]*appRootShell[\s\S]*appRootOverlaysShell[\s\S]*\};[\s\S]*\}/,
    'root-shell-state module must own the two top-level root shell ctx wrappers',
  );

  const rootShellInputs = {
    reactive: vueReactive,
    appHeader: { name: 'header' },
    appSidebar: { name: 'sidebar' },
    appMainContent: { name: 'main' },
    appMobileControls: { name: 'mobile' },
    appStandaloneOverlaysShell: { name: 'standalone-overlays' },
    appTaskActionModalsShell: { name: 'task-actions' },
    appAccountModalsShell: { name: 'account' },
    appUtilityModalsShell: { name: 'utility' },
    appUniversalModalsShell: { name: 'universal' },
    appPickerModalsShell: { name: 'picker' },
    appExportCreditModalsShell: { name: 'export-credit' },
    appMidiCsvImportModalsShell: { name: 'midi-csv-import' },
    appMetadataInfoModalsShell: { name: 'metadata-info' },
  };
  const rootShellStateA = createRootShellState(rootShellInputs);
  const rootShellStateB = createRootShellState(rootShellInputs);
  assert.deepEqual(
    Object.keys(rootShellStateA.appRootShell),
    ['appHeader', 'appSidebar', 'appMainContent', 'appMobileControls'],
    'root shell state must expose only the main root shell ctx group',
  );
  assert.deepEqual(rootShellStateA.appRootShell.appHeader, rootShellInputs.appHeader, 'root shell state must preserve the app header ctx value');
  assert.deepEqual(rootShellStateA.appRootShell.appSidebar, rootShellInputs.appSidebar, 'root shell state must preserve the app sidebar ctx value');
  assert.deepEqual(rootShellStateA.appRootShell.appMainContent, rootShellInputs.appMainContent, 'root shell state must preserve the app main content ctx value');
  assert.deepEqual(rootShellStateA.appRootShell.appMobileControls, rootShellInputs.appMobileControls, 'root shell state must preserve the app mobile controls ctx value');
  assert.deepEqual(
    Object.keys(rootShellStateA.appRootOverlaysShell),
    [
      'appStandaloneOverlaysShell',
      'appTaskActionModalsShell',
      'appAccountModalsShell',
      'appUtilityModalsShell',
      'appUniversalModalsShell',
      'appPickerModalsShell',
      'appExportCreditModalsShell',
      'appMidiCsvImportModalsShell',
      'appMetadataInfoModalsShell',
    ],
    'root shell state must expose only the overlay shell ctx group',
  );
  assert.deepEqual(
    rootShellStateA.appRootOverlaysShell.appMetadataInfoModalsShell,
    rootShellInputs.appMetadataInfoModalsShell,
    'root shell state must preserve the metadata info overlay ctx value',
  );
  assert.notEqual(
    rootShellStateA.appRootShell,
    rootShellStateB.appRootShell,
    'createRootShellState must return a fresh main root shell wrapper per app instance',
  );
  assert.notEqual(
    rootShellStateA.appRootOverlaysShell,
    rootShellStateB.appRootOverlaysShell,
    'createRootShellState must return a fresh overlay shell wrapper per app instance',
  );
  assert.throws(
    () => createRootShellState({ ...rootShellInputs, reactive: undefined }),
    /createRootShellState requires Vue reactive factory/,
    'root shell state should fail clearly when Vue reactive is missing',
  );
  assertAppStateFactoriesRegistry({
    factoryName: 'createRootShellState',
    modulePath: 'root-shell-state.js',
    label: 'root shell state factory',
  });
  assert.doesNotMatch(
    appScript,
    /const appRootShell\s*=\s*reactive\(\{[\s\S]*appHeader[\s\S]*appSidebar[\s\S]*appMainContent[\s\S]*appMobileControls[\s\S]*\}\);/,
    'app.js should not own the top-level main root shell wrapper after root-shell-state extraction',
  );
  assertAppRootTemplateSurface();
  assertNoRootSetupReturnFields({
    fields: ['appHeader', 'appSidebar', 'appMainContent', 'appMobileControls'],
    messageForField: (field) => `app.js root setup return should expose main layout context ${field} through appRootShell instead of the root return`,
  });
}

export function assertAppDependenciesRegistry() {
  assert.ok(
    appDependenciesModule,
    'app-dependencies service registry should exist',
  );
  assert.match(
    appScript,
    /import \{ createAppDependencies \} from '\.\/services\/app-dependencies\.js';/,
    'app.js should import the app dependency registry',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateApp\b[\s\S]*\btimeUtils\b[\s\S]*\bstorageService\b[\s\S]*\bloadNotificationsFeature\b[\s\S]*\bregisterAppRuntimeFeature\b[\s\S]*\bcreateMuscheStore\b[\s\S]*\bcreateAppRootOptions\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should consume composed app dependencies from createAppDependencies()',
  );
  for (const factoryName of [
    'createAppVueRuntime',
    'createAppUtilityFunctions',
    'createAppBootstrapServices',
    'createAppSupportLoaders',
    'createAppFeatureLoaders',
    'createAppFeatureRegistrars',
    'createAppStateFactories',
    'createAppRootComponents',
  ]) {
    assert.match(
      appDependenciesModule,
      new RegExp(`\\b${factoryName}\\b`),
      `app-dependencies should compose ${factoryName}`,
    );
    assert.doesNotMatch(
      appScript,
      new RegExp(`import\\s+\\{\\s*${factoryName}\\s*\\}\\s+from\\s+['"]\\.\\/services\\/`),
      `app.js should not directly import ${factoryName} after dependency registry extraction`,
    );
  }
}

export function assertAppFeatureRegistrarRegistry({ factoryName, registerName, modulePath, label }) {
  assert.ok(
    appFeatureRegistrarsModule,
    'app-feature-registrars service registry should exist',
  );
  assert.match(
    appDependenciesModule,
    /import \{ createAppFeatureRegistrars \} from '\.\/app-feature-registrars\.js';/,
    'app-dependencies should import the app feature registrar registry',
  );
  assert.match(
    appScript,
    new RegExp(`\\b${registerName}\\b[\\s\\S]*=\\s*createAppDependencies\\(\\);`),
    `app.js should get ${label} from the app dependency registry`,
  );
  assert.doesNotMatch(
    appScript,
    new RegExp(`import\\s+\\{\\s*${factoryName}\\s*\\}\\s+from\\s+['"]\\.\\/services\\/${escapedModulePath(modulePath)}['"]`),
    `app.js should not directly import the ${label} registrar service after registry extraction`,
  );
  assert.match(
    appDependenciesModule,
    /createAppFeatureRegistrars\(/,
    'app-dependencies should create the app feature registrar registry',
  );
  assert.match(
    appFeatureRegistrarsModule,
    new RegExp(`import\\s+\\{\\s*${factoryName}\\s*\\}\\s+from\\s+['"]\\.\\/${escapedModulePath(modulePath)}['"]`),
    `app feature registrar registry should import the ${label} registrar service`,
  );
  assert.match(
    appFeatureRegistrarsModule,
    new RegExp(`${registerName}\\s*:\\s*${factoryName}\\(`),
    `app feature registrar registry should create the ${label} registration function`,
  );
}

export function assertAppFeatureLoadersRegistry({ factoryName, loaderName, modulePath, label }) {
  assert.ok(
    appFeatureLoadersModule,
    'app-feature-loaders service registry should exist',
  );
  assert.match(
    appDependenciesModule,
    /import \{ createAppFeatureLoaders \} from '\.\/app-feature-loaders\.js';/,
    'app-dependencies should import the app feature loader registry',
  );
  assert.match(
    appScript,
    new RegExp(`\\b${loaderName}\\b[\\s\\S]*=\\s*createAppDependencies\\(\\);`),
    `app.js should get ${label} from the app dependency registry`,
  );
  assert.doesNotMatch(
    appScript,
    new RegExp(`import\\s+\\{\\s*${factoryName}\\s*\\}\\s+from\\s+['"]\\.\\/services\\/${escapedModulePath(modulePath)}['"]`),
    `app.js should not directly import the ${label} loader service after feature-loader registry extraction`,
  );
  assert.match(
    appDependenciesModule,
    /createAppFeatureLoaders\(/,
    'app-dependencies should create the app feature loader registry',
  );
  assert.match(
    appFeatureLoadersModule,
    new RegExp(`import\\s+\\{\\s*${factoryName}\\s*\\}\\s+from\\s+['"]\\.\\/${escapedModulePath(modulePath)}['"]`),
    `app feature loader registry should import the ${label} loader service`,
  );
  assert.match(
    appFeatureLoadersModule,
    new RegExp(`${loaderName}\\s*:\\s*${factoryName}\\(`),
    `app feature loader registry should create the ${label} loader`,
  );
}

export function assertAppStateFactoriesRegistry({ factoryName, modulePath, label }) {
  assert.ok(
    appStateFactoriesModule,
    'app-state-factories registry should exist',
  );
  assert.match(
    appDependenciesModule,
    /import \{ createAppStateFactories \} from '\.\/app-state-factories\.js';/,
    'app-dependencies should import the app state factory registry',
  );
  assert.match(
    appScript,
    new RegExp(`\\b${factoryName}\\b[\\s\\S]*=\\s*createAppDependencies\\(\\);`),
    `app.js should get ${label} from the app dependency registry`,
  );
  assert.doesNotMatch(
    appScript,
    new RegExp(`import\\s+\\{\\s*${factoryName}\\s*\\}\\s+from\\s+['"]\\.\\/state\\/${escapedModulePath(modulePath)}['"]`),
    `app.js should not directly import the ${label} after state factory registry extraction`,
  );
  assert.match(
    appDependenciesModule,
    /createAppStateFactories\(/,
    'app-dependencies should create the app state factory registry',
  );
  assert.match(
    appStateFactoriesModule,
    new RegExp(`import\\s+\\{[^}]*\\b${factoryName}\\b(?:\\s+as\\s+\\w+)?[^}]*\\}\\s+from\\s+['"]\\.\\.\\/state\\/${escapedModulePath(modulePath)}['"]`),
    `app state factory registry should import the ${label}`,
  );
  assert.match(
    appStateFactoriesModule,
    new RegExp(`\\b${factoryName}\\b`),
    `app state factory registry should expose the ${label}`,
  );
}

export function assertTrackListStateBoundary({ createTrackListState, vueRef }) {
  assert.match(
    trackListStateModule,
    /export function createTrackListState\(\{\s*ref\s*\}\)\s*\{[\s\S]*const trackListReady\s*=\s*ref\(false\);[\s\S]*return\s*\{[\s\S]*trackListReady,[\s\S]*\};[\s\S]*\}/,
    'track-list-state module must own the Track List lazy readiness flag',
  );
  assert.ok(
    appStateFactoriesModule,
    'app-state-factories registry should exist',
  );
  assert.match(
    appDependenciesModule,
    /import \{ createAppStateFactories \} from '\.\/app-state-factories\.js';/,
    'app-dependencies should import the app state factory registry',
  );
  assert.match(
    appDependenciesModule,
    /createAppStateFactories\(/,
    'app-dependencies should create the app state factory registry',
  );
  assert.match(
    appStateFactoriesModule,
    /import \{ createTrackListState \} from '\.\.\/state\/track-list-state\.js';/,
    'app state factory registry should import the Track List state factory',
  );
  assert.match(
    appStateFactoriesModule,
    /\bcreateTrackListState\b/,
    'app state factory registry should expose the raw Track List state factory for focused tests',
  );
  assert.doesNotMatch(
    appScript,
    /import\s+\{\s*createTrackListState\s*\}\s+from\s+['"]\.\/state\/track-list-state\.js['"]/,
    'app.js should not directly import the Track List state factory after state factory registry extraction',
  );
  assert.match(
    appScript,
    /\bcreateRootTrackListState\b[\s\S]*=\s*createAppDependencies\(\);/,
    'app.js should get the bound Track List state factory from createAppDependencies()',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootTrackListState\(\)\s*\{[\s\S]*return createTrackListState\(\{[\s\S]*ref[\s\S]*\}\);[\s\S]*\}/,
    'app state factory registry should bind Vue ref for Track List state',
  );
  assert.match(
    appStateFactoriesModule,
    /return\s*\{[\s\S]*createTrackListState,[\s\S]*createRootTrackListState[\s\S]*\};/,
    'app state factory registry should expose the bound Track List state factory',
  );
  assert.match(
    appScript,
    /const\s+\{\s*trackListReady\s*\}\s*=\s*createRootTrackListState\(\)/,
    'app.js must create Track List lazy readiness state through the bound Track List state factory',
  );
  assert.doesNotMatch(
    appScript,
    /createTrackListState\(\{\s*ref\s*\}\)/,
    'app.js should not wire Vue ref into Track List state directly',
  );
  assert.doesNotMatch(
    appScript,
    /const\s+trackListReady\s*=\s*ref\(false\);/,
    'app.js should not own Track List lazy readiness state after track-list-state extraction',
  );

  const trackListStateA = createTrackListState({ ref: vueRef });
  const trackListStateB = createTrackListState({ ref: vueRef });
  assert.equal(trackListStateA.trackListReady.value, false, 'Track List state must default readiness to false');
  assert.notEqual(trackListStateA.trackListReady, trackListStateB.trackListReady, 'Track List state must return a fresh readiness ref per app instance');
  assert.throws(
    () => createTrackListState({}),
    /createTrackListState requires Vue ref factory/,
    'Track List state should fail clearly when Vue ref is missing',
  );
}

export function assertRootAppStateFactoryRegistry() {
  assert.ok(
    appStateFactoriesModule,
    'app-state-factories registry should exist',
  );
  assert.match(
    appDependenciesModule,
    /import \{ createAppStateFactories \} from '\.\/app-state-factories\.js';/,
    'app-dependencies should import the app state factory registry',
  );
  assert.match(
    appStateFactoriesModule,
    /import \{ createAppState \} from '\.\.\/state\/app-state\.js';/,
    'app state factory registry should import the pure root app state factory',
  );
  assert.match(
    appStateFactoriesModule,
    /\bcreateAppState\b/,
    'app state factory registry should continue exposing the pure root app state factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootAppState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the bound root app state factory from createAppDependencies()',
  );
  assert.doesNotMatch(
    appScript,
    /createAppState\(\{\s*ref,\s*reactive,\s*getWindowWidth:\s*\(\)\s*=>\s*window\.innerWidth\s*,?\s*\}\)/,
    'app.js should not wire Vue primitives and window width into root app state directly',
  );
  assert.match(
    appDependenciesModule,
    /createAppStateFactories\(\{[\s\S]*ref:\s*vueRuntime\.ref,[\s\S]*reactive:\s*vueRuntime\.reactive,[\s\S]*\}\)/,
    'app-dependencies should bind Vue state primitives when creating state factories',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootAppState\(\)\s*\{[\s\S]*return createAppState\(\{[\s\S]*ref,[\s\S]*reactive,[\s\S]*getWindowWidth:\s*\(\)\s*=>\s*globalThis\.window\?\.innerWidth\s*\?\?\s*1024[\s\S]*\}\);[\s\S]*\}/,
    'app-state-factories should expose a root app state factory bound to Vue and browser width',
  );
  assert.match(
    appStateFactoriesModule,
    /return\s*\{[\s\S]*createAppState,[\s\S]*createRootAppState[\s\S]*\};/,
    'app-state-factories should continue exposing the pure app state factory and the bound root factory',
  );
}

export function assertRootAppStateBoundary({ createAppState, vueRef, vueReactive }) {
  const appStateA = createAppState({
    ref: vueRef,
    reactive: vueReactive,
    getWindowWidth: () => 640,
  });
  const appStateB = createAppState({
    ref: vueRef,
    reactive: vueReactive,
    getWindowWidth: () => 1024,
  });
  assert.equal(appStateA.sidebarTab.value, 'musician', 'app state module must create the default sidebar tab');
  assert.equal(appStateA.mobileTab.value, 'schedule', 'app state module must create the default mobile tab');
  assert.equal(appStateA.isMobile.value, true, 'app state module must derive mobile state from the provided window width');
  assert.equal(appStateB.isMobile.value, false, 'app state module must derive desktop state from the provided window width');
  assert.deepEqual(
    appStateA.newItem,
    { projectId: '', instrumentId: '', musicianId: '', musicDuration: '', ratio: 20 },
    'app state module must create the new-item draft state',
  );
  assert.equal(appStateA.sortField.value, 'status', 'app state module must create the default stats sort field');
  assert.equal(appStateA.sortAsc.value, true, 'app state module must create the default stats sort direction');
  assert.equal(appStateA.authPasswordRef.value, null, 'app state module must create the auth password ref');
  assert.equal(appStateA.draggingTaskElement.value, null, 'app state module must create the dragging task ref');
  assert.ok(appStateA.isZooming, 'app state module must expose the root zooming ref');
  assert.equal(appStateA.isZooming.value, false, 'app state module must create the default zooming flag');
  assert.ok(appStateA.weekGridWrapper, 'app state module must expose the week grid wrapper ref');
  assert.equal(appStateA.weekGridWrapper.value, null, 'app state module must create the week grid wrapper ref');
  assert.equal(typeof appStateA.onBeforeLeave, 'function', 'app state module must expose the root before-leave hook');
  assert.equal(typeof appStateA.onAfterLeave, 'function', 'app state module must expose the root after-leave hook');
  assert.notEqual(appStateA.newItem, appStateB.newItem, 'createAppState must return fresh reactive draft state per app instance');
  assert.equal(appStateA.dragState.dragSourceType, 'schedule', 'app state module must preserve the default drag source type');
  assert.equal(appStateA.dragState.dragElClone, null, 'app state module must initialize drag clone state');
  appStateA.dragState.dragSourceTask = { id: 'TASK_A' };
  assert.equal(appStateA.dragState.dragSourceTask.id, 'TASK_A', 'app state module must expose mutable drag state');
  assert.equal(appStateB.dragState.dragSourceTask, null, 'app state module drag state must not leak between app instances');
  assert.throws(
    () => createAppState({ ref: vueRef, reactive: vueReactive, getWindowWidth: 640 }),
    /createAppState requires getWindowWidth to be a function when provided/,
    'app state module should fail clearly when getWindowWidth is not callable',
  );
  assert.match(
    appStateModule,
    /export function createAppState/,
    'state/app-state.js must own root-local runtime state creation',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateMuscheStore\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js must get the Musche store factory from the app dependency registry',
  );
  assert.match(
    appDependenciesModule,
    /createAppStateFactories\(/,
    'app-dependencies must compose the app state factory registry',
  );
  assert.doesNotMatch(
    appScript,
    /from '\.\/store\/index\.js';/,
    'app.js should not directly import the Musche store after state factory registry extraction',
  );
  assert.match(
    appStateFactoriesModule,
    /import \{ createMuscheStore \} from '\.\.\/store\/index\.js';/,
    'app-state-factories registry must import the Musche store factory',
  );
  assert.match(
    appStateFactoriesModule,
    /return\s*\{[\s\S]*\bcreateMuscheStore\b[\s\S]*\};/,
    'app-state-factories registry must expose the Musche store factory',
  );
  assertRootAppStateFactoryRegistry();
  assert.match(
    appScript,
    /const\s+\{[\s\S]*sidebarTab[\s\S]*isZooming,[\s\S]*weekGridWrapper,[\s\S]*onBeforeLeave,[\s\S]*onAfterLeave,[\s\S]*dragState,[\s\S]*\}\s*=\s*createRootAppState\(\)/,
    'app.js must compose sidebar, mobile, draft, sort, drag, and root transition state from the bound root app state factory',
  );
  for (const inlineStatePattern of [
    /const\s+sidebarTab\s*=\s*ref\('musician'\)/,
    /const\s+mobileTab\s*=\s*ref\('schedule'\)/,
    /const\s+isMobile\s*=\s*ref\(window\.innerWidth\s*<\s*800\)/,
    /const\s+newItem\s*=\s*reactive\(\{projectId:\s*'',\s*instrumentId:\s*'',\s*musicianId:\s*'',\s*musicDuration:\s*'',\s*ratio:\s*20\}\)/,
    /const\s+sortField\s*=\s*ref\('status'\)/,
    /const\s+sortAsc\s*=\s*ref\(true\)/,
    /const\s+authPasswordRef\s*=\s*ref\(null\)/,
    /const\s+draggingTaskElement\s*=\s*ref\(null\)/,
    /const\s+isZooming\s*=\s*ref\(false\)/,
    /const\s+weekGridWrapper\s*=\s*ref\(null\)/,
    /const\s+onBeforeLeave\s*=\s*\(\)\s*=>\s*\{\}/,
    /const\s+onAfterLeave\s*=\s*\(\)\s*=>\s*\{\}/,
    /let\s+dragElClone\s*=\s*null/,
    /let\s+dragSourceTask\s*=\s*null/,
    /let\s+dragSourceType\s*=\s*'schedule'/,
  ]) {
    assert.doesNotMatch(
      appScript,
      inlineStatePattern,
      'app.js should not retain root-local runtime state creation after app-state extraction',
    );
  }
}

export function assertRootDataIoStateFactoryRegistry() {
  assert.ok(
    appStateFactoriesModule,
    'app-state-factories registry should exist',
  );
  assert.match(
    appDependenciesModule,
    /import \{ createAppStateFactories \} from '\.\/app-state-factories\.js';/,
    'app-dependencies should import the app state factory registry',
  );
  assert.match(
    appStateFactoriesModule,
    /import \{ createDataIoState \} from '\.\.\/state\/data-io-state\.js';/,
    'app state factory registry should import the pure data I/O state factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootDataIoState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the bound data I/O state factory from createAppDependencies()',
  );
  assert.doesNotMatch(
    appScript,
    /createDataIoState\(\{\s*ref,\s*reactive,\s*shallowRef\s*,?\s*\}\)/,
    'app.js should not wire Vue primitives into data I/O state directly',
  );
  assert.match(
    appDependenciesModule,
    /createAppStateFactories\(\{[\s\S]*ref:\s*vueRuntime\.ref,[\s\S]*reactive:\s*vueRuntime\.reactive,[\s\S]*shallowRef:\s*vueRuntime\.shallowRef,?[\s\S]*\}\)/,
    'app-dependencies should bind Vue ref, reactive, and shallowRef when creating state factories',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootDataIoState\(\)\s*\{[\s\S]*return createDataIoState\(\{[\s\S]*ref,[\s\S]*reactive,[\s\S]*shallowRef[\s\S]*\}\);[\s\S]*\}/,
    'app-state-factories should expose a data I/O state factory bound to Vue primitives',
  );
  assert.match(
    appStateFactoriesModule,
    /return\s*\{[\s\S]*createDataIoState,[\s\S]*createRootDataIoState[\s\S]*\};/,
    'app-state-factories should continue exposing the pure data I/O state factory and the bound root factory',
  );
}

export function assertDataIoStateBoundary({ createDataIoState, vueRef, vueReactive, vueShallowRef }) {
  assert.match(
    dataIoStateModule,
    /export function createDataIoState\(\{\s*ref,\s*reactive,\s*shallowRef\s*\}\)\s*\{[\s\S]*const showImportModal\s*=\s*ref\(false\);[\s\S]*const showExportModal\s*=\s*ref\(false\);[\s\S]*const exportFilter\s*=\s*reactive\(\{[\s\S]*sessions:\s*new Set\(\),[\s\S]*projects:\s*new Set\(\),[\s\S]*musicians:\s*new Set\(\),[\s\S]*instruments:\s*new Set\(\),[\s\S]*types:\s*new Set\(\['REC', 'EDT'\]\),[\s\S]*dateFrom:\s*'',[\s\S]*dateTo:\s*'',[\s\S]*searchProject:\s*'',[\s\S]*searchMusician:\s*'',[\s\S]*searchInstrument:\s*'',[\s\S]*\}\);[\s\S]*const dataIoFeatureRef\s*=\s*shallowRef\(null\);[\s\S]*return\s*\{[\s\S]*showImportModal,[\s\S]*showExportModal,[\s\S]*exportFilter,[\s\S]*dataIoFeatureRef,[\s\S]*\};[\s\S]*\}/,
    'data-io-state module must own import/export modal state defaults',
  );

  const dataIoStateA = createDataIoState({
    ref: vueRef,
    reactive: vueReactive,
    shallowRef: vueShallowRef,
  });
  const dataIoStateB = createDataIoState({
    ref: vueRef,
    reactive: vueReactive,
    shallowRef: vueShallowRef,
  });
  assert.equal(dataIoStateA.showImportModal.value, false, 'data I/O state must default import modal visibility to false');
  assert.equal(dataIoStateA.showExportModal.value, false, 'data I/O state must default export modal visibility to false');
  assert.equal(dataIoStateA.dataIoFeatureRef.value, null, 'data I/O state must default the lazy feature ref to null');
  assert.deepEqual(
    [...dataIoStateA.exportFilter.types],
    ['REC', 'EDT'],
    'data I/O state must preserve the default export task type filter',
  );
  assert.deepEqual(
    [...dataIoStateA.exportFilter.sessions],
    [],
    'data I/O state must default session export filters to an empty set',
  );
  assert.notEqual(
    dataIoStateA.exportFilter,
    dataIoStateB.exportFilter,
    'createDataIoState must return a fresh export filter per app instance',
  );
  assert.notEqual(
    dataIoStateA.exportFilter.types,
    dataIoStateB.exportFilter.types,
    'createDataIoState must return fresh export filter sets per app instance',
  );
  assert.throws(
    () => createDataIoState({ reactive: vueReactive, shallowRef: vueShallowRef }),
    /createDataIoState requires Vue ref, reactive, and shallowRef factories/,
    'data I/O state should fail clearly when Vue ref is missing',
  );
  assert.throws(
    () => createDataIoState({ ref: vueRef, shallowRef: vueShallowRef }),
    /createDataIoState requires Vue ref, reactive, and shallowRef factories/,
    'data I/O state should fail clearly when Vue reactive is missing',
  );
  assert.throws(
    () => createDataIoState({ ref: vueRef, reactive: vueReactive }),
    /createDataIoState requires Vue ref, reactive, and shallowRef factories/,
    'data I/O state should fail clearly when Vue shallowRef is missing',
  );
  assertRootDataIoStateFactoryRegistry();
  assert.match(
    appScript,
    /const\s+\{[\s\S]*showImportModal,[\s\S]*showExportModal,[\s\S]*exportFilter,[\s\S]*dataIoFeatureRef,[\s\S]*\}\s*=\s*createRootDataIoState\(\)/,
    'app.js must create data I/O modal state through the bound data I/O state factory',
  );
  assert.doesNotMatch(
    appScript,
    /const showImportModal\s*=\s*ref\(false\);[\s\S]*const showExportModal\s*=\s*ref\(false\);[\s\S]*const exportFilter\s*=\s*reactive\(\{[\s\S]*types:\s*new Set\(\['REC', 'EDT'\]\),[\s\S]*\}\);/,
    'app.js should not own data I/O modal state defaults after data-io-state extraction',
  );
  assert.doesNotMatch(
    appScript,
    /const\s+dataIoFeatureRef\s*=\s*shallowRef\(null\);/,
    'app.js should not own the data I/O lazy feature ref after data-io-state extraction',
  );
}

export function assertRootImportDataStateFactoryRegistry() {
  assert.ok(
    appStateFactoriesModule,
    'app-state-factories registry should exist',
  );
  assert.match(
    appDependenciesModule,
    /import \{ createAppStateFactories \} from '\.\/app-state-factories\.js';/,
    'app-dependencies should import the app state factory registry',
  );
  assert.match(
    appStateFactoriesModule,
    /import \{ createImportDataState \} from '\.\.\/state\/import-data-state\.js';/,
    'app state factory registry should import the pure import-data state factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootImportDataState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the bound import-data state factory from createAppDependencies()',
  );
  assert.doesNotMatch(
    appScript,
    /createImportDataState\(\{\s*computed,\s*reactive\s*,?\s*\}\)/,
    'app.js should not wire Vue primitives into import-data state directly',
  );
  assert.match(
    appDependenciesModule,
    /createAppStateFactories\(\{[\s\S]*computed:\s*vueRuntime\.computed,[\s\S]*\}\)/,
    'app-dependencies should bind Vue computed when creating state factories',
  );
  assert.match(
    appDependenciesModule,
    /createAppStateFactories\(\{[\s\S]*reactive:\s*vueRuntime\.reactive,[\s\S]*\}\)/,
    'app-dependencies should bind Vue computed and reactive when creating state factories',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootImportDataState\(\)\s*\{[\s\S]*return createImportDataState\(\{[\s\S]*computed,[\s\S]*reactive[\s\S]*\}\);[\s\S]*\}/,
    'app-state-factories should expose an import-data state factory bound to Vue primitives',
  );
  assert.match(
    appStateFactoriesModule,
    /return\s*\{[\s\S]*createImportDataState,[\s\S]*createRootImportDataState[\s\S]*\};/,
    'app-state-factories should continue exposing the pure import-data state factory and the bound root factory',
  );
}

export function assertImportDataStateBoundary({ createImportDataState, vueComputed, vueReactive }) {
  assert.match(
    importDataStateModule,
    /export function createImportDataState\(\{\s*computed,\s*reactive\s*\}\)\s*\{[\s\S]*let groupedCsvData\s*=\s*computed\(\(\)\s*=>\s*\[\]\);[\s\S]*let isAllSelected\s*=\s*computed\(\(\)\s*=>\s*false\);[\s\S]*let availableInstrumentGroups\s*=\s*computed\(\(\)\s*=>\s*\[\]\);[\s\S]*let midiGroupData\s*=\s*computed\(\(\)\s*=>\s*\[\]\);[\s\S]*let currentMidiDisplayList\s*=\s*computed\(\(\)\s*=>\s*\[\]\);[\s\S]*let filteredImportOptions\s*=\s*computed\(\(\)\s*=>\s*\[\]\);[\s\S]*let midiGroupExpanded\s*=\s*reactive\(new Set\(\)\);[\s\S]*return\s*\{[\s\S]*groupedCsvData,[\s\S]*isAllSelected,[\s\S]*availableInstrumentGroups,[\s\S]*midiGroupData,[\s\S]*currentMidiDisplayList,[\s\S]*filteredImportOptions,[\s\S]*midiGroupExpanded,[\s\S]*\};[\s\S]*\}/,
    'import-data-state module must own the fallback import-data computed state',
  );

  const importDataStateA = createImportDataState({ computed: vueComputed, reactive: vueReactive });
  const importDataStateB = createImportDataState({ computed: vueComputed, reactive: vueReactive });
  assert.deepEqual(importDataStateA.groupedCsvData.value, [], 'import-data state must default grouped CSV data to an empty computed list');
  assert.equal(importDataStateA.isAllSelected.value, false, 'import-data state must default all-selected status to false');
  assert.deepEqual(importDataStateA.availableInstrumentGroups.value, [], 'import-data state must default available instrument groups to an empty computed list');
  assert.deepEqual(importDataStateA.midiGroupData.value, [], 'import-data state must default MIDI group data to an empty computed list');
  assert.deepEqual(importDataStateA.currentMidiDisplayList.value, [], 'import-data state must default MIDI display list to an empty computed list');
  assert.deepEqual(importDataStateA.filteredImportOptions.value, [], 'import-data state must default filtered import options to an empty computed list');
  assert.ok(importDataStateA.midiGroupExpanded instanceof Set, 'import-data state must expose a fallback expanded MIDI group set');
  assert.notEqual(
    importDataStateA.midiGroupExpanded,
    importDataStateB.midiGroupExpanded,
    'createImportDataState must return a fresh MIDI group expansion set per app instance',
  );
  assert.throws(
    () => createImportDataState({ reactive: vueReactive }),
    /createImportDataState requires Vue computed and reactive factories/,
    'import-data state should fail clearly when Vue computed is missing',
  );
  assert.throws(
    () => createImportDataState({ computed: vueComputed }),
    /createImportDataState requires Vue computed and reactive factories/,
    'import-data state should fail clearly when Vue reactive is missing',
  );
  assertRootImportDataStateFactoryRegistry();
  assert.match(
    appScript,
    /let\s+\{\s*groupedCsvData,\s*isAllSelected,\s*availableInstrumentGroups,\s*midiGroupData,\s*currentMidiDisplayList,\s*filteredImportOptions,\s*midiGroupExpanded,\s*\}\s*=\s*createRootImportDataState\(\)/,
    'app.js must create import-data fallback state through the bound import-data state factory',
  );
  assert.doesNotMatch(
    appScript,
    /let groupedCsvData\s*=\s*computed\(\(\)\s*=>\s*\[\]\);[\s\S]*let isAllSelected\s*=\s*computed\(\(\)\s*=>\s*false\);[\s\S]*let availableInstrumentGroups\s*=\s*computed\(\(\)\s*=>\s*\[\]\);[\s\S]*let midiGroupExpanded\s*=\s*reactive\(new Set\(\)\);/,
    'app.js should not own import-data fallback computed defaults after import-data-state extraction',
  );
}

export function assertMetadataModalStateBoundary({ createMetadataModalState, vueRef, vueReactive, vueShallowRef }) {
  assert.match(
    metadataModalStateModule,
    /export function createMetadataModalState\(\{\s*ref,\s*reactive,\s*shallowRef\s*\}\)\s*\{[\s\S]*const showRecInfoModal\s*=\s*ref\(false\);[\s\S]*const recInfoForm\s*=\s*reactive\(\{[\s\S]*studio:\s*'',[\s\S]*engineer:\s*'',[\s\S]*operator:\s*'',[\s\S]*assistant:\s*'',[\s\S]*notes:\s*'',[\s\S]*\}\);[\s\S]*const activeRecDropdown\s*=\s*ref\(null\);[\s\S]*const recDropdownSearch\s*=\s*ref\(''\);[\s\S]*const newRecInputs\s*=\s*reactive\(\{[\s\S]*studio:\s*'',[\s\S]*engineer:\s*'',[\s\S]*operator:\s*'',[\s\S]*assistant:\s*'',[\s\S]*\}\);[\s\S]*const projectInfoForm\s*=\s*reactive\(\{[\s\S]*id:\s*null,[\s\S]*title:\s*'',[\s\S]*composer:\s*'',[\s\S]*arranger:\s*'',[\s\S]*producer:\s*'',[\s\S]*mixingEngineer:\s*'',[\s\S]*mixingStudio:\s*'',[\s\S]*masteringEngineer:\s*'',[\s\S]*masteringStudio:\s*'',[\s\S]*dolbyStudio:\s*'',[\s\S]*publishedBy:\s*'',[\s\S]*producedBy:\s*'',[\s\S]*\}\);[\s\S]*const metadataModalsFeatureRef\s*=\s*shallowRef\(null\);[\s\S]*return\s*\{[\s\S]*showRecInfoModal,[\s\S]*recInfoForm,[\s\S]*activeRecDropdown,[\s\S]*recDropdownSearch,[\s\S]*newRecInputs,[\s\S]*projectInfoForm,[\s\S]*metadataModalsFeatureRef,[\s\S]*\};[\s\S]*\}/,
    'metadata-modal-state module must own metadata modal form and feature-ref defaults',
  );

  const metadataModalStateA = createMetadataModalState({
    ref: vueRef,
    reactive: vueReactive,
    shallowRef: vueShallowRef,
  });
  const metadataModalStateB = createMetadataModalState({
    ref: vueRef,
    reactive: vueReactive,
    shallowRef: vueShallowRef,
  });
  assert.equal(metadataModalStateA.showRecInfoModal.value, false, 'metadata modal state must default Rec Info visibility to false');
  assert.deepEqual(
    metadataModalStateA.recInfoForm,
    { studio: '', engineer: '', operator: '', assistant: '', notes: '' },
    'metadata modal state must preserve Rec Info form defaults',
  );
  assert.equal(metadataModalStateA.activeRecDropdown.value, null, 'metadata modal state must default the active Rec dropdown to null');
  assert.equal(metadataModalStateA.recDropdownSearch.value, '', 'metadata modal state must default Rec dropdown search to empty text');
  assert.deepEqual(
    metadataModalStateA.newRecInputs,
    { studio: '', engineer: '', operator: '', assistant: '' },
    'metadata modal state must preserve new Rec metadata input defaults',
  );
  assert.deepEqual(
    metadataModalStateA.projectInfoForm,
    {
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
    },
    'metadata modal state must preserve Project Info form defaults',
  );
  assert.equal(metadataModalStateA.metadataModalsFeatureRef.value, null, 'metadata modal state must default the lazy feature ref to null');
  assert.notEqual(
    metadataModalStateA.recInfoForm,
    metadataModalStateB.recInfoForm,
    'createMetadataModalState must return a fresh Rec Info form per app instance',
  );
  assert.notEqual(
    metadataModalStateA.projectInfoForm,
    metadataModalStateB.projectInfoForm,
    'createMetadataModalState must return a fresh Project Info form per app instance',
  );
  assert.throws(
    () => createMetadataModalState({ reactive: vueReactive, shallowRef: vueShallowRef }),
    /createMetadataModalState requires Vue ref, reactive, and shallowRef factories/,
    'metadata modal state should fail clearly when Vue ref is missing',
  );
  assert.throws(
    () => createMetadataModalState({ ref: vueRef, shallowRef: vueShallowRef }),
    /createMetadataModalState requires Vue ref, reactive, and shallowRef factories/,
    'metadata modal state should fail clearly when Vue reactive is missing',
  );
  assert.throws(
    () => createMetadataModalState({ ref: vueRef, reactive: vueReactive }),
    /createMetadataModalState requires Vue ref, reactive, and shallowRef factories/,
    'metadata modal state should fail clearly when Vue shallowRef is missing',
  );
  assert.ok(
    appStateFactoriesModule,
    'app-state-factories registry should exist',
  );
  assert.match(
    appDependenciesModule,
    /import \{ createAppStateFactories \} from '\.\/app-state-factories\.js';/,
    'app-dependencies should import the app state factory registry',
  );
  assert.match(
    appDependenciesModule,
    /createAppStateFactories\(/,
    'app-dependencies should create the app state factory registry',
  );
  assert.match(
    appStateFactoriesModule,
    /import \{ createMetadataModalState \} from '\.\.\/state\/metadata-modal-state\.js';/,
    'app state factory registry should import the metadata modal state factory',
  );
  assert.match(
    appStateFactoriesModule,
    /\bcreateMetadataModalState\b/,
    'app state factory registry should expose the raw metadata modal state factory for focused tests',
  );
  assert.doesNotMatch(
    appScript,
    /import\s+\{\s*createMetadataModalState\s*\}\s+from\s+['"]\.\/state\/metadata-modal-state\.js['"]/,
    'app.js should not directly import the metadata modal state factory after state factory registry extraction',
  );
  assert.match(
    appScript,
    /\bcreateRootMetadataModalState\b[\s\S]*=\s*createAppDependencies\(\);/,
    'app.js should get the bound metadata modal state factory from createAppDependencies()',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootMetadataModalState\(\)\s*\{[\s\S]*return createMetadataModalState\(\{[\s\S]*ref,[\s\S]*reactive,[\s\S]*shallowRef[\s\S]*\}\);[\s\S]*\}/,
    'app state factory registry should bind Vue primitives for metadata modal state',
  );
  assert.match(
    appStateFactoriesModule,
    /return\s*\{[\s\S]*createMetadataModalState,[\s\S]*createRootMetadataModalState[\s\S]*\};/,
    'app state factory registry should expose the bound metadata modal state factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*showRecInfoModal,[\s\S]*recInfoForm,[\s\S]*activeRecDropdown,[\s\S]*recDropdownSearch,[\s\S]*newRecInputs,[\s\S]*projectInfoForm,[\s\S]*metadataModalsFeatureRef,[\s\S]*\}\s*=\s*createRootMetadataModalState\(\)/,
    'app.js must create metadata modal state through the bound metadata modal state factory',
  );
  assert.doesNotMatch(
    appScript,
    /createMetadataModalState\(\{\s*ref,\s*reactive,\s*shallowRef\s*\}\)/,
    'app.js should not wire Vue primitives into metadata modal state directly',
  );
  assert.doesNotMatch(
    appScript,
    /const showRecInfoModal\s*=\s*ref\(false\);[\s\S]*const recInfoForm\s*=\s*reactive\(\{[\s\S]*notes:\s*'',[\s\S]*\}\);[\s\S]*const activeRecDropdown\s*=\s*ref\(null\);[\s\S]*const recDropdownSearch\s*=\s*ref\(''\);[\s\S]*const newRecInputs\s*=\s*reactive\(\{[\s\S]*assistant:\s*'',[\s\S]*\}\);[\s\S]*const projectInfoForm\s*=\s*reactive\(\{[\s\S]*producedBy:\s*'',[\s\S]*\}\);[\s\S]*const metadataModalsFeatureRef\s*=\s*shallowRef\(null\);/,
    'app.js should not own metadata modal form defaults after metadata-modal-state extraction',
  );
}

export function assertRootMidiManagerStateFactoryRegistry() {
  assert.ok(
    appStateFactoriesModule,
    'app-state-factories registry should exist',
  );
  assert.match(
    appDependenciesModule,
    /import \{ createAppStateFactories \} from '\.\/app-state-factories\.js';/,
    'app-dependencies should import the app state factory registry',
  );
  assert.match(
    appStateFactoriesModule,
    /import \{ createMidiManagerState \} from '\.\.\/state\/midi-manager-state\.js';/,
    'app state factory registry should import the pure MIDI Manager state factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootMidiManagerState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the bound MIDI Manager state factory from createAppDependencies()',
  );
  assert.doesNotMatch(
    appScript,
    /createMidiManagerState\(\{\s*reactive,\s*computed\s*,?\s*\}\)/,
    'app.js should not wire Vue primitives into MIDI Manager state directly',
  );
  assert.match(
    appDependenciesModule,
    /createAppStateFactories\(\{[\s\S]*computed:\s*vueRuntime\.computed,[\s\S]*\}\)/,
    'app-dependencies should bind Vue computed when creating state factories',
  );
  assert.match(
    appDependenciesModule,
    /createAppStateFactories\(\{[\s\S]*reactive:\s*vueRuntime\.reactive,[\s\S]*\}\)/,
    'app-dependencies should bind Vue reactive when creating state factories',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootMidiManagerState\(\)\s*\{[\s\S]*return createMidiManagerState\(\{[\s\S]*reactive,[\s\S]*computed[\s\S]*\}\);[\s\S]*\}/,
    'app-state-factories should expose a MIDI Manager state factory bound to Vue primitives',
  );
  assert.match(
    appStateFactoriesModule,
    /return\s*\{[\s\S]*createMidiManagerState,[\s\S]*createRootMidiManagerState[\s\S]*\};/,
    'app-state-factories should continue exposing the pure MIDI Manager state factory and the bound root factory',
  );
}

export function assertMidiManagerStateBoundary({ createMidiManagerState, vueReactive, vueComputed }) {
  assert.match(
    midiManagerStateModule,
    /export function createMidiManagerState\(\{\s*reactive,\s*computed\s*\}\)\s*\{[\s\S]*const emptyMidiManagerSet\s*=\s*reactive\(new Set\(\)\);[\s\S]*const emptyMidiManagerList\s*=\s*computed\(\(\)\s*=>\s*\[\]\);[\s\S]*return\s*\{[\s\S]*midiManagerExpandedGroups:\s*emptyMidiManagerSet,[\s\S]*projectMidiList:\s*emptyMidiManagerList,[\s\S]*projectMidiGroups:\s*emptyMidiManagerList,[\s\S]*filteredMidiGroups:\s*emptyMidiManagerList,[\s\S]*\};[\s\S]*\}/,
    'midi-manager-state module must own MIDI Manager lazy placeholder collections',
  );
  assertRootMidiManagerStateFactoryRegistry();
  assert.match(
    appScript,
    /let\s+\{[\s\S]*midiManagerExpandedGroups,[\s\S]*projectMidiGroups,[\s\S]*projectMidiList,[\s\S]*filteredMidiGroups,[\s\S]*\}\s*=\s*createRootMidiManagerState\(\)/,
    'app.js must create MIDI Manager placeholder state through the bound MIDI Manager state factory',
  );
  assert.doesNotMatch(
    appScript,
    /const\s+emptyMidiManagerSet\s*=\s*reactive\(new Set\(\)\);[\s\S]*const\s+emptyMidiManagerList\s*=\s*computed\(\(\)\s*=>\s*\[\]\);/,
    'app.js should not own MIDI Manager lazy placeholder collections after midi-manager-state extraction',
  );

  const midiManagerStateA = createMidiManagerState({ reactive: vueReactive, computed: vueComputed });
  const midiManagerStateB = createMidiManagerState({ reactive: vueReactive, computed: vueComputed });
  assert.ok(midiManagerStateA.midiManagerExpandedGroups instanceof Set, 'MIDI Manager state must expose the fallback expanded groups set');
  assert.deepEqual(midiManagerStateA.projectMidiList.value, [], 'MIDI Manager state must default project MIDI list to an empty computed list');
  assert.deepEqual(midiManagerStateA.projectMidiGroups.value, [], 'MIDI Manager state must default project MIDI groups to an empty computed list');
  assert.deepEqual(midiManagerStateA.filteredMidiGroups.value, [], 'MIDI Manager state must default filtered MIDI groups to an empty computed list');
  assert.equal(
    midiManagerStateA.projectMidiList,
    midiManagerStateA.projectMidiGroups,
    'MIDI Manager state should share the same empty computed list across fallback MIDI list surfaces',
  );
  assert.equal(
    midiManagerStateA.projectMidiGroups,
    midiManagerStateA.filteredMidiGroups,
    'MIDI Manager state should share the same empty computed list across fallback MIDI group surfaces',
  );
  assert.notEqual(
    midiManagerStateA.midiManagerExpandedGroups,
    midiManagerStateB.midiManagerExpandedGroups,
    'MIDI Manager state must return a fresh expanded groups set per app instance',
  );
  assert.throws(
    () => createMidiManagerState({ computed: vueComputed }),
    /createMidiManagerState requires Vue reactive and computed factories/,
    'MIDI Manager state should fail clearly when Vue reactive is missing',
  );
  assert.throws(
    () => createMidiManagerState({ reactive: vueReactive }),
    /createMidiManagerState requires Vue reactive and computed factories/,
    'MIDI Manager state should fail clearly when Vue computed is missing',
  );
}

export function assertRootSettingsStateFactoryRegistry() {
  assert.ok(
    appStateFactoriesModule,
    'app-state-factories registry should exist',
  );
  assert.match(
    appDependenciesModule,
    /import \{ createAppStateFactories \} from '\.\/app-state-factories\.js';/,
    'app-dependencies should import the app state factory registry',
  );
  assert.match(
    appStateFactoriesModule,
    /import \{ createSettingsState \} from '\.\.\/state\/settings-state\.js';/,
    'app state factory registry should import the pure settings state factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootSettingsState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the bound settings state factory from createAppDependencies()',
  );
  assert.doesNotMatch(
    appScript,
    /createSettingsState\(\{\s*reactive\s*,?\s*\}\)/,
    'app.js should not wire Vue reactive into settings state directly',
  );
  assert.match(
    appDependenciesModule,
    /createAppStateFactories\(\{[\s\S]*reactive:\s*vueRuntime\.reactive,[\s\S]*\}\)/,
    'app-dependencies should bind Vue reactive when creating state factories',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootSettingsState\(\)\s*\{[\s\S]*return createSettingsState\(\{[\s\S]*reactive[\s\S]*\}\);[\s\S]*\}/,
    'app-state-factories should expose a settings state factory bound to Vue reactive',
  );
  assert.match(
    appStateFactoriesModule,
    /return\s*\{[\s\S]*createSettingsState,[\s\S]*createRootSettingsState[\s\S]*\};/,
    'app-state-factories should continue exposing the pure settings state factory and the bound root factory',
  );
}

export function assertSettingsStateBoundary({ createDefaultSettings, createSettingsState, vueReactive }) {
  const defaultSettings = createDefaultSettings();
  assert.equal(defaultSettings.sessions?.[0]?.id, 'S_DEFAULT', 'default settings module must create the default session');
  assert.equal(defaultSettings.sessions?.[0]?.name, '默认录音日程', 'default settings module must preserve the default session name');
  assert.ok(
    defaultSettings.instruments?.some((instrument) => instrument.id === 'Imi7d0318nsj' && instrument.name === '曲笛 Qudi'),
    'default settings module must preserve the bundled instrument library',
  );
  assert.deepEqual(defaultSettings.musicians, [], 'default settings must start with no musicians');
  assert.deepEqual(defaultSettings.projects, [], 'default settings must start with no projects');
  assert.notEqual(
    createDefaultSettings().instruments,
    defaultSettings.instruments,
    'createDefaultSettings must return fresh mutable collections for each app instance',
  );
  assert.match(
    defaultsState,
    /export function createDefaultSettings/,
    'state/defaults.js must own default settings creation',
  );
  assert.doesNotMatch(
    defaultsState,
    /DEFAULT_APP_STATE/,
    'state/defaults.js should not expose unused default app state after settings defaults extraction',
  );
  assert.match(
    settingsStateModule,
    /import \{ createDefaultSettings \} from '\.\/defaults\.js';/,
    'settings-state module must own the default settings import',
  );
  assert.match(
    settingsStateModule,
    /export function createSettingsState\(\{\s*reactive\s*\}\)\s*\{[\s\S]*return reactive\(createDefaultSettings\(\)\);[\s\S]*\}/,
    'settings-state module must expose a factory that wraps fresh default settings in Vue reactive state',
  );

  const settingsStateA = createSettingsState({ reactive: vueReactive });
  const settingsStateB = createSettingsState({ reactive: vueReactive });
  assert.equal(settingsStateA.startHour, 10, 'settings state must preserve the default start hour');
  assert.equal(settingsStateA.endHour, 22, 'settings state must preserve the default end hour');
  assert.equal(settingsStateA.sessions[0].id, 'S_DEFAULT', 'settings state must preserve the default session');
  assert.ok(settingsStateA.instruments.length > 20, 'settings state must preserve the bundled instrument library');
  assert.notEqual(
    settingsStateA.instruments,
    settingsStateB.instruments,
    'createSettingsState must return fresh mutable collections per app instance',
  );
  assert.throws(
    () => createSettingsState({}),
    /createSettingsState requires Vue reactive factory/,
    'settings state should fail clearly when Vue reactive is missing',
  );
  assert.doesNotMatch(
    appScript,
    /import\s+\{\s*createDefaultSettings\s*\}\s+from\s+['"]\.\/state\/defaults\.js['"]/,
    'app.js should not import default settings directly after settings-state extraction',
  );
  assertRootSettingsStateFactoryRegistry();
  assert.match(
    appScript,
    /const\s+settings\s*=\s*createRootSettingsState\(\)/,
    'app.js must create settings through the bound settings state factory',
  );
  assert.doesNotMatch(
    appScript,
    /const\s+settings\s*=\s*reactive\(\s*\{/,
    'app.js should not retain the default settings object body after defaults extraction',
  );
}

export function assertAppUtilityFunctionsRegistry({
  exportedName,
  importedName = exportedName,
  appDependencyName = exportedName,
  modulePath,
  label,
}) {
  assert.ok(
    appUtilityFunctionsModule,
    'app-utility-functions registry should exist',
  );
  assert.match(
    appDependenciesModule,
    /import \{ createAppUtilityFunctions \} from '\.\/app-utility-functions\.js';/,
    'app-dependencies should import the app utility function registry',
  );
  assert.match(
    appScript,
    new RegExp(`\\b${appDependencyName}\\b[\\s\\S]*=\\s*createAppDependencies\\(\\);`),
    `app.js should get ${label} from the app dependency registry`,
  );
  assert.doesNotMatch(
    appScript,
    new RegExp(`import\\s+\\{[\\s\\S]*\\b${importedName}\\b[\\s\\S]*\\}\\s+from\\s+['"]\\.\\/utils\\/${escapedModulePath(modulePath)}['"]`),
    `app.js should not directly import ${label} after utility registry extraction`,
  );
  assert.match(
    appDependenciesModule,
    /createAppUtilityFunctions\(\)/,
    'app-dependencies should create the app utility function registry',
  );
  assert.match(
    appUtilityFunctionsModule,
    new RegExp(`import\\s+\\{[\\s\\S]*\\b${importedName}\\b[\\s\\S]*\\}\\s+from\\s+['"]\\.\\.\\/utils\\/${escapedModulePath(modulePath)}['"]`),
    `app utility function registry should import ${label}`,
  );
  assert.match(
    appUtilityFunctionsModule,
    new RegExp(`\\b${exportedName}\\b`),
    `app utility function registry should expose ${label}`,
  );
}

export function assertGroupedUtilityBoundary({
  surfaceName,
  helperNames,
  label,
  registryPattern,
  appPassThroughs = helperNames.map((helperName) => [helperName, helperName]),
}) {
  assert.match(
    appUtilityFunctionsModule,
    registryPattern,
    `app utility registry should expose ${label} as a grouped ${surfaceName} surface`,
  );
  assert.match(
    appScript,
    new RegExp(`const\\s+\\{[\\s\\S]*\\b${surfaceName}\\b[\\s\\S]*\\}\\s*=\\s*createAppDependencies\\(\\);`),
    `app.js should request the grouped ${label} utility surface from createAppDependencies()`,
  );
  for (const helperName of helperNames) {
    assert.doesNotMatch(
      appScript,
      new RegExp(`const\\s+\\{[\\s\\S]*\\b${helperName}\\b[\\s\\S]*\\}\\s*=\\s*createAppDependencies\\(\\);`),
      `app.js should not request ${label} helper ${helperName} directly from createAppDependencies()`,
    );
    assert.doesNotMatch(
      appScript,
      new RegExp(`^\\s*${helperName},\\s*$`, 'm'),
      `app.js should not leave shorthand ${helperName} references after grouping ${surfaceName}`,
    );
  }
  for (const [appName, surfaceHelperName] of appPassThroughs) {
    assert.match(
      appScript,
      new RegExp(`${appName}:\\s*${surfaceName}\\.${surfaceHelperName}`),
      `app.js should pass ${appName} through the grouped ${surfaceName} surface`,
    );
  }
}

export function assertAppBootstrapServicesRegistry({ factoryName, serviceName, modulePath, label, registryCreationPattern }) {
  assert.ok(
    appBootstrapServicesModule,
    'app-bootstrap-services registry should exist',
  );
  assert.match(
    appDependenciesModule,
    /import \{ createAppBootstrapServices \} from '\.\/app-bootstrap-services\.js';/,
    'app-dependencies should import the app bootstrap services registry',
  );
  assert.match(
    appScript,
    new RegExp(`\\b${serviceName}\\b[\\s\\S]*=\\s*createAppDependencies\\(\\);`),
    `app.js should get ${label} from the app dependency registry`,
  );
  assert.doesNotMatch(
    appScript,
    new RegExp(`import\\s+\\{\\s*${factoryName}\\s*\\}\\s+from\\s+['"]\\.\\/services\\/${escapedModulePath(modulePath)}['"]`),
    `app.js should not directly import the ${label} service after bootstrap registry extraction`,
  );
  assert.match(
    appDependenciesModule,
    /createAppBootstrapServices\(\)/,
    'app-dependencies should create the app bootstrap services registry',
  );
  assert.match(
    appBootstrapServicesModule,
    new RegExp(`import\\s+\\{\\s*${factoryName}\\s*\\}\\s+from\\s+['"]\\.\\/${escapedModulePath(modulePath)}['"]`),
    `app bootstrap services registry should import the ${label} service factory`,
  );
  assert.match(
    appBootstrapServicesModule,
    registryCreationPattern || new RegExp(`${serviceName}\\s*=\\s*${factoryName}\\(`),
    `app bootstrap services registry should create the ${label} service`,
  );
}

export function assertAppSupportLoadersRegistry({ factoryName, loaderName, modulePath, label, registryCreationPattern }) {
  assert.ok(
    appSupportLoadersModule,
    'app-support-loaders service registry should exist',
  );
  assert.match(
    appDependenciesModule,
    /import \{ createAppSupportLoaders \} from '\.\/app-support-loaders\.js';/,
    'app-dependencies should import the app support loader registry',
  );
  assert.match(
    appScript,
    new RegExp(`\\b${loaderName}\\b[\\s\\S]*=\\s*createAppDependencies\\(\\);`),
    `app.js should get ${label} from the app dependency registry`,
  );
  assert.doesNotMatch(
    appScript,
    new RegExp(`import\\s+\\{\\s*${factoryName}\\s*\\}\\s+from\\s+['"]\\.\\/services\\/${escapedModulePath(modulePath)}['"]`),
    `app.js should not directly import the ${label} loader service after support-loader registry extraction`,
  );
  assert.match(
    appDependenciesModule,
    /createAppSupportLoaders\(\{\s*ref:\s*vueRuntime\.ref\s*\}\)/,
    'app-dependencies should create the app support loader registry with Vue ref',
  );
  assert.match(
    appSupportLoadersModule,
    new RegExp(`import\\s+\\{\\s*${factoryName}\\s*\\}\\s+from\\s+['"]\\.\\/${escapedModulePath(modulePath)}['"]`),
    `app support loader registry should import the ${label} loader service`,
  );
  assert.match(
    appSupportLoadersModule,
    registryCreationPattern || new RegExp(`${loaderName}\\s*:\\s*${factoryName}\\(`),
    `app support loader registry should create the ${label} loader`,
  );
}

export function assertAppRootComponentsRegistry() {
  assert.ok(
    appRootComponentsModule,
    'app-root-components service registry should exist',
  );
  assert.match(
    appRootComponentsModule,
    /import \{ appRootStaticComponents \} from '\.\.\/components\/app-root-static-components\.js';/,
    'app-root-components service must import synchronous root components from the component registry module',
  );
  assert.match(
    appDependenciesModule,
    /import \{ createAppRootComponents \} from '\.\/app-root-components\.js';/,
    'app-dependencies must import the root component service registry',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateAppRootOptions\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js must consume root app options through createAppDependencies()',
  );
  assert.doesNotMatch(
    appScript,
    /const\s+\{[\s\S]*\bappRootStaticComponents\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should not consume the static root component registry directly after root options extraction',
  );
  assert.doesNotMatch(
    appScript,
    /from '\.\/components\/app-root-static-components\.js';/,
    'app.js should not directly import the root component registry after app-root-components service extraction',
  );
  assert.match(
    appDependenciesModule,
    /createAppRootComponents\(\)/,
    'app-dependencies must create the root component registry',
  );
  assert.match(
    appRootComponentsModule,
    /function createAppRootOptions\(\)\s*\{[\s\S]*return\s*\{[\s\S]*components:\s*appRootStaticComponents[\s\S]*\};[\s\S]*\}/,
    'app-root-components service must own the root Vue app options for static components',
  );
  assert.match(
    appRootComponentsModule,
    /export function createAppRootComponents\(\)\s*\{[\s\S]*return\s*\{[\s\S]*createAppRootOptions[\s\S]*\};[\s\S]*\}/,
    'app-root-components service must expose the root options factory',
  );
}

export function assertAppVueRuntimeRegistry() {
  assert.ok(
    appVueRuntimeModule,
    'app-vue-runtime service registry should exist',
  );
  assert.match(
    appDependenciesModule,
    /import \{ createAppVueRuntime \} from '\.\/app-vue-runtime\.js';/,
    'app-dependencies should import the Vue runtime helper registry',
  );
  assert.match(
    appScript,
    /const\s+\{(?=[\s\S]*\bcreateApp\b)(?=[\s\S]*\bcomputed\b)(?=[\s\S]*\bonMounted\b)(?=[\s\S]*\bonUnmounted\b)(?=[\s\S]*\bwatch\b)(?=[\s\S]*\bnextTick\b)[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the Vue runtime helpers it calls directly from createAppDependencies()',
  );
  assert.doesNotMatch(
    appScript,
    /const\s+\{[\s\S]*\b(?:ref|reactive|shallowRef)\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should not consume Vue factories that are bound inside state factories',
  );
  assert.doesNotMatch(
    appScript,
    /from 'vue';/,
    'app.js should not directly import Vue helpers after app-vue-runtime extraction',
  );
  assert.match(
    appDependenciesModule,
    /const\s+vueRuntime\s*=\s*createAppVueRuntime\(\);/,
    'app-dependencies should create the Vue runtime helper registry',
  );
  assert.match(
    appVueRuntimeModule,
    /import \{ createApp, ref, computed, onMounted, onUnmounted, watch, reactive, nextTick, shallowRef \} from 'vue';/,
    'app-vue-runtime should own the named Vue helper import',
  );
  assert.match(
    appVueRuntimeModule,
    /export function createAppVueRuntime\(\)\s*\{[\s\S]*return\s*\{[\s\S]*\bcreateApp\b[\s\S]*\bref\b[\s\S]*\bcomputed\b[\s\S]*\bonMounted\b[\s\S]*\bonUnmounted\b[\s\S]*\bwatch\b[\s\S]*\breactive\b[\s\S]*\bnextTick\b[\s\S]*\bshallowRef\b[\s\S]*\};[\s\S]*\}/,
    'app-vue-runtime should expose the Vue helper map',
  );
}
