// 最终模板上下文装配：把 assembly 上的 refs/state/helpers/utils 解析成
// appRootShell / appRootOverlaysShell 两个根 ctx。
// 每个 shell 需要哪些字段，只写在对应的 state/*-shell-state.js 的依赖清单里（见 state/shell-state-factory.js）；
// 这里只做两件事：
//   ① 提供 resolve —— 按依赖路径**惰性**读 assembly，每次访问才取值，
//      所以懒加载 feature 事后回填、后注册 feature 补发的引用都能自然进到 ctx，不存在"晚到的值进不来"；
//   ② 按依赖顺序创建各 shell ctx，并登记进 shells 供组合 shell（appXxxModalsShell）引用。
export function createAppRootContexts({ assembly, factories }) {
    const shells = {};
    const actions = {
        // 只属于根装配的动作：打开设置面板时顺手收起移动端菜单。
        openSettings: () => {
            assembly.refs.showSettings.value = true;
            assembly.refs.showMobileMenu.value = false;
        },
    };
    const resolve = createDependencyResolver({
        refs: assembly.refs,
        state: assembly.state,
        helpers: assembly.helpers,
        utils: assembly.utils,
        features: assembly.features,
        shells,
        actions,
    });
    const options = { resolve };

    shells.appHeader = factories.createRootHeaderShellState(options);
    shells.appSidebar = factories.createRootSidebarShellState(options);
    shells.appMainContent = factories.createRootMainContentShellState(options);
    shells.appMobileControls = factories.createRootMobileControlsShellState(options);

    shells.appSettingsModal = factories.createRootSettingsModalShellState(options);
    shells.appTrackListModal = factories.createRootTrackListModalShellState(options);
    shells.appMobileTaskInput = factories.createRootMobileTaskInputShellState(options);
    shells.appStandaloneOverlaysShell = factories.createRootStandaloneOverlaysShellState(options);

    shells.appEditModal = factories.createRootEditModalShellState(options);
    shells.appSplitModal = factories.createRootSplitModalShellState(options);
    shells.appTaskActionModalsShell = factories.createRootTaskActionModalsShellState(options);

    shells.appAuthModal = factories.createRootAuthModalShellState(options);
    shells.appCropModal = factories.createRootCropModalShellState(options);
    shells.appAccountModalsShell = factories.createRootAccountModalsShellState(options);

    shells.appQuickAddModal = factories.createRootQuickAddModalShellState(options);
    shells.appImportModal = factories.createRootImportModalShellState(options);
    shells.appUtilityModalsShell = factories.createRootUtilityModalsShellState(options);

    shells.appInputModal = factories.createRootInputModalShellState(options);
    shells.appConfirmModal = factories.createRootConfirmModalShellState(options);
    shells.appUniversalModalsShell = factories.createRootUniversalModalsShellState(options);

    shells.appColorPickerModal = factories.createRootColorPickerModalShellState(options);
    shells.appDurationPicker = factories.createRootDurationPickerModalShellState(options);
    shells.appPickerModalsShell = factories.createRootPickerModalsShellState(options);

    shells.appExportModal = factories.createRootExportModalShellState(options);
    shells.appCreditModal = factories.createRootCreditModalShellState(options);
    shells.appExportCreditModalsShell = factories.createRootExportCreditModalsShellState(options);

    shells.appMidiManagerModal = factories.createRootMidiManagerModalShellState(options);
    shells.appMidiImportModal = factories.createRootMidiImportModalShellState(options);
    shells.appCsvImportModal = factories.createRootCsvImportModalShellState(options);
    shells.appMidiCsvImportModalsShell = factories.createRootMidiCsvImportModalsShellState(options);

    shells.appProjectInfoModal = factories.createRootProjectInfoModalShellState(options);
    shells.appRecInfoModal = factories.createRootRecInfoModalShellState(options);
    shells.appMetadataInfoModalsShell = factories.createRootMetadataInfoModalsShellState(options);

    const { appRootShell, appRootOverlaysShell } = factories.createRootShellState({
        appHeader: shells.appHeader,
        appSidebar: shells.appSidebar,
        appMainContent: shells.appMainContent,
        appMobileControls: shells.appMobileControls,
        appStandaloneOverlaysShell: shells.appStandaloneOverlaysShell,
        appTaskActionModalsShell: shells.appTaskActionModalsShell,
        appAccountModalsShell: shells.appAccountModalsShell,
        appUtilityModalsShell: shells.appUtilityModalsShell,
        appUniversalModalsShell: shells.appUniversalModalsShell,
        appPickerModalsShell: shells.appPickerModalsShell,
        appExportCreditModalsShell: shells.appExportCreditModalsShell,
        appMidiCsvImportModalsShell: shells.appMidiCsvImportModalsShell,
        appMetadataInfoModalsShell: shells.appMetadataInfoModalsShell,
    });

    return { appRootShell, appRootOverlaysShell };
}

// 依赖路径解析器：'helpers.mobileTouchHandlers.handleTouchEnd' → assembly.helpers.mobileTouchHandlers.handleTouchEnd。
// 中途断链时报出完整路径，避免"漏接线 → 静默 undefined"。
function createDependencyResolver(sources) {
    const segmentsByPath = new Map();

    return function resolve(path) {
        let segments = segmentsByPath.get(path);
        if (!segments) {
            segments = path.split('.');
            segmentsByPath.set(path, segments);
        }

        let current = sources;
        for (let index = 0; index < segments.length; index += 1) {
            if (current === null || current === undefined) {
                throw new TypeError(`根 ctx 依赖 "${path}" 在 "${segments.slice(0, index).join('.')}" 处断链`);
            }
            current = current[segments[index]];
        }
        return current;
    };
}
