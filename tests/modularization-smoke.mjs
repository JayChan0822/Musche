import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import {
    appLazyFeatureWiringsModule,
    appRootContextWiringModule,
    assertAppDependenciesRegistry,
    assertAppBootstrapServicesRegistry,
    assertAppFeatureLoadersRegistry,
    assertAppFeatureRegistrarRegistry,
    assertDataIoStateBoundary,
    assertImportDataStateBoundary,
    assertMetadataModalStateBoundary,
    assertSettingsStateBoundary,
    assertAppRootComponentsRegistry,
    assertAppRootSetupReturnSurface,
    assertAppRootTemplateSurface,
    assertNoRootSetupReturnFields,
    assertMidiManagerStateBoundary,
    assertRootShellStateBoundary,
    assertRootAppStateBoundary,
    assertTrackListStateBoundary,
    assertAppStateFactoriesRegistry,
    assertAppStaticImportSurface,
    assertAppSupportLoadersRegistry,
    assertAppUtilityFunctionsRegistry,
    assertAppVueRuntimeRegistry,
    assertPackageTestScriptUsesGlob,
    appBoundaryAssertions,
    asyncRootComponent,
    asyncRootComponentPath,
    appAccountModalComponents,
    appAccountModalComponentsPath,
    appAccountModalsShellComponent,
    appAccountModalsShellComponentPath,
    appAuthModalComponent,
    appAuthModalComponentPath,
    appColorPickerModalComponent,
    appColorPickerModalComponentPath,
    appConfirmModalComponent,
    appConfirmModalComponentPath,
    appDependenciesModule,
    appCropModalComponent,
    appCropModalComponentPath,
    appFeatureLoadersModule,
    appFeatureRegistrarsModule,
    appCsvImportModalComponent,
    appCsvImportModalComponentPath,
    appCreditModalComponent,
    appCreditModalComponentPath,
    appEditModalComponent,
    appEditModalComponentPath,
    appExportCreditModalComponents,
    appExportCreditModalComponentsPath,
    appExportCreditModalsShellComponent,
    appExportCreditModalsShellComponentPath,
    appExportModalComponent,
    appExportModalComponentPath,
    appHeaderComponent,
    appHeaderComponentPath,
    appImportModalComponent,
    appImportModalComponentPath,
    appMainContentComponent,
    appMainContentComponentPath,
    appMobileControlsComponent,
    appMobileControlsComponentPath,
    appMobileTaskInputComponent,
    appMobileTaskInputComponentPath,
    appMetadataInfoModalComponents,
    appMetadataInfoModalComponentsPath,
    appMetadataInfoModalsShellComponent,
    appMetadataInfoModalsShellComponentPath,
    appMidiCsvImportModalComponents,
    appMidiCsvImportModalComponentsPath,
    appMidiCsvImportModalsShellComponent,
    appMidiCsvImportModalsShellComponentPath,
    appMidiImportModalComponent,
    appMidiImportModalComponentPath,
    appMidiManagerModalComponent,
    appMidiManagerModalComponentPath,
    appProjectInfoModalComponent,
    appProjectInfoModalComponentPath,
    appQuickAddModalComponent,
    appQuickAddModalComponentPath,
    appRecInfoModalComponent,
    appRecInfoModalComponentPath,
    appRootAsyncModals,
    appRootAsyncModalsPath,
    appRootOverlayShellComponents,
    appRootOverlayShellComponentsPath,
    appRootOverlaysShellComponent,
    appRootOverlaysShellComponentPath,
    appRootShellComponent,
    appRootShellComponentPath,
    appRootShellComponents,
    appRootShellComponentsPath,
    appRootComponentsModule,
    appRootStaticComponents,
    appRootStaticComponentsPath,
    appScript,
    appScriptPath,
    appSidebarComponent,
    appSidebarComponentPath,
    sidebarShellStateModule,
    midiManagerModalShellStateModule,
    midiImportModalShellStateModule,
    settingsModalShellStateModule,
    appSettingsModalComponent,
    appSettingsModalComponentPath,
    appSplitModalComponent,
    appSplitModalComponentPath,
    appStandaloneOverlayComponents,
    appStandaloneOverlayComponentsPath,
    appStandaloneOverlaysShellComponent,
    appStandaloneOverlaysShellComponentPath,
    appStateFactoriesModule,
    appSupportLoadersModule,
    appTaskActionModalComponents,
    appTaskActionModalComponentsPath,
    appTaskActionModalsShellComponent,
    appTaskActionModalsShellComponentPath,
    appTrackListModalComponent,
    appTrackListModalComponentPath,
    appUniversalModalComponents,
    appUniversalModalComponentsPath,
    appUniversalModalsShellComponent,
    appUniversalModalsShellComponentPath,
    appUtilityModalComponents,
    appUtilityModalComponentsPath,
    appUtilityModalsShellComponent,
    appUtilityModalsShellComponentPath,
    appDurationPickerComponent,
    appDurationPickerComponentPath,
    appInputModalComponent,
    appInputModalComponentPath,
    appPickerModalComponents,
    appPickerModalComponentsPath,
    appPickerModalsShellComponent,
    appPickerModalsShellComponentPath,
    avatarCropFeatureLoaderModule,
    avatarCropFeatureLoaderPath,
    cropperLoaderModule,
    cropperLoaderPath,
    dataIoFeatureLoaderModule,
    dataIoFeatureLoaderPath,
    desktopResizeFeatureLoaderModule,
    desktopResizeFeatureLoaderPath,
    importDataDependencyLoaderModule,
    importDataDependencyLoaderPath,
    indexHtml,
    metadataModalsFeatureLoaderModule,
    metadataModalsFeatureLoaderPath,
    midiManagerFeatureLoaderModule,
    midiManagerFeatureLoaderPath,
    midiSmfLoaderModule,
    midiSmfLoaderPath,
    mobileTouchFeatureLoaderModule,
    mobileTouchFeatureLoaderPath,
    packageJson,
    pinyinMatchLoaderModule,
    pinyinMatchLoaderPath,
    scheduleDeletionFeatureLoaderModule,
    scheduleDeletionFeatureLoaderPath,
    settingsFeatureLoaderModule,
    settingsFeatureLoaderPath,
    taskEditorFeatureLoaderModule,
    taskEditorFeatureLoaderPath,
    tourFeatureLoaderModule,
    tourFeatureLoaderPath,
    trackListFeatureLoaderModule,
    trackListFeatureLoaderPath,
    xlsxLoaderModule,
    xlsxLoaderPath,
    appRuntimeFeatureRegistrarModule,
    appRuntimeFeatureRegistrarPath,
    authFeatureRegistrarModule,
    authFeatureRegistrarPath,
    dropdownsFeatureRegistrarModule,
    dropdownsFeatureRegistrarPath,
    globalKeyboardFeatureRegistrarModule,
    globalKeyboardFeatureRegistrarPath,
    historyFeatureRegistrarModule,
    historyFeatureRegistrarPath,
    mobileUiFeatureRegistrarModule,
    mobileUiFeatureRegistrarPath,
    nameLookupFeatureRegistrarModule,
    nameLookupFeatureRegistrarPath,
    orchestrationFeatureRegistrarModule,
    orchestrationFeatureRegistrarPath,
    pickerControlsFeatureRegistrarModule,
    pickerControlsFeatureRegistrarPath,
    poolInteractionsFeatureRegistrarModule,
    poolInteractionsFeatureRegistrarPath,
    quickAddFeatureRegistrarModule,
    quickAddFeatureRegistrarPath,
    ratioFeatureRegistrarModule,
    ratioFeatureRegistrarPath,
    scheduleFeatureRegistrarModule,
    scheduleFeatureRegistrarPath,
    scheduleInteractionsFeatureRegistrarModule,
    scheduleInteractionsFeatureRegistrarPath,
    searchFeatureRegistrarModule,
    searchFeatureRegistrarPath,
    sessionFeatureRegistrarModule,
    sessionFeatureRegistrarPath,
    settingsSyncFeatureRegistrarModule,
    settingsSyncFeatureRegistrarPath,
    sidebarFeatureRegistrarModule,
    sidebarFeatureRegistrarPath,
    sidebarStatsFeatureRegistrarModule,
    sidebarStatsFeatureRegistrarPath,
    splitTaskFeatureRegistrarModule,
    splitTaskFeatureRegistrarPath,
    splitViewFeatureRegistrarModule,
    splitViewFeatureRegistrarPath,
    universalModalFeatureRegistrarModule,
    universalModalFeatureRegistrarPath,
    viewNavigationFeatureRegistrarModule,
    viewNavigationFeatureRegistrarPath,
    confirmModalShellStateModule,
    confirmModalShellStatePath,
    creditModalShellStateModule,
    creditModalShellStatePath,
    inputModalShellStateModule,
    inputModalShellStatePath,
    mobileControlsShellStateModule,
    mobileControlsShellStatePath,
    splitModalShellStateModule,
    splitModalShellStatePath,
    appLifecycleFeature,
    appRuntimeFeature,
    appRuntimeFeaturePath,
    authFeature,
    avatarCropFeature,
    calendarViewFeature,
    colorPickerFeature,
    creditsFeature,
    dataAutosaveFeature,
    dataIoFeature,
    dataIoFeaturePath,
    dataPortabilityFeature,
    desktopResizeFeature,
    dropdownsFeature,
    durationPickerFeature,
    exportCsvFeature,
    globalKeyboardFeature,
    historyFeature,
    importCsvFeature,
    importDataFeature,
    importDataFeaturePath,
    importMidiFeature,
    mainViewNavigationFeature,
    metadataModalsFeature,
    metadataModalsFeaturePath,
    midiManagerFeature,
    mobileAutoScrollFeature,
    mobileDragGhostFeature,
    mobileResizeFeature,
    mobileTouchEndFeature,
    mobileTouchFeature,
    mobileTouchFeaturePath,
    mobileTouchMoveFeature,
    mobileTouchStartFeature,
    mobileUiFeature,
    nameLookupFeature,
    nameLookupFeaturePath,
    orchestrationFeature,
    pickerControlsFeature,
    pickerControlsFeaturePath,
    poolInteractionsFeature,
    poolInteractionsFeaturePath,
    projectInfoFeature,
    quickAddFeature,
    ratioFeature,
    recInfoFeature,
    scheduleDeletionFeature,
    scheduleDragDropFeature,
    scheduleFeature,
    scheduleInteractionsFeature,
    scheduleInteractionsFeaturePath,
    scheduleTaskActivationFeature,
    searchFeature,
    configuredSupabaseServiceModule,
    configuredSupabaseServicePath,
    selectionFeature,
    selectionFeaturePath,
    sessionFeature,
    settingsFeature,
    sidebarFeature,
    sidebarFeaturePath,
    sidebarNavigationFeature,
    sidebarPreferencesFeature,
    sidebarStatsFeature,
    splitTaskFeature,
    splitViewFeature,
    supabaseServiceModule,
    supabaseServicePath,
    taskEditorFeature,
    tourFeature,
    trackListFeature,
    universalModalFeature,
    viteConfig,
    viteConfigPath,
    viewNavigationFeature,
    viewNavigationFeaturePath,
    visiblePoolItemsFeature,
    rootComponentsObject,
    rootSetupReturnObject,
    modularizationSmoke,
    readFixture,
    resolveFixturePath,
    readOptionalFixture,
} from './helpers/app-boundary-assertions.mjs';

const vercelConfigPath = resolveFixturePath('vercel.json');

const componentsCss = readFileSync(resolveFixturePath('app/styles/components.css'), 'utf8');
const { createAppState } = await import('../app/scripts/state/app-state.js');
const { createSettingsState } = await import('../app/scripts/state/settings-state.js');
const { createDataIoState } = await import('../app/scripts/state/data-io-state.js');
const { createImportDataState } = await import('../app/scripts/state/import-data-state.js');
const { createMetadataModalState } = await import('../app/scripts/state/metadata-modal-state.js');
const { createRootShellState } = await import('../app/scripts/state/root-shell-state.js');
const { createMobileControlsShellState } = await import('../app/scripts/state/mobile-controls-shell-state.js');
const { createCreditModalShellState } = await import('../app/scripts/state/credit-modal-shell-state.js');
const { createConfirmModalShellState } = await import('../app/scripts/state/confirm-modal-shell-state.js');
const { createInputModalShellState } = await import('../app/scripts/state/input-modal-shell-state.js');
const { createSplitModalShellState } = await import('../app/scripts/state/split-modal-shell-state.js');
const { createTrackListState } = await import('../app/scripts/state/track-list-state.js');
const { createMidiManagerState } = await import('../app/scripts/state/midi-manager-state.js');
const exportModalShellStatePath = '../app/scripts/state/export-modal-shell-state.js';
const { createExportModalShellState } = existsSync(new URL(exportModalShellStatePath, import.meta.url))
    ? await import(exportModalShellStatePath)
    : {};
const { createDefaultSettings } = await import('../app/scripts/state/defaults.js');
const { createPinyinMatchLoader } = await import('../app/scripts/services/pinyin-match-loader.js');
const { createStorageService } = await import('../app/scripts/services/storage-service.js');
const { createAvatarCropFeatureLoader } = await import('../app/scripts/services/avatar-crop-feature-loader.js');
const { createDataIoFeatureLoader } = await import('../app/scripts/services/data-io-feature-loader.js');
const { createDesktopResizeFeatureLoader } = await import('../app/scripts/services/desktop-resize-feature-loader.js');
const { createMetadataModalsFeatureLoader } = await import('../app/scripts/services/metadata-modals-feature-loader.js');
const { createScheduleDeletionFeatureLoader } = await import('../app/scripts/services/schedule-deletion-feature-loader.js');
const { createTourFeatureLoader } = await import('../app/scripts/services/tour-feature-loader.js');
const { createTaskEditorFeatureLoader } = await import('../app/scripts/services/task-editor-feature-loader.js');
const { createSettingsFeatureLoader } = await import('../app/scripts/services/settings-feature-loader.js');
const { createMobileTouchFeatureLoader } = await import('../app/scripts/services/mobile-touch-feature-loader.js');
const { createTrackListFeatureLoader } = await import('../app/scripts/services/track-list-feature-loader.js');
const { createMidiManagerFeatureLoader } = await import('../app/scripts/services/midi-manager-feature-loader.js');
const { registerScheduleFeature } = await import('../app/scripts/features/schedule.js');
const { registerTrackListFeature } = await import('../app/scripts/features/track-list.js');
const { registerTaskEditorFeature } = await import('../app/scripts/features/task-editor.js');
const { registerSidebarStatsFeature } = await import('../app/scripts/features/sidebar-stats.js');
const { registerCalendarViewFeature } = await import('../app/scripts/features/calendar-view.js');
const { registerSettingsFeature } = await import('../app/scripts/features/settings.js');
const { registerImportCsvFeature } = await import('../app/scripts/features/import-csv.js');
const { registerImportDataFeature } = existsSync(importDataFeaturePath)
    ? await import('../app/scripts/features/import-data.js')
    : {};
const { registerMidiManagerFeature } = await import('../app/scripts/features/midi-manager.js');
const { registerProjectInfoFeature } = await import('../app/scripts/features/project-info.js');
const { registerRecInfoFeature } = await import('../app/scripts/features/rec-info.js');
const { registerMetadataModalsFeature } = existsSync(metadataModalsFeaturePath)
    ? await import('../app/scripts/features/metadata-modals.js')
    : {};
const { registerAuthFeature } = await import('../app/scripts/features/auth.js');
const { registerMobileUiFeature } = await import('../app/scripts/features/mobile-ui.js');
const { registerScheduleDragDropFeature } = await import('../app/scripts/features/schedule-drag-drop.js');
const { registerScheduleTaskActivationFeature } = await import('../app/scripts/features/schedule-task-activation.js');
const { registerScheduleInteractionsFeature } = existsSync(scheduleInteractionsFeaturePath)
    ? await import('../app/scripts/features/schedule-interactions.js')
    : {};
const { registerMobileAutoScrollFeature } = await import('../app/scripts/features/mobile-auto-scroll.js');
const { registerMobileDragGhostFeature } = await import('../app/scripts/features/mobile-drag-ghost.js');
const { registerMobileTouchStartFeature } = await import('../app/scripts/features/mobile-touch-start.js');
const { registerMobileTouchMoveFeature } = await import('../app/scripts/features/mobile-touch-move.js');
const { registerMobileTouchEndFeature } = await import('../app/scripts/features/mobile-touch-end.js');
const { registerMobileTouchFeature } = existsSync(mobileTouchFeaturePath)
    ? await import('../app/scripts/features/mobile-touch.js')
    : {};
const { registerMobileResizeFeature } = await import('../app/scripts/features/mobile-resize.js');
const { registerDesktopResizeFeature } = await import('../app/scripts/features/desktop-resize.js');
const { registerImportMidiFeature } = await import('../app/scripts/features/import-midi.js');
const { registerSearchFeature } = await import('../app/scripts/features/search.js');
const { registerRatioFeature } = await import('../app/scripts/features/ratio.js');
const { registerViewNavigationFeature } = existsSync(viewNavigationFeaturePath)
    ? await import('../app/scripts/features/view-navigation.js')
    : {};
const { registerOrchestrationFeature } = await import('../app/scripts/features/orchestration.js');
const { registerUniversalModalFeature } = await import('../app/scripts/features/universal-modal.js');
const { registerQuickAddFeature } = await import('../app/scripts/features/quick-add.js');
const { registerDurationPickerFeature } = await import('../app/scripts/features/duration-picker.js');
const { registerPickerControlsFeature } = existsSync(pickerControlsFeaturePath)
    ? await import('../app/scripts/features/picker-controls.js')
    : {};
const { registerHistoryFeature } = await import('../app/scripts/features/history.js');
const { registerDataPortabilityFeature } = await import('../app/scripts/features/data-portability.js');
const { registerExportCsvFeature } = await import('../app/scripts/features/export-csv.js');
const { registerDataIoFeature } = existsSync(dataIoFeaturePath)
    ? await import('../app/scripts/features/data-io.js')
    : {};
const { registerAvatarCropFeature } = await import('../app/scripts/features/avatar-crop.js');
const { registerScheduleDeletionFeature } = await import('../app/scripts/features/schedule-deletion.js');
const { registerSessionFeature } = await import('../app/scripts/features/session.js');
const { registerColorPickerFeature } = await import('../app/scripts/features/color-picker.js');
const { registerTourFeature } = await import('../app/scripts/features/tour.js');
const { registerSidebarNavigationFeature } = await import('../app/scripts/features/sidebar-navigation.js');
const { registerSidebarPreferencesFeature } = await import('../app/scripts/features/sidebar-preferences.js');
const { registerSidebarFeature } = existsSync(sidebarFeaturePath)
    ? await import('../app/scripts/features/sidebar.js')
    : {};
const { registerMainViewNavigationFeature } = await import('../app/scripts/features/main-view-navigation.js');
const { registerDropdownsFeature } = await import('../app/scripts/features/dropdowns.js');
const { registerSplitTaskFeature } = await import('../app/scripts/features/split-task.js');
const { registerSplitViewFeature } = await import('../app/scripts/features/split-view.js');
const { registerVisiblePoolItemsFeature } = await import('../app/scripts/features/visible-pool-items.js');
const { registerPoolInteractionsFeature } = existsSync(poolInteractionsFeaturePath)
    ? await import('../app/scripts/features/pool-interactions.js')
    : {};
const { registerGlobalKeyboardFeature } = await import('../app/scripts/features/global-keyboard.js');
const { registerDataAutosaveFeature } = await import('../app/scripts/features/data-autosave.js');
const { registerAppLifecycleFeature } = await import('../app/scripts/features/app-lifecycle.js');
const { registerAppRuntimeFeature } = existsSync(appRuntimeFeaturePath)
    ? await import('../app/scripts/features/app-runtime.js')
    : {};
const { registerNameLookupFeature } = existsSync(nameLookupFeaturePath)
    ? await import('../app/scripts/features/name-lookup.js')
    : {};
const { registerSelectionFeature } = existsSync(selectionFeaturePath)
    ? await import('../app/scripts/features/selection.js')
    : {};
const { ref: vueRef, reactive: vueReactive, computed: vueComputed, shallowRef: vueShallowRef, nextTick: vueNextTick } = await import('vue');

assert.equal(
    packageJson.scripts?.['verify:modularization'],
    'node tests/modularization-smoke.mjs',
    'package.json must expose a reusable verify:modularization script'
);

assert.match(
    modularizationSmoke,
    /import \{[\s\S]*assertAppUtilityFunctionsRegistry[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke must reuse the shared app-boundary utility registry assertion helper'
);

assert.doesNotMatch(
    modularizationSmoke,
    /function\s+assertAppUtilityFunctionsRegistry\s*\(/,
    'modularization smoke should not keep a local utility registry assertion helper'
);

assert.match(
    modularizationSmoke,
    /import \{[\s\S]*assertAppFeatureRegistrarRegistry[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke must reuse the shared app-boundary feature registrar assertion helper'
);

assert.doesNotMatch(
    modularizationSmoke,
    /function\s+assertAppFeatureRegistrarRegistry\s*\(/,
    'modularization smoke should not keep a local feature registrar assertion helper'
);

assert.match(
    modularizationSmoke,
    /import \{[\s\S]*assertAppFeatureLoadersRegistry[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke must reuse the shared app-boundary feature loader assertion helper'
);

assert.doesNotMatch(
    modularizationSmoke,
    /function\s+assertAppFeatureLoadersRegistry\s*\(/,
    'modularization smoke should not keep a local feature loader assertion helper'
);

assert.match(
    modularizationSmoke,
    /import \{[\s\S]*assertAppStateFactoriesRegistry[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke must reuse the shared app-boundary state factory assertion helper'
);

assert.doesNotMatch(
    modularizationSmoke,
    /function\s+assertAppStateFactoriesRegistry\s*\(/,
    'modularization smoke should not keep a local state factory assertion helper'
);
assert.doesNotMatch(
    modularizationSmoke,
    /readFileSync\(import\.meta\.filename,\s*'utf8'\)/,
    'modularization smoke should reuse its cached source fixture instead of rereading itself'
);

assert.match(
    modularizationSmoke,
    /import \{(?=[\s\S]*\bappScript\b)(?=[\s\S]*\bmodularizationSmoke\b)(?=[\s\S]*\bresolveFixturePath\b)[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should reuse shared app.js, self-source, and fixture path resolver'
);
assert.match(
    modularizationSmoke,
    /import \{[\s\S]*\breadFixture\b[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should reuse the shared fixture reader for fixed source reads'
);
assert.match(
    modularizationSmoke,
    /import \{[\s\S]*\breadOptionalFixture\b[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should reuse the shared optional fixture reader for optional source reads'
);
assert.doesNotMatch(
    modularizationSmoke,
    /existsSync\([^)\n]+\)\s*\?\s*readFileSync\([^)\n]+,\s*'utf8'\)\s*:\s*''/,
    'modularization smoke should not repeat optional fixture read ternaries'
);
assert.doesNotMatch(
    modularizationSmoke,
    /const\s+(?:packageJsonPath|indexHtmlPath|appBoundaryAssertionsPath)\s*=\s*resolve\(/,
    'modularization smoke should not keep local fixture paths for fixed package, index, or helper reads'
);
assert.doesNotMatch(
    modularizationSmoke,
    new RegExp("from 'node:" + "url'|import \\{ dirname\\b"),
    'modularization smoke should not keep local URL/path bootstrap logic after fixture helper extraction'
);
assert.doesNotMatch(
    modularizationSmoke,
    /appScript\s+as\s+sharedAppScript/,
    'modularization smoke should import the shared app.js fixture directly'
);
assert.doesNotMatch(
    modularizationSmoke,
    /const\s+appScript\s*=\s*readFileSync\(appScriptPath,\s*'utf8'\)/,
    'modularization smoke should not keep a local app.js fixture read after shared helper extraction'
);
assert.doesNotMatch(
    modularizationSmoke,
    /const\s+appScript\s*=\s*sharedAppScript/,
    'modularization smoke should not keep an app.js fixture alias after shared helper extraction'
);
assert.match(
    appBoundaryAssertions,
    /function\s+readOptionalFixture\s*\(\s*fixturePath\s*\)\s*\{/,
    'app boundary assertion helper should centralize optional fixture reads'
);
assert.doesNotMatch(
    appBoundaryAssertions,
    /export const \w+\s*=\s*existsSync\([^)]*Path\)\s*\?\s*readFileSync\([^)]*Path,\s*'utf8'\)\s*:\s*''/,
    'app boundary assertion helper should not repeat optional fixture read ternaries'
);

assert.match(
    modularizationSmoke,
    /import \{[\s\S]*assertAppBootstrapServicesRegistry[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke must reuse the shared app-boundary bootstrap services assertion helper'
);

assert.doesNotMatch(
    modularizationSmoke,
    /function\s+assertAppBootstrapServicesRegistry\s*\(/,
    'modularization smoke should not keep a local bootstrap services assertion helper'
);

assert.match(
    modularizationSmoke,
    /import \{[\s\S]*assertAppSupportLoadersRegistry[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke must reuse the shared app-boundary support loader assertion helper'
);

assert.doesNotMatch(
    modularizationSmoke,
    /function\s+assertAppSupportLoadersRegistry\s*\(/,
    'modularization smoke should not keep a local support loader assertion helper'
);

assert.equal(
    packageJson.scripts?.['verify:split-state'],
    'node tests/rec-edit-split-state.mjs',
    'package.json must expose a reusable verify:split-state script'
);

assert.equal(
    packageJson.scripts?.['verify:supabase-keepalive'],
    'node --test tests/supabase-keepalive.test.mjs',
    'package.json must expose a reusable verify:supabase-keepalive script'
);

assertPackageTestScriptUsesGlob();
[
    { exportedName: 'parseTime', appDependencyName: 'timeUtils', modulePath: 'time.js', label: 'time parser' },
    { exportedName: 'timeToMinutes', appDependencyName: 'timeUtils', modulePath: 'time.js', label: 'time-to-minutes helper' },
    {
        exportedName: 'addMinutesToTimeValue',
        importedName: 'addMinutesToTime',
        appDependencyName: 'timeUtils',
        modulePath: 'time.js',
        label: 'add-minutes time helper',
    },
    { exportedName: 'addDaysToDate', appDependencyName: 'timeUtils', modulePath: 'time.js', label: 'date offset helper' },
    { exportedName: 'formatDate', appDependencyName: 'formatUtils', modulePath: 'format.js', label: 'date formatter' },
    { exportedName: 'formatSecs', appDependencyName: 'formatUtils', modulePath: 'format.js', label: 'duration formatter' },
    { exportedName: 'generateUniqueId', appDependencyName: 'idUtils', modulePath: 'id.js', label: 'unique ID generator' },
    { exportedName: 'createHiddenSplitState', appDependencyName: 'splitStateUtils', modulePath: 'split-state.js', label: 'hidden split-state factory' },
    { exportedName: 'deactivateItemInView', appDependencyName: 'splitStateUtils', modulePath: 'split-state.js', label: 'split-state deactivation helper' },
    { exportedName: 'ensureItemSplitViews', appDependencyName: 'splitStateUtils', modulePath: 'split-state.js', label: 'split-state view initializer' },
    { exportedName: 'getConnectedSplitItemIds', appDependencyName: 'splitStateUtils', modulePath: 'split-state.js', label: 'connected split item lookup' },
    { exportedName: 'getItemSplitState', appDependencyName: 'splitStateUtils', modulePath: 'split-state.js', label: 'live split-state lookup' },
    { exportedName: 'hasVisibleSplitStateInAnyView', appDependencyName: 'splitStateUtils', modulePath: 'split-state.js', label: 'split-state visibility scanner' },
    { exportedName: 'isItemVisibleInView', appDependencyName: 'splitStateUtils', modulePath: 'split-state.js', label: 'split-state visibility helper' },
    { exportedName: 'normalizeSplitViewType', appDependencyName: 'splitStateUtils', modulePath: 'split-state.js', label: 'split view type normalizer' },
    { exportedName: 'peekItemSplitState', appDependencyName: 'splitStateUtils', modulePath: 'split-state.js', label: 'split-state peek helper' },
    { exportedName: 'peekItemVisibilityInView', appDependencyName: 'splitStateUtils', modulePath: 'split-state.js', label: 'split-state visibility peek helper' },
    { exportedName: 'rebalanceSplitFamilyDuration', appDependencyName: 'splitStateUtils', modulePath: 'split-state.js', label: 'split family duration rebalancer' },
    { exportedName: 'setItemSplitState', appDependencyName: 'splitStateUtils', modulePath: 'split-state.js', label: 'split-state setter' },
    { exportedName: 'syncFamilyTotalDuration', appDependencyName: 'splitStateUtils', modulePath: 'split-state.js', label: 'split family duration sync helper' },
    { exportedName: 'syncLegacySplitFields', appDependencyName: 'splitStateUtils', modulePath: 'split-state.js', label: 'legacy split-state sync helper' },
].forEach((utilityFunction) => {
    assertAppUtilityFunctionsRegistry(utilityFunction);
});

assert.doesNotMatch(
    supabaseServiceModule,
    /from ['"]@supabase\/supabase-js['"]/,
    'supabase-service must not statically import the Supabase SDK into the initial app graph'
);
assert.match(
    supabaseServiceModule,
    /import\(['"]@supabase\/supabase-js['"]\)/,
    'supabase-service must dynamically import the Supabase SDK on first cloud API use'
);
assert.ok(existsSync(configuredSupabaseServicePath), 'configured Supabase service factory must exist for app bootstrap config wiring');
assert.match(
    configuredSupabaseServiceModule,
    /import \{ createSupabaseService \} from '\.\/supabase-service\.js';/,
    'configured Supabase service factory must own the base Supabase service import'
);
assert.match(
    configuredSupabaseServiceModule,
    /import \{ SUPABASE_URL, SUPABASE_KEY \} from '\.\.\/config\.js';/,
    'configured Supabase service factory must own Supabase config imports'
);
assert.match(
    configuredSupabaseServiceModule,
    /export function createConfiguredSupabaseService\(\)\s*\{[\s\S]*createSupabaseService\(\{\s*url:\s*SUPABASE_URL,\s*key:\s*SUPABASE_KEY\s*\}\)[\s\S]*\}/,
    'configured Supabase service factory must build the configured service from Supabase config'
);
assertAppBootstrapServicesRegistry({
    factoryName: 'createConfiguredSupabaseService',
    serviceName: 'supabaseService',
    modulePath: 'configured-supabase-service.js',
    label: 'configured Supabase',
});
assertAppBootstrapServicesRegistry({
    factoryName: 'createStorageService',
    serviceName: 'storageService',
    modulePath: 'storage-service.js',
    label: 'storage',
});
assert.doesNotMatch(
    appScript,
    /from '\.\/config\.js';/,
    'app.js should not import config.js directly after configured service extraction'
);
assert.doesNotMatch(
    appScript,
    /SUPABASE_URL|SUPABASE_KEY/,
    'app.js should not expose Supabase config names in the app bootstrap surface'
);
assert.doesNotMatch(
    appScript,
    /document\.getElementById\(|window\.location\.reload\(/,
    'app.js should keep browser global DOM/location adapters inside feature boundaries instead of root setup wiring'
);
{
    const storedValues = new Map();
    const storageService = createStorageService({
        getItem: (key) => storedValues.get(key) ?? null,
        setItem: (key, value) => storedValues.set(key, value),
        removeItem: (key) => storedValues.delete(key),
    });
    storageService.setItem('raw', 'value');
    assert.equal(storageService.getItem('raw'), 'value', 'storage service must delegate raw reads and writes to the injected storage backend');
    storageService.saveData('json', { saved: true });
    assert.deepEqual(storageService.loadData('json'), { saved: true }, 'storage service must JSON round-trip structured data through the injected backend');
    storageService.removeItem('raw');
    assert.equal(storageService.getItem('raw'), null, 'storage service must delegate removals to the injected storage backend');
    assert.throws(
        () => createStorageService(null),
        /createStorageService requires a storage backend with getItem, setItem, and removeItem/,
        'storage service should fail clearly when no storage backend is available'
    );
}

for (const href of [
    './styles/base.css',
    './styles/layout.css',
    './styles/components.css',
    './styles/mobile.css'
]) {
    assert.match(indexHtml, new RegExp(`href="${href.replace('.', '\\.')}"`), `index.html must link ${href}`);
}

assert.match(
    indexHtml,
    /<script type="module" src="\.\/scripts\/app\.js"><\/script>/,
    'index.html must load the module app entrypoint'
);
assert.match(
    indexHtml,
    /<script vite-ignore src="\.\/config\.local\.js"><\/script>/,
    'index.html must load local runtime config as a Vite-ignored runtime script before the app entrypoint'
);
assert.ok(
    indexHtml.indexOf('<script vite-ignore src="./config.local.js"></script>') < indexHtml.indexOf('<script type="module" src="./scripts/app.js"></script>'),
    'index.html must load local runtime config before app.js reads Supabase config'
);

for (const unusedRootLocalAlias of [
    'updateSplitStrings',
    'splitTrack',
    'resetAutoHide',
    'handleMobileResizeMove',
    'handleMobileResizeEnd',
    'dragElClone',
    'dragSourceType',
    'applyTheme',
    'updateAvatar',
    'handleAvatarUpload',
    'loadCloudData',
    'refreshLayout',
    'SLOT_HEIGHT',
    'PX_PER_MIN',
]) {
    assert.doesNotMatch(
        appScript,
        new RegExp(`const\\s+${unusedRootLocalAlias}\\s*=`),
        `app.js should not keep unused root-local alias ${unusedRootLocalAlias} after focused component ctx extraction`
    );
}

assert.doesNotMatch(
    appScript,
    /}\s*=\s*createAppDependencies\(\);\s*(?:let\s+\w+Feature;\s*)+createApp\(/,
    'app.js should keep mutable feature instances inside root setup instead of the module prelude'
);

for (const unusedStoreBinding of [
    'initialTouchY',
    'csvImportMode',
    'csvColumnMap',
]) {
    assert.doesNotMatch(
        appScript,
        new RegExp(`const\\s+\\{[\\s\\S]*\\b${unusedStoreBinding}\\b[\\s\\S]*\\}\\s*=\\s*store;`),
        `app.js should not destructure unused store binding ${unusedStoreBinding} into root setup`
    );
}

for (const featurePrivateStoreBinding of [
    'statClickIndexMap',
    'currentSearchIndex',
    'searchHighlightTimer',
    'lastHighlightedTrackId',
    'lastTrackSearchQuery',
    'trackSearchIndex',
    'resizing',
    'lastTapState',
    'mobileResizeState',
    'rawCsvRows',
    'csvHeadersMap',
    'midiTempoMap',
    'midiTimeSigs',
    'midiViewMode',
    'importSearchQuery',
    'activeImportMenu',
    'importMenuPos',
    'midiTimeSig',
    'midiGroupSearchQuery',
    'midiGroupPos',
    'activeMidiGroupRow',
    'csvSearchQuery',
    'activeImportTab',
    'collapsedProjects',
    'midiBpm',
    'trackListSearchQuery',
    'csvImportData',
    'csvImportConfig',
    'midiImportData',
    'showDurationPicker',
    'tempDuration',
    'pickerPos',
    'pickerMinRef',
    'pickerSecRef',
    'tempAvatarUrl',
]) {
    assert.doesNotMatch(
        appScript,
        new RegExp(`const\\s+\\{[\\s\\S]*\\b${featurePrivateStoreBinding}\\b[\\s\\S]*\\}\\s*=\\s*store;`),
        `app.js should not destructure feature-private store binding ${featurePrivateStoreBinding} into root setup`
    );
}

assert.ok(!/<style[\s>]/i.test(indexHtml), 'index.html should not contain an inline style block');

assert.match(
    modularizationSmoke,
    /import \{[\s\S]*assertAppStaticImportSurface[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should reuse the shared app static import surface helper'
);
assertAppStaticImportSurface();

assert.match(
    modularizationSmoke,
    /import \{[\s\S]*assertAppDependenciesRegistry[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should reuse the shared app dependency boundary helper'
);
assertAppDependenciesRegistry();

assert.match(
    modularizationSmoke,
    /import \{[\s\S]*assertAppVueRuntimeRegistry[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should reuse the shared Vue runtime boundary helper'
);
assertAppVueRuntimeRegistry();

assert.match(
    modularizationSmoke,
    /import \{[\s\S]*assertAppRootComponentsRegistry[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should reuse the shared root component boundary helper'
);
assert.doesNotMatch(
    modularizationSmoke,
    /const\s+appRootComponentsServiceModule\b/,
    'modularization smoke should not keep a local root component service module read after shared helper extraction'
);

assert.ok(existsSync(appRootStaticComponentsPath), 'app-root-static-components registry must exist for synchronous root component imports');
assertAppRootComponentsRegistry();
assert.match(
    modularizationSmoke,
    /import \{[\s\S]*assertAppRootSetupReturnSurface[\s\S]*rootSetupReturnObject[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should reuse the shared app root setup return surface helper and parsed return object'
);
assert.doesNotMatch(
    modularizationSmoke,
    /rootSetupReturnObject\s+as\s+sharedRootSetupReturnObject/,
    'modularization smoke should import the shared root setup return object directly'
);
assert.doesNotMatch(
    modularizationSmoke,
    /function\s+extractRootSetupReturnObject\s*\(/,
    'modularization smoke should not keep a local root setup return parser after shared helper extraction'
);
assert.doesNotMatch(
    modularizationSmoke,
    /const\s+rootSetupReturnObject\s*=\s*sharedRootSetupReturnObject/,
    'modularization smoke should not keep a root setup return object alias after shared helper extraction'
);
assertAppRootSetupReturnSurface();
assert.match(
    modularizationSmoke,
    /import \{[\s\S]*appRootStaticComponents[\s\S]*rootComponentsObject[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should reuse the shared root component fixture and parser'
);
assert.doesNotMatch(
    modularizationSmoke,
    /rootComponentsObject\s+as\s+sharedRootComponentsObject/,
    'modularization smoke should import the shared root component object directly'
);
assert.doesNotMatch(
    modularizationSmoke,
    /appRootStaticComponents\s+as\s+sharedAppRootStaticComponents/,
    'modularization smoke should import the shared root component fixture directly'
);
assert.doesNotMatch(
    modularizationSmoke,
    /function\s+extractRootComponentsObject\s*\(/,
    'modularization smoke should not keep a local root component parser after shared helper extraction'
);
assert.doesNotMatch(
    modularizationSmoke,
    /const\s+rootComponentsObject\s*=\s*sharedRootComponentsObject/,
    'modularization smoke should not keep a root component object alias after shared helper extraction'
);
assert.doesNotMatch(
    modularizationSmoke,
    /const\s+appRootStaticComponents\s*=\s*existsSync\(appRootStaticComponentsPath\)/,
    'modularization smoke should not keep a local app-root-static-components fixture read after shared helper extraction'
);
assert.doesNotMatch(
    modularizationSmoke,
    /const\s+appRootStaticComponents\s*=\s*sharedAppRootStaticComponents/,
    'modularization smoke should not keep an app-root-static-components fixture alias after shared helper extraction'
);
assert.match(
    appRootStaticComponents,
    /export const appRootStaticComponents\s*=\s*\{[\s\S]*\bAppRootShell\b[\s\S]*\bAppRootOverlaysShell\b[\s\S]*\};/,
    'app-root-static-components registry must expose the root component map consumed by app.js'
);
assert.match(
    appRootComponentsModule,
    /function createAppRootOptions\(\)\s*\{[\s\S]*components:\s*appRootStaticComponents[\s\S]*\}/,
    'app-root-components should mount the root component registry without app.js knowing the registry name'
);
assert.match(
    appScript,
    /\.\.\.createAppRootOptions\(\)/,
    'app.js should mount the root component registry through root app options'
);
assert.doesNotMatch(
    appScript,
    /components:\s*appRootStaticComponents/,
    'app.js should not directly mount the static root component registry after root options extraction'
);
assert.doesNotMatch(
    appScript,
    /appRootStaticComponents/,
    'app.js should not know the static root component registry symbol after root options extraction'
);
assert.doesNotMatch(
    appScript,
    /import \{\s*[\s\S]*\bAppRootShell\b[\s\S]*\bAppRootOverlaysShell\b[\s\S]*\}\s*from '\.\/components\/app-root-static-components\.js';/,
    'app.js should not locally name each root component after the registry owns the component map'
);
assert.doesNotMatch(
    appScript,
    /components:\s*\{\s*AppRootShell\s*,\s*AppRootOverlaysShell\s*\}/,
    'app.js should not hand-write the root components object after registry extraction'
);
assert.doesNotMatch(
    appScript,
    /from '\.\/components\/app-(?:header|sidebar|main-content|settings-modal|mobile-controls|mobile-task-input|export-modal|edit-modal|auth-modal|crop-modal|duration-picker|split-modal|input-modal|confirm-modal)\.js';/,
    'app.js should not directly import synchronous root component files after app-root-static-components extraction'
);
assert.doesNotMatch(
    appScript,
    /from '\.\/features\/track-list(?:-shell)?\.js';/,
    'app.js should not statically import the low-frequency track-list feature or shell into the initial app graph'
);
assert.doesNotMatch(
    appScript,
    /from '\.\/features\/midi-manager(?:-shell)?\.js';/,
    'app.js should not statically import the low-frequency MIDI Manager feature or shell into the initial app graph'
);
assert.match(
    trackListFeatureLoaderModule,
    /export function createTrackListFeatureLoader\(\{[\s\S]*importTrackListFeature\s*=\s*\(\)\s*=>\s*import\(['"]\.\.\/features\/track-list\.js['"]\),[\s\S]*\}\s*=\s*\{\}\)\s*\{/,
    'track-list feature loader service must expose a factory for low-frequency track-list wiring'
);
assert.match(
    trackListFeatureLoaderModule,
    /importTrackListFeature\(\)[\s\S]*registerTrackListFeature/,
    'track-list feature loader service must own the dynamic track-list feature import'
);

{
    let importCount = 0;
    const expectedRegisterTrackListFeature = () => ({ registered: true });
    const loadTrackListFeature = createTrackListFeatureLoader({
        importTrackListFeature: async () => {
            importCount += 1;
            return { registerTrackListFeature: expectedRegisterTrackListFeature };
        },
    });

    assert.equal(importCount, 0, 'track-list feature loader factory must not import the feature during bootstrap');
    assert.equal(
        await loadTrackListFeature(),
        expectedRegisterTrackListFeature,
        'track-list feature loader must resolve the injected feature registration function when invoked'
    );
    assert.equal(importCount, 1, 'track-list feature loader must defer importing until the returned loader is invoked');
    assert.throws(
        () => createTrackListFeatureLoader({ importTrackListFeature: null }),
        /createTrackListFeatureLoader requires an importTrackListFeature function/,
        'track-list feature loader should fail clearly when no feature importer is available'
    );
}

assertAppFeatureLoadersRegistry({
    factoryName: 'createTrackListFeatureLoader',
    loaderName: 'loadTrackListFeature',
    appConsumerName: 'wireTrackListFeature',
    modulePath: 'track-list-feature-loader.js',
    label: 'track-list feature',
});
assert.doesNotMatch(
    appScript,
    /import\(['"]\.\/features\/track-list\.js['"]\)/,
    'app.js must not retain the direct dynamic track-list feature import after loader extraction'
);
assert.doesNotMatch(
    appScript,
    /import\('\.\/features\/track-list-shell\.js'\)|registerTrackListShellFeature\(/,
    'app.js must not lazy-load or register the pass-through track-list shell feature'
);
assertTrackListStateBoundary({ createTrackListState, vueRef });
assert.match(
    midiManagerFeatureLoaderModule,
    /export function createMidiManagerFeatureLoader\(\{[\s\S]*importMidiManagerFeature\s*=\s*\(\)\s*=>\s*import\(['"]\.\.\/features\/midi-manager\.js['"]\),[\s\S]*\}\s*=\s*\{\}\)\s*\{/,
    'MIDI Manager feature loader service must expose a factory for low-frequency MIDI Manager wiring'
);
assert.match(
    midiManagerFeatureLoaderModule,
    /importMidiManagerFeature\(\)[\s\S]*registerMidiManagerFeature/,
    'MIDI Manager feature loader service must own the dynamic MIDI Manager feature import'
);

{
    let importCount = 0;
    const expectedRegisterMidiManagerFeature = () => ({ registered: true });
    const loadMidiManagerFeature = createMidiManagerFeatureLoader({
        importMidiManagerFeature: async () => {
            importCount += 1;
            return { registerMidiManagerFeature: expectedRegisterMidiManagerFeature };
        },
    });

    assert.equal(importCount, 0, 'MIDI Manager feature loader factory must not import the feature during bootstrap');
    assert.equal(
        await loadMidiManagerFeature(),
        expectedRegisterMidiManagerFeature,
        'MIDI Manager feature loader must resolve the injected feature registration function when invoked'
    );
    assert.equal(importCount, 1, 'MIDI Manager feature loader must defer importing until the returned loader is invoked');
    assert.throws(
        () => createMidiManagerFeatureLoader({ importMidiManagerFeature: null }),
        /createMidiManagerFeatureLoader requires an importMidiManagerFeature function/,
        'MIDI Manager feature loader should fail clearly when no feature importer is available'
    );
}

assertAppFeatureLoadersRegistry({
    factoryName: 'createMidiManagerFeatureLoader',
    loaderName: 'loadMidiManagerFeature',
    appConsumerName: 'wireMidiManagerFeature',
    modulePath: 'midi-manager-feature-loader.js',
    label: 'MIDI Manager feature',
});
assert.doesNotMatch(
    appScript,
    /import\('\.\/features\/midi-manager\.js'\)/,
    'app.js must not retain the direct dynamic MIDI Manager feature import after loader extraction'
);
assert.doesNotMatch(
    appScript,
    /import\('\.\/features\/midi-manager-shell\.js'\)/,
    'app.js must not lazy-load the pass-through MIDI Manager shell feature'
);
assertMidiManagerStateBoundary({ createMidiManagerState, vueReactive, vueComputed });

assert.ok(existsSync(asyncRootComponentPath), 'async-root-component helper must exist for low-frequency root modal lazy loading');
assert.match(
    asyncRootComponent,
    /import \{ defineAsyncComponent \} from 'vue';/,
    'async-root-component helper must own Vue defineAsyncComponent wiring'
);
assert.match(
    asyncRootComponent,
    /export function createAsyncRootComponent/,
    'async-root-component helper must export createAsyncRootComponent for root modal registration'
);

assert.ok(existsSync(appRootAsyncModalsPath), 'app-root-async-modals registry must exist for low-frequency root modal declarations');
assert.match(
    appRootAsyncModals,
    /import \{ createAsyncRootComponent \} from '\.\/async-root-component\.js';/,
    'app-root-async-modals registry must own the async root component helper import'
);
assert.match(
    [
        appScript,
        appStandaloneOverlaysShellComponent,
        appStandaloneOverlayComponents,
        appPickerModalsShellComponent,
        appPickerModalComponents,
    ].join('\n'),
    /from '\.\/(?:components\/)?app-root-async-modals\.js';/,
    'root-owned shell modules and their child registries must source low-frequency async root modals from the registry module'
);
assert.doesNotMatch(
    appScript,
    /createAsyncRootComponent/,
    'app.js should not own async root modal helper imports or declarations after app-root-async-modals extraction'
);

assert.ok(existsSync(appRootShellComponentPath), 'app-root-shell component must exist for the main root layout boundary');
assert.match(
    appRootShellComponent,
    /export const AppRootShell\s*=/,
    'app-root-shell component must export an AppRootShell component definition'
);
assert.match(
    appRootShellComponent,
    /import \{ appRootShellComponents \} from '\.\/app-root-shell-components\.js';[\s\S]*components:\s*appRootShellComponents/,
    'app-root-shell must mount the main layout child registry without naming each child locally'
);
assert.match(
    appRootShellComponents,
    /export const appRootShellComponents\s*=\s*\{[\s\S]*\bAppHeader\b[\s\S]*\bAppSidebar\b[\s\S]*\bAppMainContent\b[\s\S]*\bAppMobileControls\b[\s\S]*\};/,
    'app-root-shell-components must own the main layout child component map'
);
assert.doesNotMatch(
    appRootShellComponent,
    /import \{ App(?:Header|Sidebar|MainContent|MobileControls) \}/,
    'app-root-shell should not directly import individual main layout child components after registry extraction'
);
assert.match(
    appRootShellComponent,
    /template:\s*`[\s\S]*liquid-window[\s\S]*<app-header :ctx="ctx\.appHeader"><\/app-header>[\s\S]*<app-sidebar :ctx="ctx\.appSidebar"><\/app-sidebar>[\s\S]*<app-main-content :ctx="ctx\.appMainContent"><\/app-main-content>[\s\S]*<app-mobile-controls :ctx="ctx\.appMobileControls"><\/app-mobile-controls>[\s\S]*`/,
    'app-root-shell must own the root liquid-window layout and pass the existing focused child contexts through'
);
assert.match(
    appRootStaticComponents,
    /import \{ AppRootShell \} from '\.\/app-root-shell\.js';/,
    'app-root-static-components must import the app-root-shell component for the registry map'
);
assert.match(
    rootComponentsObject,
    /\bAppRootShell\b/,
    'appRootStaticComponents must register AppRootShell on the root Vue app'
);
for (const shellChildComponent of [
    'AppHeader',
    'AppSidebar',
    'AppMainContent',
    'AppMobileControls',
]) {
    assert.doesNotMatch(
        appScript,
        new RegExp(`components:\\s*\\{[^}]*\\b${shellChildComponent}\\b[^}]*\\}`),
        `app.js root components should not register ${shellChildComponent}; AppRootShell owns it locally`
    );
}
assertRootShellStateBoundary({ createRootShellState, vueReactive });

assert.ok(existsSync(appRootOverlaysShellComponentPath), 'app-root-overlays-shell component must exist for root overlay shell grouping');
assert.match(
    appRootOverlaysShellComponent,
    /export const AppRootOverlaysShell\s*=/,
    'app-root-overlays-shell component must export an AppRootOverlaysShell component definition'
);
assert.match(
    appRootOverlaysShellComponent,
    /import \{ appRootOverlayShellComponents \} from '\.\/app-root-overlay-shell-components\.js';[\s\S]*components:\s*appRootOverlayShellComponents/,
    'app-root-overlays-shell must mount the root overlay child registry without naming each overlay shell locally'
);
assert.match(
    appRootOverlayShellComponents,
    /export const appRootOverlayShellComponents\s*=\s*\{[\s\S]*\bAppStandaloneOverlaysShell\b[\s\S]*\bAppTaskActionModalsShell\b[\s\S]*\bAppAccountModalsShell\b[\s\S]*\bAppUtilityModalsShell\b[\s\S]*\bAppUniversalModalsShell\b[\s\S]*\bAppPickerModalsShell\b[\s\S]*\bAppExportCreditModalsShell\b[\s\S]*\bAppMidiCsvImportModalsShell\b[\s\S]*\bAppMetadataInfoModalsShell\b[\s\S]*\};/,
    'app-root-overlay-shell-components must own the root overlay shell component map'
);
assert.doesNotMatch(
    appRootOverlaysShellComponent,
    /import \{ App(?:StandaloneOverlaysShell|TaskActionModalsShell|AccountModalsShell|UtilityModalsShell|UniversalModalsShell|PickerModalsShell|ExportCreditModalsShell|MidiCsvImportModalsShell|MetadataInfoModalsShell) \}/,
    'app-root-overlays-shell should not directly import individual overlay shell components after registry extraction'
);
assert.match(
    appRootOverlaysShellComponent,
    /<app-standalone-overlays-shell :ctx="ctx\.appStandaloneOverlaysShell"><\/app-standalone-overlays-shell>[\s\S]*<app-task-action-modals-shell :ctx="ctx\.appTaskActionModalsShell"><\/app-task-action-modals-shell>[\s\S]*<app-account-modals-shell :ctx="ctx\.appAccountModalsShell"><\/app-account-modals-shell>[\s\S]*<app-utility-modals-shell :ctx="ctx\.appUtilityModalsShell"><\/app-utility-modals-shell>[\s\S]*<app-universal-modals-shell :ctx="ctx\.appUniversalModalsShell"><\/app-universal-modals-shell>[\s\S]*<app-picker-modals-shell :ctx="ctx\.appPickerModalsShell"><\/app-picker-modals-shell>[\s\S]*<app-export-credit-modals-shell :ctx="ctx\.appExportCreditModalsShell"><\/app-export-credit-modals-shell>[\s\S]*<app-midi-csv-import-modals-shell :ctx="ctx\.appMidiCsvImportModalsShell"><\/app-midi-csv-import-modals-shell>[\s\S]*<app-metadata-info-modals-shell :ctx="ctx\.appMetadataInfoModalsShell"><\/app-metadata-info-modals-shell>/,
    'app-root-overlays-shell must render the existing overlay shells with their focused ctx objects'
);
assert.match(
    appRootStaticComponents,
    /import \{ AppRootOverlaysShell \} from '\.\/app-root-overlays-shell\.js';/,
    'app-root-static-components must import the app-root-overlays-shell component for the registry map'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ App(?:StandaloneOverlaysShell|TaskActionModalsShell|AccountModalsShell|UtilityModalsShell|UniversalModalsShell|PickerModalsShell|ExportCreditModalsShell|MidiCsvImportModalsShell|MetadataInfoModalsShell) \}/,
    'app-root-static-components should only expose root components; AppRootOverlaysShell owns overlay shell imports locally'
);
assert.match(
    rootComponentsObject,
    /\bAppRootShell\b[\s\S]*\bAppRootOverlaysShell\b/,
    'appRootStaticComponents must register AppRootOverlaysShell on the root Vue app'
);
assert.match(
    appRootContextWiringModule,
    /const\s+\{\s*appRootShell,\s*appRootOverlaysShell\s*\}\s*=\s*createRootShellState\(\{(?![\s\S]*\breactive\b)[\s\S]*appHeader,[\s\S]*appSidebar,[\s\S]*appMainContent,[\s\S]*appMobileControls,[\s\S]*appStandaloneOverlaysShell,[\s\S]*appTaskActionModalsShell,[\s\S]*appAccountModalsShell,[\s\S]*appUtilityModalsShell,[\s\S]*appUniversalModalsShell,[\s\S]*appPickerModalsShell,[\s\S]*appExportCreditModalsShell,[\s\S]*appMidiCsvImportModalsShell,[\s\S]*appMetadataInfoModalsShell,[\s\S]*\}\);/,
    'app.js must create the two root shell contexts through the bound root shell state factory'
);
assert.doesNotMatch(
    appScript,
    /\blocals\s*:/,
    'app.js must publish root template aliases through assembly instead of a hand-synced locals list'
);
assert.doesNotMatch(
    appRootContextWiringModule,
    /\blocals\b/,
    'app-root-context-wiring must read template aliases from assembly.refs/assembly.helpers instead of a locals parameter'
);
{
    const wiringHelpersDestructure = appRootContextWiringModule.match(/const\s*\{([^{}]*)\}\s*=\s*assembly\.helpers;/);
    assert.ok(
        wiringHelpersDestructure,
        'app-root-context-wiring must destructure template aliases from assembly.helpers'
    );
    const publishedHelperKeys = new Set();
    for (const block of appScript.matchAll(/Object\.assign\(assembly\.helpers,\s*\{([\s\S]*?)\}\s*\);/g)) {
        for (const entry of block[1].split(',')) {
            const key = entry.match(/^\s*([A-Za-z_$][\w$]*)\s*(?::|$)/);
            if (key) publishedHelperKeys.add(key[1]);
        }
    }
    for (const [alias] of wiringHelpersDestructure[1].matchAll(/[A-Za-z_$][\w$]*/g)) {
        assert.ok(
            publishedHelperKeys.has(alias),
            `app-root-context-wiring destructures ${alias} from assembly.helpers, so app.js must publish it via Object.assign(assembly.helpers, ...)`
        );
    }
}
assert.doesNotMatch(
    appScript,
    /const appRootOverlaysShell\s*=\s*reactive\(\{[\s\S]*appStandaloneOverlaysShell[\s\S]*appTaskActionModalsShell[\s\S]*appAccountModalsShell[\s\S]*appUtilityModalsShell[\s\S]*appUniversalModalsShell[\s\S]*appPickerModalsShell[\s\S]*appExportCreditModalsShell[\s\S]*appMidiCsvImportModalsShell[\s\S]*appMetadataInfoModalsShell[\s\S]*\}\);/,
    'app.js should not own the top-level root overlays wrapper after root-shell-state extraction'
);
for (const rootOverlayShellChildComponent of [
    'AppStandaloneOverlaysShell',
    'AppTaskActionModalsShell',
    'AppAccountModalsShell',
    'AppUtilityModalsShell',
    'AppUniversalModalsShell',
    'AppPickerModalsShell',
    'AppExportCreditModalsShell',
    'AppMidiCsvImportModalsShell',
    'AppMetadataInfoModalsShell',
]) {
    assert.doesNotMatch(
        rootComponentsObject,
        new RegExp(`\\b${rootOverlayShellChildComponent}\\b`),
        `app.js root components should not register ${rootOverlayShellChildComponent}; AppRootOverlaysShell owns it locally`
    );
}
assertNoRootSetupReturnFields({
    fields: [
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
    messageForField: (field) => `app.js root setup return should expose root overlay shell field ${field} only through appRootOverlaysShell`,
});

assert.ok(existsSync(appHeaderComponentPath), 'app-header component must exist for root header template extraction');
assert.match(
    appHeaderComponent,
    /export const AppHeader\s*=/,
    'app-header component must export an AppHeader component definition'
);
assert.match(
    appHeaderComponent,
    /template:\s*`[\s\S]*<header[\s\S]*tour-sync-btn[\s\S]*json-upload[\s\S]*midi-import-input[\s\S]*<\/header>[\s\S]*`/,
    'app-header component must own the existing top-bar header template, including sync, upload, and MIDI inputs'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppHeader \} from '\.\/app-header\.js';/,
    'app-root-static-components should not expose AppHeader once AppRootShell owns it locally'
);
assert.match(
    appRootShellComponents,
    /import \{ AppHeader \} from '\.\/app-header\.js';/,
    'app-root-shell-components must import the app-header component locally'
);
assert.match(
    appRootShellComponent,
    /<app-header\b[^>]*><\/app-header>/,
    'app-root-shell must render the extracted app-header component'
);
assert.match(
    appStateFactoriesModule,
    /import \{ createHeaderShellState \} from '\.\.\/state\/header-shell-state\.js';/,
    'app state factories should import the header shell ctx factory'
);
assert.match(
    appStateFactoriesModule,
    /function createRootHeaderShellState\(options\)\s*\{[\s\S]*return createHeaderShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the header shell ctx factory'
);
assert.match(
    appRootContextWiringModule,
    /const appHeader\s*=\s*createRootHeaderShellState\(\{[\s\S]*showMobileMenu[\s\S]*themeMode[\s\S]*getThemeLabel[\s\S]*openSettings[\s\S]*toggleTheme[\s\S]*\}\);/,
    'app.js must expose header theme controls through the focused appHeader ctx factory without unused settings state'
);
assert.doesNotMatch(
    appScript,
    /const appHeader\s*=\s*(?:reactive|createRootHeaderShellState)\(\{[\s\S]*showSettings[\s\S]*\}\);/,
    'appHeader ctx should not expose showSettings because the header only opens settings through openSettings'
);
assert.match(
    appHeaderComponent,
    /@click="ctx\.openSettings"[\s\S]*设置选项/,
    'app-header must open settings through the root-owned appHeader action so the async settings modal observes the root state'
);
assertNoRootSetupReturnFields({
    fields: ['themeMode', 'getThemeLabel', 'toggleTheme', 'isDark', 'applyTheme'],
    messageForField: (field) => `app.js root setup return should expose theme field ${field} through focused feature/component contexts instead of the root return`,
});
assertNoRootSetupReturnFields({
    fields: ['showProfileMenu', 'tempAvatarUrl', 'handleUserBtnClick', 'updateAvatar', 'user', 'handleAvatarUpload'],
    messageForField: (field) => `app.js root setup return should expose profile/header field ${field} through focused contexts instead of the root return`,
});
assertNoRootSetupReturnFields({
    fields: [
        'exportCSV',
        'exportToICS',
        'exportJSON',
        'importJSON',
        'openCreditModal',
        'handleManualSync',
        'handleSessionAction',
        'handleSearchEnter',
        'updateNickname',
        'onFileSelect',
        'handleLogout',
        'startTour',
        'handleJSONFile',
        'handleMidiFile',
    ],
    messageForField: (field) => `app.js root setup return should expose header command ${field} through appHeader instead of the root return`,
});
assertNoRootSetupReturnFields({
    fields: ['undo', 'redo', 'historyIndex', 'history', 'currentSessionId', 'switchSession'],
    messageForField: (field) => `app.js root setup return should expose header history/session field ${field} through appHeader instead of the root return`,
});
assertNoRootSetupReturnFields({
    fields: [
        'activeDropdown',
        'dropdownSearch',
        'toggleDropdown',
        'selectOption',
        'filteredOptions',
        'getOrCreateSettingItem',
        'dropdownExpandedGroups',
        'toggleDropdownGroup',
    ],
    messageForField: (field) => `app.js root setup return should expose dropdown field ${field} through focused component contexts instead of the root return`,
});
assertNoRootSetupReturnFields({
    fields: [
        'onMainTouchStart',
        'onMainTouchEnd',
        'draggingTaskElement',
        'initialTouchCoords',
        'dragElClone',
        'dragSourceType',
        'isResizingMobile',
        'mobileResizeState',
        'initMobileResize',
        'handleMobileResizeMove',
        'handleMobileResizeEnd',
        'handleTouchStart',
        'handleTouchMove',
        'handleTouchEnd',
        'handlePoolTouchStart',
    ],
    messageForField: (field) => `app.js root setup return should expose mobile interaction field ${field} through focused component contexts instead of the root return`,
});
assert.doesNotMatch(
    indexHtml,
    /<header class="h-16[\s\S]*?<\/header>/,
    'index.html should not retain the inline top-bar header DOM after app-header extraction'
);

assert.ok(existsSync(appSidebarComponentPath), 'app-sidebar component must exist for root sidebar template extraction');
assert.match(
    appSidebarComponent,
    /export const AppSidebar\s*=/,
    'app-sidebar component must export an AppSidebar component definition'
);
assert.match(
    appSidebarComponent,
    /template:\s*`[\s\S]*<aside id="sidebar"[\s\S]*tour-new-task[\s\S]*tour-first-stat-card[\s\S]*<\/aside>[\s\S]*`/,
    'app-sidebar component must own the existing sidebar template, including new-task and first stat tour anchors'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppSidebar \} from '\.\/app-sidebar\.js';/,
    'app-root-static-components should not expose AppSidebar once AppRootShell owns it locally'
);
assert.match(
    appRootShellComponents,
    /import \{ AppSidebar \} from '\.\/app-sidebar\.js';/,
    'app-root-shell-components must import the app-sidebar component locally'
);
assert.match(
    appSidebarComponent,
    /:ref="\s*\(el\) => \{\s*sidebarScrollRef = el;\s*\}\s*"/,
    'app-sidebar must use a function template ref so the extracted component writes through the sidebarScrollRef ctx setter without Vue string-ref warnings'
);
assert.match(
    appRootShellComponent,
    /<app-sidebar\b[^>]*><\/app-sidebar>/,
    'app-root-shell must render the extracted app-sidebar component'
);
assert.doesNotMatch(
    indexHtml,
    /<aside id="sidebar"[\s\S]*?<\/aside>/,
    'index.html should not retain the inline sidebar DOM after app-sidebar extraction'
);

assert.ok(existsSync(appMainContentComponentPath), 'app-main-content component must exist for root main schedule template extraction');
assert.match(
    appMainContentComponent,
    /export const AppMainContent\s*=/,
    'app-main-content component must export an AppMainContent component definition'
);
assert.match(
    appMainContentComponent,
    /template:\s*`[\s\S]*<main id="main-content"[\s\S]*tour-view-switch[\s\S]*view-week[\s\S]*view-month[\s\S]*<\/main>[\s\S]*`/,
    'app-main-content component must own the existing schedule main template, including view switch and week/month views'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppMainContent \} from '\.\/app-main-content\.js';/,
    'app-root-static-components should not expose AppMainContent once AppRootShell owns it locally'
);
assert.match(
    appRootShellComponents,
    /import \{ AppMainContent \} from '\.\/app-main-content\.js';/,
    'app-root-shell-components must import the app-main-content component locally'
);
assert.match(
    appRootShellComponent,
    /<app-main-content\b[^>]*><\/app-main-content>/,
    'app-root-shell must render the extracted app-main-content component'
);
assert.doesNotMatch(
    indexHtml,
    /<main id="main-content"[\s\S]*?<\/main>/,
    'index.html should not retain the inline main schedule DOM after app-main-content extraction'
);

assert.ok(existsSync(appSettingsModalComponentPath), 'app-settings-modal component must exist for root settings modal template extraction');
assert.match(
    appSettingsModalComponent,
    /export const AppSettingsModal\s*=/,
    'app-settings-modal component must export an AppSettingsModal component definition'
);
assert.match(
    appSettingsModalComponent,
    /template:\s*`[\s\S]*v-if="showSettings"[\s\S]*Preferences[\s\S]*CSV Data Import[\s\S]*恢复出厂设置[\s\S]*<\/div>[\s\S]*`/,
    'app-settings-modal component must own the existing settings modal template, including metadata, CSV import, and reset controls'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppSettingsModal \} from '\.\/app-settings-modal\.js';/,
    'app-root-static-components should not keep low-frequency app-settings-modal in the synchronous root registry'
);
assert.match(
    appRootAsyncModals,
    /export const AppSettingsModal\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-settings-modal\.js'\), 'AppSettingsModal'\);/,
    'app-root-async-modals must register the low-frequency Settings modal through createAsyncRootComponent dynamic import'
);
// shell state 行为断言用的 mock 桶：任意键都返回稳定的假 ref。
function createShellSourceMock() {
    const cache = new Map();
    return new Proxy({}, {
        get(_, key) {
            if (!cache.has(key)) cache.set(key, { value: { ref: key } });
            return cache.get(key);
        },
    });
}
function instantiateShellState(factory, bucketNames) {
    const sources = {};
    for (const name of bucketNames) sources[name] = createShellSourceMock();
    return { ctx: factory({ reactive: (value) => value, ...sources }), sources };
}

{
    const { createSettingsModalShellState } = await import('../app/scripts/state/settings-modal-shell-state.js');
    const state = createShellSourceMock();
    const ctx = createSettingsModalShellState({
        reactive: (value) => value,
        refs: createShellSourceMock(),
        state,
        computedState: createShellSourceMock(),
        actions: createShellSourceMock(),
    });
    assert.equal(
        ctx.settingsExpandedGroups,
        state.settingsExpandedGroups,
        'settings modal shell state must pass the reactive settingsExpandedGroups Set without unwrapping it as a ref'
    );
}
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showSettings" class="modal-overlay z-\[5000\]"[\s\S]*?恢复出厂设置[\s\S]*?<\/div>/,
    'index.html should not retain the inline settings modal DOM after app-settings-modal extraction'
);
assertNoRootSetupReturnFields({
    fields: ['showSettings', 'showMetadataManager', 'inputRects'],
    messageForField: (field) => `app.js root setup return should expose settings modal field ${field} through focused component contexts instead of the root return`,
});

assert.ok(existsSync(appMobileControlsComponentPath), 'app-mobile-controls component must exist for mobile search/tab extraction');
assert.match(
    appMobileControlsComponent,
    /export const AppMobileControls\s*=/,
    'app-mobile-controls component must export an AppMobileControls component definition'
);
assert.match(
    appMobileControlsComponent,
    /template:\s*`[\s\S]*v-if="ctx\.isMobile"[\s\S]*ctx\.globalSearchQuery[\s\S]*mobile-tab-bar[\s\S]*ctx\.mobileTab[\s\S]*`/,
    'app-mobile-controls component must own the existing mobile search overlay and bottom tab bar template'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppMobileControls \} from '\.\/app-mobile-controls\.js';/,
    'app-root-static-components should not expose AppMobileControls once AppRootShell owns it locally'
);
assert.match(
    appRootShellComponents,
    /import \{ AppMobileControls \} from '\.\/app-mobile-controls\.js';/,
    'app-root-shell-components must import the app-mobile-controls component locally'
);
assert.match(
    appRootContextWiringModule,
    /const appMobileControls\s*=\s*createRootMobileControlsShellState\(\{[\s\S]*globalSearchQuery[\s\S]*isSearchFocused[\s\S]*mobileTab[\s\S]*showMobileTaskInput[\s\S]*\}\);/,
    'app.js must expose mobile controls state through a small appMobileControls ctx factory call'
);
assertNoRootSetupReturnFields({
    fields: [
        'isMobile',
        'globalSearchQuery',
        'isSearchFocused',
        'mobileTab',
        'onSearchFocus',
        'handleSearchBlur',
        'handleSearchEnter',
    ],
    messageForField: (field) => `app.js root setup return should expose mobile controls/search field ${field} through focused component contexts instead of the root return`,
});
assert.match(
    appRootShellComponent,
    /<app-mobile-controls\b[^>]*><\/app-mobile-controls>/,
    'app-root-shell must render the extracted app-mobile-controls component'
);
assert.doesNotMatch(
    indexHtml,
    /<div v-if="isMobile"[\s\S]*?mobile-tab-bar[\s\S]*?<\/div>\s*<\/div>/,
    'index.html should not retain the inline mobile search and tab controls after app-mobile-controls extraction'
);

assert.ok(existsSync(appMobileTaskInputComponentPath), 'app-mobile-task-input component must exist for mobile task input extraction');
assert.match(
    appMobileTaskInputComponent,
    /export const AppMobileTaskInput\s*=/,
    'app-mobile-task-input component must export an AppMobileTaskInput component definition'
);
assert.match(
    appMobileTaskInputComponent,
    /template:\s*`[\s\S]*v-if="showMobileTaskInput"[\s\S]*添加新任务[\s\S]*filteredOptions[\s\S]*getGroupedOptions[\s\S]*toggleDropdownGroup[\s\S]*selectOption[\s\S]*openQuickAdd[\s\S]*openDurationPicker[\s\S]*addItemToPool[\s\S]*`/,
    'app-mobile-task-input component must own the existing mobile task input template, including selectors, duration picker trigger, quick-add buttons, and pool add action'
);
assert.match(
    appMobileTaskInputComponent,
    /newItem\.projectId[\s\S]*newItem\.instrumentId[\s\S]*newItem\.musicianId[\s\S]*newItem\.musicDuration/,
    'app-mobile-task-input component must bind the existing draft project, instrument, musician, and duration fields'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppMobileTaskInput \} from '\.\/app-mobile-task-input\.js';/,
    'app-root-static-components should not keep low-frequency app-mobile-task-input in the synchronous root registry'
);
assert.match(
    appRootAsyncModals,
    /export const AppMobileTaskInput\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-mobile-task-input\.js'\), 'AppMobileTaskInput'\);/,
    'app-root-async-modals must register the low-frequency mobile task input through createAsyncRootComponent dynamic import'
);
assert.match(
    appStateFactoriesModule,
    /import \{ createMobileTaskInputShellState \} from '\.\.\/state\/mobile-task-input-shell-state\.js';[\s\S]*function createRootMobileTaskInputShellState\(options\)\s*\{[\s\S]*reactive,[\s\S]*\.\.\.options,/,
    'app state factories should bind Vue reactive for the mobile task input shell ctx factory'
);
assert.match(
    appRootContextWiringModule,
    /const appMobileTaskInput\s*=\s*createRootMobileTaskInputShellState\(\{(?=[\s\S]*showMobileTaskInput)(?=[\s\S]*newItem)(?=[\s\S]*activeDropdown)(?=[\s\S]*dropdownSearch)(?=[\s\S]*dropdownExpandedGroups)(?=[\s\S]*filteredOptions)(?=[\s\S]*isMobile)(?=[\s\S]*getGroupColor)(?=[\s\S]*getNameById)(?=[\s\S]*getGroupedOptions)(?=[\s\S]*toggleDropdown)(?=[\s\S]*toggleDropdownGroup)(?=[\s\S]*selectOption)(?=[\s\S]*openQuickAdd)(?=[\s\S]*openDurationPicker)(?=[\s\S]*addItemToPool)[\s\S]*\}\);/,
    'app.js must expose mobile task input state and actions through a focused appMobileTaskInput ctx factory call'
);
assert.doesNotMatch(
    appScript,
    /const appMobileTaskInput\s*=\s*reactive\(\{[\s\S]*showMobileTaskInput[\s\S]*newItem[\s\S]*addItemToPool[\s\S]*\}\);/,
    'app.js should not own the mobile task input reactive ctx object after shell ctx extraction'
);
assertNoRootSetupReturnFields({
    fields: ['showMobileTaskInput', 'newItem', 'addItemToPool'],
    messageForField: (field) => `app.js root setup return should expose mobile task input template field ${field} through focused component contexts instead of the root return`,
});
assert.match(
    appStandaloneOverlaysShellComponent,
    /<app-mobile-task-input\b[^>]*><\/app-mobile-task-input>/,
    'app-standalone-overlays-shell must render the extracted app-mobile-task-input component'
);
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showMobileTaskInput" class="modal-overlay z-\[1000\]"[\s\S]*?添加新任务[\s\S]*?addItemToPool\(\)[\s\S]*?<\/div>\s*<\/div>/,
    'index.html should not retain the inline mobile task input DOM after app-mobile-task-input extraction'
);

assert.ok(existsSync(appExportCreditModalsShellComponentPath), 'app-export-credit-modals-shell component must exist for Export/Credit modal grouping');
assert.match(
    appExportCreditModalsShellComponent,
    /export const AppExportCreditModalsShell\s*=/,
    'app-export-credit-modals-shell component must export an AppExportCreditModalsShell component definition'
);
assert.match(
    appExportCreditModalsShellComponent,
    /import \{ appExportCreditModalComponents \} from '\.\/app-export-credit-modal-components\.js';[\s\S]*components:\s*appExportCreditModalComponents/,
    'app-export-credit-modals-shell must mount the Export/Credit modal registry without naming each async modal locally'
);
assert.match(
    appExportCreditModalComponents,
    /import \{[\s\S]*AppExportModal[\s\S]*AppCreditModal[\s\S]*\} from '\.\/app-root-async-modals\.js';[\s\S]*export const appExportCreditModalComponents\s*=\s*\{[\s\S]*\bAppExportModal\b[\s\S]*\bAppCreditModal\b[\s\S]*\};/,
    'app-export-credit-modal-components must own the async Export/Credit modal component map'
);
assert.doesNotMatch(
    appExportCreditModalsShellComponent,
    /import \{[\s\S]*AppExportModal[\s\S]*AppCreditModal[\s\S]*\} from '\.\/app-root-async-modals\.js';/,
    'app-export-credit-modals-shell should not directly import Export/Credit modal components after registry extraction'
);
assert.match(
    appExportCreditModalsShellComponent,
    /template:\s*`[\s\S]*<app-export-modal :ctx="ctx\.appExportModal"><\/app-export-modal>[\s\S]*<app-credit-modal :ctx="ctx\.appCreditModal"><\/app-credit-modal>[\s\S]*`/,
    'app-export-credit-modals-shell must render the Export and Credit modals with their existing ctx objects'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppExportCreditModalsShell \} from '\.\/app-export-credit-modals-shell\.js';/,
    'app-root-static-components should not expose the Export/Credit modal shell once AppRootOverlaysShell owns it locally'
);
assert.match(
    appRootOverlayShellComponents,
    /appRootOverlayShellComponents\s*=\s*\{[\s\S]*\bAppExportCreditModalsShell\b[\s\S]*\}/,
    'app-root-overlay-shell-components must register AppExportCreditModalsShell locally'
);
for (const exportShellChildComponent of [
    'AppExportModal',
    'AppCreditModal',
]) {
    assert.doesNotMatch(
        appScript,
        new RegExp(`components:\\s*\\{[^}]*\\b${exportShellChildComponent}\\b[^}]*\\}`),
        `app.js root components should not register ${exportShellChildComponent}; AppExportCreditModalsShell owns it locally`
    );
}
assert.match(
    appStateFactoriesModule,
    /import \{ createExportCreditModalsShellState \} from '\.\.\/state\/export-credit-modals-shell-state\.js';[\s\S]*function createRootExportCreditModalsShellState\(options\)\s*\{[\s\S]*reactive,[\s\S]*\.\.\.options,/,
    'app state factories should bind Vue reactive for the Export/Credit modal group shell ctx factory'
);
assert.match(
    appRootContextWiringModule,
    /const appExportCreditModalsShell\s*=\s*createRootExportCreditModalsShellState\(\{[\s\S]*appExportModal[\s\S]*appCreditModal[\s\S]*\}\);/,
    'app.js must expose the Export/Credit modal group through one focused shell ctx factory call'
);
assert.doesNotMatch(
    appScript,
    /const appExportCreditModalsShell\s*=\s*reactive\(\{[\s\S]*appExportModal[\s\S]*appCreditModal[\s\S]*\}\);/,
    'app.js should not own the Export/Credit modal group reactive ctx object after shell ctx extraction'
);
assert.match(
    appRootOverlaysShellComponent,
    /<app-export-credit-modals-shell\b[^>]*><\/app-export-credit-modals-shell>/,
    'app-root-overlays-shell must render the Export/Credit modal shell'
);
assertNoRootSetupReturnFields({
    fields: ['appExportModal', 'appCreditModal'],
    messageForField: (field) => `app.js root setup return should expose ${field} through appExportCreditModalsShell instead of the root return`,
});
for (const groupedExportTag of [
    'app-export-modal',
    'app-credit-modal',
]) {
    assert.doesNotMatch(
        indexHtml,
        new RegExp(`<${groupedExportTag}\\b[^>]*><\\/${groupedExportTag}>`),
        `index.html should not render ${groupedExportTag} directly after Export/Credit shell grouping`
    );
}

assert.ok(existsSync(appExportModalComponentPath), 'app-export-modal component must exist for Export modal extraction');
assert.match(
    appExportModalComponent,
    /export const AppExportModal\s*=/,
    'app-export-modal component must export an AppExportModal component definition'
);
assert.match(
    appExportModalComponent,
    /template:\s*`[\s\S]*v-if="showExportModal"[\s\S]*导出表格[\s\S]*exportFilter\.dateFrom[\s\S]*exportDateRange\.min[\s\S]*exportSessionOptions[\s\S]*toggleFilterItem[\s\S]*exportFilter\.types[\s\S]*toggleFilterAll[\s\S]*filteredExportProjects[\s\S]*filteredExportMusicians[\s\S]*filteredExportInstruments[\s\S]*confirmExport[\s\S]*`/,
    'app-export-modal component must own the existing export filter template, including date, session, type, project, musician, instrument filters, and confirm action'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppExportModal \} from '\.\/app-export-modal\.js';/,
    'app-root-static-components should not keep low-frequency app-export-modal in the synchronous root registry'
);
assert.match(
    appRootAsyncModals,
    /export const AppExportModal\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-export-modal\.js'\), 'AppExportModal'\);/,
    'app-root-async-modals must register the low-frequency Export modal through createAsyncRootComponent dynamic import'
);
assert.match(
    appExportCreditModalComponents,
    /appExportCreditModalComponents\s*=\s*\{[\s\S]*\bAppExportModal\b[\s\S]*\}/,
    'app-export-credit-modal-components must register AppExportModal locally'
);
{
    const { ctx } = instantiateShellState(createExportModalShellState, ['refs', 'state', 'computedState', 'actions']);
    for (const key of [
        'showExportModal', 'exportFilter', 'exportSessionOptions', 'filteredExportProjects',
        'filteredExportMusicians', 'filteredExportInstruments', 'exportDateRange', 'exportPreviewCount',
        'toggleFilterItem', 'toggleFilterAll', 'confirmExport',
    ]) {
        assert.ok(key in ctx, `export-modal-shell-state must own the focused Export modal ctx shape (missing ${key})`);
    }
}
assert.match(
    appStateFactoriesModule,
    /import \{ createExportModalShellState \} from '\.\.\/state\/export-modal-shell-state\.js';[\s\S]*function createRootExportModalShellState\(options\)\s*\{[\s\S]*reactive,[\s\S]*\.\.\.options,/,
    'app state factories should bind Vue reactive for the Export modal ctx factory'
);
assert.match(
    appRootContextWiringModule,
    /const appExportModal\s*=\s*createRootExportModalShellState\(\{[\s\S]*refs:[\s\S]*showExportModal[\s\S]*state:[\s\S]*exportFilter[\s\S]*computedState:[\s\S]*exportSessionOptions[\s\S]*filteredExportProjects[\s\S]*filteredExportMusicians[\s\S]*filteredExportInstruments[\s\S]*exportDateRange[\s\S]*exportPreviewCount[\s\S]*actions:[\s\S]*toggleFilterItem:[\s\S]*toggleFilterAll:[\s\S]*confirmExport:[\s\S]*\}\);/,
    'app.js must expose Export modal state and actions through the focused Export modal ctx factory'
);
assert.doesNotMatch(
    appScript,
    /const appExportModal\s*=\s*reactive\(\{[\s\S]*showExportModal[\s\S]*exportFilter[\s\S]*exportSessionOptions[\s\S]*filteredExportProjects[\s\S]*filteredExportMusicians[\s\S]*filteredExportInstruments[\s\S]*exportDateRange[\s\S]*toggleFilterItem[\s\S]*toggleFilterAll[\s\S]*confirmExport[\s\S]*\}\);/,
    'app.js should not own the Export modal reactive ctx object after Export modal ctx extraction'
);
assert.match(
    appExportCreditModalsShellComponent,
    /<app-export-modal\b[^>]*><\/app-export-modal>/,
    'app-export-credit-modals-shell must render the extracted app-export-modal component'
);
assertNoRootSetupReturnFields({
    fields: [
        'showExportModal',
        'exportFilter',
        'exportSessionOptions',
        'filteredExportProjects',
        'filteredExportMusicians',
        'filteredExportInstruments',
        'exportDateRange',
        'exportPreviewCount',
        'toggleFilterItem',
        'toggleFilterAll',
        'confirmExport',
    ],
    messageForField: (field) => `app.js root setup return should expose Export modal template field ${field} only through appExportModal`,
});
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showExportModal" class="modal-overlay z-\[5500\]"[\s\S]*?导出表格[\s\S]*?confirmExport[\s\S]*?<\/div>\s*<\/div>/,
    'index.html should not retain the inline Export modal DOM after app-export-modal extraction'
);

assert.ok(existsSync(appCreditModalComponentPath), 'app-credit-modal component must exist for Credit modal extraction');
assert.match(
    appCreditModalComponent,
    /export const AppCreditModal\s*=/,
    'app-credit-modal component must export an AppCreditModal component definition'
);
assert.match(
    appCreditModalComponent,
    /template:\s*`[\s\S]*v-if="showCreditModal"[\s\S]*Project Credits[\s\S]*midiBpm[\s\S]*midiTimeSig\[0\][\s\S]*managingProject\?\.name[\s\S]*copyCreditText[\s\S]*generatedCreditText[\s\S]*`/,
    'app-credit-modal component must own the existing Project Credits template, including metadata, copy action, and generated text'
);
assert.match(
    asyncRootComponent,
    /import \{ defineAsyncComponent \} from 'vue';/,
    'async-root-component helper must import defineAsyncComponent from Vue before async modal registration'
);
assert.doesNotMatch(
    appScript,
    /import \{ AppCreditModal \} from '\.\/components\/app-credit-modal\.js';/,
    'app.js should not statically import the low-frequency Credit modal into the initial module graph'
);
assert.match(
    appRootAsyncModals,
    /export const AppCreditModal\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-credit-modal\.js'\), 'AppCreditModal'\);/,
    'app-root-async-modals must register the low-frequency Credit modal through createAsyncRootComponent dynamic import'
);
assert.match(
    appExportCreditModalComponents,
    /appExportCreditModalComponents\s*=\s*\{[\s\S]*\bAppCreditModal\b[\s\S]*\}/,
    'app-export-credit-modal-components must register AppCreditModal locally'
);
assert.match(
    appRootContextWiringModule,
    /const appCreditModal\s*=\s*createRootCreditModalShellState\(\{(?=[\s\S]*showCreditModal)(?=[\s\S]*generatedCreditText)(?=[\s\S]*midiBpm)(?=[\s\S]*midiTimeSig)(?=[\s\S]*managingProject)(?=[\s\S]*copyCreditText)[\s\S]*\}\);/,
    'app.js must expose Credit modal state and actions through a focused appCreditModal ctx factory call'
);
assert.doesNotMatch(
    appScript,
    /const appCreditModal\s*=\s*reactive\(\{[\s\S]*showCreditModal[\s\S]*generatedCreditText[\s\S]*midiBpm[\s\S]*midiTimeSig[\s\S]*managingProject[\s\S]*copyCreditText[\s\S]*\}\);/,
    'app.js should not own the Credit modal reactive ctx body after extraction'
);
assert.match(
    appStateFactoriesModule,
    /import \{ createCreditModalShellState \} from '\.\.\/state\/credit-modal-shell-state\.js';[\s\S]*function createRootCreditModalShellState\(options\)\s*\{[\s\S]*reactive,[\s\S]*\.\.\.options,/,
    'app-state-factories must bind Vue reactive for the Credit modal shell ctx factory'
);
assert.ok(existsSync(creditModalShellStatePath), 'credit-modal-shell-state module must exist for focused Credit modal ctx extraction');
assert.match(
    creditModalShellStateModule,
    /export const createCreditModalShellState = defineShellState\(/,
    'credit-modal-shell-state module must expose a focused Credit modal ctx factory'
);
{
    const actions = [];
    const refs = {
        showCreditModal: { value: false },
        generatedCreditText: { value: 'initial credits' },
        managingProject: { value: { name: 'Project A' } },
    };
    const midiRefs = {
        midiBpm: { value: 120 },
        midiTimeSig: { value: [4, 4] },
    };
    const ctx = createCreditModalShellState({
        reactive: (value) => value,
        refs,
        midiRefs,
        actions: {
            copyCreditText: () => actions.push('copy'),
        },
    });
    assert.equal(ctx.showCreditModal, false, 'Credit modal ctx should expose modal visibility through a getter');
    assert.equal(ctx.generatedCreditText, 'initial credits', 'Credit modal ctx should expose generated text through a getter');
    assert.equal(ctx.midiBpm, 120, 'Credit modal ctx should expose MIDI BPM from store refs');
    assert.deepEqual(ctx.midiTimeSig, [4, 4], 'Credit modal ctx should expose MIDI time signature from store refs');
    assert.equal(ctx.managingProject.name, 'Project A', 'Credit modal ctx should expose managing project through a getter');
    ctx.showCreditModal = true;
    ctx.generatedCreditText = 'updated credits';
    assert.equal(refs.showCreditModal.value, true, 'Credit modal ctx should preserve visibility two-way binding');
    assert.equal(refs.generatedCreditText.value, 'updated credits', 'Credit modal ctx should preserve generated text two-way binding');
    ctx.copyCreditText();
    assert.deepEqual(actions, ['copy'], 'Credit modal ctx should pass through the copy action');
    assert.throws(
        () => createCreditModalShellState({ refs, midiRefs, actions: {} }),
        /requires Vue reactive factory/,
        'Credit modal ctx factory should fail clearly when Vue reactive is missing'
    );
}
assert.match(
    appExportCreditModalsShellComponent,
    /<app-credit-modal\b[^>]*><\/app-credit-modal>/,
    'app-export-credit-modals-shell must render the extracted app-credit-modal component'
);
assertNoRootSetupReturnFields({
    fields: ['showCreditModal', 'generatedCreditText', 'midiBpm', 'midiTimeSig', 'managingProject', 'copyCreditText'],
    messageForField: (field) => `app.js root setup return should expose Credit/MIDI modal template field ${field} only through focused modal contexts`,
});
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showCreditModal" class="modal-overlay z-\[5000\]"[\s\S]*?Project Credits[\s\S]*?generatedCreditText[\s\S]*?<\/div>\s*<\/div>/,
    'index.html should not retain the inline Credit modal DOM after app-credit-modal extraction'
);

assert.ok(existsSync(appMidiCsvImportModalsShellComponentPath), 'app-midi-csv-import-modals-shell component must exist for MIDI/CSV import modal grouping');
assert.match(
    appMidiCsvImportModalsShellComponent,
    /export const AppMidiCsvImportModalsShell\s*=/,
    'app-midi-csv-import-modals-shell component must export an AppMidiCsvImportModalsShell component definition'
);
assert.match(
    appMidiCsvImportModalsShellComponent,
    /import \{ appMidiCsvImportModalComponents \} from '\.\/app-midi-csv-import-modal-components\.js';[\s\S]*components:\s*appMidiCsvImportModalComponents/,
    'app-midi-csv-import-modals-shell must mount the MIDI/CSV import modal registry without naming each async modal locally'
);
assert.match(
    appMidiCsvImportModalComponents,
    /import \{[\s\S]*AppMidiManagerModal[\s\S]*AppMidiImportModal[\s\S]*AppCsvImportModal[\s\S]*\} from '\.\/app-root-async-modals\.js';[\s\S]*export const appMidiCsvImportModalComponents\s*=\s*\{[\s\S]*\bAppMidiManagerModal\b[\s\S]*\bAppMidiImportModal\b[\s\S]*\bAppCsvImportModal\b[\s\S]*\};/,
    'app-midi-csv-import-modal-components must own the async MIDI/CSV import modal component map'
);
assert.doesNotMatch(
    appMidiCsvImportModalsShellComponent,
    /import \{[\s\S]*AppMidiManagerModal[\s\S]*AppMidiImportModal[\s\S]*AppCsvImportModal[\s\S]*\} from '\.\/app-root-async-modals\.js';/,
    'app-midi-csv-import-modals-shell should not directly import MIDI/CSV import modal components after registry extraction'
);
assert.match(
    appMidiCsvImportModalsShellComponent,
    /template:\s*`[\s\S]*<app-midi-manager-modal :ctx="ctx\.appMidiManagerModal"><\/app-midi-manager-modal>[\s\S]*<app-midi-import-modal :ctx="ctx\.appMidiImportModal"><\/app-midi-import-modal>[\s\S]*<app-csv-import-modal :ctx="ctx\.appCsvImportModal"><\/app-csv-import-modal>[\s\S]*`/,
    'app-midi-csv-import-modals-shell must render the MIDI manager, MIDI import, and CSV import modals with their existing ctx objects'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppMidiCsvImportModalsShell \} from '\.\/app-midi-csv-import-modals-shell\.js';/,
    'app-root-static-components should not expose the MIDI/CSV import modal shell once AppRootOverlaysShell owns it locally'
);
assert.match(
    appRootOverlayShellComponents,
    /appRootOverlayShellComponents\s*=\s*\{[\s\S]*\bAppMidiCsvImportModalsShell\b[\s\S]*\}/,
    'app-root-overlay-shell-components must register AppMidiCsvImportModalsShell locally'
);
for (const importShellChildComponent of [
    'AppMidiManagerModal',
    'AppMidiImportModal',
    'AppCsvImportModal',
]) {
    assert.doesNotMatch(
        appScript,
        new RegExp(`components:\\s*\\{[^}]*\\b${importShellChildComponent}\\b[^}]*\\}`),
        `app.js root components should not register ${importShellChildComponent}; AppMidiCsvImportModalsShell owns it locally`
    );
}
assert.match(
    appRootContextWiringModule,
    /const appMidiCsvImportModalsShell\s*=\s*createRootMidiCsvImportModalsShellState\(\{[\s\S]*appMidiManagerModal[\s\S]*appMidiImportModal[\s\S]*appCsvImportModal[\s\S]*\}\);/,
    'app.js must expose the MIDI/CSV import modal group through one focused shell ctx factory call'
);
assert.match(
    appRootOverlaysShellComponent,
    /<app-midi-csv-import-modals-shell\b[^>]*><\/app-midi-csv-import-modals-shell>/,
    'app-root-overlays-shell must render the MIDI/CSV import modal shell'
);
assertNoRootSetupReturnFields({
    fields: ['appMidiManagerModal', 'appMidiImportModal', 'appCsvImportModal'],
    messageForField: (field) => `app.js root setup return should expose ${field} through appMidiCsvImportModalsShell instead of the root return`,
});
for (const groupedImportTag of [
    'app-midi-manager-modal',
    'app-midi-import-modal',
    'app-csv-import-modal',
]) {
    assert.doesNotMatch(
        indexHtml,
        new RegExp(`<${groupedImportTag}\\b[^>]*><\\/${groupedImportTag}>`),
        `index.html should not render ${groupedImportTag} directly after MIDI/CSV import shell grouping`
    );
}

assert.ok(existsSync(appMidiManagerModalComponentPath), 'app-midi-manager-modal component must exist for MIDI Manager modal extraction');
assert.match(
    appMidiManagerModalComponent,
    /export const AppMidiManagerModal\s*=/,
    'app-midi-manager-modal component must export an AppMidiManagerModal component definition'
);
assert.match(
    appMidiManagerModalComponent,
    /template:\s*`[\s\S]*v-if="showMidiManager"[\s\S]*MIDI 映射管理[\s\S]*triggerMidiImportForProject[\s\S]*clearProjectMidi[\s\S]*projectMidiGroups[\s\S]*toggleMidiManagerGroup[\s\S]*updateMidiDuration[\s\S]*removeMidiMapping[\s\S]*Teleport to="body"[\s\S]*activeMidiGroupRow[\s\S]*midiGroupSearchQuery[\s\S]*filteredMidiGroups[\s\S]*updateInstrumentGroup[\s\S]*`/,
    'app-midi-manager-modal component must own the existing MIDI Manager template, including mapping rows and group dropdown teleport'
);
assert.doesNotMatch(
    appScript,
    /import \{ AppMidiManagerModal \} from '\.\/components\/app-midi-manager-modal\.js';/,
    'app.js should not statically import the low-frequency MIDI Manager modal into the initial module graph'
);
assert.match(
    appRootAsyncModals,
    /export const AppMidiManagerModal\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-midi-manager-modal\.js'\), 'AppMidiManagerModal'\);/,
    'app-root-async-modals must register the low-frequency MIDI Manager modal through createAsyncRootComponent dynamic import'
);
assert.match(
    appMidiCsvImportModalComponents,
    /appMidiCsvImportModalComponents\s*=\s*\{[\s\S]*\bAppMidiManagerModal\b[\s\S]*\}/,
    'app-midi-csv-import-modal-components must register AppMidiManagerModal locally'
);
assert.match(
    appRootContextWiringModule,
    /const appMidiManagerModal\s*=\s*createRootMidiManagerModalShellState\(\{(?=[\s\S]*showMidiManager)(?=[\s\S]*managingProject)(?=[\s\S]*projectMidiGroups)(?=[\s\S]*midiManagerExpandedGroups)(?=[\s\S]*activeMidiGroupRow)(?=[\s\S]*midiGroupPos)(?=[\s\S]*midiGroupSearchQuery)(?=[\s\S]*filteredMidiGroups)(?=[\s\S]*settings)(?=[\s\S]*triggerMidiImportForProject)(?=[\s\S]*clearProjectMidi)(?=[\s\S]*toggleMidiManagerGroup)(?=[\s\S]*openMidiGroupDropdown)(?=[\s\S]*updateMidiDuration)(?=[\s\S]*removeMidiMapping)(?=[\s\S]*updateInstrumentGroup)[\s\S]*\}\);/,
    'app.js must expose MIDI Manager modal state and actions through a focused appMidiManagerModal ctx'
);
{
    const { createMidiManagerModalShellState } = await import('../app/scripts/state/midi-manager-modal-shell-state.js');
    const { ctx } = instantiateShellState(createMidiManagerModalShellState, ['refs', 'state', 'computedState', 'actions']);
    for (const key of [
        'showMidiManager', 'managingProject', 'projectMidiGroups', 'midiManagerExpandedGroups',
        'activeMidiGroupRow', 'midiGroupPos', 'midiGroupSearchQuery', 'filteredMidiGroups', 'settings',
        'triggerMidiImportForProject', 'clearProjectMidi', 'toggleMidiManagerGroup', 'openMidiGroupDropdown',
        'updateMidiDuration', 'removeMidiMapping', 'updateInstrumentGroup',
    ]) {
        assert.ok(key in ctx, `midi-manager-modal-shell-state must own the MIDI Manager modal ctx (missing ${key})`);
    }
    for (const key of ['showMidiManager', 'activeMidiGroupRow', 'midiGroupSearchQuery']) {
        const descriptor = Object.getOwnPropertyDescriptor(ctx, key);
        assert.equal(typeof descriptor.set, 'function', `midi-manager-modal-shell-state must keep ${key} writable for v-model`);
    }
}
assert.match(
    appMidiCsvImportModalsShellComponent,
    /<app-midi-manager-modal\b[^>]*><\/app-midi-manager-modal>/,
    'app-midi-csv-import-modals-shell must render the extracted app-midi-manager-modal component'
);
assertNoRootSetupReturnFields({
    fields: [
        'showMidiManager',
        'projectMidiGroups',
        'projectMidiList',
        'midiManagerExpandedGroups',
        'triggerMidiImportForProject',
        'clearProjectMidi',
        'toggleMidiManagerGroup',
        'openMidiGroupDropdown',
        'updateMidiDuration',
        'removeMidiMapping',
        'midiGroupSearchQuery',
        'filteredMidiGroups',
        'updateInstrumentGroup',
        'activeMidiGroupRow',
        'midiGroupPos',
    ],
    messageForField: (field) => `app.js root setup return should expose MIDI Manager modal field ${field} only through appMidiManagerModal`,
});
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showMidiManager" class="modal-overlay z-\[6000\]"[\s\S]*?MIDI 映射管理[\s\S]*?activeMidiGroupRow[\s\S]*?<\/Teleport>\s*<\/div>/,
    'index.html should not retain the inline MIDI Manager modal DOM after app-midi-manager-modal extraction'
);

assert.ok(existsSync(appMidiImportModalComponentPath), 'app-midi-import-modal component must exist for MIDI Import modal extraction');
assert.match(
    appMidiImportModalComponent,
    /export const AppMidiImportModal\s*=/,
    'app-midi-import-modal component must export an AppMidiImportModal component definition'
);
assert.match(
    appMidiImportModalComponent,
    /template:\s*`[\s\S]*v-if="showMidiImportModal"[\s\S]*MIDI Import[\s\S]*midiBpm[\s\S]*midiViewMode[\s\S]*midiImportData[\s\S]*midiGroupData[\s\S]*confirmMidiImport[\s\S]*`/,
    'app-midi-import-modal component must own the existing MIDI Import shell and track/group view template'
);
assert.match(
    appMidiImportModalComponent,
    /toggleGroupSelection/,
    'app-midi-import-modal component must preserve MIDI group selection and expansion controls'
);
assert.match(
    appMidiImportModalComponent,
    /midiGroupExpanded/,
    'app-midi-import-modal component must preserve MIDI group expansion state bindings'
);
assert.match(
    appMidiImportModalComponent,
    /toggleMidiGroupExpand/,
    'app-midi-import-modal component must preserve MIDI group expansion action bindings'
);
assert.match(
    appMidiImportModalComponent,
    /Teleport to="body"[\s\S]*activeImportMenu[\s\S]*importSearchQuery[\s\S]*(?:selectImportInst[\s\S]*filteredImportOptions|filteredImportOptions[\s\S]*selectImportInst)[\s\S]*selectImportGroup/,
    'app-midi-import-modal component must preserve the import dropdown teleport and instrument/group selection actions'
);
assert.doesNotMatch(
    appScript,
    /import \{ AppMidiImportModal \} from '\.\/components\/app-midi-import-modal\.js';/,
    'app.js should not statically import the low-frequency MIDI Import modal into the initial module graph'
);
assert.match(
    appRootAsyncModals,
    /export const AppMidiImportModal\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-midi-import-modal\.js'\), 'AppMidiImportModal'\);/,
    'app-root-async-modals must register the low-frequency MIDI Import modal through createAsyncRootComponent dynamic import'
);
assert.match(
    appMidiCsvImportModalComponents,
    /appMidiCsvImportModalComponents\s*=\s*\{[\s\S]*\bAppMidiImportModal\b[\s\S]*\}/,
    'app-midi-csv-import-modal-components must register AppMidiImportModal locally'
);
assert.match(
    appRootContextWiringModule,
    /const appMidiImportModal\s*=\s*createRootMidiImportModalShellState\(\{(?=[\s\S]*showMidiImportModal)(?=[\s\S]*midiBpm)(?=[\s\S]*managingProject)(?=[\s\S]*midiViewMode)(?=[\s\S]*midiImportData)(?=[\s\S]*midiGroupData)(?=[\s\S]*midiGroupExpanded)(?=[\s\S]*activeImportMenu)(?=[\s\S]*importMenuPos)(?=[\s\S]*importSearchQuery)(?=[\s\S]*availableInstrumentGroups)(?=[\s\S]*filteredImportOptions)(?=[\s\S]*currentMidiDisplayList)(?=[\s\S]*formatSecs)(?=[\s\S]*getNameById)(?=[\s\S]*getSmartName)(?=[\s\S]*openImportMenu)(?=[\s\S]*closeImportMenu)(?=[\s\S]*toggleGroupSelection)(?=[\s\S]*toggleMidiGroupExpand)(?=[\s\S]*confirmMidiImport)(?=[\s\S]*selectImportNewInst)(?=[\s\S]*selectImportInst)(?=[\s\S]*selectImportGroup)[\s\S]*\}\);/,
    'app.js must expose MIDI Import modal state and actions through a focused appMidiImportModal ctx'
);
{
    const { createMidiImportModalShellState } = await import('../app/scripts/state/midi-import-modal-shell-state.js');
    const { ctx } = instantiateShellState(createMidiImportModalShellState, ['refs', 'state', 'computedState', 'actions', 'utils']);
    for (const key of [
        'showMidiImportModal', 'midiBpm', 'managingProject', 'midiViewMode', 'midiImportData',
        'midiGroupData', 'midiGroupExpanded', 'activeImportMenu', 'importMenuPos', 'importSearchQuery',
        'availableInstrumentGroups', 'filteredImportOptions', 'currentMidiDisplayList',
        'formatSecs', 'getNameById', 'getSmartName', 'openImportMenu', 'closeImportMenu',
        'toggleGroupSelection', 'toggleMidiGroupExpand', 'confirmMidiImport',
        'selectImportNewInst', 'selectImportInst', 'selectImportGroup',
    ]) {
        assert.ok(key in ctx, `midi-import-modal-shell-state must own the MIDI Import modal ctx (missing ${key})`);
    }
    for (const key of ['showMidiImportModal', 'midiViewMode', 'importSearchQuery']) {
        const descriptor = Object.getOwnPropertyDescriptor(ctx, key);
        assert.equal(typeof descriptor.set, 'function', `midi-import-modal-shell-state must keep ${key} writable for v-model`);
    }
}
assert.match(
    appMidiCsvImportModalsShellComponent,
    /<app-midi-import-modal\b[^>]*><\/app-midi-import-modal>/,
    'app-midi-csv-import-modals-shell must render the extracted app-midi-import-modal component'
);
assertNoRootSetupReturnFields({
    fields: [
        'showMidiImportModal',
        'midiViewMode',
        'midiImportData',
        'midiGroupData',
        'midiGroupExpanded',
        'activeImportMenu',
        'importMenuPos',
        'importSearchQuery',
        'availableInstrumentGroups',
        'filteredImportOptions',
        'currentMidiDisplayList',
        'openImportMenu',
        'closeImportMenu',
        'selectImportNewInst',
        'selectImportInst',
        'selectImportGroup',
    ],
    messageForField: (field) => `app.js root setup return should expose MIDI Import template field ${field} only through appMidiImportModal`,
});
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showMidiImportModal" class="modal-overlay z-\[99999\]"[\s\S]*?MIDI Import[\s\S]*?activeImportMenu[\s\S]*?<\/Teleport>\s*<\/div>/,
    'index.html should not retain the inline MIDI Import modal DOM after app-midi-import-modal extraction'
);

assert.ok(existsSync(appCsvImportModalComponentPath), 'app-csv-import-modal component must exist for CSV Import modal extraction');
assert.match(
    appCsvImportModalComponent,
    /export const AppCsvImportModal\s*=/,
    'app-csv-import-modal component must export an AppCsvImportModal component definition'
);
assert.match(
    appCsvImportModalComponent,
    /template:\s*`[\s\S]*v-if="showCsvImportModal"[\s\S]*Import CSV Data[\s\S]*activeImportTab[\s\S]*csvSearchQuery[\s\S]*csvImportConfig\.importTypes\.tasks[\s\S]*csvImportConfig\.nameStrategy[\s\S]*groupedCsvData[\s\S]*toggleProjectCollapse[\s\S]*isGroupSelected[\s\S]*toggleGroupSelection[\s\S]*collapsedProjects[\s\S]*confirmCsvImport[\s\S]*`/,
    'app-csv-import-modal component must own the existing CSV Import template, including tabs, filters, grouped rows, and confirm action'
);
assert.doesNotMatch(
    appScript,
    /import \{ AppCsvImportModal \} from '\.\/components\/app-csv-import-modal\.js';/,
    'app.js should not statically import the low-frequency CSV Import modal into the initial module graph'
);
assert.match(
    appRootAsyncModals,
    /export const AppCsvImportModal\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-csv-import-modal\.js'\), 'AppCsvImportModal'\);/,
    'app-root-async-modals must register the low-frequency CSV Import modal through createAsyncRootComponent dynamic import'
);
assert.match(
    appMidiCsvImportModalComponents,
    /appMidiCsvImportModalComponents\s*=\s*\{[\s\S]*\bAppCsvImportModal\b[\s\S]*\}/,
    'app-midi-csv-import-modal-components must register AppCsvImportModal locally'
);
assert.match(
    appRootContextWiringModule,
    /const appCsvImportModal\s*=\s*createRootCsvImportModalShellState\(\{(?=[\s\S]*showCsvImportModal)(?=[\s\S]*activeImportTab)(?=[\s\S]*csvSearchQuery)(?=[\s\S]*csvImportConfig)(?=[\s\S]*csvImportData)(?=[\s\S]*groupedCsvData)(?=[\s\S]*collapsedProjects)(?=[\s\S]*refreshCsvStatus)(?=[\s\S]*toggleAllRows)(?=[\s\S]*toggleProjectCollapse)(?=[\s\S]*isGroupSelected)(?=[\s\S]*toggleGroupSelection)(?=[\s\S]*confirmCsvImport)[\s\S]*\}\);/,
    'app.js must expose CSV Import modal state and actions through a focused appCsvImportModal ctx factory call'
);
assert.match(
    appMidiCsvImportModalsShellComponent,
    /<app-csv-import-modal\b[^>]*><\/app-csv-import-modal>/,
    'app-midi-csv-import-modals-shell must render the extracted app-csv-import-modal component'
);
assertNoRootSetupReturnFields({
    fields: [
        'showCsvImportModal',
        'csvImportData',
        'csvImportConfig',
        'groupedCsvData',
        'collapsedProjects',
        'refreshCsvStatus',
        'toggleAllRows',
        'toggleProjectCollapse',
        'isGroupSelected',
        'toggleGroupSelection',
        'confirmCsvImport',
        'activeImportTab',
        'csvSearchQuery',
    ],
    messageForField: (field) => `app.js root setup return should expose CSV Import template field ${field} only through appCsvImportModal`,
});
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showCsvImportModal" class="modal-overlay z-\[7000\]"[\s\S]*?Import CSV Data[\s\S]*?confirmCsvImport[\s\S]*?<\/div>\s*<\/div>/,
    'index.html should not retain the inline CSV Import modal DOM after app-csv-import-modal extraction'
);
assertNoRootSetupReturnFields({
    fields: [
        'toggleCsvSelection',
        'addDataToPrepared',
        'refreshCsvPreview',
        'calculateRowStatusText',
        'isAllSelected',
        'toggleAllProjectCollapse',
    ],
    messageForField: (field) => `app.js root setup return should keep CSV import helper ${field} internal instead of exposing it to the template surface`,
});

assert.ok(existsSync(appProjectInfoModalComponentPath), 'app-project-info-modal component must exist for Project Info modal extraction');
assert.match(
    appProjectInfoModalComponent,
    /export const AppProjectInfoModal\s*=/,
    'app-project-info-modal component must export an AppProjectInfoModal component definition'
);
assert.match(
    appProjectInfoModalComponent,
    /template:\s*`[\s\S]*v-if="showProjectInfoModal"[\s\S]*Project Metadata[\s\S]*projectInfoForm\.title[\s\S]*projectInfoForm\.composer[\s\S]*projectInfoForm\.mixingStudio[\s\S]*projectInfoForm\.dolbyStudio[\s\S]*saveProjectInfo[\s\S]*`/,
    'app-project-info-modal component must own the existing Project Metadata template, including core fields and save action'
);
assert.doesNotMatch(
    appScript,
    /import \{ AppProjectInfoModal \} from '\.\/components\/app-project-info-modal\.js';/,
    'app.js should not statically import the low-frequency Project Info modal into the initial module graph'
);
assert.match(
    appRootAsyncModals,
    /export const AppProjectInfoModal\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-project-info-modal\.js'\), 'AppProjectInfoModal'\);/,
    'app-root-async-modals must register the low-frequency Project Info modal through createAsyncRootComponent dynamic import'
);
assert.ok(existsSync(appMetadataInfoModalsShellComponentPath), 'app-metadata-info-modals-shell component must exist for Project/Recording Info modal grouping');
assert.match(
    appMetadataInfoModalsShellComponent,
    /export const AppMetadataInfoModalsShell\s*=/,
    'app-metadata-info-modals-shell component must export an AppMetadataInfoModalsShell component definition'
);
assert.match(
    appMetadataInfoModalsShellComponent,
    /import \{ appMetadataInfoModalComponents \} from '\.\/app-metadata-info-modal-components\.js';[\s\S]*components:\s*appMetadataInfoModalComponents/,
    'app-metadata-info-modals-shell must mount the Project/Recording Info modal registry without naming each async modal locally'
);
assert.match(
    appMetadataInfoModalComponents,
    /import \{[\s\S]*AppProjectInfoModal[\s\S]*AppRecInfoModal[\s\S]*\} from '\.\/app-root-async-modals\.js';[\s\S]*export const appMetadataInfoModalComponents\s*=\s*\{[\s\S]*\bAppProjectInfoModal\b[\s\S]*\bAppRecInfoModal\b[\s\S]*\};/,
    'app-metadata-info-modal-components must own the async Project/Recording Info modal component map'
);
assert.doesNotMatch(
    appMetadataInfoModalsShellComponent,
    /import \{[\s\S]*AppProjectInfoModal[\s\S]*AppRecInfoModal[\s\S]*\} from '\.\/app-root-async-modals\.js';/,
    'app-metadata-info-modals-shell should not directly import Project/Recording Info modal components after registry extraction'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppMetadataInfoModalsShell \} from '\.\/app-metadata-info-modals-shell\.js';/,
    'app-root-static-components should not expose the Project/Recording Info modal shell once AppRootOverlaysShell owns it locally'
);
assert.match(
    appRootOverlayShellComponents,
    /appRootOverlayShellComponents\s*=\s*\{[\s\S]*\bAppExportCreditModalsShell\b[\s\S]*\bAppMidiCsvImportModalsShell\b[\s\S]*\bAppMetadataInfoModalsShell\b[\s\S]*\}/,
    'app-root-overlay-shell-components must register AppMetadataInfoModalsShell locally'
);
assert.match(
    appRootContextWiringModule,
    /const appProjectInfoModal\s*=\s*createRootProjectInfoModalShellState\(\{(?=[\s\S]*showProjectInfoModal)(?=[\s\S]*projectInfoForm)(?=[\s\S]*saveProjectInfo)[\s\S]*\}\);/,
    'app.js must expose Project Info modal state and actions through a focused appProjectInfoModal ctx factory call'
);
assert.doesNotMatch(
    appScript,
    /const appProjectInfoModal\s*=\s*reactive\(\{[\s\S]*showProjectInfoModal[\s\S]*projectInfoForm[\s\S]*saveProjectInfo[\s\S]*\}\);/,
    'app.js should not own the Project Info modal reactive ctx body after extraction'
);
assert.match(
    appStateFactoriesModule,
    /import \{ createProjectInfoModalShellState \} from '\.\.\/state\/project-info-modal-shell-state\.js';[\s\S]*function createRootProjectInfoModalShellState\(options\)\s*\{[\s\S]*reactive,[\s\S]*\.\.\.options,/,
    'app-state-factories must bind Vue reactive for the Project Info modal shell ctx factory'
);
assert.match(
    appRootContextWiringModule,
    /const appRecInfoModal\s*=\s*createRootRecInfoModalShellState\(\{(?=[\s\S]*showRecInfoModal)(?=[\s\S]*sidebarTab)(?=[\s\S]*recInfoForm)(?=[\s\S]*activeRecDropdown)(?=[\s\S]*recDropdownSearch)(?=[\s\S]*filteredRecOptions)(?=[\s\S]*selectRecOption)(?=[\s\S]*createRecOption)(?=[\s\S]*saveRecInfo)[\s\S]*\}\);/,
    'app.js must expose Rec Info modal state and actions through a focused appRecInfoModal ctx factory call'
);
assert.doesNotMatch(
    appScript,
    /const appRecInfoModal\s*=\s*reactive\(\{[\s\S]*showRecInfoModal[\s\S]*sidebarTab[\s\S]*recInfoForm[\s\S]*activeRecDropdown[\s\S]*recDropdownSearch[\s\S]*filteredRecOptions[\s\S]*selectRecOption[\s\S]*createRecOption[\s\S]*saveRecInfo[\s\S]*\}\);/,
    'app.js should not own the Rec Info modal reactive ctx body after extraction'
);
assert.match(
    appStateFactoriesModule,
    /import \{ createRecInfoModalShellState \} from '\.\.\/state\/rec-info-modal-shell-state\.js';[\s\S]*function createRootRecInfoModalShellState\(options\)\s*\{[\s\S]*reactive,[\s\S]*\.\.\.options,/,
    'app-state-factories must bind Vue reactive for the Rec Info modal shell ctx factory'
);
assert.match(
    appRootContextWiringModule,
    /const appMetadataInfoModalsShell\s*=\s*createRootMetadataInfoModalsShellState\(\{[\s\S]*appProjectInfoModal[\s\S]*appRecInfoModal[\s\S]*\}\);/,
    'app.js must expose Project/Recording Info modals through one focused appMetadataInfoModalsShell ctx factory call'
);
assert.match(
    appRootOverlaysShellComponent,
    /<app-metadata-info-modals-shell\b[^>]*><\/app-metadata-info-modals-shell>/,
    'app-root-overlays-shell must render the Project/Recording Info shell'
);
for (const groupedMetadataInfoTag of [
    'app-project-info-modal',
    'app-rec-info-modal',
]) {
    assert.doesNotMatch(
        indexHtml,
        new RegExp(`<${groupedMetadataInfoTag}\\b[^>]*><\\/${groupedMetadataInfoTag}>`),
        `index.html should not render ${groupedMetadataInfoTag} directly after Project/Recording Info shell grouping`
    );
}
for (const metadataInfoShellChildComponent of [
    'AppProjectInfoModal',
    'AppRecInfoModal',
]) {
    assert.doesNotMatch(
        appScript,
        new RegExp(`components:\\s*\\{[^}]*\\b${metadataInfoShellChildComponent}\\b[^}]*\\}`),
        `app.js root components should not register ${metadataInfoShellChildComponent}; AppMetadataInfoModalsShell owns it locally`
    );
}
assert.match(
    appMetadataInfoModalsShellComponent,
    /<app-project-info-modal\b[^>]*><\/app-project-info-modal>/,
    'app-metadata-info-modals-shell must render the extracted app-project-info-modal component'
);
assert.match(
    appMetadataInfoModalsShellComponent,
    /<app-rec-info-modal\b[^>]*><\/app-rec-info-modal>/,
    'app-metadata-info-modals-shell must render the extracted app-rec-info-modal component'
);
assertNoRootSetupReturnFields({
    fields: ['showProjectInfoModal', 'projectInfoForm', 'saveProjectInfo', 'appProjectInfoModal', 'appRecInfoModal'],
    messageForField: (field) => `app.js root setup return should expose Project/Recording Info field ${field} only through appMetadataInfoModalsShell`,
});
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showProjectInfoModal" class="modal-overlay z-\[20000\]"[\s\S]*?Project Metadata[\s\S]*?saveProjectInfo[\s\S]*?<\/div>\s*<\/div>/,
    'index.html should not retain the inline Project Info modal DOM after app-project-info-modal extraction'
);

assert.ok(existsSync(appEditModalComponentPath), 'app-edit-modal component must exist for edit-event modal extraction');
assert.match(
    appEditModalComponent,
    /export const AppEditModal\s*=/,
    'app-edit-modal component must export an AppEditModal component definition'
);
assert.match(
    appEditModalComponent,
    /template:\s*`[\s\S]*v-if="showEditor"[\s\S]*Edit Event[\s\S]*showOrchestrationField[\s\S]*isPercussionMode[\s\S]*deleteEditingItem[\s\S]*saveEdit[\s\S]*`/,
    'app-edit-modal component must own the existing edit-event modal template, including orchestration, percussion, delete, and save controls'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppEditModal \} from '\.\/app-edit-modal\.js';/,
    'app-root-static-components should not keep low-frequency app-edit-modal in the synchronous root registry'
);
assert.match(
    appRootAsyncModals,
    /export const AppEditModal\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-edit-modal\.js'\), 'AppEditModal'\);/,
    'app-root-async-modals must register the low-frequency Edit modal through createAsyncRootComponent dynamic import'
);
assert.ok(existsSync(appTaskActionModalsShellComponentPath), 'app-task-action-modals-shell component must exist for Edit/Split task action modal grouping');
assert.match(
    appTaskActionModalsShellComponent,
    /export const AppTaskActionModalsShell\s*=/,
    'app-task-action-modals-shell component must export an AppTaskActionModalsShell component definition'
);
assert.match(
    appTaskActionModalsShellComponent,
    /import \{ appTaskActionModalComponents \} from '\.\/app-task-action-modal-components\.js';[\s\S]*components:\s*appTaskActionModalComponents/,
    'app-task-action-modals-shell must mount the Edit/Split task action modal registry without naming each async modal locally'
);
assert.match(
    appTaskActionModalComponents,
    /import \{[\s\S]*AppEditModal[\s\S]*AppSplitModal[\s\S]*\} from '\.\/app-root-async-modals\.js';[\s\S]*export const appTaskActionModalComponents\s*=\s*\{[\s\S]*\bAppEditModal\b[\s\S]*\bAppSplitModal\b[\s\S]*\};/,
    'app-task-action-modal-components must own the async Edit/Split task action modal component map'
);
assert.doesNotMatch(
    appTaskActionModalsShellComponent,
    /import \{[\s\S]*AppEditModal[\s\S]*AppSplitModal[\s\S]*\} from '\.\/app-root-async-modals\.js';/,
    'app-task-action-modals-shell should not directly import Edit/Split task action modal components after registry extraction'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppTaskActionModalsShell \} from '\.\/app-task-action-modals-shell\.js';/,
    'app-root-static-components should not expose the task action modal shell once AppRootOverlaysShell owns it locally'
);
assert.match(
    appRootOverlayShellComponents,
    /appRootOverlayShellComponents\s*=\s*\{[\s\S]*\bAppTaskActionModalsShell\b[\s\S]*\}/,
    'app-root-overlay-shell-components must register AppTaskActionModalsShell locally'
);
assert.match(
    appRootContextWiringModule,
    /const appEditModal\s*=\s*createRootEditModalShellState\(\{(?=[\s\S]*showEditor)(?=[\s\S]*editingItem)(?=[\s\S]*editingSource)(?=[\s\S]*activeDropdown)(?=[\s\S]*dropdownSearch)(?=[\s\S]*dropdownExpandedGroups)(?=[\s\S]*filteredOptions)(?=[\s\S]*isMobile)(?=[\s\S]*showOrchestrationField)(?=[\s\S]*parsedRoster)(?=[\s\S]*activeOrchPresets)(?=[\s\S]*isPercussionMode)(?=[\s\S]*percState)(?=[\s\S]*timeSlots)(?=[\s\S]*deleteEditingItem)(?=[\s\S]*saveEdit)[\s\S]*\}\);/,
    'app.js must expose edit modal state and actions through a focused appEditModal ctx factory call'
);
assert.match(
    appStateFactoriesModule,
    /import \{ createTaskActionModalsShellState \} from '\.\.\/state\/task-action-modals-shell-state\.js';[\s\S]*function createRootTaskActionModalsShellState\(options\)\s*\{[\s\S]*reactive,[\s\S]*\.\.\.options,/,
    'app state factories should bind Vue reactive for the task action modal group shell ctx factory'
);
assert.match(
    appRootContextWiringModule,
    /const appTaskActionModalsShell\s*=\s*createRootTaskActionModalsShellState\(\{[\s\S]*appEditModal[\s\S]*appSplitModal[\s\S]*\}\);/,
    'app.js must expose Edit/Split task action modals through one focused shell ctx factory call'
);
assert.doesNotMatch(
    appScript,
    /const appTaskActionModalsShell\s*=\s*reactive\(\{[\s\S]*appEditModal[\s\S]*appSplitModal[\s\S]*\}\);/,
    'app.js should not own the task action modal group reactive ctx object after shell ctx extraction'
);
assertNoRootSetupReturnFields({
    fields: [
        'showEditor',
        'editingItem',
        'editingSource',
        'saveEdit',
        'deleteEditingItem',
        'showOrchestrationField',
        'appEditModal',
        'appSplitModal',
    ],
    messageForField: (field) => `app.js root setup return should expose task action modal field ${field} only through appTaskActionModalsShell`,
});
assert.match(
    appTaskActionModalsShellComponent,
    /<app-edit-modal\b[^>]*><\/app-edit-modal>/,
    'app-task-action-modals-shell must render the extracted app-edit-modal component'
);
assert.match(
    appRootOverlaysShellComponent,
    /<app-task-action-modals-shell\b[^>]*><\/app-task-action-modals-shell>/,
    'app-root-overlays-shell must render the task action modal shell'
);
for (const groupedTaskActionTag of [
    'app-edit-modal',
    'app-split-modal',
]) {
    assert.doesNotMatch(
        indexHtml,
        new RegExp(`<${groupedTaskActionTag}\\b[^>]*><\\/${groupedTaskActionTag}>`),
        `index.html should not render ${groupedTaskActionTag} directly after task action modal shell grouping`
    );
}
for (const taskActionShellChildComponent of [
    'AppEditModal',
    'AppSplitModal',
]) {
    assert.doesNotMatch(
        appScript,
        new RegExp(`components:\\s*\\{[^}]*\\b${taskActionShellChildComponent}\\b[^}]*\\}`),
        `app.js root components should not register ${taskActionShellChildComponent}; AppTaskActionModalsShell owns it locally`
    );
}
assert.match(
    appTaskActionModalsShellComponent,
    /<app-split-modal\b[^>]*><\/app-split-modal>/,
    'app-task-action-modals-shell must render the extracted app-split-modal component'
);
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showEditor" class="modal-overlay"[\s\S]*?Edit Event[\s\S]*?deleteEditingItem[\s\S]*?saveEdit[\s\S]*?<\/div>\s*<\/div>/,
    'index.html should not retain the inline edit-event modal DOM after app-edit-modal extraction'
);

assert.ok(existsSync(appAuthModalComponentPath), 'app-auth-modal component must exist for auth modal extraction');
assert.match(
    appAuthModalComponent,
    /export const AppAuthModal\s*=/,
    'app-auth-modal component must export an AppAuthModal component definition'
);
assert.match(
    appAuthModalComponent,
    /template:\s*`[\s\S]*v-if="showAuthModal"[\s\S]*云端同步[\s\S]*authForm\.email[\s\S]*authForm\.password[\s\S]*handleLogin[\s\S]*handleRegister[\s\S]*handleResetPwd[\s\S]*`/,
    'app-auth-modal component must own the existing auth modal template, including login, register, and password reset controls'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppAuthModal \} from '\.\/app-auth-modal\.js';/,
    'app-root-static-components should not keep low-frequency app-auth-modal in the synchronous root registry'
);
assert.match(
    appRootAsyncModals,
    /export const AppAuthModal\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-auth-modal\.js'\), 'AppAuthModal'\);/,
    'app-root-async-modals must register the low-frequency Auth modal through createAsyncRootComponent dynamic import'
);
assert.ok(existsSync(appAccountModalsShellComponentPath), 'app-account-modals-shell component must exist for Auth/Crop account modal grouping');
assert.match(
    appAccountModalsShellComponent,
    /export const AppAccountModalsShell\s*=/,
    'app-account-modals-shell component must export an AppAccountModalsShell component definition'
);
assert.match(
    appAccountModalsShellComponent,
    /import \{ appAccountModalComponents \} from '\.\/app-account-modal-components\.js';[\s\S]*components:\s*appAccountModalComponents/,
    'app-account-modals-shell must mount the Auth/Crop account modal registry without naming each async modal locally'
);
assert.match(
    appAccountModalComponents,
    /import \{[\s\S]*AppAuthModal[\s\S]*AppCropModal[\s\S]*\} from '\.\/app-root-async-modals\.js';[\s\S]*export const appAccountModalComponents\s*=\s*\{[\s\S]*\bAppAuthModal\b[\s\S]*\bAppCropModal\b[\s\S]*\};/,
    'app-account-modal-components must own the async Auth/Crop account modal component map'
);
assert.doesNotMatch(
    appAccountModalsShellComponent,
    /import \{[\s\S]*AppAuthModal[\s\S]*AppCropModal[\s\S]*\} from '\.\/app-root-async-modals\.js';/,
    'app-account-modals-shell should not directly import Auth/Crop account modal components after registry extraction'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppAccountModalsShell \} from '\.\/app-account-modals-shell\.js';/,
    'app-root-static-components should not expose the account modal shell once AppRootOverlaysShell owns it locally'
);
assert.match(
    appRootOverlayShellComponents,
    /appRootOverlayShellComponents\s*=\s*\{[\s\S]*\bAppAccountModalsShell\b[\s\S]*\}/,
    'app-root-overlay-shell-components must register AppAccountModalsShell locally'
);
assert.match(
    appRootContextWiringModule,
    /const appAuthModal\s*=\s*createRootAuthModalShellState\(\{(?=[\s\S]*showAuthModal)(?=[\s\S]*authForm)(?=[\s\S]*authLoading)(?=[\s\S]*authPasswordRef)(?=[\s\S]*handleLogin)(?=[\s\S]*handleRegister)(?=[\s\S]*handleResetPwd)[\s\S]*\}\);/,
    'app.js must expose auth modal state and actions through a focused appAuthModal ctx factory call'
);
assert.doesNotMatch(
    appScript,
    /const appAuthModal\s*=\s*reactive\(\{[\s\S]*showAuthModal[\s\S]*authForm[\s\S]*authLoading[\s\S]*authPasswordRef[\s\S]*handleLogin[\s\S]*handleRegister[\s\S]*handleResetPwd[\s\S]*\}\);/,
    'app.js should not own the auth modal reactive ctx body after extraction'
);
assert.match(
    appStateFactoriesModule,
    /import \{ createAuthModalShellState \} from '\.\.\/state\/auth-modal-shell-state\.js';[\s\S]*function createRootAuthModalShellState\(options\)\s*\{[\s\S]*reactive,[\s\S]*\.\.\.options,/,
    'app-state-factories must bind Vue reactive for the auth modal shell ctx factory'
);
assert.match(
    appStateFactoriesModule,
    /import \{ createAccountModalsShellState \} from '\.\.\/state\/account-modals-shell-state\.js';[\s\S]*function createRootAccountModalsShellState\(options\)\s*\{[\s\S]*reactive,[\s\S]*\.\.\.options,/,
    'app state factories should bind Vue reactive for the account modal group shell ctx factory'
);
assert.match(
    appRootContextWiringModule,
    /const appAccountModalsShell\s*=\s*createRootAccountModalsShellState\(\{[\s\S]*appAuthModal[\s\S]*appCropModal[\s\S]*\}\);/,
    'app.js must expose Auth/Crop modals through one focused appAccountModalsShell ctx factory call'
);
assert.doesNotMatch(
    appScript,
    /const appAccountModalsShell\s*=\s*reactive\(\{[\s\S]*appAuthModal[\s\S]*appCropModal[\s\S]*\}\);/,
    'app.js should not own the account modal group reactive ctx object after shell ctx extraction'
);
for (const leakedRootReturnField of [
    'showAuthModal',
    'authForm',
    'authLoading',
    'authPasswordRef',
    'handleLogin',
    'handleRegister',
    'handleResetPwd',
]) {
    assert.doesNotMatch(
        rootSetupReturnObject,
        new RegExp(`\\b${leakedRootReturnField}\\b`),
        `app.js root setup return should expose auth modal template field ${leakedRootReturnField} only through appAuthModal`
    );
}
assert.match(
    appAccountModalsShellComponent,
    /<app-auth-modal\b[^>]*><\/app-auth-modal>/,
    'app-account-modals-shell must render the extracted app-auth-modal component'
);
assert.match(
    appRootOverlaysShellComponent,
    /<app-account-modals-shell\b[^>]*><\/app-account-modals-shell>/,
    'app-root-overlays-shell must render the account modal shell'
);
for (const groupedAccountTag of [
    'app-auth-modal',
    'app-crop-modal',
]) {
    assert.doesNotMatch(
        indexHtml,
        new RegExp(`<${groupedAccountTag}\\b[^>]*><\\/${groupedAccountTag}>`),
        `index.html should not render ${groupedAccountTag} directly after account modal shell grouping`
    );
}
for (const accountShellChildComponent of [
    'AppAuthModal',
    'AppCropModal',
]) {
    assert.doesNotMatch(
        appScript,
        new RegExp(`components:\\s*\\{[^}]*\\b${accountShellChildComponent}\\b[^}]*\\}`),
        `app.js root components should not register ${accountShellChildComponent}; AppAccountModalsShell owns it locally`
    );
}
assert.match(
    appAccountModalsShellComponent,
    /<app-crop-modal\b[^>]*><\/app-crop-modal>/,
    'app-account-modals-shell must render the extracted app-crop-modal component'
);
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showAuthModal" class="modal-overlay"[\s\S]*?云端同步[\s\S]*?handleResetPwd[\s\S]*?<\/div>\s*<\/div>/,
    'index.html should not retain the inline auth modal DOM after app-auth-modal extraction'
);

assert.ok(existsSync(appCropModalComponentPath), 'app-crop-modal component must exist for avatar crop modal extraction');
assert.match(
    appCropModalComponent,
    /export const AppCropModal\s*=/,
    'app-crop-modal component must export an AppCropModal component definition'
);
assert.match(
    appCropModalComponent,
    /template:\s*`[\s\S]*v-if="showCropModal"[\s\S]*调整头像[\s\S]*cropImgRef[\s\S]*cropImgSrc[\s\S]*cancelCrop[\s\S]*confirmCrop[\s\S]*authLoading[\s\S]*`/,
    'app-crop-modal component must own the existing avatar crop template, including image ref, cancel, loading, and upload controls'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppCropModal \} from '\.\/app-crop-modal\.js';/,
    'app-root-static-components should not keep low-frequency app-crop-modal in the synchronous root registry'
);
assert.match(
    appRootAsyncModals,
    /export const AppCropModal\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-crop-modal\.js'\), 'AppCropModal'\);/,
    'app-root-async-modals must register the low-frequency Crop modal through createAsyncRootComponent dynamic import'
);
assert.match(
    appRootContextWiringModule,
    /const appCropModal\s*=\s*createRootCropModalShellState\(\{(?=[\s\S]*showCropModal)(?=[\s\S]*cropImgSrc)(?=[\s\S]*cropImgRef)(?=[\s\S]*authLoading)(?=[\s\S]*cancelCrop)(?=[\s\S]*confirmCrop)[\s\S]*\}\);/,
    'app.js must expose avatar crop modal state and actions through a focused appCropModal ctx factory call'
);
assert.doesNotMatch(
    appScript,
    /const appCropModal\s*=\s*reactive\(\{[\s\S]*showCropModal[\s\S]*cropImgSrc[\s\S]*cropImgRef[\s\S]*authLoading[\s\S]*cancelCrop[\s\S]*confirmCrop[\s\S]*\}\);/,
    'app.js should not own the avatar crop modal reactive ctx body after extraction'
);
assert.match(
    appStateFactoriesModule,
    /import \{ createCropModalShellState \} from '\.\.\/state\/crop-modal-shell-state\.js';[\s\S]*function createRootCropModalShellState\(options\)\s*\{[\s\S]*reactive,[\s\S]*\.\.\.options,/,
    'app-state-factories must bind Vue reactive for the avatar crop modal shell ctx factory'
);
for (const leakedRootReturnField of [
    'showCropModal',
    'cropImgSrc',
    'cropImgRef',
    'cancelCrop',
    'confirmCrop',
    'appAuthModal',
    'appCropModal',
]) {
    assert.doesNotMatch(
        rootSetupReturnObject,
        new RegExp(`\\b${leakedRootReturnField}\\b`),
        `app.js root setup return should expose account modal field ${leakedRootReturnField} only through appAccountModalsShell`
    );
}
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showCropModal" class="modal-overlay z-\[1000\]"[\s\S]*?调整头像[\s\S]*?confirmCrop[\s\S]*?<\/div>\s*<\/div>/,
    'index.html should not retain the inline avatar crop modal DOM after app-crop-modal extraction'
);

assert.ok(existsSync(appTrackListModalComponentPath), 'app-track-list-modal component must exist for Track List modal extraction');
assert.match(
    appTrackListModalComponent,
    /export const AppTrackListModal\s*=/,
    'app-track-list-modal component must export an AppTrackListModal component definition'
);
assert.match(
    appTrackListModalComponent,
    /template:\s*`[\s\S]*v-if="showTrackList"[\s\S]*trackListData\.name[\s\S]*trackListSearchQuery[\s\S]*trackListData\.items[\s\S]*startDividerDrag[\s\S]*startTrackDrag[\s\S]*deleteTrackFromList[\s\S]*openSplitSlider[\s\S]*setTrackNow[\s\S]*clearTrackTime[\s\S]*deleteCurrentSchedule[\s\S]*`/,
    'app-track-list-modal component must own the Track List template, including search, track cards, timing controls, and deletion'
);
assert.match(
    appTrackListModalComponent,
    /<TransitionGroup\b[\s\S]*<\/TransitionGroup>/,
    'app-track-list-modal component must use a consistently cased TransitionGroup tag so Vue can compile the component template'
);
assert.doesNotMatch(
    appScript,
    /import \{ AppTrackListModal \} from '\.\/components\/app-track-list-modal\.js';/,
    'app.js should not statically import the low-frequency Track List modal into the initial module graph'
);
assert.match(
    appRootAsyncModals,
    /export const AppTrackListModal\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-track-list-modal\.js'\), 'AppTrackListModal'\);/,
    'app-root-async-modals must register the low-frequency Track List modal through createAsyncRootComponent dynamic import'
);
assert.match(
    appRootContextWiringModule,
    /const appTrackListModal\s*=\s*createRootTrackListModalShellState\(\{(?=[\s\S]*showTrackList)(?=[\s\S]*trackListData)(?=[\s\S]*trackListSearchQuery)(?=[\s\S]*trackListContainerRef)(?=[\s\S]*draggingSectionIndex)(?=[\s\S]*sidebarTab)(?=[\s\S]*openRecInfoModal)(?=[\s\S]*deleteTrackFromList)(?=[\s\S]*openSplitSlider)(?=[\s\S]*deleteCurrentSchedule)[\s\S]*\}\);/,
    'app.js must expose Track List modal state and actions through a focused appTrackListModal ctx factory call'
);
for (const leakedRootReturnField of [
    'showTrackList',
    'trackListData',
    'trackListSearchQuery',
    'trackListContainerRef',
    'draggingSectionIndex',
    'startDividerDrag',
    'startTrackDrag',
    'deleteTrackFromList',
    'openSplitSlider',
    'setTrackNow',
    'clearTrackTime',
    'onTrackListReminderChange',
]) {
    assert.doesNotMatch(
        rootSetupReturnObject,
        new RegExp(`\\b${leakedRootReturnField}\\b`),
        `app.js root setup return should expose Track List template field ${leakedRootReturnField} only through appTrackListModal`
    );
}
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showTrackList" class="modal-overlay"[\s\S]*?trackListData\.name[\s\S]*?deleteCurrentSchedule[\s\S]*?<\/div>\s*<\/div>/,
    'index.html should not retain the inline Track List modal DOM after app-track-list-modal extraction'
);

assert.ok(existsSync(appStandaloneOverlaysShellComponentPath), 'app-standalone-overlays-shell component must exist for Settings/Track List/Mobile Task Input grouping');
assert.match(
    appStandaloneOverlaysShellComponent,
    /export const AppStandaloneOverlaysShell\s*=/,
    'app-standalone-overlays-shell component must export an AppStandaloneOverlaysShell component definition'
);
assert.match(
    appStandaloneOverlaysShellComponent,
    /import \{ appStandaloneOverlayComponents \} from '\.\/app-standalone-overlay-components\.js';[\s\S]*components:\s*appStandaloneOverlayComponents/,
    'app-standalone-overlays-shell must mount the standalone overlay registry without naming each async modal locally'
);
assert.match(
    appStandaloneOverlayComponents,
    /import \{[\s\S]*AppSettingsModal[\s\S]*AppTrackListModal[\s\S]*AppMobileTaskInput[\s\S]*\} from '\.\/app-root-async-modals\.js';[\s\S]*export const appStandaloneOverlayComponents\s*=\s*\{[\s\S]*\bAppSettingsModal\b[\s\S]*\bAppTrackListModal\b[\s\S]*\bAppMobileTaskInput\b[\s\S]*\};/,
    'app-standalone-overlay-components must own the async Settings/Track List/Mobile Task Input component map'
);
assert.doesNotMatch(
    appStandaloneOverlaysShellComponent,
    /import \{[\s\S]*AppSettingsModal[\s\S]*AppTrackListModal[\s\S]*AppMobileTaskInput[\s\S]*\} from '\.\/app-root-async-modals\.js';/,
    'app-standalone-overlays-shell should not directly import standalone overlay modal components after registry extraction'
);
assert.match(
    appStandaloneOverlaysShellComponent,
    /<app-settings-modal :ctx="ctx\.appSettingsModal"><\/app-settings-modal>[\s\S]*<app-track-list-modal :ctx="ctx\.appTrackListModal"><\/app-track-list-modal>[\s\S]*<app-mobile-task-input :ctx="ctx\.appMobileTaskInput"><\/app-mobile-task-input>/,
    'app-standalone-overlays-shell must render standalone overlays with their focused ctx objects'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppStandaloneOverlaysShell \} from '\.\/app-standalone-overlays-shell\.js';/,
    'app-root-static-components should not expose the standalone overlays shell once AppRootOverlaysShell owns it locally'
);
assert.match(
    appRootOverlayShellComponents,
    /appRootOverlayShellComponents\s*=\s*\{[\s\S]*\bAppStandaloneOverlaysShell\b[\s\S]*\}/,
    'app-root-overlay-shell-components must register AppStandaloneOverlaysShell locally'
);
assert.match(
    appRootContextWiringModule,
    /const appStandaloneOverlaysShell\s*=\s*createRootStandaloneOverlaysShellState\(\{[\s\S]*appSettingsModal[\s\S]*appTrackListModal[\s\S]*appMobileTaskInput[\s\S]*\}\);/,
    'app.js must expose Settings/Track List/Mobile Task Input through one focused appStandaloneOverlaysShell ctx factory call'
);
assert.match(
    appRootOverlaysShellComponent,
    /<app-standalone-overlays-shell\b[^>]*:ctx="ctx\.appStandaloneOverlaysShell"[^>]*><\/app-standalone-overlays-shell>/,
    'app-root-overlays-shell must render the standalone overlays shell'
);
for (const leakedRootReturnField of [
    'appSettingsModal',
    'appTrackListModal',
    'appMobileTaskInput',
]) {
    assert.doesNotMatch(
        rootSetupReturnObject,
        new RegExp(`\\b${leakedRootReturnField}\\b`),
        `app.js root setup return should expose standalone overlay field ${leakedRootReturnField} only through appStandaloneOverlaysShell`
    );
}
for (const standaloneShellChildComponent of [
    'AppSettingsModal',
    'AppTrackListModal',
    'AppMobileTaskInput',
]) {
    assert.doesNotMatch(
        rootComponentsObject,
        new RegExp(`\\b${standaloneShellChildComponent}\\b`),
        `app.js root components should not register ${standaloneShellChildComponent}; AppStandaloneOverlaysShell owns it locally`
    );
}

assert.ok(existsSync(appQuickAddModalComponentPath), 'app-quick-add-modal component must exist for Quick Add modal extraction');
assert.match(
    appQuickAddModalComponent,
    /export const AppQuickAddModal\s*=/,
    'app-quick-add-modal component must export an AppQuickAddModal component definition'
);
assert.match(
    appQuickAddModalComponent,
    /template:\s*`[\s\S]*v-if="showQuickAddModal"[\s\S]*quickAddType[\s\S]*quickAddForm\.name[\s\S]*quickAddForm\.group[\s\S]*showGroupSuggestions[\s\S]*currentQuickAddGroups[\s\S]*quickAddForm\.defaultRatio[\s\S]*confirmQuickAdd[\s\S]*`/,
    'app-quick-add-modal component must own the existing Quick Add modal template, including name, group suggestions, musician ratio, cancel, and save controls'
);
assert.doesNotMatch(
    appScript,
    /import \{ AppQuickAddModal \} from '\.\/components\/app-quick-add-modal\.js';/,
    'app.js should not statically import the low-frequency Quick Add modal into the initial module graph'
);
assert.match(
    appRootAsyncModals,
    /export const AppQuickAddModal\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-quick-add-modal\.js'\), 'AppQuickAddModal'\);/,
    'app-root-async-modals must register the low-frequency Quick Add modal through createAsyncRootComponent dynamic import'
);
assert.ok(existsSync(appUtilityModalsShellComponentPath), 'app-utility-modals-shell component must exist for Quick Add/JSON restore modal grouping');
assert.match(
    appUtilityModalsShellComponent,
    /export const AppUtilityModalsShell\s*=/,
    'app-utility-modals-shell component must export an AppUtilityModalsShell component definition'
);
assert.match(
    appUtilityModalsShellComponent,
    /import \{ appUtilityModalComponents \} from '\.\/app-utility-modal-components\.js';[\s\S]*components:\s*appUtilityModalComponents/,
    'app-utility-modals-shell must mount the Quick Add/JSON restore utility modal registry without naming each async modal locally'
);
assert.match(
    appUtilityModalComponents,
    /import \{[\s\S]*AppQuickAddModal[\s\S]*AppImportModal[\s\S]*\} from '\.\/app-root-async-modals\.js';[\s\S]*export const appUtilityModalComponents\s*=\s*\{[\s\S]*\bAppQuickAddModal\b[\s\S]*\bAppImportModal\b[\s\S]*\};/,
    'app-utility-modal-components must own the async Quick Add/JSON restore utility modal component map'
);
assert.doesNotMatch(
    appUtilityModalsShellComponent,
    /import \{[\s\S]*AppQuickAddModal[\s\S]*AppImportModal[\s\S]*\} from '\.\/app-root-async-modals\.js';/,
    'app-utility-modals-shell should not directly import Quick Add/JSON restore utility modal components after registry extraction'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppUtilityModalsShell \} from '\.\/app-utility-modals-shell\.js';/,
    'app-root-static-components should not expose the utility modal shell once AppRootOverlaysShell owns it locally'
);
assert.match(
    appRootOverlayShellComponents,
    /appRootOverlayShellComponents\s*=\s*\{[\s\S]*\bAppUtilityModalsShell\b[\s\S]*\}/,
    'app-root-overlay-shell-components must register AppUtilityModalsShell locally'
);
assert.match(
    appRootContextWiringModule,
    /const appQuickAddModal\s*=\s*createRootQuickAddModalShellState\(\{(?=[\s\S]*showQuickAddModal)(?=[\s\S]*quickAddType)(?=[\s\S]*quickAddForm)(?=[\s\S]*showGroupSuggestions)(?=[\s\S]*currentQuickAddGroups)(?=[\s\S]*confirmQuickAdd)[\s\S]*\}\);/,
    'app.js must expose Quick Add modal state and actions through a focused appQuickAddModal ctx factory call'
);
assert.doesNotMatch(
    appScript,
    /const appQuickAddModal\s*=\s*reactive\(\{[\s\S]*showQuickAddModal[\s\S]*quickAddType[\s\S]*quickAddForm[\s\S]*showGroupSuggestions[\s\S]*currentQuickAddGroups[\s\S]*confirmQuickAdd[\s\S]*\}\);/,
    'app.js should not own the Quick Add modal reactive ctx body after extraction'
);
assert.match(
    appStateFactoriesModule,
    /import \{ createQuickAddModalShellState \} from '\.\.\/state\/quick-add-modal-shell-state\.js';[\s\S]*function createRootQuickAddModalShellState\(options\)\s*\{[\s\S]*reactive,[\s\S]*\.\.\.options,/,
    'app-state-factories must bind Vue reactive for the Quick Add modal shell ctx factory'
);
assert.match(
    appUtilityModalsShellComponent,
    /<app-quick-add-modal\b[^>]*><\/app-quick-add-modal>/,
    'app-utility-modals-shell must render the extracted app-quick-add-modal component'
);
assert.match(
    appStateFactoriesModule,
    /import \{ createUtilityModalsShellState \} from '\.\.\/state\/utility-modals-shell-state\.js';[\s\S]*function createRootUtilityModalsShellState\(options\)\s*\{[\s\S]*reactive,[\s\S]*\.\.\.options,/,
    'app state factories should bind Vue reactive for the utility modal group shell ctx factory'
);
assert.match(
    appRootContextWiringModule,
    /const appUtilityModalsShell\s*=\s*createRootUtilityModalsShellState\(\{[\s\S]*appQuickAddModal[\s\S]*appImportModal[\s\S]*\}\);/,
    'app.js must expose Quick Add/JSON restore modals through one focused appUtilityModalsShell ctx factory call'
);
assert.doesNotMatch(
    appScript,
    /const appUtilityModalsShell\s*=\s*reactive\(\{[\s\S]*appQuickAddModal[\s\S]*appImportModal[\s\S]*\}\);/,
    'app.js should not own the utility modal group reactive ctx object after shell ctx extraction'
);
assert.match(
    appRootOverlaysShellComponent,
    /<app-utility-modals-shell\b[^>]*><\/app-utility-modals-shell>/,
    'app-root-overlays-shell must render the utility modal shell'
);
for (const groupedUtilityTag of [
    'app-quick-add-modal',
    'app-import-modal',
]) {
    assert.doesNotMatch(
        indexHtml,
        new RegExp(`<${groupedUtilityTag}\\b[^>]*><\\/${groupedUtilityTag}>`),
        `index.html should not render ${groupedUtilityTag} directly after utility modal shell grouping`
    );
}
for (const utilityShellChildComponent of [
    'AppQuickAddModal',
    'AppImportModal',
]) {
    assert.doesNotMatch(
        appScript,
        new RegExp(`components:\\s*\\{[^}]*\\b${utilityShellChildComponent}\\b[^}]*\\}`),
        `app.js root components should not register ${utilityShellChildComponent}; AppUtilityModalsShell owns it locally`
    );
}
assert.match(
    appUtilityModalsShellComponent,
    /<app-import-modal\b[^>]*><\/app-import-modal>/,
    'app-utility-modals-shell must render the extracted app-import-modal component'
);
for (const leakedRootReturnField of [
    'showQuickAddModal',
    'quickAddType',
    'quickAddForm',
    'showGroupSuggestions',
    'currentQuickAddGroups',
    'confirmQuickAdd',
    'appQuickAddModal',
    'appImportModal',
]) {
    assert.doesNotMatch(
        rootSetupReturnObject,
        new RegExp(`\\b${leakedRootReturnField}\\b`),
        `app.js root setup return should expose utility modal field ${leakedRootReturnField} only through appUtilityModalsShell`
    );
}
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showQuickAddModal" class="modal-overlay z-\[2000\]"[\s\S]*?quickAddForm\.name[\s\S]*?confirmQuickAdd[\s\S]*?<\/div>\s*<\/div>/,
    'index.html should not retain the inline Quick Add modal DOM after app-quick-add-modal extraction'
);

assert.ok(existsSync(appImportModalComponentPath), 'app-import-modal component must exist for JSON restore modal extraction');
assert.match(
    appImportModalComponent,
    /export const AppImportModal\s*=/,
    'app-import-modal component must export an AppImportModal component definition'
);
assert.match(
    appImportModalComponent,
    /template:\s*`[\s\S]*v-if="showImportModal"[\s\S]*恢复数据[\s\S]*triggerFileSelect[\s\S]*Support: \.JSON[\s\S]*showImportModal=false[\s\S]*`/,
    'app-import-modal component must own the existing JSON restore modal template, including upload trigger and cancel controls'
);
assert.doesNotMatch(
    appScript,
    /import \{ AppImportModal \} from '\.\/components\/app-import-modal\.js';/,
    'app.js should not statically import the low-frequency JSON restore modal into the initial module graph'
);
assert.match(
    appRootAsyncModals,
    /export const AppImportModal\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-import-modal\.js'\), 'AppImportModal'\);/,
    'app-root-async-modals must register the low-frequency JSON restore modal through createAsyncRootComponent dynamic import'
);
assert.match(
    appRootContextWiringModule,
    /const appImportModal\s*=\s*createRootImportModalShellState\(\{(?=[\s\S]*showImportModal)(?=[\s\S]*triggerFileSelect)[\s\S]*\}\);/,
    'app.js must expose JSON restore modal state and actions through a focused appImportModal ctx factory call'
);
assert.doesNotMatch(
    appScript,
    /const appImportModal\s*=\s*reactive\(\{[\s\S]*showImportModal[\s\S]*triggerFileSelect[\s\S]*\}\);/,
    'app.js should not own the JSON restore modal reactive ctx body after extraction'
);
assert.match(
    appStateFactoriesModule,
    /import \{ createImportModalShellState \} from '\.\.\/state\/import-modal-shell-state\.js';[\s\S]*function createRootImportModalShellState\(options\)\s*\{[\s\S]*reactive,[\s\S]*\.\.\.options,/,
    'app-state-factories must bind Vue reactive for the JSON restore modal shell ctx factory'
);
for (const leakedRootReturnField of [
    'showImportModal',
    'triggerFileSelect',
]) {
    assert.doesNotMatch(
        rootSetupReturnObject,
        new RegExp(`\\b${leakedRootReturnField}\\b`),
        `app.js root setup return should expose JSON restore modal template field ${leakedRootReturnField} only through appImportModal`
    );
}
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showImportModal" class="modal-overlay z-\[4000\]"[\s\S]*?恢复数据[\s\S]*?triggerFileSelect[\s\S]*?<\/div>\s*<\/div>/,
    'index.html should not retain the inline JSON restore modal DOM after app-import-modal extraction'
);

assert.ok(existsSync(appRecInfoModalComponentPath), 'app-rec-info-modal component must exist for Recording/Editing Info modal extraction');
assert.match(
    appRecInfoModalComponent,
    /export const AppRecInfoModal\s*=/,
    'app-rec-info-modal component must export an AppRecInfoModal component definition'
);
assert.match(
    appRecInfoModalComponent,
    /template:\s*`[\s\S]*v-if="showRecInfoModal"[\s\S]*sidebarTab === 'musician'[\s\S]*recInfoForm\.studio[\s\S]*activeRecDropdown === 'studio'[\s\S]*filteredRecOptions[\s\S]*selectRecOption[\s\S]*createRecOption[\s\S]*recInfoForm\.engineer[\s\S]*recInfoForm\.operator[\s\S]*recInfoForm\.assistant[\s\S]*recInfoForm\.notes[\s\S]*saveRecInfo[\s\S]*`/,
    'app-rec-info-modal component must own the existing Recording/Editing Info modal template, including dropdown fields, notes, and save controls'
);
assert.doesNotMatch(
    appScript,
    /import \{ AppRecInfoModal \} from '\.\/components\/app-rec-info-modal\.js';/,
    'app.js should not statically import the low-frequency Recording/Editing Info modal into the initial module graph'
);
assert.match(
    appRootAsyncModals,
    /export const AppRecInfoModal\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-rec-info-modal\.js'\), 'AppRecInfoModal'\);/,
    'app-root-async-modals must register the low-frequency Recording/Editing Info modal through createAsyncRootComponent dynamic import'
);
assert.match(
    appRootContextWiringModule,
    /const appRecInfoModal\s*=\s*createRootRecInfoModalShellState\(\{(?=[\s\S]*showRecInfoModal)(?=[\s\S]*sidebarTab)(?=[\s\S]*recInfoForm)(?=[\s\S]*activeRecDropdown)(?=[\s\S]*recDropdownSearch)(?=[\s\S]*filteredRecOptions)(?=[\s\S]*selectRecOption)(?=[\s\S]*createRecOption)(?=[\s\S]*saveRecInfo)[\s\S]*\}\);/,
    'app.js must expose Recording/Editing Info state and actions through a focused appRecInfoModal ctx factory call'
);
assert.doesNotMatch(
    appScript,
    /const appRecInfoModal\s*=\s*reactive\(\{[\s\S]*showRecInfoModal[\s\S]*sidebarTab[\s\S]*recInfoForm[\s\S]*activeRecDropdown[\s\S]*recDropdownSearch[\s\S]*filteredRecOptions[\s\S]*selectRecOption[\s\S]*createRecOption[\s\S]*saveRecInfo[\s\S]*\}\);/,
    'app.js should not own the Recording/Editing Info modal reactive ctx body after extraction'
);
for (const leakedRootReturnField of [
    'showRecInfoModal',
    'recInfoForm',
    'saveRecInfo',
    'activeRecDropdown',
    'recDropdownSearch',
    'filteredRecOptions',
    'selectRecOption',
    'createRecOption',
]) {
    assert.doesNotMatch(
        rootSetupReturnObject,
        new RegExp(`\\b${leakedRootReturnField}\\b`),
        `app.js root setup return should expose Recording/Editing Info modal template field ${leakedRootReturnField} only through appRecInfoModal`
    );
}
assert.match(
    appMetadataInfoModalsShellComponent,
    /<app-rec-info-modal\b[^>]*><\/app-rec-info-modal>/,
    'app-metadata-info-modals-shell must render the extracted app-rec-info-modal component'
);
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showRecInfoModal" class="modal-overlay z-\[12000\]"[\s\S]*?recInfoForm\.studio[\s\S]*?saveRecInfo[\s\S]*?<\/div>\s*<\/div>/,
    'index.html should not retain the inline Recording/Editing Info modal DOM after app-rec-info-modal extraction'
);

assert.ok(existsSync(appColorPickerModalComponentPath), 'app-color-picker-modal component must exist for Color Picker modal extraction');
assert.match(
    appColorPickerModalComponent,
    /export const AppColorPickerModal\s*=/,
    'app-color-picker-modal component must export an AppColorPickerModal component definition'
);
assert.match(
    appColorPickerModalComponent,
    /template:\s*`[\s\S]*v-if="showColorPickerModal"[\s\S]*Color Picker[\s\S]*tempColor[\s\S]*presetColors[\s\S]*resetColorPicker[\s\S]*saveColorPicker[\s\S]*`/,
    'app-color-picker-modal component must own the existing Color Picker modal template, including preview, swatches, reset, and save controls'
);
assert.doesNotMatch(
    appScript,
    /import \{ AppColorPickerModal \} from '\.\/components\/app-color-picker-modal\.js';/,
    'app.js should not statically import the low-frequency Color Picker modal into the initial module graph'
);
assert.match(
    appRootAsyncModals,
    /export const AppColorPickerModal\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-color-picker-modal\.js'\), 'AppColorPickerModal'\);/,
    'app-root-async-modals must register the low-frequency Color Picker modal through createAsyncRootComponent dynamic import'
);
assert.ok(existsSync(appPickerModalsShellComponentPath), 'app-picker-modals-shell component must exist for color/duration picker grouping');
assert.match(
    appPickerModalsShellComponent,
    /export const AppPickerModalsShell\s*=/,
    'app-picker-modals-shell component must export an AppPickerModalsShell component definition'
);
assert.match(
    appPickerModalsShellComponent,
    /import \{ appPickerModalComponents \} from '\.\/app-picker-modal-components\.js';[\s\S]*components:\s*appPickerModalComponents/,
    'app-picker-modals-shell must mount the color/duration picker registry without naming each async modal locally'
);
assert.match(
    appPickerModalComponents,
    /import \{[\s\S]*AppColorPickerModal[\s\S]*AppDurationPicker[\s\S]*\} from '\.\/app-root-async-modals\.js';[\s\S]*export const appPickerModalComponents\s*=\s*\{[\s\S]*\bAppColorPickerModal\b[\s\S]*\bAppDurationPicker\b[\s\S]*\};/,
    'app-picker-modal-components must own the async color/duration picker component map'
);
assert.doesNotMatch(
    appPickerModalsShellComponent,
    /import \{[\s\S]*AppColorPickerModal[\s\S]*AppDurationPicker[\s\S]*\} from '\.\/app-root-async-modals\.js';/,
    'app-picker-modals-shell should not directly import color/duration picker modal components after registry extraction'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppPickerModalsShell \} from '\.\/app-picker-modals-shell\.js';/,
    'app-root-static-components should not expose the picker modal shell once AppRootOverlaysShell owns it locally'
);
assert.match(
    appRootOverlayShellComponents,
    /appRootOverlayShellComponents\s*=\s*\{[\s\S]*\bAppPickerModalsShell\b[\s\S]*\}/,
    'app-root-overlay-shell-components must register AppPickerModalsShell locally'
);
assert.match(
    appRootContextWiringModule,
    /const appColorPickerModal\s*=\s*createRootColorPickerModalShellState\(\{(?=[\s\S]*showColorPickerModal)(?=[\s\S]*presetColors)(?=[\s\S]*tempColor)(?=[\s\S]*resetColorPicker)(?=[\s\S]*saveColorPicker)[\s\S]*\}\);/,
    'app.js must expose Color Picker state and actions through a focused appColorPickerModal ctx factory call'
);
assert.match(
    appStateFactoriesModule,
    /import \{ createPickerModalsShellState \} from '\.\.\/state\/picker-modals-shell-state\.js';[\s\S]*function createRootPickerModalsShellState\(options\)\s*\{[\s\S]*reactive,[\s\S]*\.\.\.options,/,
    'app state factories should bind Vue reactive for the picker modal group shell ctx factory'
);
assert.match(
    appRootContextWiringModule,
    /const appPickerModalsShell\s*=\s*createRootPickerModalsShellState\(\{[\s\S]*appColorPickerModal[\s\S]*appDurationPicker[\s\S]*\}\);/,
    'app.js must expose color/duration picker components through one focused shell ctx factory call'
);
assert.doesNotMatch(
    appScript,
    /const appPickerModalsShell\s*=\s*reactive\(\{[\s\S]*appColorPickerModal[\s\S]*appDurationPicker[\s\S]*\}\);/,
    'app.js should not own the picker modal group reactive ctx object after shell ctx extraction'
);
for (const leakedRootReturnField of [
    'showColorPickerModal',
    'presetColors',
    'tempColor',
    'resetColorPicker',
    'saveColorPicker',
    'openColorPicker',
]) {
    assert.doesNotMatch(
        rootSetupReturnObject,
        new RegExp(`\\b${leakedRootReturnField}\\b`),
        `app.js root setup return should expose Color Picker template field ${leakedRootReturnField} only through appColorPickerModal`
    );
}
assert.match(
    appPickerModalsShellComponent,
    /<app-color-picker-modal\b[^>]*><\/app-color-picker-modal>/,
    'app-picker-modals-shell must render the extracted app-color-picker-modal component'
);
assert.match(
    appRootOverlaysShellComponent,
    /<app-picker-modals-shell\b[^>]*><\/app-picker-modals-shell>/,
    'app-root-overlays-shell must render the picker modal shell'
);
for (const groupedPickerTag of [
    'app-color-picker-modal',
    'app-duration-picker',
]) {
    assert.doesNotMatch(
        indexHtml,
        new RegExp(`<${groupedPickerTag}\\b[^>]*><\\/${groupedPickerTag}>`),
        `index.html should not render ${groupedPickerTag} directly after picker modal shell grouping`
    );
}
for (const pickerShellChildComponent of [
    'AppColorPickerModal',
    'AppDurationPicker',
]) {
    assert.doesNotMatch(
        appScript,
        new RegExp(`components:\\s*\\{[^}]*\\b${pickerShellChildComponent}\\b[^}]*\\}`),
        `app.js root components should not register ${pickerShellChildComponent}; AppPickerModalsShell owns it locally`
    );
}
assert.match(
    appPickerModalsShellComponent,
    /<app-duration-picker\b[^>]*><\/app-duration-picker>/,
    'app-picker-modals-shell must render the extracted app-duration-picker component'
);
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showColorPickerModal" class="modal-overlay z-\[6000\]"[\s\S]*?presetColors[\s\S]*?saveColorPicker[\s\S]*?<\/div>\s*<\/div>/,
    'index.html should not retain the inline Color Picker modal DOM after app-color-picker-modal extraction'
);

assert.ok(existsSync(appDurationPickerComponentPath), 'app-duration-picker component must exist for Duration Picker extraction');
assert.match(
    appDurationPickerComponent,
    /export const AppDurationPicker\s*=/,
    'app-duration-picker component must export an AppDurationPicker component definition'
);
assert.match(
    appDurationPickerComponent,
    /template:\s*`[\s\S]*v-if="showDurationPicker"[\s\S]*bubble-picker-overlay[\s\S]*pickerPos\.top[\s\S]*pickerPos\.left[\s\S]*pickerMinRef[\s\S]*onScroll[\s\S]*onDragStart[\s\S]*tempDuration\.m[\s\S]*pickerSecRef[\s\S]*tempDuration\.s[\s\S]*resetDuration[\s\S]*confirmDurationPicker[\s\S]*`/,
    'app-duration-picker component must own the existing Duration Picker template, including columns, scroll handlers, reset, and confirm controls'
);
assert.match(
    appDurationPickerComponent,
    /:ref="\s*\(el\) => \{\s*pickerMinRef = el;\s*\}\s*"/,
    'app-duration-picker must use a function template ref for pickerMinRef when extracted/lazy-loaded through ctx'
);
assert.match(
    appDurationPickerComponent,
    /:ref="\s*\(el\) => \{\s*pickerSecRef = el;\s*\}\s*"/,
    'app-duration-picker must use a function template ref for pickerSecRef when extracted/lazy-loaded through ctx'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppDurationPicker \} from '\.\/app-duration-picker\.js';/,
    'app-root-static-components should not keep low-frequency app-duration-picker in the synchronous root registry'
);
assert.match(
    appRootAsyncModals,
    /export const AppDurationPicker\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-duration-picker\.js'\), 'AppDurationPicker'\);/,
    'app-root-async-modals must register the low-frequency Duration Picker through createAsyncRootComponent dynamic import'
);
assert.match(
    appRootContextWiringModule,
    /const appDurationPicker\s*=\s*createRootDurationPickerModalShellState\(\{(?=[\s\S]*showDurationPicker)(?=[\s\S]*pickerPos)(?=[\s\S]*pickerMinRef)(?=[\s\S]*pickerSecRef)(?=[\s\S]*tempDuration)(?=[\s\S]*closePicker)(?=[\s\S]*onScroll)(?=[\s\S]*onDragStart)(?=[\s\S]*resetDuration)(?=[\s\S]*confirmDurationPicker)[\s\S]*\}\);/,
    'app.js must expose Duration Picker state and actions through a focused appDurationPicker ctx factory call'
);
for (const leakedRootReturnField of [
    'showDurationPicker',
    'tempDuration',
    'pickerMinRef',
    'pickerPos',
    'closePicker',
    'resetDuration',
    'pickerSecRef',
    'onDragStart',
    'onScroll',
    'confirmDurationPicker',
    'openDurationPicker',
    'formatSecs',
]) {
    assert.doesNotMatch(
        rootSetupReturnObject,
        new RegExp(`\\b${leakedRootReturnField}\\b`),
        `app.js root setup return should expose Duration Picker template field ${leakedRootReturnField} only through appDurationPicker`
    );
}
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showDurationPicker" class="bubble-picker-overlay"[\s\S]*?tempDuration\.m[\s\S]*?confirmDurationPicker[\s\S]*?<\/div>\s*<\/div>/,
    'index.html should not retain the inline Duration Picker DOM after app-duration-picker extraction'
);

assert.ok(existsSync(appSplitModalComponentPath), 'app-split-modal component must exist for Split modal extraction');
assert.match(
    appSplitModalComponent,
    /export const AppSplitModal\s*=/,
    'app-split-modal component must export an AppSplitModal component definition'
);
assert.match(
    appSplitModalComponent,
    /template:\s*`[\s\S]*v-if="showSplitModal"[\s\S]*拆分任务[\s\S]*splitState\.part1Str[\s\S]*splitState\.part2Str[\s\S]*splitState\.totalSec[\s\S]*splitState\.splitPoint[\s\S]*onSplitSliderInput[\s\S]*confirmSplitSlider[\s\S]*`/,
    'app-split-modal component must own the existing Split modal template, including preview values, slider, cancel, and confirm controls'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppSplitModal \} from '\.\/app-split-modal\.js';/,
    'app-root-static-components should not keep low-frequency app-split-modal in the synchronous root registry'
);
assert.match(
    appRootAsyncModals,
    /export const AppSplitModal\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-split-modal\.js'\), 'AppSplitModal'\);/,
    'app-root-async-modals must register the low-frequency Split modal through createAsyncRootComponent dynamic import'
);
assert.match(
    appRootContextWiringModule,
    /const appSplitModal\s*=\s*createRootSplitModalShellState\(\{(?=[\s\S]*showSplitModal)(?=[\s\S]*splitState)(?=[\s\S]*onSplitSliderInput)(?=[\s\S]*confirmSplitSlider)[\s\S]*\}\);/,
    'app.js must expose Split modal state and actions through a focused appSplitModal ctx factory call'
);
assert.doesNotMatch(
    appScript,
    /const appSplitModal\s*=\s*reactive\(\{[\s\S]*showSplitModal[\s\S]*splitState[\s\S]*onSplitSliderInput[\s\S]*confirmSplitSlider[\s\S]*\}\);/,
    'app.js should not own the Split modal reactive ctx body after extraction'
);
assert.match(
    appStateFactoriesModule,
    /import \{ createSplitModalShellState \} from '\.\.\/state\/split-modal-shell-state\.js';[\s\S]*function createRootSplitModalShellState\(options\)\s*\{[\s\S]*reactive,[\s\S]*\.\.\.options,/,
    'app-state-factories must bind Vue reactive for the Split modal shell ctx factory'
);
assert.ok(existsSync(splitModalShellStatePath), 'split-modal-shell-state module must exist for focused Split modal ctx extraction');
assert.match(
    splitModalShellStateModule,
    /export const createSplitModalShellState = defineShellState\(/,
    'split-modal-shell-state module must expose a focused Split modal ctx factory'
);
{
    const actions = [];
    const refs = {
        showSplitModal: { value: true },
    };
    const state = {
        splitState: {
            part1Str: '10:00',
            part2Str: '20:00',
            splitPoint: 600,
        },
    };
    const ctx = createSplitModalShellState({
        reactive: (value) => value,
        refs,
        state,
        actions: {
            onSplitSliderInput: () => actions.push('input'),
            confirmSplitSlider: () => actions.push('confirm'),
        },
    });
    assert.equal(ctx.showSplitModal, true, 'Split modal ctx should expose modal visibility through a getter');
    assert.equal(ctx.splitState.part1Str, '10:00', 'Split modal ctx should expose split state through a getter');
    ctx.showSplitModal = false;
    state.splitState.part1Str = '12:00';
    assert.equal(refs.showSplitModal.value, false, 'Split modal ctx should preserve visibility two-way binding');
    assert.equal(ctx.splitState.part1Str, '12:00', 'Split modal ctx should preserve split state object identity');
    ctx.onSplitSliderInput();
    ctx.confirmSplitSlider();
    assert.deepEqual(actions, ['input', 'confirm'], 'Split modal ctx should pass through slider and confirm actions');
    assert.throws(
        () => createSplitModalShellState({ refs, state, actions: {} }),
        /requires Vue reactive factory/,
        'Split modal ctx factory should fail clearly when Vue reactive is missing'
    );
}
for (const leakedRootReturnField of [
    'showSplitModal',
    'splitState',
    'onSplitSliderInput',
    'confirmSplitSlider',
    'splitTrack',
    'restoreSplitTime',
]) {
    assert.doesNotMatch(
        rootSetupReturnObject,
        new RegExp(`\\b${leakedRootReturnField}\\b`),
        `app.js root setup return should expose Split modal template field ${leakedRootReturnField} only through appSplitModal`
    );
}
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showSplitModal" class="modal-overlay z-\[11000\]"[\s\S]*?splitState\.part1Str[\s\S]*?confirmSplitSlider[\s\S]*?<\/div>\s*<\/div>/,
    'index.html should not retain the inline Split modal DOM after app-split-modal extraction'
);

assert.ok(existsSync(appInputModalComponentPath), 'app-input-modal component must exist for universal input modal extraction');
assert.match(
    appInputModalComponent,
    /export const AppInputModal\s*=/,
    'app-input-modal component must export an AppInputModal component definition'
);
assert.match(
    appInputModalComponent,
    /template:\s*`[\s\S]*v-if="showInputModal"[\s\S]*inputModalConfig\.title[\s\S]*universalInputRef[\s\S]*inputModalConfig\.value[\s\S]*inputModalConfig\.hint[\s\S]*closeInputModal[\s\S]*confirmInputModal[\s\S]*`/,
    'app-input-modal component must own the existing universal input modal template, including title, input, hint, cancel, and confirm controls'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppInputModal \} from '\.\/app-input-modal\.js';/,
    'app-root-static-components should not keep low-frequency app-input-modal in the synchronous root registry'
);
assert.match(
    appRootAsyncModals,
    /export const AppInputModal\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-input-modal\.js'\), 'AppInputModal'\);/,
    'app-root-async-modals must register the low-frequency universal input modal through createAsyncRootComponent dynamic import'
);
assert.ok(existsSync(appUniversalModalsShellComponentPath), 'app-universal-modals-shell component must exist for input/confirm modal grouping');
assert.match(
    appUniversalModalsShellComponent,
    /export const AppUniversalModalsShell\s*=/,
    'app-universal-modals-shell component must export an AppUniversalModalsShell component definition'
);
assert.match(
    appUniversalModalsShellComponent,
    /import \{ appUniversalModalComponents \} from '\.\/app-universal-modal-components\.js';[\s\S]*components:\s*appUniversalModalComponents/,
    'app-universal-modals-shell must mount the input/confirm universal modal registry without naming each async modal locally'
);
assert.match(
    appUniversalModalComponents,
    /import \{[\s\S]*AppInputModal[\s\S]*AppConfirmModal[\s\S]*\} from '\.\/app-root-async-modals\.js';[\s\S]*export const appUniversalModalComponents\s*=\s*\{[\s\S]*\bAppInputModal\b[\s\S]*\bAppConfirmModal\b[\s\S]*\};/,
    'app-universal-modal-components must own the async input/confirm universal modal component map'
);
assert.doesNotMatch(
    appUniversalModalsShellComponent,
    /import \{[\s\S]*AppInputModal[\s\S]*AppConfirmModal[\s\S]*\} from '\.\/app-root-async-modals\.js';/,
    'app-universal-modals-shell should not directly import input/confirm universal modal components after registry extraction'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppUniversalModalsShell \} from '\.\/app-universal-modals-shell\.js';/,
    'app-root-static-components should not expose the universal modal shell once AppRootOverlaysShell owns it locally'
);
assert.match(
    appRootOverlayShellComponents,
    /appRootOverlayShellComponents\s*=\s*\{[\s\S]*\bAppUniversalModalsShell\b[\s\S]*\}/,
    'app-root-overlay-shell-components must register AppUniversalModalsShell locally'
);
assert.match(
    appRootContextWiringModule,
    /const appInputModal\s*=\s*createRootInputModalShellState\(\{(?=[\s\S]*showInputModal)(?=[\s\S]*inputModalConfig)(?=[\s\S]*universalInputRef)(?=[\s\S]*closeInputModal)(?=[\s\S]*confirmInputModal)[\s\S]*\}\);/,
    'app.js must expose universal input modal state and actions through a focused appInputModal ctx factory call'
);
assert.doesNotMatch(
    appScript,
    /const appInputModal\s*=\s*reactive\(\{[\s\S]*showInputModal[\s\S]*inputModalConfig[\s\S]*universalInputRef[\s\S]*closeInputModal[\s\S]*confirmInputModal[\s\S]*\}\);/,
    'app.js should not own the universal input modal reactive ctx body after extraction'
);
assert.match(
    appStateFactoriesModule,
    /import \{ createInputModalShellState \} from '\.\.\/state\/input-modal-shell-state\.js';[\s\S]*function createRootInputModalShellState\(options\)\s*\{[\s\S]*reactive,[\s\S]*\.\.\.options,/,
    'app-state-factories must bind Vue reactive for the universal input modal shell ctx factory'
);
assert.ok(existsSync(inputModalShellStatePath), 'input-modal-shell-state module must exist for focused universal input modal ctx extraction');
assert.match(
    inputModalShellStateModule,
    /export const createInputModalShellState = defineShellState\(/,
    'input-modal-shell-state module must expose a focused universal input modal ctx factory'
);
{
    const actions = [];
    const refs = {
        showInputModal: { value: true },
        inputModalConfig: {
            title: 'Input Title',
            value: 'Input Value',
            hint: 'Input Hint',
        },
        universalInputRef: { value: { id: 'input-a' } },
    };
    const ctx = createInputModalShellState({
        reactive: (value) => value,
        refs,
        actions: {
            closeInputModal: () => actions.push('close'),
            confirmInputModal: () => actions.push('confirm'),
        },
    });
    assert.equal(ctx.showInputModal, true, 'input modal ctx should expose modal visibility through a getter');
    assert.equal(ctx.inputModalConfig.title, 'Input Title', 'input modal ctx should expose the shared input config object');
    assert.equal(ctx.universalInputRef.id, 'input-a', 'input modal ctx should expose the current universal input ref');
    refs.showInputModal.value = false;
    refs.inputModalConfig.title = 'Updated Input Title';
    ctx.universalInputRef = { id: 'input-b' };
    assert.equal(ctx.showInputModal, false, 'input modal ctx should read updated visibility from refs');
    assert.equal(ctx.inputModalConfig.title, 'Updated Input Title', 'input modal ctx should preserve config object identity');
    assert.equal(refs.universalInputRef.value.id, 'input-b', 'input modal ctx should preserve universal input ref two-way binding');
    ctx.closeInputModal();
    ctx.confirmInputModal();
    assert.deepEqual(actions, ['close', 'confirm'], 'input modal ctx should pass through close and confirm actions');
    assert.throws(
        () => createInputModalShellState({ refs, actions: {} }),
        /requires Vue reactive factory/,
        'input modal ctx factory should fail clearly when Vue reactive is missing'
    );
}
assert.match(
    appStateFactoriesModule,
    /import \{ createUniversalModalsShellState \} from '\.\.\/state\/universal-modals-shell-state\.js';[\s\S]*function createRootUniversalModalsShellState\(options\)\s*\{[\s\S]*reactive,[\s\S]*\.\.\.options,/,
    'app state factories should bind Vue reactive for the universal modal group shell ctx factory'
);
assert.match(
    appRootContextWiringModule,
    /const appUniversalModalsShell\s*=\s*createRootUniversalModalsShellState\(\{[\s\S]*appInputModal[\s\S]*appConfirmModal[\s\S]*\}\);/,
    'app.js must expose input/confirm modals through one focused shell ctx factory call'
);
assert.doesNotMatch(
    appScript,
    /const appUniversalModalsShell\s*=\s*reactive\(\{[\s\S]*appInputModal[\s\S]*appConfirmModal[\s\S]*\}\);/,
    'app.js should not own the universal modal group reactive ctx object after shell ctx extraction'
);
assert.match(
    appInputModalComponent,
    /:ref="\s*\(el\) => \{\s*universalInputRef = el;\s*\}\s*"/,
    'app-input-modal must use a function template ref so the extracted async component writes through the universalInputRef ctx setter without Vue string-ref warnings'
);
assert.match(
    appUniversalModalsShellComponent,
    /<app-input-modal\b[^>]*><\/app-input-modal>/,
    'app-universal-modals-shell must render the extracted app-input-modal component'
);
assert.match(
    appUniversalModalsShellComponent,
    /<app-confirm-modal\b[^>]*><\/app-confirm-modal>/,
    'app-universal-modals-shell must render the extracted app-confirm-modal component'
);
assert.match(
    appRootOverlaysShellComponent,
    /<app-universal-modals-shell\b[^>]*><\/app-universal-modals-shell>/,
    'app-root-overlays-shell must render the universal modal shell'
);
for (const groupedUniversalTag of [
    'app-input-modal',
    'app-confirm-modal',
]) {
    assert.doesNotMatch(
        indexHtml,
        new RegExp(`<${groupedUniversalTag}\\b[^>]*><\\/${groupedUniversalTag}>`),
        `index.html should not render ${groupedUniversalTag} directly after universal modal shell grouping`
    );
}
for (const universalShellChildComponent of [
    'AppInputModal',
    'AppConfirmModal',
]) {
    assert.doesNotMatch(
        appScript,
        new RegExp(`components:\\s*\\{[^}]*\\b${universalShellChildComponent}\\b[^}]*\\}`),
        `app.js root components should not register ${universalShellChildComponent}; AppUniversalModalsShell owns it locally`
    );
}
for (const leakedRootReturnField of [
    'showInputModal',
    'inputModalConfig',
    'universalInputRef',
    'closeInputModal',
    'confirmInputModal',
    'appInputModal',
    'appConfirmModal',
]) {
    assert.doesNotMatch(
        rootSetupReturnObject,
        new RegExp(`\\b${leakedRootReturnField}\\b`),
        `app.js root setup return should expose universal modal field ${leakedRootReturnField} only through appUniversalModalsShell`
    );
}
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showInputModal" class="modal-overlay z-\[10000\]"[\s\S]*?inputModalConfig\.title[\s\S]*?confirmInputModal[\s\S]*?<\/div>\s*<\/div>/,
    'index.html should not retain the inline universal input modal DOM after app-input-modal extraction'
);

assert.ok(existsSync(appConfirmModalComponentPath), 'app-confirm-modal component must exist for confirm and alert modal extraction');
assert.match(
    appConfirmModalComponent,
    /export const AppConfirmModal\s*=/,
    'app-confirm-modal component must export an AppConfirmModal component definition'
);
assert.match(
    appConfirmModalComponent,
    /template:\s*`[\s\S]*v-if="showConfirmModal"[\s\S]*confirmModalConfig\.isDestructive[\s\S]*confirmModalConfig\.isAlert[\s\S]*confirmModalConfig\.title[\s\S]*confirmModalConfig\.content[\s\S]*closeConfirmModal[\s\S]*handleConfirmAction[\s\S]*`/,
    'app-confirm-modal component must own the existing confirm and alert modal template, including title, content, cancel, and confirm controls'
);
assert.doesNotMatch(
    appRootStaticComponents,
    /export \{ AppConfirmModal \} from '\.\/app-confirm-modal\.js';/,
    'app-root-static-components should not keep low-frequency app-confirm-modal in the synchronous root registry'
);
assert.match(
    appRootAsyncModals,
    /export const AppConfirmModal\s*=\s*createAsyncRootComponent\(\(\) => import\('\.\/app-confirm-modal\.js'\), 'AppConfirmModal'\);/,
    'app-root-async-modals must register the low-frequency confirm modal through createAsyncRootComponent dynamic import'
);
assert.match(
    appRootContextWiringModule,
    /const appConfirmModal\s*=\s*createRootConfirmModalShellState\(\{(?=[\s\S]*showConfirmModal)(?=[\s\S]*confirmModalConfig)(?=[\s\S]*closeConfirmModal)(?=[\s\S]*handleConfirmAction)[\s\S]*\}\);/,
    'app.js must expose confirm and alert modal state and actions through a focused appConfirmModal ctx factory call'
);
assert.doesNotMatch(
    appScript,
    /const appConfirmModal\s*=\s*reactive\(\{[\s\S]*showConfirmModal[\s\S]*confirmModalConfig[\s\S]*closeConfirmModal[\s\S]*handleConfirmAction[\s\S]*\}\);/,
    'app.js should not own the confirm modal reactive ctx body after extraction'
);
assert.match(
    appStateFactoriesModule,
    /import \{ createConfirmModalShellState \} from '\.\.\/state\/confirm-modal-shell-state\.js';[\s\S]*function createRootConfirmModalShellState\(options\)\s*\{[\s\S]*reactive,[\s\S]*\.\.\.options,/,
    'app-state-factories must bind Vue reactive for the confirm modal shell ctx factory'
);
assert.ok(existsSync(confirmModalShellStatePath), 'confirm-modal-shell-state module must exist for focused confirm modal ctx extraction');
assert.match(
    confirmModalShellStateModule,
    /export const createConfirmModalShellState = defineShellState\(/,
    'confirm-modal-shell-state module must expose a focused confirm modal ctx factory'
);
{
    const actions = [];
    const refs = {
        showConfirmModal: { value: true },
        confirmModalConfig: {
            title: 'Confirm Title',
            content: 'Confirm Body',
            isAlert: false,
        },
    };
    const ctx = createConfirmModalShellState({
        reactive: (value) => value,
        refs,
        actions: {
            closeConfirmModal: () => actions.push('close'),
            handleConfirmAction: () => actions.push('confirm'),
        },
    });
    assert.equal(ctx.showConfirmModal, true, 'confirm modal ctx should expose modal visibility through a getter');
    assert.equal(ctx.confirmModalConfig.title, 'Confirm Title', 'confirm modal ctx should expose the shared confirm config object');
    refs.showConfirmModal.value = false;
    refs.confirmModalConfig.title = 'Updated Confirm Title';
    assert.equal(ctx.showConfirmModal, false, 'confirm modal ctx should read updated visibility from refs');
    assert.equal(ctx.confirmModalConfig.title, 'Updated Confirm Title', 'confirm modal ctx should preserve config object identity');
    ctx.closeConfirmModal();
    ctx.handleConfirmAction();
    assert.deepEqual(actions, ['close', 'confirm'], 'confirm modal ctx should pass through close and confirm actions');
    assert.throws(
        () => createConfirmModalShellState({ refs, actions: {} }),
        /requires Vue reactive factory/,
        'confirm modal ctx factory should fail clearly when Vue reactive is missing'
    );
}
for (const leakedRootReturnField of [
    'showConfirmModal',
    'confirmModalConfig',
    'closeConfirmModal',
    'handleConfirmAction',
]) {
    assert.doesNotMatch(
        rootSetupReturnObject,
        new RegExp(`\\b${leakedRootReturnField}\\b`),
        `app.js root setup return should expose confirm modal template field ${leakedRootReturnField} only through appConfirmModal`
    );
}
assert.doesNotMatch(
    indexHtml,
    /<div v-if="showConfirmModal" class="modal-overlay z-\[9999\]"[\s\S]*?confirmModalConfig\.title[\s\S]*?handleConfirmAction[\s\S]*?<\/div>\s*<\/div>/,
    'index.html should not retain the inline confirm and alert modal DOM after app-confirm-modal extraction'
);

const requiredBootstrapStoreRefs = [
    'currentSessionId',
    'activeDropdown',
    'showMobileMenu',
    'tempNickname',
    'settingsExpandedGroups',
    'newSettingsItem',
    'user',
    'showAuthModal',
    'authLoading',
    'authForm',
    'history',
    'historyIndex',
    'showConfirmModal',
    'confirmModalConfig',
    'showInputModal',
    'universalInputRef',
    'inputModalConfig',
    'showQuickAddModal',
    'quickAddType',
    'quickAddForm',
    'showCropModal',
    'cropImgSrc',
    'cropImgRef',
    'showGroupSuggestions',
    'settingsGroupFocus',
    'sortKey',
    'activeColorKey',
    'expandedGroups',
    'themeMode',
    'isDark',
];

assert.match(
    appScript,
    /Object\.assign\(assembly\.refs, store,/,
    'app.js must merge the store into assembly.refs so wiring modules can destructure bootstrap refs'
);
const muscheStoreModule = readFileSync('app/scripts/store/index.js', 'utf8');
for (const refName of requiredBootstrapStoreRefs) {
    assert.match(
        muscheStoreModule,
        new RegExp(`\\b${refName}\\b`),
        `the store must own ${refName} so assembly.refs exposes it during bootstrap`
    );
}

const searchFeatureIndex = appScript.indexOf('searchFeature = wireSearchFeature(assembly');
const appStateDeclarationIndex = appScript.indexOf('} = createRootAppState();');
assert.ok(searchFeatureIndex !== -1, 'app.js must register the search feature');
assert.ok(appStateDeclarationIndex !== -1, 'app.js must create root-local app state');
assert.ok(
    appStateDeclarationIndex < searchFeatureIndex,
    'app.js must create root-local app state before passing isMobile to search feature setup'
);
const searchShellFeatureIndex = appScript.indexOf('searchShellFeature = registerSearchShellFeature({');
assert.equal(
    searchShellFeatureIndex,
    -1,
    'app.js must not register the pass-through search shell feature'
);

const splitViewFeatureIndex = appScript.indexOf('wireSplitViewFeature(assembly');
assert.ok(splitViewFeatureIndex !== -1, 'app.js must register the split-view feature');
assert.ok(
    appStateDeclarationIndex < splitViewFeatureIndex,
    'app.js must create root-local app state before passing sidebarTab to split-view feature setup'
);
assert.equal(
    appScript.indexOf('registerSplitViewShellFeature('),
    -1,
    'app.js must not register the pass-through split-view shell feature'
);

const ratioFeatureIndex = appScript.indexOf('ratioFeature = wireRatioFeature(assembly');
assert.ok(ratioFeatureIndex !== -1, 'app.js must register the ratio feature');
assert.equal(
    appScript.indexOf('registerRatioShellFeature('),
    -1,
    'app.js must not register the pass-through ratio shell feature'
);

const scheduleFeatureIndex = appScript.indexOf('scheduleFeature = wireScheduleFeature(assembly');
assert.ok(scheduleFeatureIndex !== -1, 'app.js must register the schedule feature');
assert.match(
    scheduleFeatureRegistrarModule,
    /import \{ registerScheduleFeature \} from '\.\.\/features\/schedule\.js';/,
    'schedule feature registrar must own the Schedule feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createScheduleFeatureRegistrar',
    registerName: 'wireScheduleFeature',
    modulePath: 'schedule-feature-registrar.js',
    label: 'Schedule',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerScheduleFeature \} from '\.\/features\/schedule\.js';/,
    'app.js should not directly import Schedule after registrar extraction'
);

assert.doesNotMatch(
    appScript,
    /from\s+['"]\.\/features\/schedule-shell\.js['"]|registerScheduleShellFeature\(|scheduleShellFeature/,
    'app.js must not import, register, or keep the pass-through schedule shell feature'
);

const settingsSyncFeatureIndex = appScript.indexOf('const settingsSyncFeature = wireSettingsSyncFeature(assembly');
const settingsFeatureIndex = appScript.indexOf('const settingsFeatureProxy = wireSettingsFeature(assembly');
const sortedInstrumentsIndex = appScript.indexOf('sortedInstruments,');
assert.ok(settingsSyncFeatureIndex !== -1, 'app.js must register the lightweight settings sync feature');
assert.ok(settingsFeatureIndex !== -1, 'app.js must lazily wire the full settings feature');
assert.ok(sortedInstrumentsIndex !== -1, 'app.js must expose sorted settings lists');
assert.ok(
    settingsSyncFeatureIndex < sortedInstrumentsIndex && sortedInstrumentsIndex < settingsFeatureIndex,
    'app.js must expose sorted settings lists from the sync feature before lazy-loading full settings actions'
);
assert.match(
    settingsSyncFeatureRegistrarModule,
    /import \{ registerSettingsSyncFeature \} from '\.\.\/features\/settings-sync\.js';/,
    'settings sync feature registrar must own the Settings Sync feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createSettingsSyncFeatureRegistrar',
    registerName: 'wireSettingsSyncFeature',
    modulePath: 'settings-sync-feature-registrar.js',
    label: 'Settings Sync',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerSettingsSyncFeature \} from '\.\/features\/settings-sync\.js';/,
    'app.js should not directly import Settings Sync after registrar extraction'
);

assert.match(
    settingsFeatureLoaderModule,
    /export function createSettingsFeatureLoader\(\{[\s\S]*importSettingsFeature\s*=\s*\(\)\s*=>\s*import\(['"]\.\.\/features\/settings\.js['"]\),[\s\S]*\}\s*=\s*\{\}\)\s*\{/,
    'settings feature loader service must expose a factory for low-frequency settings wiring'
);
assert.match(
    settingsFeatureLoaderModule,
    /importSettingsFeature\(\)[\s\S]*registerSettingsFeature/,
    'settings feature loader service must own the dynamic full settings feature import'
);

{
    let importCount = 0;
    const expectedRegisterSettingsFeature = () => ({ registered: true });
    const loadSettingsFeature = createSettingsFeatureLoader({
        importSettingsFeature: async () => {
            importCount += 1;
            return { registerSettingsFeature: expectedRegisterSettingsFeature };
        },
    });

    assert.equal(importCount, 0, 'settings feature loader factory must not import the feature during bootstrap');
    assert.equal(
        await loadSettingsFeature(),
        expectedRegisterSettingsFeature,
        'settings feature loader must resolve the injected feature registration function when invoked'
    );
    assert.equal(importCount, 1, 'settings feature loader must defer importing until the returned loader is invoked');
    assert.throws(
        () => createSettingsFeatureLoader({ importSettingsFeature: null }),
        /createSettingsFeatureLoader requires an importSettingsFeature function/,
        'settings feature loader should fail clearly when no feature importer is available'
    );
}

assertAppFeatureLoadersRegistry({
    factoryName: 'createSettingsFeatureLoader',
    loaderName: 'loadSettingsFeature',
    appConsumerName: 'wireSettingsFeature',
    modulePath: 'settings-feature-loader.js',
    label: 'settings feature',
});
assert.doesNotMatch(
    appScript,
    /import\(['"]\.\/features\/settings\.js['"]\)/,
    'app.js must not retain the direct dynamic full settings feature import after loader extraction'
);
assert.doesNotMatch(
    appScript,
    /import\(['"]\.\/features\/settings-shell\.js['"]\)|registerSettingsShellFeature\(|settingsShellFeature|withSettingsShellFeature|getSettingsShellFeature/,
    'app.js must not import, register, or keep the pass-through settings shell feature'
);
assert.match(
    appScript,
    /allSettingsGrouped\s*=\s*computed\(\(\) => feature\.getAllSettingsGrouped\(\)\);/,
    'app.js must preserve the grouped-settings computed adapter when wiring settings directly'
);

const authFeatureIndex = appScript.indexOf('authFeature = wireAuthFeature(assembly');
assert.ok(authFeatureIndex !== -1, 'app.js must register the auth feature');
assert.doesNotMatch(
    appScript,
    /from\s+['"]\.\/features\/auth-shell\.js['"]|registerAuthShellFeature\(|authShellFeature/,
    'app.js must not import, register, or keep the pass-through auth shell feature'
);
assert.match(
    appScript,
    /const\s+saveToCloud\s*=\s*\(force = false\)\s*=>\s*authFeature\.saveToCloud\(handleManualSync,\s*force\);/,
    'app.js must keep the manual-sync-aware cloud-save adapter when wiring auth directly'
);

const importDataFeatureIndex = appScript.indexOf('const importDataFeatureProxy = wireImportDataFeature(assembly');
assert.ok(importDataFeatureIndex !== -1, 'app.js must lazily register the import data feature');
assert.equal(
    appScript.indexOf('registerImportShellFeature('),
    -1,
    'app.js must not register the pass-through import shell feature'
);

const trackListFeatureIndex = appScript.indexOf('const trackListFeatureProxy = wireTrackListFeature(assembly');
assert.ok(trackListFeatureIndex !== -1, 'app.js must register the track-list feature inside the lazy loader');
assert.match(
    appScript,
    /const\s+trackListFeatureProxy\s*=\s*wireTrackListFeature\(assembly[\s\S]*const\s+getTrackListFeature\s*=\s*trackListFeatureProxy\.getFeature;[\s\S]*const\s+withTrackListFeature\s*=\s*trackListFeatureProxy\.method;/,
    'app.js must proxy track-list helpers through the shared lazy feature proxy'
);

const midiManagerFeatureIndex = appScript.indexOf('const midiManagerFeatureProxy = wireMidiManagerFeature(assembly');
assert.ok(midiManagerFeatureIndex !== -1, 'app.js must register the midi-manager feature inside the lazy loader');
assert.equal(
    appScript.indexOf('registerMidiManagerShellFeature('),
    -1,
    'app.js must not register the pass-through midi-manager shell feature'
);

const viewNavigationFeatureIndex = appScript.indexOf('const viewNavigationFeature = wireViewNavigationFeature(assembly');
assert.ok(viewNavigationFeatureIndex !== -1, 'app.js must register the view-navigation feature');
assert.equal(
    appScript.indexOf('registerViewNavigationShellFeature('),
    -1,
    'app.js must not register the pass-through view-navigation shell feature'
);

const pickerControlsFeatureIndex = appScript.indexOf('const pickerControlsFeature = wirePickerControlsFeature(assembly');
assert.ok(pickerControlsFeatureIndex !== -1, 'app.js must register the picker-controls feature');
assert.equal(
    appScript.indexOf('registerPickerControlsShellFeature('),
    -1,
    'app.js must not register the pass-through picker-controls shell feature'
);

const dataIoFeatureIndex = appScript.indexOf('const dataIoFeatureProxy = wireDataIoFeature(assembly');
assert.ok(dataIoFeatureIndex !== -1, 'app.js must register the data-io feature inside the lazy loader');
assert.equal(
    appScript.indexOf('registerDataIoShellFeature('),
    -1,
    'app.js must not register the pass-through data-io shell feature'
);

const metadataModalsFeatureIndex = appScript.indexOf('const metadataModalsFeatureProxy = wireMetadataModalsFeature(assembly');
assert.ok(metadataModalsFeatureIndex !== -1, 'app.js must register the metadata-modals feature inside the lazy loader');
assert.equal(
    appScript.indexOf('registerMetadataModalsShellFeature('),
    -1,
    'app.js must not register the pass-through metadata-modals shell feature'
);

const orchestrationFeatureIndex = appScript.indexOf('orchestrationFeature = wireOrchestrationFeature(assembly');
assert.ok(orchestrationFeatureIndex !== -1, 'app.js must register the orchestration feature');
assert.equal(
    appScript.indexOf('registerOrchestrationShellFeature('),
    -1,
    'app.js must not register the pass-through orchestration shell feature'
);

const dropdownsFeatureIndex = appScript.indexOf('const dropdownsFeature = wireDropdownsFeature(assembly');
assert.ok(dropdownsFeatureIndex !== -1, 'app.js must register the dropdowns feature');
assert.equal(
    appScript.indexOf('registerDropdownsShellFeature('),
    -1,
    'app.js must not register the pass-through dropdowns shell feature'
);

const universalModalFeatureIndex = appScript.indexOf('universalModalFeature = wireUniversalModalFeature(assembly');
assert.ok(universalModalFeatureIndex !== -1, 'app.js must register the universal-modal feature');
assert.equal(
    appScript.indexOf('registerUniversalModalShellFeature('),
    -1,
    'app.js must not register the pass-through universal-modal shell feature'
);

const quickAddFeatureIndex = appScript.indexOf('quickAddFeature = wireQuickAddFeature(assembly');
assert.ok(quickAddFeatureIndex !== -1, 'app.js must register the quick-add feature');
assert.equal(
    appScript.indexOf('registerQuickAddShellFeature('),
    -1,
    'app.js must not register the pass-through quick-add shell feature'
);

const historyFeatureIndex = appScript.indexOf('historyFeature = wireHistoryFeature(assembly');
assert.ok(historyFeatureIndex !== -1, 'app.js must register the history feature');
assert.equal(
    appScript.indexOf('registerHistoryShellFeature('),
    -1,
    'app.js must not register the pass-through history shell feature'
);

const sessionFeatureIndex = appScript.indexOf('sessionFeature = wireSessionFeature(assembly');
assert.ok(sessionFeatureIndex !== -1, 'app.js must register the session feature');
assert.equal(
    appScript.indexOf('registerSessionShellFeature('),
    -1,
    'app.js must not register the pass-through session shell feature'
);

const avatarCropFeatureIndex = appScript.indexOf('const avatarCropFeatureProxy = wireAvatarCropFeature(assembly');
assert.ok(avatarCropFeatureIndex !== -1, 'app.js must lazily wire the avatar-crop feature');
assert.equal(
    appScript.indexOf('registerAvatarCropShellFeature('),
    -1,
    'app.js must not register the pass-through avatar-crop shell feature'
);

const scheduleInteractionsFeatureIndex = appScript.indexOf('const scheduleInteractionsFeature = wireScheduleInteractionsFeature(assembly');
assert.ok(scheduleInteractionsFeatureIndex !== -1, 'app.js must register the schedule-interactions feature');
assert.doesNotMatch(
    appScript,
    /from\s+['"]\.\/features\/schedule-interactions-shell\.js['"]|registerScheduleInteractionsShellFeature\(|scheduleInteractionsShellFeature/,
    'app.js must not import, register, or keep the pass-through schedule-interactions shell feature'
);

const sidebarStatsFeatureIndex = appScript.indexOf('const sidebarStatsFeature = wireSidebarStatsFeature(assembly');
assert.ok(sidebarStatsFeatureIndex !== -1, 'app.js must register the sidebar-stats feature');
assert.equal(
    appScript.indexOf('registerSidebarStatsShellFeature('),
    -1,
    'app.js must not register the pass-through sidebar-stats shell feature'
);

const scheduleDeletionFeatureIndex = appScript.indexOf('const scheduleDeletionFeatureProxy = wireScheduleDeletionFeature(assembly');
assert.ok(scheduleDeletionFeatureIndex !== -1, 'app.js must lazily register the schedule-deletion feature');
assert.equal(
    appScript.indexOf('registerScheduleDeletionShellFeature('),
    -1,
    'app.js must not register the pass-through schedule-deletion shell feature'
);

const taskEditorFeatureIndex = appScript.indexOf('const taskEditorFeatureProxy = wireTaskEditorFeature(assembly');
assert.ok(taskEditorFeatureIndex !== -1, 'app.js must lazily register the task-editor feature');
assert.equal(
    appScript.indexOf('registerTaskEditorShellFeature('),
    -1,
    'app.js must not register the pass-through task-editor shell feature'
);

const splitTaskFeatureIndex = appScript.indexOf('splitTaskFeature = wireSplitTaskFeature(assembly');
assert.ok(splitTaskFeatureIndex !== -1, 'app.js must register the split-task feature');
assert.equal(
    appScript.indexOf('registerSplitTaskShellFeature('),
    -1,
    'app.js must not register the pass-through split-task shell feature'
);

const mobileTouchFeatureIndex = appScript.indexOf('const mobileTouchFeatureProxy = wireMobileTouchFeature(assembly');
assert.ok(mobileTouchFeatureIndex !== -1, 'app.js must lazily register the mobile-touch feature');
assert.match(
    mobileTouchFeatureLoaderModule,
    /export function createMobileTouchFeatureLoader\(\{[\s\S]*importMobileTouchFeature\s*=\s*\(\)\s*=>\s*import\(['"]\.\.\/features\/mobile-touch\.js['"]\),[\s\S]*\}\s*=\s*\{\}\)\s*\{/,
    'mobile-touch feature loader service must expose a factory for low-frequency mobile touch wiring'
);
assert.match(
    mobileTouchFeatureLoaderModule,
    /importMobileTouchFeature\(\)[\s\S]*registerMobileTouchFeature/,
    'mobile-touch feature loader service must own the dynamic mobile-touch feature import'
);

{
    let importCount = 0;
    const expectedRegisterMobileTouchFeature = () => ({ registered: true });
    const loadMobileTouchFeature = createMobileTouchFeatureLoader({
        importMobileTouchFeature: async () => {
            importCount += 1;
            return { registerMobileTouchFeature: expectedRegisterMobileTouchFeature };
        },
    });

    assert.equal(importCount, 0, 'mobile-touch feature loader factory must not import the feature during bootstrap');
    assert.equal(
        await loadMobileTouchFeature(),
        expectedRegisterMobileTouchFeature,
        'mobile-touch feature loader must resolve the injected feature registration function when invoked'
    );
    assert.equal(importCount, 1, 'mobile-touch feature loader must defer importing until the returned loader is invoked');
    assert.throws(
        () => createMobileTouchFeatureLoader({ importMobileTouchFeature: null }),
        /createMobileTouchFeatureLoader requires an importMobileTouchFeature function/,
        'mobile-touch feature loader should fail clearly when no feature importer is available'
    );
}

assertAppFeatureLoadersRegistry({
    factoryName: 'createMobileTouchFeatureLoader',
    loaderName: 'loadMobileTouchRegistration',
    appConsumerName: 'wireMobileTouchFeature',
    modulePath: 'mobile-touch-feature-loader.js',
    label: 'mobile-touch feature',
});
assert.doesNotMatch(
    appScript,
    /import\(['"]\.\/features\/mobile-touch\.js['"]\)/,
    'app.js must not retain the direct dynamic mobile-touch feature import after loader extraction'
);
assert.doesNotMatch(
    appScript,
    /import\(['"]\.\/features\/mobile-touch-shell\.js['"]\)|registerMobileTouchShellFeature\(|mobileTouchShellFeature|withMobileTouchShellFeature/,
    'app.js must not import, register, or keep the pass-through mobile-touch shell feature'
);

assert.doesNotMatch(
    appScript,
    /registerMobileSliderAutoHide(?:Shell)?Feature\(/,
    'app.js should not register the unused mobile-slider-auto-hide feature or shell'
);

const desktopResizeFeatureIndex = appScript.indexOf('const desktopResizeFeatureProxy = wireDesktopResizeFeature(assembly');
assert.ok(desktopResizeFeatureIndex !== -1, 'app.js must lazily register the desktop-resize feature');
assert.equal(
    appScript.indexOf('registerDesktopResizeShellFeature('),
    -1,
    'app.js must not register the pass-through desktop-resize shell feature'
);

const poolInteractionsFeatureIndex = appScript.indexOf('const poolInteractionsFeature = wirePoolInteractionsFeature(assembly');
assert.ok(poolInteractionsFeatureIndex !== -1, 'app.js must register the pool-interactions feature');
assert.equal(
    appScript.indexOf('registerPoolInteractionsShellFeature('),
    -1,
    'app.js must not register the pass-through pool-interactions shell feature'
);

const globalKeyboardFeatureIndex = appScript.indexOf('const globalKeyboardFeature = wireGlobalKeyboardFeature(assembly');
assert.ok(globalKeyboardFeatureIndex !== -1, 'app.js must register the global-keyboard feature');
assert.equal(
    appScript.indexOf('registerGlobalKeyboardShellFeature('),
    -1,
    'app.js must not register the pass-through global-keyboard shell feature'
);

const appRuntimeFeatureIndex = appScript.indexOf('const appRuntimeFeature = wireAppRuntimeFeature(assembly');
assert.ok(appRuntimeFeatureIndex !== -1, 'app.js must register the app-runtime feature');
assert.equal(
    appScript.indexOf('registerAppRuntimeShellFeature('),
    -1,
    'app.js must not register the pass-through app-runtime shell feature'
);

const nameLookupFeatureIndex = appScript.indexOf('nameLookupFeature = wireNameLookupFeature(assembly');
assert.ok(nameLookupFeatureIndex !== -1, 'app.js must register the name-lookup feature');
assert.equal(
    appScript.indexOf('registerNameLookupShellFeature('),
    -1,
    'app.js must not register the pass-through name-lookup shell feature'
);

const mobileUiFeatureIndex = appScript.indexOf('mobileUiFeature = wireMobileUiFeature(assembly');
assert.ok(mobileUiFeatureIndex !== -1, 'app.js must register the mobile-ui feature');
assert.equal(
    appScript.indexOf('registerMobileUiShellFeature('),
    -1,
    'app.js must not register the pass-through mobile-ui shell feature'
);

assert.doesNotMatch(
    appScript,
    /import\s+\{\s*registerTourFeature\s*\}\s+from\s+['"]\.\/features\/tour\.js['"]/,
    'app.js must not statically import the onboarding tour feature into the initial graph'
);
assert.doesNotMatch(
    appScript,
    /import\s*\(['"]\.\/features\/tour-shell\.js['"]\)|registerTourShellFeature\(/,
    'app.js must not import or register the pass-through onboarding tour shell'
);
assert.match(
    tourFeatureLoaderModule,
    /export function createTourFeatureLoader\(\{[\s\S]*importTourFeature\s*=\s*\(\)\s*=>\s*import\(['"]\.\.\/features\/tour\.js['"]\),[\s\S]*\}\s*=\s*\{\}\)\s*\{/,
    'tour feature loader service must expose a factory for low-frequency onboarding tour wiring'
);
assert.match(
    tourFeatureLoaderModule,
    /importTourFeature\(\)[\s\S]*registerTourFeature/,
    'tour feature loader service must own the dynamic onboarding tour feature import'
);

{
    let importCount = 0;
    const expectedRegisterTourFeature = () => ({ registered: true });
    const loadTourFeature = createTourFeatureLoader({
        importTourFeature: async () => {
            importCount += 1;
            return { registerTourFeature: expectedRegisterTourFeature };
        },
    });

    assert.equal(importCount, 0, 'tour feature loader factory must not import the feature during bootstrap');
    assert.equal(
        await loadTourFeature(),
        expectedRegisterTourFeature,
        'tour feature loader must resolve the injected feature registration function when invoked'
    );
    assert.equal(importCount, 1, 'tour feature loader must defer importing until the returned loader is invoked');
    assert.throws(
        () => createTourFeatureLoader({ importTourFeature: null }),
        /createTourFeatureLoader requires an importTourFeature function/,
        'tour feature loader should fail clearly when no feature importer is available'
    );
}

assertAppFeatureLoadersRegistry({
    factoryName: 'createTourFeatureLoader',
    loaderName: 'loadTourFeature',
    appConsumerName: 'wireTourFeature',
    modulePath: 'tour-feature-loader.js',
    label: 'tour feature',
});
assert.doesNotMatch(
    appScript,
    /import\(['"]\.\/features\/tour\.js['"]\)/,
    'app.js must not retain the direct dynamic onboarding tour import after loader extraction'
);
assert.match(
    appScript,
    /const\s+tourFeatureProxy\s*=\s*wireTourFeature\(assembly\)/,
    'app.js must register the onboarding tour through the shared lazy loader proxy'
);
assert.match(
    appScript,
    /const\s+startTour\s*=\s*tourFeatureProxy\.method\('startTour'\);/,
    'app.js must expose startTour through the shared lazy tour feature proxy'
);
assert.match(
    appScript,
    /const\s+mountTourAutostart\s*=\s*tourFeatureProxy\.method\('mountTourAutostart'\);[\s\S]*if\s*\(!storageService\.getItem\(['"]musche_tour_seen['"]\)\)\s*\{\s*mountTourAutostart\(\);/s,
    'app.js must avoid importing the onboarding tour module on mount after the tour has already been seen'
);
assert.doesNotMatch(
    appScript,
    /tourFeaturePromise|getTourFeature/,
    'app.js must not keep hand-rolled tour lazy proxy variables'
);

assert.doesNotMatch(
    appScript,
    /import\s+\{\s*registerMusicianScheduledStatsFeature\s*\}\s+from\s+['"]\.\/features\/musician-scheduled-stats\.js['"]/,
    'app.js must not statically import unused musician-scheduled-stats into the initial graph'
);
assert.doesNotMatch(
    appScript,
    /import\s+\{\s*registerMusicianScheduledStatsShellFeature\s*\}\s+from\s+['"]\.\/features\/musician-scheduled-stats-shell\.js['"]/,
    'app.js must not statically import unused musician-scheduled-stats-shell into the initial graph'
);
assert.doesNotMatch(
    appScript,
    /registerMusicianScheduledStats(?:Shell)?Feature\(/,
    'app.js should not register musician-scheduled-stats until a component consumes that surface'
);

assertSettingsStateBoundary({ createDefaultSettings, createSettingsState, vueReactive });
assertDataIoStateBoundary({ createDataIoState, vueRef, vueReactive, vueShallowRef });
assertImportDataStateBoundary({ createImportDataState, vueComputed, vueReactive });
assertMetadataModalStateBoundary({ createMetadataModalState, vueRef, vueReactive, vueShallowRef });

assertRootAppStateBoundary({ createAppState, vueRef, vueReactive });

const usesRuntimeDomTemplate = /@click|v-if|v-for|:class|\{\{/.test(indexHtml);
if (usesRuntimeDomTemplate) {
    assert.match(
        viteConfig,
        /alias\s*:\s*\{[\s\S]*\bvue\b\s*:\s*['"]vue\/dist\/vue\.esm-bundler\.js['"][\s\S]*\}/,
        'vite.config.mjs must alias vue to the compiler-included build when app/index.html uses runtime DOM templates'
    );
    for (const [flagName, expectedValue] of [
        ['__VUE_OPTIONS_API__', true],
        ['__VUE_PROD_DEVTOOLS__', false],
        ['__VUE_PROD_HYDRATION_MISMATCH_DETAILS__', false],
    ]) {
        assert.match(
            viteConfig,
            new RegExp(`${flagName}\\s*:\\s*${expectedValue}`),
            `vite.config.mjs must define Vue feature flag ${flagName} to avoid esm-bundler runtime warnings`
        );
    }
}

assert.match(
    appHeaderComponent,
    /class="menu-shortcuts-dropdown custom-dropdown-menu/,
    'app-header component must tag the top-left shortcuts menu with a dedicated class'
);

assert.match(
    componentsCss,
    /\.menu-shortcuts-dropdown\s*\{[\s\S]*min-width:\s*12rem[\s\S]*\}/,
    'components.css must give the top-left shortcuts dropdown a fixed minimum width so it does not collapse to button width'
);

assert.doesNotMatch(
    componentsCss,
    /\.modal-overlay\s*\{[^}]*z-index\s*:/,
    'modal-overlay must not set z-index with normal class specificity because it overrides explicit z-[...] overlay layers'
);

assert.match(
    componentsCss,
    /:where\(\.modal-overlay\)\s*\{[^}]*z-index\s*:\s*9999/,
    'modal-overlay must use a low-specificity default z-index so explicit z-[...] classes can layer above or below it'
);

assert.match(
    appMobileTaskInputComponent,
    /v-if="showMobileTaskInput"\s+class="modal-overlay z-\[1000\]"/,
    'mobile new-task overlay must stay below stacked dialogs such as quick-add, input, and confirm modals'
);
assert.match(
    appQuickAddModalComponent,
    /v-if="showQuickAddModal"\s+class="modal-overlay z-\[2000\]"/,
    'quick-add modal must layer above the mobile new-task overlay'
);
assert.match(
    appInputModalComponent,
    /v-if="showInputModal"\s+class="modal-overlay z-\[10000\]"/,
    'input modal must layer above the mobile new-task overlay'
);
assert.match(
    appConfirmModalComponent,
    /v-if="showConfirmModal"\s+class="modal-overlay z-\[9999\]"/,
    'confirm and alert modal must layer above the mobile new-task overlay'
);

assert.match(
    appHeaderComponent,
    /class="desktop-search-shell hidden sm:flex items-center relative[\s\S]*fa-magnifying-glass absolute left-3\.5[\s\S]*class="desktop-search-input glass-input h-9 pr-8/,
    'app-header component desktop search input must use dedicated classes so the icon and placeholder text spacing can be controlled independently of shared glass-input styles'
);

assert.match(
    appEditModalComponent,
    /<div class="space-y-4 text-sm flex-1 min-h-0 pr-1 custom-scrollbar edit-event-scroll-area" :class="\{ 'overflow-visible': activeDropdown && activeDropdown\.startsWith\('edit_'\), 'overflow-y-auto': !activeDropdown \|\| !activeDropdown\.startsWith\('edit_'\) \}">/,
    'Edit Event body must stop clipping edit dropdowns while a dropdown is open'
);

assert.match(
    searchFeature,
    /const\s+filteredScheduledTasks\s*=\s*computed\(/,
    'search feature must own scheduled-task search filtering'
);

assert.match(
    searchFeature,
    /const\s+getFullSearchText\s*=/,
    'search feature must own full-text schedule search text assembly'
);

assert.match(
    searchFeature,
    /const\s+smartMatch\s*=/,
    'search feature must own smart schedule search matching'
);

assert.match(
    searchFeatureRegistrarModule,
    /import \{ registerSearchFeature \} from '\.\.\/features\/search\.js';/,
    'search feature registrar must own the Search feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createSearchFeatureRegistrar',
    registerName: 'wireSearchFeature',
    modulePath: 'search-feature-registrar.js',
    label: 'Search',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerSearchFeature \} from '\.\/features\/search\.js';/,
    'app.js should not directly import Search after registrar extraction'
);

assert.doesNotMatch(
    appScript,
    /from 'pinyin-pro'/,
    'app.js must not statically import pinyin-pro into the initial module graph'
);

assertAppFeatureLoadersRegistry({
    factoryName: 'createImportDataDependencyLoader',
    loaderName: 'loadImportDataFeature',
    appConsumerName: 'wireImportDataFeature',
    modulePath: 'import-data-dependency-loader.js',
    label: 'import-data dependency',
});

assert.match(
    appSupportLoadersModule,
    /import\s+\{\s*createMidiSmfLoader\s*\}\s+from\s+['"]\.\/midi-smf-loader\.js['"]/,
    'app support loader registry should import the MIDI SMF loader service'
);

assert.match(
    appDependenciesModule,
    /createAppFeatureLoaders\(\{[\s\S]*midiSmfSupport:\s*supportLoaders\.loadMidiSmf[\s\S]*\}\)/,
    'app dependencies should inject MIDI SMF support into the import-data feature loader registry'
);

assert.match(
    appFeatureLoadersModule,
    /createImportDataDependencyLoader\(\{\s*loadMidiSmf:\s*midiSmfSupport\s*\}\)/,
    'app feature loader registry should keep MIDI SMF support inside the import-data dependency loader'
);

assert.doesNotMatch(
    appSupportLoadersModule,
    /loadImportDataDependencies|createImportDataDependencyLoader/,
    'app support loader registry should not expose import-data feature wiring to app.js'
);

assert.doesNotMatch(
    appScript,
    /\bloadMidiSmf\b[\s\S]*=\s*createAppDependencies\(\);/,
    'app.js should not unpack import-data-only MIDI SMF support from the root dependency registry'
);

assert.match(
    appSupportLoadersModule,
    /import\s+\{\s*createXlsxLoader\s*\}\s+from\s+['"]\.\/xlsx-loader\.js['"]/,
    'app support loader registry should import the XLSX loader service'
);

assert.match(
    appSupportLoadersModule,
    /loadXlsx:\s*createXlsxLoader\(\)/,
    'app support loader registry should create XLSX support for data I/O'
);

assert.match(
    appDependenciesModule,
    /createAppFeatureLoaders\(\{[\s\S]*xlsxSupport:\s*supportLoaders\.loadXlsx[\s\S]*\}\)/,
    'app dependencies should inject XLSX support into the feature loader registry'
);

assert.match(
    appFeatureLoadersModule,
    /createDataIoFeatureLoader\(\{\s*loadXlsx:\s*xlsxSupport\s*\}\)/,
    'app feature loader registry should pass XLSX support to the data I/O feature loader'
);

assert.doesNotMatch(
    appScript,
    /\bloadXlsx\b[\s\S]*=\s*createAppDependencies\(\);/,
    'app.js should not unpack data-I/O-only XLSX support from the root dependency registry'
);

assert.match(
    appSupportLoadersModule,
    /import\s+\{\s*createCropperLoader\s*\}\s+from\s+['"]\.\/cropper-loader\.js['"]/,
    'app support loader registry should import the Cropper loader service'
);

assert.match(
    appSupportLoadersModule,
    /loadCropper:\s*createCropperLoader\(\)/,
    'app support loader registry should create Cropper support for avatar crop'
);

assert.match(
    appDependenciesModule,
    /createAppFeatureLoaders\(\{[\s\S]*cropperSupport:\s*supportLoaders\.loadCropper[\s\S]*\}\)/,
    'app dependencies should inject Cropper support into the feature loader registry'
);

assert.match(
    appFeatureLoadersModule,
    /createAvatarCropFeatureLoader\(\{\s*loadCropper:\s*cropperSupport\s*\}\)/,
    'app feature loader registry should pass Cropper support to the avatar crop feature loader'
);

assert.doesNotMatch(
    appScript,
    /\bloadCropper\b[\s\S]*=\s*createAppDependencies\(\);/,
    'app.js should not unpack avatar-crop-only Cropper support from the root dependency registry'
);

assert.match(
    appSupportLoadersModule,
    /import\s+\{\s*createPinyinMatchLoader\s*\}\s+from\s+['"]\.\/pinyin-match-loader\.js['"]/,
    'app support loader registry should import the pinyin match loader service'
);

assert.match(
    appSupportLoadersModule,
    /pinyinMatchSupport:\s*createPinyinMatchLoader\(\{\s*ref\s*\}\)/,
    'app support loader registry should keep pinyin match ref and loader grouped as search pinyin support'
);

assert.match(
    appDependenciesModule,
    /const\s+supportLoaders\s*=\s*createAppSupportLoaders\(\{\s*ref:\s*vueRuntime\.ref\s*\}\);/,
    'app dependencies should create support loaders once before injecting registrar-private dependencies'
);

assert.match(
    appDependenciesModule,
    /createAppFeatureRegistrars\(\{[\s\S]*pinyinMatchSupport:\s*supportLoaders\.pinyinMatchSupport[\s\S]*\}\)/,
    'app dependencies should inject search pinyin support into the feature registrar registry'
);

assert.match(
    appFeatureRegistrarsModule,
    /createSearchFeatureRegistrar\(\{\s*pinyinMatchSupport\s*\}\)/,
    'app feature registrar registry should pass pinyin support to the search registrar'
);

assert.doesNotMatch(
    appScript,
    /\b(pinyinMatch|loadPinyinMatch)\b[\s\S]*=\s*createAppDependencies\(\);/,
    'app.js should not unpack search-only pinyin support from the root dependency registry'
);

assert.match(
    pinyinMatchLoaderModule,
    /export function createPinyinMatchLoader\(\{ ref \}\)\s*\{/,
    'pinyin match loader service must expose a factory that owns the match ref'
);

assert.match(
    pinyinMatchLoaderModule,
    /const\s+pinyinMatch\s*=\s*ref\(null\);[\s\S]*let\s+pinyinMatchPromise;/,
    'pinyin match loader service must own the pinyin match ref and promise cache'
);

assert.match(
    pinyinMatchLoaderModule,
    /import\(['"]pinyin-pro['"]\)\.then\(\(\{ match \}\)\s*=>\s*\{/,
    'pinyin match loader service must own the dynamic pinyin-pro import'
);

assert.match(
    pinyinMatchLoaderModule,
    /return\s+\{\s*pinyinMatch,\s*loadPinyinMatch,\s*\};/,
    'pinyin match loader service must expose the match ref and loader'
);
{
    const pinyinMatchLoader = createPinyinMatchLoader({ ref: vueRef });
    assert.equal(pinyinMatchLoader.pinyinMatch.value, null, 'pinyin match loader must default the match ref to null before loading');
    assert.equal(typeof pinyinMatchLoader.loadPinyinMatch, 'function', 'pinyin match loader must expose a callable loader');
    assert.throws(
        () => createPinyinMatchLoader({}),
        /createPinyinMatchLoader requires Vue ref factory/,
        'pinyin match loader should fail clearly when Vue ref is missing'
    );
}

assert.doesNotMatch(
    appScript,
    /import\(['"]pinyin-pro['"]\)|let\s+pinyinMatchPromise;/,
    'app.js must not retain the direct pinyin-pro dynamic import or promise cache after pinyin loader extraction'
);

assert.match(
    searchFeature,
    /ensurePinyinMatch/,
    'search feature must trigger the lazy pinyin-pro loader when a search query needs smart matching'
);

assert.match(
    searchFeature,
    /const\s+getNameWithGroup\s*=\s*\(id,\s*type\)\s*=>/,
    'search feature must own search name-with-group text lookup'
);

for (const leakedRootReturnField of [
    'getFullSearchText',
    'smartMatch',
]) {
    assert.doesNotMatch(
        rootSetupReturnObject,
        new RegExp(`\\b${leakedRootReturnField}\\b`),
        `app.js root setup return should keep search helper ${leakedRootReturnField} inside the search feature instead of the root return`
    );
}

assert.match(
    appScript,
    /const\s+\{\s*filteredScheduledTasks,[\s\S]{0,320}handleTrackListSearchAction,\s*\}\s*=\s*searchFeature;/,
    'app.js must expose search values directly from the search feature'
);

assert.match(
    appScript,
    /const\s+getNameWithGroup\s*=\s*\(\.\.\.args\)\s*=>\s*searchFeature\.getNameWithGroup\(\.\.\.args\);/,
    'app.js must keep the early getNameWithGroup proxy pointed directly at the search feature'
);

assert.doesNotMatch(
    appScript,
    /from\s+['"]\.\/features\/search-shell\.js['"]|registerSearchShellFeature\(/,
    'app.js must not import or register the pass-through search shell feature'
);

assert.doesNotMatch(
    appScript,
    /const\s+filteredScheduledTasks\s*=\s*computed\(|const\s+getFullSearchText\s*=\s*\(task,\s*groupName\)\s*=>|const\s+smartMatch\s*=\s*\(text,\s*keyword\)\s*=>|const\s+getNameWithGroup\s*=\s*\(id,\s*type\)\s*=>\s*\{\s*if\s*\(!id\) return '';|const\s+filteredScheduledTasks\s*=\s*searchFeature\.filteredScheduledTasks|const\s+filteredSidebarList\s*=\s*searchFeature\.filteredSidebarList|const\s+getFullSearchText\s*=\s*searchFeature\.getFullSearchText|const\s+smartMatch\s*=\s*searchFeature\.smartMatch|const\s+handleSearchEnter\s*=\s*searchFeature\.handleSearchEnter|const\s+handleSearchBlur\s*=\s*searchFeature\.handleSearchBlur|const\s+onSearchFocus\s*=\s*searchFeature\.onSearchFocus|const\s+handleTrackListSearchAction\s*=\s*searchFeature\.handleTrackListSearchAction/,
    'app.js should not retain scheduled-task search filtering, smart matching, name-with-group lookup bodies, or one-off search feature property aliases after search extraction'
);

assert.match(
    nameLookupFeature,
    /export function registerNameLookupFeature/,
    'name-lookup feature must expose a registration function for shared setting-name lookup'
);

assert.match(
    nameLookupFeatureRegistrarModule,
    /import \{ registerNameLookupFeature \} from '\.\.\/features\/name-lookup\.js';/,
    'name-lookup feature registrar must own the name-lookup feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createNameLookupFeatureRegistrar',
    registerName: 'wireNameLookupFeature',
    modulePath: 'name-lookup-feature-registrar.js',
    label: 'name-lookup',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerNameLookupFeature \} from '\.\/features\/name-lookup\.js';/,
    'app.js should not directly import name-lookup after registrar extraction'
);

assert.match(
    nameLookupFeature,
    /const\s+getNameById\s*=\s*\(id,\s*type\)\s*=>/,
    'name-lookup feature must own id-to-name lookup'
);

assert.doesNotMatch(
    appScript,
    /const\s+getNameById\s*=\s*\(id,\s*type\)\s*=>\s*\{\s*if\s*\(!id\) return '未选择';[\s\S]*?const item = list\.find\(i => i\.id == id\);[\s\S]*?return item \? item\.name :/,
    'app.js should not retain id-to-name lookup body after name-lookup extraction'
);

assert.match(
    appScript,
    /const\s+getNameById\s*=\s*\(\.\.\.args\)\s*=>\s*nameLookupFeature\.getNameById\(\.\.\.args\)/,
    'app.js may consume the name-lookup feature getNameById surface directly because name-lookup-shell is a pass-through boundary'
);

assert.match(
    ratioFeature,
    /export function registerRatioFeature/,
    'ratio feature must expose a registration function for default and inherited task ratios'
);

assert.match(
    ratioFeatureRegistrarModule,
    /import \{ registerRatioFeature \} from '\.\.\/features\/ratio\.js';/,
    'ratio feature registrar must own the ratio feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createRatioFeatureRegistrar',
    registerName: 'wireRatioFeature',
    modulePath: 'ratio-feature-registrar.js',
    label: 'ratio',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerRatioFeature \} from '\.\/features\/ratio\.js';/,
    'app.js should not directly import ratio after registrar extraction'
);

assert.match(
    ratioFeature,
    /const\s+getDefaultRatio\s*=/,
    'ratio feature must own default ratio lookup'
);

assert.match(
    ratioFeature,
    /const\s+calculateEstTime\s*=/,
    'ratio feature must own estimated duration calculation'
);

assert.match(
    ratioFeature,
    /const\s+getTaskRatio\s*=/,
    'ratio feature must own inherited task ratio lookup'
);

assert.match(
    ratioFeature,
    /const\s+isDefaultRatio\s*=/,
    'ratio feature must own default-ratio display checks'
);

assert.match(
    ratioFeature,
    /const\s+autoUpdateEfficiency\s*=\s*\(targetId,\s*viewType,\s*shouldPushHistory\s*=\s*true\)\s*=>/,
    'ratio feature must own automatic efficiency/default-ratio recalculation'
);

assert.match(
    ratioFeature,
    /const\s+ensureItemRecords\s*=\s*\(item\)\s*=>/,
    'ratio feature must own task record and ratio initialization'
);

assert.match(
    ratioFeature,
    /const\s+cleanOldRatios\s*=\s*\(\)\s*=>/,
    'ratio feature must own legacy x20 ratio cleanup'
);

for (const leakedRootReturnField of [
    'getTaskRatio',
    'cleanOldRatios',
]) {
    assert.doesNotMatch(
        rootSetupReturnObject,
        new RegExp(`\\b${leakedRootReturnField}\\b`),
        `app.js root setup return should expose ratio helper ${leakedRootReturnField} through ratio shell/component contexts instead of the root return`
    );
}

assert.match(
    ratioFeatureRegistrarModule,
    /registerRatioFeature\(\{[\s\S]{0,800}musicianStats:\s*\{\s*get value\(\)\s*\{\s*return assembly\.refs\.musicianStats\.value;\s*\}\s*\}/,
    'ratio registrar must inject musicianStats into ratio feature lazily so setup does not read it before sidebar stats initialization'
);

assert.match(
    appScript,
    /const\s+\{[\s\S]*\bensureItemRecords\b[\s\S]*\bgetDefaultRatio\b[\s\S]*\bcalculateEstTime\b[\s\S]*\bgetTaskRatio\b[\s\S]*\bcalculateSingleRatio\b[\s\S]*\bisDefaultRatio\b[\s\S]*\bautoUpdateEfficiency\b[\s\S]*\bcleanOldRatios\b[\s\S]*\}\s*=\s*ratioFeature;/,
    'app.js may consume the ratio feature helper surface directly because ratio-shell is a pass-through boundary'
);

assert.doesNotMatch(
    ratioFeatureRegistrarModule,
    /registerRatioFeature\(\{[\s\S]{0,800}currentSessionId,\s*musicianStats,/,
    'ratio registrar must not inject musicianStats directly into ratio feature before sidebar stats initialization'
);

assert.doesNotMatch(
    appScript,
    /const\s+getDefaultRatio\s*=\s*\(id,\s*type\s*=\s*'musician'\)\s*=>\s*\{|const\s+calculateEstTime\s*=\s*\(d,\s*r\)\s*=>|const\s+getTaskRatio\s*=\s*\(item,\s*contextType\s*=\s*null\)\s*=>\s*\{|const\s+isDefaultRatio\s*=\s*\(item\)\s*=>\s*\{|const\s+autoUpdateEfficiency\s*=\s*\(targetId,\s*viewType,\s*shouldPushHistory\s*=\s*true\)\s*=>\s*\{|const\s+ensureItemRecords\s*=\s*\(item\)\s*=>\s*\{|const\s+cleanOldRatios\s*=\s*\(\)\s*=>\s*\{|const\s+ensureItemRecords\s*=\s*ratioFeature\.ensureItemRecords|const\s+getDefaultRatio\s*=\s*ratioFeature\.getDefaultRatio|const\s+calculateEstTime\s*=\s*ratioFeature\.calculateEstTime|const\s+getTaskRatio\s*=\s*ratioFeature\.getTaskRatio|const\s+isDefaultRatio\s*=\s*ratioFeature\.isDefaultRatio|const\s+autoUpdateEfficiency\s*=\s*ratioFeature\.autoUpdateEfficiency|const\s+cleanOldRatios\s*=\s*ratioFeature\.cleanOldRatios/,
    'app.js should not retain default/task ratio lookup, estimated duration, display check, auto efficiency, record initialization, cleanup bodies, or direct feature surface wiring after ratio extraction'
);

assert.doesNotMatch(
    importMidiFeature,
    /typeof JZZ|JZZ\.MIDI\.SMF/,
    'import-midi feature must not read an implicit global JZZ parser; app.js should inject the initialized parser'
);

assert.doesNotMatch(
    appScript,
    /import\s+JZZ\s+from\s+['"]jzz['"]|import\s+installJzzSmf\s+from\s+['"]jzz-midi-smf['"]/,
    'app.js must not statically import MIDI parser libraries into the initial bundle'
);

assert.ok(existsSync(midiSmfLoaderPath), 'MIDI SMF loader service must exist for low-frequency parser wiring');
assert.match(
    midiSmfLoaderModule,
    /export function createMidiSmfLoader\(\)\s*\{/,
    'MIDI SMF loader service must expose a loader factory'
);
assert.match(
    midiSmfLoaderModule,
    /import\(['"]jzz['"]\)[\s\S]*import\(['"]jzz-midi-smf['"]\)[\s\S]*import\(['"]\.\.\/utils\/midi\.js['"]\)/,
    'MIDI SMF loader service must own dynamic parser and MIDI utility imports'
);

assert.match(
    midiSmfLoaderModule,
    /installJzzSmfPlugin\(JZZ,\s*installJzzSmf\)/,
    'MIDI SMF loader service must explicitly install the JZZ SMF plugin on the imported JZZ instance'
);
assert.doesNotMatch(
    appScript,
    /import\(['"]jzz['"]\)|import\(['"]jzz-midi-smf['"]\)|installJzzSmfPlugin\(JZZ,\s*installJzzSmf\)/,
    'app.js should not retain MIDI parser dynamic imports or plugin installation after loader service extraction'
);

assert.match(
    importDataFeature,
    /loadMidiSmf:\s*actions\.loadMidiSmf/,
    'import-data feature must pass the injected MIDI parser loader into MIDI import'
);

assert.match(
    importMidiFeature,
    /await\s+loadMidiSmf\(\)/,
    'import-midi feature must load the MIDI parser lazily while processing a selected file'
);

assert.match(
    scheduleFeature,
    /function\s+hasRecordingInfo\(/,
    'schedule feature must own schedule recording/edit info presence checks'
);

assert.match(
    scheduleFeature,
    /function\s+moveTask\(task,\s*direction\)/,
    'schedule feature must own keyboard/directional schedule task movement'
);

assert.match(
    scheduleFeature,
    /function\s+getOverlapCount\(targetTask\)/,
    'schedule feature must own schedule overlap count calculation'
);

assert.match(
    scheduleFeature,
    /function\s+getMins\(timeStr\)/,
    'schedule feature must own HH:MM minute conversion helper'
);

assert.match(
    scheduleFeature,
    /const\s+addMinutesToTime\s*=\s*\(timeStr,\s*minutes\)\s*=>/,
    'schedule feature must own settings-bounded time stepping'
);

assert.match(
    scheduleFeature,
    /const\s+scheduledTemplateIds\s*=\s*computed\(/,
    'schedule feature must own scheduled template id tracking'
);

assert.match(
    scheduleFeature,
    /const\s+isScheduled\s*=\s*\(templateId\)\s*=>/,
    'schedule feature must own pool scheduled-state checks'
);

assert.doesNotMatch(
    appScript,
    /from\s+['"]\.\/features\/schedule-shell\.js['"]|registerScheduleShellFeature\(|scheduleShellFeature/,
    'app.js must not retain the pass-through schedule shell after direct schedule feature wiring'
);

assert.doesNotMatch(
    appScript,
    /const\s+hasRecordingInfo\s*=\s*\(task\)\s*=>\s*\{|const\s+moveTask\s*=\s*\(task,\s*direction\)\s*=>\s*\{|const\s+getOverlapCount\s*=\s*\(targetTask\)\s*=>\s*\{|const\s+getMins\s*=\s*\(timeStr\)\s*=>\s*\{|const\s+addMinutesToTime\s*=\s*\(timeStr,\s*minutes\)\s*=>\s*addMinutesToTimeValue|const\s+scheduledTemplateIds\s*=\s*computed\(\(\)\s*=>\s*\{|const\s+isScheduled\s*=\s*templateId\s*=>/,
    'app.js should not retain schedule recording/edit info checks, task movement, overlap count, minute conversion, time stepping, or scheduled-state calculation after schedule extraction'
);

assert.match(
    appScript,
    /scheduleFeature\.(cleanupEmptySchedules|pruneEmptySchedules|isScheduled|autoResizeSchedules|getOverlapCount|moveTask|checkOverlap|moveDivider|getTaskStyle|getBlockTitle|isTaskGhost|hasRecordingInfo)/,
    'app.js should wire schedule helpers directly through the extracted schedule feature surface after removing the pass-through shell'
);

assert.match(
    scheduleDragDropFeature,
    /export function registerScheduleDragDropFeature/,
    'schedule-drag-drop feature must expose a registration function for schedule drag/drop behavior'
);

assert.match(
    scheduleDragDropFeature,
    /const\s+dragStart\s*=\s*\(event,\s*item,\s*source\)\s*=>/,
    'schedule-drag-drop feature must own drag start offset and ghost-image setup'
);

assert.match(
    scheduleDragDropFeature,
    /const\s+dropToSchedule\s*=\s*\(event,\s*dateStr\)\s*=>/,
    'schedule-drag-drop feature must own week-grid drop placement and conflict handling'
);

assert.match(
    scheduleDragDropFeature,
    /const\s+dropToMonth\s*=\s*\(event,\s*dateStr\)\s*=>/,
    'schedule-drag-drop feature must own month-cell drop placement and conflict handling'
);

assert.match(
    scheduleInteractionsFeature,
    /export function registerScheduleInteractionsFeature/,
    'schedule-interactions feature must expose a registration function for schedule block interactions'
);

assert.match(
    scheduleInteractionsFeature,
    /registerScheduleDragDropFeature\(/,
    'schedule-interactions feature must register schedule-drag-drop instead of app.js owning drag/drop wiring'
);

assert.match(
    scheduleInteractionsFeature,
    /registerScheduleTaskActivationFeature\(/,
    'schedule-interactions feature must register schedule-task-activation instead of app.js owning double-click wiring'
);

assert.match(
    scheduleInteractionsFeatureRegistrarModule,
    /import \{ registerScheduleInteractionsFeature \} from '\.\.\/features\/schedule-interactions\.js';/,
    'schedule-interactions feature registrar must own the Schedule Interactions feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createScheduleInteractionsFeatureRegistrar',
    registerName: 'wireScheduleInteractionsFeature',
    modulePath: 'schedule-interactions-feature-registrar.js',
    label: 'Schedule Interactions',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerScheduleInteractionsFeature \} from '\.\/features\/schedule-interactions\.js';/,
    'app.js should not directly import Schedule Interactions after registrar extraction'
);

assert.doesNotMatch(
    appScript,
    /from\s+['"]\.\/features\/schedule-interactions-shell\.js['"]|registerScheduleInteractionsShellFeature\(|scheduleInteractionsShellFeature/,
    'app.js must not retain the pass-through schedule-interactions shell after direct feature wiring'
);

assert.doesNotMatch(
    appScript,
    /registerScheduleDragDropFeature\(|registerScheduleTaskActivationFeature\(/,
    'app.js should not directly register schedule-drag-drop or schedule-task-activation after schedule-interactions extraction'
);

assert.doesNotMatch(
    appScript,
    /let\s+draggedData\s*=\s*null|const\s+dragStart\s*=\s*\(e,\s*item,\s*source\)\s*=>\s*\{|const\s+dropToPool\s*=\s*e\s*=>\s*\{|const\s+dropToSchedule\s*=\s*\(e,\s*dateStr\)\s*=>\s*\{|const\s+dropToMonth\s*=\s*\(e,\s*dateStr\)\s*=>\s*\{|const\s+handleDragEnd\s*=\s*\(e\)\s*=>\s*\{/,
    'app.js should not retain schedule drag/drop state or handler bodies after extraction'
);

assert.match(
    appScript,
    /const\s+dragStart\s*=\s*\(\.\.\.args\)\s*=>\s*scheduleInteractionsFeature\.dragStart\(\.\.\.args\)|const\s+handleDragEnd\s*=\s*\(\.\.\.args\)\s*=>\s*scheduleInteractionsFeature\.handleDragEnd\(\.\.\.args\)|const\s+dragEnterPool\s*=\s*\(\.\.\.args\)\s*=>\s*scheduleInteractionsFeature\.dragEnterPool\(\.\.\.args\)|const\s+dragLeavePool\s*=\s*\(\.\.\.args\)\s*=>\s*scheduleInteractionsFeature\.dragLeavePool\(\.\.\.args\)|const\s+dropToPool\s*=\s*\(\.\.\.args\)\s*=>\s*scheduleInteractionsFeature\.dropToPool\(\.\.\.args\)|const\s+dragEnterSlot\s*=\s*\(\.\.\.args\)\s*=>\s*scheduleInteractionsFeature\.dragEnterSlot\(\.\.\.args\)|const\s+dragLeaveSlot\s*=\s*\(\.\.\.args\)\s*=>\s*scheduleInteractionsFeature\.dragLeaveSlot\(\.\.\.args\)|const\s+dropToSchedule\s*=\s*\(\.\.\.args\)\s*=>\s*scheduleInteractionsFeature\.dropToSchedule\(\.\.\.args\)|const\s+dropToMonth\s*=\s*\(\.\.\.args\)\s*=>\s*scheduleInteractionsFeature\.dropToMonth\(\.\.\.args\)|const\s+handleTaskDblClick\s*=\s*\(\.\.\.args\)\s*=>\s*scheduleInteractionsFeature\.handleTaskDblClick\(\.\.\.args\)/,
    'app.js should wire schedule-interactions handlers directly through the extracted feature surface after removing the pass-through shell'
);

assert.match(
    scheduleTaskActivationFeature,
    /export function registerScheduleTaskActivationFeature/,
    'schedule-task-activation feature must expose a registration function for schedule task double-click behavior'
);

assert.match(
    scheduleTaskActivationFeature,
    /const\s+handleTaskDblClick\s*=\s*\(event,\s*task\)\s*=>/,
    'schedule-task-activation feature must own schedule double-click handling'
);

assert.match(
    scheduleTaskActivationFeature,
    /const\s+openTrackListForTask\s*=\s*\(task\)\s*=>/,
    'schedule-task-activation feature must own TrackList opening from a schedule block'
);

assert.doesNotMatch(
    appScript,
    /const\s+handleTaskDblClick\s*=\s*\(e,\s*task\)\s*=>\s*\{|const\s+currentSchedule\s*=\s*scheduledTasks\.value\.find\(t\s*=>\s*t\.scheduleId === task\.scheduleId\)|const\s+splitM\s*=\s*Math\.round\(\(clickY \/ pxPerMin\.value\) \/ 30\) \* 30|trackListData\.value\s*=\s*\{/,
    'app.js should not retain schedule double-click split or TrackList-opening bodies after extraction'
);

assert.match(
    trackListFeature,
    /syncTrackItemScheduleSection/,
    'track-list feature must expose a helper for syncing dragged track sections back to scheduled tasks'
);

assert.match(
    appLazyFeatureWiringsModule,
    /registerTaskEditorFeature\(\{[\s\S]{0,2200}clearPoolRecord:\s*\(\.\.\.args\)\s*=>\s*helpers\.clearPoolRecord\(\.\.\.args\)[\s\S]{0,240}clearAggregateRecords:\s*\(\.\.\.args\)\s*=>\s*helpers\.clearAggregateRecords\(\.\.\.args\)/,
    'lazy wirings must inject schedule deletion cleanup helpers into task-editor lazily because schedule-deletion registers later'
);

assert.match(
    taskEditorFeature,
    /export function registerTaskEditorFeature/,
    'task-editor feature must expose a registration function for edit modal actions'
);

assert.doesNotMatch(
    appScript,
    /import\s*\(['"]\.\/features\/task-editor-shell\.js['"]\)|registerTaskEditorShellFeature\(/,
    'app.js must not import or register the pass-through task-editor shell feature'
);

assert.match(
    taskEditorFeatureLoaderModule,
    /export function createTaskEditorFeatureLoader\(\{[\s\S]*importTaskEditorFeature\s*=\s*\(\)\s*=>\s*import\(['"]\.\.\/features\/task-editor\.js['"]\),[\s\S]*\}\s*=\s*\{\}\)\s*\{/,
    'task-editor feature loader service must expose a factory for low-frequency edit modal wiring'
);

assert.match(
    taskEditorFeatureLoaderModule,
    /importTaskEditorFeature\(\)[\s\S]*registerTaskEditorFeature/,
    'task-editor feature loader service must own the dynamic task-editor feature import'
);

{
    let importCount = 0;
    const expectedRegisterTaskEditorFeature = () => ({ registered: true });
    const loadTaskEditorFeature = createTaskEditorFeatureLoader({
        importTaskEditorFeature: async () => {
            importCount += 1;
            return { registerTaskEditorFeature: expectedRegisterTaskEditorFeature };
        },
    });

    assert.equal(importCount, 0, 'task-editor feature loader factory must not import the feature during bootstrap');
    assert.equal(
        await loadTaskEditorFeature(),
        expectedRegisterTaskEditorFeature,
        'task-editor feature loader must resolve the injected feature registration function when invoked'
    );
    assert.equal(importCount, 1, 'task-editor feature loader must defer importing until the returned loader is invoked');
    assert.throws(
        () => createTaskEditorFeatureLoader({ importTaskEditorFeature: null }),
        /createTaskEditorFeatureLoader requires an importTaskEditorFeature function/,
        'task-editor feature loader should fail clearly when no feature importer is available'
    );
}

assertAppFeatureLoadersRegistry({
    factoryName: 'createTaskEditorFeatureLoader',
    loaderName: 'loadTaskEditorFeature',
    appConsumerName: 'wireTaskEditorFeature',
    modulePath: 'task-editor-feature-loader.js',
    label: 'task-editor feature',
});

assert.doesNotMatch(
    appScript,
    /import\(['"]\.\/features\/task-editor\.js['"]\)/,
    'app.js must not retain the direct dynamic task-editor feature import after loader extraction'
);

assert.match(
    appScript,
    /const\s+taskEditorFeatureProxy\s*=\s*wireTaskEditorFeature\(assembly[\s\S]*const\s+openEditModal\s*=\s*taskEditorFeatureProxy\.method\('openEditModal'\);[\s\S]*const\s+saveEdit\s*=\s*taskEditorFeatureProxy\.method\('saveEdit'\);[\s\S]*const\s+deleteEditingItem\s*=\s*taskEditorFeatureProxy\.method\('deleteEditingItem'\);/,
    'app.js must expose task editor handlers through the shared lazy feature proxy'
);

assert.doesNotMatch(
    appScript,
    /taskEditorFeaturePromise|getTaskEditorFeature|withTaskEditorFeature/,
    'app.js must not keep hand-rolled task-editor lazy proxy variables'
);

assert.doesNotMatch(
    appScript,
    /const\s+openEditModal\s*=\s*taskEditorFeature\.openEditModal|const\s+saveEdit\s*=\s*taskEditorFeature\.saveEdit|const\s+deleteEditingItem\s*=\s*taskEditorFeature\.deleteEditingItem/,
    'app.js should not retain direct task-editor feature surface wiring after task-editor extraction'
);

assert.match(
    trackListFeature,
    /startTrackDrag/,
    'track-list feature must own row drag handlers for dragging tracks between sections'
);

assert.match(
    appLazyFeatureWiringsModule,
    /registerTrackListFeature\(\{[\s\S]{0,1600}checkCanDeleteSplit:\s*\(\.\.\.args\)\s*=>\s*helpers\.checkCanDeleteSplit\(\.\.\.args\)/,
    'lazy wirings must inject checkCanDeleteSplit into track-list lazily because split-task registers later'
);

assert.match(
    trackListFeature,
    /const\s+getSessionRatio\s*=/,
    'track-list feature must own session ratio display calculation'
);

assert.match(
    trackListFeature,
    /const\s+calculateProportionalDuration\s*=/,
    'track-list feature must own proportional duration display calculation'
);

assert.match(
    ratioFeature,
    /const\s+calculateSingleRatio\s*=/,
    'ratio feature must own the lightweight single-track efficiency calculation used by initial sidebar rendering'
);
assert.match(
    trackListFeature,
    /calculateSingleRatio\s*=\s*\(\)\s*=>\s*'-'/,
    'track-list feature must receive single-track efficiency calculation through actions so it can stay lazy-loadable'
);

assert.doesNotMatch(
    appScript,
    /let\s+trackDragState|let\s+trackDragTimer|const\s+startTrackDrag\s*=\s*\(e,\s*item\)\s*=>|const\s+getSessionRatio\s*=\s*\(\)\s*=>\s*\{|const\s+calculateProportionalDuration\s*=\s*\(item\)\s*=>\s*\{|const\s+calculateSingleRatio\s*=\s*\(item\)\s*=>\s*\{/,
    'app.js should not retain TrackList row drag state, handler bodies, or display calculation bodies after extracting track-list behavior'
);

assert.match(
    creditsFeature,
    /registerCreditsFeature/,
    'credits feature must expose a registration function for Project Credits logic'
);

assert.match(
    metadataModalsFeature,
    /export function registerMetadataModalsFeature/,
    'metadata-modals feature must expose a registration function for metadata modal composition'
);

assert.match(
    metadataModalsFeature,
    /loadCreditsFeature[\s\S]*import\('\.\/credits\.js'\)[\s\S]*registerCreditsFeature/,
    'metadata-modals feature must lazy-load credits instead of statically importing Project Credits wiring into the initial app graph'
);

assert.match(
    metadataModalsFeature,
    /loadProjectInfoFeature[\s\S]*import\('\.\/project-info\.js'\)[\s\S]*registerProjectInfoFeature/,
    'metadata-modals feature must lazy-load project-info instead of statically importing Project Info wiring into the initial app graph'
);

assert.match(
    metadataModalsFeature,
    /loadRecInfoFeature[\s\S]*import\('\.\/rec-info\.js'\)[\s\S]*registerRecInfoFeature/,
    'metadata-modals feature must lazy-load rec-info instead of statically importing Rec/Edit Info wiring into the initial app graph'
);

assert.doesNotMatch(
    metadataModalsFeature,
    /from '\.\/(?:credits|project-info|rec-info)\.js';/,
    'metadata-modals feature must not statically import low-frequency metadata modal modules after lazy registration extraction'
);

assert.match(
    metadataModalsFeature,
    /creditsFeaturePromise/,
    'metadata-modals feature must cache the lazy credits feature registration'
);

assert.match(
    metadataModalsFeature,
    /projectInfoFeaturePromise/,
    'metadata-modals feature must cache the lazy project-info feature registration'
);

assert.match(
    metadataModalsFeature,
    /recInfoFeaturePromise/,
    'metadata-modals feature must cache the lazy rec-info feature registration'
);

assert.match(
    metadataModalsFeatureLoaderModule,
    /export function createMetadataModalsFeatureLoader\(\{[\s\S]*importMetadataModalsFeature\s*=\s*\(\)\s*=>\s*import\(['"]\.\.\/features\/metadata-modals\.js['"]\),[\s\S]*\}\s*=\s*\{\}\)\s*\{/,
    'metadata-modals feature loader service must expose a factory for low-frequency metadata modal wiring'
);

assert.match(
    metadataModalsFeatureLoaderModule,
    /importMetadataModalsFeature\(\)[\s\S]*registerMetadataModalsFeature/,
    'metadata-modals feature loader service must own the dynamic metadata-modals feature import'
);

{
    let importCount = 0;
    const expectedRegisterMetadataModalsFeature = () => ({ registered: true });
    const loadMetadataModalsFeature = createMetadataModalsFeatureLoader({
        importMetadataModalsFeature: async () => {
            importCount += 1;
            return { registerMetadataModalsFeature: expectedRegisterMetadataModalsFeature };
        },
    });

    assert.equal(importCount, 0, 'metadata-modals feature loader factory must not import the feature during bootstrap');
    assert.equal(
        await loadMetadataModalsFeature(),
        expectedRegisterMetadataModalsFeature,
        'metadata-modals feature loader must resolve the injected feature registration function when invoked'
    );
    assert.equal(importCount, 1, 'metadata-modals feature loader must defer importing until the returned loader is invoked');
    assert.throws(
        () => createMetadataModalsFeatureLoader({ importMetadataModalsFeature: null }),
        /createMetadataModalsFeatureLoader requires an importMetadataModalsFeature function/,
        'metadata-modals feature loader should fail clearly when no feature importer is available'
    );
}

assertAppFeatureLoadersRegistry({
    factoryName: 'createMetadataModalsFeatureLoader',
    loaderName: 'loadMetadataModalsFeature',
    appConsumerName: 'wireMetadataModalsFeature',
    modulePath: 'metadata-modals-feature-loader.js',
    label: 'metadata-modals feature',
});

assert.doesNotMatch(
    appScript,
    /import\(['"]\.\/features\/metadata-modals\.js['"]\)/,
    'app.js must not retain the direct dynamic metadata-modals import after loader extraction'
);

assert.match(
    appScript,
    /const\s+metadataModalsFeatureProxy\s*=\s*wireMetadataModalsFeature\(assembly/,
    'app.js must register metadata-modals through the loader service instead of direct metadata modal feature wiring'
);

assert.match(
    appScript,
    /const\s+metadataModalHandlers\s*=\s*metadataModalsFeatureProxy\.methods\(\[[\s\S]*'openRecInfoModal'[\s\S]*'saveRecInfo'[\s\S]*'selectRecOption'[\s\S]*'createRecOption'[\s\S]*'addRecItem'[\s\S]*'removeRecItem'[\s\S]*'handleRecRename'[\s\S]*'openCreditModal'[\s\S]*'copyCreditText'[\s\S]*'openProjectInfoModal'[\s\S]*'saveProjectInfo'[\s\S]*\]\);/,
    'app.js must proxy metadata modal helpers through the shared lazy feature proxy'
);

assert.doesNotMatch(
    appScript,
    /metadataModalsFeaturePromise|getMetadataModalsFeature|withMetadataModalsFeature/,
    'app.js must not keep hand-rolled metadata modal lazy proxy variables'
);

assert.doesNotMatch(
    appScript,
    /registerCreditsFeature\(|registerProjectInfoFeature\(|registerRecInfoFeature\(|registerMetadataModalsShellFeature\(|import\(['"]\.\/features\/metadata-modals-shell\.js['"]\)/,
    'app.js should not directly register credits, project-info, or rec-info after metadata-modals extraction'
);

assert.doesNotMatch(
    appScript,
    /const\s+openCreditModal\s*=\s*\(\)\s*=>\s*\{\s*const\s+sessId/,
    'app.js should not retain the Project Credits generation body after extraction'
);

assert.match(
    projectInfoFeature,
    /registerProjectInfoFeature/,
    'project-info feature must expose a registration function for Project Info modal logic'
);

assert.doesNotMatch(
    appScript,
    /const\s+openProjectInfoModal\s*=\s*\(project\)\s*=>\s*\{/,
    'app.js should not retain the Project Info modal handler body after extraction'
);

assert.match(
    recInfoFeature,
    /registerRecInfoFeature/,
    'rec-info feature must expose a registration function for Rec/Edit Info modal logic'
);

assert.match(
    recInfoFeature,
    /const\s+handleRecRename\s*=\s*\(type,\s*item,\s*event\)\s*=>/,
    'rec-info feature must own recording metadata rename and merge behavior'
);

assert.doesNotMatch(
    appScript,
    /const\s+openRecInfoModal\s*=\s*\(\)\s*=>\s*\{|const\s+handleRecRename\s*=\s*\(type,\s*item,\s*event\)\s*=>\s*\{/,
    'app.js should not retain Rec/Edit Info modal handler or metadata rename bodies after extraction'
);

assert.match(
    orchestrationFeature,
    /registerOrchestrationFeature/,
    'orchestration feature must expose a registration function for roster and percussion editor logic'
);

assert.match(
    orchestrationFeatureRegistrarModule,
    /import \{ registerOrchestrationFeature \} from '\.\.\/features\/orchestration\.js';/,
    'orchestration feature registrar must own the Orchestration feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createOrchestrationFeatureRegistrar',
    registerName: 'wireOrchestrationFeature',
    modulePath: 'orchestration-feature-registrar.js',
    label: 'Orchestration',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerOrchestrationFeature \} from '\.\/features\/orchestration\.js';/,
    'app.js should not directly import Orchestration after registrar extraction'
);

assert.match(
    appScript,
    /wireOrchestrationFeature\(assembly\)/,
    'app.js must register the orchestration feature instead of owning roster and percussion editor logic'
);

assert.doesNotMatch(
    appScript,
    /from\s+['"]\.\/features\/orchestration-shell\.js['"]|registerOrchestrationShellFeature\(/,
    'app.js must not import or register the pass-through orchestration shell feature'
);

assert.match(
    appScript,
    /}\s*=\s*orchestrationFeature;\s*Object\.assign\(assembly\.helpers,[\s\S]*?\);\s*const getGroupColor/,
    'app.js must expose orchestration helpers directly from the orchestration feature'
);

assert.doesNotMatch(
    appScript,
    /const\s+activeOrchPresets\s*=\s*computed\(|const\s+parsedRoster\s*=\s*computed\(|const\s+percState\s*=\s*reactive\(|const\s+scanPercussionTags\s*=\s*\(\)\s*=>/,
    'app.js should not retain Orchestration/Roster/Percussion computed state or handler bodies after extraction'
);

assert.match(
    universalModalFeature,
    /registerUniversalModalFeature/,
    'universal-modal feature must expose a registration function for confirm/input modal helpers'
);

assert.match(
    universalModalFeatureRegistrarModule,
    /import \{ registerUniversalModalFeature \} from '\.\.\/features\/universal-modal\.js';/,
    'universal-modal feature registrar must own the Universal Modal feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createUniversalModalFeatureRegistrar',
    registerName: 'wireUniversalModalFeature',
    modulePath: 'universal-modal-feature-registrar.js',
    label: 'Universal Modal',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerUniversalModalFeature \} from '\.\/features\/universal-modal\.js';/,
    'app.js should not directly import Universal Modal after registrar extraction'
);

assert.match(
    appScript,
    /wireUniversalModalFeature\(assembly\)/,
    'app.js must register the universal-modal feature instead of owning confirm/input modal helpers directly'
);

assert.doesNotMatch(
    appScript,
    /from\s+['"]\.\/features\/universal-modal-shell\.js['"]|registerUniversalModalShellFeature\(/,
    'app.js must not import or register the pass-through universal-modal shell feature'
);

assert.match(
    appScript,
    /const\s+\{\s*openAlertModal,[\s\S]{0,320}confirmInputModal,\s*\}\s*=\s*universalModalFeature;/,
    'app.js must expose universal modal actions directly from the universal-modal feature'
);

assert.doesNotMatch(
    appScript,
    /const\s+openAlertModal\s*=\s*\(title,\s*content,\s*callback\)\s*=>|const\s+openConfirmModal\s*=\s*\(title,\s*content,\s*onConfirm|const\s+openInputModal\s*=\s*\(title,\s*initialValue,\s*placeholder|const\s+openAlertModal\s*=\s*universalModalFeature\.openAlertModal|const\s+openConfirmModal\s*=\s*universalModalFeature\.openConfirmModal|const\s+closeConfirmModal\s*=\s*universalModalFeature\.closeConfirmModal|const\s+handleConfirmAction\s*=\s*universalModalFeature\.handleConfirmAction|const\s+openInputModal\s*=\s*universalModalFeature\.openInputModal|const\s+closeInputModal\s*=\s*universalModalFeature\.closeInputModal|const\s+confirmInputModal\s*=\s*universalModalFeature\.confirmInputModal/,
    'app.js should not retain universal confirm/input modal handler bodies or one-off feature property aliases after extraction'
);

assert.match(
    quickAddFeature,
    /registerQuickAddFeature/,
    'quick-add feature must expose a registration function for Quick Add modal logic'
);

assert.match(
    quickAddFeatureRegistrarModule,
    /import \{ registerQuickAddFeature \} from '\.\.\/features\/quick-add\.js';/,
    'quick-add feature registrar must own the Quick Add feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createQuickAddFeatureRegistrar',
    registerName: 'wireQuickAddFeature',
    modulePath: 'quick-add-feature-registrar.js',
    label: 'Quick Add',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerQuickAddFeature \} from '\.\/features\/quick-add\.js';/,
    'app.js should not directly import Quick Add after registrar extraction'
);

assert.match(
    appScript,
    /wireQuickAddFeature\(assembly\)/,
    'app.js must register the quick-add feature instead of owning Quick Add modal logic'
);

assert.doesNotMatch(
    appScript,
    /const\s+currentQuickAddGroups\s*=\s*computed\(|const\s+openQuickAdd\s*=\s*\(type\)\s*=>|const\s+confirmQuickAdd\s*=\s*\(\)\s*=>|const\s+onMusicianSelect\s*=\s*\(\)\s*=>|const\s+addItemToPool\s*=\s*\(\)\s*=>/,
    'app.js should not retain Quick Add computed state, modal handler, musician-select, or draft-to-pool bodies after extraction'
);

assert.match(
    appScript,
    /const\s*\{[\s\S]*currentQuickAddGroups[\s\S]*openQuickAdd[\s\S]*onMusicianSelect[\s\S]*confirmQuickAdd[\s\S]*addItemToPool[\s\S]*\}\s*=\s*quickAddFeature;/,
    'app.js may consume the Quick Add feature surface directly because quick-add-shell is a pass-through boundary'
);

assert.match(
    quickAddFeature,
    /const\s+onMusicianSelect\s*=\s*\(\)\s*=>/,
    'quick-add feature must own musician default-ratio selection'
);

assert.match(
    quickAddFeature,
    /const\s+addItemToPool\s*=\s*\(\)\s*=>/,
    'quick-add feature must own draft item creation into the pool'
);

assert.match(
    durationPickerFeature,
    /registerDurationPickerFeature/,
    'duration-picker feature must expose a registration function for mobile duration picker logic'
);

assert.match(
    pickerControlsFeature,
    /export function registerPickerControlsFeature/,
    'picker-controls feature must expose a registration function for color and duration picker composition'
);

assert.match(
    pickerControlsFeatureRegistrarModule,
    /import \{ registerPickerControlsFeature \} from '\.\.\/features\/picker-controls\.js';/,
    'picker-controls feature registrar must own the Picker Controls feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createPickerControlsFeatureRegistrar',
    registerName: 'wirePickerControlsFeature',
    modulePath: 'picker-controls-feature-registrar.js',
    label: 'Picker Controls',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerPickerControlsFeature \} from '\.\/features\/picker-controls\.js';/,
    'app.js should not directly import Picker Controls after registrar extraction'
);

assert.match(
    pickerControlsFeature,
    /registerDurationPickerFeature\(/,
    'picker-controls feature must register duration-picker instead of app.js owning duration picker wiring'
);

assert.match(
    pickerControlsFeature,
    /registerColorPickerFeature\(/,
    'picker-controls feature must register color-picker instead of app.js owning color picker wiring'
);

assert.match(
    appScript,
    /wirePickerControlsFeature\(assembly\)/,
    'app.js must register picker-controls instead of direct color/duration picker wiring'
);

assert.doesNotMatch(
    appScript,
    /from\s+['"]\.\/features\/picker-controls-shell\.js['"]|registerPickerControlsShellFeature\(/,
    'app.js must not import or register the pass-through picker-controls shell feature'
);

assert.match(
    appScript,
    /}\s*=\s*pickerControlsFeature;/,
    'app.js must expose picker controls view helpers directly from the picker-controls feature'
);

assert.match(
    appScript,
    /getGroupColor\s*=\s*\(\.\.\.args\)\s*=>\s*pickerControlsFeature\.getGroupColor\(\.\.\.args\);/,
    'app.js must expose the group color helper directly from the picker-controls feature'
);

assert.doesNotMatch(
    appScript,
    /registerDurationPickerFeature\(|registerColorPickerFeature\(/,
    'app.js should not directly register duration-picker or color-picker after picker-controls extraction'
);

assert.doesNotMatch(
    appScript,
    /let\s+pickerCallback|null;\s*let\s+dragElClone|const\s+openDurationPicker\s*=\s*\(event,\s*targetObj,\s*key\)\s*=>|const\s+onScroll\s*=\s*\(e,\s*type\)\s*=>|const\s+confirmDurationPicker\s*=\s*\(\)\s*=>/,
    'app.js should not retain Duration Picker state, scroll logic, or confirm/reset handler bodies after extraction'
);

assert.match(
    historyFeature,
    /registerHistoryFeature/,
    'history feature must expose a registration function for undo/redo logic'
);

assert.match(
    historyFeatureRegistrarModule,
    /import \{ registerHistoryFeature \} from '\.\.\/features\/history\.js';/,
    'history feature registrar must own the history feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createHistoryFeatureRegistrar',
    registerName: 'wireHistoryFeature',
    modulePath: 'history-feature-registrar.js',
    label: 'history',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerHistoryFeature \} from '\.\/features\/history\.js';/,
    'app.js should not directly import history after registrar extraction'
);

assert.match(
    appScript,
    /wireHistoryFeature\(assembly\)/,
    'app.js must register the history feature instead of owning undo/redo logic'
);

assert.match(
    appScript,
    /const\s+\{[\s\S]*\bpushHistory\b[\s\S]*\bundo\b[\s\S]*\bredo\b[\s\S]*\}\s*=\s*historyFeature;/,
    'app.js may consume the history feature action surface directly because history-shell is a pass-through boundary'
);

assert.doesNotMatch(
    appScript,
    /const\s+pushHistory\s*=\s*\(\)\s*=>|const\s+undo\s*=\s*\(\)\s*=>|const\s+redo\s*=\s*\(\)\s*=>|const\s+pushHistory\s*=\s*historyFeature\.pushHistory|const\s+undo\s*=\s*historyFeature\.undo|const\s+redo\s*=\s*historyFeature\.redo|TrackList 视图实时刷新/,
    'app.js should not retain History push/undo/redo bodies, direct feature surface wiring, or TrackList refresh details after extraction'
);

assert.match(
    dataPortabilityFeature,
    /registerDataPortabilityFeature/,
    'data-portability feature must expose a registration function for ICS/JSON export and JSON restore logic'
);

assert.match(
    dataIoFeature,
    /registerDataPortabilityFeature\(/,
    'data-io feature must register data-portability instead of app.js owning backup/restore logic'
);

assert.match(
    dataIoFeature,
    /registerDataPortabilityFeature\(\{[\s\S]*currentSessionId:\s*refs\.currentSessionId/,
    'data-io feature must pass currentSessionId into JSON restore so imported backups can restore the active session'
);

assert.match(
    exportCsvFeature,
    /export function registerExportCsvFeature/,
    'export-csv feature must expose a registration function for schedule CSV export'
);

assert.doesNotMatch(
    dataIoFeature,
    /import\s+\{\s*registerExportCsvFeature\s*\}\s+from\s+['"]\.\/export-csv\.js['"]/,
    'data-io feature must not statically import CSV export into the initial app graph'
);

assert.match(
    dataIoFeature,
    /import\(['"]\.\/export-csv\.js['"]\)/,
    'data-io feature must dynamically import CSV export only when Excel export is used'
);

assert.match(
    dataIoFeature,
    /loadExportCsvFeature\s*=\s*actions\.loadExportCsvFeature\s*\|\|/,
    'data-io feature must allow tests and callers to inject the lazy CSV export loader'
);

assert.doesNotMatch(
    appScript,
    /import\s+XLSX\s+from\s+['"]xlsx-js-style['"]/,
    'app.js must not statically import xlsx-js-style into the initial bundle'
);

assert.match(
    xlsxLoaderModule,
    /export function createXlsxLoader\(\)\s*\{/,
    'XLSX loader service must expose a factory for low-frequency Excel export'
);

assert.match(
    xlsxLoaderModule,
    /return\s+\(\)\s*=>\s*import\(['"]xlsx-js-style['"]\)/,
    'XLSX loader service must own the dynamic xlsx-js-style import'
);

assert.doesNotMatch(
    appScript,
    /import\(['"]xlsx-js-style['"]\)/,
    'app.js must not retain the direct xlsx-js-style dynamic import after XLSX loader extraction'
);

assert.match(
    dataIoFeature,
    /loadXlsx:\s*actions\.loadXlsx/,
    'data-io feature must pass the injected XLSX loader into CSV export'
);

assert.match(
    dataIoFeature,
    /exportState:\s*\{[\s\S]*showExportModal[\s\S]*exportFilter[\s\S]*\}/,
    'data-io feature must pass stable export modal state into the lazily loaded CSV export feature'
);

assert.match(
    exportCsvFeature,
    /await\s+loadXlsx\(\)/,
    'export-csv feature must load xlsx-js-style lazily when confirming Excel export'
);

assert.match(
    dataIoFeature,
    /export function registerDataIoFeature/,
    'data-io feature must expose a registration function for import/export orchestration'
);

assert.match(
    dataIoFeatureLoaderModule,
    /export function createDataIoFeatureLoader\(\{[\s\S]*importDataIoFeature\s*=\s*\(\)\s*=>\s*import\(['"]\.\.\/features\/data-io\.js['"]\),[\s\S]*\}\s*=\s*\{\}\)\s*\{/,
    'data-io feature loader service must expose a factory for the low-frequency data I/O feature import'
);

assert.match(
    dataIoFeatureLoaderModule,
    /importDataIoFeature\(\)[\s\S]*registerDataIoFeature/,
    'data-io feature loader service must own the data I/O feature dynamic import'
);

{
    let importCount = 0;
    const expectedLoadXlsx = async () => ({ default: 'XLSX' });
    let receivedDataIoContext;
    const expectedRegisterDataIoFeature = (context) => {
        receivedDataIoContext = context;
        return { registered: true };
    };
    const loadDataIoFeature = createDataIoFeatureLoader({
        importDataIoFeature: async () => {
            importCount += 1;
            return { registerDataIoFeature: expectedRegisterDataIoFeature };
        },
        loadXlsx: expectedLoadXlsx,
    });
    assert.equal(importCount, 0, 'data-io feature loader factory must not import the feature during bootstrap');
    const registerDataIo = await loadDataIoFeature();
    const registeredDataIo = registerDataIo({
        refs: {},
        state: {},
        utils: {},
        actions: {
            openAlertModal: () => {},
        },
    });
    assert.deepEqual(registeredDataIo, { registered: true }, 'data-io feature loader must resolve a registration function for the feature');
    assert.equal(receivedDataIoContext.actions.loadXlsx, expectedLoadXlsx, 'data-io feature loader must inject XLSX support into the feature actions');
    assert.equal(typeof receivedDataIoContext.actions.openAlertModal, 'function', 'data-io feature loader must preserve caller-provided actions');
    assert.equal(importCount, 1, 'data-io feature loader must defer importing until the returned loader is invoked');
    assert.throws(
        () => createDataIoFeatureLoader({ importDataIoFeature: null }),
        /createDataIoFeatureLoader requires an importDataIoFeature function/,
        'data-io feature loader should fail clearly when no feature importer is available'
    );
}

assertAppFeatureLoadersRegistry({
    factoryName: 'createDataIoFeatureLoader',
    loaderName: 'loadDataIoFeature',
    appConsumerName: 'wireDataIoFeature',
    modulePath: 'data-io-feature-loader.js',
    label: 'data I/O feature',
});

assert.doesNotMatch(
    appScript,
    /import\(['"]\.\/features\/data-io\.js['"]\)/,
    'app.js must not own the low-frequency data I/O feature dynamic import'
);

assert.match(
    appScript,
    /wireDataIoFeature\(assembly/,
    'app.js must register data-io orchestration instead of direct data-portability/export-csv wiring'
);

assert.match(
    appScript,
    /const\s+dataIoFeatureProxy\s*=\s*wireDataIoFeature\(assembly[\s\S]*const\s+dataIoHandlers\s*=\s*dataIoFeatureProxy\.methods\(\[[\s\S]*'exportToICS'[\s\S]*'exportJSON'[\s\S]*'importJSON'[\s\S]*'triggerFileSelect'[\s\S]*'handleJSONFile'[\s\S]*'exportCSV'[\s\S]*'openExportModal'[\s\S]*'toggleFilterItem'[\s\S]*'toggleFilterAll'[\s\S]*'confirmExport'[\s\S]*\]\);/,
    'app.js must proxy data import/export helpers through the shared lazy feature proxy'
);

assert.match(
    appRootContextWiringModule,
    /exportCSV:\s*dataIoHandlers\.exportCSV/,
    'root context wiring must expose exportCSV through the Data I/O lazy-loader proxy handlers'
);

assert.doesNotMatch(
    appScript,
    /dataIoFeaturePromise|getDataIoFeature|withDataIoFeature/,
    'app.js must not keep hand-rolled data I/O lazy proxy variables'
);

assert.doesNotMatch(
    appScript,
    /registerDataPortabilityFeature\(|registerExportCsvFeature\(/,
    'app.js should not directly register data-portability or export-csv after data-io extraction'
);

assert.doesNotMatch(
    appScript,
    /const\s+exportToICS\s*=\s*\(\)\s*=>|const\s+exportJSON\s*=\s*\(\)\s*=>|const\s+importJSON\s*=\s*\(\)\s*=>|const\s+handleJSONFile\s*=\s*\(e\)\s*=>|registerDataIoShellFeature\(|import\(['"]\.\/features\/data-io-shell\.js['"]\)/,
    'app.js should not retain ICS/JSON export or JSON restore modal/file handler bodies after extraction'
);

assert.match(
    avatarCropFeature,
    /registerAvatarCropFeature/,
    'avatar-crop feature must expose a registration function for avatar crop/upload logic'
);

assert.match(
    avatarCropFeatureLoaderModule,
    /export function createAvatarCropFeatureLoader\(\{[\s\S]*importAvatarCropFeature\s*=\s*\(\)\s*=>\s*import\(['"]\.\.\/features\/avatar-crop\.js['"]\),[\s\S]*\}\s*=\s*\{\}\)\s*\{/,
    'avatar crop feature loader service must expose a factory for the low-frequency avatar crop feature import'
);

assert.match(
    avatarCropFeatureLoaderModule,
    /importAvatarCropFeature\(\)[\s\S]*registerAvatarCropFeature/,
    'avatar crop feature loader service must own the avatar-crop feature dynamic import'
);

{
    let importCount = 0;
    const expectedLoadCropper = async () => ({ default: 'Cropper' });
    let receivedAvatarCropContext;
    const expectedRegisterAvatarCropFeature = (context) => {
        receivedAvatarCropContext = context;
        return { registered: true };
    };
    const loadAvatarCropFeature = createAvatarCropFeatureLoader({
        importAvatarCropFeature: async () => {
            importCount += 1;
            return { registerAvatarCropFeature: expectedRegisterAvatarCropFeature };
        },
        loadCropper: expectedLoadCropper,
    });
    assert.equal(importCount, 0, 'avatar crop feature loader factory must not import the feature during bootstrap');
    const registerAvatarCrop = await loadAvatarCropFeature();
    const registeredAvatarCrop = registerAvatarCrop({
        refs: {},
        services: {},
        actions: {
            openAlertModal: () => {},
        },
    });
    assert.deepEqual(registeredAvatarCrop, { registered: true }, 'avatar crop feature loader must resolve a registration function for the feature');
    assert.equal(receivedAvatarCropContext.actions.loadCropper, expectedLoadCropper, 'avatar crop feature loader must inject Cropper support into the feature actions');
    assert.equal(typeof receivedAvatarCropContext.actions.openAlertModal, 'function', 'avatar crop feature loader must preserve caller-provided actions');
    assert.equal(importCount, 1, 'avatar crop feature loader must defer importing until the returned loader is invoked');
    assert.throws(
        () => createAvatarCropFeatureLoader({ importAvatarCropFeature: null }),
        /createAvatarCropFeatureLoader requires an importAvatarCropFeature function/,
        'avatar crop feature loader should fail clearly when no feature importer is available'
    );
}

assertAppFeatureLoadersRegistry({
    factoryName: 'createAvatarCropFeatureLoader',
    loaderName: 'loadAvatarCropFeature',
    appConsumerName: 'wireAvatarCropFeature',
    modulePath: 'avatar-crop-feature-loader.js',
    label: 'avatar crop feature',
});

assert.doesNotMatch(
    appScript,
    /import\(['"]\.\/features\/avatar-crop\.js['"]\)/,
    'app.js must not own the low-frequency avatar-crop feature dynamic import'
);

assert.match(
    appScript,
    /wireAvatarCropFeature\(assembly/,
    'app.js must register the avatar-crop feature instead of owning Cropper lifecycle and upload logic'
);

assert.doesNotMatch(
    appScript,
    /import \{ registerAvatarCropFeature \} from '\.\/features\/avatar-crop\.js';/,
    'app.js must not statically import low-frequency avatar-crop feature into the initial module graph'
);

assert.doesNotMatch(
    appScript,
    /import\s*\(['"]\.\/features\/avatar-crop-shell\.js['"]\)|registerAvatarCropShellFeature\(/,
    'app.js must not import or register the pass-through avatar-crop shell feature'
);

assert.match(
    appScript,
    /const\s+avatarCropFeatureProxy\s*=\s*wireAvatarCropFeature\(assembly\)[\s\S]*const\s+onFileSelect\s*=\s*avatarCropFeatureProxy\.method\('onFileSelect'\);[\s\S]*const\s+cancelCrop\s*=\s*avatarCropFeatureProxy\.method\('cancelCrop'\);[\s\S]*const\s+confirmCrop\s*=\s*avatarCropFeatureProxy\.method\('confirmCrop'\);/,
    'app.js must expose avatar crop handlers through the shared lazy feature proxy'
);

assert.doesNotMatch(
    appScript,
    /avatarCropFeaturePromise|getAvatarCropFeature/,
    'app.js must not keep hand-rolled avatar-crop lazy proxy variables'
);

assert.doesNotMatch(
    appScript,
    /import\s+Cropper\s+from\s+['"]cropperjs['"]/,
    'app.js must not statically import cropperjs into the initial bundle'
);

assert.match(
    cropperLoaderModule,
    /export function createCropperLoader\(\)\s*\{/,
    'Cropper loader service must expose a factory for low-frequency avatar cropping'
);

assert.match(
    cropperLoaderModule,
    /return\s+\(\)\s*=>\s*import\(['"]cropperjs['"]\)/,
    'Cropper loader service must own the dynamic cropperjs import'
);

assert.doesNotMatch(
    appScript,
    /import\(['"]cropperjs['"]\)/,
    'app.js must not retain the direct cropperjs dynamic import after Cropper loader extraction'
);

assert.match(
    avatarCropFeatureLoaderModule,
    /actions:\s*\{[\s\S]*\.\.\.context\.actions,[\s\S]*loadCropper,[\s\S]*\}/,
    'avatar crop feature loader must inject the dynamic Cropper loader into avatar-crop actions'
);

assert.doesNotMatch(
    appScript,
    /registerAvatarCropFeature\(\{[\s\S]*\bloadCropper\b[\s\S]*\}\)/,
    'app.js must not manually inject the dynamic Cropper loader into avatar-crop'
);

assert.match(
    avatarCropFeature,
    /await\s+loadCropper\(\)/,
    'avatar-crop feature must load cropperjs lazily before initializing the cropper instance'
);

assert.doesNotMatch(
    appScript,
    /let\s+cropper\s*=\s*null|const\s+onFileSelect\s*=\s*\(event\)\s*=>|const\s+cancelCrop\s*=\s*\(\)\s*=>|const\s+confirmCrop\s*=\s*\(\)\s*=>|const\s+onFileSelect\s*=\s*avatarCropFeature\.onFileSelect|const\s+cancelCrop\s*=\s*avatarCropFeature\.cancelCrop|const\s+confirmCrop\s*=\s*avatarCropFeature\.confirmCrop/,
    'app.js should not retain avatar Cropper state, file/crop/upload handler bodies, or direct feature surface wiring after extraction'
);

assert.match(
    scheduleDeletionFeature,
    /registerScheduleDeletionFeature/,
    'schedule-deletion feature must expose a registration function for protected schedule deletion logic'
);

assert.match(
    scheduleDeletionFeatureLoaderModule,
    /export function createScheduleDeletionFeatureLoader\(\{[\s\S]*importScheduleDeletionFeature\s*=\s*\(\)\s*=>\s*import\(['"]\.\.\/features\/schedule-deletion\.js['"]\),[\s\S]*\}\s*=\s*\{\}\)\s*\{/,
    'schedule deletion feature loader service must expose a factory for the low-frequency schedule deletion feature import'
);

assert.match(
    scheduleDeletionFeatureLoaderModule,
    /importScheduleDeletionFeature\(\)[\s\S]*registerScheduleDeletionFeature/,
    'schedule deletion feature loader service must own the schedule-deletion feature dynamic import'
);

{
    let importCount = 0;
    const expectedRegisterScheduleDeletionFeature = () => ({ registered: true });
    const loadScheduleDeletionFeature = createScheduleDeletionFeatureLoader({
        importScheduleDeletionFeature: async () => {
            importCount += 1;
            return { registerScheduleDeletionFeature: expectedRegisterScheduleDeletionFeature };
        },
    });
    assert.equal(importCount, 0, 'schedule deletion feature loader factory must not import the feature during bootstrap');
    assert.equal(
        await loadScheduleDeletionFeature(),
        expectedRegisterScheduleDeletionFeature,
        'schedule deletion feature loader must resolve the injected feature registration function when invoked'
    );
    assert.equal(importCount, 1, 'schedule deletion feature loader must defer importing until the returned loader is invoked');
    assert.throws(
        () => createScheduleDeletionFeatureLoader({ importScheduleDeletionFeature: null }),
        /createScheduleDeletionFeatureLoader requires an importScheduleDeletionFeature function/,
        'schedule deletion feature loader should fail clearly when no feature importer is available'
    );
}

assertAppFeatureLoadersRegistry({
    factoryName: 'createScheduleDeletionFeatureLoader',
    loaderName: 'loadScheduleDeletionFeature',
    appConsumerName: 'wireScheduleDeletionFeature',
    modulePath: 'schedule-deletion-feature-loader.js',
    label: 'schedule deletion feature',
});

assert.doesNotMatch(
    appScript,
    /import\(['"]\.\/features\/schedule-deletion\.js['"]\)/,
    'app.js must not own the low-frequency schedule-deletion feature dynamic import'
);

assert.match(
    appScript,
    /wireScheduleDeletionFeature\(assembly/,
    'app.js must register the schedule-deletion feature instead of owning protected schedule deletion logic'
);

assert.match(
    scheduleDeletionFeature,
    /const\s+clearAggregateRecords\s*=\s*\(task\)\s*=>/,
    'schedule-deletion feature must own aggregate schedule record cleanup'
);

for (const leakedRootReturnField of [
    'clearPoolRecord',
    'clearAggregateRecords',
]) {
    assert.doesNotMatch(
        rootSetupReturnObject,
        new RegExp(`\\b${leakedRootReturnField}\\b`),
        `app.js root setup return should expose schedule cleanup helper ${leakedRootReturnField} through feature wiring instead of the root return`
    );
}

assert.match(
    appScript,
    /const\s+scheduleDeletionFeatureProxy\s*=\s*wireScheduleDeletionFeature\(assembly[\s\S]*const\s+isResourceCompleted\s*=\s*scheduleDeletionFeatureProxy\.method\('isResourceCompleted'\);[\s\S]*const\s+deleteCurrentSchedule\s*=\s*scheduleDeletionFeatureProxy\.method\('deleteCurrentSchedule'\);[\s\S]*const\s+clearPoolRecord\s*=\s*scheduleDeletionFeatureProxy\.method\('clearPoolRecord'\);[\s\S]*const\s+clearAggregateRecords\s*=\s*scheduleDeletionFeatureProxy\.method\('clearAggregateRecords'\);/,
    'app.js must proxy protected deletion helpers through the shared lazy feature proxy'
);

assert.doesNotMatch(
    appScript,
    /scheduleDeletionFeaturePromise|getScheduleDeletionFeature|withScheduleDeletionFeature/,
    'app.js must not keep hand-rolled schedule-deletion lazy proxy variables'
);

assert.doesNotMatch(
    appScript,
    /const\s+isResourceCompleted\s*=\s*\(task\)\s*=>|const\s+deleteCurrentSchedule\s*=\s*\(\)\s*=>|const\s+clearPoolRecord\s*=\s*\(templateId\)\s*=>|const\s+clearAggregateRecords\s*=\s*\(task\)\s*=>|const\s+isResourceCompleted\s*=\s*scheduleDeletionFeature\.isResourceCompleted|const\s+deleteCurrentSchedule\s*=\s*scheduleDeletionFeature\.deleteCurrentSchedule|const\s+clearPoolRecord\s*=\s*scheduleDeletionFeature\.clearPoolRecord|registerScheduleDeletionShellFeature\(|import\(['"]\.\/features\/schedule-deletion-shell\.js['"]\)/,
    'app.js should not retain schedule deletion protection, deletion, pool-record cleanup, aggregate-record cleanup handler bodies, or direct feature surface wiring after extraction'
);

assert.match(
    sessionFeature,
    /registerSessionFeature/,
    'session feature must expose a registration function for session switching and actions'
);

assert.match(
    sessionFeatureRegistrarModule,
    /import \{ registerSessionFeature \} from '\.\.\/features\/session\.js';/,
    'session feature registrar must own the session feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createSessionFeatureRegistrar',
    registerName: 'wireSessionFeature',
    modulePath: 'session-feature-registrar.js',
    label: 'session',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerSessionFeature \} from '\.\/features\/session\.js';/,
    'app.js should not directly import session after registrar extraction'
);

assert.match(
    appScript,
    /wireSessionFeature\(assembly\)/,
    'app.js must register the session feature instead of owning session action logic'
);

assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcurrentSessionName\b[\s\S]*\bswitchSession\b[\s\S]*\bhandleSessionAction\b[\s\S]*\}\s*=\s*sessionFeature;/,
    'app.js may consume the session feature action surface directly because session-shell is a pass-through boundary'
);

assert.doesNotMatch(
    appScript,
    /const\s+currentSessionName\s*=\s*computed\(|const\s+switchSession\s*=\s*\(id\)\s*=>|const\s+handleSessionAction\s*=\s*\(action\)\s*=>|const\s+currentSessionName\s*=\s*sessionFeature\.currentSessionName|const\s+switchSession\s*=\s*sessionFeature\.switchSession|const\s+handleSessionAction\s*=\s*sessionFeature\.handleSessionAction/,
    'app.js should not retain session name, switch, create/rename/delete action bodies, or direct feature surface wiring after extraction'
);

assert.match(
    authFeature,
    /const\s+handlePageUnload\s*=\s*\(\)\s*=>/,
    'auth feature must own page-unload forced cloud save behavior'
);

assert.doesNotMatch(
    appScript,
    /const\s+handlePageUnload\s*=\s*\(\)\s*=>\s*\{/,
    'app.js should not retain page-unload forced cloud save body after auth extraction'
);

assert.match(
    authFeatureRegistrarModule,
    /import \{ registerAuthFeature \} from '\.\.\/features\/auth\.js';/,
    'auth feature registrar must own the Auth feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createAuthFeatureRegistrar',
    registerName: 'wireAuthFeature',
    modulePath: 'auth-feature-registrar.js',
    label: 'Auth',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerAuthFeature \} from '\.\/features\/auth\.js';/,
    'app.js should not directly import Auth after registrar extraction'
);

assert.match(
    mobileAutoScrollFeature,
    /export function registerMobileAutoScrollFeature/,
    'mobile-auto-scroll feature must expose a registration function for drag auto-scroll behavior'
);

assert.match(
    mobileAutoScrollFeature,
    /const\s+currentScrollSpeed\s*=\s*\{\s*x:\s*0,\s*y:\s*0\s*\}/,
    'mobile-auto-scroll feature must own scroll velocity state'
);

assert.match(
    mobileAutoScrollFeature,
    /const\s+startAutoScroll\s*=\s*\(vx,\s*vy,\s*xContainer,\s*yContainer\)\s*=>/,
    'mobile-auto-scroll feature must own drag auto-scroll startup'
);

assert.match(
    mobileTouchFeature,
    /registerMobileAutoScrollFeature\(/,
    'mobile-touch feature must register mobile auto-scroll as part of touch orchestration'
);

assert.doesNotMatch(
    appScript,
    /registerMobileAutoScrollFeature\(/,
    'app.js should not directly register mobile auto-scroll after mobile-touch orchestration extraction'
);

assert.doesNotMatch(
    appScript,
    /let\s+autoScrollInterval\s*=\s*null|let\s+isScrollingProgrammatically\s*=\s*false|const\s+currentScrollSpeed\s*=\s*\{\s*x:\s*0,\s*y:\s*0\s*\}|const\s+startAutoScroll\s*=\s*\(vx,\s*vy,\s*xContainer,\s*yContainer\)\s*=>\s*\{|const\s+updateAutoScrollDirection\s*=\s*\(vx,\s*vy\)\s*=>\s*\{|const\s+stopAutoScroll\s*=\s*\(\)\s*=>\s*\{/,
    'app.js should not retain mobile drag auto-scroll interval state or handler bodies after extraction'
);

assert.doesNotMatch(
    appScript,
    /return\s*\{[\s\S]*\bstartAutoScroll\b[\s\S]*\bstopAutoScroll\b[\s\S]*\bupdateAutoScrollDirection\b[\s\S]*\}/,
    'app.js should not expose mobile auto-scroll internals through the root template return after mobile-touch orchestration extraction'
);

assert.match(
    mobileDragGhostFeature,
    /export function registerMobileDragGhostFeature/,
    'mobile-drag-ghost feature must expose a registration function for mobile drag ghost creation'
);

assert.match(
    mobileDragGhostFeature,
    /const\s+startMobileDrag\s*=\s*\(originalEl,\s*touch\)\s*=>/,
    'mobile-drag-ghost feature must own mobile drag clone creation'
);

assert.match(
    mobileTouchFeature,
    /registerMobileDragGhostFeature\(/,
    'mobile-touch feature must register the mobile drag ghost feature instead of app.js owning clone setup inline'
);

assert.doesNotMatch(
    appScript,
    /const\s+startMobileDrag\s*=\s*\(originalEl,\s*touch\)\s*=>\s*\{|Object\.assign\(dragElClone\.style,\s*\{[\s\S]*?boxShadow:\s*'0 10px 20px rgba\(0,0,0,0\.3\)'/,
    'app.js should not retain mobile drag ghost clone setup after extraction'
);

assert.match(
    mobileTouchFeature,
    /export function registerMobileTouchFeature/,
    'mobile-touch feature must expose a registration function for mobile touch orchestration'
);

assert.match(
    mobileTouchFeature,
    /registerMobileTouchStartFeature\(/,
    'mobile-touch feature must compose mobile touch-start behavior'
);

assert.match(
    mobileTouchFeature,
    /registerMobileTouchMoveFeature\(/,
    'mobile-touch feature must compose mobile touch-move behavior'
);

assert.match(
    mobileTouchFeature,
    /registerMobileTouchEndFeature\(/,
    'mobile-touch feature must compose mobile touch-end behavior'
);

assert.match(
    mobileTouchFeature,
    /registerMobileDragGhostFeature\(/,
    'mobile-touch feature must compose mobile drag ghost behavior'
);

assert.match(
    mobileTouchFeature,
    /registerMobileResizeFeature\(/,
    'mobile-touch feature must compose mobile resize behavior'
);

assert.doesNotMatch(
    appScript,
    /import\(['"]\.\/features\/mobile-touch-shell\.js['"]\)|registerMobileTouchShellFeature\(|mobileTouchShellFeature|withMobileTouchShellFeature/,
    'app.js must not retain the pass-through mobile-touch shell after direct lazy mobile-touch wiring'
);

assert.doesNotMatch(
    appScript,
    /registerMobileTouchStartFeature\(|registerMobileTouchMoveFeature\(|registerMobileTouchEndFeature\(|registerMobileDragGhostFeature\(|registerMobileResizeFeature\(/,
    'app.js should not directly register low-level mobile touch, ghost, or resize features after mobile-touch orchestration extraction'
);

assert.match(
    appScript,
    /const\s+mobileTouchFeatureProxy\s*=\s*wireMobileTouchFeature\(assembly[\s\S]*const\s+mobileTouchHandlers\s*=\s*mobileTouchFeatureProxy\.methods\(\[[\s\S]*'handleTouchStart'[\s\S]*'handlePoolTouchStart'[\s\S]*'handleTouchMove'[\s\S]*'handleTouchEnd'[\s\S]*'initMobileResize'[\s\S]*\]\);/,
    'app.js should wire mobile-touch handlers through the shared lazy feature proxy after removing the pass-through shell'
);

assert.doesNotMatch(
    appScript,
    /mobileTouchFeaturePromise|loadMobileTouchFeature|withMobileTouchFeature/,
    'app.js must not keep hand-rolled mobile touch lazy proxy variables'
);

assert.match(
    sidebarShellStateModule,
    /dragElClone:\s*\(\)\s*=>\s*dragState\.dragElClone|dragSourceType:\s*\(\)\s*=>\s*dragState\.dragSourceType/,
    'sidebar shell state should keep exposing mobile drag clone/source state through the root return surface after removing the pass-through shell'
);

assert.match(
    mobileTouchStartFeature,
    /export function registerMobileTouchStartFeature/,
    'mobile-touch-start feature must expose a registration function for mobile touch-start behavior'
);

assert.match(
    mobileTouchStartFeature,
    /const\s+handleTouchStart\s*=\s*\(event,\s*task,\s*dateStr\)\s*=>/,
    'mobile-touch-start feature must own schedule touch-start setup'
);

assert.match(
    mobileTouchStartFeature,
    /const\s+handlePoolTouchStart\s*=\s*\(event,\s*item,\s*type\s*=\s*'pool'\)\s*=>/,
    'mobile-touch-start feature must own pool touch-start setup'
);

assert.doesNotMatch(
    appScript,
    /const\s+handleTouchStart\s*=\s*\(e,\s*task,\s*dateStr\)\s*=>\s*\{|const\s+handlePoolTouchStart\s*=\s*\(e,\s*item,\s*type\s*=\s*'pool'\)\s*=>\s*\{|longPressTimeout\s*=\s*setTimeout\(\(\)\s*=>\s*\{\s*startMobileDrag\(targetEl,\s*touch\);/,
    'app.js should not retain mobile touch-start long-press handler bodies after extraction'
);

assert.match(
    mobileTouchMoveFeature,
    /export function registerMobileTouchMoveFeature/,
    'mobile-touch-move feature must expose a registration function for mobile touch-move behavior'
);

assert.match(
    mobileTouchMoveFeature,
    /const\s+handleTouchMove\s*=\s*\(event\)\s*=>/,
    'mobile-touch-move feature must own touch-move drag behavior'
);

assert.doesNotMatch(
    appScript,
    /const\s+handleTouchMove\s*=\s*\(e\)\s*=>\s*\{[\s\S]*?document\.elementFromPoint\(touch\.clientX,\s*touch\.clientY\);/,
    'app.js should not retain mobile touch-move drag, paging, or drop-slot body after extraction'
);

assert.match(
    mobileTouchEndFeature,
    /export function registerMobileTouchEndFeature/,
    'mobile-touch-end feature must expose a registration function for mobile touch-end behavior'
);

assert.match(
    mobileTouchEndFeature,
    /const\s+handleTouchEnd\s*=\s*\(event\)\s*=>/,
    'mobile-touch-end feature must own touch-end cleanup, tap, and drop behavior'
);

assert.doesNotMatch(
    appScript,
    /const\s+handleTouchEnd\s*=\s*\(e\)\s*=>\s*\{[\s\S]*?dropMonthCell[\s\S]*?dragSourceEl\s*=\s*null;|registerMobileTouchEndFeature\(\{[\s\S]*?data:\s*\{\s*settings,?\s*\}/,
    'app.js should not retain mobile touch-end double-tap, drop, and cleanup body after extraction'
);

assert.equal(
    existsSync(resolveFixturePath('app/scripts/features/mobile-slider-auto-hide.js')),
    false,
    'unused mobile-slider-auto-hide feature file should not remain without a caller'
);

assert.equal(
    existsSync(resolveFixturePath('app/scripts/features/mobile-slider-auto-hide-shell.js')),
    false,
    'unused mobile-slider-auto-hide shell file should not remain without a caller'
);

assert.doesNotMatch(
    appScript,
    /mobile-slider-auto-hide(?:-shell)?\.js/,
    'app.js should not import the unused mobile-slider-auto-hide module or shell into bootstrap'
);

assert.doesNotMatch(
    appScript,
    /const\s+resetAutoHide\s*=\s*\(\)\s*=>\s*\{[\s\S]*?idleTimer\s*=\s*setTimeout\(\(\)\s*=>\s*\{[\s\S]*?showMobileSlider\.value\s*=\s*true;[\s\S]*?\},\s*1000\);[\s\S]*?\};/,
    'app.js should not retain the mobile slider idle timer body after extraction'
);

assert.doesNotMatch(
    appScript,
    /const\s+resetAutoHide\s*=\s*\(\.\.\.args\)\s*=>\s*mobileSliderAutoHideFeature\.resetAutoHide\(\.\.\.args\)/,
    'app.js should not retain direct mobile-slider-auto-hide feature surface wiring after shell extraction'
);

assert.match(
    mobileUiFeature,
    /export function registerMobileUiFeature/,
    'mobile-ui feature must expose a registration function for mobile shell and theme behavior'
);

assert.match(
    mobileUiFeature,
    /function applyTheme\(\)/,
    'mobile-ui feature must own theme application'
);

assert.match(
    mobileUiFeatureRegistrarModule,
    /import \{ registerMobileUiFeature \} from '\.\.\/features\/mobile-ui\.js';/,
    'mobile-ui feature registrar must own the Mobile UI feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createMobileUiFeatureRegistrar',
    registerName: 'wireMobileUiFeature',
    modulePath: 'mobile-ui-feature-registrar.js',
    label: 'Mobile UI',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerMobileUiFeature \} from '\.\/features\/mobile-ui\.js';/,
    'app.js should not directly import Mobile UI after registrar extraction'
);

assert.doesNotMatch(
    appScript,
    /from\s+['"]\.\/features\/mobile-ui-shell\.js['"]|registerMobileUiShellFeature\(/,
    'app.js must not import or register the pass-through mobile-ui shell feature'
);

assert.ok(existsSync(mobileControlsShellStatePath), 'mobile-controls-shell-state module must exist for focused mobile controls ctx extraction');
assert.match(
    mobileControlsShellStateModule,
    /export const createMobileControlsShellState = defineShellState\(/,
    'mobile-controls-shell-state module must expose a focused mobile controls ctx factory'
);
assert.match(
    appStateFactoriesModule,
    /import \{ createMobileControlsShellState \} from '\.\.\/state\/mobile-controls-shell-state\.js';[\s\S]*function createRootMobileControlsShellState\(options\)\s*\{[\s\S]*reactive,[\s\S]*\.\.\.options,/,
    'app-state-factories must bind Vue reactive for the mobile controls shell ctx factory'
);
assert.match(
    appRootContextWiringModule,
    /const appMobileControls\s*=\s*createRootMobileControlsShellState\(\{[\s\S]*refs:\s*\{[\s\S]*globalSearchQuery[\s\S]*isSearchFocused[\s\S]*mobileTab[\s\S]*showMobileTaskInput[\s\S]*\},[\s\S]*actions:\s*\{[\s\S]*onSearchFocus[\s\S]*handleSearchBlur[\s\S]*handleSearchEnter[\s\S]*\}/,
    'app.js must create the mobile controls ctx through the focused shell ctx factory'
);
assert.doesNotMatch(
    appScript,
    /const appMobileControls\s*=\s*reactive\(\{[\s\S]*get globalSearchQuery\(\)[\s\S]*handleSearchEnter[\s\S]*\}\);/,
    'app.js should not own the mobile controls reactive ctx body after extraction'
);
{
    const actions = [];
    const refs = {
        isMobile: { value: true },
        globalSearchQuery: { value: 'initial' },
        isSearchFocused: { value: false },
        mobileTab: { value: 'schedule' },
        showMobileTaskInput: { value: false },
    };
    const ctx = createMobileControlsShellState({
        reactive: (value) => value,
        refs,
        actions: {
            onSearchFocus: () => actions.push('focus'),
            handleSearchBlur: () => actions.push('blur'),
            handleSearchEnter: () => actions.push('enter'),
        },
    });
    assert.equal(ctx.isMobile, true, 'mobile controls ctx should expose the current mobile flag');
    assert.equal(ctx.globalSearchQuery, 'initial', 'mobile controls ctx should expose search query through a getter');
    ctx.globalSearchQuery = 'updated';
    ctx.isSearchFocused = true;
    ctx.mobileTab = 'pool';
    ctx.showMobileTaskInput = true;
    assert.equal(refs.globalSearchQuery.value, 'updated', 'mobile controls ctx should preserve search query two-way binding');
    assert.equal(refs.isSearchFocused.value, true, 'mobile controls ctx should preserve focused-state two-way binding');
    assert.equal(refs.mobileTab.value, 'pool', 'mobile controls ctx should preserve mobile tab two-way binding');
    assert.equal(refs.showMobileTaskInput.value, true, 'mobile controls ctx should preserve mobile task input two-way binding');
    ctx.onSearchFocus();
    ctx.handleSearchBlur();
    ctx.handleSearchEnter();
    assert.deepEqual(actions, ['focus', 'blur', 'enter'], 'mobile controls ctx should pass through search actions');
    assert.throws(
        () => createMobileControlsShellState({ refs, actions: {} }),
        /requires Vue reactive factory/,
        'mobile controls ctx factory should fail clearly when Vue reactive is missing'
    );
}

assert.match(
    appScript,
    /const\s+toggleTheme\s*=\s*\(\)\s*=>\s*mobileUiFeature\.toggleTheme\(\);/,
    'app.js must expose theme toggling directly from the mobile-ui feature'
);

assert.match(
    appScript,
    /const\s+toggleMobileMenu\s*=\s*\(\)\s*=>\s*mobileUiFeature\.toggleMobileMenu\(\);/,
    'app.js must expose mobile menu toggling directly from the mobile-ui feature'
);

assert.match(
    appScript,
    /getThemeLabel\s*=\s*mobileUiFeature\.getThemeLabel;/,
    'app.js must expose the theme label helper directly from the mobile-ui feature'
);

assert.match(
    appScript,
    /mobileUiFeature\.mountShellLifecycle\(\);[\s\S]{0,240}mobileUiFeature\.unmountShellLifecycle\(\);/,
    'app.js must use mobile-ui lifecycle hooks directly from the mobile-ui feature'
);

assert.match(
    mobileResizeFeature,
    /export function registerMobileResizeFeature/,
    'mobile-resize feature must expose a registration function for mobile task resize behavior'
);

assert.match(
    mobileResizeFeature,
    /const\s+initMobileResize\s*=\s*\(event,\s*task\)\s*=>/,
    'mobile-resize feature must own resize gesture initialization'
);

assert.match(
    mobileResizeFeature,
    /const\s+handleMobileResizeMove\s*=\s*\(event\)\s*=>/,
    'mobile-resize feature must own snapped duration updates while resizing'
);

assert.match(
    mobileResizeFeature,
    /const\s+handleMobileResizeEnd\s*=\s*\(event\)\s*=>/,
    'mobile-resize feature must own resize cleanup, conflict rollback, and save behavior'
);

assert.match(
    mobileTouchFeature,
    /registerMobileResizeFeature\(/,
    'mobile-touch feature must register the mobile resize feature instead of app.js owning mobile resize handlers inline'
);

assert.doesNotMatch(
    appScript,
    /let\s+resizeRaf\s*=\s*null|const\s+initMobileResize\s*=\s*\(e,\s*t(?:ask)?\)\s*=>\s*\{|const\s+handleMobileResizeMove\s*=\s*\(e\)\s*=>\s*\{|const\s+handleMobileResizeEnd\s*=\s*\(e\)\s*=>\s*\{/,
    'app.js should not retain mobile resize RAF state or handler bodies after extraction'
);

assert.match(
    desktopResizeFeature,
    /export function registerDesktopResizeFeature/,
    'desktop-resize feature must expose a registration function for desktop task resize behavior'
);

assert.match(
    desktopResizeFeature,
    /const\s+initResize\s*=\s*\(event,\s*task\)\s*=>/,
    'desktop-resize feature must own resize initialization'
);

assert.match(
    desktopResizeFeature,
    /const\s+handleResizeMove\s*=\s*\(event\)\s*=>/,
    'desktop-resize feature must own snapped duration updates while resizing'
);

assert.match(
    desktopResizeFeature,
    /const\s+handleResizeEnd\s*=\s*\(\)\s*=>/,
    'desktop-resize feature must own resize cleanup, conflict rollback, and save behavior'
);

assert.doesNotMatch(
    appScript,
    /import \{ registerDesktopResizeFeature \} from '\.\/features\/desktop-resize\.js';/,
    'app.js must not statically import low-frequency desktop-resize feature into the initial module graph'
);

assert.doesNotMatch(
    appScript,
    /import\s*\(['"]\.\/features\/desktop-resize-shell\.js['"]\)|registerDesktopResizeShellFeature\(/,
    'app.js must not import or register the pass-through desktop-resize shell feature'
);

assert.match(
    desktopResizeFeatureLoaderModule,
    /export function createDesktopResizeFeatureLoader\(\{[\s\S]*importDesktopResizeFeature\s*=\s*\(\)\s*=>\s*import\(['"]\.\.\/features\/desktop-resize\.js['"]\),[\s\S]*\}\s*=\s*\{\}\)\s*\{/,
    'desktop resize feature loader service must expose a factory for the low-frequency desktop resize feature import'
);

assert.match(
    desktopResizeFeatureLoaderModule,
    /importDesktopResizeFeature\(\)[\s\S]*registerDesktopResizeFeature/,
    'desktop resize feature loader service must own the desktop resize feature dynamic import'
);

{
    let importCount = 0;
    const expectedRegisterDesktopResizeFeature = () => ({ registered: true });
    const loadDesktopResizeFeature = createDesktopResizeFeatureLoader({
        importDesktopResizeFeature: async () => {
            importCount += 1;
            return { registerDesktopResizeFeature: expectedRegisterDesktopResizeFeature };
        },
    });
    assert.equal(importCount, 0, 'desktop resize feature loader factory must not import the feature during bootstrap');
    assert.equal(
        await loadDesktopResizeFeature(),
        expectedRegisterDesktopResizeFeature,
        'desktop resize feature loader must resolve the injected feature registration function when invoked'
    );
    assert.equal(importCount, 1, 'desktop resize feature loader must defer importing until the returned loader is invoked');
    assert.throws(
        () => createDesktopResizeFeatureLoader({ importDesktopResizeFeature: null }),
        /createDesktopResizeFeatureLoader requires an importDesktopResizeFeature function/,
        'desktop resize feature loader should fail clearly when no feature importer is available'
    );
}

assertAppFeatureLoadersRegistry({
    factoryName: 'createDesktopResizeFeatureLoader',
    loaderName: 'loadDesktopResizeFeature',
    appConsumerName: 'wireDesktopResizeFeature',
    modulePath: 'desktop-resize-feature-loader.js',
    label: 'desktop resize feature',
});

assert.doesNotMatch(
    appScript,
    /import\(['"]\.\/features\/desktop-resize\.js['"]\)/,
    'app.js must not own the low-frequency desktop resize feature dynamic import'
);

assert.match(
    appScript,
    /const\s+desktopResizeFeatureProxy\s*=\s*wireDesktopResizeFeature\(assembly[\s\S]*const\s+initResize\s*=\s*desktopResizeFeatureProxy\.method\('initResize'\);[\s\S]*const\s+handleResizeMove\s*=\s*desktopResizeFeatureProxy\.method\('handleResizeMove'\);[\s\S]*const\s+handleResizeEnd\s*=\s*desktopResizeFeatureProxy\.method\('handleResizeEnd'\);/,
    'app.js must expose desktop resize handlers through the shared lazy feature proxy'
);

assert.doesNotMatch(
    appScript,
    /desktopResizeFeaturePromise|getDesktopResizeFeature/,
    'app.js must not keep hand-rolled desktop-resize lazy proxy variables'
);

assert.match(
    appLazyFeatureWiringsModule,
    /registerDesktopResizeFeature\(\{[\s\S]*checkOverlap:\s*\(\.\.\.args\)\s*=>\s*assembly\.helpers\.checkOverlap\(\.\.\.args\)/,
    'lazy wirings must pass late-bound desktop resize overlap checks through the lazy wrapper'
);

assert.doesNotMatch(
    appScript,
    /const\s+initResize\s*=\s*\(e,\s*t\)\s*=>\s*\{|const\s+handleResizeMove\s*=\s*e\s*=>\s*\{|const\s+handleResizeEnd\s*=\s*\(\)\s*=>\s*\{/,
    'app.js should not retain desktop resize handler bodies after extraction'
);

assert.match(
    colorPickerFeature,
    /registerColorPickerFeature/,
    'color-picker feature must expose a registration function for custom color picker state and actions'
);

assert.match(
    pickerControlsFeature,
    /registerColorPickerFeature\(/,
    'picker-controls feature must register color-picker instead of app.js owning custom color picker wiring'
);

assert.doesNotMatch(
    appScript,
    /const\s+showColorPickerModal\s*=\s*ref\(|const\s+openColorPicker\s*=\s*\(item,\s*type\)\s*=>|const\s+getDefaultColorByType\s*=\s*\(type\)\s*=>|const\s+resetColorPicker\s*=\s*\(\)\s*=>|const\s+saveColorPicker\s*=\s*\(\)\s*=>/,
    'app.js should not retain color picker state or action handler bodies after extraction'
);

assert.match(
    colorPickerFeature,
    /const\s+hexToRgb\s*=/,
    'color-picker feature must own hex-to-rgb conversion used by color UI helpers'
);

assert.match(
    colorPickerFeature,
    /const\s+getTextColor\s*=/,
    'color-picker feature must own readable text color calculation'
);

assert.match(
    colorPickerFeature,
    /const\s+generateRandomHexColor\s*=/,
    'color-picker feature must own random color generation for injected color-aware features'
);

assert.match(
    colorPickerFeature,
    /const\s+adjustColor\s*=/,
    'color-picker feature must own color adjustment helpers'
);

assert.match(
    colorPickerFeature,
    /const\s+getGroupColor\s*=\s*\(item,\s*key,\s*isBorder\)\s*=>/,
    'color-picker feature must own group color lookup for sidebar and schedule accents'
);

assert.doesNotMatch(
    appScript,
    /const\s+hexToRgb\s*=\s*hex\s*=>|const\s+getTextColor\s*=\s*hex\s*=>|const\s+generateRandomHexColor\s*=\s*\(\)\s*=>\s*\{|const\s+adjustColor\s*=\s*\(hex,\s*percent\)\s*=>|const\s+getGroupColor\s*=\s*\(item,\s*key,\s*isBorder\)\s*=>\s*\{/,
    'app.js should not retain color helper or group-color bodies after color-picker extraction'
);

assert.match(
    importMidiFeature,
    /const\s+instrumentLibrary\s*=/,
    'import-midi feature must own the MIDI instrument grouping library'
);

assert.match(
    importMidiFeature,
    /const\s+findGroupSmart\s*=\s*\(trackName\)\s*=>/,
    'import-midi feature must own smart MIDI track-to-group matching'
);

assert.match(
    importMidiFeature,
    /const\s+filteredImportOptions\s*=\s*computed\(/,
    'import-midi feature must own MIDI import menu filtering'
);

assert.match(
    importMidiFeature,
    /const\s+midiGroupExpanded\s*=\s*reactive\(new Set\(\)\)/,
    'import-midi feature must own MIDI group expansion state'
);

assert.match(
    importMidiFeature,
    /const\s+toggleMidiGroupExpand\s*=\s*\(groupName\)\s*=>/,
    'import-midi feature must own MIDI group expansion toggling'
);

assert.doesNotMatch(
    appScript,
    /const\s+instrumentLibrary\s*=\s*\{|const\s+findGroupSmart\s*=\s*\(trackName\)\s*=>|const\s+openImportMenu\s*=\s*\(e,\s*rowId,\s*type\)\s*=>|const\s+filteredImportOptions\s*=\s*computed\(|const\s+midiGroupExpanded\s*=\s*reactive\(new Set\(\)\)|const\s+toggleMidiGroupExpand\s*=\s*\(groupName\)\s*=>\s*\{/,
    'app.js should not retain MIDI smart grouping, import menu, or group expansion handler bodies after extraction'
);

assert.doesNotMatch(
    appScript,
    /\bsortedLibrary,|\binstrumentLibrary,/,
    'app.js should not return MIDI import internals that are now private to import-midi feature'
);

assert.match(
    importCsvFeature,
    /const\s+toggleProjectCollapse\s*=\s*\(projectName\)\s*=>/,
    'import-csv feature must own CSV project group collapse toggling'
);

assert.match(
    importCsvFeature,
    /const\s+toggleAllProjectCollapse\s*=\s*\(\)\s*=>/,
    'import-csv feature must own CSV project group collapse-all toggling'
);

assert.match(
    importCsvFeature,
    /const\s+triggerCSV\s*=\s*\(\)\s*=>/,
    'import-csv feature must own CSV input triggering'
);

assert.match(
    importDataFeature,
    /export function registerImportDataFeature/,
    'import-data feature must expose a registration function for CSV/MIDI import orchestration'
);

assert.match(
    importDataFeature,
    /loadImportCsvFeature[\s\S]*import\('\.\/import-csv\.js'\)[\s\S]*registerImportCsvFeature/,
    'import-data feature must lazy-load CSV import registration instead of statically importing it into the initial app graph'
);

assert.match(
    importDataFeature,
    /loadImportMidiFeature[\s\S]*import\('\.\/import-midi\.js'\)[\s\S]*registerImportMidiFeature/,
    'import-data feature must lazy-load MIDI import registration instead of statically importing it into the initial app graph'
);

assert.doesNotMatch(
    importDataFeature,
    /from '\.\/import-(?:csv|midi)\.js';/,
    'import-data feature must not statically import CSV/MIDI import modules after lazy registration extraction'
);

assert.match(
    importDataFeature,
    /importCsvFeaturePromise/,
    'import-data feature must cache the lazy CSV import feature registration'
);

assert.match(
    importDataFeature,
    /importMidiFeaturePromise/,
    'import-data feature must cache the lazy MIDI import feature registration'
);

assert.match(
    importDataDependencyLoaderModule,
    /export function createImportDataDependencyLoader\(\{\s*loadMidiSmf\s*\}\s*=\s*\{\}\)\s*\{/,
    'import-data dependency loader service must expose a factory for low-frequency CSV/MIDI import wiring'
);

assert.match(
    importDataDependencyLoaderModule,
    /Promise\.all\(\[\s*import\(['"]\.\.\/features\/import-data\.js['"]\),\s*import\(['"]\.\.\/utils\/csv\.js['"]\),\s*import\(['"]\.\.\/utils\/midi\.js['"]\),?\s*\]\)/,
    'import-data dependency loader service must own the dynamic import-data, CSV utility, and MIDI utility imports'
);

assert.match(
    importDataDependencyLoaderModule,
    /actions:\s*\{[\s\S]*\.\.\.context\.actions,[\s\S]*loadMidiSmf,[\s\S]*\}/,
    'import-data dependency loader service must inject the MIDI SMF loader into import-data actions'
);

assert.doesNotMatch(
    appScript,
    /import\(['"]\.\/features\/import-data\.js['"]\)|import\(['"]\.\/utils\/csv\.js['"]\)|import\(['"]\.\/utils\/midi\.js['"]\)/,
    'app.js must not retain direct dynamic imports for import-data internals after dependency loader extraction'
);

assert.doesNotMatch(
    appScript,
    /registerImportDataFeature\(\{[\s\S]*\bloadMidiSmf\b[\s\S]*\}\)/,
    'app.js must not manually inject the MIDI SMF loader into import-data'
);

assert.match(
    appScript,
    /wireImportDataFeature\(assembly/,
    'app.js must register import-data orchestration instead of direct CSV/MIDI import wiring'
);

assert.doesNotMatch(
    appScript,
    /registerImportCsvFeature\(|registerImportMidiFeature\(/,
    'app.js should not directly register import-csv or import-midi after import-data extraction'
);

assert.doesNotMatch(
    appScript,
    /const\s+toggleProjectCollapse\s*=\s*\(pName\)\s*=>|const\s+allGroups\s*=\s*groupedCsvData\.value\.map\(g\s*=>\s*g\.projectName\)|document\.getElementById\('csv-import-input'\)/,
    'app.js should not retain CSV project collapse toggling, collapse-all, or input trigger implementation after extraction'
);

assert.match(
    sidebarStatsFeature,
    /const\s+toggleSort\s*=\s*\(field\)\s*=>/,
    'sidebar-stats feature must own sidebar sort toggling'
);

assert.match(
    sidebarStatsFeature,
    /const\s+getSortIcon\s*=\s*\(field\)\s*=>/,
    'sidebar-stats feature must own sidebar sort icon selection'
);

assert.match(
    sidebarStatsFeature,
    /const\s+toggleCollapse\s*=\s*\(groupKey\)\s*=>/,
    'sidebar-stats feature must own sidebar list group collapse toggling'
);

assert.match(
    sidebarStatsFeatureRegistrarModule,
    /import \{ registerSidebarStatsFeature \} from '\.\.\/features\/sidebar-stats\.js';/,
    'sidebar-stats feature registrar must own the Sidebar Stats feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createSidebarStatsFeatureRegistrar',
    registerName: 'wireSidebarStatsFeature',
    modulePath: 'sidebar-stats-feature-registrar.js',
    label: 'Sidebar Stats',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerSidebarStatsFeature \} from '\.\/features\/sidebar-stats\.js';/,
    'app.js should not directly import Sidebar Stats after registrar extraction'
);

assert.doesNotMatch(
    appScript,
    /from\s+['"]\.\/features\/sidebar-stats-shell\.js['"]|registerSidebarStatsShellFeature\(/,
    'app.js must not import or register the pass-through sidebar-stats shell feature'
);

assert.match(
    appScript,
    /const\s+\{\s*calculateGroupStats,[\s\S]{0,500}handleStatCardClick,\s*\}\s*=\s*sidebarStatsFeature;/,
    'app.js must expose sidebar stats values directly from the sidebar-stats feature'
);

assert.match(
    appScript,
    /currentSidebarList\s*=\s*sidebarStatsFeature\.currentSidebarList;/,
    'app.js must read currentSidebarList directly from the sidebar-stats feature'
);

assert.doesNotMatch(
    appScript,
    /const\s+toggleSort\s*=\s*\(field\)\s*=>|const\s+getSortIcon\s*=\s*\(field\)\s*=>|const\s+toggleCollapse\s*=\s*\(groupKey\)\s*=>|const\s+calculateGroupStats\s*=\s*sidebarStatsFeature\.calculateGroupStats|const\s+musicianStats\s*=\s*sidebarStatsFeature\.musicianStats|const\s+projectStats\s*=\s*sidebarStatsFeature\.projectStats|const\s+instrumentStats\s*=\s*sidebarStatsFeature\.instrumentStats|const\s+activeTaskCount\s*=\s*sidebarStatsFeature\.activeTaskCount|const\s+expandedStatsIds\s*=\s*sidebarStatsFeature\.expandedStatsIds|const\s+toggleSort\s*=\s*sidebarStatsFeature\.toggleSort|const\s+getSortIcon\s*=\s*sidebarStatsFeature\.getSortIcon|const\s+toggleCollapse\s*=\s*sidebarStatsFeature\.toggleCollapse|const\s+toggleStatCollapse\s*=\s*sidebarStatsFeature\.toggleStatCollapse|const\s+updateMusicianRatio\s*=\s*sidebarStatsFeature\.updateMusicianRatio|const\s+jumpToStatSchedule\s*=\s*sidebarStatsFeature\.jumpToStatSchedule|const\s+handleStatCardClick\s*=\s*sidebarStatsFeature\.handleStatCardClick/,
    'app.js should not retain sidebar sort toggle, icon, group collapse handler bodies, or one-off sidebar-stats feature property aliases after extraction'
);

assert.match(
    sidebarNavigationFeature,
    /export function registerSidebarNavigationFeature/,
    'sidebar navigation feature must expose a registration function for sidebar tab gestures'
);

assert.match(
    sidebarNavigationFeature,
    /const\s+switchSidebarTab\s*=\s*\(targetTab\)\s*=>/,
    'sidebar navigation feature must own sidebar tab switching'
);

assert.match(
    sidebarNavigationFeature,
    /const\s+onSidebarTouchEnd\s*=\s*\(event\)\s*=>/,
    'sidebar navigation feature must own mobile sidebar swipe handling'
);

assert.match(
    sidebarNavigationFeature,
    /const\s+scrollToSidebarItem\s*=\s*\(targetId\)\s*=>/,
    'sidebar navigation feature must own scrolling the sidebar to a selected stat item'
);

assert.doesNotMatch(
    appScript,
    /const\s+sidebarTouchStartX\s*=\s*ref\(|const\s+sidebarTabsOrder\s*=\s*\[|const\s+switchSidebarTab\s*=\s*\(targetTab\)\s*=>|const\s+onSidebarTouchEnd\s*=\s*\(e\)\s*=>|const\s+scrollToSidebarItem\s*=\s*\(targetId\)\s*=>/,
    'app.js should not retain sidebar tab gesture state, handler bodies, or selected-item scrolling after extraction'
);

assert.match(
    sidebarPreferencesFeature,
    /export function registerSidebarPreferencesFeature/,
    'sidebar-preferences feature must expose a registration function for persisted sidebar shell state'
);

assert.match(
    sidebarPreferencesFeature,
    /const\s+isSidebarOpen\s*=\s*ref\(/,
    'sidebar-preferences feature must own the persisted sidebar-open ref'
);

assert.match(
    sidebarPreferencesFeature,
    /watch\(\[isSidebarOpen,\s*sidebarWidth\]/,
    'sidebar-preferences feature must own sidebar open/width persistence'
);

assert.match(
    sidebarFeature,
    /export function registerSidebarFeature/,
    'sidebar feature must expose a registration function for sidebar composition'
);

assert.match(
    sidebarFeature,
    /registerSidebarPreferencesFeature\(/,
    'sidebar feature must register sidebar preferences instead of app.js owning sidebar persistence wiring'
);

assert.match(
    sidebarFeature,
    /registerSidebarNavigationFeature\(/,
    'sidebar feature must register sidebar navigation instead of app.js owning sidebar navigation wiring'
);

assert.match(
    sidebarFeatureRegistrarModule,
    /import \{ registerSidebarFeature \} from '\.\.\/features\/sidebar\.js';/,
    'sidebar feature registrar must own the sidebar feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createSidebarFeatureRegistrar',
    registerName: 'wireSidebarFeature',
    modulePath: 'sidebar-feature-registrar.js',
    label: 'sidebar',
});

assert.match(
    sidebarFeatureRegistrarModule,
    /wireSidebarFeature\(assembly\)[\s\S]*registerSidebarFeature\(\{[\s\S]*sidebarWidth,[\s\S]*isDragActive:\s*\(\)\s*=>\s*!!dragState\.dragElClone,[\s\S]*\}\);/,
    'sidebar registrar must own the sidebar wiring table'
);

assert.doesNotMatch(
    appScript,
    /import \{ registerSidebarFeature \} from '\.\/features\/sidebar\.js';/,
    'app.js should not directly import sidebar after registrar extraction'
);

assert.match(
    appScript,
    /wireSidebarFeature\(assembly\)/,
    'app.js must register sidebar composition through the assembly-wired registrar'
);

assert.doesNotMatch(
    appScript,
    /from\s+['"]\.\/features\/sidebar-shell\.js['"]|registerSidebarShellFeature\(|sidebarShellFeature/,
    'app.js must not retain sidebar shell naming after renaming the composition feature'
);

assert.doesNotMatch(
    appScript,
    /import\(['"]\.\/features\/settings-shell\.js['"]\)|registerSettingsShellFeature\(|settingsShellFeature|withSettingsShellFeature|getSettingsShellFeature/,
    'app.js must not retain the pass-through settings shell after direct lazy settings wiring'
);

assert.doesNotMatch(
    appScript,
    /from\s+['"]\.\/features\/auth-shell\.js['"]|registerAuthShellFeature\(|authShellFeature/,
    'app.js must not retain the pass-through auth shell after direct auth wiring'
);

assert.match(
    appScript,
    /const\s+importDataFeatureProxy\s*=\s*wireImportDataFeature\(assembly[\s\S]*const\s+calculateRowStatusText\s*=\s*importDataFeatureProxy\.method\('calculateRowStatusText'\);[\s\S]*const\s+confirmCsvImport\s*=\s*importDataFeatureProxy\.method\('confirmCsvImport'\);[\s\S]*const\s+triggerMidiImportForProject\s*=\s*importDataFeatureProxy\.method\('triggerMidiImportForProject'\);[\s\S]*const\s+selectImportGroup\s*=\s*importDataFeatureProxy\.method\('selectImportGroup'\);/,
    'app.js must proxy CSV/MIDI import helpers through the shared lazy import-data feature proxy'
);

assert.doesNotMatch(
    appScript,
    /importDataFeaturePromise|getImportDataFeature|withImportDataFeature/,
    'app.js must not keep hand-rolled import-data lazy proxy variables'
);

assert.doesNotMatch(
    appScript,
    /trackListShellFeature|withTrackListShell|getTrackListShellFeature|import\(['"]\.\/features\/track-list-shell\.js['"]\)|registerTrackListShellFeature\(/,
    'app.js must not keep the pass-through track-list shell after direct lazy track-list wiring'
);

assert.doesNotMatch(
    appScript,
    /import\(['"]\.\/features\/midi-manager-shell\.js['"]\)|registerMidiManagerShellFeature\(/,
    'app.js must not import or register the pass-through MIDI manager shell feature'
);

assert.match(
    appScript,
    /const\s+midiManagerFeatureProxy\s*=\s*wireMidiManagerFeature\(assembly[\s\S]*const\s+getMidiManagerFeature\s*=\s*midiManagerFeatureProxy\.getFeature;[\s\S]*const\s+withMidiManagerFeature\s*=\s*midiManagerFeatureProxy\.method;/,
    'app.js must proxy MIDI manager methods through the shared lazy feature proxy'
);

assert.doesNotMatch(
    appScript,
    /registerSidebarPreferencesFeature\(|registerSidebarNavigationFeature\(/,
    'app.js should not directly register sidebar preferences or sidebar navigation after sidebar extraction'
);

assert.doesNotMatch(
    appScript,
    /const\s+savedSidebarState\s*=\s*storageService\.getItem\('musche_sidebar_open'\)|watch\(\[isSidebarOpen,\s*sidebarWidth\],\s*\(\[open,\s*width\]\)\s*=>\s*\{\s*storageService\.setItem\('musche_sidebar_open',\s*open\);/,
    'app.js should not retain sidebar open-state loading or persistence watcher after sidebar-preferences extraction'
);

assert.match(
    selectionFeature,
    /export function registerSelectionFeature/,
    'selection feature must expose a registration function for task selection behavior'
);

assert.match(
    selectionFeature,
    /const\s+selectScheduleTask\s*=\s*\(id\)\s*=>/,
    'selection feature must own schedule task selection and sidebar follow-scroll behavior'
);

assert.match(
    selectionFeature,
    /const\s+jumpToPoolSchedule\s*=\s*\(id\)\s*=>/,
    'selection feature must own pool single-select schedule jumping'
);

assert.match(
    selectionFeature,
    /const\s+selectPoolTask\s*=\s*\(id\)\s*=>/,
    'selection feature must own shared pool task selection state'
);

assert.match(
    selectionFeature,
    /const\s+selectSinglePoolTask\s*=\s*\(id\)\s*=>/,
    'selection feature must own normal pool single-selection state reset'
);

assert.match(
    selectionFeature,
    /const\s+togglePoolTaskSelection\s*=\s*\(id\)\s*=>/,
    'selection feature must own ctrl/meta pool multi-selection toggling'
);

assert.match(
    selectionFeature,
    /const\s+clearSelection\s*=\s*\(\)\s*=>/,
    'selection feature must own clearing selected task and pool selection state'
);

assert.match(
    selectionFeature,
    /const\s+selectPoolTaskRange\s*=\s*\(id,\s*visibleItems\s*=\s*\[\]\)\s*=>/,
    'selection feature must own shift-range pool multi-selection'
);

assert.match(
    selectionFeature,
    /const\s+selectTask\s*=\s*\(id,\s*src,\s*event\)\s*=>/,
    'selection feature must own top-level task selection orchestration'
);

assert.match(
    selectionFeature,
    /const\s+handlePoolItemClick\s*=\s*\(poolItemId\)\s*=>/,
    'selection feature must own pool item click selection routing'
);

assert.doesNotMatch(
    appScript,
    /if\s*\(src === 'schedule'\)\s*\{\s*selectedSource\.value = src;\s*selectedTaskId\.value = id;\s*selectedPoolIds\.value\.clear\(\);|let\s+specificTask\s*=\s*scheduledTasks\.value\.find\(t\s*=>|selectedSource\.value = src;\s*selectedTaskId\.value = id;\s*lastPoolFocusId\.value = id;|selectedPoolIds\.value\.clear\(\);\s*selectedPoolIds\.value\.add\(id\);\s*lastPoolClickId\.value = id;|selectedPoolIds\.value\.has\(id\)\)\s*selectedPoolIds\.value\.delete\(id\);\s*else\s*selectedPoolIds\.value\.add\(id\);\s*lastPoolClickId\.value = id;|const\s+clearSelection\s*=\s*\(\)\s*=>\s*\{\s*selectedTaskId\.value = null;\s*selectedSource\.value = null;\s*selectedPoolIds\.value\.clear\(\);|const\s+startIdx\s*=\s*visibleItems\.findIndex\(i\s*=>\s*i\.id === lastPoolClickId\.value\);|const\s+isShift\s*=\s*event && event\.shiftKey;|const\s+handlePoolItemClick\s*=\s*\(poolItemId\)\s*=>\s*\{\s*selectTask\(poolItemId,\s*'pool'\);/,
    'app.js should not retain the schedule-task selection branch, pool selection prelude, normal pool single-selection reset, ctrl/meta pool toggle, clear selection body, shift-range selection body, top-level task selection orchestration, pool item click routing, or pool single-select schedule-jump body after selection extraction'
);

assert.match(
    visiblePoolItemsFeature,
    /export function registerVisiblePoolItemsFeature/,
    'visible-pool-items feature must expose a registration function for visible pool item resolution'
);

assert.match(
    visiblePoolItemsFeature,
    /const\s+getVisiblePoolItems\s*=\s*\(\)\s*=>/,
    'visible-pool-items feature must own visible pool item flattening for selection range behavior'
);

assert.match(
    poolInteractionsFeature,
    /export function registerPoolInteractionsFeature/,
    'pool-interactions feature must expose a registration function for pool visibility and selection composition'
);

assert.match(
    poolInteractionsFeatureRegistrarModule,
    /import \{ registerPoolInteractionsFeature \} from '\.\.\/features\/pool-interactions\.js';/,
    'pool-interactions feature registrar must own the Pool Interactions feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createPoolInteractionsFeatureRegistrar',
    registerName: 'wirePoolInteractionsFeature',
    modulePath: 'pool-interactions-feature-registrar.js',
    label: 'Pool Interactions',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerPoolInteractionsFeature \} from '\.\/features\/pool-interactions\.js';/,
    'app.js should not directly import Pool Interactions after registrar extraction'
);

assert.match(
    poolInteractionsFeature,
    /registerVisiblePoolItemsFeature\(/,
    'pool-interactions feature must register visible-pool-items instead of app.js owning visible pool wiring'
);

assert.match(
    poolInteractionsFeature,
    /registerSelectionFeature\(/,
    'pool-interactions feature must register selection instead of app.js owning selection wiring'
);

assert.match(
    appScript,
    /poolInteractionsFeature\.handlePoolItemClick/,
    'app.js may consume the pool-interactions feature click surface directly because pool-interactions-shell is a pass-through boundary'
);

assert.match(
    appScript,
    /poolInteractionsFeature\.getVisiblePoolItems/,
    'app.js may consume the pool-interactions feature visibility surface directly because pool-interactions-shell is a pass-through boundary'
);

assert.doesNotMatch(
    appScript,
    /registerVisiblePoolItemsFeature\(|registerSelectionFeature\(/,
    'app.js should not directly register visible-pool-items or selection after pool-interactions extraction'
);

assert.doesNotMatch(
    appScript,
    /const\s+getVisiblePoolItems\s*=\s*\(\)\s*=>\s*\{[\s\S]*?expandedStatsIds\.has\(stat\.id\)[\s\S]*?return\s+visibleItems;\s*\};/,
    'app.js should not retain visible pool item flattening after extraction'
);

assert.match(
    globalKeyboardFeature,
    /export function registerGlobalKeyboardFeature/,
    'global-keyboard feature must expose a registration function for app-wide keyboard behavior'
);

assert.match(
    globalKeyboardFeature,
    /const\s+handleGlobalKey\s*=\s*\(event\)\s*=>/,
    'global-keyboard feature must own app-wide keydown behavior'
);

assert.match(
    globalKeyboardFeatureRegistrarModule,
    /import \{ registerGlobalKeyboardFeature \} from '\.\.\/features\/global-keyboard\.js';/,
    'global-keyboard feature registrar must own the global-keyboard feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createGlobalKeyboardFeatureRegistrar',
    registerName: 'wireGlobalKeyboardFeature',
    modulePath: 'global-keyboard-feature-registrar.js',
    label: 'global-keyboard',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerGlobalKeyboardFeature \} from '\.\/features\/global-keyboard\.js';/,
    'app.js should not directly import global-keyboard after registrar extraction'
);

assert.doesNotMatch(
    appScript,
    /const\s+handleGlobalKey\s*=\s*e\s*=>\s*\{[\s\S]*?selectedPoolIds\.value\.size > 0[\s\S]*?clearAggregateRecords\(taskToDelete\);/,
    'app.js should not retain global keyboard shortcut and delete behavior after extraction'
);

assert.match(
    appScript,
    /const\s+handleGlobalKey\s*=\s*\(\.\.\.args\)\s*=>\s*globalKeyboardFeature\.handleGlobalKey\(\.\.\.args\)/,
    'app.js may consume the global-keyboard feature handler surface directly because global-keyboard-shell is a pass-through boundary'
);

assert.match(
    dataAutosaveFeature,
    /export function registerDataAutosaveFeature/,
    'data-autosave feature must expose a registration function for data persistence watching'
);

assert.match(
    dataAutosaveFeature,
    /const\s+handleDataChanged\s*=\s*\(\)\s*=>/,
    'data-autosave feature must own bootstrapping, cloud debounce, and guest local persistence behavior'
);

assert.match(
    appRuntimeFeature,
    /registerDataAutosaveFeature\(/,
    'app-runtime feature must register data autosave instead of app.js owning autosave inline'
);

assert.doesNotMatch(
    appScript,
    /registerDataAutosaveFeature\(/,
    'app.js should not directly register data autosave after app-runtime extraction'
);

assert.doesNotMatch(
    appScript,
    /watch\(\[itemPool,\s*scheduledTasks,\s*settings,\s*currentSessionId\],\s*\(\)\s*=>\s*\{[\s\S]*?storageService\.saveData\('v9_data'[\s\S]*?\},\s*\{deep:\s*true\}\);/,
    'app.js should not retain the inline data autosave watcher body after extraction'
);

assert.match(
    appLifecycleFeature,
    /export function registerAppLifecycleFeature/,
    'app-lifecycle feature must expose a registration function for root app lifecycle wiring'
);

assert.match(
    appLifecycleFeature,
    /const\s+mountAppLifecycle\s*=\s*async\s*\(\)\s*=>/,
    'app-lifecycle feature must own root mount startup behavior'
);

assert.match(
    appLifecycleFeature,
    /const\s+unmountAppLifecycle\s*=\s*\(\)\s*=>/,
    'app-lifecycle feature must own root global listener cleanup'
);

assert.match(
    appRuntimeFeature,
    /registerAppLifecycleFeature\(/,
    'app-runtime feature must register root app lifecycle instead of app.js owning startup inline'
);

assert.match(
    appRuntimeFeature,
    /registerAppLifecycleFeature\(\{[\s\S]*?handlers:\s*\{[\s\S]*?handleGlobalKey:\s*\(\.\.\.args\)\s*=>\s*handlers\.handleGlobalKey\(\.\.\.args\)[\s\S]*?\}/,
    'app-runtime feature must pass root lifecycle handlers lazily to avoid setup-time TDZ errors'
);

assert.doesNotMatch(
    appScript,
    /registerAppLifecycleFeature\(/,
    'app.js should not directly register app lifecycle after app-runtime extraction'
);

assert.doesNotMatch(
    appScript,
    /onMounted\(async\s*\(\)\s*=>\s*\{[\s\S]*?bootSessionData[\s\S]*?isBootstrappingData\.value\s*=\s*false;[\s\S]*?\}\);/,
    'app.js should not retain the root startup lifecycle body after extraction'
);

assert.equal(
    existsSync(resolveFixturePath('app/scripts/features/musician-scheduled-stats.js')),
    false,
    'unused musician-scheduled-stats feature file should not remain without a caller'
);

assert.equal(
    existsSync(resolveFixturePath('app/scripts/features/musician-scheduled-stats-shell.js')),
    false,
    'unused musician-scheduled-stats shell file should not remain without a caller'
);

assert.doesNotMatch(
    appScript,
    /registerMusicianScheduledStatsShellFeature\(/,
    'app.js should not register the unused musician-scheduled-stats shell into the initial graph'
);

assert.doesNotMatch(
    appScript,
    /const\s+musicianScheduledStats\s*=\s*computed\(\(\)\s*=>\s*\{[\s\S]*?scheduledFormatted:\s*formatSecs\(m\.scheduledSeconds\)[\s\S]*?\}\)\s*;\s*\}\);/,
    'app.js should not retain the inline musician scheduled stats computed body after extraction'
);

assert.doesNotMatch(
    appScript,
    /const\s+musicianScheduledStats\s*=\s*musicianScheduledStatsFeature\.musicianScheduledStats/,
    'app.js should not retain direct musician-scheduled-stats feature surface wiring after shell extraction'
);

assert.match(
    mainViewNavigationFeature,
    /export function registerMainViewNavigationFeature/,
    'main-view navigation feature must expose a registration function for schedule view gestures'
);

assert.match(
    mainViewNavigationFeature,
    /const\s+switchView\s*=\s*\(targetView\)\s*=>/,
    'main-view navigation feature must own week-month view switching'
);

assert.match(
    mainViewNavigationFeature,
    /const\s+cycleDayWidth\s*=\s*\(\)\s*=>/,
    'main-view navigation feature must own width mode cycling'
);

assert.match(
    mainViewNavigationFeature,
    /const\s+onMainWheel\s*=\s*\(event\)\s*=>/,
    'main-view navigation feature must own main content wheel navigation'
);

assert.match(
    mainViewNavigationFeature,
    /const\s+jumpToGhostContext\s*=\s*\(task\)\s*=>/,
    'main-view navigation feature must own ghost schedule context switching'
);

assert.match(
    viewNavigationFeature,
    /export function registerViewNavigationFeature/,
    'view-navigation feature must expose a registration function for calendar and main view composition'
);

assert.match(
    viewNavigationFeatureRegistrarModule,
    /import \{ registerViewNavigationFeature \} from '\.\.\/features\/view-navigation\.js';/,
    'view-navigation feature registrar must own the view-navigation feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createViewNavigationFeatureRegistrar',
    registerName: 'wireViewNavigationFeature',
    modulePath: 'view-navigation-feature-registrar.js',
    label: 'view-navigation',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerViewNavigationFeature \} from '\.\/features\/view-navigation\.js';/,
    'app.js should not directly import view-navigation after registrar extraction'
);

assert.match(
    viewNavigationFeature,
    /registerCalendarViewFeature\(/,
    'view-navigation feature must register calendar-view instead of app.js owning calendar view wiring'
);

assert.match(
    viewNavigationFeature,
    /registerMainViewNavigationFeature\(/,
    'view-navigation feature must register main-view-navigation instead of app.js owning main view navigation wiring'
);

assert.match(
    appScript,
    /wireViewNavigationFeature\(assembly\)/,
    'app.js must register view-navigation instead of direct calendar/main view navigation wiring'
);

assert.doesNotMatch(
    appScript,
    /from\s+['"]\.\/features\/view-navigation-shell\.js['"]|registerViewNavigationShellFeature\(/,
    'app.js must not import or register the pass-through view-navigation shell feature'
);

assert.match(
    appScript,
    /}\s*=\s*viewNavigationFeature;\s*switchView\s*=\s*viewNavigationFeature\.switchView;/,
    'app.js must expose view-navigation helpers directly from the view-navigation feature'
);

assert.doesNotMatch(
    appScript,
    /registerCalendarViewFeature\(|registerMainViewNavigationFeature\(/,
    'app.js should not directly register calendar-view or main-view-navigation after view-navigation extraction'
);

assert.doesNotMatch(
    appScript,
    /const\s+viewTransitionName\s*=\s*ref\(|const\s+touchStartX\s*=\s*ref\(|const\s+switchView\s*=\s*\(targetView\)\s*=>|const\s+onMainWheel\s*=\s*\(e\)\s*=>|const\s+onMainTouchEnd\s*=\s*\(e\)\s*=>|const\s+widthIcon\s*=\s*computed\(|const\s+cycleDayWidth\s*=\s*\(\)\s*=>|const\s+jumpToGhostContext\s*=\s*\(task\)\s*=>\s*\{/,
    'app.js should not retain main-view navigation gesture state, handler bodies, or ghost-context switching body after extraction'
);

assert.match(
    dropdownsFeature,
    /export function registerDropdownsFeature/,
    'dropdowns feature must expose a registration function for custom select behavior'
);

assert.match(
    dropdownsFeatureRegistrarModule,
    /import \{ registerDropdownsFeature \} from '\.\.\/features\/dropdowns\.js';/,
    'dropdowns feature registrar must own the dropdowns feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createDropdownsFeatureRegistrar',
    registerName: 'wireDropdownsFeature',
    modulePath: 'dropdowns-feature-registrar.js',
    label: 'dropdowns',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerDropdownsFeature \} from '\.\/features\/dropdowns\.js';/,
    'app.js should not directly import dropdowns after registrar extraction'
);

assert.match(
    dropdownsFeature,
    /const\s+filteredOptions\s*=\s*computed\(/,
    'dropdowns feature must own dropdown option filtering'
);

assert.match(
    dropdownsFeature,
    /const\s+selectOption\s*=\s*\(type,\s*item\)\s*=>/,
    'dropdowns feature must own dropdown option selection'
);

assert.doesNotMatch(
    appScript,
    /from\s+['"]\.\/features\/dropdowns-shell\.js['"]|registerDropdownsShellFeature\(/,
    'app.js must not import or register the pass-through dropdowns shell feature'
);

assert.match(
    appScript,
    /const\s+\{\s*dropdownSearch,[\s\S]{0,360}selectOption,\s*\}\s*=\s*dropdownsFeature;/,
    'app.js must expose dropdown values directly from the dropdowns feature'
);

assert.doesNotMatch(
    appScript,
    /const\s+dropdownSearch\s*=\s*ref\(|const\s+dropdownExpandedGroups\s*=\s*reactive\(|const\s+dropdownSearch\s*=\s*dropdownsFeature\.dropdownSearch|const\s+dropdownExpandedGroups\s*=\s*dropdownsFeature\.dropdownExpandedGroups|const\s+activeGroupFilter\s*=\s*dropdownsFeature\.activeGroupFilter|const\s+availableGroups\s*=\s*dropdownsFeature\.availableGroups|const\s+toggleDropdownGroup\s*=\s*dropdownsFeature\.toggleDropdownGroup|const\s+toggleDropdown\s*=\s*dropdownsFeature\.toggleDropdown|const\s+closeDropdowns\s*=\s*dropdownsFeature\.closeDropdowns|const\s+filteredOptions\s*=\s*dropdownsFeature\.filteredOptions|const\s+getGroupedOptions\s*=\s*dropdownsFeature\.getGroupedOptions|const\s+selectOption\s*=\s*dropdownsFeature\.selectOption|const\s+toggleDropdownGroup\s*=\s*\(groupName\)\s*=>|const\s+toggleDropdown\s*=\s*\(type\)\s*=>|const\s+availableGroups\s*=\s*computed\(|const\s+filteredOptions\s*=\s*computed\(|const\s+getGroupedOptions\s*=\s*\(list\)\s*=>|const\s+selectOption\s*=\s*\(type,\s*item\)\s*=>/,
    'app.js should not retain custom dropdown state, one-off feature property aliases, filtering, grouping, or selection handler bodies after extraction'
);

assert.match(
    settingsFeature,
    /const\s+inputRects\s*=\s*reactive\(/,
    'settings feature must own settings floating dropdown positioning state'
);

assert.match(
    settingsFeature,
    /const\s+updateInputRect\s*=\s*\(event,\s*kind\)\s*=>/,
    'settings feature must own settings floating dropdown rect updates'
);

assert.match(
    settingsFeature,
    /const\s+getFloatingStyle\s*=\s*\(kind\)\s*=>/,
    'settings feature must own settings floating dropdown style calculation'
);

assert.match(
    settingsFeature,
    /const\s+getUngroupedItems\s*=\s*\(type\)\s*=>/,
    'settings feature must own ungrouped settings item suggestions'
);

assert.match(
    settingsFeature,
    /const\s+sortSettingsList\s*=\s*\(list\)\s*=>/,
    'settings feature must own settings list sorting'
);

assert.match(
    settingsFeature,
    /const\s+sortedInstruments\s*=\s*computed\(/,
    'settings feature must expose sorted instruments'
);

assert.match(
    settingsFeature,
    /let\s+settingsDragItem\s*=\s*null/,
    'settings feature must own settings item drag state'
);

assert.match(
    settingsFeature,
    /const\s+onSettingsItemDragStart\s*=\s*\(item,\s*type,\s*event\)\s*=>/,
    'settings feature must own settings item drag-start behavior'
);

assert.match(
    settingsFeature,
    /const\s+onSettingsDrop\s*=\s*\(targetType,\s*targetGroupName,\s*event\)\s*=>/,
    'settings feature must own settings item drop-to-group behavior'
);

assert.match(
    settingsFeature,
    /const\s+disableRowDrag\s*=\s*\(event\)\s*=>/,
    'settings feature must own row drag disabling while editing settings text inputs'
);

assert.match(
    settingsFeature,
    /const\s+enableRowDrag\s*=\s*\(event\)\s*=>/,
    'settings feature must own row drag restoration after editing settings text inputs'
);

assert.match(
    settingsFeature,
    /const\s+findSettingId\s*=\s*\(type,\s*name\)\s*=>/,
    'settings feature must own case-insensitive setting id lookup by name'
);

assert.match(
    settingsFeature,
    /const\s+getOrCreateProjectId\s*=\s*\(projectName\)\s*=>/,
    'settings feature must own project id lookup/creation'
);

assert.doesNotMatch(
    appScript,
    /const\s+inputRects\s*=\s*reactive\(|const\s+updateInputRect\s*=\s*\(e,\s*kind\)\s*=>|const\s+getFloatingStyle\s*=\s*\(kind\)\s*=>|const\s+getUngroupedItems\s*=\s*\(type\)\s*=>|const\s+sortSettingsList\s*=\s*\(list\)\s*=>|const\s+sortedInstruments\s*=\s*computed\(|const\s+isAllGroupsExpanded\s*=\s*\(type\)\s*=>|const\s+toggleAllGroups\s*=\s*\(type\)\s*=>|let\s+settingsDragItem\s*=\s*null|const\s+onSettingsItemDragStart\s*=\s*\(item,\s*type,\s*e\)\s*=>|const\s+onSettingsDrop\s*=\s*\(targetType,\s*targetGroupName,\s*e\)\s*=>|const\s+disableRowDrag\s*=\s*\(e\)\s*=>|const\s+enableRowDrag\s*=\s*\(e\)\s*=>|const\s+findSettingId\s*=\s*\(type,\s*name\)\s*=>\s*\{\s*if\s*\(!name \|\| !settings\[type \+ 's'\]\) return null;|const\s+getOrCreateProjectId\s*=\s*\(projectName\)\s*=>\s*\{\s*let project = settings\.projects\.find\(p => p\.name === projectName\);/,
    'app.js should not retain settings sorting, floating dropdown, group expand, item drag/drop, row drag guard, setting id lookup, or project id creation handler bodies after extraction'
);

assert.match(
    calendarViewFeature,
    /const\s+handleHeaderDoubleTap\s*=\s*\(event\)\s*=>/,
    'calendar-view feature must own week-header double-tap view switching'
);

assert.match(
    calendarViewFeature,
    /const\s+handleMonthCellDoubleTap\s*=\s*\(event,\s*dateStr\)\s*=>/,
    'calendar-view feature must own month-cell double-tap view switching'
);

assert.match(
    calendarViewFeature,
    /const\s+smartScrollToTask\s*=\s*\(targetTask\)\s*=>\s*\{/,
    'calendar-view feature must own smart task-focused scrolling from search/stat/pool navigation'
);

assert.match(
    calendarViewFeature,
    /const\s+isToday\s*=\s*\(dateStr\)\s*=>/,
    'calendar-view feature must own calendar today-date checks'
);

assert.doesNotMatch(
    appScript,
    /let\s+lastHeaderTap|let\s+lastMonthTap|const\s+handleHeaderDoubleTap\s*=\s*\(e\)\s*=>|const\s+handleMonthCellDoubleTap\s*=\s*\(e,\s*dateStr\)\s*=>|const\s+smartScrollToTask\s*=\s*\(targetTask\)\s*=>\s*\{|const\s+isToday\s*=\s*d\s*=>\s*formatDate\(new Date\(\)\)\s*===\s*d/,
    'app.js should not retain calendar double-tap timing state, handler bodies, smart task scrolling, or today-date predicate after extraction'
);

assert.doesNotMatch(
    appScript,
    /else if \(sidebarTab\.value === 'project'\)\s*\{\s*sidebarTab\.value = 'instrument';\s*\}/,
    'app.js Tab navigation should no longer cycle into instrument sidebar view'
);

assert.match(
    tourFeature,
    /export function registerTourFeature/,
    'tour feature must expose a registration function for onboarding tour behavior'
);

assert.doesNotMatch(
    tourFeature,
    /import\s+\{\s*driver\s*\}\s+from\s+['"]driver\.js['"]/,
    'tour feature must not statically import driver.js into the initial bundle'
);

assert.doesNotMatch(
    appScript,
    /import\s+['"]driver\.js\/dist\/driver\.css['"]/,
    'app.js must not statically import driver.css into the initial stylesheet'
);

assert.match(
    tourFeature,
    /const\s+loadDriver\s*=\s*actionBag\.loadDriver\s*\|\|\s*\(\(\)\s*=>\s*Promise\.all\(\[\s*import\(['"]driver\.js['"]\),\s*import\(['"]driver\.js\/dist\/driver\.css['"]\)/,
    'tour feature must define a dynamic driver.js and driver.css loader for low-frequency onboarding tours'
);

assert.doesNotMatch(
    appScript,
    /const\s+desktopSteps\s*=\s*\[|const\s+mobileSteps\s*=\s*\[|const\s+driverObj\s*=\s*driver\(/,
    'app.js should not retain onboarding tour step arrays or Driver initialization after extraction'
);

assert.doesNotMatch(
    appScript,
    /const\s+startTour\s*=\s*tourFeature\.startTour|tourFeature\.mountTourAutostart\(\)/,
    'app.js should not retain eager direct tour feature surface wiring after extraction'
);

assert.match(
    splitTaskFeature,
    /export function registerSplitTaskFeature/,
    'split-task feature must expose a registration function for split behavior'
);

assert.match(
    splitTaskFeatureRegistrarModule,
    /import \{ registerSplitTaskFeature \} from '\.\.\/features\/split-task\.js';/,
    'split-task feature registrar must own the Split Task feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createSplitTaskFeatureRegistrar',
    registerName: 'wireSplitTaskFeature',
    modulePath: 'split-task-feature-registrar.js',
    label: 'Split Task',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerSplitTaskFeature \} from '\.\/features\/split-task\.js';/,
    'app.js should not directly import Split Task after registrar extraction'
);

assert.match(
    splitTaskFeature,
    /const\s+checkCanDeleteSplit\s*=\s*\(item\)\s*=>/,
    'split-task feature must own split-family delete-order protection'
);

assert.match(
    splitTaskFeature,
    /const\s+getFamilyTotalDuration\s*=\s*\(targetItem\)\s*=>/,
    'split-task feature must own split-family total duration calculation'
);

assert.match(
    splitTaskFeature,
    /const\s+getSplitFamilyMembers\s*=\s*\(item\)\s*=>/,
    'split-task feature must own connected split-family member lookup'
);

assert.match(
    splitTaskFeature,
    /const\s+syncFamilySharedIdentity\s*=\s*\(item,\s*fields\)\s*=>/,
    'split-task feature must own split-family shared identity synchronization'
);

assert.match(
    splitTaskFeature,
    /const\s+syncFamilyOrchestration\s*=\s*\(item,\s*newOrch\)\s*=>/,
    'split-task feature must own split-family orchestration synchronization'
);

assert.match(
    splitTaskFeature,
    /const\s+syncScheduledDurationsFromFamily\s*=\s*\(item\)\s*=>/,
    'split-task feature must own scheduled split-family duration synchronization'
);

assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcheckCanSplit:\s*splitTaskCheckCanSplit\b[\s\S]*\bcheckCanDeleteSplit\b[\s\S]*\brestoreSplitTime:\s*splitTaskRestoreSplitTime\b[\s\S]*\}\s*=\s*splitTaskFeature;/,
    'app.js may consume the split-task feature surface directly because split-task-shell is a pass-through boundary'
);

assert.doesNotMatch(
    appScript,
    /const\s+checkCanDeleteSplit\s*=\s*\(item\)\s*=>\s*\{|const\s+getFamilyTotalDuration\s*=\s*\(targetItem\)\s*=>\s*\{|const\s+getSplitFamilyMembers\s*=\s*\(item\)\s*=>\s*\{|const\s+syncFamilyLegacyFields\s*=\s*\(item,\s*viewType\)\s*=>\s*\{|const\s+syncFamilySharedIdentity\s*=\s*\(item,\s*fields\)\s*=>\s*\{|const\s+syncFamilyOrchestration\s*=\s*\(item,\s*newOrch\)\s*=>\s*\{|const\s+syncScheduledDurationsFromFamily\s*=\s*\(item\)\s*=>\s*\{|registerSplitTaskShellFeature\(|from\s+['"]\.\/features\/split-task-shell\.js['"]/,
    'app.js should not retain split-family delete protection, duration, synchronization helper bodies, or the pass-through split-task shell after split-task extraction'
);

assert.match(
    splitViewFeature,
    /export function registerSplitViewFeature/,
    'split-view feature must expose a registration function for split-state view adapters'
);

assert.match(
    splitViewFeatureRegistrarModule,
    /import \{ registerSplitViewFeature \} from '\.\.\/features\/split-view\.js';/,
    'split-view feature registrar must own the split-view feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createSplitViewFeatureRegistrar',
    registerName: 'wireSplitViewFeature',
    modulePath: 'split-view-feature-registrar.js',
    label: 'split-view',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerSplitViewFeature \} from '\.\/features\/split-view\.js';/,
    'app.js should not directly import split-view after registrar extraction'
);

assert.match(
    splitViewFeature,
    /const\s+syncItemForView\s*=\s*\(item,\s*viewType\s*=\s*'musician'\)\s*=>/,
    'split-view feature must own per-view split item synchronization'
);

assert.match(
    splitViewFeature,
    /const\s+getCurrentSplitView\s*=\s*\(\)\s*=>/,
    'split-view feature must own current split-view resolution'
);

assert.doesNotMatch(
    appScript,
    /\}\s*=\s*splitViewFeature;/,
    'app.js should not destructure unused split-view aliases; consumers take them from assembly.features.splitView'
);

assert.doesNotMatch(
    appScript,
    /const\s+syncItemForView\s*=\s*\(item,\s*viewType\s*=\s*'musician'\)\s*=>\s*\{|const\s+syncItemsForView\s*=\s*\(items,\s*viewType\s*=\s*'musician'\)\s*=>\s*\{|const\s+isItemVisibleForView\s*=\s*\(item,\s*viewType\s*=\s*'musician'\)\s*=>\s*\{|const\s+getSplitViewState\s*=\s*\(item,\s*viewType\s*=\s*'musician'\)\s*=>\s*getItemSplitState|const\s+peekSplitViewState\s*=\s*\(item,\s*viewType\s*=\s*'musician'\)\s*=>\s*peekItemSplitState|const\s+getCurrentSplitView\s*=\s*\(\)\s*=>\s*normalizeSplitViewType\(|const\s+syncItemForView\s*=\s*splitViewFeature\.syncItemForView|const\s+syncItemsForView\s*=\s*splitViewFeature\.syncItemsForView|const\s+isItemVisibleForView\s*=\s*splitViewFeature\.isItemVisibleForView|const\s+getSplitViewState\s*=\s*splitViewFeature\.getSplitViewState|const\s+peekSplitViewState\s*=\s*splitViewFeature\.peekSplitViewState|const\s+getCurrentSplitView\s*=\s*splitViewFeature\.getCurrentSplitView/,
    'app.js should not retain split-state view adapter bodies or direct split-view feature surface wiring after split-view extraction'
);

assert.doesNotMatch(
    appScript,
    /window\.triggerTouchHaptic\s*=/,
    'app.js should not install the global haptic adapter inline after haptics-service extraction'
);
assert.doesNotMatch(
    appScript,
    /window\.triggerTouchHaptic/,
    'app.js should pass the local haptics adapter instead of reading triggerTouchHaptic back from window'
);

assert.match(
    appRuntimeFeature,
    /export function registerAppRuntimeFeature/,
    'app-runtime feature must expose a registration function for root runtime orchestration'
);

assert.match(
    appRuntimeFeatureRegistrarModule,
    /import \{ registerAppRuntimeFeature \} from '\.\.\/features\/app-runtime\.js';/,
    'app-runtime feature registrar must own the app-runtime feature import'
);


assertAppFeatureRegistrarRegistry({
    factoryName: 'createAppRuntimeFeatureRegistrar',
    registerName: 'wireAppRuntimeFeature',
    modulePath: 'app-runtime-feature-registrar.js',
    label: 'app-runtime',
});

assert.doesNotMatch(
    appScript,
    /import \{ registerAppRuntimeFeature \} from '\.\/features\/app-runtime\.js';/,
    'app.js should not directly import app-runtime after registrar extraction'
);

assert.match(
    appScript,
    /appRuntimeFeature\.mountAppRuntime\(\);[\s\S]*onMounted\(\(\) => appRuntimeFeature\.mountAppLifecycle\(\)\);[\s\S]*onUnmounted\(\(\) => appRuntimeFeature\.unmountAppLifecycle\(\)\);/,
    'app.js may consume the app-runtime feature lifecycle surface directly because app-runtime-shell is a pass-through boundary'
);
for (const leakedRootReturnField of [
    'handlePageUnload',
    'isContextSwitching',
]) {
    assert.doesNotMatch(
        rootSetupReturnObject,
        new RegExp(`\\b${leakedRootReturnField}\\b`),
        `app.js root setup return should expose runtime field ${leakedRootReturnField} through feature wiring instead of the root return`
    );
}

assert.doesNotMatch(
    appScript,
    /registerAppClickHapticsFeature\(/,
    'app.js should not directly register app click haptics after app-runtime extraction'
);

assert.doesNotMatch(
    appScript,
    /appElement\.addEventListener\('click',\s*\(event\)\s*=>\s*\{[\s\S]*?triggerTouchHaptic\('Medium'\)/,
    'app.js should not retain the global app click haptic listener body after extraction'
);

assert.ok(existsSync(vercelConfigPath), 'vercel.json must exist to pin deployment output settings');
const vercelConfig = JSON.parse(readFileSync(vercelConfigPath, 'utf8'));
assert.equal(vercelConfig.outputDirectory, 'app/dist', 'vercel.json must point Vercel at app/dist');

const requiredFiles = [
    'app/scripts/app.js',
    'app/scripts/utils/time.js',
    'app/scripts/utils/format.js',
    'app/scripts/utils/id.js',
    'app/scripts/utils/midi.js',
    'app/scripts/utils/csv.js',
    'app/scripts/utils/split-state.js',
    'app/scripts/services/storage-service.js',
    'app/scripts/services/supabase-service.js',
    'app/scripts/services/app-dependencies.js',
    'app/scripts/services/app-vue-runtime.js',
    'app/scripts/features/schedule.js',
    'app/scripts/features/settings.js',
    'app/scripts/features/import-csv.js',
    'app/scripts/features/import-midi.js',
    'app/scripts/features/auth.js',
    'app/scripts/features/schedule-drag-drop.js',
    'app/scripts/features/schedule-task-activation.js',
    'app/scripts/features/mobile-auto-scroll.js',
    'app/scripts/features/mobile-drag-ghost.js',
    'app/scripts/features/mobile-touch-start.js',
    'app/scripts/features/mobile-touch-move.js',
    'app/scripts/features/mobile-touch-end.js',
    'app/scripts/features/mobile-resize.js',
    'app/scripts/features/desktop-resize.js',
    'app/scripts/features/mobile-ui.js',
    'app/scripts/features/calendar-view.js',
    'app/scripts/features/sidebar-stats.js',
    'app/scripts/features/task-editor.js',
    'app/scripts/features/track-list.js',
    'app/scripts/features/credits.js',
    'app/scripts/features/project-info.js',
    'app/scripts/features/rec-info.js',
    'app/scripts/features/orchestration.js',
    'app/scripts/features/universal-modal.js',
    'app/scripts/features/quick-add.js',
    'app/scripts/features/duration-picker.js',
    'app/scripts/features/history.js',
    'app/scripts/features/data-portability.js',
    'app/scripts/features/avatar-crop.js',
    'app/scripts/features/schedule-deletion.js',
    'app/scripts/features/session.js',
    'app/scripts/features/color-picker.js',
    'app/scripts/features/tour.js',
    'app/scripts/features/sidebar-navigation.js',
    'app/scripts/features/sidebar-preferences.js',
    'app/scripts/features/main-view-navigation.js',
    'app/scripts/features/dropdowns.js',
    'app/scripts/features/name-lookup.js',
    'app/scripts/features/visible-pool-items.js',
    'app/scripts/features/global-keyboard.js',
    'app/scripts/features/data-autosave.js',
    'app/scripts/features/app-lifecycle.js',
    'app/scripts/features/selection.js',
    'app/scripts/features/split-task.js',
    'app/scripts/features/split-view.js',
    'app/scripts/features/midi-manager.js',
    'app/scripts/state/data-io-state.js',
    'app/scripts/state/import-data-state.js',
    'app/scripts/state/track-list-state.js',
    'app/scripts/state/midi-manager-state.js',
    'app/scripts/state/metadata-modal-state.js',
    'app/scripts/state/root-shell-state.js',
    'app/scripts/state/shell-state-factory.js',
    'app/scripts/services/app-assembly.js',
    'app/scripts/services/app-lazy-feature-wirings.js',
    'app/scripts/services/app-root-context-wiring.js',
    'app/scripts/state/mobile-controls-shell-state.js',
    'app/scripts/state/credit-modal-shell-state.js',
    'app/scripts/state/confirm-modal-shell-state.js',
    'app/scripts/state/input-modal-shell-state.js',
    'app/scripts/state/split-modal-shell-state.js',
    'scripts/supabase-keepalive.mjs'
];

assert.ok(
    requiredFiles.includes('app/scripts/services/app-dependencies.js'),
    'modularization smoke should syntax-check the app dependency service'
);
assert.ok(
    requiredFiles.includes('app/scripts/services/app-vue-runtime.js'),
    'modularization smoke should syntax-check the app Vue runtime service'
);

for (const relativePath of requiredFiles) {
    const absolutePath = resolveFixturePath(relativePath);
    assert.ok(existsSync(absolutePath), `${relativePath} must exist`);
    execFileSync(process.execPath, ['--check', absolutePath], { stdio: 'pipe' });
}

{
    const calls = [];
    const itemA = { id: 'A', visible: { project: true } };
    const itemB = { id: 'B', visible: { project: false } };
    const splitViewRefs = {
        trackListData: { value: { viewType: 'project' } },
        sidebarTab: { value: 'instrument' },
    };
    const feature = registerSplitViewFeature({
        refs: splitViewRefs,
        split: {
            ensureItemSplitViews: (item) => calls.push(['ensure', item.id]),
            syncLegacySplitFields: (item, viewType) => {
                calls.push(['syncLegacy', item.id, viewType]);
                item.syncedView = viewType;
            },
            peekItemVisibilityInView: (item, viewType) => !!item.visible?.[viewType],
            getItemSplitState: (item, viewType) => ({ id: item.id, viewType, live: true }),
            peekItemSplitState: (item, viewType) => ({ id: item.id, viewType, live: false }),
            normalizeSplitViewType: (viewType) => (['musician', 'project', 'instrument'].includes(viewType) ? viewType : 'musician'),
        },
    });

    assert.equal(feature.syncItemForView(itemA, 'project'), itemA, 'split-view sync should return the original item');
    assert.deepEqual(calls, [['ensure', 'A'], ['syncLegacy', 'A', 'project']], 'split-view sync should ensure split maps before syncing legacy fields');
    assert.equal(itemA.syncedView, 'project', 'split-view sync should pass through the requested view type');
    assert.deepEqual(feature.syncItemsForView([itemA, itemB], 'project'), [itemA, itemB], 'split-view bulk sync should return the original list');
    assert.equal(feature.isItemVisibleForView(itemA, 'project'), true, 'split-view visibility should use the non-mutating visibility lookup');
    assert.equal(feature.isItemVisibleForView(itemB, 'project'), false, 'split-view visibility should preserve false lookups');
    assert.deepEqual(feature.getSplitViewState(itemA, 'instrument'), { id: 'A', viewType: 'instrument', live: true }, 'split-view state should use the live split-state lookup');
    assert.deepEqual(feature.peekSplitViewState(itemA, 'instrument'), { id: 'A', viewType: 'instrument', live: false }, 'split-view peek should use the non-mutating split-state lookup');
    assert.equal(feature.getCurrentSplitView(), 'project', 'split-view current view should prefer an active TrackList view');

    splitViewRefs.trackListData.value = null;
    assert.equal(feature.getCurrentSplitView(), 'instrument', 'split-view current view should fall back to the sidebar tab');
    splitViewRefs.sidebarTab.value = 'unknown';
    assert.equal(feature.getCurrentSplitView(), 'musician', 'split-view current view should normalize invalid sidebar tabs');
}

{
    const refs = {
        settings: vueReactive({
            projects: [],
            instruments: [
                { id: 'I_BSN', name: 'Bassoon', group: 'Woodwinds' },
                { id: 'I_VLN', name: 'Violin', group: 'Strings' },
            ],
        }),
        managingProject: vueRef(null),
        showMidiImportModal: vueRef(true),
        midiImportData: vueRef([
            { id: 1, name: 'Bassoon 1', selected: true, instrumentId: '', group: 'Unassigned', createNew: true },
        ]),
        midiBpm: vueRef(120),
        midiTempoMap: vueRef(null),
        midiTimeSigs: vueRef(null),
        midiViewMode: vueRef('tracks'),
        midiTimeSig: vueRef([4, 4]),
        activeImportMenu: vueReactive({ rowId: null, type: null }),
        importMenuPos: vueReactive({ top: 0, left: 0, width: 0 }),
        importSearchQuery: vueRef(''),
    };
    let focusedId = null;
    let loadMidiCount = 0;
    const sortedInstruments = vueRef([...refs.settings.instruments]);

    const feature = registerImportMidiFeature({
        refs,
        utils: {
            buildTempoMap: () => ({ events: [{ bpm: 120, mpb: 500000 }] }),
            buildTimeSigMap: () => [{ timeSignature: [4, 4] }],
            extractNotesFromJZZTrack: () => [],
            calculateBarQuantizedDuration: () => ({ seconds: 0, rawSeconds: 0, bars: 0 }),
            normalizeForMatch: (value) => String(value || '').toLowerCase().replace(/[^a-z0-9#]+/g, ' ').trim(),
            generateUniqueId: () => 'I_NEW',
            generateRandomHexColor: () => '#123456',
            formatSecs: (value) => String(value),
        },
        actions: {
            openAlertModal: () => {},
            pushHistory: () => {},
            triggerTouchHaptic: () => {},
            sortedInstruments,
            nextTick: (callback) => callback(),
            getElementById: (id) => ({ focus: () => { focusedId = id; } }),
            loadMidiSmf: async () => {
                loadMidiCount += 1;
                return () => [{
                    forEach(callback) {
                        callback({ ff: 0x03, dd: 'Bassoon 1' });
                    },
                }];
            },
        },
    });

    assert.equal(loadMidiCount, 0, 'registering MIDI import must not load the MIDI parser');
    assert.equal(feature.findGroupSmart('Bassoon 1'), 'Woodwinds', 'MIDI smart grouping must not match Bass inside Bassoon as Strings');
    assert.equal(feature.findGroupSmart('Double Bass'), 'Strings', 'MIDI smart grouping should still match Double Bass as Strings');

    feature.openImportMenu({
        currentTarget: {
            getBoundingClientRect: () => ({ bottom: 20, left: 30, width: 140 }),
        },
    }, 1, 'inst');
    assert.deepEqual(refs.activeImportMenu, { rowId: 1, type: 'inst' }, 'opening MIDI import menu should track the active row and type');
    assert.deepEqual(refs.importMenuPos, { top: 25, left: 30, width: 140 }, 'opening MIDI import menu should preserve original floating position calculation');
    assert.equal(focusedId, 'midi-import-search', 'opening MIDI import menu should focus the search input');
    refs.importSearchQuery.value = 'vio';
    assert.deepEqual(feature.filteredImportOptions.value.map((item) => item.id), ['I_VLN'], 'instrument import menu filtering should search sorted instruments');

    feature.selectImportInst(refs.midiImportData.value[0], refs.settings.instruments[1]);
    assert.equal(refs.midiImportData.value[0].instrumentId, 'I_VLN', 'selecting an import instrument should set the target instrument id');
    assert.equal(refs.midiImportData.value[0].group, 'Strings', 'selecting an import instrument in track view should update group from the instrument');
    assert.equal(refs.midiImportData.value[0].createNew, false, 'selecting an existing import instrument should clear createNew');
    assert.deepEqual(refs.activeImportMenu, { rowId: null, type: null }, 'selecting an import option should close the menu');

    refs.midiViewMode.value = 'groups';
    refs.midiImportData.value[0].group = 'Manual Group';
    feature.selectImportInst(refs.midiImportData.value[0], refs.settings.instruments[0]);
    assert.equal(refs.midiImportData.value[0].group, 'Manual Group', 'selecting an import instrument in group view should not move the row to a different group');

    feature.toggleMidiGroupExpand('Woodwinds');
    assert.equal(feature.midiGroupExpanded.has('Woodwinds'), true, 'MIDI group expansion should add a collapsed group name on first toggle');
    feature.toggleMidiGroupExpand('Woodwinds');
    assert.equal(feature.midiGroupExpanded.has('Woodwinds'), false, 'MIDI group expansion should remove an expanded group name on second toggle');

    refs.midiImportData.value[0].instrumentId = 'I_BSN';
    feature.selectImportNewInst(refs.midiImportData.value[0]);
    assert.equal(refs.midiImportData.value[0].instrumentId, '', 'selecting create-new should clear the instrument id');
    assert.equal(refs.midiImportData.value[0].createNew, true, 'selecting create-new should mark the row for instrument creation');

    feature.selectImportGroup(refs.midiImportData.value[0], 'Woodwinds');
    assert.equal(refs.midiImportData.value[0].group, 'Woodwinds', 'selecting an import group should update the row group');

    const OriginalFileReader = globalThis.FileReader;
    globalThis.FileReader = class {
        readAsBinaryString() {
            queueMicrotask(() => {
                this.onload({ target: { result: 'midi-bytes' } });
            });
        }
    };
    try {
        feature.processMidiFile({ name: 'fixture.mid' });
        assert.equal(loadMidiCount, 0, 'starting MIDI file read should wait for FileReader before loading the parser');
        await Promise.resolve();
        await Promise.resolve();
        assert.equal(loadMidiCount, 1, 'MIDI parser should load lazily when a selected file is parsed');
        assert.equal(refs.showMidiImportModal.value, true, 'parsing MIDI should still show the import modal');
        assert.equal(refs.midiImportData.value[0].name, 'Bassoon 1', 'lazy MIDI parser should preserve parsed track names');
    } finally {
        globalThis.FileReader = OriginalFileReader;
    }

    const historyCalls = [];
    const successHaptics = [];
    refs.managingProject.value = { id: 'P_MIDI', midiData: {} };
    refs.midiViewMode.value = 'tracks';
    refs.midiImportData.value = [{
        id: 10,
        name: 'Violin 1',
        originalName: 'Violin 1',
        suggestedInstName: 'violin ',
        instrumentId: '',
        createNew: true,
        selected: true,
        quantizedDuration: 1800,
        group: 'Strings',
        _sortIndex: 3,
    }];
    feature.confirmMidiImport();
    assert.equal(refs.settings.instruments.filter((item) => item.name === 'Violin').length, 1, 'MIDI import should reuse an existing instrument when create-new differs only by case or whitespace');
    assert.deepEqual(refs.managingProject.value.midiData.I_VLN, [{ name: 'Violin 1', duration: '1800', order: 3 }], 'MIDI import should attach parsed tracks to the reused existing instrument');
}

{
    const refs = {
        itemPool: vueRef([
            { id: 'ITEM1', sessionId: 'S1', projectId: 'P1', instrumentId: 'I1', musicianId: 'M1', splitTag: 'Lead', sectionIndex: 0 },
            { id: 'ITEM2', sessionId: 'S1', projectId: 'P1', instrumentId: 'I2', musicianId: 'M1', splitTag: 'Bassoon Detail', sectionIndex: 1 },
        ]),
        scheduledTasks: vueRef([
            { scheduleId: 1, sessionId: 'S1', musicianId: 'M1', date: '2026-05-29', startTime: '09:00', recordingInfo: { studio: 'Room A' } },
            { scheduleId: 2, sessionId: 'S1', musicianId: 'M1', date: '2026-05-29', startTime: '10:00', recordingInfo: { studio: 'Room B' } },
            { scheduleId: 3, sessionId: 'S1', projectId: 'P1', date: '2026-05-29', startTime: '11:00' },
        ]),
        globalSearchQuery: vueRef(''),
        currentSearchIndex: vueRef(0),
        searchHighlightTimer: vueRef(null),
        lastHighlightedTrackId: vueRef(null),
        lastTrackSearchQuery: vueRef(''),
        trackSearchIndex: vueRef(-1),
        trackListSearchQuery: vueRef(''),
        trackListData: vueRef({ items: [] }),
        showTrackList: vueRef(false),
        isSearchFocused: vueRef(false),
        isMobile: vueRef(false),
    };
    const state = {
        sidebarTab: vueRef('musician'),
        musicianStats: vueRef([{ id: 'M1', statusKey: 'completed' }]),
        projectStats: vueRef([{ id: 'P1', statusKey: 'in-progress' }]),
        instrumentStats: vueRef([{ id: 'I1', statusKey: 'missing' }]),
        settings: {
            musicians: [{ id: 'M1', name: 'Yi Li Player', group: 'Soloists' }],
            projects: [{ id: 'P1', name: 'Dragon Score Film', group: 'Feature' }],
            instruments: [
                { id: 'I1', name: 'Violin', group: 'Strings' },
                { id: 'I2', name: 'Bassoon', group: 'Woodwinds' },
            ],
        },
    };
    const names = {
        musician: { M1: 'Yi Li Player' },
        project: { P1: 'Dragon Score Film' },
        instrument: { I1: 'Violin', I2: 'Bassoon' },
    };
    const pinyinMatcher = vueRef(null);
    let pinyinLoadCount = 0;
    const feature = registerSearchFeature({
        refs,
        state,
        utils: {
            getNameById: (id, type) => names[type]?.[id] || '',
            pinyinMatch: pinyinMatcher,
            ensurePinyinMatch: async () => {
                pinyinLoadCount += 1;
                pinyinMatcher.value = (text, keyword) => text === 'Yi Li Player' && keyword === 'yili';
            },
        },
        actions: {
            openAlertModal: () => {},
            smartScrollToTask: () => {},
            triggerTouchHaptic: () => {},
            getSidebarList: () => [],
        },
    });

    refs.globalSearchQuery.value = 'yili';
    await vueNextTick();
    assert.equal(pinyinLoadCount, 1, 'search feature should lazily request pinyin matching after the first non-empty query');
    assert.deepEqual(feature.filteredScheduledTasks.value.map((task) => task.scheduleId), [1, 2, 3], 'search feature should smart-match no-space/pinyin schedule and aggregate child text');

    refs.globalSearchQuery.value = 'Bassoon';
    await vueNextTick();
    assert.equal(pinyinLoadCount, 1, 'search feature should reuse the loaded pinyin matcher instead of loading it again');
    assert.deepEqual(feature.filteredScheduledTasks.value.map((task) => task.scheduleId), [2], 'search feature should match aggregate child items by schedule section');

    refs.globalSearchQuery.value = 'finished';
    assert.deepEqual(feature.filteredScheduledTasks.value.map((task) => task.scheduleId), [1, 2], 'search feature should preserve status-keyword filtering for the active sidebar context');

    state.sidebarTab.value = 'project';
    refs.globalSearchQuery.value = '进行中 Dragon';
    assert.deepEqual(feature.filteredScheduledTasks.value.map((task) => task.scheduleId), [3], 'search feature should combine status and text filters in project context');

    assert.equal(feature.getNameWithGroup('I2', 'instrument'), 'Bassoon Woodwinds', 'search name-with-group lookup should include the setting group text');
    assert.equal(feature.getNameWithGroup('missing', 'instrument'), '', 'search name-with-group lookup should return empty text for missing ids');
    assert.equal(feature.getNameWithGroup(null, 'project'), '', 'search name-with-group lookup should return empty text for empty ids');
}

{
    const refs = {
        currentView: vueRef('week'),
        monthViewMode: vueRef('paged'),
        viewDate: vueRef(new Date('2026-05-29T00:00:00')),
        visibleTopDate: vueRef(new Date('2026-05-29T00:00:00')),
        monthObserver: vueRef(null),
        monthRefs: vueRef([]),
        filteredScheduledTasks: vueRef([]),
        weekContainer: vueRef(null),
        pxPerMin: vueRef(1),
    };
    const haptics = [];
    const switches = [];
    const nowValues = [1000, 1290, 2000, 2200, 2600, 2800];
    const feature = registerCalendarViewFeature({
        refs,
        state: {
            settings: { startHour: 9, endHour: 18 },
        },
        utils: {
            formatDate: (date) => date.toISOString().slice(0, 10),
        },
        actions: {
            triggerTouchHaptic: (type) => haptics.push(type),
            switchView: (targetView) => {
                switches.push(targetView);
                refs.currentView.value = targetView;
            },
            getNow: () => nowValues.shift(),
            getDate: () => new Date('2026-05-29T12:00:00'),
        },
    });

    assert.equal(feature.isToday('2026-05-29'), true, 'calendar today check should compare against the injected current date');
    assert.equal(feature.isToday('2026-05-30'), false, 'calendar today check should reject non-current dates');

    let prevented = 0;
    const bareEvent = {
        preventDefault: () => { prevented += 1; },
        target: { closest: () => null },
    };

    feature.handleHeaderDoubleTap(bareEvent);
    assert.deepEqual(switches, [], 'first week-header tap should only arm double-tap detection');
    feature.handleHeaderDoubleTap(bareEvent);
    assert.deepEqual(switches, ['month'], 'second week-header tap inside 300ms should switch to month view');
    assert.equal(prevented, 1, 'week-header double tap should prevent default browser gestures');

    feature.handleMonthCellDoubleTap({
        preventDefault: () => { throw new Error('task-block tap should not be prevented'); },
        target: { closest: (selector) => selector === '.task-block' ? {} : null },
    }, '2026-06-01');
    assert.equal(refs.currentView.value, 'month', 'tapping a task block inside a month cell should not switch views');

    feature.handleMonthCellDoubleTap(bareEvent, '2026-06-02');
    assert.equal(refs.currentView.value, 'month', 'first month-cell tap should only arm double-tap detection');
    feature.handleMonthCellDoubleTap(bareEvent, '2026-06-02');
    assert.equal(refs.currentView.value, 'week', 'second month-cell tap on the same date inside 300ms should switch to week view');
    assert.equal(refs.viewDate.value.toISOString().slice(0, 10), '2026-06-02', 'month-cell double tap should open the tapped date in week view');

}

{
    const scrollCalls = [];
    const container = {
        scrollWidth: 770,
        clientWidth: 350,
        scrollTop: 0,
        scrollTo(call) {
            scrollCalls.push(call);
            if (typeof call.top === 'number') this.scrollTop = call.top;
        },
    };
    const refs = {
        currentView: vueRef('month'),
        monthViewMode: vueRef('paged'),
        viewDate: vueRef(new Date('2026-05-29T00:00:00')),
        visibleTopDate: vueRef(new Date('2026-05-29T00:00:00')),
        monthObserver: vueRef(null),
        monthRefs: vueRef([]),
        filteredScheduledTasks: vueRef([]),
        weekContainer: vueRef(container),
        pxPerMin: vueRef(2),
        isMobile: vueRef(true),
        flashingTaskId: vueRef(null),
        mobileTab: vueRef('pool'),
    };
    const scheduledDelays = [];
    const feature = registerCalendarViewFeature({
        refs,
        state: {
            settings: { startHour: 9, endHour: 18 },
        },
        utils: {
            formatDate: (date) => date.toISOString().slice(0, 10),
            timeToMinutes: (time) => {
                assert.equal(time, '10:30', 'smart scroll should parse target task start time');
                return 630;
            },
        },
        actions: {
            triggerTouchHaptic: () => {},
            switchView: () => {},
            setTimeoutFn: (callback, delay) => {
                scheduledDelays.push(delay);
                callback();
                return delay;
            },
        },
    });

    feature.smartScrollToTask({
        scheduleId: 'S1',
        date: '2026-06-01',
        startTime: '10:30',
    });

    assert.equal(refs.mobileTab.value, 'schedule', 'smart task scrolling should switch mobile users back to the schedule tab');
    assert.equal(refs.currentView.value, 'week', 'smart task scrolling should open the week view');
    assert.equal(refs.viewDate.value.getFullYear(), 2026, 'smart task scrolling should open the task year');
    assert.equal(refs.viewDate.value.getMonth(), 5, 'smart task scrolling should open the task month');
    assert.equal(refs.viewDate.value.getDate(), 1, 'smart task scrolling should open the task day');
    assert.equal(feature.dateTransitionName.value, 'slide-next', 'smart task scrolling should preserve forward date transition direction');
    assert.equal(refs.flashingTaskId.value, null, 'smart task scrolling should clear task highlight after its timeout');
    assert.deepEqual(scheduledDelays, [2500, 1000, 600], 'smart task scrolling should preserve highlight, delayed scroll, and scroll correction timers');
    assert.equal(scrollCalls[0].top, 130, 'smart task scrolling should preserve week-container vertical scroll target');
    assert.equal(scrollCalls[0].behavior, 'smooth', 'smart task scrolling should preserve smooth week-container scrolling');
    assert.ok(
        Math.abs(scrollCalls[0].left - 21.428571428571416) < 0.000001,
        'smart task scrolling should preserve week-container horizontal scroll target',
    );
}

{
    const feature = registerScheduleFeature({
        refs: {
            itemPool: vueRef([]),
            scheduledTasks: vueRef([
                { templateId: 'T_SCHEDULED' },
                { templateId: undefined },
                { templateId: 'T_OTHER' },
            ]),
            currentSessionId: vueRef('S_DEFAULT'),
            trackListData: vueRef({ schedules: [], items: [] }),
            showTrackList: vueRef(false),
            pxPerMin: vueRef(1),
            sidebarTab: vueRef('musician'),
        },
        state: {
            settings: { startHour: 9, endHour: 10 },
        },
        utils: {
            parseTime: () => 0,
            timeToMinutes: () => 0,
            getNameById: () => '',
            addMinutesToTimeValue: (timeStr, minutes, options) => {
                assert.deepEqual(
                    options,
                    { minMinutes: 540, maxMinutes: 570, stepMinutes: 30 },
                    'schedule time stepping should derive bounds from settings',
                );
                return `${timeStr}+${minutes}`;
            },
        },
        actions: {
            pushHistory: () => {},
            triggerTouchHaptic: () => {},
        },
    });

    assert.equal(feature.hasRecordingInfo({}), false, 'schedule info indicator should stay hidden when no recording/edit details exist');
    assert.equal(feature.hasRecordingInfo({ recordingInfo: { studio: '  ' }, editInfo: { notes: '' } }), false, 'schedule info indicator should ignore blank recording/edit fields');
    assert.equal(feature.hasRecordingInfo({ recordingInfo: { engineer: 'Ada' } }), true, 'schedule info indicator should show for populated recording info');
    assert.equal(feature.hasRecordingInfo({ editInfo: { notes: 'Retake bar 12' } }), true, 'schedule info indicator should show for populated edit info');
    assert.equal(feature.getMins('09:30'), 570, 'schedule minute conversion should convert HH:MM to minutes');
    assert.equal(feature.getMins(''), 0, 'schedule minute conversion should preserve empty-time fallback');
    assert.equal(feature.addMinutesToTime('09:30', 30), '09:30+30', 'schedule time stepping should use the configured bounded time helper');
    assert.deepEqual(
        [...feature.scheduledTemplateIds.value].sort(),
        ['T_OTHER', 'T_SCHEDULED'],
        'scheduled template tracking should include only defined scheduled template ids',
    );
    assert.equal(feature.isScheduled('T_SCHEDULED'), true, 'scheduled-state checks should report scheduled pool templates');
    assert.equal(feature.isScheduled('T_MISSING'), false, 'scheduled-state checks should report unscheduled pool templates');
}

{
    const currentWeekDays = vueRef([
        { dateStr: '2026-05-24' },
        { dateStr: '2026-05-25' },
        { dateStr: '2026-05-26' },
        { dateStr: '2026-05-27' },
        { dateStr: '2026-05-28' },
        { dateStr: '2026-05-29' },
        { dateStr: '2026-05-30' },
    ]);
    const refs = {
        itemPool: vueRef([]),
        scheduledTasks: vueRef([
            { scheduleId: 'BLOCKER', date: '2026-05-29', startTime: '10:30', estDuration: '00:30', musicianId: 'M1' },
        ]),
        currentSessionId: vueRef('S_DEFAULT'),
        trackListData: vueRef({ schedules: [], items: [] }),
        showTrackList: vueRef(false),
        pxPerMin: vueRef(1),
        sidebarTab: vueRef('musician'),
        currentView: vueRef('week'),
        viewDate: vueRef(new Date('2026-05-24T00:00:00')),
        currentWeekDays,
    };
    const haptics = [];
    let historyCount = 0;
    const feature = registerScheduleFeature({
        refs,
        state: {
            settings: { startHour: 9 },
        },
        utils: {
            parseTime: (duration) => {
                const [mins = '0', secs = '0'] = String(duration).split(':');
                return Number(mins) * 60 + Number(secs);
            },
            timeToMinutes: (time) => {
                const [hours = '0', minutes = '0'] = String(time).split(':');
                return Number(hours) * 60 + Number(minutes);
            },
            getNameById: () => '',
            addDaysToDate: (dateStr, days) => {
                const date = new Date(dateStr);
                date.setDate(date.getDate() + days);
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            },
            addMinutesToTime: (timeStr, minutes) => {
                const [hours = '0', currentMinutes = '0'] = String(timeStr).split(':');
                const total = Math.max(0, Number(hours) * 60 + Number(currentMinutes) + minutes);
                return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
            },
        },
        actions: {
            pushHistory: () => { historyCount += 1; },
            triggerTouchHaptic: (type) => haptics.push(type),
        },
    });

    const task = { scheduleId: 'MOVE', date: '2026-05-29', startTime: '10:00', estDuration: '00:30', musicianId: 'M1' };
    feature.moveTask(task, 'down');
    assert.equal(task.startTime, '10:00', 'schedule task movement should not move into an overlapping week slot');

    assert.equal(historyCount, 0, 'schedule task movement should not push history when blocked by overlap');

    feature.moveTask(task, 'left');
    assert.equal(task.date, '2026-05-28', 'schedule task movement should move left by one day');
    assert.equal(historyCount, 1, 'schedule task movement should push history when date changes');

    task.date = '2026-05-24';
    feature.moveTask(task, 'left');
    assert.equal(task.date, '2026-05-23', 'schedule task movement should preserve crossing before the visible week');
    assert.equal(refs.viewDate.value.toISOString().slice(0, 10), '2026-05-23', 'schedule task movement should shift the week view when moving before the visible week');

    refs.currentView.value = 'month';
    refs.viewDate.value = new Date('2026-05-01T00:00:00');
    task.date = '2026-05-30';
    feature.moveTask(task, 'right');
    assert.equal(task.date, '2026-05-31', 'month schedule task movement should move right by one day');
    feature.moveTask(task, 'right');
    assert.equal(task.date, '2026-06-01', 'month schedule task movement should cross month boundaries');
    assert.equal(refs.viewDate.value.toISOString().slice(0, 10), '2026-06-01', 'month schedule task movement should switch the visible month when crossing a boundary');
}

{
    const refs = {
        itemPool: vueRef([]),
        scheduledTasks: vueRef([
            { scheduleId: 'TARGET', date: '2026-05-29', startTime: '10:00', estDuration: '60:00' },
            { scheduleId: 'BEFORE', date: '2026-05-29', startTime: '09:00', estDuration: '60:00' },
            { scheduleId: 'OVERLAP_START', date: '2026-05-29', startTime: '09:30', estDuration: '60:00' },
            { scheduleId: 'OVERLAP_END', date: '2026-05-29', startTime: '10:30', estDuration: '45:00' },
            { scheduleId: 'AFTER', date: '2026-05-29', startTime: '11:00', estDuration: '30:00' },
            { scheduleId: 'OTHER_DAY', date: '2026-05-30', startTime: '10:30', estDuration: '60:00' },
        ]),
        currentSessionId: vueRef('S_DEFAULT'),
        trackListData: vueRef({ schedules: [], items: [] }),
        showTrackList: vueRef(false),
        pxPerMin: vueRef(1),
        sidebarTab: vueRef('musician'),
    };
    const feature = registerScheduleFeature({
        refs,
        state: {
            settings: { startHour: 9 },
        },
        utils: {
            parseTime: (duration) => {
                const [mins = '0', secs = '0'] = String(duration).split(':');
                return Number(mins) * 60 + Number(secs);
            },
            timeToMinutes: (time) => {
                const [hours = '0', minutes = '0'] = String(time).split(':');
                return Number(hours) * 60 + Number(minutes);
            },
            getNameById: () => '',
        },
        actions: {
            pushHistory: () => {},
            triggerTouchHaptic: () => {},
        },
    });

    assert.equal(
        feature.getOverlapCount(refs.scheduledTasks.value[0]),
        2,
        'schedule overlap count should count only same-day tasks that overlap the target and exclude the target itself',
    );
}

{
    const refs = {
        itemPool: vueRef([]),
        scheduledTasks: vueRef([]),
        settingsExpandedGroups: vueReactive(new Set()),
        newSettingsItem: vueReactive({
            instrument: { name: '', group: '' },
            musician: { name: '', group: '' },
            project: { name: '', group: '' },
        }),
        settingsGroupFocus: vueRef(null),
    };
    const state = {
        settings: vueReactive({
            instruments: [
                { id: 'I2', name: 'Cello', group: '', dragMarker: true },
                { id: 'I1', name: 'Violin', group: 'Strings' },
                { id: 'I3', name: 'Bassoon', group: '' },
            ],
            musicians: [
                { id: 'M1', name: 'Zed', group: '' },
                { id: 'M2', name: 'Amy', group: '' },
            ],
            projects: [
                { id: 'P1', name: 'Project A', group: 'Film' },
            ],
        }),
    };
    const dragOverGroups = [
        { classList: { removed: [], remove(name) { this.removed.push(name); } } },
    ];
    const draggableRows = [
        { style: { opacity: '0.4' } },
    ];
    let historyCount = 0;
    const haptics = [];

    const feature = registerSettingsFeature({
        refs,
        state,
        utils: {
            generateUniqueId: () => 'NEW',
            generateRandomHexColor: () => '#abcdef',
        },
        actions: {
            pushHistory: () => { historyCount += 1; },
            triggerTouchHaptic: (type) => haptics.push(type),
            openConfirmModal: () => {},
            openAlertModal: () => {},
            cleanupEmptySchedules: () => {},
            autoUpdateEfficiency: () => {},
            getWindowInnerHeight: () => 500,
            querySelectorAll: (selector) => {
                if (selector === '.settings-group-container') return dragOverGroups;
                if (selector === '[draggable=true]') return draggableRows;
                return [];
            },
        },
    });

    const wrapper = {
        getBoundingClientRect: () => ({ top: 120, left: 40, width: 180, height: 30 }),
    };
    feature.updateInputRect({
        target: { closest: (selector) => selector === '.settings-name-wrapper' ? wrapper : null },
    }, 'name');
    assert.deepEqual(feature.inputRects.name, { top: 120, left: 40, width: 180, height: 30 }, 'settings feature should store independent floating rects by input kind');
    assert.deepEqual(feature.getFloatingStyle('name'), {
        position: 'fixed',
        left: '40px',
        width: '180px',
        margin: 0,
        zIndex: 99999,
        top: '155px',
        bottom: 'auto',
        transformOrigin: 'top center',
    }, 'settings feature should position dropdown below when there is enough room');

    const lowWrapper = {
        getBoundingClientRect: () => ({ top: 360, left: 20, width: 120, height: 30 }),
    };
    feature.updateInputRect({
        target: { closest: (selector) => selector === '.settings-group-wrapper' ? lowWrapper : null },
    }, 'group');
    assert.deepEqual(feature.getFloatingStyle('group'), {
        position: 'fixed',
        left: '20px',
        width: '120px',
        margin: 0,
        zIndex: 99999,
        top: 'auto',
        bottom: '145px',
        transformOrigin: 'bottom center',
    }, 'settings feature should position dropdown above when space below is limited');

    feature.settingsNameFocus.value = 'instrument';
    refs.settingsGroupFocus.value = 'instrument';
    feature.onSettingsScroll();
    assert.equal(feature.settingsNameFocus.value, null, 'settings scroll should close the name suggestion dropdown');
    assert.equal(refs.settingsGroupFocus.value, null, 'settings scroll should close the group suggestion dropdown');

    assert.deepEqual(
        feature.getUngroupedItems('instrument').map((item) => item.name),
        ['Bassoon', 'Cello'],
        'settings feature should return ungrouped items sorted by zh-CN name',
    );

    assert.deepEqual(
        feature.sortedInstruments.value.map((item) => item.name),
        ['Violin', 'Bassoon', 'Cello'],
        'settings feature should sort grouped settings items before ungrouped items and then by name',
    );
    assert.deepEqual(
        state.settings.instruments.map((item) => item.name),
        ['Cello', 'Violin', 'Bassoon'],
        'settings sorted lists should not mutate the underlying settings order',
    );
    assert.deepEqual(
        feature.sortedMusicians.value.map((item) => item.name),
        ['Amy', 'Zed'],
        'settings feature should expose sorted musicians',
    );
    assert.deepEqual(
        feature.sortedProjects.value.map((item) => item.name),
        ['Project A'],
        'settings feature should expose sorted projects',
    );

    assert.equal(feature.findSettingId('instrument', ' violin '), 'I1', 'settings id lookup should match names case-insensitively after trimming input');
    assert.equal(feature.findSettingId('project', 'missing'), null, 'settings id lookup should return null when no setting name matches');
    assert.equal(feature.findSettingId('unknown', 'Violin'), null, 'settings id lookup should return null for unknown setting types');
    assert.equal(feature.findSettingId('instrument', ''), null, 'settings id lookup should return null for empty names');

    assert.equal(feature.getOrCreateProjectId('Project A'), 'P1', 'project id creation should reuse existing exact project names');
    assert.equal(feature.getOrCreateProjectId('New Project'), 'NEW', 'project id creation should return the generated id for new projects');
    assert.deepEqual(
        state.settings.projects.at(-1),
        { id: 'NEW', name: 'New Project', color: '#abcdef' },
        'project id creation should append a generated project with a random color',
    );

    assert.equal(feature.isAllGroupsExpanded('instrument'), false, 'settings groups should not report all-expanded before toggling');
    feature.toggleAllGroups('instrument');
    assert.equal(feature.isAllGroupsExpanded('instrument'), true, 'toggleAllGroups should expand every grouped settings section');
    assert.deepEqual(
        Array.from(refs.settingsExpandedGroups).sort(),
        ['instrument|', 'instrument|Strings'],
        'toggleAllGroups should use the same compound keys as individual group toggles',
    );
    feature.toggleAllGroups('instrument');
    assert.equal(feature.isAllGroupsExpanded('instrument'), false, 'toggleAllGroups should collapse every grouped settings section when all are expanded');

    let preventedInputDrag = false;
    const guardedRow = { style: { opacity: '1' } };
    feature.onSettingsItemDragStart(state.settings.instruments[0], 'instrument', {
        target: { closest: (selector) => selector === 'input, button, select, i' ? {} : null },
        currentTarget: guardedRow,
        preventDefault: () => { preventedInputDrag = true; },
        dataTransfer: { setData() {} },
    });
    assert.equal(preventedInputDrag, true, 'settings item drag should be prevented when starting from controls inside the row');
    assert.equal(guardedRow.style.opacity, '1', 'prevented settings item drag should not dim the row');

    const row = { style: { opacity: '1' } };
    const transfer = { effectAllowed: '', payload: null, setData(type, value) { this.payload = { type, value }; } };
    feature.onSettingsItemDragStart(state.settings.instruments[0], 'instrument', {
        target: { closest: () => null },
        currentTarget: row,
        dataTransfer: transfer,
    });
    assert.equal(row.style.opacity, '0.4', 'settings item drag start should dim the dragged row');
    assert.equal(transfer.effectAllowed, 'move', 'settings item drag start should set move effect');
    assert.deepEqual(transfer.payload, {
        type: 'text/plain',
        value: JSON.stringify(state.settings.instruments[0]),
    }, 'settings item drag start should preserve the original dataTransfer payload');

    const dropTarget = {
        classList: {
            added: [],
            removed: [],
            add(name) { this.added.push(name); },
            remove(name) { this.removed.push(name); },
        },
    };
    let dragOverPrevented = false;
    feature.onSettingsDragOver({
        preventDefault: () => { dragOverPrevented = true; },
        currentTarget: dropTarget,
    });
    assert.equal(dragOverPrevented, true, 'settings drag over should allow dropping while dragging a settings item');
    assert.deepEqual(dropTarget.classList.added, ['drag-over'], 'settings drag over should add the drag-over class');

    feature.onSettingsDragLeave({ currentTarget: dropTarget });
    assert.deepEqual(dropTarget.classList.removed, ['drag-over'], 'settings drag leave should remove the drag-over class');

    feature.onSettingsDrop('musician', 'Players', { currentTarget: dropTarget });
    assert.equal(state.settings.instruments[0].group, '', 'settings drop should ignore different target types');
    assert.equal(historyCount, 0, 'ignored settings drop should not push history');

    feature.onSettingsItemDragStart(state.settings.instruments[0], 'instrument', {
        target: { closest: () => null },
        currentTarget: row,
        dataTransfer: { setData() {} },
    });
    feature.onSettingsDrop('instrument', 'Strings', { currentTarget: dropTarget });
    assert.equal(state.settings.instruments[0].group, 'Strings', 'settings drop should move the item into the target group');
    assert.equal(draggableRows[0].style.opacity, '1', 'settings drop should restore draggable row opacity');
    assert.equal(historyCount, 1, 'settings drop should push history once when moving groups');


    feature.onSettingsItemDragStart(state.settings.instruments[0], 'instrument', {
        target: { closest: () => null },
        currentTarget: row,
        dataTransfer: { setData() {} },
    });
    feature.onSettingsItemDragEnd({
        target: { closest: (selector) => selector === '.group\\/item' ? row : null },
    });
    assert.equal(row.style.opacity, '1', 'settings drag end should restore the row opacity');
    assert.deepEqual(dragOverGroups[0].classList.removed, ['drag-over'], 'settings drag end should clear group drag-over highlights');

    const inputRow = {
        attrs: {},
        style: { cursor: '' },
        setAttribute(name, value) { this.attrs[name] = value; },
    };
    feature.disableRowDrag({
        target: { closest: (selector) => selector === '.group\\/item' ? inputRow : null },
    });
    assert.equal(inputRow.attrs.draggable, 'false', 'settings input focus should disable dragging on the parent row');
    assert.equal(inputRow.style.cursor, 'text', 'settings input focus should show the text cursor on the parent row');
    feature.enableRowDrag({
        target: { closest: (selector) => selector === '.group\\/item' ? inputRow : null },
    });
    assert.equal(inputRow.attrs.draggable, 'true', 'settings input blur should restore dragging on the parent row');
    assert.equal(inputRow.style.cursor, '', 'settings input blur should restore the parent row cursor');
}

{
    const refs = {
        itemPool: vueRef([]),
        scheduledTasks: vueRef([]),
        currentSessionId: vueRef('S_DEFAULT'),
        globalSearchQuery: vueRef(''),
        sidebarTab: vueRef('musician'),
        sortField: vueRef('status'),
        sortAsc: vueRef(true),
        statClickIndexMap: vueReactive({}),
        isMobile: vueRef(false),
        expandedGroups: vueReactive(new Set()),
    };
    const haptics = [];
    const feature = registerSidebarStatsFeature({
        refs,
        state: {
            settings: {
                musicians: [],
                projects: [],
                instruments: [],
            },
        },
        utils: {
            parseTime: () => 0,
            formatSecs: (value) => String(value),
            calculateEstTime: () => '',
            getNameById: () => '',
            getFullSearchText: () => '',
            smartMatch: () => false,
            isItemVisibleForView: () => true,
            peekSplitViewState: () => ({}),
        },
        actions: {
            pushHistory: () => {},
            openAlertModal: () => {},
            smartScrollToTask: () => {},
            triggerTouchHaptic: (type) => haptics.push(type),
        },
    });

    assert.equal(feature.getSortIcon('status'), 'fa-arrow-down-short-wide', 'sidebar sort icon should preserve ascending status icon');
    feature.toggleSort('status');
    assert.equal(refs.sortField.value, 'status', 'toggling the current sidebar sort field should keep the same field');
    assert.equal(refs.sortAsc.value, false, 'toggling the current sidebar sort field should reverse direction');
    assert.equal(feature.getSortIcon('status'), 'fa-arrow-up-wide-short', 'sidebar sort icon should preserve descending status icon');

    feature.toggleSort('name');
    assert.equal(refs.sortField.value, 'name', 'selecting a new sidebar sort field should update the field');
    assert.equal(refs.sortAsc.value, true, 'name sidebar sorting should default ascending');
    assert.equal(feature.getSortIcon('name'), 'fa-arrow-down-a-z', 'sidebar sort icon should preserve ascending name icon');

    feature.toggleSort('duration');
    assert.equal(refs.sortField.value, 'duration', 'duration sidebar sorting should become the active field');
    assert.equal(refs.sortAsc.value, false, 'non-name sidebar sorting should default descending');
    assert.equal(feature.getSortIcon('duration'), 'fa-arrow-down-wide-short', 'sidebar sort icon should preserve descending duration icon');
    assert.equal(feature.getSortIcon('name'), '', 'inactive sidebar sort fields should not expose an icon');

    feature.toggleCollapse('Woodwinds');
    assert.equal(refs.expandedGroups.has('Woodwinds'), true, 'sidebar group collapse toggle should expand a collapsed group');

    refs.isMobile.value = true;
    feature.toggleCollapse('Woodwinds');
    assert.equal(refs.expandedGroups.has('Woodwinds'), false, 'sidebar group collapse toggle should collapse an expanded group');

}

{
    const refs = {
        csvSearchQuery: vueRef(''),
        csvImportData: vueRef([
            { projectName: 'Project A', name_real: 'Cue 1', name_merge: 'Cue', playerName: 'Alice', selected: true, hasRecData: true, hasEditData: true, recStatusText: 'NEW', editStatusText: 'NEW' },
            { projectName: 'Project B', name_real: 'Cue 2', name_merge: 'Cue', playerName: 'Bob', selected: true, hasRecData: true, hasEditData: true, recStatusText: 'NEW', editStatusText: 'NEW' },
        ]),
        csvImportConfig: vueReactive({
            showSkipRows: true,
            importTypes: { tasks: true, time: true, orch: true },
            nameStrategy: 'merge',
        }),
        activeImportTab: vueRef('rec'),
        collapsedProjects: vueReactive(new Set()),
        rawCsvRows: vueRef([]),
        csvHeadersMap: vueRef({}),
        showCsvImportModal: vueRef(false),
        itemPool: vueRef([]),
        scheduledTasks: vueRef([]),
        currentSessionId: vueRef('S_DEFAULT'),
    };
    const feature = registerImportCsvFeature({
        refs,
        state: {
            settings: {
                projects: [],
                instruments: [],
                musicians: [],
            },
        },
        utils: {
            formatSecs: (value) => String(value),
            parseTime: () => 0,
            normalizeDate: (value) => value,
            getOrchString: () => '',
            getNameById: () => '',
            getOrCreateSettingItem: () => '',
            calculateEstTime: () => '',
            generateUniqueId: () => 'NEW',
        },
        actions: {
            pushHistory: () => {},
            openAlertModal: () => {},
            autoUpdateEfficiency: () => {},
            autoResizeSchedules: () => {},
        },
    });

    assert.equal(feature.groupedCsvData.value.find((group) => group.projectName === 'Project A').expanded, true, 'CSV project groups should start expanded when not in collapsedProjects');
    feature.toggleProjectCollapse('Project A');
    assert.equal(refs.collapsedProjects.has('Project A'), true, 'CSV project collapse toggle should add an expanded project to collapsedProjects');
    assert.equal(feature.groupedCsvData.value.find((group) => group.projectName === 'Project A').expanded, false, 'grouped CSV data should reflect a collapsed project');
    feature.toggleProjectCollapse('Project A');
    assert.equal(refs.collapsedProjects.has('Project A'), false, 'CSV project collapse toggle should remove an already collapsed project');
    assert.equal(feature.groupedCsvData.value.find((group) => group.projectName === 'Project A').expanded, true, 'grouped CSV data should reflect an expanded project after toggling again');
    feature.toggleAllProjectCollapse();
    assert.deepEqual([...refs.collapsedProjects].sort(), ['Project A', 'Project B'], 'CSV collapse-all should collapse every visible project group');
    feature.toggleAllProjectCollapse();
    assert.equal(refs.collapsedProjects.size, 0, 'CSV collapse-all should expand all groups when every visible group is collapsed');
}

{
    const refs = {
        csvSearchQuery: vueRef(''),
        csvImportData: vueRef([]),
        csvImportConfig: vueReactive({
            showSkipRows: true,
            importTypes: { tasks: true, time: true, orch: true },
            nameStrategy: 'merge',
        }),
        activeImportTab: vueRef('rec'),
        collapsedProjects: vueReactive(new Set()),
        rawCsvRows: vueRef([]),
        csvHeadersMap: vueRef({}),
        showCsvImportModal: vueRef(false),
        itemPool: vueRef([]),
        scheduledTasks: vueRef([]),
        currentSessionId: vueRef('S_DEFAULT'),
    };
    let clicked = 0;
    const input = {
        value: 'previous.csv',
        click: () => {
            clicked += 1;
        },
    };
    const requestedIds = [];
    const feature = registerImportCsvFeature({
        refs,
        state: {
            settings: {
                projects: [],
                instruments: [],
                musicians: [],
            },
        },
        utils: {
            formatSecs: (value) => String(value),
            parseTime: () => 0,
            normalizeDate: (value) => value,
            getOrchString: () => '',
            getNameById: () => '',
            getOrCreateSettingItem: () => '',
            calculateEstTime: () => '',
            generateUniqueId: () => 'NEW',
        },
        actions: {
            pushHistory: () => {},
            openAlertModal: () => {},
            autoUpdateEfficiency: () => {},
            autoResizeSchedules: () => {},
            getElementById: (id) => {
                requestedIds.push(id);
                return id === 'csv-import-input' ? input : null;
            },
        },
    });

    feature.triggerCSV();
    assert.deepEqual(requestedIds, ['csv-import-input'], 'triggerCSV should query the CSV file input by id');
    assert.equal(input.value, '', 'triggerCSV should clear the file input before opening it');
    assert.equal(clicked, 1, 'triggerCSV should open the CSV file picker');
}

{
    const refs = {
        csvSearchQuery: vueRef(''),
        csvImportData: vueRef([]),
        csvImportConfig: vueReactive({
            showSkipRows: true,
            importTypes: { tasks: true, time: true, orch: true },
            nameStrategy: 'merge',
        }),
        activeImportTab: vueRef('rec'),
        collapsedProjects: vueReactive(new Set()),
        rawCsvRows: vueRef([]),
        csvHeadersMap: vueRef({}),
        showCsvImportModal: vueRef(false),
        itemPool: vueRef([{
            id: 'OTHER_SESSION_ITEM',
            sessionId: 'S1',
            projectId: 'P1',
            instrumentId: 'I1',
            musicianId: 'M1',
            name: 'Shared Cue',
        }]),
        scheduledTasks: vueRef([]),
        currentSessionId: vueRef('S2'),
    };
    const targetList = [];
    const feature = registerImportCsvFeature({
        refs,
        state: {
            settings: {
                projects: [{ id: 'P1', name: 'Project One' }],
                instruments: [{ id: 'I1', name: 'Violin' }],
                musicians: [{ id: 'M1', name: 'Alice' }],
            },
        },
        utils: {
            formatSecs: (value) => String(value),
            parseTime: () => 0,
            normalizeDate: (value) => value,
            getOrchString: () => '',
            getNameById: (id, type) => ({
                project: { P1: 'Project One' },
                instrument: { I1: 'Violin' },
                musician: { M1: 'Alice' },
            }[type]?.[id] || ''),
            getOrCreateSettingItem: () => '',
            calculateEstTime: () => '',
            generateUniqueId: () => 'NEW',
        },
        actions: {
            pushHistory: () => {},
            openAlertModal: () => {},
            autoUpdateEfficiency: () => {},
            autoResizeSchedules: () => {},
        },
    });
    const col = {
        project: 0,
        instName: 1,
        duration: 2,
        orchestration: 3,
        playerName: 4,
        instFamily: 5,
        recDate: 6,
        recStart: 7,
        recEnd: 8,
        recStudio: 9,
        recEngineer: 10,
        recOperator: -1,
        recAssistant: -1,
        recComments: -1,
        edtDate: -1,
        edtStart: -1,
    };

    feature.addDataToPrepared(
        targetList,
        ['Project One', 'Violin', '00:30', '', 'Alice', 'Strings', '2026-05-29', '09:00', '09:30', 'Studio', 'Engineer'],
        col,
        { forceName: 'Shared Cue' },
    );

    assert.equal(targetList[0].isDuplicate, false, 'CSV duplicate detection must ignore same-name items from other sessions');
}

{
    const refs = {
        csvSearchQuery: vueRef(''),
        csvImportData: vueRef([]),
        csvImportConfig: vueReactive({
            showSkipRows: true,
            importTypes: { tasks: true, time: true, orch: true },
            nameStrategy: 'merge',
        }),
        activeImportTab: vueRef('rec'),
        collapsedProjects: vueReactive(new Set()),
        rawCsvRows: vueRef([]),
        csvHeadersMap: vueRef({}),
        showCsvImportModal: vueRef(false),
        itemPool: vueRef([{
            id: 'BOB_ITEM',
            sessionId: 'S_DEFAULT',
            projectId: 'P1',
            instrumentId: 'I1',
            musicianId: 'M_BOB',
            name: 'Shared Cue',
        }]),
        scheduledTasks: vueRef([]),
        currentSessionId: vueRef('S_DEFAULT'),
    };
    const targetList = [];
    const feature = registerImportCsvFeature({
        refs,
        state: {
            settings: {
                projects: [{ id: 'P1', name: 'Project One' }],
                instruments: [{ id: 'I1', name: 'Violin' }],
                musicians: [
                    { id: 'M_ALICE', name: 'Alice' },
                    { id: 'M_BOB', name: 'Bob' },
                ],
            },
        },
        utils: {
            formatSecs: (value) => String(value),
            parseTime: () => 0,
            normalizeDate: (value) => value,
            getOrchString: () => '',
            getNameById: (id, type) => ({
                project: { P1: 'Project One' },
                instrument: { I1: 'Violin' },
                musician: { M_ALICE: 'Alice', M_BOB: 'Bob' },
            }[type]?.[id] || ''),
            getOrCreateSettingItem: () => '',
            calculateEstTime: () => '',
            generateUniqueId: () => 'NEW',
        },
        actions: {
            pushHistory: () => {},
            openAlertModal: () => {},
            autoUpdateEfficiency: () => {},
            autoResizeSchedules: () => {},
        },
    });
    const col = {
        project: 0,
        instName: 1,
        duration: 2,
        orchestration: 3,
        playerName: 4,
        instFamily: 5,
        recDate: 6,
        recStart: 7,
        recEnd: 8,
        recStudio: 9,
        recEngineer: 10,
        recOperator: -1,
        recAssistant: -1,
        recComments: -1,
        edtDate: -1,
        edtStart: -1,
    };

    feature.addDataToPrepared(
        targetList,
        ['Project One', 'Violin', '00:30', '', 'Alice', 'Strings', '2026-05-29', '09:00', '09:30', 'Studio', 'Engineer'],
        col,
        { forceName: 'Shared Cue' },
    );

    assert.equal(targetList[0].isDuplicate, false, 'CSV duplicate detection must ignore same-name items assigned to a different musician');
}

{
    const refs = {
        csvSearchQuery: vueRef(''),
        csvImportData: vueRef([]),
        csvImportConfig: vueReactive({
            showSkipRows: true,
            importTypes: { tasks: true, time: true, orch: true },
            nameStrategy: 'merge',
        }),
        activeImportTab: vueRef('rec'),
        collapsedProjects: vueReactive(new Set()),
        rawCsvRows: vueRef([]),
        csvHeadersMap: vueRef({}),
        showCsvImportModal: vueRef(false),
        itemPool: vueRef([{
            id: 'ALICE_ITEM',
            sessionId: 'S_DEFAULT',
            projectId: 'P1',
            instrumentId: 'I1',
            musicianId: 'M_ALICE',
            name: 'Shared Cue',
            musicDuration: '00:30',
            records: {
                musician: { recStart: '09:00', recEnd: '09:30' },
                project: { recStart: '10:00', recEnd: '10:30' },
            },
        }]),
        scheduledTasks: vueRef([
            {
                scheduleId: 'REC_MATCH',
                sessionId: 'S_DEFAULT',
                musicianId: 'M_ALICE',
                date: '2026-05-29',
                startTime: '09:00',
                recordingInfo: { studio: 'Studio' },
            },
            {
                scheduleId: 'EDT_MATCH',
                sessionId: 'S_DEFAULT',
                projectId: 'P1',
                date: '2026-05-30',
                startTime: '10:00',
                editInfo: { studio: 'Edit Studio' },
            },
        ]),
        currentSessionId: vueRef('S_DEFAULT'),
    };
    const targetList = [];
    const feature = registerImportCsvFeature({
        refs,
        state: {
            settings: {
                projects: [{ id: 'P1', name: 'Project One' }],
                instruments: [{ id: 'I1', name: 'Violin' }],
                musicians: [{ id: 'M_ALICE', name: 'Alice' }],
            },
        },
        utils: {
            formatSecs: (value) => String(value),
            parseTime: () => 0,
            normalizeDate: (value) => value,
            getOrchString: () => '',
            getNameById: (id, type) => ({
                project: { P1: 'Project One' },
                instrument: { I1: 'Violin' },
                musician: { M_ALICE: 'Alice' },
            }[type]?.[id] || ''),
            getOrCreateSettingItem: () => '',
            calculateEstTime: () => '',
            generateUniqueId: () => 'NEW',
        },
        actions: {
            pushHistory: () => {},
            openAlertModal: () => {},
            autoUpdateEfficiency: () => {},
            autoResizeSchedules: () => {},
        },
    });
    const col = {
        project: 0,
        instName: 1,
        duration: 2,
        orchestration: 3,
        playerName: 4,
        instFamily: 5,
        recDate: 6,
        recStart: 7,
        recEnd: 8,
        recStudio: 9,
        recEngineer: 10,
        recOperator: -1,
        recAssistant: -1,
        recComments: -1,
        edtDate: 11,
        edtStart: 12,
        edtEnd: 13,
        edtRest: -1,
        edtEngineer: -1,
        edtStudio: 14,
    };

    feature.addDataToPrepared(
        targetList,
        ['Project One', 'Violin', '00:30', '', ' alice ', 'Strings', '2026-05-29', '09:00', '09:30', 'Studio', 'Engineer', '2026-05-30', '10:00', '10:30', 'Edit Studio'],
        col,
        { forceName: 'Shared Cue' },
    );

    assert.equal(targetList[0].isDuplicate, true, 'CSV duplicate detection must match existing musicians despite case and surrounding whitespace');
}

{
    const refs = {
        isMobile: vueRef(true),
        isSidebarOpen: vueRef(true),
        sidebarTab: vueRef('musician'),
    };
    const haptics = [];
    let dragActive = false;
    const scheduledDelays = [];
    const classOps = [];
    const scrollCalls = [];
    const statEl = {
        scrollIntoView: (options) => scrollCalls.push(options),
        classList: {
            add: (...classes) => classOps.push(['add', classes]),
            remove: (...classes) => classOps.push(['remove', classes]),
        },
    };
    const queriedSelectors = [];
    const feature = registerSidebarNavigationFeature({
        refs,
        actions: {
            isDragActive: () => dragActive,
            triggerTouchHaptic: (type) => haptics.push(type),
            getDocument: () => ({
                querySelector: (selector) => {
                    queriedSelectors.push(selector);
                    return selector === '[data-stat-id="M1"]' ? statEl : null;
                },
            }),
            setTimeoutFn: (callback, delay) => {
                scheduledDelays.push(delay);
                callback();
                return delay;
            },
        },
    });

    feature.sidebarScrollRef.value = { scrollTop: 64 };
    feature.switchSidebarTab('project');
    assert.equal(refs.sidebarTab.value, 'project', 'switchSidebarTab should update the active sidebar tab');
    assert.equal(feature.sidebarTransitionName.value, 'slide-next', 'switchSidebarTab should set next transition when moving forward');
    assert.equal(feature.sidebarScrollRef.value.scrollTop, 0, 'switchSidebarTab should scroll the sidebar list back to top');

    feature.switchSidebarTab('musician');
    assert.equal(feature.sidebarTransitionName.value, 'slide-prev', 'switchSidebarTab should set previous transition when moving backward');

    feature.onSidebarTouchStart({ touches: [{ clientX: 250, clientY: 100 }] });
    feature.onSidebarTouchEnd({ changedTouches: [{ clientX: 160, clientY: 110 }] });
    assert.equal(refs.sidebarTab.value, 'project', 'left swipe should advance the sidebar tab');


    dragActive = true;
    feature.onSidebarTouchStart({ touches: [{ clientX: 160, clientY: 100 }] });
    feature.onSidebarTouchEnd({ changedTouches: [{ clientX: 260, clientY: 100 }] });
    assert.equal(refs.sidebarTab.value, 'project', 'sidebar touch handlers should ignore gestures while a drag is active');
    dragActive = false;

    refs.isMobile.value = false;
    feature.onSidebarTouchStart({ touches: [{ clientX: 160, clientY: 100 }] });
    feature.onSidebarTouchEnd({ changedTouches: [{ clientX: 260, clientY: 100 }] });
    assert.equal(refs.sidebarTab.value, 'project', 'sidebar touch handlers should ignore swipe gestures outside mobile mode');

    feature.toggleSidebar();
    assert.equal(refs.isSidebarOpen.value, false, 'toggleSidebar should invert sidebar open state');

    feature.scrollToSidebarItem('M1');
    assert.deepEqual(queriedSelectors, ['[data-stat-id="M1"]'], 'scrollToSidebarItem should query the stat id marker');
    assert.deepEqual(scrollCalls[0], { behavior: 'smooth', block: 'center' }, 'scrollToSidebarItem should center the selected stat smoothly');
    assert.deepEqual(classOps, [
        ['add', ['ring-2', 'ring-[#ffffff]']],
        ['remove', ['ring-2', 'ring-[#ffffff]']],
    ], 'scrollToSidebarItem should preserve temporary highlight classes');
    assert.deepEqual(scheduledDelays.slice(-2), [50, 800], 'scrollToSidebarItem should preserve lookup and highlight timers');
}

{
    const writes = [];
    const storedOpenFeature = registerSidebarPreferencesFeature({
        refs: {
            sidebarWidth: vueRef(320),
        },
        services: {
            storageService: {
                getItem: (key) => key === 'musche_sidebar_open' ? 'false' : null,
                setItem: (...args) => writes.push(args),
            },
        },
    });

    assert.equal(storedOpenFeature.isSidebarOpen.value, false, 'sidebar preferences should restore a persisted closed sidebar state');

    const refs = {
        sidebarWidth: vueRef(280),
    };
    const defaultOpenFeature = registerSidebarPreferencesFeature({
        refs,
        services: {
            storageService: {
                getItem: () => null,
                setItem: (...args) => writes.push(args),
            },
        },
    });

    assert.equal(defaultOpenFeature.isSidebarOpen.value, true, 'sidebar preferences should default to an open sidebar when no stored value exists');
    defaultOpenFeature.isSidebarOpen.value = false;
    refs.sidebarWidth.value = 300;
    await Promise.resolve();
    assert.deepEqual(
        writes.slice(-2),
        [
            ['musche_sidebar_open', false],
            ['musche_sidebar_width', 300],
        ],
        'sidebar preferences should persist sidebar open state and width together',
    );
}

{
    const refs = {
        selectedSource: vueRef(null),
        selectedTaskId: vueRef(null),
        selectedPoolIds: vueRef(new Set(['POOL_A', 'POOL_B'])),
        lastPoolFocusId: vueRef(null),
        lastPoolClickId: vueRef('OLD_CLICK'),
        scheduledTasks: vueRef([
            { scheduleId: 'SCHED_M', musicianId: 'M1', projectId: 'P1', instrumentId: 'I1' },
            { scheduleId: 'SCHED_P', projectId: 'P2' },
            { scheduleId: 'DIRECT', templateId: 'POOL_DIRECT', date: '2026-05-29', startTime: '11:00' },
            { scheduleId: 'EARLY', projectId: 'P_AGG', date: '2026-05-29', startTime: '09:00' },
            { scheduleId: 'LATE', projectId: 'P_AGG', date: '2026-05-29', startTime: '12:00' },
            { scheduleId: 'OTHER_SESSION', projectId: 'P_AGG', date: '2026-05-29', startTime: '08:00', sessionId: 'S2' },
        ]),
        itemPool: vueRef([
            { id: 'POOL_DIRECT' },
            { id: 'POOL_AGG', projectId: 'P_AGG', sectionIndex: 1 },
        ]),
        currentSessionId: vueRef('S_DEFAULT'),
        sidebarTab: vueRef('project'),
        isSidebarOpen: vueRef(true),
        isMobile: vueRef(false),
    };
    const scrolledIds = [];
    const jumpedTasks = [];
    const haptics = [];
    const feature = registerSelectionFeature({
        refs,
        actions: {
            scrollToSidebarItem: (id) => scrolledIds.push(id),
            smartScrollToTask: (task) => jumpedTasks.push(task.scheduleId),
            triggerTouchHaptic: (type) => haptics.push(type),
            getVisiblePoolItems: () => visiblePoolItems,
        },
    });

    feature.selectScheduleTask('SCHED_M');
    assert.equal(refs.selectedSource.value, 'schedule', 'schedule selection should mark the selected source');
    assert.equal(refs.selectedTaskId.value, 'SCHED_M', 'schedule selection should store the selected schedule id');
    assert.deepEqual([...refs.selectedPoolIds.value], [], 'schedule selection should clear pool multi-selection');
    assert.deepEqual(scrolledIds, ['P1'], 'schedule selection should follow-scroll the active project in the sidebar');

    refs.isSidebarOpen.value = false;
    refs.isMobile.value = false;
    refs.sidebarTab.value = 'musician';
    feature.selectScheduleTask('SCHED_M');
    assert.deepEqual(scrolledIds, ['P1'], 'schedule selection should not scroll a closed desktop sidebar');

    refs.isMobile.value = true;
    feature.selectScheduleTask('SCHED_M');
    assert.deepEqual(scrolledIds, ['P1', 'M1'], 'schedule selection should still follow-scroll on mobile');

    feature.jumpToPoolSchedule('POOL_DIRECT');
    assert.deepEqual(jumpedTasks, ['DIRECT'], 'pool single-select jump should prefer exact template schedule matches');


    refs.isMobile.value = false;
    refs.sidebarTab.value = 'project';
    feature.jumpToPoolSchedule('POOL_AGG');
    assert.deepEqual(jumpedTasks, ['DIRECT', 'LATE'], 'pool single-select jump should use sectionIndex to pick the matching aggregate schedule');

    feature.selectPoolTask('POOL_AGG');
    assert.equal(refs.selectedSource.value, 'pool', 'pool selection should mark the selected source');
    assert.equal(refs.selectedTaskId.value, 'POOL_AGG', 'pool selection should store the selected pool id');
    assert.equal(refs.lastPoolFocusId.value, 'POOL_AGG', 'pool selection should remember the focused pool item');

    refs.selectedPoolIds.value = new Set(['OLD_A', 'OLD_B']);
    feature.selectSinglePoolTask('POOL_DIRECT');
    assert.deepEqual([...refs.selectedPoolIds.value], ['POOL_DIRECT'], 'normal pool single-select should replace previous pool selection with the clicked item');
    assert.equal(refs.lastPoolClickId.value, 'POOL_DIRECT', 'normal pool single-select should remember the last clicked pool item');

    feature.togglePoolTaskSelection('POOL_DIRECT');
    assert.deepEqual([...refs.selectedPoolIds.value], [], 'ctrl/meta pool toggle should remove an already selected pool item');
    assert.equal(refs.lastPoolClickId.value, 'POOL_DIRECT', 'ctrl/meta pool toggle should remember the removed pool item as last clicked');

    feature.togglePoolTaskSelection('POOL_AGG');
    assert.deepEqual([...refs.selectedPoolIds.value], ['POOL_AGG'], 'ctrl/meta pool toggle should add an unselected pool item');
    assert.equal(refs.lastPoolClickId.value, 'POOL_AGG', 'ctrl/meta pool toggle should remember the added pool item as last clicked');

    feature.clearSelection();
    assert.equal(refs.selectedTaskId.value, null, 'clear selection should reset the selected task id');
    assert.equal(refs.selectedSource.value, null, 'clear selection should reset the selected source');
    assert.deepEqual([...refs.selectedPoolIds.value], [], 'clear selection should clear pool multi-selection');

    const visiblePoolItems = [
        { id: 'POOL_A' },
        { id: 'POOL_B' },
        { id: 'POOL_C' },
        { id: 'POOL_D' },
    ];
    refs.lastPoolClickId.value = 'POOL_B';
    refs.selectedPoolIds.value = new Set(['EXISTING']);
    feature.selectPoolTaskRange('POOL_D', visiblePoolItems);
    assert.deepEqual([...refs.selectedPoolIds.value], ['EXISTING', 'POOL_B', 'POOL_C', 'POOL_D'], 'shift-range selection should add every visible pool item between the last click and current item');

    feature.selectPoolTaskRange('MISSING', visiblePoolItems);
    assert.deepEqual([...refs.selectedPoolIds.value], ['EXISTING', 'POOL_B', 'POOL_C', 'POOL_D'], 'shift-range selection should leave selection unchanged when the current item is not visible');

    refs.selectedPoolIds.value = new Set(['POOL_A']);
    refs.selectedSource.value = null;
    refs.selectedTaskId.value = null;
    feature.selectTask('SCHED_M', 'schedule');
    assert.equal(refs.selectedSource.value, 'schedule', 'selectTask should route schedule selections through schedule selection behavior');
    assert.equal(refs.selectedTaskId.value, 'SCHED_M', 'selectTask should store selected schedule ids');
    assert.deepEqual([...refs.selectedPoolIds.value], [], 'selectTask should clear pool selections for schedule selections');

    refs.selectedPoolIds.value = new Set(['OLD_POOL']);
    refs.lastPoolClickId.value = 'POOL_A';
    feature.selectTask('POOL_DIRECT', 'pool');
    assert.equal(refs.selectedSource.value, 'pool', 'selectTask should mark pool selections');
    assert.equal(refs.selectedTaskId.value, 'POOL_DIRECT', 'selectTask should store selected pool ids');
    assert.deepEqual([...refs.selectedPoolIds.value], ['POOL_DIRECT'], 'selectTask should single-select normal pool clicks');
    assert.deepEqual(jumpedTasks.at(-1), 'DIRECT', 'selectTask should jump to matching schedules for normal pool clicks');

    refs.selectedPoolIds.value = new Set(['POOL_DIRECT']);
    feature.selectTask('POOL_DIRECT', 'pool', { metaKey: true });
    assert.deepEqual([...refs.selectedPoolIds.value], [], 'selectTask should route meta pool clicks through toggle selection');

    refs.lastPoolClickId.value = 'POOL_B';
    refs.selectedPoolIds.value = new Set(['ANCHOR']);
    feature.selectTask('POOL_D', 'pool', { shiftKey: true });
    assert.deepEqual([...refs.selectedPoolIds.value], ['ANCHOR', 'POOL_B', 'POOL_C', 'POOL_D'], 'selectTask should route shift pool clicks through range selection');

    refs.selectedPoolIds.value = new Set(['OLD_POOL']);
    feature.handlePoolItemClick('POOL_DIRECT');
    assert.equal(refs.selectedSource.value, 'pool', 'pool item click should route through pool selection');
    assert.equal(refs.selectedTaskId.value, 'POOL_DIRECT', 'pool item click should select the clicked pool id');
    assert.deepEqual([...refs.selectedPoolIds.value], ['POOL_DIRECT'], 'pool item click should use normal pool single-selection behavior');
}

{
    const refs = {
        sidebarTab: vueRef('browse'),
    };
    const feature = registerVisiblePoolItemsFeature({
        refs,
        actions: {
            getGroupedItemPool: () => [
                { key: 'open-browse', items: [{ id: 'BROWSE_A' }, { id: 'BROWSE_B' }] },
                { key: 'closed-browse', items: [{ id: 'BROWSE_C' }] },
            ],
            getCurrentSidebarList: () => [
                { id: 'open-stat', items: [{ id: 'STAT_A' }] },
                { id: 'closed-stat', items: [{ id: 'STAT_B' }] },
            ],
            isGroupExpanded: (key) => key === 'open-browse',
            isStatExpanded: (id) => id === 'open-stat',
        },
    });

    assert.deepEqual(
        feature.getVisiblePoolItems().map((item) => item.id),
        ['BROWSE_A', 'BROWSE_B'],
        'visible pool items should flatten only expanded browse groups when the sidebar is browsing the pool'
    );

    refs.sidebarTab.value = 'musician';
    assert.deepEqual(
        feature.getVisiblePoolItems().map((item) => item.id),
        ['STAT_A'],
        'visible pool items should flatten only expanded sidebar stat groups outside browse mode'
    );
}

{
    const refs = {
        showSettings: vueRef(false),
        showEditor: vueRef(false),
        showTrackList: vueRef(false),
        showAuthModal: vueRef(false),
        showCropModal: vueRef(false),
        showMobileMenu: vueRef(false),
        showColorPickerModal: vueRef(false),
        showMobileTaskInput: vueRef(false),
        showQuickAddModal: vueRef(false),
        showRecInfoModal: vueRef(false),
        showConfirmModal: vueRef(false),
        showInputModal: vueRef(false),
        showSplitModal: vueRef(false),
        showCreditModal: vueRef(false),
        showMidiManager: vueRef(false),
        showMidiImportModal: vueRef(false),
        showCsvImportModal: vueRef(false),
        showProjectInfoModal: vueRef(false),
        showDurationPicker: vueRef(true),
        showImportModal: vueRef(false),
        showProfileMenu: vueRef(false),
        showGroupSuggestions: vueRef(false),
        activeRecDropdown: vueRef(null),
        activeMidiGroupRow: vueRef(null),
        activeDropdown: vueRef(null),
        settingsGroupFocus: vueRef(null),
        selectedTaskId: vueRef(null),
        selectedPoolIds: vueRef(new Set()),
        selectedSource: vueRef(null),
        isMobile: vueRef(false),
        currentSessionId: vueRef('S1'),
        currentView: vueRef('week'),
        sidebarTab: vueRef('musician'),
        sortKey: vueRef('projectId'),
        activeColorKey: vueRef('projectId'),
        scheduledTasks: vueRef([]),
        itemPool: vueRef([]),
        lastPoolFocusId: vueRef(null),
        lastPoolClickId: vueRef(null),
    };
    const calls = [];
    const feature = registerGlobalKeyboardFeature({
        refs,
        state: {
            activeImportMenu: { rowId: null },
            expandedGroups: new Set(),
            expandedStatsIds: new Set(),
        },
        actions: {
            closePicker: () => {
                calls.push('closePicker');
                refs.showDurationPicker.value = false;
            },
            undo: () => calls.push('undo'),
            redo: () => calls.push('redo'),
            getActiveElement: () => ({ tagName: 'BODY' }),
        },
    });
    const escapeEvent = {
        key: 'Escape',
        preventDefault: () => calls.push('preventEscape'),
    };

    feature.handleGlobalKey(escapeEvent);

    assert.deepEqual(calls, ['closePicker', 'preventEscape'], 'global keyboard ESC should close the duration picker before lower-priority UI');
    assert.equal(refs.showDurationPicker.value, false, 'global keyboard ESC should leave the duration picker closed');

    feature.handleGlobalKey({
        key: 'z',
        metaKey: true,
        shiftKey: false,
        preventDefault: () => calls.push('preventUndo'),
    });
    feature.handleGlobalKey({
        key: 'z',
        metaKey: true,
        shiftKey: true,
        preventDefault: () => calls.push('preventRedo'),
    });

    assert.deepEqual(calls.slice(-4), ['preventUndo', 'undo', 'preventRedo', 'redo'], 'global keyboard should preserve Cmd/Ctrl+Z undo and Shift+Z redo routing');
}

{
    const refs = {
        itemPool: vueRef([{ id: 'P1' }]),
        scheduledTasks: vueRef([{ id: 'T1' }]),
        currentSessionId: vueRef('S1'),
        user: vueRef({ id: 'USER_1' }),
        saveStatus: vueRef('saved'),
        isBootstrappingData: vueRef(false),
    };
    const state = {
        settings: { projects: [{ id: 'PR1' }] },
    };
    const calls = [];
    const timers = [];
    const feature = registerDataAutosaveFeature({
        refs,
        state,
        services: {
            storageService: {
                saveData: (key, value) => calls.push(['saveData', key, value]),
            },
        },
        actions: {
            clearTimeout: (timer) => calls.push(['clearTimeout', timer]),
            setTimeout: (callback, delay) => {
                timers.push({ callback, delay });
                return `timer-${timers.length}`;
            },
            saveToCloud: () => calls.push(['saveToCloud']),
        },
    });

    feature.handleDataChanged();

    assert.equal(refs.saveStatus.value, 'unsaved', 'autosave should mark logged-in data changes as unsaved before debouncing cloud save');
    assert.equal(timers.length, 1, 'autosave should schedule one cloud save debounce for logged-in changes');
    assert.equal(timers[0].delay, 1000, 'autosave cloud debounce should stay at one second');
    timers[0].callback();
    assert.deepEqual(calls, [['clearTimeout', null], ['saveToCloud']], 'autosave should clear any existing timer and call cloud save when the debounce fires');

    refs.saveStatus.value = 'saving';
    feature.handleDataChanged();
    assert.equal(refs.saveStatus.value, 'saving', 'autosave should not overwrite an in-progress saving status');
    assert.deepEqual(calls.at(-1), ['clearTimeout', 'timer-1'], 'autosave should clear the previous debounce timer before scheduling another');

    refs.user.value = null;
    refs.saveStatus.value = 'saved';
    refs.currentSessionId.value = 'S2';
    feature.handleDataChanged();
    const localSave = calls.find((entry) => entry[0] === 'saveData');
    assert.equal(localSave[1], 'v9_data', 'guest autosave should persist to the legacy offline data key');
    assert.deepEqual(localSave[2].pool, refs.itemPool.value, 'guest autosave should persist the current pool');
    assert.deepEqual(localSave[2].tasks, refs.scheduledTasks.value, 'guest autosave should persist scheduled tasks');
    assert.equal(localSave[2].settings.lastSessionId, 'S2', 'guest autosave should stamp the current session id into saved settings');

    refs.isBootstrappingData.value = true;
    const callCountBeforeBootstrap = calls.length;
    feature.handleDataChanged();
    assert.equal(calls.length, callCountBeforeBootstrap, 'autosave should skip changes while bootstrapping data');
}

{
    const refs = {
        currentView: vueRef('month'),
        monthViewMode: vueRef('scrolled'),
        viewDate: vueRef('2026-06-01'),
        isBootstrappingData: vueRef(false),
    };
    const addedListeners = [];
    const removedListeners = [];
    const loader = {
        classList: {
            added: [],
            add(name) {
                this.added.push(name);
            },
        },
    };
    const nextTickCalls = [];
    const events = [];
    const windowStub = {
        addEventListener: (type, handler) => addedListeners.push({ type, handler }),
        removeEventListener: (type, handler) => removedListeners.push({ type, handler }),
    };
    const documentStub = {
        getElementById: (id) => {
            assert.equal(id, 'global-loader', 'app lifecycle should look up the existing global loader');
            return loader;
        },
    };
    const handlers = {
        handleGlobalKey: () => {},
        handleResizeMove: () => {},
        handleResizeEnd: () => {},
        closeDropdowns: () => {},
    };
    const feature = registerAppLifecycleFeature({
        refs,
        values: {
            isSidebarOpen: { value: true },
        },
        handlers,
        actions: {
            scrollToMonthDate: (date) => events.push(['scrollToMonthDate', date]),
            bootSessionData: async (options) => events.push(['bootSessionData', options]),
            nextTick: async (callback) => {
                nextTickCalls.push(typeof callback);
                if (callback) callback();
            },
            setTimeout: (callback, delay) => {
                events.push(['setTimeout', delay]);
                callback();
            },
            getWindow: () => windowStub,
            getDocument: () => documentStub,
        },
    });

    await feature.mountAppLifecycle();

    assert.deepEqual(nextTickCalls, ['function', 'undefined'], 'app lifecycle should preserve the initial scroll nextTick and post-bootstrap nextTick');
    assert.deepEqual(events, [
        ['scrollToMonthDate', '2026-06-01'],
        ['setTimeout', 300],
        ['bootSessionData', { isSidebarOpen: { value: true }, skipHistory: false }],
    ], 'app lifecycle should preserve startup scroll, loader, and boot order');
    assert.equal(loader.classList.added[0], 'hidden', 'app lifecycle should hide the global loader after the original delay');
    assert.deepEqual(addedListeners.map((entry) => entry.type), ['keydown', 'mousemove', 'mouseup', 'click'], 'app lifecycle should register the original global listeners');
    assert.equal(refs.isBootstrappingData.value, false, 'app lifecycle should clear bootstrapping after session data finishes');

    feature.unmountAppLifecycle();
    assert.deepEqual(removedListeners, addedListeners, 'app lifecycle should remove the same global listeners it registered');
}

{
    const refs = {
        activeDropdown: vueRef(null),
        showMobileMenu: vueRef(true),
        showProfileMenu: vueRef(true),
        settingsGroupFocus: vueRef('instrument'),
        showGroupSuggestions: vueRef(true),
        editingItem: vueRef({ projectId: '', instrumentId: '', musicianId: '' }),
    };
    const state = {
        settings: {
            projects: [
                { id: 'P1', name: 'Alpha', group: 'Film' },
                { id: 'P2', name: 'Beta', group: '' },
            ],
            instruments: [
                { id: 'I10', name: 'Violin 10', group: 'Strings' },
                { id: 'I2', name: 'Violin 2', group: 'Strings' },
                { id: 'I3', name: 'Bassoon', group: 'Woodwinds' },
            ],
            musicians: [
                { id: 'M1', name: 'Zed', group: '' },
                { id: 'M2', name: 'Amy', group: 'Players' },
            ],
        },
        newItem: {
            projectId: '',
            instrumentId: '',
            musicianId: '',
        },
    };
    let focused = false;
    let musicianSelectCount = 0;
    const settingsNameFocus = vueRef('instrument');
    const activeRecDropdown = vueRef('studio');

    const feature = registerDropdownsFeature({
        refs,
        state,
        actions: {
            onMusicianSelect: () => { musicianSelectCount += 1; },
            getSettingsNameFocus: () => settingsNameFocus,
            getActiveRecDropdown: () => activeRecDropdown,
            querySelector: (selector) => selector.includes('搜索') ? { focus: () => { focused = true; } } : null,
            setTimeoutFn: (callback) => callback(),
        },
    });

    feature.toggleDropdown('instrument');
    assert.equal(refs.activeDropdown.value, 'instrument', 'toggleDropdown should open the requested dropdown');
    assert.equal(refs.showMobileMenu.value, false, 'toggleDropdown should close mobile menu');
    assert.equal(refs.showProfileMenu.value, false, 'toggleDropdown should close profile menu');
    assert.equal(focused, true, 'toggleDropdown should focus the search input');
    assert.deepEqual(feature.availableGroups.value, ['全部', 'Strings', 'Woodwinds'], 'availableGroups should expose grouped filters with 全部 first');
    assert.deepEqual(feature.filteredOptions.value.map((item) => item.name), ['Violin 2', 'Violin 10', 'Bassoon'], 'filteredOptions should natural-sort matching options');

    feature.activeGroupFilter.value = 'Strings';
    assert.deepEqual(feature.filteredOptions.value.map((item) => item.name), ['Violin 2', 'Violin 10'], 'filteredOptions should apply the active group filter');

    feature.dropdownSearch.value = '10';
    assert.deepEqual(feature.filteredOptions.value.map((item) => item.name), ['Violin 10'], 'filteredOptions should apply dropdown search');
    feature.toggleDropdownGroup('Strings');
    assert.equal(feature.dropdownExpandedGroups.has('Strings'), true, 'toggleDropdownGroup should expand a closed group');
    feature.dropdownSearch.value = '';
    await Promise.resolve();
    assert.equal(feature.dropdownExpandedGroups.size, 0, 'clearing dropdown search should collapse expanded dropdown groups');

    assert.deepEqual(
        feature.getGroupedOptions(state.settings.projects).map((group) => group.name),
        ['Film', '未分组'],
        'getGroupedOptions should order 未分组 last',
    );

    refs.activeDropdown.value = 'edit_project';
    feature.selectOption('project', state.settings.projects[0]);
    assert.equal(refs.editingItem.value.projectId, 'P1', 'selectOption should assign edit project dropdowns to editingItem');
    assert.equal(refs.activeDropdown.value, null, 'selectOption should close edit dropdowns after selection');

    refs.activeDropdown.value = 'musician';
    feature.selectOption('musician', state.settings.musicians[1]);
    assert.equal(state.newItem.musicianId, 'M2', 'selectOption should assign regular musician dropdowns to newItem');
    assert.equal(musicianSelectCount, 1, 'selectOption should preserve onMusicianSelect side effect');

    refs.activeDropdown.value = 'project';
    refs.showMobileMenu.value = true;
    refs.showProfileMenu.value = true;
    feature.closeDropdowns({
        target: {
            closest: (selector) => selector === '.custom-select-container' ? null : null,
        },
    });
    assert.equal(refs.activeDropdown.value, null, 'closeDropdowns should close custom selects when clicking outside');
    assert.equal(refs.showMobileMenu.value, false, 'closeDropdowns should close mobile menu when clicking outside');
    assert.equal(refs.showProfileMenu.value, false, 'closeDropdowns should close profile menu when clicking outside');
    assert.equal(refs.settingsGroupFocus.value, null, 'closeDropdowns should close settings group suggestions when clicking outside');
    assert.equal(settingsNameFocus.value, null, 'closeDropdowns should close settings name suggestions when clicking outside');
    assert.equal(refs.showGroupSuggestions.value, false, 'closeDropdowns should close quick-add group suggestions when clicking outside');
    assert.equal(activeRecDropdown.value, null, 'closeDropdowns should close recording info dropdowns when clicking outside');
}

{
    const refs = {
        currentView: vueRef('week'),
        monthViewMode: vueRef('paged'),
        viewDate: vueRef(new Date('2026-05-29T00:00:00')),
        dayColWidth: vueRef(52),
        isMobile: vueRef(false),
        isResizingMobile: vueRef(false),
    };
    const haptics = [];
    const dateChanges = [];
    const storage = [];
    const mainContent = { scrollTop: 12 };
    let dragActive = false;
    let windowWidth = 390;
    let timeoutCallbacks = [];
    const feature = registerMainViewNavigationFeature({
        refs,
        services: {
            storageService: {
                setItem: (...args) => storage.push(args),
            },
        },
        actions: {
            changeDate: (dir) => dateChanges.push(dir),
            scrollToMonthDate: (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                dateChanges.push(`scroll:${year}-${month}-${day}`);
            },
            isDragActive: () => dragActive,
            triggerTouchHaptic: (type) => haptics.push(type),
            getWindow: () => ({ innerWidth: windowWidth }),
            getElementById: (id) => (id === 'main-content' ? mainContent : null),
            setTimeoutFn: (callback) => {
                timeoutCallbacks.push(callback);
            },
        },
    });

    assert.equal(feature.widthIcon.value, 'fa-expand', 'week view width icon should show expand when columns are compact');
    feature.switchView('month');
    assert.equal(refs.currentView.value, 'month', 'switchView should update current view');
    assert.equal(feature.viewTransitionName.value, 'zoom-out', 'switchView should use zoom-out when switching to month view');

    assert.equal(feature.widthIcon.value, 'fa-scroll', 'month paged mode should expose the scroll icon');

    feature.cycleDayWidth();
    assert.equal(refs.monthViewMode.value, 'scrolled', 'cycleDayWidth should toggle month view into scrolled mode');
    assert.deepEqual(dateChanges.at(-1), 'scroll:2026-05-29', 'cycleDayWidth should scroll to current month when entering scrolled mode');
    assert.equal(feature.widthIcon.value, 'fa-table-cells', 'month scrolled mode should expose the paged grid icon');

    feature.cycleDayWidth();
    assert.equal(refs.monthViewMode.value, 'paged', 'cycleDayWidth should toggle month view back into paged mode');
    assert.equal(mainContent.scrollTop, 0, 'cycleDayWidth should reset main content scroll when returning to paged month mode');

    refs.currentView.value = 'week';
    refs.dayColWidth.value = 100;
    feature.cycleDayWidth();
    assert.equal(refs.dayColWidth.value, 45, 'cycleDayWidth should compact week columns on narrow screens');
    assert.deepEqual(storage.at(-1), ['musche_day_width', 45], 'cycleDayWidth should persist week column width');

    refs.isMobile.value = true;
    refs.dayColWidth.value = 52;
    feature.onMainTouchStart({ touches: [{ clientX: 250, clientY: 100 }] });
    feature.onMainTouchEnd({ changedTouches: [{ clientX: 120, clientY: 110 }] });
    assert.equal(dateChanges.at(-1), 1, 'left touch swipe in compact week view should advance the date');

    refs.isResizingMobile.value = true;
    feature.onMainTouchStart({ touches: [{ clientX: 120, clientY: 100 }] });
    feature.onMainTouchEnd({ changedTouches: [{ clientX: 260, clientY: 100 }] });
    assert.equal(dateChanges.at(-1), 1, 'main touch gestures should be ignored while mobile resizing is active');
    refs.isResizingMobile.value = false;

    dragActive = true;
    feature.onMainMouseDown({ button: 0, clientX: 100, clientY: 80, target: { closest: () => null } });
    feature.onMainMouseUp({ clientX: 10, clientY: 80 });
    assert.equal(dateChanges.at(-1), 1, 'main mouse gestures should be ignored while drag is active');
    dragActive = false;

    refs.isMobile.value = false;
    feature.onMainMouseDown({ button: 0, clientX: 100, clientY: 80, target: { closest: () => null } });
    feature.onMainMouseUp({ clientX: 10, clientY: 80 });
    assert.equal(dateChanges.at(-1), 1, 'desktop mouse left swipe should advance the date');

    let prevented = 0;
    feature.onMainWheel({
        ctrlKey: false,
        metaKey: false,
        deltaX: 40,
        deltaY: 5,
        preventDefault: () => { prevented += 1; },
    });
    assert.equal(prevented, 1, 'horizontal wheel navigation should prevent browser history gestures');
    assert.equal(dateChanges.at(-1), 1, 'positive horizontal wheel delta should advance the date');
    feature.onMainWheel({
        ctrlKey: false,
        metaKey: false,
        deltaX: 40,
        deltaY: 5,
        preventDefault: () => { prevented += 1; },
    });
    assert.equal(prevented, 1, 'wheel navigation should stay locked until the debounce timeout fires');
    timeoutCallbacks.shift()();
    feature.onMainWheel({
        ctrlKey: false,
        metaKey: false,
        deltaX: -40,
        deltaY: 5,
        preventDefault: () => { prevented += 1; },
    });
    assert.equal(dateChanges.at(-1), -1, 'negative horizontal wheel delta should move backward after lock release');

    const ghostRefs = {
        ...refs,
        currentSessionId: vueRef('S_DEFAULT'),
        sidebarTab: vueRef('musician'),
        flashingTaskId: vueRef(null),
        isContextSwitching: vueRef(false),
    };
    const ghostHaptics = [];
    const ghostTimeouts = [];
    const ghostFeature = registerMainViewNavigationFeature({
        refs: ghostRefs,
        state: {
            settings: {
                sessions: [
                    { id: 'S_ALT', name: 'Alt Session' },
                ],
            },
        },
        services: {
            storageService: {
                setItem: () => {},
            },
        },
        actions: {
            changeDate: () => {},
            scrollToMonthDate: () => {},
            isDragActive: () => false,
            triggerTouchHaptic: (type) => ghostHaptics.push(type),
            setTimeoutFn: (callback, delay) => {
                ghostTimeouts.push({ callback, delay });
            },
        },
    });

    ghostFeature.jumpToGhostContext({
        scheduleId: 'SCH-1',
        sessionId: 'S_ALT',
        projectId: 'P1',
    });

    assert.equal(ghostRefs.isContextSwitching.value, true, 'jumpToGhostContext should lock context switching immediately');
    assert.equal(ghostRefs.currentSessionId.value, 'S_ALT', 'jumpToGhostContext should switch to the ghost task session');
    assert.equal(ghostRefs.sidebarTab.value, 'project', 'jumpToGhostContext should switch to the project tab for project ghosts');

    assert.equal(ghostRefs.flashingTaskId.value, 'SCH-1', 'jumpToGhostContext should highlight the target schedule');
    assert.deepEqual(ghostTimeouts.map(({ delay }) => delay), [600, 1500], 'jumpToGhostContext should schedule lock and highlight cleanup timeouts');
    ghostTimeouts[0].callback();
    assert.equal(ghostRefs.isContextSwitching.value, false, 'jumpToGhostContext should release the context-switching lock');
    ghostTimeouts[1].callback();
    assert.equal(ghostRefs.flashingTaskId.value, null, 'jumpToGhostContext should clear the target highlight when it still matches');

    ghostFeature.jumpToGhostContext({
        scheduleId: 'SCH-2',
        sessionId: 'S_ALT',
        projectId: 'P1',
    });

}

{
    const item = { id: 'T1', sectionIndex: 1, musicDuration: '00:30', estDuration: '00:30' };
    const movedSchedule = {
        scheduleId: 101,
        templateId: 'T1',
        date: '2026-05-27',
        startTime: '10:00'
    };
    const targetSchedule = {
        scheduleId: 202,
        date: '2026-06-04',
        startTime: '11:00'
    };
    let pruneCalled = false;
    const ratioCalls = [];
    const refs = {
        trackListData: {
            value: {
                items: [
                    item,
                    { id: 'T2', musicDuration: '02:00', estDuration: '00:20', sectionIndex: 0 },
                ],
                actualDuration: '01:00',
                taskRef: { estDuration: '01:00' },
                schedules: [
                    { scheduleId: 101, date: '2026-05-27', startTime: '10:00' },
                    targetSchedule
                ],
                viewType: 'musician'
            }
        },
        trackListContainerRef: { value: null },
        draggingSectionIndex: { value: null },
        itemPool: { value: [item] },
        scheduledTasks: { value: [movedSchedule, targetSchedule] },
        showTrackList: { value: true },
        isMobile: { value: false },
        sidebarTab: { value: 'project' },
    };

    const feature = registerTrackListFeature({
        refs,
        state: { settings: { instruments: [] } },
        utils: {
            parseTime: (value) => {
                if (value === '01:00') return 60;
                if (value === '02:00') return 120;
                if (value === '00:30') return 30;
                if (value === '00:20') return 20;
                return 0;
            },
            formatSecs: (value) => `${value}s`,
            getNameById: () => ''
        },
        actions: {
            openAlertModal: () => {},
            openInputModal: () => {},
            pushHistory: () => {},
            autoUpdateEfficiency: () => {},
            checkCanDeleteSplit: () => true,
            restoreSplitTime: () => false,
            moveDivider: () => {},
            pruneEmptySchedules: () => { pruneCalled = true; },
            calculateSingleRatio: (target) => {
                ratioCalls.push(target.id);
                return `ratio:${target.id}`;
            }
        }
    });

    assert.equal(feature.getSessionRatio(), '0.4', 'TrackList session ratio should divide actual duration by total music duration');
    assert.equal(feature.calculateProportionalDuration(item), '12s', 'TrackList proportional duration should allocate schedule time by music-duration weight');
    item.records = {
        musician: { actualDuration: '01:00' },
        project: { actualDuration: '02:00' },
    };
    assert.equal(feature.calculateSingleRatio(item), 'ratio:T1', 'TrackList single ratio display should delegate to the injected lightweight ratio calculator');
    assert.deepEqual(ratioCalls, ['T1'], 'TrackList single ratio display should call the injected ratio calculator with the track item');

    assert.equal(feature.syncTrackItemScheduleSection(item, 0), true);
    assert.equal(movedSchedule.date, '2026-06-04');
    assert.equal(movedSchedule.startTime, '11:00');
    assert.equal(pruneCalled, false, 'moving an individually scheduled track must not prune its old schedule section');

    refs.trackListData.value.actualDuration = '';
    assert.equal(feature.getSessionRatio(), '-', 'TrackList session ratio should fall back when actual duration is missing');
}

{
    const parent = { id: 'PARENT', musicDuration: '01:00', estDuration: '00:20', ratio: 20, split: { musician: { musicDuration: '01:00' } } };
    const child = { id: 'CHILD', musicDuration: '00:30', estDuration: '00:10', ratio: 20, split: { musician: { splitFromId: 'PARENT', splitTag: 'Part 2', musicDuration: '00:30' } } };
    const hiddenChild = { id: 'HIDDEN', split: { musician: { splitFromId: 'PARENT', splitTag: 'Part Hidden', musicDuration: '00:45' } }, hidden: true };
    const siblingRoot = { id: 'SIBLING', split: { musician: { musicDuration: '02:00' } } };
    const scheduledForParent = { scheduleId: 'S_PARENT', templateId: 'PARENT', musicDuration: '', estDuration: '', ratio: 0, projectId: 'OLD', instrumentId: 'OLD', musicianId: 'OLD' };
    const unrelatedSchedule = { scheduleId: 'S_OTHER', templateId: 'SIBLING', musicDuration: 'keep', projectId: 'UNCHANGED' };
    const refs = {
        showSplitModal: vueRef(false),
        itemPool: vueRef([parent, child, hiddenChild, siblingRoot]),
        scheduledTasks: vueRef([scheduledForParent, unrelatedSchedule]),
        trackListData: vueRef(null),
        currentSessionId: vueRef('S_DEFAULT'),
        showTrackList: vueRef(false),
    };
    const alerts = [];
    const haptics = [];
    const legacySyncs = [];

    const feature = registerSplitTaskFeature({
        refs,
        split: {
            createHiddenSplitState: () => ({}),
            deactivateItemInView: () => {},
            getConnectedSplitItemIds: (items, id) => {
                const connected = new Set([id]);
                items.forEach((item) => {
                    if (item.id === id || item.split?.musician?.splitFromId === id || id === 'CHILD' && item.id === 'PARENT') {
                        connected.add(item.id);
                    }
                });
                return connected;
            },
            getSplitViewState: (item, viewType) => item.split?.[viewType] || {},
            hasVisibleSplitStateInAnyView: () => false,
            isItemVisibleInView: (item) => !item.hidden,
            setItemSplitState: () => {},
            syncLegacySplitFields: (item, viewType) => legacySyncs.push([item.id, viewType]),
        },
        utils: {
            parseTime: (value) => {
                const [mins = '0', secs = '0'] = String(value || '0:00').split(':');
                return Number(mins) * 60 + Number(secs);
            },
            timeToMinutes: () => 0,
            formatSecs: (seconds) => `${seconds}s`,
            generateUniqueId: () => 'NEW_SPLIT',
            calculateEstTime: () => '00:00',
        },
        actions: {
            getCurrentSplitView: () => 'musician',
            syncItemForView: () => {},
            ensureItemRecords: () => {},
            openAlertModal: (...args) => alerts.push(args),
            openInputModal: () => {},
            pushHistory: () => {},
            autoUpdateEfficiency: () => {},
            autoSortTrackList: () => {},
            triggerTouchHaptic: (type) => haptics.push(type),
        },
    });

    assert.equal(feature.checkCanDeleteSplit(parent), false, 'split delete guard should block deleting a parent with a visible direct child');
    assert.equal(alerts.at(-1)[0], '无法删除', 'split delete guard should preserve the original alert title');
    assert.match(alerts.at(-1)[1], /Part 2/, 'split delete guard should name the blocking child split tag');

    assert.equal(feature.checkCanDeleteSplit(child), true, 'split delete guard should allow deleting the last visible split part');
    assert.equal(feature.getFamilyTotalDuration(child), 90, 'split family duration should sum the visible root and child durations');
    assert.equal(feature.getFamilyTotalDuration(siblingRoot), 120, 'split family duration should ignore unrelated split families');
    assert.deepEqual(feature.getSplitFamilyMembers(parent).map((item) => item.id), ['PARENT', 'CHILD', 'HIDDEN'], 'split family lookup should return connected pool members including hidden cross-view members');

    feature.syncFamilyLegacyFields(parent, 'musician');
    assert.deepEqual(legacySyncs, [['PARENT', 'musician'], ['CHILD', 'musician'], ['HIDDEN', 'musician']], 'split family legacy sync should sync every connected family member');

    feature.syncFamilySharedIdentity(parent, { projectId: 'P2', instrumentId: 'I2', musicianId: 'M2', group: 'Strings' });
    assert.equal(parent.projectId, 'P2', 'split family identity sync should update parent project id');
    assert.equal(child.instrumentId, 'I2', 'split family identity sync should update child instrument id');
    assert.equal(hiddenChild.musicianId, 'M2', 'split family identity sync should update hidden family members too');
    assert.equal(child.group, 'Strings', 'split family identity sync should update pool item group');
    assert.equal(scheduledForParent.projectId, 'P2', 'split family identity sync should update scheduled tasks for family templates');
    assert.equal(unrelatedSchedule.projectId, 'UNCHANGED', 'split family identity sync should leave unrelated scheduled tasks alone');

    feature.syncFamilyOrchestration(parent, '2-2-2-2');
    assert.equal(parent.orchestration, '2-2-2-2', 'split family orchestration sync should update parent orchestration');
    assert.equal(child.orchestration, '2-2-2-2', 'split family orchestration sync should update child orchestration');

    feature.syncScheduledDurationsFromFamily(parent);
    assert.equal(scheduledForParent.musicDuration, '01:00', 'scheduled duration sync should copy template music duration from matching family member');
    assert.equal(scheduledForParent.estDuration, parent.estDuration, 'scheduled duration sync should copy template estimated duration from matching family member');
    assert.equal(unrelatedSchedule.musicDuration, 'keep', 'scheduled duration sync should leave unrelated schedules alone');
}

{
    const poolItem = {
        id: 'T_DELETE',
        musicianId: 'M1',
        projectId: 'P1',
        instrumentId: 'I1',
        musicDuration: '03:00',
        estDuration: '01:00:00',
        ratio: 20
    };
    const scheduledTask = {
        scheduleId: 501,
        templateId: 'T_DELETE',
        musicianId: 'M1',
        projectId: 'P1',
        instrumentId: 'I1'
    };
    const refs = {
        itemPool: { value: [poolItem] },
        scheduledTasks: { value: [scheduledTask] },
        editingItem: { value: {} },
        editingSource: { value: '' },
        showEditor: { value: false },
        sidebarTab: { value: 'musician' },
        trackListData: { value: { viewType: 'musician' } }
    };
    let cleanupCalled = false;
    let historyPushed = false;

    const feature = registerTaskEditorFeature({
        refs,
        split: {
            ensureItemSplitViews: () => {},
            normalizeSplitViewType: (viewType) => viewType || 'musician',
            getSplitViewState: () => ({ splitFromId: null }),
            setItemSplitState: () => {},
            syncLegacySplitFields: () => {},
            rebalanceSplitFamilyDuration: () => ({ ok: true }),
            syncFamilyLegacyFields: () => {},
            syncFamilySharedIdentity: () => {},
            syncFamilyOrchestration: () => {},
            syncFamilyTotalDuration: () => {},
            syncScheduledDurationsFromFamily: () => {},
        },
        utils: {
            calculateEstTime: () => '01:00:00',
            getDefaultRatio: () => 20,
        },
        actions: {
            checkCanDeleteSplit: () => true,
            restoreSplitTime: () => false,
            clearPoolRecord: () => {},
            cleanupEmptySchedules: () => { cleanupCalled = true; },
            openAlertModal: () => {},
            autoUpdateEfficiency: () => {},
            updateTaskNotification: () => {},
            pushHistory: () => { historyPushed = true; },
            cancelNotification: () => {},
        }
    });

    feature.openEditModal(poolItem, 'pool');
    await feature.deleteEditingItem();

    assert.deepEqual(refs.itemPool.value, [], 'deleting an ordinary pool edit item must remove the pool item');
    assert.deepEqual(refs.scheduledTasks.value, [], 'deleting a pool edit item must remove scheduled copies');
    assert.equal(refs.showEditor.value, false, 'Delete should close the Edit Event modal after deleting');
    assert.equal(cleanupCalled, true, 'pool deletion should prune empty schedules');
    assert.equal(historyPushed, true, 'pool deletion should push history once');
}

{
    const aggregateTask = {
        scheduleId: 991,
        musicianId: 'M_AGG',
        date: '2026-05-29',
        startTime: '09:00',
    };
    const refs = {
        itemPool: { value: [] },
        scheduledTasks: { value: [aggregateTask] },
        editingItem: { value: {} },
        editingSource: { value: '' },
        showEditor: { value: false },
        sidebarTab: { value: 'musician' },
        trackListData: { value: { viewType: 'musician' } },
    };
    const aggregateCleanupCalls = [];

    const feature = registerTaskEditorFeature({
        refs,
        split: {
            ensureItemSplitViews: () => {},
            normalizeSplitViewType: (viewType) => viewType || 'musician',
            getSplitViewState: () => ({ splitFromId: null }),
            setItemSplitState: () => {},
            syncLegacySplitFields: () => {},
            rebalanceSplitFamilyDuration: () => ({ ok: true }),
            syncFamilyLegacyFields: () => {},
            syncFamilySharedIdentity: () => {},
            syncFamilyOrchestration: () => {},
            syncFamilyTotalDuration: () => {},
            syncScheduledDurationsFromFamily: () => {},
        },
        utils: {
            calculateEstTime: () => '01:00:00',
            getDefaultRatio: () => 20,
        },
        actions: {
            checkCanDeleteSplit: () => true,
            restoreSplitTime: () => true,
            clearPoolRecord: () => {},
            clearAggregateRecords: (task) => aggregateCleanupCalls.push(task.scheduleId),
            cleanupEmptySchedules: () => {},
            openAlertModal: () => {},
            autoUpdateEfficiency: () => {},
            pushHistory: () => {},
        },
    });

    feature.openEditModal(aggregateTask, 'schedule');
    await feature.deleteEditingItem();

    assert.deepEqual(aggregateCleanupCalls, [991], 'deleting an aggregate schedule from Edit Event should clear aggregate records like Track List deletion');
    assert.deepEqual(refs.scheduledTasks.value, [], 'deleting a schedule edit item should remove the scheduled task');
}

{
    const poolItem = {
        id: 'T_SAVE',
        musicianId: 'M1',
        projectId: 'P1',
        instrumentId: 'I1',
        group: 'Strings',
        musicDuration: '00:30:00',
        ratio: 20,
        estDuration: '00:30:00',
    };
    const scheduledCopy = {
        scheduleId: 777,
        templateId: 'T_SAVE',
        musicianId: 'M1',
        projectId: 'P1',
        instrumentId: 'I1',
        musicDuration: '00:30:00',
        ratio: 20,
        estDuration: '00:30:00',
    };
    const refs = {
        itemPool: { value: [poolItem] },
        scheduledTasks: { value: [scheduledCopy] },
        editingItem: { value: {} },
        editingSource: { value: '' },
        showEditor: { value: false },
        sidebarTab: { value: 'musician' },
        trackListData: { value: { viewType: 'musician' } },
    };
    let historyCount = 0;
    const efficiencyCalls = [];

    const feature = registerTaskEditorFeature({
        refs,
        split: {
            ensureItemSplitViews: () => {},
            normalizeSplitViewType: (viewType) => viewType || 'musician',
            getSplitViewState: () => ({ splitFromId: null }),
            setItemSplitState: () => {},
            syncLegacySplitFields: () => {},
            rebalanceSplitFamilyDuration: () => ({ ok: true }),
            syncFamilyLegacyFields: () => {},
            syncFamilySharedIdentity: () => {},
            syncFamilyOrchestration: () => {},
            syncFamilyTotalDuration: () => {},
            syncScheduledDurationsFromFamily: () => {},
        },
        utils: {
            calculateEstTime: (duration, ratio) => `${duration}|${ratio}`,
            getDefaultRatio: () => 20,
        },
        actions: {
            checkCanDeleteSplit: () => true,
            restoreSplitTime: () => true,
            clearPoolRecord: () => {},
            cleanupEmptySchedules: () => {},
            openAlertModal: () => {},
            autoUpdateEfficiency: (...args) => efficiencyCalls.push(args),
            updateTaskNotification: () => {},
            pushHistory: () => { historyCount += 1; },
            cancelNotification: () => {},
        },
    });

    feature.openEditModal(poolItem, 'pool');
    const scheduledBeforeSave = refs.scheduledTasks.value[0];
    refs.editingItem.value.musicDuration = '00:45:00';
    refs.editingItem.value.ratio = 10;
    refs.editingItem.value.projectId = 'P2';
    feature.saveEdit();

    assert.notEqual(refs.scheduledTasks.value[0], scheduledBeforeSave, 'saving a pool item should replace related scheduled copies to refresh Vue');
    assert.equal(refs.scheduledTasks.value[0].musicDuration, '00:45:00', 'saving a pool item should sync duration to scheduled copies');
    assert.equal(refs.scheduledTasks.value[0].ratio, 10, 'saving a pool item should sync ratio to scheduled copies');
    assert.equal(refs.scheduledTasks.value[0].estDuration, '00:45:00|10', 'saving a pool item should sync recalculated estimated duration to scheduled copies');
    assert.equal(refs.scheduledTasks.value[0].projectId, 'P2', 'saving a pool item should sync changed project identity to scheduled copies');
    assert.equal(refs.showEditor.value, false, 'saving a pool edit should close the editor');
    assert.equal(historyCount, 1, 'saving a pool edit should push history once');
    assert.deepEqual(efficiencyCalls, [['M1', 'musician', false], ['P2', 'project', false]], 'saving a pool edit should refresh musician and project efficiency');
}

{
    const refs = {
        showProjectInfoModal: { value: false },
    };
    const state = {
        settings: {
            projects: [{
                id: 'P_INFO',
                name: 'Visible Project Name',
                composer: 'Existing Composer',
                mixingStudio: 'Existing Studio',
            }],
        },
    };
    let hapticType = null;

    const feature = registerProjectInfoFeature({
        refs,
        state,
        actions: {
            triggerTouchHaptic: (type) => { hapticType = type; },
        },
    });

    feature.openProjectInfoModal(state.settings.projects[0]);

    assert.equal(feature.projectInfoForm.id, 'P_INFO', 'Project Info form must track the edited project id');
    assert.equal(feature.projectInfoForm.title, 'Visible Project Name', 'Project Info title should default to the project name');
    assert.equal(feature.projectInfoForm.composer, 'Existing Composer', 'Project Info form should backfill existing metadata');
    assert.equal(feature.projectInfoForm.mixingStudio, 'Existing Studio', 'Project Info form should backfill technical metadata');
    assert.equal(refs.showProjectInfoModal.value, true, 'opening Project Info should show the modal');

    feature.projectInfoForm.title = 'Updated Title';
    feature.projectInfoForm.producer = 'Updated Producer';
    feature.saveProjectInfo();

    assert.equal(state.settings.projects[0].title, 'Updated Title', 'saving Project Info should merge form fields back to the project');
    assert.equal(state.settings.projects[0].producer, 'Updated Producer', 'saving Project Info should preserve updated producer metadata');
    assert.equal(refs.showProjectInfoModal.value, false, 'saving Project Info should close the modal');

}

{
    const scheduledTask = {
        scheduleId: 8801,
        recordingInfo: {
            studio: 'Old Studio',
            engineer: 'Old Engineer',
            operator: '',
            assistant: '',
            notes: 'Old Notes',
        },
        editInfo: {
            studio: 'Edit Studio',
            engineer: 'Edit Engineer',
            operator: '',
            assistant: '',
            notes: 'Edit Notes',
        },
    };
    const refs = {
        trackListData: { value: { taskRef: scheduledTask } },
        sidebarTab: { value: 'musician' },
        scheduledTasks: { value: [scheduledTask] },
        itemPool: { value: [
            { id: 'POOL_1', recordingInfo: { studio: 'Old Studio' } },
            { id: 'POOL_2', recordingInfo: { studio: 'Other Studio' } },
        ] },
    };
    const state = {
        settings: {
            studios: [
                { id: 'S1', name: 'Old Studio' },
                { id: 'S2', name: 'Merged Studio' },
            ],
            engineers: [{ id: 'E1', name: 'Old Engineer' }],
            operators: [],
            assistants: [],
        },
    };
    let historyCount = 0;
    let hapticType = null;
    const confirms = [];
    const alerts = [];

    const feature = registerRecInfoFeature({
        refs,
        state,
        utils: {
            generateUniqueId: () => 'REC_NEW',
        },
        actions: {
            pushHistory: () => { historyCount += 1; },
            triggerTouchHaptic: (type) => { hapticType = type; },
            promptForValue: () => 'Prompted Name',
            openConfirmModal: (...args) => confirms.push(args),
            openAlertModal: (...args) => alerts.push(args),
        },
    });

    feature.openRecInfoModal();

    assert.equal(feature.showRecInfoModal.value, true, 'opening Rec Info should show the modal');
    assert.equal(feature.recInfoForm.studio, 'Old Studio', 'Rec Info should backfill recording metadata outside project mode');
    assert.equal(feature.recInfoForm.notes, 'Old Notes', 'Rec Info should backfill notes outside project mode');

    feature.recInfoForm.studio = '  Saved Studio  ';
    feature.recInfoForm.engineer = 'Saved Engineer';
    feature.saveRecInfo();

    assert.deepEqual(scheduledTask.recordingInfo, {
        studio: 'Saved Studio',
        engineer: 'Saved Engineer',
        operator: '',
        assistant: '',
        notes: 'Old Notes',
    }, 'saving Rec Info should trim and store recordingInfo outside project mode');
    assert.deepEqual(refs.scheduledTasks.value[0], { ...scheduledTask }, 'saving Rec Info should replace the scheduled task entry to refresh the view');
    assert.equal(feature.showRecInfoModal.value, false, 'saving Rec Info should close the modal');
    assert.equal(historyCount, 1, 'saving Rec Info should push history once');


    refs.sidebarTab.value = 'project';
    feature.openRecInfoModal();
    assert.equal(feature.recInfoForm.studio, 'Edit Studio', 'Rec Info should backfill edit metadata in project mode');
    feature.recInfoForm.notes = '  Updated Edit Notes  ';
    feature.saveRecInfo();
    assert.equal(scheduledTask.editInfo.notes, 'Updated Edit Notes', 'saving Rec Info should store editInfo in project mode');

    feature.activeRecDropdown.value = 'engineer';
    feature.recDropdownSearch.value = 'old';
    assert.equal(feature.filteredRecOptions.value[0].name, 'Old Engineer', 'Rec Info dropdown should filter the active metadata list');
    feature.selectRecOption({ id: 'E1', name: 'Old Engineer' });
    assert.equal(feature.recInfoForm.engineer, 'Old Engineer', 'selecting a Rec Info dropdown item should fill the active form field');
    assert.equal(feature.activeRecDropdown.value, null, 'selecting a Rec Info dropdown item should close the dropdown');

    feature.activeRecDropdown.value = 'assistant';
    feature.recDropdownSearch.value = 'New Assistant';
    feature.createRecOption();
    assert.deepEqual(state.settings.assistants[0], { id: 'REC_NEW', name: 'New Assistant' }, 'creating a Rec Info option should add it to the matching metadata list');
    assert.equal(feature.recInfoForm.assistant, 'New Assistant', 'creating a Rec Info option should fill the active form field');

    feature.removeRecItem('assistant', 'REC_NEW');
    assert.deepEqual(state.settings.assistants, [], 'removing a Rec Info option should delete it from the matching metadata list');

    scheduledTask.recordingInfo.studio = 'Old Studio';
    const renameTarget = state.settings.studios[0];
    const renameEvent = { target: { value: '  Renamed Studio  ' } };
    feature.handleRecRename('studio', renameTarget, renameEvent);
    assert.equal(renameTarget.name, 'Renamed Studio', 'renaming recording metadata should trim and update the setting item');
    assert.equal(refs.itemPool.value[0].recordingInfo.studio, 'Renamed Studio', 'renaming recording metadata should update matching pool recordingInfo');
    assert.equal(refs.itemPool.value[1].recordingInfo.studio, 'Other Studio', 'renaming recording metadata should leave unrelated pool recordingInfo intact');
    assert.equal(scheduledTask.recordingInfo.studio, 'Renamed Studio', 'renaming recording metadata should update matching scheduled recordingInfo');
    assert.equal(historyCount, 5, 'renaming recording metadata should push history');


    const blankRenameEvent = { target: { value: '   ' } };
    feature.handleRecRename('studio', renameTarget, blankRenameEvent);
    assert.equal(blankRenameEvent.target.value, 'Renamed Studio', 'blank recording metadata rename should roll the input back to the old name');

    const mergeEvent = { target: { value: 'merged studio' } };
    feature.handleRecRename('studio', renameTarget, mergeEvent);
    assert.equal(mergeEvent.target.value, 'Renamed Studio', 'duplicate recording metadata rename should roll back while waiting for confirmation');
    assert.equal(confirms.at(-1)[0], '合并条目', 'duplicate recording metadata rename should open the original merge confirmation');
    confirms.at(-1)[2]();
    assert.equal(refs.itemPool.value[0].recordingInfo.studio, 'Merged Studio', 'confirmed recording metadata merge should update pool references to the existing item');
    assert.equal(scheduledTask.recordingInfo.studio, 'Merged Studio', 'confirmed recording metadata merge should update scheduled references to the existing item');
    assert.deepEqual(state.settings.studios.map((item) => item.name), ['Merged Studio'], 'confirmed recording metadata merge should remove the merged item from settings');
    assert.equal(alerts.at(-1)[0], '合并成功', 'confirmed recording metadata merge should show the original success alert');
}

{
    const editingItem = {
        value: {
            id: 'PERC_ITEM',
            musicianId: 'M_PERC',
            instrumentId: 'I_SNARE',
            orchestration: '',
        },
    };
    const refs = {
        editingItem,
        showEditor: { value: false },
        sidebarTab: { value: 'musician' },
        itemPool: {
            value: [
                { id: 'T1', musicianId: 'M_PERC', instrumentId: 'I_SNARE', sessionId: 'S1' },
                { id: 'T2', musicianId: 'M_PERC', instrumentId: 'I_CYMBAL', sessionId: 'S1' },
                { id: 'T3', musicianId: 'M_PERC', instrumentId: 'I_TRI', sessionId: 'S2' },
            ],
        },
        scheduledTasks: {
            value: [
                { scheduleId: 1, musicianId: 'M_PERC', sessionId: 'S1' },
                { scheduleId: 2, musicianId: 'M_OTHER', sessionId: 'S1' },
            ],
        },
        currentSessionId: { value: 'S1' },
    };
    const state = {
        settings: {
            instruments: [
                { id: 'I_SNARE', name: 'Snare Drum', group: 'Percussion' },
                { id: 'I_CYMBAL', name: 'Suspended Cymbal', group: 'Percussion' },
                { id: 'I_TRI', name: 'Triangle', group: 'Percussion' },
            ],
            musicians: [{ id: 'M_PERC', name: 'SPO Percussion Player' }],
        },
    };
    let hapticType = null;

    const feature = registerOrchestrationFeature({
        refs,
        state,
        utils: {
            getNameById: (id, type) => {
                const list = type === 'instrument' ? state.settings.instruments : state.settings.musicians;
                return list.find((item) => item.id === id)?.name || '';
            },
        },
        actions: {
            triggerTouchHaptic: (type) => { hapticType = type; },
        },
    });

    assert.equal(feature.isPercussionMode.value, true, 'percussion mode should activate from instrument or musician text');

    feature.scanPercussionTags();
    assert.deepEqual(
        feature.percState.tags.map((tag) => tag.fullName),
        ['Snare Drum', 'Suspended Cymbal'],
        'scanning percussion tags should include only current-session related instruments'
    );

    feature.addPercPlayer();
    assert.equal(feature.percState.players.length, 2, 'adding a percussion player should append a named player');
    feature.togglePercTagSelect(0);
    feature.assignTagsToPlayer(2);

    assert.equal(feature.percState.tags[0].assignedTo, 2, 'assigning selected tags should attach them to the chosen player');

    assert.equal(editingItem.value.roster.Player_2, 'Perc 2', 'percussion orchestration should update the editing roster');
    assert.match(editingItem.value.orchestration, /Perc 2 \(Snare Drum\)/, 'percussion orchestration should summarize assigned tags');
    assert.equal(state.settings.musicians[0].percConfig.tags[0].assignedTo, 2, 'percussion config should persist on the musician');
    assert.equal(refs.itemPool.value[0].orchestration, editingItem.value.orchestration, 'percussion updates should sync current-session pool items for the musician');
    assert.equal(refs.scheduledTasks.value[0].orchestration, editingItem.value.orchestration, 'percussion updates should sync current-session scheduled tasks for the musician');
    assert.equal(refs.scheduledTasks.value[1].orchestration, undefined, 'percussion updates should not touch other musicians');

    editingItem.value.instrumentId = 'I_SNARE';
    editingItem.value.orchestration = '2 Fl, 1 Ob + 3';
    assert.deepEqual(feature.activeOrchPresets.value.std, '2 Fl, 2 Ob, 2 Cl, 2 Bsn', 'percussion groups should fall back to woodwind presets just like the original app logic');
    assert.deepEqual(
        feature.parsedRoster.value,
        [
            { label: 'Fl', count: 2, startIndex: 0 },
            { label: 'Ob', count: 1, startIndex: 0 },
            { label: 'Player', count: 3, startIndex: 0 },
        ],
        'parsed roster should split orchestration strings into labeled player sections'
    );
    feature.updateRosterName('Fl', 0, 'Alice');
    assert.equal(feature.getRosterName('Fl', 0), 'Alice', 'roster name helpers should persist names on the editing item');
}

{
    const refs = {
        showConfirmModal: { value: false },
        confirmModalConfig: {
            title: '',
            content: '',
            isAlert: false,
            isDestructive: false,
            confirmText: '',
            cancelText: '',
            onConfirm: null,
            onCancel: null,
        },
        showInputModal: { value: false },
        inputModalConfig: {
            title: '',
            value: '',
            placeholder: '',
            callback: null,
            hint: '',
        },
        universalInputRef: {
            value: {
                focused: false,
                selected: false,
                focus() { this.focused = true; },
                select() { this.selected = true; },
            },
        },
    };
    const haptics = [];
    let confirmed = false;
    let cancelled = false;
    let inputValue = null;

    const feature = registerUniversalModalFeature({
        refs,
        actions: {
            triggerTouchHaptic: (type) => haptics.push(type),
        },
    });

    feature.openAlertModal('Notice', 'Read this', () => { confirmed = true; });
    assert.equal(refs.showConfirmModal.value, true, 'opening an alert should show the confirm modal');
    assert.equal(refs.confirmModalConfig.isAlert, true, 'alert modals should set alert mode');
    assert.equal(refs.confirmModalConfig.confirmText, '我知道了', 'alert modals should keep the original acknowledgement text');


    feature.handleConfirmAction();
    assert.equal(confirmed, true, 'confirm action should run alert confirm callbacks');
    assert.equal(refs.showConfirmModal.value, false, 'confirm action should close the confirm modal');

    refs.confirmModalConfig.onConfirm = () => { confirmed = true; };
    refs.confirmModalConfig.onCancel = () => { cancelled = true; };
    confirmed = false;
    feature.openConfirmModal('Delete', 'Really?', () => { confirmed = true; }, true, 'Delete', 'Back');
    refs.confirmModalConfig.onCancel = () => { cancelled = true; };
    feature.handleConfirmAction();
    assert.equal(confirmed, true, 'confirm action should run confirm callbacks');
    assert.equal(cancelled, false, 'confirm action should clear onCancel before closing');

    refs.confirmModalConfig.onCancel = () => { cancelled = true; };
    feature.closeConfirmModal();
    assert.equal(cancelled, true, 'closing confirm modal directly should preserve existing cancel behavior');
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 330));
    assert.equal(refs.confirmModalConfig.onConfirm, null, 'confirm modal callbacks should still be cleared after the original delay');
    assert.equal(refs.confirmModalConfig.onCancel, null, 'confirm modal cancel callback should still be cleared after the original delay');

    feature.openInputModal('Rename', '  Old Name  ', 'Name', (value) => { inputValue = value; }, 'Helpful hint');
    await Promise.resolve();
    assert.equal(refs.showInputModal.value, true, 'opening input modal should show the input modal');
    assert.equal(refs.inputModalConfig.hint, 'Helpful hint', 'input modal should preserve hints');
    assert.equal(refs.universalInputRef.value.focused, true, 'input modal should focus the universal input on the next tick');
    assert.equal(refs.universalInputRef.value.selected, true, 'input modal should select the universal input text on the next tick');
    feature.confirmInputModal();
    assert.equal(inputValue, 'Old Name', 'confirming input modal should trim the input value before callback');
    assert.equal(refs.showInputModal.value, false, 'confirming input modal should close the input modal');
    assert.equal(refs.inputModalConfig.callback, null, 'closing input modal should clear the callback');
}

{
    const refs = {
        quickAddType: { value: '' },
        quickAddForm: {
            name: '',
            group: '',
            defaultRatio: 12,
        },
        showQuickAddModal: { value: false },
        activeDropdown: { value: 'edit_project' },
        itemPool: { value: [] },
        currentSessionId: { value: 'S1' },
        isMobile: { value: true },
        showMobileTaskInput: { value: true },
    };
    const state = {
        settings: {
            projects: [{ id: 'P_OLD', name: 'Existing', group: 'Film' }],
            instruments: [{ id: 'I_OLD', name: 'Horn', group: 'Brass' }],
            musicians: [{ id: 'M_OLD', name: 'Player', group: 'Team' }],
        },
        newItem: {
            projectId: '',
            instrumentId: '',
            musicianId: '',
            musicDuration: '',
        },
    };
    const haptics = [];
    const alerts = [];
    let historyCount = 0;
    let focusedId = null;

    const feature = registerQuickAddFeature({
        refs,
        state,
        utils: {
            getExistingGroups: (type) => [...new Set(state.settings[`${type}s`].map((item) => item.group).filter(Boolean))],
            generateUniqueId: (prefix) => `${prefix}_NEW`,
            generateRandomHexColor: () => '#123456',
            getDefaultRatio: () => 24,
            getNameById: () => 'Horn',
            calculateEstTime: (duration, ratio) => `${duration} x${ratio}`,
            ensureItemRecords: (item) => ({ ...item, recordsReady: true }),
        },
        actions: {
            openAlertModal: (...args) => alerts.push(args),
            pushHistory: () => { historyCount += 1; },
            triggerTouchHaptic: (type) => haptics.push(type),
            focusElementById: (id) => { focusedId = id; },
        },
    });

    refs.quickAddType.value = 'project';
    assert.deepEqual(feature.currentQuickAddGroups.value, ['Film'], 'Quick Add should expose existing groups for the active type');

    feature.openQuickAdd('musician');
    assert.equal(refs.quickAddType.value, 'musician', 'opening Quick Add should set the target type');
    assert.equal(refs.quickAddForm.name, '', 'opening Quick Add should reset the name field');
    assert.equal(refs.quickAddForm.group, '', 'opening Quick Add should reset the group field');
    assert.equal(refs.quickAddForm.defaultRatio, 20, 'opening Quick Add should reset default ratio to the original value');
    assert.equal(refs.showQuickAddModal.value, true, 'opening Quick Add should show the modal');
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 120));
    assert.equal(focusedId, 'quick-add-name', 'opening Quick Add should focus the name input after the original delay');

    feature.confirmQuickAdd();
    assert.equal(alerts.at(-1)[0], '名称不能为空', 'saving an empty Quick Add should alert without mutating settings');

    refs.quickAddType.value = 'project';
    refs.quickAddForm.name = 'existing';
    feature.confirmQuickAdd();

    assert.equal(alerts.at(-1)[0], '无法添加', 'saving a duplicate Quick Add should show the duplicate alert');

    refs.quickAddType.value = 'musician';
    refs.quickAddForm.name = 'New Player';
    refs.quickAddForm.group = 'New Team';
    refs.quickAddForm.defaultRatio = 32;
    feature.confirmQuickAdd();

    assert.deepEqual(state.settings.musicians.at(-1), {
        id: 'M_NEW',
        name: 'New Player',
        group: 'New Team',
        color: '#123456',
        defaultRatio: 32,
    }, 'saving Quick Add should append the new item with generated id, color, group, and default ratio');
    assert.equal(state.newItem.musicianId, 'M_NEW', 'saving a musician Quick Add should select it in the draft item');
    assert.equal(state.newItem.ratio, 32, 'saving a musician Quick Add should sync the draft ratio from the new musician default');
    assert.equal(historyCount, 1, 'saving Quick Add should push history once');
    assert.equal(refs.showQuickAddModal.value, false, 'saving Quick Add should close the modal');
    assert.equal(refs.activeDropdown.value, null, 'saving Quick Add should close the active dropdown');


    state.settings.musicians.push({ id: 'M_EXISTING', name: 'Existing Player', defaultRatio: 14 });
    state.newItem.musicianId = 'M_EXISTING';
    feature.onMusicianSelect();
    assert.equal(state.newItem.ratio, 14, 'musician select should sync the draft ratio from an existing musician default');

    refs.itemPool.value = [{
        id: 'EXISTING_POOL',
        sessionId: 'S1',
        projectId: 'P1',
        instrumentId: 'I_OLD',
        name: 'Flute 1',
    }];
    Object.assign(state.newItem, {
        projectId: 'P1',
        instrumentId: 'I_OLD',
        musicianId: 'M_EXISTING',
        musicDuration: '02:30',
        _autoSuggestedName: 'Flute 1',
    });
    feature.addItemToPool();
    assert.equal(refs.itemPool.value.length, 2, 'adding a draft item should append one pool item');
    assert.deepEqual(refs.itemPool.value.at(-1), {
        id: 'T_NEW',
        sessionId: 'S1',
        projectId: 'P1',
        instrumentId: 'I_OLD',
        musicianId: 'M_EXISTING',
        musicDuration: '02:30',
        orchestration: '',
        ratios: { musician: null, project: null, instrument: null },
        ratio: 24,
        estDuration: '02:30 x24',
        name: 'Flute 1 2',
        recordsReady: true,
    }, 'adding a draft item should preserve duplicate-name numbering, ratio, estimate, and record initialization');
    assert.equal(state.newItem._autoSuggestedName, null, 'adding a draft item should clear the auto-suggested name marker');
    assert.equal(refs.showMobileTaskInput.value, false, 'adding a draft item should close the mobile task input');
    assert.equal(historyCount, 2, 'adding a draft item should push history after the existing Quick Add save');


    refs.itemPool.value = [];
    Object.assign(state.newItem, { projectId: '', instrumentId: '', musicianId: '', musicDuration: '' });
    feature.addItemToPool();
    assert.equal(alerts.at(-1)[0], '信息不完整', 'adding an incomplete draft item should show the original validation alert');
    assert.equal(refs.itemPool.value.length, 0, 'adding an incomplete draft item should not mutate the pool');
}

{
    const refs = {
        showDurationPicker: { value: false },
        tempDuration: { m: 0, s: 0 },
        pickerMinRef: { value: { scrollTop: 0 } },
        pickerSecRef: { value: { scrollTop: 0 } },
        pickerPos: { top: 0, left: 0 },
    };
    const targetObj = {
        musicDuration: '03:07',
        ratio: 10,
        estDuration: '',
    };
    const haptics = [];
    let historyCount = 0;
    const events = [];
    const activeCol = {
        scrollTop: 88,
        dispatched: null,
        dispatchEvent(event) { this.dispatched = event.type; },
    };
    const feature = registerDurationPickerFeature({
        refs,
        utils: {
            calculateEstTime: (duration, ratio) => `${duration}@${ratio}`,
        },
        actions: {
            pushHistory: () => { historyCount += 1; },
            triggerTouchHaptic: (type) => haptics.push(type),
            addWindowListener: (type, handler) => events.push(['add', type, handler.name]),
            removeWindowListener: (type, handler) => events.push(['remove', type, handler.name]),
            getWindowInnerWidth: () => 360,
        },
    });

    feature.openDurationPicker({
        target: {
            getBoundingClientRect: () => ({ left: 120, width: 80, top: 100, bottom: 142 }),
        },
    }, targetObj, 'musicDuration');

    assert.equal(refs.pickerPos.left, 20, 'duration picker should center within viewport bounds using the original box width');
    assert.equal(refs.pickerPos.top, 157, 'duration picker should move below the field when there is not enough room above');
    assert.equal(refs.tempDuration.m, 3, 'duration picker should parse current minutes');
    assert.equal(refs.tempDuration.s, 7, 'duration picker should parse current seconds');
    assert.equal(refs.showDurationPicker.value, true, 'opening duration picker should show it');
    await Promise.resolve();
    assert.equal(refs.pickerMinRef.value.scrollTop, 132, 'duration picker should scroll minute column to the current value');
    assert.equal(refs.pickerSecRef.value.scrollTop, 308, 'duration picker should scroll second column to the current value');

    feature.onScroll({ target: { scrollTop: 176 } }, 'm');
    assert.equal(refs.tempDuration.m, 4, 'duration picker scroll should snap minutes from scroll position');

    feature.onScroll({ target: { scrollTop: 88 } }, 's');
    assert.equal(refs.tempDuration.s, 2, 'duration picker scroll should snap seconds from scroll position');

    refs.pickerMinRef.value = activeCol;
    feature.onDragStart({ button: 0, clientY: 120, preventDefault() {} }, 'm');
    feature.onDragMove({ clientY: 100, preventDefault() {} });
    assert.equal(activeCol.scrollTop, 108, 'duration picker drag should adjust scrollTop using the original drag math');
    feature.onDragEnd();
    assert.equal(activeCol.dispatched, 'scroll', 'duration picker drag end should dispatch a scroll event');
    assert.deepEqual(events.map(([kind, type]) => [kind, type]), [
        ['add', 'mousemove'],
        ['add', 'mouseup'],
        ['remove', 'mousemove'],
        ['remove', 'mouseup'],
    ], 'duration picker drag should register and remove the same window listeners');

    feature.confirmDurationPicker();
    assert.equal(targetObj.musicDuration, '04:02', 'confirming duration picker should write the padded duration');
    assert.equal(targetObj.estDuration, '04:02@10', 'confirming duration picker should recalculate estimated duration when possible');
    assert.equal(historyCount, 1, 'confirming duration picker should push history once');
    assert.equal(refs.showDurationPicker.value, false, 'confirming duration picker should close it');

    refs.showDurationPicker.value = true;
    feature.openDurationPicker({
        target: {
            getBoundingClientRect: () => ({ left: 20, width: 80, top: 500, bottom: 542 }),
        },
    }, targetObj, 'musicDuration');
    feature.resetDuration();
    assert.equal(targetObj.musicDuration, '', 'resetting duration picker should clear the target duration');
    assert.equal(historyCount, 2, 'resetting duration picker should push history once');
    assert.equal(refs.showDurationPicker.value, false, 'resetting duration picker should close it');
}

{
    const refs = {
        itemPool: {
            value: [
                { id: 'A', musicianId: 'M1', sessionId: 'S1', sectionIndex: 1, records: { musician: { recStart: '10:30' } } },
            ],
        },
        scheduledTasks: { value: [{ scheduleId: 1 }] },
        history: {
            value: [
                JSON.stringify({
                    pool: [{ id: 'OLD', musicianId: 'M1', sessionId: 'S1', sectionIndex: 2, records: { musician: { recStart: '09:00' } } }],
                    tasks: [{ scheduleId: 100 }],
                    settings: { marker: 'old' },
                }),
                JSON.stringify({
                    pool: [
                        { id: 'B', musicianId: 'M1', sessionId: 'S1', sectionIndex: 2, records: { musician: { recStart: '09:30' } } },
                        { id: 'C', musicianId: 'M1', sessionId: 'S1', sectionIndex: 1, records: { musician: { recStart: '11:00' } } },
                        { id: 'D', musicianId: 'M2', sessionId: 'S1', sectionIndex: 0, records: { musician: { recStart: '08:00' } } },
                    ],
                    tasks: [{ scheduleId: 200 }],
                    settings: { marker: 'new' },
                }),
            ],
        },
        historyIndex: { value: 1 },
        showTrackList: { value: true },
        trackListData: {
            value: {
                taskRef: { musicianId: 'M1' },
                viewType: 'musician',
                items: [],
            },
        },
        currentSessionId: { value: 'S1' },
    };
    const state = {
        settings: { marker: 'current', untouched: true },
    };
    const synced = [];

    const feature = registerHistoryFeature({
        refs,
        state,
        actions: {
            isItemVisibleForView: () => true,
            syncItemsForView: (items, viewType) => {
                synced.push({ ids: items.map((item) => item.id), viewType });
                return items;
            },
        },
    });

    feature.undo();
    assert.equal(refs.historyIndex.value, 0, 'undo should move back one history entry');
    assert.deepEqual(refs.scheduledTasks.value, [{ scheduleId: 100 }], 'undo should restore scheduled tasks');
    assert.equal(state.settings.marker, 'old', 'undo should merge saved settings into the live settings object');
    assert.deepEqual(refs.trackListData.value.items.map((item) => item.id), ['OLD'], 'undo should refresh visible TrackList items');
    assert.deepEqual(synced.at(-1), { ids: ['OLD'], viewType: 'musician' }, 'undo should sync refreshed TrackList items for the active view');

    feature.redo();
    assert.equal(refs.historyIndex.value, 1, 'redo should move forward one history entry');
    assert.deepEqual(refs.scheduledTasks.value, [{ scheduleId: 200 }], 'redo should restore scheduled tasks');
    assert.equal(state.settings.marker, 'new', 'redo should merge saved settings into the live settings object');
    assert.deepEqual(refs.trackListData.value.items.map((item) => item.id), ['C', 'B'], 'redo should sort refreshed TrackList items by section and rec start');

    refs.itemPool.value = [{ id: 'LIVE' }];
    refs.scheduledTasks.value = [{ scheduleId: 300 }];
    state.settings.marker = 'live';
    feature.pushHistory();
    assert.equal(refs.historyIndex.value, 2, 'pushHistory should append after the current index');
    assert.deepEqual(JSON.parse(refs.history.value.at(-1)), {
        pool: [{ id: 'LIVE' }],
        tasks: [{ scheduleId: 300 }],
        settings: { marker: 'live', untouched: true },
    }, 'pushHistory should snapshot pool, tasks, and settings');

    refs.history.value = Array.from({ length: 50 }, (_, index) => JSON.stringify({ pool: [{ id: index }], tasks: [], settings: {} }));
    refs.historyIndex.value = 49;
    feature.pushHistory();
    assert.equal(refs.history.value.length, 50, 'pushHistory should keep the original 50-entry cap');
    assert.equal(refs.historyIndex.value, 49, 'pushHistory should keep index aligned after shifting capped history');
}

{
    const refs = {
        itemPool: { value: [{ id: 'POOL1' }] },
        scheduledTasks: {
            value: [{
                scheduleId: 42,
                date: '2026-05-29',
                startTime: '09:15',
                estDuration: '00:45:00',
                musicianId: 'M1',
                instrumentId: 'I1',
                projectId: 'P1',
            }],
        },
        currentSessionId: { value: 'S_OLD' },
    };
    const state = {
        settings: {
            marker: 'before',
            sessions: [{ id: 'S_OLD', name: 'Old Session' }],
        },
    };
    const inputs = [];
    const alerts = [];
    const downloads = [];
    let historyCount = 0;
    let uploadClicked = false;
    const uploadInput = {
        value: 'previous',
        click() { uploadClicked = true; },
    };

    const feature = registerDataPortabilityFeature({
        refs,
        state,
        utils: {
            parseTime: (value) => {
                if (value === '00:45:00') return 2700;
                return 0;
            },
            getNameById: (id, type) => ({
                musician: { M1: 'Alice' },
                instrument: { I1: 'Violin' },
                project: { P1: 'Project One' },
            }[type]?.[id] || ''),
            getDate: () => new Date('2026-05-29T10:00:00'),
        },
        actions: {
            openInputModal: (...args) => inputs.push(args),
            openAlertModal: (...args) => alerts.push(args),
            pushHistory: () => { historyCount += 1; },
            downloadTextFile: (content, fileName, mimeType) => downloads.push({ content, fileName, mimeType }),
            getElementById: (id) => id === 'json-upload' ? uploadInput : null,
            readFileAsText: (file, encoding, onLoad) => onLoad({ target: { result: file.text } }),
            logError: () => {},
        },
    });

    refs.scheduledTasks.value = [];
    feature.exportToICS();
    assert.equal(alerts.at(-1)[0], '日程表是空的', 'ICS export should alert when schedule is empty');

    refs.scheduledTasks.value = [{
        scheduleId: 42,
        date: '2026-05-29',
        startTime: '09:15',
        estDuration: '00:45:00',
        musicianId: 'M1',
        instrumentId: 'I1',
        projectId: 'P1',
    }];
    feature.exportToICS();
    assert.equal(inputs.at(-1)[0], '导出日历 (ICS)', 'ICS export should use the original input modal title');
    inputs.at(-1)[3]('session');
    assert.equal(downloads.at(-1).fileName, 'session.ics', 'ICS export should append .ics when missing');
    assert.equal(downloads.at(-1).mimeType, 'text/calendar', 'ICS export should download a calendar mime type');
    assert.match(downloads.at(-1).content, /SUMMARY:Alice - Violin \(Project One\)/, 'ICS export should include resolved task names');
    assert.match(downloads.at(-1).content, /DTEND:20260529T100000/, 'ICS export should calculate event end time from estimated duration');

    feature.exportJSON();
    assert.equal(inputs.at(-1)[1], 'backup_20260529.json', 'JSON export should keep the original date-based default filename');
    assert.equal(inputs.at(-1)[4], '文件将保存到您的下载文件夹', 'JSON export should keep the original helper hint');
    inputs.at(-1)[3]('backup-file');
    assert.equal(downloads.at(-1).fileName, 'backup-file.json', 'JSON export should append .json when missing');
    assert.equal(downloads.at(-1).mimeType, 'application/json', 'JSON export should download JSON mime type');
    assert.deepEqual(JSON.parse(downloads.at(-1).content), {
        pool: refs.itemPool.value,
        tasks: refs.scheduledTasks.value,
        settings: state.settings,
    }, 'JSON export should snapshot pool, tasks, and settings');

    feature.importJSON();
    assert.equal(feature.showImportModal.value, true, 'importJSON should show the restore modal');
    feature.triggerFileSelect();
    assert.equal(uploadInput.value, '', 'triggerFileSelect should clear prior input value');
    assert.equal(uploadClicked, true, 'triggerFileSelect should click the hidden upload input');

    const event = {
        target: {
            files: [{
                text: JSON.stringify({
                    pool: [{ id: 'RESTORED' }],
                    tasks: [{ scheduleId: 99 }],
                    settings: {
                        marker: 'restored',
                        sessions: [{ id: 'S_RESTORED', name: 'Restored Session' }],
                        lastSessionId: 'S_RESTORED',
                    },
                }),
            }],
            value: 'selected',
        },
    };
    feature.handleJSONFile(event);
    assert.deepEqual(refs.itemPool.value, [{ id: 'RESTORED' }], 'JSON import should restore pool data');
    assert.deepEqual(refs.scheduledTasks.value, [{ scheduleId: 99 }], 'JSON import should restore scheduled tasks');
    assert.equal(state.settings.marker, 'restored', 'JSON import should merge settings');
    assert.equal(refs.currentSessionId.value, 'S_RESTORED', 'JSON import should restore the last active session when the backup contains a valid session id');
    assert.equal(historyCount, 2, 'JSON import should push history before and after restore');
    assert.equal(feature.showImportModal.value, false, 'JSON import should close the restore modal after success');
    assert.equal(alerts.at(-1)[0], '导入成功', 'JSON import should show the original success alert');
    assert.equal(event.target.value, '', 'JSON import should clear the file input after reading');

    feature.handleJSONFile({ target: { files: [{ text: '{"bad":true}' }], value: 'bad' } });
    assert.equal(alerts.at(-1)[0], '导入失败', 'invalid JSON backup should show the original failure alert');
}

{
    const refs = {
        itemPool: {
            value: [{
                id: 'POOL1',
                sessionId: 'S1',
                musicianId: 'M1',
                instrumentId: 'I1',
                projectId: 'P1',
            }],
        },
        scheduledTasks: {
            value: [{
                scheduleId: 42,
                sessionId: 'S1',
                date: '2026-05-29',
                startTime: '09:15',
                estDuration: '00:45:00',
                musicianId: 'M1',
            }],
        },
        currentSessionId: { value: 'S1' },
    };
    const state = {
        settings: {
            sessions: [{ id: 'S1', name: 'Session One' }],
            instruments: [{ id: 'I1', name: 'Violin', group: 'Strings' }],
            musicians: [{ id: 'M1', name: 'Alice' }],
            projects: [{ id: 'P1', name: 'Project One' }],
        },
    };
    const inputs = [];
    const alerts = [];
    let loadCount = 0;
    const workbook = { sheets: [] };
    const fakeXlsx = {
        utils: {
            encode_cell: ({ r, c }) => `${r}:${c}`,
            aoa_to_sheet: (data) => ({ data }),
            encode_range: () => 'A1:I2',
            book_new: () => workbook,
            book_append_sheet: (wb, sheet, name) => wb.sheets.push({ sheet, name }),
        },
        writeFile(wb, fileName) {
            wb.fileName = fileName;
        },
    };

    const feature = registerExportCsvFeature({
        refs,
        state,
        utils: {
            parseTime: (value) => value === '00:45:00' ? 2700 : 0,
            getNameById: (id, type) => ({
                musician: { M1: 'Alice' },
                instrument: { I1: 'Violin' },
                project: { P1: 'Project One' },
            }[type]?.[id] || ''),
        },
        actions: {
            openInputModal: (...args) => inputs.push(args),
            openAlertModal: (...args) => alerts.push(args),
            loadXlsx: async () => {
                loadCount += 1;
                return { default: fakeXlsx };
            },
        },
    });

    feature.openExportModal();
    assert.equal(loadCount, 0, 'opening Excel export filters must not load xlsx-js-style');
    assert.equal(feature.showExportModal.value, true, 'opening Excel export should show the export modal');
    await feature.confirmExport();
    assert.equal(loadCount, 0, 'confirming export filters must wait for the filename before loading xlsx-js-style');
    assert.equal(inputs.at(-1)[0], '导出表格 (Excel)', 'Excel export should prompt for the original export filename');
    await inputs.at(-1)[3]('schedule-file');
    assert.equal(loadCount, 1, 'Excel export should load xlsx-js-style exactly when writing the workbook');
    assert.equal(workbook.fileName, 'schedule-file.xlsx', 'Excel export should append .xlsx after lazy loading the workbook library');
    assert.deepEqual(workbook.sheets.map((sheet) => sheet.name), ['按时间排序', '按项目排序', '按乐器排序', '按演奏员排序'], 'Excel export should preserve the four workbook sheets');
    assert.deepEqual(alerts, [], 'successful lazy Excel export should not show an error alert');
}

{
    const refs = {
        showCropModal: { value: false },
        cropImgSrc: { value: '' },
        cropImgRef: {
            value: {
                complete: true,
                naturalWidth: 300,
                addEventListener() {},
            },
        },
        authLoading: { value: false },
        user: { value: { id: 'USER1' } },
    };
    const alerts = [];
    const uploaded = [];
    const updates = [];
    let destroyedCount = 0;
    let loadCropperCount = 0;
    const cropperInstances = [];

    class FakeCropper {
        constructor(img, options) {
            this.img = img;
            this.options = options;
            this.canvas = null;
            cropperInstances.push(this);
        }

        destroy() {
            destroyedCount += 1;
        }

        getCroppedCanvas(options) {
            this.lastCanvasOptions = options;
            return this.canvas;
        }
    }

    const feature = registerAvatarCropFeature({
        refs,
        services: {
            supabaseService: {
                uploadAvatar: async (path, blob, options) => {
                    uploaded.push({ path, blob, options });
                    return { error: null };
                },
                getAvatarPublicUrl: (path) => ({ data: { publicUrl: `https://cdn.example/${path}` } }),
                updateUser: async (payload) => {
                    updates.push(payload);
                    return { error: null };
                },
                getUser: async () => ({ data: { user: { id: 'USER1', refreshed: true } } }),
            },
        },
        actions: {
            openAlertModal: (...args) => alerts.push(args),
            loadCropper: async () => {
                loadCropperCount += 1;
                return { default: FakeCropper };
            },
            readAsDataURL: (file, onLoad) => onLoad({ target: { result: file.result } }),
            nextTick: (callback) => Promise.resolve().then(callback),
            getNow: () => 123456,
            logError: () => {},
        },
    });

    assert.equal(loadCropperCount, 0, 'registering avatar crop must not load cropperjs');
    feature.onFileSelect({ target: { files: [{ size: 21 * 1024 * 1024 }], value: 'big' } });
    assert.equal(alerts.at(-1)[0], '图片太大了，请选择 20MB 以下的图片', 'avatar file select should reject files over the original 20MB cap');
    assert.equal(loadCropperCount, 0, 'rejecting an oversize avatar image must not load cropperjs');

    const fileEvent = { target: { files: [{ size: 1024, result: 'data:image/webp;base64,abc' }], value: 'chosen' } };
    feature.onFileSelect(fileEvent);
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(refs.cropImgSrc.value, 'data:image/webp;base64,abc', 'avatar file select should load the preview source');
    assert.equal(refs.showCropModal.value, true, 'avatar file select should show the crop modal');
    assert.equal(fileEvent.target.value, '', 'avatar file select should clear the file input after reading');
    assert.equal(loadCropperCount, 1, 'avatar file select should lazily load cropperjs before initializing Cropper');
    assert.equal(cropperInstances.length, 1, 'avatar file select should initialize Cropper when the image is already loaded');
    assert.equal(cropperInstances[0].options.aspectRatio, 1, 'avatar Cropper should keep the original square aspect ratio');

    const secondEvent = { target: { files: [{ size: 1024, result: 'data:image/webp;base64,def' }], value: 'chosen2' } };
    feature.onFileSelect(secondEvent);
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(destroyedCount, 1, 'avatar file select should destroy any previous Cropper instance before reinitializing');
    assert.equal(loadCropperCount, 2, 'selecting a second avatar image should lazily load through the injected Cropper loader again');

    feature.confirmCrop();
    assert.equal(alerts.at(-1)[0], '裁剪失败：未能获取到图片内容。\n请检查是否已引入 cropper.min.css 样式文件。', 'avatar crop confirm should preserve the null-canvas failure alert');

    cropperInstances.at(-1).canvas = {
        toBlob(callback, type, quality) {
            this.type = type;
            this.quality = quality;
            callback({ blob: true });
        },
    };
    feature.confirmCrop();
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 0));

    assert.deepEqual(uploaded[0], {
        path: 'USER1-123456.webp',
        blob: { blob: true },
        options: { contentType: 'image/webp', upsert: true },
    }, 'avatar crop confirm should upload the generated webp blob with the original path and options');
    assert.deepEqual(updates[0], {
        data: { avatar_url: 'https://cdn.example/USER1-123456.webp' },
    }, 'avatar crop confirm should update user metadata with the public avatar URL');
    assert.deepEqual(refs.user.value, { id: 'USER1', refreshed: true }, 'avatar crop confirm should refresh the user after upload');
    assert.equal(refs.showCropModal.value, false, 'successful avatar upload should close the crop modal');
    assert.equal(refs.authLoading.value, false, 'avatar upload should clear auth loading after completion');
    assert.equal(alerts.at(-1)[0], '头像更新成功！', 'successful avatar upload should show the original success alert');
}

{
    const poolItem = {
        id: 'TEMPLATE1',
        musicianId: 'M1',
        projectId: 'P1',
        records: {
            musician: { actualDuration: '00:10', recStart: '09:00', recEnd: '09:10', breakMinutes: 5 },
            project: { actualDuration: '00:20', recStart: '10:00', recEnd: '10:20', breakMinutes: 3 },
            instrument: { actualDuration: '00:30', recStart: '11:00', recEnd: '11:30', breakMinutes: 2 },
        },
    };
    const refs = {
        itemPool: { value: [poolItem] },
        scheduledTasks: { value: [{ scheduleId: 1, templateId: 'TEMPLATE1' }, { scheduleId: 2 }] },
        currentSessionId: { value: 'S_DEFAULT' },
        trackListData: { value: { taskRef: { scheduleId: 1, templateId: 'TEMPLATE1', musicianId: 'M1' } } },
        showTrackList: { value: true },
        sidebarTab: { value: 'musician' },
    };
    const state = {
        musicianStats: { value: [{ id: 'M1', statusKey: 'completed' }] },
        projectStats: { value: [{ id: 'P1', statusKey: 'in-progress' }] },
        instrumentStats: { value: [] },
    };
    const haptics = [];
    const alerts = [];
    const efficiencyCalls = [];
    let historyCount = 0;

    const feature = registerScheduleDeletionFeature({
        refs,
        state,
        actions: {
            openAlertModal: (...args) => alerts.push(args),
            pushHistory: () => { historyCount += 1; },
            triggerTouchHaptic: (type) => haptics.push(type),
            autoUpdateEfficiency: (...args) => efficiencyCalls.push(args),
        },
    });

    feature.deleteCurrentSchedule();

    assert.equal(alerts.at(-1)[0], '无法删除', 'deleting a completed resource schedule should show the original protection alert');
    assert.deepEqual(refs.scheduledTasks.value.map((task) => task.scheduleId), [1, 2], 'protected schedule deletion should not remove tasks');

    refs.sidebarTab.value = 'project';
    feature.deleteCurrentSchedule();
    assert.deepEqual(refs.scheduledTasks.value.map((task) => task.scheduleId), [2], 'single-template schedule deletion should remove the schedule block');
    assert.deepEqual(poolItem.records, {
        musician: { actualDuration: '', recStart: '', recEnd: '', breakMinutes: 0 },
        project: { actualDuration: '', recStart: '', recEnd: '', breakMinutes: 0 },
        instrument: { actualDuration: '', recStart: '', recEnd: '', breakMinutes: 0 },
    }, 'single-template schedule deletion should clear pool records in every view');
    assert.deepEqual(efficiencyCalls.slice(0, 2), [
        ['M1', 'musician', false],
        ['P1', 'project', false],
    ], 'single-template schedule deletion should refresh musician and project efficiency');
    assert.equal(refs.showTrackList.value, false, 'schedule deletion should close TrackList');
    assert.equal(historyCount, 1, 'schedule deletion should push history once');


    const aggregateItems = [
        {
            id: 'A',
            sectionIndex: 0,
            musicianId: 'M1',
            records: {
                musician: { actualDuration: '00:05', recStart: '09:00', recEnd: '09:05', breakMinutes: 1 },
            },
        },
        {
            id: 'B',
            sectionIndex: 1,
            musicianId: 'M2',
            records: {
                musician: { actualDuration: '00:06', recStart: '09:10', recEnd: '09:16', breakMinutes: 2 },
            },
        },
    ];
    refs.scheduledTasks.value = [{ scheduleId: 3 }, { scheduleId: 4 }];
    refs.trackListData.value = {
        taskRef: { scheduleId: 3 },
        currentSectionIndex: 1,
        viewType: 'musician',
        items: aggregateItems,
    };
    refs.showTrackList.value = true;
    refs.sidebarTab.value = 'instrument';
    state.instrumentStats.value = [{ id: 'I1', statusKey: 'in-progress' }];

    feature.deleteCurrentSchedule();
    assert.deepEqual(refs.scheduledTasks.value.map((task) => task.scheduleId), [4], 'aggregate schedule deletion should remove only the selected schedule block');
    assert.deepEqual(aggregateItems[0].records.musician, { actualDuration: '00:05', recStart: '09:00', recEnd: '09:05', breakMinutes: 1 }, 'aggregate deletion should not clear other sections');
    assert.deepEqual(aggregateItems[1].records.musician, { actualDuration: '', recStart: '', recEnd: '', breakMinutes: 0 }, 'aggregate deletion should clear records only in the current section');
    assert.deepEqual(efficiencyCalls.at(-1), ['M2', 'musician', false], 'aggregate deletion should refresh efficiency for the cleared section owner');

    const aggregateCleanupItems = [
        {
            id: 'SECTION0',
            musicianId: 'M10',
            sectionIndex: 0,
            records: { musician: { actualDuration: '00:11', recStart: '09:00', recEnd: '09:11', breakMinutes: 1 } },
        },
        {
            id: 'SECTION1',
            musicianId: 'M10',
            sectionIndex: 1,
            records: { musician: { actualDuration: '00:12', recStart: '09:20', recEnd: '09:32', breakMinutes: 2 } },
        },
        {
            id: 'SECTION2',
            musicianId: 'M10',
            sectionIndex: 2,
            records: { musician: { actualDuration: '00:13', recStart: '09:40', recEnd: '09:53', breakMinutes: 3 } },
        },
        {
            id: 'OTHER_RESOURCE',
            musicianId: 'M20',
            sectionIndex: 1,
            records: { musician: { actualDuration: '00:14', recStart: '10:00', recEnd: '10:14', breakMinutes: 4 } },
        },
    ];
    refs.itemPool.value = aggregateCleanupItems;
    refs.scheduledTasks.value = [
        { scheduleId: 'FIRST', musicianId: 'M10', date: '2026-05-29', startTime: '09:00' },
        { scheduleId: 'TARGET', musicianId: 'M10', date: '2026-05-29', startTime: '10:00' },
        { scheduleId: 'THIRD', musicianId: 'M10', date: '2026-05-29', startTime: '11:00' },
        { scheduleId: 'OTHER_SESSION', musicianId: 'M10', date: '2026-05-29', startTime: '08:00', sessionId: 'S2' },
    ];

    feature.clearAggregateRecords({ scheduleId: 'TARGET', musicianId: 'M10' });
    assert.deepEqual(
        aggregateCleanupItems[0].records.musician,
        { actualDuration: '00:11', recStart: '09:00', recEnd: '09:11', breakMinutes: 1 },
        'aggregate cleanup should leave earlier sections intact',
    );
    assert.deepEqual(
        aggregateCleanupItems[1].records.musician,
        { actualDuration: '', recStart: '', recEnd: '', breakMinutes: 0 },
        'aggregate cleanup should clear records for the matching section',
    );
    assert.equal(aggregateCleanupItems[2].sectionIndex, 1, 'aggregate cleanup should shift later matching sections down');
    assert.equal(aggregateCleanupItems[3].sectionIndex, 1, 'aggregate cleanup should not shift other resources');
    assert.deepEqual(efficiencyCalls.at(-1), ['M10', 'musician', false], 'aggregate cleanup should refresh matching resource efficiency when records were cleared');
}

{
    const refs = {
        currentSessionId: vueRef('S1'),
        activeDropdown: vueRef('session-menu'),
    };
    const state = {
        settings: vueReactive({
            sessions: [
                { id: 'S1', name: 'Main Session' },
                { id: 'S2', name: 'Alt Session' },
            ],
        }),
    };
    const inputs = [];
    const confirms = [];
    const alerts = [];
    const haptics = [];
    let historyCount = 0;
    let idCounter = 0;

    const feature = registerSessionFeature({
        refs,
        state,
        utils: {
            generateUniqueId: (prefix) => `${prefix}_NEW_${++idCounter}`,
        },
        actions: {
            openInputModal: (...args) => inputs.push(args),
            openConfirmModal: (...args) => confirms.push(args),
            openAlertModal: (...args) => alerts.push(args),
            pushHistory: () => { historyCount += 1; },
            triggerTouchHaptic: (type) => haptics.push(type),
        },
    });

    assert.equal(feature.currentSessionName.value, 'Main Session', 'session feature should expose the current session name');
    feature.switchSession('S2');
    assert.equal(refs.currentSessionId.value, 'S2', 'switchSession should update current session id');
    assert.equal(refs.activeDropdown.value, null, 'switchSession should close the active dropdown');
    assert.equal(feature.currentSessionName.value, 'Alt Session', 'current session name should react to switched session id');

    refs.activeDropdown.value = 'session-menu';
    feature.handleSessionAction('new');
    assert.equal(inputs.at(-1)[0], '新建日程', 'new session action should open the original input modal title');
    inputs.at(-1)[3]('Spring Recording');
    assert.deepEqual(state.settings.sessions.at(-1), { id: 'S_NEW_1', name: 'Spring Recording' }, 'new session action should append a generated session');
    assert.equal(refs.currentSessionId.value, 'S_NEW_1', 'new session action should switch to the created session');
    assert.equal(historyCount, 1, 'new session action should push history after creating');
    assert.equal(refs.activeDropdown.value, null, 'session actions should close the dropdown');

    feature.handleSessionAction('rename');
    assert.equal(inputs.at(-1)[0], '重命名日程', 'rename action should open the original input modal title');
    assert.equal(inputs.at(-1)[1], 'Spring Recording', 'rename action should prefill the current session name');
    inputs.at(-1)[3]('Renamed Session');
    assert.equal(state.settings.sessions.at(-1).name, 'Renamed Session', 'rename action should update current session name');
    assert.equal(historyCount, 2, 'rename action should push history after renaming');

    feature.handleSessionAction('delete');
    assert.equal(confirms.at(-1)[0], '删除日程', 'delete action should open the original confirm modal title');
    assert.equal(confirms.at(-1)[3], true, 'delete action should mark the confirmation destructive');
    confirms.at(-1)[2]();
    assert.equal(state.settings.sessions.some((session) => session.id === 'S_NEW_1'), false, 'delete action should remove the current session after confirmation');
    assert.equal(refs.currentSessionId.value, 'S1', 'delete action should switch back to the first remaining session');
    assert.equal(historyCount, 3, 'delete action should push history after deletion');


    state.settings.sessions = [{ id: 'ONLY', name: 'Only Session' }];
    refs.currentSessionId.value = 'ONLY';
    feature.handleSessionAction('delete');
    assert.equal(alerts.at(-1)[0], '无法删除', 'delete action should alert when only one session remains');
}

{
    const refs = {
        user: vueRef({ id: 'USER_1' }),
        showAuthModal: vueRef(false),
        authLoading: vueRef(false),
        authForm: vueReactive({ email: '', password: '' }),
        activeDropdown: vueRef(null),
        showProfileMenu: vueRef(false),
        showMobileMenu: vueRef(false),
        tempAvatarUrl: vueRef(''),
        tempNickname: vueRef(''),
        localDataVersion: vueRef(3),
        saveStatus: vueRef('saved'),
        isSyncing: vueRef(false),
        itemPool: vueRef([{ id: 'POOL_1' }]),
        scheduledTasks: vueRef([{ id: 'TASK_1' }]),
        currentSessionId: vueRef('S1'),
    };
    const state = {
        settings: vueReactive({
            sessions: [{ id: 'S1', name: 'Main Session' }],
            instruments: [],
            musicians: [],
            projects: [],
        }),
    };
    const statusChanges = [];
    const fetchCalls = [];
    const saveCalls = [];

    const feature = registerAuthFeature({
        refs,
        state,
        utils: {
            formatDate: () => '2026-05-29',
            ensureItemRecords: (item) => item,
            calculateEstTime: () => '00:00',
            generateUniqueId: (prefix) => `${prefix}_NEW`,
        },
        services: {
            storageService: {
                loadData: () => null,
                setItem: () => {},
                clearAll: () => {},
            },
            supabaseService: {
                fetchUserDataVersion: async (userId) => {
                    fetchCalls.push(userId);
                    return { data: { version: 3 }, error: null };
                },
                saveUserData: async (userId, data, version) => {
                    saveCalls.push({ userId, data, version });
                    return { error: null };
                },
            },
        },
        actions: {
            pushHistory: () => {},
            openAlertModal: () => {},
            openConfirmModal: () => {},
            triggerTouchHaptic: () => {},
            reloadPage: () => {},
            setSaveStatus: (value) => {
                refs.saveStatus.value = value;
                statusChanges.push(value);
            },
        },
    });

    await feature.handlePageUnload();
    assert.deepEqual(fetchCalls, [], 'page unload should skip cloud save when there are no unsaved changes');

    refs.saveStatus.value = 'unsaved';
    await feature.handlePageUnload();
    assert.deepEqual(fetchCalls, ['USER_1'], 'page unload should force a final cloud save for unsaved changes');
    assert.equal(saveCalls.length, 1, 'page unload should persist one cloud payload');
    assert.equal(saveCalls[0].version, 4, 'page unload should increment from the server version during forced save');
    assert.deepEqual(saveCalls[0].data.pool, refs.itemPool.value, 'page unload should save the current pool');
    assert.deepEqual(saveCalls[0].data.tasks, refs.scheduledTasks.value, 'page unload should save the current scheduled tasks');
    assert.equal(saveCalls[0].data.settings.lastSessionId, 'S1', 'page unload should preserve the current session id in settings');
    assert.equal(statusChanges[0], 'saving', 'page unload should mark the cloud save as saving');
}

{
    const refs = {
        user: vueRef(null),
        showAuthModal: vueRef(false),
        authLoading: vueRef(false),
        authForm: vueReactive({ email: '', password: '' }),
        activeDropdown: vueRef(null),
        showProfileMenu: vueRef(false),
        showMobileMenu: vueRef(false),
        tempAvatarUrl: vueRef(''),
        tempNickname: vueRef(''),
        localDataVersion: vueRef(0),
        saveStatus: vueRef('saved'),
        isSyncing: vueRef(false),
        itemPool: vueRef([]),
        scheduledTasks: vueRef([]),
        currentSessionId: vueRef('STALE_LOCAL'),
    };
    const state = {
        settings: vueReactive({
            sessions: [{ id: 'S_DEFAULT', name: '默认录音日程' }],
            instruments: [],
            musicians: [],
            projects: [],
        }),
    };
    let historyCount = 0;
    const feature = registerAuthFeature({
        refs,
        state,
        utils: {
            formatDate: () => '2026-05-29',
            ensureItemRecords: (item) => ({ ...item, ensured: true }),
            calculateEstTime: () => '00:00',
            generateUniqueId: (prefix) => `${prefix}_NEW`,
        },
        services: {
            storageService: {
                loadData: () => null,
                setItem: () => {},
                clearAll: () => {},
            },
            supabaseService: {
                getSession: async () => ({ data: { session: { user: { id: 'USER_EMPTY_SESSIONS', email: 'u@example.com' } } } }),
                loadUserData: async () => ({
                    data: {
                        version: 7,
                        content: {
                            pool: [],
                            tasks: [],
                            settings: {
                                sessions: [],
                                lastSessionId: 'MISSING_SESSION',
                                instruments: [],
                                musicians: [],
                                projects: [],
                            },
                        },
                    },
                    error: null,
                }),
            },
        },
        actions: {
            pushHistory: () => { historyCount += 1; },
            openAlertModal: () => {},
            openConfirmModal: () => {},
            triggerTouchHaptic: () => {},
            reloadPage: () => {},
            setSaveStatus: (value) => { refs.saveStatus.value = value; },
        },
    });

    await feature.bootSessionData();

    assert.equal(refs.localDataVersion.value, 7, 'cloud restore should preserve the loaded server version');
    assert.equal(refs.currentSessionId.value, 'S_DEFAULT', 'cloud restore should fall back to a valid default session when saved sessions are empty');
    assert.deepEqual(state.settings.sessions, [{ id: 'S_DEFAULT', name: '默认录音日程' }], 'cloud restore should recreate a default session when saved sessions are empty');
    assert.equal(refs.itemPool.value.length, 1, 'empty restored cloud data should initialize demo data instead of leaving the app blank');
    assert.equal(refs.scheduledTasks.value.length, 1, 'empty restored cloud data should initialize a demo schedule');
    assert.equal(historyCount, 1, 'cloud boot restore should push one history entry by default');
}

{
    const xContainer = { scrollLeft: 10 };
    const yContainer = { scrollTop: 20 };
    const frameCallbacks = [];
    const cancelledFrames = [];
    let nextFrameId = 100;
    const feature = registerMobileAutoScrollFeature({
        actions: {
            requestAnimationFrameFn: (callback) => {
                frameCallbacks.push(callback);
                return nextFrameId++;
            },
            cancelAnimationFrameFn: (id) => cancelledFrames.push(id),
        },
    });

    feature.startAutoScroll(0.5, -0.25, xContainer, yContainer);
    assert.equal(frameCallbacks.length, 1, 'mobile auto-scroll should schedule one animation frame on start');
    frameCallbacks.shift()(0);
    assert.equal(xContainer.scrollLeft, 22.5, 'mobile auto-scroll should move horizontally by velocity times max speed on the first frame');
    assert.equal(yContainer.scrollTop, 13.75, 'mobile auto-scroll should move vertically by velocity times max speed on the first frame');
    assert.equal(frameCallbacks.length, 1, 'mobile auto-scroll should queue the next animation frame after each step');

    feature.updateAutoScrollDirection(-1, 1);
    frameCallbacks.shift()(16.7);
    assert.equal(xContainer.scrollLeft, -2.5, 'mobile auto-scroll should apply updated horizontal velocity normalized to the frame interval');
    assert.equal(yContainer.scrollTop, 38.75, 'mobile auto-scroll should apply updated vertical velocity normalized to the frame interval');

    feature.startAutoScroll(1, 1, xContainer, yContainer);
    assert.equal(frameCallbacks.length, 1, 'mobile auto-scroll should ignore duplicate starts while a frame loop is active');
    feature.stopAutoScroll();
    assert.deepEqual(cancelledFrames, [102], 'mobile auto-scroll should cancel the pending animation frame on stop');
    feature.stopAutoScroll();
    assert.deepEqual(cancelledFrames, [102], 'mobile auto-scroll stop should be idempotent');
}

{
    const haptics = [];
    const appended = [];
    const state = {
        dragElClone: null,
        dragSourceEl: null,
        cloneOffsetX: 12,
        cloneOffsetY: 18,
    };
    const clone = { style: {} };
    const originalEl = {
        offsetWidth: 140,
        offsetHeight: 64,
        style: { opacity: '' },
        cloneNode: (deep) => {
            assert.equal(deep, true, 'mobile drag ghost should deep-clone the original element');
            return clone;
        },
    };
    const feature = registerMobileDragGhostFeature({
        state,
        actions: {
            triggerTouchHaptic: (type) => haptics.push(type),
            getDocumentBody: () => ({
                appendChild: (element) => appended.push(element),
            }),
        },
    });

    feature.startMobileDrag(originalEl, { clientX: 100, clientY: 150 });

    assert.equal(state.dragSourceEl, originalEl, 'mobile drag ghost should remember the original source element');
    assert.equal(originalEl.style.opacity, '0.3', 'mobile drag ghost should dim the original source element');
    assert.equal(state.dragElClone, clone, 'mobile drag ghost should store the floating clone');

    assert.deepEqual(appended, [clone], 'mobile drag ghost should append the clone to the document body');
    assert.deepEqual(clone.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '140px',
        height: '64px',
        zIndex: '9999',
        opacity: '0.9',
        pointerEvents: 'none',
        transform: 'translate3d(88px, 132px, 0)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
        transition: 'none',
    }, 'mobile drag ghost should preserve the floating clone style contract');
}

{
    const state = {
        dragElClone: null,
        dragSourceTask: null,
        dragStartDate: null,
        longPressTimeout: null,
        startX: 0,
        startY: 0,
        cloneOffsetX: 0,
        cloneOffsetY: 0,
        dragClickOffsetY: 0,
        dragSourceType: 'schedule',
    };
    const refs = {
        isMobile: vueRef(true),
        mobileTab: vueRef('pool'),
    };
    const targetEl = {
        getBoundingClientRect: () => ({ left: 20, top: 40 }),
    };
    const task = { scheduleId: 'TOUCH_TASK' };
    const timeouts = [];
    const started = [];
    const haptics = [];
    const feature = registerMobileTouchStartFeature({
        refs,
        state,
        actions: {
            setTimeout: (callback, delay) => {
                const timeout = { callback, delay };
                timeouts.push(timeout);
                return timeout;
            },
            isTaskGhost: () => false,
            startMobileDrag: (...args) => started.push(args),
            triggerTouchHaptic: (type) => haptics.push(type),
        },
    });

    feature.handleTouchStart({
        touches: [{ clientX: 70, clientY: 130 }],
        currentTarget: targetEl,
    }, task, '2026-05-29');

    assert.equal(state.dragSourceType, 'schedule', 'schedule touch-start should mark schedule as the drag source type');
    assert.equal(state.dragSourceTask, task, 'schedule touch-start should remember the source task');
    assert.equal(state.dragStartDate, '2026-05-29', 'schedule touch-start should remember the source date');
    assert.equal(state.startX, 70, 'schedule touch-start should store initial touch x');
    assert.equal(state.startY, 130, 'schedule touch-start should store initial touch y');
    assert.equal(state.cloneOffsetX, 50, 'schedule touch-start should calculate clone x offset');
    assert.equal(state.cloneOffsetY, 90, 'schedule touch-start should calculate clone y offset');
    assert.equal(state.dragClickOffsetY, 90, 'schedule touch-start should preserve drag click y offset');
    assert.equal(timeouts[0].delay, 300, 'schedule touch-start should preserve the original long-press delay');
    timeouts[0].callback();
    assert.deepEqual(started, [[targetEl, { clientX: 70, clientY: 130 }]], 'schedule long-press should start dragging non-ghost tasks');

    const blockedFeature = registerMobileTouchStartFeature({
        refs,
        state,
        actions: {
            setTimeout: (callback, delay) => ({ callback, delay }),
            isTaskGhost: () => true,
            startMobileDrag: () => { throw new Error('ghost tasks should not start mobile drag'); },
            triggerTouchHaptic: (type) => haptics.push(type),
        },
    });
    const ghostTimeout = blockedFeature.handleTouchStart({
        touches: [{ clientX: 10, clientY: 20 }],
        currentTarget: targetEl,
    }, task, '2026-05-30');
    ghostTimeout.callback();

    feature.handlePoolTouchStart({
        touches: [{ clientX: 80, clientY: 150 }],
        currentTarget: targetEl,
    }, { id: 'POOL_CARD' }, 'pool');
    assert.notEqual(state.dragSourceTask?.id, 'POOL_CARD', 'pool touch-start should ignore small pool cards');

    feature.handlePoolTouchStart({
        touches: [{ clientX: 90, clientY: 170 }],
        currentTarget: targetEl,
    }, { id: 'DONE_AGG', statusKey: 'completed' }, 'aggregate');
    assert.notEqual(state.dragSourceTask?.id, 'DONE_AGG', 'aggregate touch-start should ignore completed aggregate cards');

    feature.handlePoolTouchStart({
        touches: [{ clientX: 100, clientY: 190 }],
        currentTarget: targetEl,
    }, { id: 'READY_AGG', statusKey: 'partial' }, 'aggregate');
    assert.equal(state.dragSourceType, 'aggregate', 'aggregate touch-start should preserve the aggregate source type');
    assert.equal(state.dragSourceTask.id, 'READY_AGG', 'aggregate touch-start should remember the aggregate source card');
    assert.equal(timeouts.at(-1).delay, 300, 'aggregate touch-start should preserve the original long-press delay');
    timeouts.at(-1).callback();
    assert.equal(refs.mobileTab.value, 'schedule', 'aggregate long-press should switch mobile users to the schedule tab');

}

{
    const clearedTimeouts = [];
    const state = {
        dragElClone: null,
        longPressTimeout: 'pending-long-press',
        startX: 100,
        startY: 200,
        cloneOffsetX: 8,
        cloneOffsetY: 12,
        activeDropSlot: null,
        monthSwitchTimer: null,
    };
    const feature = registerMobileTouchMoveFeature({
        refs: {
            isMobile: vueRef(true),
            currentView: vueRef('week'),
            weekContainer: vueRef(null),
        },
        state,
        actions: {
            clearTimeout: (timer) => clearedTimeouts.push(timer),
        },
    });

    feature.handleTouchMove({ touches: [{ clientX: 118, clientY: 203 }] });

    assert.deepEqual(clearedTimeouts, ['pending-long-press'], 'touch move should cancel long-press when movement exceeds the scroll threshold');
    assert.equal(state.longPressTimeout, null, 'touch move should clear long-press state after cancellation');

    const clone = { style: {} };
    const removedClasses = [];
    const addedClasses = [];
    const previousSlot = {
        classList: {
            remove: (className) => removedClasses.push(className),
        },
    };
    const nextSlot = {
        classList: {
            add: (className) => addedClasses.push(className),
        },
    };
    const target = {
        closest: (selector) => {
            assert.equal(selector, '.grid-slot, .droppable-slot', 'touch move should search for valid schedule drop slots');
            return nextSlot;
        },
    };
    const autoScrollCalls = [];
    const autoScrollUpdates = [];
    const stoppedAutoScroll = [];
    const timeouts = [];
    const haptics = [];
    const changedDates = [];
    const dragFrames = [];
    let prevented = false;
    state.dragElClone = clone;
    state.longPressTimeout = null;
    state.activeDropSlot = previousSlot;
    const scrollContainer = { id: 'week-scroll' };
    const movingFeature = registerMobileTouchMoveFeature({
        refs: {
            isMobile: vueRef(true),
            currentView: vueRef('week'),
            weekContainer: vueRef(scrollContainer),
        },
        state,
        actions: {
            getWindowSize: () => ({ innerWidth: 400, innerHeight: 800 }),
            setTimeout: (callback, delay) => {
                const timer = { callback, delay };
                timeouts.push(timer);
                return timer;
            },
            clearTimeout: (timer) => clearedTimeouts.push(timer),
            requestAnimationFrameFn: (callback) => {
                dragFrames.push(callback);
                return dragFrames.length;
            },
            startAutoScroll: (...args) => autoScrollCalls.push(args),
            updateAutoScrollDirection: (...args) => autoScrollUpdates.push(args),
            stopAutoScroll: () => stoppedAutoScroll.push(true),
            isAutoScrollActive: () => false,
            changeDate: (dir) => changedDates.push(dir),
            triggerTouchHaptic: (type) => haptics.push(type),
            elementFromPoint: (x, y) => {
                assert.equal(x, 395, 'touch move should inspect the element under the touch x coordinate');
                assert.equal(y, 760, 'touch move should inspect the element under the touch y coordinate');
                return target;
            },
        },
    });

    movingFeature.handleTouchMove({
        touches: [{ clientX: 395, clientY: 760 }],
        cancelable: true,
        preventDefault: () => { prevented = true; },
    });

    assert.equal(prevented, true, 'touch move should prevent page scrolling while dragging');
    assert.equal(clone.style.transform, 'translate3d(387px, 748px, 0)', 'touch move should keep the floating clone under the finger synchronously');
    assert.equal(autoScrollCalls.length, 0, 'expensive drag work should be deferred to the next animation frame');
    assert.equal(dragFrames.length, 1, 'touch move should queue exactly one animation frame for hit-testing and edge detection');

    dragFrames.shift()();

    assert.equal(autoScrollCalls.length, 1, 'week touch move should start auto-scroll near the edge');
    assert.deepEqual(autoScrollCalls[0][2], scrollContainer, 'week touch move should use the week container for horizontal auto-scroll');
    assert.deepEqual(autoScrollCalls[0][3], scrollContainer, 'week touch move should use the week container for vertical auto-scroll');
    assert.deepEqual(autoScrollUpdates, [], 'week touch move should not update auto-scroll direction before auto-scroll is active');
    assert.equal(timeouts[0].delay, 800, 'week edge paging should preserve the dwell delay');
    timeouts[0].callback();
    assert.deepEqual(changedDates, [1], 'week edge paging should advance the view after dwelling on the right edge');

    assert.deepEqual(removedClasses, ['drag-over'], 'touch move should clear the previous drop-slot highlight');
    assert.deepEqual(addedClasses, ['drag-over'], 'touch move should highlight the drop slot under the finger');
    assert.equal(state.activeDropSlot, nextSlot, 'touch move should remember the active drop slot');
}

{
    const selected = [];
    const dblClicks = [];
    const prevented = [];
    const clearedTimeouts = [];
    let now = 1000;
    const task = { scheduleId: 'TAP_TASK' };
    const state = {
        dragElClone: null,
        dragSourceTask: task,
        dragSourceEl: null,
        longPressTimeout: 'first-tap-timeout',
        monthSwitchTimer: null,
        activeDropSlot: null,
        dragSourceType: 'schedule',
        dragClickOffsetY: 0,
    };
    const refs = {
        scheduledTasks: vueRef([]),
        pxPerMin: vueRef(2),
        sidebarTab: vueRef('musician'),
        currentSessionId: vueRef('SESSION_TOUCH'),
        lastTapState: vueReactive({ id: null, time: 0 }),
    };
    const feature = registerMobileTouchEndFeature({
        refs,
        state,
        data: {
            settings: { startHour: 9, endHour: 18 },
        },
        utils: {
            formatSecs: (seconds) => `${seconds}s`,
        },
        actions: {
            clearTimeout: (timer) => clearedTimeouts.push(timer),
            dateNow: () => now,
            selectTask: (...args) => selected.push(args),
            handleTaskDblClick: (...args) => dblClicks.push(args),
        },
    });

    feature.handleTouchEnd({ cancelable: true, preventDefault: () => prevented.push('first') });

    assert.deepEqual(clearedTimeouts, ['first-tap-timeout'], 'touch end should clear a pending long-press timer');
    assert.deepEqual(selected, [['TAP_TASK', 'schedule']], 'first mobile tap should select the schedule task');
    assert.equal(refs.lastTapState.id, 'TAP_TASK', 'first mobile tap should remember the tapped task id');
    assert.equal(refs.lastTapState.time, 1000, 'first mobile tap should remember the tap time');
    assert.deepEqual(prevented, [], 'first mobile tap should not prevent native events');

    state.longPressTimeout = 'second-tap-timeout';
    now = 1200;
    feature.handleTouchEnd({ cancelable: true, preventDefault: () => prevented.push('second') });

    assert.deepEqual(clearedTimeouts, ['first-tap-timeout', 'second-tap-timeout'], 'second touch end should also clear its pending long-press timer');
    assert.deepEqual(prevented, ['second'], 'double-tap should prevent native follow-up click/dblclick events');
    assert.equal(dblClicks.length, 1, 'double-tap on a non-ghost task should open the normal task activation flow');
    assert.equal(dblClicks[0][1], task, 'double-tap should pass the source task to the activation flow');
    assert.equal(refs.lastTapState.id, null, 'double-tap should reset tap tracking after activation');
    assert.equal(refs.lastTapState.time, 0, 'double-tap should reset tap timing after activation');
}

{
    const clone = {};
    const bodyRemoved = [];
    const sourceEl = { style: { opacity: '0.3' } };
    const removedClasses = [];
    const activeSlot = {
        classList: {
            remove: (className) => removedClasses.push(className),
        },
    };
    const task = {
        scheduleId: 'DRAG_TASK',
        date: '2026-06-01',
        startTime: '09:00',
        estDuration: '1800s',
        projectId: 'P1',
    };
    const state = {
        dragElClone: clone,
        dragSourceTask: task,
        dragSourceEl: sourceEl,
        longPressTimeout: null,
        monthSwitchTimer: 'edge-page-timer',
        activeDropSlot: activeSlot,
        dragSourceType: 'schedule',
        dragClickOffsetY: 20,
    };
    const refs = {
        scheduledTasks: vueRef([task]),
        pxPerMin: vueRef(2),
        sidebarTab: vueRef('musician'),
        currentSessionId: vueRef('SESSION_TOUCH'),
        lastTapState: vueReactive({ id: null, time: 0 }),
    };
    const clearedTimeouts = [];
    const haptics = [];
    const overlapChecks = [];
    const history = [];
    const stoppedScroll = [];
    const container = { getBoundingClientRect: () => ({ top: 100 }) };
    const dropColumn = {
        dataset: { dateStr: '2026-06-02' },
        querySelector: (selector) => {
            assert.equal(selector, '.relative[style*="min-height"]', 'week touch drop should use the time-grid container');
            return container;
        },
    };
    const target = {
        closest: (selector) => {
            if (selector === '[data-date-str]') return dropColumn;
            if (selector === '[data-date]') return null;
            return null;
        },
    };
    const feature = registerMobileTouchEndFeature({
        refs,
        state,
        data: {
            settings: { startHour: 9, endHour: 18 },
        },
        utils: {
            formatSecs: (seconds) => `${seconds}s`,
        },
        actions: {
            clearTimeout: (timer) => clearedTimeouts.push(timer),
            getDocumentBody: () => ({ removeChild: (element) => bodyRemoved.push(element) }),
            elementFromPoint: (x, y) => {
                assert.equal(x, 120, 'touch end should inspect the final touch x coordinate');
                assert.equal(y, 180, 'touch end should inspect the final touch y coordinate');
                return target;
            },
            stopAutoScroll: () => stoppedScroll.push(true),
            checkOverlap: (...args) => {
                overlapChecks.push(args);
                return false;
            },
            triggerTouchHaptic: (type) => haptics.push(type),
            pushHistory: () => history.push('push'),
        },
    });

    feature.handleTouchEnd({ changedTouches: [{ clientX: 120, clientY: 180 }] });

    assert.deepEqual(stoppedScroll, [true], 'touch end should stop mobile auto-scroll');
    assert.deepEqual(clearedTimeouts, ['edge-page-timer'], 'touch end should clear a pending edge-page timer');
    assert.deepEqual(bodyRemoved, [clone], 'touch end should remove the floating drag clone from the document body');
    assert.equal(state.dragElClone, null, 'touch end should clear the drag clone state');
    assert.deepEqual(removedClasses, ['drag-over'], 'touch end should clear the active drop-slot highlight');
    assert.deepEqual(overlapChecks, [['2026-06-02', '09:30', '1800s', 'DRAG_TASK', 'project']], 'week touch drop should preserve snapped time conflict checks for moved schedule tasks');
    assert.equal(task.date, '2026-06-02', 'week touch drop should update the dragged schedule task date');
    assert.equal(task.startTime, '09:30', 'week touch drop should update the dragged schedule task time');

    assert.deepEqual(history, ['push'], 'successful week touch drop should push one history entry');
    assert.equal(sourceEl.style.opacity, '', 'touch end should restore source opacity after cleanup');
    assert.equal(state.dragSourceEl, null, 'touch end should clear source element state after cleanup');
    assert.equal(state.activeDropSlot, null, 'touch end should clear active drop-slot state after cleanup');
}

{
    const taskEl = {
        style: { opacity: '0.4', transition: 'all 200ms' },
        getBoundingClientRect: () => ({ height: 60 }),
    };
    const body = {
        style: { display: '' },
        offsetHeight: 10,
    };
    const task = {
        scheduleId: 'TASK_RESIZE',
        date: '2026-05-29',
        startTime: '09:00',
        estDuration: '1800s',
        musicDuration: '1800s',
        musicianId: 'M1',
    };
    const refs = {
        isMobile: vueRef(true),
        isResizingMobile: vueRef(false),
        mobileResizeState: vueReactive({
            task: null,
            taskEl: null,
            startY: 0,
            startHeight: 0,
            originalDuration: '',
        }),
        pxPerMin: vueRef(2),
    };
    const addedListeners = [];
    const removedListeners = [];
    const haptics = [];
    let stopped = false;
    let prevented = false;
    let historyCount = 0;
    const feature = registerMobileResizeFeature({
        refs,
        utils: {
            timeToMinutes: (time) => {
                assert.equal(time, '09:00', 'mobile resize should parse task start time while snapping');
                return 540;
            },
            formatSecs: (seconds) => `${seconds}s`,
            parseTime: (value) => Number(String(value).replace('s', '')),
        },
        actions: {
            triggerTouchHaptic: (type) => haptics.push(type),
            addWindowListener: (...args) => addedListeners.push(args),
            removeWindowListener: (...args) => removedListeners.push(args),
            requestAnimationFrameFn: (callback) => {
                callback();
                return 1;
            },
            cancelAnimationFrameFn: () => {},
            setTimeoutFn: (callback, delay) => {
                assert.equal(delay, 0, 'mobile resize should defer save/conflict work with the original zero-delay timeout');
                callback();
                return delay;
            },
            getDocumentBody: () => body,
            checkOverlap: () => false,
            openAlertModal: () => {},
            pushHistory: () => { historyCount += 1; },
        },
    });

    feature.initMobileResize({
        stopPropagation: () => { stopped = true; },
        touches: [{ clientY: 100 }],
        target: { closest: (selector) => selector === '.task-block' ? taskEl : null },
    }, task);

    assert.equal(stopped, true, 'mobile resize init should stop event propagation');
    assert.equal(refs.isResizingMobile.value, true, 'mobile resize init should mark resizing active');
    assert.equal(refs.mobileResizeState.task.scheduleId, task.scheduleId, 'mobile resize init should store the active task');
    assert.equal(refs.mobileResizeState.startY, 100, 'mobile resize init should store the touch start y');
    assert.equal(refs.mobileResizeState.startHeight, 60, 'mobile resize init should store the task block height');
    assert.equal(refs.mobileResizeState.originalDuration, '1800s', 'mobile resize init should remember the original duration');

    assert.deepEqual(addedListeners.map(([type, , options]) => [type, options]), [
        ['touchmove', { passive: false }],
        ['touchend', true],
        ['touchcancel', true],
    ], 'mobile resize init should attach the original window listeners');

    feature.handleMobileResizeMove({
        cancelable: true,
        preventDefault: () => { prevented = true; },
        touches: [{ clientY: 130 }],
    });

    assert.equal(prevented, true, 'mobile resize move should prevent scrolling when cancelable');
    assert.equal(task.estDuration, '3600s', 'mobile resize move should snap the resized duration to the 30-minute grid');


    feature.handleMobileResizeEnd({});
    assert.equal(refs.isResizingMobile.value, false, 'mobile resize end should clear resizing state immediately');
    assert.deepEqual(removedListeners.map(([type, , options]) => [type, options]), [
        ['touchmove', undefined],
        ['touchend', true],
        ['touchcancel', true],
    ], 'mobile resize end should remove the original listeners');
    assert.equal(taskEl.style.opacity, '', 'mobile resize end should restore task element opacity');
    assert.equal(taskEl.style.transition, '', 'mobile resize end should restore task element transition');
    assert.equal(task.ratio, '2.0', 'mobile resize end should recalculate task ratio when there is no conflict');
    assert.equal(historyCount, 1, 'mobile resize end should push history once after a successful resize');

    assert.equal(refs.mobileResizeState.task, null, 'mobile resize end should clear the active task reference');
}

{
    const refs = {
        trackListData: vueRef({ viewType: 'project' }),
        showTrackList: vueRef(true),
        sidebarTab: vueRef('instrument'),
        itemPool: vueRef([]),
        scheduledTasks: vueRef([]),
        currentSessionId: vueRef('S1'),
        musicianStats: vueRef([]),
    };
    const state = {
        settings: {
            musicians: [{ id: 'M1', defaultRatio: 18 }],
            projects: [{ id: 'P1', defaultRatio: 12 }],
            instruments: [{ id: 'I1', defaultRatio: 9 }],
        },
    };
    const splitInitialized = [];
    const confirmCalls = [];
    const alerts = [];
    let historyPushes = 0;
    const haptics = [];
    const previousWindow = global.window;
    global.window = {
        triggerTouchHaptic: (kind) => haptics.push(kind),
    };
    const feature = registerRatioFeature({
        refs,
        state,
        utils: {
            parseTime: (value) => {
                const parts = String(value || '0:00').split(':').map(Number);
                if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
                return (parts[0] || 0) * 60 + (parts[1] || 0);
            },
            calculateEstTime: (duration, ratio) => {
                const [mins = '0', secs = '0'] = String(duration || '0:00').split(':');
                return `${(Number(mins) * 60 + Number(secs)) * ratio}s`;
            },
            formatSecs: (seconds) => `${seconds}s`,
        },
        actions: {
            ensureItemSplitViews: (item) => splitInitialized.push(item.id),
            pushHistory: () => { historyPushes += 1; },
            openConfirmModal: (...args) => confirmCalls.push(args),
            openAlertModal: (...args) => alerts.push(args),
        },
    });

    assert.equal(feature.getDefaultRatio('P1', 'project'), 12, 'ratio feature should read project default ratios');
    assert.equal(feature.getDefaultRatio('missing', 'project'), 20, 'ratio feature should fall back to global default when no setting matches');
    assert.equal(feature.calculateEstTime('00:30', 2), '60s', 'ratio feature should calculate estimated duration from music duration and ratio');
    assert.equal(feature.calculateEstTime('00:30', 0), '30s', 'ratio feature should preserve the legacy ratio fallback when the ratio is falsy');
    assert.equal(feature.getTaskRatio({ id: 'T1', musicianId: 'M1', projectId: 'P1', instrumentId: 'I1', ratios: { project: 15 } }), 15, 'ratio feature should prefer local ratio for the active TrackList view');
    assert.equal(feature.getTaskRatio({ id: 'T2', musicianId: 'M1', projectId: 'P1', instrumentId: 'I1', ratios: { project: null } }), 12, 'ratio feature should inherit default ratio for the active TrackList view');

    refs.showTrackList.value = false;
    assert.equal(feature.getTaskRatio({ id: 'T3', musicianId: 'M1', projectId: 'P1', instrumentId: 'I1', ratios: { instrument: 7 } }), 7, 'ratio feature should fall back to sidebar tab when TrackList is closed');

    const itemWithoutRatios = { id: 'T4', musicianId: 'M1', projectId: 'P1', instrumentId: 'I1' };
    assert.equal(feature.getTaskRatio(itemWithoutRatios, 'musician'), 20, 'ratio feature should preserve the legacy musician ratio fallback when initializing missing ratios before lookup');
    assert.deepEqual(itemWithoutRatios.records, { musician: {}, project: {}, instrument: {} }, 'ratio feature should initialize missing record maps');
    assert.deepEqual(itemWithoutRatios.ratios, { musician: 20, project: null, instrument: null }, 'ratio feature should initialize missing ratio maps while preserving musician legacy fallback');
    assert.deepEqual(splitInitialized, ['T4'], 'ratio feature should initialize split-view state before record and ratio maps');

    const legacyRecordedItem = {
        id: 'LEGACY_REC',
        actualDuration: '00:25',
        recStart: '09:00',
        recEnd: '09:25',
        breakMinutes: 3,
        ratio: 11,
        musicianId: 'M1',
    };
    feature.ensureItemRecords(legacyRecordedItem);
    assert.deepEqual(
        legacyRecordedItem.records.musician,
        { recStart: '09:00', recEnd: '09:25', actualDuration: '00:25', breakMinutes: 3 },
        'ratio feature should migrate legacy recording fields into musician records',
    );
    assert.deepEqual(legacyRecordedItem.ratios, { musician: 11, project: null, instrument: null }, 'ratio feature should preserve old musician ratio while leaving project and instrument auto-following');

    const partialItem = { id: 'PARTIAL', records: { musician: { actualDuration: '00:10' } }, ratios: { musician: undefined, project: undefined } };
    feature.ensureItemRecords(partialItem);
    assert.deepEqual(partialItem.records, { musician: { actualDuration: '00:10' }, project: {}, instrument: {} }, 'ratio feature should fill missing record dimensions without replacing existing records');
    assert.deepEqual(partialItem.ratios, { musician: null, project: null, instrument: null }, 'ratio feature should fill undefined ratio dimensions with auto-following nulls');

    assert.equal(feature.isDefaultRatio({ ratio: '' }), true, 'ratio feature should treat missing ratio as default');
    assert.equal(feature.isDefaultRatio({ musicianId: 'M1', ratio: 18 }), true, 'ratio feature should compare musician-specific defaults');
    assert.equal(feature.isDefaultRatio({ musicianId: 'M1', ratio: 19 }), false, 'ratio feature should expose non-default ratios');
    assert.equal(feature.isDefaultRatio({ ratio: 20 }), true, 'ratio feature should fall back to global default ratio');

    refs.itemPool.value = [
        {
            id: 'AUTO',
            musicianId: 'M1',
            projectId: 'P1',
            instrumentId: 'I1',
            sessionId: 'S1',
            musicDuration: '00:30',
            records: { musician: { actualDuration: '01:00' } },
            ratios: { musician: null, project: null, instrument: null },
            ratio: 18,
            estDuration: 'old',
        },
        {
            id: 'MANUAL',
            musicianId: 'M1',
            projectId: 'P1',
            instrumentId: 'I1',
            sessionId: 'S1',
            musicDuration: '00:30',
            records: { musician: { actualDuration: '00:30' } },
            ratios: { musician: 9, project: null, instrument: null },
            ratio: 9,
            estDuration: 'manual-old',
        },
        {
            id: 'OTHER_SESSION',
            musicianId: 'M1',
            projectId: 'P1',
            instrumentId: 'I1',
            sessionId: 'S2',
            musicDuration: '00:30',
            records: { musician: { actualDuration: '05:00' } },
            ratios: { musician: null, project: null, instrument: null },
            ratio: 18,
            estDuration: 'other-old',
        },
    ];
    refs.scheduledTasks.value = [{
        id: 'SCHED_AUTO',
        musicianId: 'M1',
        projectId: 'P1',
        instrumentId: 'I1',
        musicDuration: '00:30',
        records: { musician: { actualDuration: '00:45' } },
        ratios: { musician: 20, project: null, instrument: null },
        ratio: 20,
        estDuration: 'schedule-old',
    }];

    feature.autoUpdateEfficiency('M1', 'musician');
    assert.equal(state.settings.musicians[0].defaultRatio, 1.5, 'auto efficiency should update the matching setting default ratio from current-session recordings');
    assert.equal(refs.itemPool.value[0].ratios.musician, null, 'auto efficiency should keep auto-following pool items unlocked');
    assert.equal(refs.itemPool.value[0].ratio, 1.5, 'auto efficiency should update auto-following pool item display ratio');
    assert.equal(refs.itemPool.value[0].estDuration, '45s', 'auto efficiency should recalculate pool item estimated duration');
    assert.equal(refs.itemPool.value[1].ratio, 9, 'auto efficiency should not override manually-ratioed pool items');
    assert.equal(refs.itemPool.value[2].ratio, 1.5, 'auto efficiency should preserve the original broad display-ratio refresh for matching pool items');
    assert.equal(refs.scheduledTasks.value[0].ratios.musician, null, 'auto efficiency should unlock scheduled items that were pinned to the legacy default');
    assert.equal(refs.scheduledTasks.value[0].ratio, 1.5, 'auto efficiency should update scheduled item display ratio');

    refs.itemPool.value = [{
        id: 'NO_DATA',
        projectId: 'P1',
        musicDuration: '01:00',
        records: { project: {} },
        ratios: { musician: null, project: null, instrument: null },
        ratio: 12,
        estDuration: 'project-old',
    }];
    refs.scheduledTasks.value = [];
    feature.autoUpdateEfficiency('P1', 'project');
    assert.equal(state.settings.projects[0].defaultRatio, 12, 'auto efficiency should preserve an existing default ratio when there is no recording data');
    assert.equal(refs.itemPool.value[0].ratio, 12, 'auto efficiency should apply the preserved default to auto-following items with no recording data');

    refs.itemPool.value = [
        {
            id: 'POOL_X20',
            musicianId: 'M1',
            sessionId: 'S1',
            musicDuration: '00:30',
            records: { musician: { actualDuration: '01:00' } },
            ratios: { musician: 20, project: '20', instrument: 7 },
            ratio: 20,
            estDuration: 'cleanup-old',
        },
        {
            id: 'POOL_MANUAL',
            musicianId: 'M1',
            sessionId: 'S1',
            musicDuration: '00:30',
            records: { musician: { actualDuration: '00:30' } },
            ratios: { musician: 8, project: null, instrument: null },
            ratio: 8,
            estDuration: 'manual-cleanup-old',
        },
    ];
    refs.scheduledTasks.value = [{
        id: 'SCHED_X20',
        musicianId: 'M1',
        sessionId: 'S1',
        musicDuration: '00:30',
        records: { musician: { actualDuration: '00:45' } },
        ratios: { musician: 20, project: null, instrument: 20 },
        ratio: 20,
        estDuration: 'scheduled-cleanup-old',
    }];
    refs.showTrackList.value = false;
    refs.sidebarTab.value = 'musician';
    refs.musicianStats.value = [{ id: 'M1' }];
    state.settings.musicians[0].defaultRatio = 18;

    feature.cleanOldRatios();
    assert.equal(confirmCalls.length, 1, 'legacy ratio cleanup should ask for confirmation before mutating data');
    assert.equal(confirmCalls[0][0], '清理旧倍率数据', 'legacy ratio cleanup should preserve the existing confirm title');
    assert.equal(confirmCalls[0][3], false, 'legacy ratio cleanup should keep the confirm modal non-destructive');
    assert.equal(confirmCalls[0][4], '立即清理', 'legacy ratio cleanup should preserve the confirm action label');

    confirmCalls[0][2]();
    assert.deepEqual(refs.itemPool.value[0].ratios, { musician: null, project: null, instrument: 7 }, 'legacy ratio cleanup should unlock only x20 pool ratios');
    assert.deepEqual(refs.itemPool.value[1].ratios, { musician: 8, project: null, instrument: null }, 'legacy ratio cleanup should preserve non-default manual ratios');
    assert.deepEqual(refs.scheduledTasks.value[0].ratios, { musician: null, project: null, instrument: null }, 'legacy ratio cleanup should unlock scheduled x20 ratios');
    assert.equal(historyPushes, 1, 'legacy ratio cleanup should push one history entry after confirmation');

    assert.deepEqual(alerts, [['清理完成', '已成功将 2 个任务重置为自动跟随模式。\n现在它们会乖乖跟随大卡片的效率了！']], 'legacy ratio cleanup should report the number of changed tasks');
    assert.equal(state.settings.musicians[0].defaultRatio, 1.5, 'legacy ratio cleanup should trigger the existing musician efficiency refresh when stats are available');

    global.window = previousWindow;
}

{
    const feature = registerNameLookupFeature({
        state: {
            settings: {
                instruments: [{ id: 101, name: 'Cello' }],
                musicians: [{ id: 'M1', name: 'Amy' }],
                projects: [{ id: 'P1', name: 'Project A' }],
            },
        },
    });

    assert.equal(feature.getNameById('', 'instrument'), '未选择', 'name lookup should preserve the unselected fallback');
    assert.equal(feature.getNameById('101', 'instrument'), 'Cello', 'name lookup should preserve loose id matching for imported numeric ids');
    assert.equal(feature.getNameById('M1', 'musician'), 'Amy', 'name lookup should return musician names');
    assert.equal(feature.getNameById('P1', 'project'), 'Project A', 'name lookup should return project names');
    assert.equal(feature.getNameById('missing-project', 'project'), '未知项目', 'name lookup should preserve project missing fallback');
    assert.equal(feature.getNameById('missing-instrument', 'instrument'), '未知乐器', 'name lookup should preserve instrument missing fallback');
    assert.equal(feature.getNameById('missing-musician', 'musician'), '未知演奏员', 'name lookup should preserve musician and unknown-type missing fallback');
}

{
    const splitTask = {
        scheduleId: 'ACT_SPLIT',
        date: '2026-05-29',
        startTime: '09:00',
        estDuration: '3600s',
        musicianId: 'M1',
    };
    const refs = {
        scheduledTasks: vueRef([splitTask]),
        itemPool: vueRef([]),
        pxPerMin: vueRef(2),
        currentSessionId: vueRef('S1'),
        trackListData: vueRef({}),
        showTrackList: vueRef(false),
        trackListContainerRef: vueRef(null),
    };
    const haptics = [];
    let historyCount = 0;
    const feature = registerScheduleTaskActivationFeature({
        refs,
        utils: {
            parseTime: (value) => Number(String(value).replace('s', '')),
            formatSecs: (seconds) => `${seconds}s`,
        },
        actions: {
            isContextSwitchingActive: () => false,
            isTaskGhost: () => false,
            jumpToGhostContext: () => {},
            triggerTouchHaptic: (type) => haptics.push(type),
            pushHistory: () => { historyCount += 1; },
            getNow: () => 1000,
            normalizeSplitViewType: (value) => value,
            isItemVisibleForView: () => true,
            syncItemForView: () => {},
            ensureItemRecords: () => {},
            getNameById: () => '',
            autoSortTrackList: () => {},
        },
    });

    feature.handleTaskDblClick({
        metaKey: true,
        ctrlKey: false,
        clientY: 160,
        currentTarget: { getBoundingClientRect: () => ({ top: 100 }) },
    }, splitTask);

    assert.deepEqual(refs.scheduledTasks.value.map((task) => task.scheduleId), [1000, 1001], 'double-click split should replace the original schedule with two new blocks');
    assert.deepEqual(refs.scheduledTasks.value.map((task) => task.estDuration), ['1800s', '1800s'], 'double-click split should divide durations at the snapped click position');
    assert.equal(refs.scheduledTasks.value[1].startTime, '9:30', 'double-click split should preserve the original non-padded hour formatting');

    assert.equal(historyCount, 1, 'double-click split should push one history entry');
}

{
    const currentSchedule = {
        scheduleId: 'ACT_OPEN',
        sessionId: 'S1',
        date: '2026-05-30',
        startTime: '10:00',
        estDuration: '1800s',
        projectId: 'P1',
    };
    const earlierSchedule = {
        scheduleId: 'ACT_EARLIER',
        sessionId: 'S1',
        date: '2026-05-29',
        startTime: '09:00',
        estDuration: '1800s',
        projectId: 'P1',
    };
    const refs = {
        scheduledTasks: vueRef([currentSchedule, earlierSchedule, {
            scheduleId: 'OTHER_SESSION',
            sessionId: 'S2',
            date: '2026-05-29',
            startTime: '09:00',
            estDuration: '1800s',
            projectId: 'P1',
        }]),
        itemPool: vueRef([
            { id: 'POOL_VISIBLE', sessionId: 'S1', projectId: 'P1', sectionIndex: 9 },
            { id: 'POOL_HIDDEN', sessionId: 'S1', projectId: 'P1', hidden: true },
            { id: 'POOL_OTHER_SESSION', sessionId: 'S2', projectId: 'P1' },
        ]),
        pxPerMin: vueRef(2),
        currentSessionId: vueRef('S1'),
        trackListData: vueRef({}),
        showTrackList: vueRef(false),
        trackListContainerRef: vueRef({ scrollTo: () => { throw new Error('should scroll to divider for section 1'); } }),
    };
    const haptics = [];
    const ensured = [];
    const synced = [];
    const delays = [];
    const scrollCalls = [];
    let sorted = false;
    const divider = {
        scrollIntoView: (options) => scrollCalls.push(options),
    };
    const feature = registerScheduleTaskActivationFeature({
        refs,
        utils: {
            parseTime: (value) => Number(String(value).replace('s', '')),
            formatSecs: (seconds) => `${seconds}s`,
        },
        actions: {
            isContextSwitchingActive: () => false,
            isTaskGhost: () => false,
            jumpToGhostContext: () => {},
            triggerTouchHaptic: (type) => haptics.push(type),
            pushHistory: () => {},
            getNow: () => 2000,
            normalizeSplitViewType: (value) => value,
            isItemVisibleForView: (item) => !item.hidden,
            syncItemForView: (item, viewType) => synced.push({ id: item.id, viewType }),
            ensureItemRecords: (item) => ensured.push(item.id),
            getNameById: (id, type) => `${type}:${id}`,
            autoSortTrackList: () => { sorted = true; },
            setTimeout: (callback, delay) => {
                delays.push(delay);
                callback();
            },
            getDocument: () => ({
                getElementById: (id) => {
                    assert.equal(id, 'sec-divider-1', 'TrackList opening should scroll to the current section divider');
                    return divider;
                },
            }),
        },
    });

    feature.handleTaskDblClick({
        metaKey: false,
        ctrlKey: false,
    }, currentSchedule);


    assert.equal(refs.trackListData.value.name, 'project:P1', 'opening TrackList should title the modal from the active block resource');
    assert.equal(refs.trackListData.value.taskRef.scheduleId, 'ACT_OPEN', 'opening TrackList should store the current schedule reference');
    assert.deepEqual(refs.trackListData.value.schedules.map((task) => task.scheduleId), ['ACT_EARLIER', 'ACT_OPEN'], 'opening TrackList should sort related same-session schedules');
    assert.equal(refs.trackListData.value.currentSectionIndex, 1, 'opening TrackList should preserve the current section index');
    assert.equal(refs.trackListData.value.totalSections, 2, 'opening TrackList should count related schedule sections');
    assert.deepEqual(refs.trackListData.value.items.map((item) => item.id), ['POOL_VISIBLE'], 'opening TrackList should filter pool items by visibility, session, and resource id');
    assert.equal(refs.trackListData.value.items[0].sectionIndex, 1, 'opening TrackList should clamp stale section indexes to the last available section');
    assert.equal(refs.trackListData.value.viewType, 'project', 'opening TrackList should expose the block view type');
    assert.equal(refs.showTrackList.value, true, 'opening TrackList should show the TrackList panel');
    assert.equal(sorted, true, 'opening TrackList should auto-sort the visible items');
    assert.deepEqual(ensured, ['POOL_VISIBLE'], 'opening TrackList should initialize records for visible pool items');
    assert.deepEqual(synced, [{ id: 'POOL_VISIBLE', viewType: 'project' }], 'opening TrackList should sync visible items for the active view');
    assert.deepEqual(delays, [50, 350], 'opening TrackList should preserve delayed divider scroll timings');
    assert.deepEqual(scrollCalls, [
        { behavior: 'auto', block: 'start' },
        { behavior: 'smooth', block: 'start' },
    ], 'opening TrackList should preserve immediate and retry divider scrolling');
}

{
    const task = {
        scheduleId: 'SCHED_DRAG',
        date: '2026-05-28',
        startTime: '09:00',
        estDuration: '1800s',
        projectId: 'P1',
    };
    const refs = {
        scheduledTasks: vueRef([task]),
        pxPerMin: vueRef(2),
        sidebarTab: vueRef('musician'),
        currentSessionId: vueRef('S1'),
        isMobile: vueRef(true),
    };
    const body = {
        appended: [],
        removed: [],
        appendChild(element) { this.appended.push(element); },
        removeChild(element) { this.removed.push(element); },
    };
    const removedDragOverClasses = [];
    const documentStub = {
        body,
        querySelectorAll: (selector) => {
            assert.ok(
                ['.grid-slot.drag-over', '.droppable-slot.drag-over'].includes(selector),
                'schedule drops should clear the expected drag-over highlights'
            );
            return [{ classList: { remove: (name) => removedDragOverClasses.push(name) } }];
        },
    };
    const haptics = [];
    let historyCount = 0;
    const overlapCalls = [];
    const cloneClasses = [];
    const clone = {
        classList: { remove: (name) => cloneClasses.push(`remove:${name}`) },
        style: {
            setProperty(name, value, priority) {
                this[name] = value;
                this[`${name}Priority`] = priority;
            },
        },
    };
    const targetClasses = [];
    const targetEl = {
        offsetWidth: 120,
        cloneNode: () => clone,
        classList: {
            remove: (name) => targetClasses.push(`remove:${name}`),
            add: (name) => targetClasses.push(`add:${name}`),
        },
        style: {},
        getBoundingClientRect: () => ({ top: 40, left: 10 }),
    };
    const feature = registerScheduleDragDropFeature({
        refs,
        state: {
            settings: { startHour: 9, endHour: 18 },
        },
        utils: {
            formatSecs: (seconds) => `${seconds}s`,
        },
        actions: {
            getDocument: () => documentStub,
            getDocumentBody: () => body,
            setTimeout: (callback, delay) => {
                assert.equal(delay, 0, 'drag start should defer ghost cleanup with the original zero-delay timeout');
                callback();
            },
            checkOverlap: (...args) => {
                overlapCalls.push(args);
                return false;
            },
            triggerTouchHaptic: (type) => haptics.push(type),
            pushHistory: () => { historyCount += 1; },
        },
    });

    let dragImageArgs = null;
    const dragStartEvent = {
        altKey: true,
        clientX: 30,
        clientY: 100,
        target: targetEl,
        dataTransfer: {
            effectAllowed: '',
            setDragImage: (...args) => { dragImageArgs = args; },
        },
    };
    feature.dragStart(dragStartEvent, task, 'schedule');
    assert.equal(dragStartEvent.dataTransfer.effectAllowed, 'move', 'drag start should preserve move-only drag effects');
    assert.deepEqual(dragImageArgs, [clone, 20, 60], 'drag start should preserve pointer-aligned drag images');
    assert.deepEqual(cloneClasses, ['remove:is-selected'], 'drag start should remove selected styling from the temporary drag ghost');
    assert.deepEqual(body.appended, [clone], 'drag start should append the temporary drag ghost');
    assert.deepEqual(body.removed, [clone], 'drag start should remove the temporary drag ghost after setup');
    assert.deepEqual(targetClasses, ['add:pointer-events-none'], 'drag start should hide the original schedule block after creating the ghost image');
    assert.equal(targetEl.style.opacity, '0', 'drag start should preserve inline opacity hiding for the source element');

    const container = { getBoundingClientRect: () => ({ top: 100 }) };
    const column = { querySelector: (selector) => selector === '.relative[style*="min-height"]' ? container : null };
    feature.dropToSchedule({
        clientY: 200,
        target: { closest: (selector) => selector === '[data-date-str]' ? column : null },
    }, '2026-05-29');

    assert.deepEqual(removedDragOverClasses, ['drag-over'], 'week drops should remove existing drag-over highlights');
    assert.deepEqual(overlapCalls, [['2026-05-29', '09:30', '1800s', 'SCHED_DRAG', 'project']], 'week drops should preserve overlap checks with snapped time and task type');
    assert.notEqual(refs.scheduledTasks.value[0], task, 'moving an existing schedule block should replace the task object to refresh Vue');
    assert.equal(refs.scheduledTasks.value[0].date, '2026-05-29', 'week drops should update the moved task date');
    assert.equal(refs.scheduledTasks.value[0].startTime, '09:30', 'week drops should snap moved task start time to the 30-minute grid');

    assert.equal(historyCount, 1, 'successful week drops should push one history entry');

    const poolItem = {
        id: 'POOL_DRAG',
        musicianId: 'M1',
        projectId: '',
        instrumentId: 'I1',
        musicDuration: '1200s',
        ratio: 3,
        estDuration: '1800s',
    };
    feature.dragStart({
        altKey: false,
        target: null,
        dataTransfer: {
            effectAllowed: '',
        },
    }, poolItem, 'pool');
    feature.dropToSchedule({
        clientY: 100,
        target: { closest: (selector) => selector === '[data-date-str]' ? column : null },
    }, '2026-05-30');

    const createdPoolTask = refs.scheduledTasks.value.at(-1);
    assert.equal(createdPoolTask.templateId, 'POOL_DRAG', 'week drops from pool should preserve the source pool item id as templateId');
    assert.equal(createdPoolTask.instrumentId, 'I1', 'week drops from pool should preserve instrument ids');
    assert.equal(createdPoolTask.startTime, '09:00', 'week drops from pool should snap against the top of the time grid');
    assert.deepEqual(overlapCalls.at(-1), ['2026-05-30', '09:00', '1800s', null, 'instrument'], 'week drops from pool should check overlap with the source resource type');
    assert.equal(historyCount, 2, 'week drops from pool should push history after creation');

    const conflictTask = {
        scheduleId: 'SCHED_CONFLICT',
        projectId: 'P_CONFLICT',
        date: '2026-05-31',
        startTime: '10:00',
        estDuration: '1800s',
    };
    refs.scheduledTasks.value = [conflictTask];
    const beforeConflictSnapshot = JSON.stringify(refs.scheduledTasks.value);
    const conflictAlerts = [];
    const conflictHaptics = [];
    let conflictHistoryCount = 0;
    const conflictFeature = registerScheduleDragDropFeature({
        refs,
        state: {
            settings: { startHour: 9, endHour: 18 },
        },
        utils: {
            formatSecs: (seconds) => `${seconds}s`,
        },
        actions: {
            getDocument: () => documentStub,
            checkOverlap: () => true,
            openAlertModal: (...args) => conflictAlerts.push(args),
            triggerTouchHaptic: (type) => conflictHaptics.push(type),
            pushHistory: () => { conflictHistoryCount += 1; },
        },
    });
    conflictFeature.dragStart({
        altKey: false,
        clientX: 0,
        clientY: 0,
        target: null,
        dataTransfer: {
            effectAllowed: '',
        },
    }, conflictTask, 'schedule');
    conflictFeature.dropToSchedule({
        clientY: 100,
        target: { closest: (selector) => selector === '[data-date-str]' ? column : null },
    }, '2026-06-01');
    assert.deepEqual(conflictAlerts.at(-1), ['时间冲突', '该时间段已有同类型的其他安排。'], 'conflicting week drops should show the original overlap alert');

    assert.equal(JSON.stringify(refs.scheduledTasks.value), beforeConflictSnapshot, 'conflicting week drops must not mutate the scheduled task list');
    assert.equal(conflictHistoryCount, 0, 'conflicting week drops must not push history');

    const monthTask = {
        scheduleId: 'SCHED_MONTH',
        musicianId: 'M_MONTH',
        date: '2026-06-02',
        startTime: '11:00',
        estDuration: '1800s',
    };
    refs.scheduledTasks.value = [monthTask];
    const monthHaptics = [];
    let monthHistoryCount = 0;
    const monthFeature = registerScheduleDragDropFeature({
        refs,
        state: {
            settings: { startHour: 9, endHour: 18 },
        },
        utils: {
            formatSecs: (seconds) => `${seconds}s`,
        },
        actions: {
            getDocument: () => documentStub,
            checkOverlap: () => false,
            triggerTouchHaptic: (type) => monthHaptics.push(type),
            pushHistory: () => { monthHistoryCount += 1; },
        },
    });
    const monthTaskBeforeDrop = refs.scheduledTasks.value[0];
    monthFeature.dragStart({
        altKey: false,
        clientX: 0,
        clientY: 0,
        target: null,
        dataTransfer: {
            effectAllowed: '',
        },
    }, monthTask, 'schedule');
    monthFeature.dropToMonth({}, '2026-06-03');
    assert.notEqual(refs.scheduledTasks.value[0], monthTaskBeforeDrop, 'month drops should replace moved schedule objects to refresh Vue like week drops');
    assert.equal(refs.scheduledTasks.value[0].date, '2026-06-03', 'month drops should update the moved schedule date');
    assert.equal(refs.scheduledTasks.value[0].startTime, '11:00', 'month drops should preserve the original start time for existing schedules');
    assert.equal(monthHistoryCount, 1, 'successful month drops should push one history entry');

    feature.handleDragEnd({ target: targetEl });
    assert.equal(targetEl.style.opacity, '', 'drag end should restore source opacity');
    assert.equal(targetEl.style.transition, '', 'drag end should restore source transition');
}

{
    const body = { style: { cursor: '' } };
    const taskEl = { offsetHeight: 60 };
    const task = {
        scheduleId: 'TASK_DESKTOP_RESIZE',
        date: '2026-05-29',
        startTime: '09:00',
        estDuration: '1800s',
        musicDuration: '1800s',
        projectId: 'P1',
    };
    const refs = {
        resizing: vueRef(null),
        pxPerMin: vueRef(2),
    };
    const alerts = [];
    const haptics = [];
    let historyCount = 0;
    let prevented = false;
    let stopped = false;
    let overlap = false;
    const feature = registerDesktopResizeFeature({
        refs,
        utils: {
            timeToMinutes: (time) => {
                assert.equal(time, '09:00', 'desktop resize should parse task start time while snapping');
                return 540;
            },
            formatSecs: (seconds) => `${seconds}s`,
            parseTime: (value) => Number(String(value).replace('s', '')),
        },
        actions: {
            getDocumentBody: () => body,
            checkOverlap: (...args) => {
                assert.deepEqual(args, ['2026-05-29', '09:00', task.estDuration, 'TASK_DESKTOP_RESIZE', 'project'], 'desktop resize should check overlap using the task resource type');
                return overlap;
            },
            openAlertModal: (...args) => alerts.push(args),
            triggerTouchHaptic: (type) => haptics.push(type),
            pushHistory: () => { historyCount += 1; },
        },
    });

    feature.initResize({
        preventDefault: () => { prevented = true; },
        stopPropagation: () => { stopped = true; },
        clientY: 100,
        target: { closest: (selector) => selector === '.task-block' ? taskEl : null },
    }, task);

    assert.equal(prevented, true, 'desktop resize init should prevent default mouse handling');
    assert.equal(stopped, true, 'desktop resize init should stop event propagation');
    assert.equal(refs.resizing.value.task.scheduleId, task.scheduleId, 'desktop resize init should store the active task');
    assert.equal(refs.resizing.value.startY, 100, 'desktop resize init should store the mouse start y');
    assert.equal(refs.resizing.value.startH, 60, 'desktop resize init should store the task block height');
    assert.equal(refs.resizing.value.originalDuration, '1800s', 'desktop resize init should remember the original duration');
    assert.equal(body.style.cursor, 'ns-resize', 'desktop resize init should set the resize cursor');

    feature.handleResizeMove({ clientY: 130 });
    assert.equal(task.estDuration, '3600s', 'desktop resize move should snap the resized duration to the 30-minute grid');

    feature.handleResizeEnd();
    assert.equal(task.ratio, '2.0', 'desktop resize end should recalculate ratio when there is no conflict');
    assert.equal(historyCount, 1, 'desktop resize end should push history after a successful resize');
    assert.equal(refs.resizing.value, null, 'desktop resize end should clear resize state');
    assert.equal(body.style.cursor, '', 'desktop resize end should restore the cursor');

    feature.initResize({
        preventDefault: () => {},
        stopPropagation: () => {},
        clientY: 200,
        target: { closest: () => taskEl },
    }, task);
    task.estDuration = '2700s';
    refs.resizing.value.originalDuration = '3600s';
    overlap = true;
    feature.handleResizeEnd();
    assert.equal(task.estDuration, '3600s', 'desktop resize end should roll back the duration when overlap is detected');
    assert.deepEqual(alerts, [['冲突', '调整后的时间有重叠']], 'desktop resize conflict should preserve the original alert copy');

}

{
    const historyCalls = [];
    const feature = registerColorPickerFeature({
        actions: {
            pushHistory: () => historyCalls.push('push'),
        },
    });
    const itemWithColor = { color: '#111111' };

    feature.openColorPicker(itemWithColor, 'project');
    assert.equal(feature.showColorPickerModal.value, true, 'opening color picker should show the modal');
    assert.deepEqual(feature.colorPickerTarget.value, { item: itemWithColor, type: 'project' }, 'opening color picker should remember the target item and type');
    assert.equal(feature.tempColor.value, '#111111', 'opening color picker should use existing item color first');

    feature.tempColor.value = '#222222';
    feature.saveColorPicker();
    assert.equal(itemWithColor.color, '#222222', 'saving color picker should commit temp color to the target item');
    assert.equal(feature.showColorPickerModal.value, false, 'saving color picker should close the modal');
    assert.deepEqual(historyCalls, ['push'], 'saving color picker should push history when a color is committed');

    const itemWithoutColor = {};
    feature.openColorPicker(itemWithoutColor, 'instrument');
    assert.equal(feature.tempColor.value, '#3b82f6', 'opening color picker should fall back to instrument default color');
    feature.tempColor.value = '#999999';
    feature.resetColorPicker();
    assert.equal(feature.tempColor.value, '#3b82f6', 'resetting color picker should restore the target type default');
    assert.equal(feature.getDefaultColorByType('musician'), '#a855f7', 'color picker should preserve musician default color');
    assert.equal(feature.getDefaultColorByType('unknown'), '#9ca3af', 'color picker should preserve fallback default color');
    assert.equal(feature.getGroupColor({}, 'musicianId', false), '#a855f7', 'group color should preserve musician accent color');
    assert.equal(feature.getGroupColor({}, 'projectId', false), '#eab308', 'group color should preserve project accent color');
    assert.equal(feature.getGroupColor({}, 'instrumentId', false), '#3b82f6', 'group color should preserve instrument accent color');
    assert.equal(feature.getGroupColor({}, 'unknown', false), '#f3f4f6', 'group color should preserve default fill color');
    assert.equal(feature.getGroupColor({}, 'unknown', true), '#9ca3af', 'group color should preserve default border color');
    assert.equal(feature.presetColors.length, 20, 'color picker should expose the original 20 preset swatches');
}

{
    let loadDriverCount = 0;
    const driverCalls = [];
    const storage = new Map();
    const feature = registerTourFeature({
        refs: {
            isMobile: vueRef(false),
            isSidebarOpen: vueRef(false),
            mobileTab: vueRef('schedule'),
            showMobileTaskInput: vueRef(false),
            sidebarScrollRef: vueRef(null),
        },
        services: {
            storageService: {
                getItem: (key) => storage.get(key) || null,
                setItem: (key, value) => storage.set(key, value),
                removeItem: (key) => storage.delete(key),
            },
        },
        actions: {
            getWindow: () => ({ innerWidth: 1200 }),
            setTimeoutFn: (callback) => callback(),
            loadDriver: async () => {
                loadDriverCount += 1;
                return (config) => {
                    driverCalls.push(['create', config]);
                    return {
                        setConfig: (value) => driverCalls.push(['setConfig', value]),
                        drive: () => driverCalls.push(['drive']),
                    };
                };
            },
        },
    });

    assert.equal(loadDriverCount, 0, 'registering tour feature should not load driver.js');
    await feature.startTour();
    assert.equal(loadDriverCount, 1, 'starting tour should lazily load driver.js once');
    assert.equal(driverCalls.filter(([type]) => type === 'create').length, 1, 'starting tour should create one driver instance');
    assert.equal(driverCalls.filter(([type]) => type === 'drive').length, 1, 'starting tour should drive the onboarding tour');
    assert.equal(storage.get('musche_tour_seen'), 'true', 'starting tour should preserve the seen-tour marker');
    await feature.startTour();
    assert.equal(loadDriverCount, 1, 'starting tour again should reuse the lazy driver instance');
    assert.equal(driverCalls.filter(([type]) => type === 'drive').length, 2, 'restarting tour should drive the cached onboarding tour');
}

console.log(`modularization smoke passed (${requiredFiles.length} JS modules checked)`);
