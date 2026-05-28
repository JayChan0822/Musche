import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const packageJsonPath = resolve(rootDir, 'package.json');
const indexHtmlPath = resolve(rootDir, 'app/index.html');
const appScriptPath = resolve(rootDir, 'app/scripts/app.js');
const viteConfigPath = resolve(rootDir, 'vite.config.mjs');
const vercelConfigPath = resolve(rootDir, 'vercel.json');

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const indexHtml = readFileSync(indexHtmlPath, 'utf8');
const appScript = readFileSync(appScriptPath, 'utf8');
const viteConfig = readFileSync(viteConfigPath, 'utf8');
const componentsCss = readFileSync(resolve(rootDir, 'app/styles/components.css'), 'utf8');
const trackListFeature = readFileSync(resolve(rootDir, 'app/scripts/features/track-list.js'), 'utf8');
const importMidiFeature = readFileSync(resolve(rootDir, 'app/scripts/features/import-midi.js'), 'utf8');
const creditsFeature = readFileSync(resolve(rootDir, 'app/scripts/features/credits.js'), 'utf8');
const projectInfoFeature = readFileSync(resolve(rootDir, 'app/scripts/features/project-info.js'), 'utf8');
const recInfoFeature = readFileSync(resolve(rootDir, 'app/scripts/features/rec-info.js'), 'utf8');
const { registerTrackListFeature } = await import('../app/scripts/features/track-list.js');
const { registerTaskEditorFeature } = await import('../app/scripts/features/task-editor.js');
const { registerProjectInfoFeature } = await import('../app/scripts/features/project-info.js');
const { registerRecInfoFeature } = await import('../app/scripts/features/rec-info.js');

assert.equal(
    packageJson.scripts?.['verify:modularization'],
    'node tests/modularization-smoke.mjs',
    'package.json must expose a reusable verify:modularization script'
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

assert.equal(
    packageJson.scripts?.test,
    'npm run verify:modularization && npm run verify:split-state && npm run verify:supabase-keepalive && node --test tests/utils-time.test.mjs tests/utils-midi.test.mjs tests/utils-csv.test.mjs',
    'npm test must run the modularization smoke check, split-state regression, keepalive verification, and utility tests'
);

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
    /<script src="\.\/config\.local\.js"><\/script>/,
    'index.html must load local runtime config before the module app entrypoint'
);
assert.ok(
    indexHtml.indexOf('<script src="./config.local.js"></script>') < indexHtml.indexOf('<script type="module" src="./scripts/app.js"></script>'),
    'index.html must load local runtime config before app.js reads Supabase config'
);

assert.ok(!/<style[\s>]/i.test(indexHtml), 'index.html should not contain an inline style block');

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

for (const refName of requiredBootstrapStoreRefs) {
    assert.match(
        appScript,
        new RegExp(`const \\{[\\s\\S]*\\b${refName}\\b[\\s\\S]*\\} = store;`),
        `app.js must destructure ${refName} from the store before using it during bootstrap`
    );
}

const searchFeatureIndex = appScript.indexOf('searchFeature = registerSearchFeature({');
const isMobileDeclarationIndex = appScript.indexOf('const isMobile = ref(');
assert.ok(searchFeatureIndex !== -1, 'app.js must register the search feature');
assert.ok(isMobileDeclarationIndex !== -1, 'app.js must declare isMobile');
assert.ok(
    isMobileDeclarationIndex < searchFeatureIndex,
    'app.js must declare isMobile before passing it to search feature setup'
);

