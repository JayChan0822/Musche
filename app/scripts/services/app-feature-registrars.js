import { createAppRuntimeFeatureRegistrar } from './app-runtime-feature-registrar.js';
import { createGlobalKeyboardFeatureRegistrar } from './global-keyboard-feature-registrar.js';
import { createSessionFeatureRegistrar } from './session-feature-registrar.js';
import { createHistoryFeatureRegistrar } from './history-feature-registrar.js';
import { createRatioFeatureRegistrar } from './ratio-feature-registrar.js';
import { createNameLookupFeatureRegistrar } from './name-lookup-feature-registrar.js';
import { createSplitViewFeatureRegistrar } from './split-view-feature-registrar.js';
import { createDropdownsFeatureRegistrar } from './dropdowns-feature-registrar.js';
import { createViewNavigationFeatureRegistrar } from './view-navigation-feature-registrar.js';
import { createQuickAddFeatureRegistrar } from './quick-add-feature-registrar.js';
import { createUniversalModalFeatureRegistrar } from './universal-modal-feature-registrar.js';
import { createOrchestrationFeatureRegistrar } from './orchestration-feature-registrar.js';
import { createSplitTaskFeatureRegistrar } from './split-task-feature-registrar.js';
import { createPickerControlsFeatureRegistrar } from './picker-controls-feature-registrar.js';
import { createPoolInteractionsFeatureRegistrar } from './pool-interactions-feature-registrar.js';
import { createSearchFeatureRegistrar } from './search-feature-registrar.js';
import { createSidebarStatsFeatureRegistrar } from './sidebar-stats-feature-registrar.js';
import { createSidebarFeatureRegistrar } from './sidebar-feature-registrar.js';
import { createMobileUiFeatureRegistrar } from './mobile-ui-feature-registrar.js';
import { createScheduleFeatureRegistrar } from './schedule-feature-registrar.js';
import { createScheduleInteractionsFeatureRegistrar } from './schedule-interactions-feature-registrar.js';
import { createAuthFeatureRegistrar } from './auth-feature-registrar.js';
import { createSettingsSyncFeatureRegistrar } from './settings-sync-feature-registrar.js';

export function createAppFeatureRegistrars({ pinyinMatchSupport } = {}) {
    return {
        registerAppRuntimeFeature: createAppRuntimeFeatureRegistrar(),
        registerGlobalKeyboardFeature: createGlobalKeyboardFeatureRegistrar(),
        wireSessionFeature: createSessionFeatureRegistrar(),
        wireHistoryFeature: createHistoryFeatureRegistrar(),
        wireRatioFeature: createRatioFeatureRegistrar(),
        wireNameLookupFeature: createNameLookupFeatureRegistrar(),
        wireSplitViewFeature: createSplitViewFeatureRegistrar(),
        wireDropdownsFeature: createDropdownsFeatureRegistrar(),
        wireViewNavigationFeature: createViewNavigationFeatureRegistrar(),
        wireQuickAddFeature: createQuickAddFeatureRegistrar(),
        wireUniversalModalFeature: createUniversalModalFeatureRegistrar(),
        wireOrchestrationFeature: createOrchestrationFeatureRegistrar(),
        registerSplitTaskFeature: createSplitTaskFeatureRegistrar(),
        wirePickerControlsFeature: createPickerControlsFeatureRegistrar(),
        registerPoolInteractionsFeature: createPoolInteractionsFeatureRegistrar(),
        wireSearchFeature: createSearchFeatureRegistrar({ pinyinMatchSupport }),
        wireSidebarStatsFeature: createSidebarStatsFeatureRegistrar(),
        wireSidebarFeature: createSidebarFeatureRegistrar(),
        wireMobileUiFeature: createMobileUiFeatureRegistrar(),
        wireScheduleFeature: createScheduleFeatureRegistrar(),
        registerScheduleInteractionsFeature: createScheduleInteractionsFeatureRegistrar(),
        registerAuthFeature: createAuthFeatureRegistrar(),
        wireSettingsSyncFeature: createSettingsSyncFeatureRegistrar(),
    };
}
