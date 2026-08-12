import { wireAppRuntimeFeature } from './app-runtime-feature-registrar.js';
import { wireGlobalKeyboardFeature } from './global-keyboard-feature-registrar.js';
import { wireSessionFeature } from './session-feature-registrar.js';
import { wireHistoryFeature } from './history-feature-registrar.js';
import { wireRatioFeature } from './ratio-feature-registrar.js';
import { wireNameLookupFeature } from './name-lookup-feature-registrar.js';
import { wireSplitViewFeature } from './split-view-feature-registrar.js';
import { wireDropdownsFeature } from './dropdowns-feature-registrar.js';
import { wireViewNavigationFeature } from './view-navigation-feature-registrar.js';
import { wireQuickAddFeature } from './quick-add-feature-registrar.js';
import { wireUniversalModalFeature } from './universal-modal-feature-registrar.js';
import { wireOrchestrationFeature } from './orchestration-feature-registrar.js';
import { wireSplitTaskFeature } from './split-task-feature-registrar.js';
import { wirePickerControlsFeature } from './picker-controls-feature-registrar.js';
import { wirePoolInteractionsFeature } from './pool-interactions-feature-registrar.js';
import { createSearchFeatureRegistrar } from './search-feature-registrar.js';
import { wireSidebarStatsFeature } from './sidebar-stats-feature-registrar.js';
import { wireSidebarFeature } from './sidebar-feature-registrar.js';
import { wireMobileUiFeature } from './mobile-ui-feature-registrar.js';
import { wireScheduleFeature } from './schedule-feature-registrar.js';
import { wireScheduleInteractionsFeature } from './schedule-interactions-feature-registrar.js';
import { wireAuthFeature } from './auth-feature-registrar.js';
import { wireSettingsSyncFeature } from './settings-sync-feature-registrar.js';

export function createAppFeatureRegistrars({ pinyinMatchSupport } = {}) {
    return {
        wireAppRuntimeFeature,
        wireGlobalKeyboardFeature,
        wireSessionFeature,
        wireHistoryFeature,
        wireRatioFeature,
        wireNameLookupFeature,
        wireSplitViewFeature,
        wireDropdownsFeature,
        wireViewNavigationFeature,
        wireQuickAddFeature,
        wireUniversalModalFeature,
        wireOrchestrationFeature,
        wireSplitTaskFeature,
        wirePickerControlsFeature,
        wirePoolInteractionsFeature,
        wireSearchFeature: createSearchFeatureRegistrar({ pinyinMatchSupport }),
        wireSidebarStatsFeature,
        wireSidebarFeature,
        wireMobileUiFeature,
        wireScheduleFeature,
        wireScheduleInteractionsFeature,
        wireAuthFeature,
        wireSettingsSyncFeature,
    };
}