const usesRuntimeDomTemplate = /@click|v-if|v-for|:class|\{\{/.test(indexHtml);
if (usesRuntimeDomTemplate) {
    assert.match(
        viteConfig,
        /alias\s*:\s*\{[\s\S]*\bvue\b\s*:\s*['"]vue\/dist\/vue\.esm-bundler\.js['"][\s\S]*\}/,
        'vite.config.mjs must alias vue to the compiler-included build when app/index.html uses runtime DOM templates'
    );
}

assert.match(
    indexHtml,
    /class="menu-shortcuts-dropdown custom-dropdown-menu/,
    'app/index.html must tag the top-left shortcuts menu with a dedicated class'
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
    indexHtml,
    /v-if="showMobileTaskInput"\s+class="modal-overlay z-\[1000\]"/,
    'mobile new-task overlay must stay below stacked dialogs such as quick-add, input, and confirm modals'
);
assert.match(
    indexHtml,
    /v-if="showQuickAddModal"\s+class="modal-overlay z-\[2000\]"/,
    'quick-add modal must layer above the mobile new-task overlay'
);
assert.match(
    indexHtml,
    /v-if="showInputModal"\s+class="modal-overlay z-\[10000\]"/,
    'input modal must layer above the mobile new-task overlay'
);
assert.match(
    indexHtml,
    /v-if="showConfirmModal"\s+class="modal-overlay z-\[9999\]"/,
    'confirm and alert modal must layer above the mobile new-task overlay'
);

assert.match(
    indexHtml,
    /class="desktop-search-shell hidden sm:flex items-center relative[\s\S]*fa-magnifying-glass absolute left-3\.5[\s\S]*class="desktop-search-input glass-input h-9 pr-8/,
    'desktop search input must use dedicated classes so the icon and placeholder text spacing can be controlled independently of shared glass-input styles'
);

assert.match(
    indexHtml,
    /<div class="space-y-4 text-sm flex-1 min-h-0 pr-1 custom-scrollbar edit-event-scroll-area" :class="\{ 'overflow-visible': activeDropdown && activeDropdown\.startsWith\('edit_'\), 'overflow-y-auto': !activeDropdown \|\| !activeDropdown\.startsWith\('edit_'\) \}">/,
    'Edit Event body must stop clipping edit dropdowns while a dropdown is open'
);

assert.doesNotMatch(
    importMidiFeature,
    /typeof JZZ|JZZ\.MIDI\.SMF/,
    'import-midi feature must not read an implicit global JZZ parser; app.js should inject the initialized parser'
);

assert.match(
    appScript,
    /installJzzSmfPlugin\(JZZ,\s*installJzzSmf\)/,
    'app.js must explicitly install the JZZ SMF plugin on the imported JZZ instance'
);

assert.match(
    trackListFeature,
    /syncTrackItemScheduleSection/,
    'track-list feature must expose a helper for syncing dragged track sections back to scheduled tasks'
);

assert.match(
    trackListFeature,
    /startTrackDrag/,
    'track-list feature must own row drag handlers for dragging tracks between sections'
);

assert.doesNotMatch(
    appScript,
    /let\s+trackDragState|let\s+trackDragTimer|const\s+startTrackDrag\s*=\s*\(e,\s*item\)\s*=>/,
    'app.js should not retain TrackList row drag state or handler bodies after extracting track-list behavior'
);

assert.match(
    creditsFeature,
    /registerCreditsFeature/,
    'credits feature must expose a registration function for Project Credits logic'
);

assert.match(
    appScript,
    /registerCreditsFeature\(/,
    'app.js must register the credits feature instead of owning Project Credits generation directly'
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

assert.match(
    appScript,
    /registerProjectInfoFeature\(/,
    'app.js must register the project-info feature instead of owning Project Info modal logic'
);

assert.doesNotMatch(
    appScript,
    /const\s+projectInfoForm\s*=\s*reactive\(|const\s+openProjectInfoModal\s*=\s*\(project\)\s*=>\s*\{/,
    'app.js should not retain the Project Info form or modal handler bodies after extraction'
);

assert.match(
    recInfoFeature,
    /registerRecInfoFeature/,
    'rec-info feature must expose a registration function for Rec/Edit Info modal logic'
);

assert.match(
    appScript,
    /registerRecInfoFeature\(/,
    'app.js must register the rec-info feature instead of owning Rec/Edit Info modal logic'
);

assert.doesNotMatch(
    appScript,
    /const\s+showRecInfoModal\s*=\s*ref\(|const\s+openRecInfoModal\s*=\s*\(\)\s*=>\s*\{|const\s+filteredRecOptions\s*=\s*computed\(/,
    'app.js should not retain Rec/Edit Info state, modal handlers, or dropdown computed bodies after extraction'
);

assert.doesNotMatch(
    appScript,
    /else if \(sidebarTab\.value === 'project'\)\s*\{\s*sidebarTab\.value = 'instrument';\s*\}/,
    'app.js Tab navigation should no longer cycle into instrument sidebar view'
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
    'app/scripts/services/device-service.js',
    'app/scripts/features/schedule.js',
    'app/scripts/features/settings.js',
    'app/scripts/features/import-csv.js',
    'app/scripts/features/import-midi.js',
    'app/scripts/features/auth.js',
    'app/scripts/features/mobile-ui.js',
    'app/scripts/features/calendar-view.js',
    'app/scripts/features/sidebar-stats.js',
    'app/scripts/features/task-editor.js',
    'app/scripts/features/track-list.js',
    'app/scripts/features/credits.js',
    'app/scripts/features/project-info.js',
    'app/scripts/features/rec-info.js',
    'app/scripts/features/split-task.js',
    'app/scripts/features/midi-manager.js',
    'scripts/supabase-keepalive.mjs'
];

for (const relativePath of requiredFiles) {
    const absolutePath = resolve(rootDir, relativePath);
    assert.ok(existsSync(absolutePath), `${relativePath} must exist`);
    execFileSync(process.execPath, ['--check', absolutePath], { stdio: 'pipe' });
}

{
    const item = { id: 'T1', sectionIndex: 1 };
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
    let notificationTarget = null;
    let pruneCalled = false;

    const feature = registerTrackListFeature({
        refs: {
            trackListData: {
                value: {
                    items: [item],
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
            isMobile: { value: false }
        },
        state: { settings: { instruments: [] } },
        utils: {
            parseTime: () => 0,
            formatSecs: (value) => String(value),
            getNameById: () => ''
        },
        actions: {
            openAlertModal: () => {},
            openInputModal: () => {},
            pushHistory: () => {},
            autoUpdateEfficiency: () => {},
            checkCanDeleteSplit: () => true,
            restoreSplitTime: () => false,
            updateTaskNotification: (task) => { notificationTarget = task; },
            triggerTouchHaptic: () => {},
            moveDivider: () => {},
            pruneEmptySchedules: () => { pruneCalled = true; }
        }
    });

    assert.equal(feature.syncTrackItemScheduleSection(item, 0), true);
    assert.equal(movedSchedule.date, '2026-06-04');
    assert.equal(movedSchedule.startTime, '11:00');
    assert.equal(notificationTarget, movedSchedule);
    assert.equal(pruneCalled, false, 'moving an individually scheduled track must not prune its old schedule section');
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
    feature.deleteEditingItem();

    assert.deepEqual(refs.itemPool.value, [], 'deleting an ordinary pool edit item must remove the pool item');
    assert.deepEqual(refs.scheduledTasks.value, [], 'deleting a pool edit item must remove scheduled copies');
    assert.equal(refs.showEditor.value, false, 'Delete should close the Edit Event modal after deleting');
    assert.equal(cleanupCalled, true, 'pool deletion should prune empty schedules');
    assert.equal(historyPushed, true, 'pool deletion should push history once');
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
    assert.equal(hapticType, 'Success', 'saving Project Info should trigger success haptic feedback');
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
    };
    const state = {
        settings: {
            studios: [{ id: 'S1', name: 'Old Studio' }],
            engineers: [{ id: 'E1', name: 'Old Engineer' }],
            operators: [],
            assistants: [],
        },
    };
    let historyCount = 0;
    let hapticType = null;

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
    assert.equal(hapticType, 'Success', 'saving Rec Info should trigger success haptic feedback');

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
}

console.log(`modularization smoke passed (${requiredFiles.length} JS modules checked)`);
