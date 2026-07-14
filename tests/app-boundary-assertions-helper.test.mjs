import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertDataIoStateBoundary,
  assertImportDataStateBoundary,
  assertMetadataModalStateBoundary,
  assertSettingsStateBoundary,
  assertRootAppStateBoundary,
  assertTrackListStateBoundary,
  assertMidiManagerStateBoundary,
  assertAppRootTemplateSurface,
  assertRootShellStateBoundary,
  assertNoRootSetupReturnFields,
  assertNoAppImport,
  assertSharedLazyFeatureProxy,
  assertGroupedUtilityBoundary,
} from './helpers/app-boundary-assertions.mjs';

const helperSource = readFileSync(
  resolve(import.meta.dirname, 'helpers/app-boundary-assertions.mjs'),
  'utf8',
);
const modularizationSmokeSource = readFileSync(
  resolve(import.meta.dirname, 'modularization-smoke.mjs'),
  'utf8',
);

test('assertNoAppImport verifies app.js has no static or dynamic import for a module', () => {
  assertNoAppImport({
    modulePath: './features/mobile-slider-auto-hide.js',
    label: 'the unused mobile-slider-auto-hide feature',
  });
});

test('grouped utility boundary tests reuse the shared grouped utility assertion', () => {
  assert.equal(typeof assertGroupedUtilityBoundary, 'function');
  for (const fixtureName of [
    'time-utils-app-boundary.test.mjs',
    'format-utils-app-boundary.test.mjs',
    'id-utils-app-boundary.test.mjs',
    'split-state-utils-app-boundary.test.mjs',
  ]) {
    const fixture = readFileSync(resolve(import.meta.dirname, fixtureName), 'utf8');
    assert.match(
      fixture,
      /import \{[\s\S]*\bassertGroupedUtilityBoundary\b[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
      `${fixtureName} should import the shared grouped utility boundary helper`,
    );
    assert.match(
      fixture,
      /\bassertGroupedUtilityBoundary\(\{/,
      `${fixtureName} should delegate grouped utility checks to the shared helper`,
    );
  }
});

test('modularization smoke reuses the shared app script fixture path', () => {
  assert.match(
    modularizationSmokeSource,
    /import \{(?=[\s\S]*\bappScriptPath\b)(?=[\s\S]*\bappScript\b)[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import the app script fixture path from the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+appScriptPath\s*=\s*resolveFixturePath\(/,
    'modularization smoke should not keep a local app script fixture path',
  );
});

test('modularization smoke reuses the shared index.html fixture', () => {
  assert.match(
    modularizationSmokeSource,
    /import \{(?=[\s\S]*\bindexHtml\b)[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import the index.html fixture from the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+indexHtml\s*=\s*readFixture\(['"]app\/index\.html['"]\)/,
    'modularization smoke should not keep a local index.html fixture read',
  );
});

test('modularization smoke reuses the shared package.json fixture', () => {
  assert.match(
    modularizationSmokeSource,
    /import \{(?=[\s\S]*\bpackageJson\b)[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import the package.json fixture from the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+packageJson\s*=\s*JSON\.parse\(readFixture\(['"]package\.json['"]\)\)/,
    'modularization smoke should not keep a local package.json fixture read',
  );
});

test('modularization smoke reuses the shared boundary helper source fixture', () => {
  assert.match(
    modularizationSmokeSource,
    /import \{(?=[\s\S]*\bappBoundaryAssertions\b)[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import the boundary helper source fixture from the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+appBoundaryAssertions\s*=\s*readFixture\(['"]tests\/helpers\/app-boundary-assertions\.mjs['"]\)/,
    'modularization smoke should not keep a local boundary helper source fixture read',
  );
});

test('modularization smoke reuses the shared async root component fixture', () => {
  assert.match(
    modularizationSmokeSource,
    /import \{(?=[\s\S]*\basyncRootComponentPath\b)(?=[\s\S]*\basyncRootComponent\b)[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import the async root component fixture from the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+asyncRootComponentPath\s*=\s*resolveFixturePath\(/,
    'modularization smoke should not keep a local async root component fixture path',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+asyncRootComponent\s*=\s*readOptionalFixture\(asyncRootComponentPath\)/,
    'modularization smoke should not keep a local async root component fixture read',
  );
});

test('modularization smoke reuses shared Supabase service fixtures', () => {
  assert.match(
    modularizationSmokeSource,
    /import \{(?=[\s\S]*\bsupabaseServicePath\b)(?=[\s\S]*\bsupabaseServiceModule\b)(?=[\s\S]*\bconfiguredSupabaseServicePath\b)(?=[\s\S]*\bconfiguredSupabaseServiceModule\b)[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import Supabase service fixtures from the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+supabaseServicePath\s*=\s*resolveFixturePath\(/,
    'modularization smoke should not keep a local Supabase service fixture path',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+configuredSupabaseServicePath\s*=\s*resolveFixturePath\(/,
    'modularization smoke should not keep a local configured Supabase service fixture path',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+supabaseServiceModule\s*=\s*readFileSync\(supabaseServicePath,\s*['"]utf8['"]\)/,
    'modularization smoke should not keep a local Supabase service fixture read',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+configuredSupabaseServiceModule\s*=\s*readOptionalFixture\(configuredSupabaseServicePath\)/,
    'modularization smoke should not keep a local configured Supabase service fixture read',
  );
});

test('modularization smoke reuses the shared Vite config fixture', () => {
  assert.match(
    modularizationSmokeSource,
    /import \{(?=[\s\S]*\bviteConfigPath\b)(?=[\s\S]*\bviteConfig\b)[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import the Vite config fixture from the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+viteConfigPath\s*=\s*resolveFixturePath\(/,
    'modularization smoke should not keep a local Vite config fixture path',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+viteConfig\s*=\s*readFileSync\(viteConfigPath,\s*['"]utf8['"]\)/,
    'modularization smoke should not keep a local Vite config fixture read',
  );
});

test('assertAppRootTemplateSurface verifies index.html exposes only root shell contexts', () => {
  assertAppRootTemplateSurface();
});

test('assertNoRootSetupReturnFields verifies grouped fields stay behind shell contexts', () => {
  assertNoRootSetupReturnFields({
    fields: ['appHeader', 'appSidebar', 'appMainContent', 'appMobileControls'],
    messageForField: (field) => `root setup should expose ${field} through appRootShell`,
  });
});

test('modularization smoke reuses shared root shell component fixtures', () => {
  assert.match(
    modularizationSmokeSource,
    /import \{(?=[\s\S]*\bappRootShellComponentPath\b)(?=[\s\S]*\bappRootShellComponent\b)(?=[\s\S]*\bappMainContentComponent\b)[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import root shell component fixtures from the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+appRootShellComponentPath\s*=\s*resolveFixturePath\(/,
    'modularization smoke should not keep local root shell component fixture paths',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+appRootShellComponent\s*=\s*readOptionalFixture\(/,
    'modularization smoke should not keep local root shell component fixture reads',
  );
});

test('modularization smoke reuses the shared static root component registry path', () => {
  assert.match(
    modularizationSmokeSource,
    /import \{(?=[\s\S]*\bappRootStaticComponentsPath\b)(?=[\s\S]*\bappRootStaticComponents\b)[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import the static root component registry path from the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+appRootStaticComponentsPath\s*=\s*resolveFixturePath\(/,
    'modularization smoke should not keep a local static root component registry path',
  );
});

test('modularization smoke reuses shared standalone and mobile component fixtures', () => {
  assert.match(
    modularizationSmokeSource,
    /import \{(?=[\s\S]*\bappStandaloneOverlaysShellComponentPath\b)(?=[\s\S]*\bappSettingsModalComponent\b)(?=[\s\S]*\bappExportModalComponent\b)[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import standalone, mobile, and export component fixtures from the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+appStandaloneOverlaysShellComponentPath\s*=\s*resolveFixturePath\(/,
    'modularization smoke should not keep local standalone component fixture paths',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+appStandaloneOverlaysShellComponent\s*=\s*readOptionalFixture\(/,
    'modularization smoke should not keep local standalone component fixture reads',
  );
});

test('modularization smoke reuses shared import metadata and task modal fixtures', () => {
  assert.match(
    modularizationSmokeSource,
    /import \{(?=[\s\S]*\bappMidiCsvImportModalsShellComponentPath\b)(?=[\s\S]*\bappMetadataInfoModalComponents\b)(?=[\s\S]*\bappEditModalComponent\b)[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import import, metadata, and task modal fixtures from the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+appMidiCsvImportModalsShellComponentPath\s*=\s*resolveFixturePath\(/,
    'modularization smoke should not keep local import modal fixture paths',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+appMidiCsvImportModalsShellComponent\s*=\s*readOptionalFixture\(/,
    'modularization smoke should not keep local import modal fixture reads',
  );
});

test('modularization smoke reuses shared remaining modal component fixtures', () => {
  assert.match(
    modularizationSmokeSource,
    /import \{(?=[\s\S]*\bappAccountModalsShellComponentPath\b)(?=[\s\S]*\bappUniversalModalComponents\b)(?=[\s\S]*\bappSplitModalComponent\b)[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import the remaining modal component fixtures from the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+appAccountModalsShellComponentPath\s*=\s*resolveFixturePath\(/,
    'modularization smoke should not keep local remaining modal fixture paths',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+appAccountModalsShellComponent\s*=\s*readOptionalFixture\(/,
    'modularization smoke should not keep local remaining modal fixture reads',
  );
});

test('modularization smoke reuses shared service loader fixtures', () => {
  assert.match(
    modularizationSmokeSource,
    /import \{(?=[\s\S]*\bdataIoFeatureLoaderPath\b)(?=[\s\S]*\bdataIoFeatureLoaderModule\b)(?=[\s\S]*\bscheduleDeletionFeatureLoaderModule\b)[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import service loader fixtures from the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+dataIoFeatureLoaderPath\s*=\s*resolveFixturePath\(/,
    'modularization smoke should not keep local service loader fixture paths',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+dataIoFeatureLoaderModule\s*=\s*readOptionalFixture\(/,
    'modularization smoke should not keep local service loader fixture reads',
  );
});

test('modularization smoke reuses shared feature registrar fixtures', () => {
  assert.match(
    modularizationSmokeSource,
    /import \{(?=[\s\S]*\bappRuntimeFeatureRegistrarPath\b)(?=[\s\S]*\bsearchFeatureRegistrarModule\b)(?=[\s\S]*\bsettingsSyncFeatureRegistrarModule\b)[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import feature registrar fixtures from the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+appRuntimeFeatureRegistrarPath\s*=\s*resolveFixturePath\(/,
    'modularization smoke should not keep local feature registrar fixture paths',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+appRuntimeFeatureRegistrarModule\s*=\s*readOptionalFixture\(/,
    'modularization smoke should not keep local feature registrar fixture reads',
  );
});

test('modularization smoke reuses shared state fixtures', () => {
  assert.match(
    modularizationSmokeSource,
    /import \{(?=[\s\S]*\bconfirmModalShellStateModule\b)(?=[\s\S]*\bmobileControlsShellStateModule\b)(?=[\s\S]*\bsplitModalShellStateModule\b)[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import state fixtures from the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+settingsStatePath\s*=\s*resolveFixturePath\(/,
    'modularization smoke should not keep local state fixture paths',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+settingsStateModule\s*=\s*readOptionalFixture\(/,
    'modularization smoke should not keep local state fixture reads',
  );
});

test('modularization smoke reuses the shared root shell state boundary helper', () => {
  assert.equal(typeof assertRootShellStateBoundary, 'function');
  assert.match(
    modularizationSmokeSource,
    /import \{[\s\S]*\bassertRootShellStateBoundary\b[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import the root shell state boundary assertion from the shared helper',
  );
  assert.match(
    modularizationSmokeSource,
    /assertRootShellStateBoundary\(\{[\s\S]*\bcreateRootShellState\b[\s\S]*\bvueReactive\b[\s\S]*\}\);/,
    'modularization smoke should delegate root shell state assertions to the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+rootShellInputs\s*=\s*\{/,
    'modularization smoke should not keep inline root shell state harness setup',
  );
});

test('modularization smoke reuses the shared data I/O state boundary helper', () => {
  assert.equal(typeof assertDataIoStateBoundary, 'function');
  assert.match(
    modularizationSmokeSource,
    /import \{[\s\S]*\bassertDataIoStateBoundary\b[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import the data I/O state boundary assertion from the shared helper',
  );
  assert.match(
    modularizationSmokeSource,
    /assertDataIoStateBoundary\(\{[\s\S]*\bcreateDataIoState\b[\s\S]*\bvueRef\b[\s\S]*\bvueReactive\b[\s\S]*\bvueShallowRef\b[\s\S]*\}\);/,
    'modularization smoke should delegate data I/O state assertions to the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+dataIoStateA\s*=\s*createDataIoState\(/,
    'modularization smoke should not keep inline data I/O state harness setup',
  );
});

test('modularization smoke reuses the shared import-data state boundary helper', () => {
  assert.equal(typeof assertImportDataStateBoundary, 'function');
  assert.match(
    modularizationSmokeSource,
    /import \{[\s\S]*\bassertImportDataStateBoundary\b[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import the import-data state boundary assertion from the shared helper',
  );
  assert.match(
    modularizationSmokeSource,
    /assertImportDataStateBoundary\(\{[\s\S]*\bcreateImportDataState\b[\s\S]*\bvueComputed\b[\s\S]*\bvueReactive\b[\s\S]*\}\);/,
    'modularization smoke should delegate import-data state assertions to the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+importDataStateA\s*=\s*createImportDataState\(/,
    'modularization smoke should not keep inline import-data state harness setup',
  );
});

test('modularization smoke reuses the shared metadata modal state boundary helper', () => {
  assert.equal(typeof assertMetadataModalStateBoundary, 'function');
  assert.match(
    modularizationSmokeSource,
    /import \{[\s\S]*\bassertMetadataModalStateBoundary\b[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import the metadata modal state boundary assertion from the shared helper',
  );
  assert.match(
    modularizationSmokeSource,
    /assertMetadataModalStateBoundary\(\{[\s\S]*\bcreateMetadataModalState\b[\s\S]*\bvueRef\b[\s\S]*\bvueReactive\b[\s\S]*\bvueShallowRef\b[\s\S]*\}\);/,
    'modularization smoke should delegate metadata modal state assertions to the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+metadataModalStateA\s*=\s*createMetadataModalState\(/,
    'modularization smoke should not keep inline metadata modal state harness setup',
  );
});

test('modularization smoke reuses the shared settings state boundary helper', () => {
  assert.equal(typeof assertSettingsStateBoundary, 'function');
  assert.match(
    modularizationSmokeSource,
    /import \{[\s\S]*\bassertSettingsStateBoundary\b[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import the settings state boundary assertion from the shared helper',
  );
  assert.match(
    modularizationSmokeSource,
    /assertSettingsStateBoundary\(\{[\s\S]*\bcreateDefaultSettings\b[\s\S]*\bcreateSettingsState\b[\s\S]*\bvueReactive\b[\s\S]*\}\);/,
    'modularization smoke should delegate settings state assertions to the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+settingsStateA\s*=\s*createSettingsState\(/,
    'modularization smoke should not keep inline settings state harness setup',
  );
});

test('modularization smoke reuses the shared root app state boundary helper', () => {
  assert.equal(typeof assertRootAppStateBoundary, 'function');
  assert.match(
    modularizationSmokeSource,
    /import \{[\s\S]*\bassertRootAppStateBoundary\b[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import the root app state boundary assertion from the shared helper',
  );
  assert.match(
    modularizationSmokeSource,
    /assertRootAppStateBoundary\(\{[\s\S]*\bcreateAppState\b[\s\S]*\bvueRef\b[\s\S]*\bvueReactive\b[\s\S]*\}\);/,
    'modularization smoke should delegate root app state assertions to the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+appStateA\s*=\s*createAppState\(/,
    'modularization smoke should not keep inline root app state harness setup',
  );
});

test('modularization smoke reuses the shared Track List state boundary helper', () => {
  assert.equal(typeof assertTrackListStateBoundary, 'function');
  assert.match(
    modularizationSmokeSource,
    /import \{[\s\S]*\bassertTrackListStateBoundary\b[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import the Track List state boundary assertion from the shared helper',
  );
  assert.match(
    modularizationSmokeSource,
    /assertTrackListStateBoundary\(\{[\s\S]*\bcreateTrackListState\b[\s\S]*\bvueRef\b[\s\S]*\}\);/,
    'modularization smoke should delegate Track List state assertions to the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+trackListStateA\s*=\s*createTrackListState\(/,
    'modularization smoke should not keep inline Track List state harness setup',
  );
});

test('modularization smoke reuses the shared MIDI Manager state boundary helper', () => {
  assert.equal(typeof assertMidiManagerStateBoundary, 'function');
  assert.match(
    modularizationSmokeSource,
    /import \{[\s\S]*\bassertMidiManagerStateBoundary\b[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import the MIDI Manager state boundary assertion from the shared helper',
  );
  assert.match(
    modularizationSmokeSource,
    /assertMidiManagerStateBoundary\(\{[\s\S]*\bcreateMidiManagerState\b[\s\S]*\bvueReactive\b[\s\S]*\bvueComputed\b[\s\S]*\}\);/,
    'modularization smoke should delegate MIDI Manager state assertions to the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+midiManagerStateA\s*=\s*createMidiManagerState\(/,
    'modularization smoke should not keep inline MIDI Manager state harness setup',
  );
});

test('modularization smoke reuses shared feature fixtures', () => {
  assert.match(
    modularizationSmokeSource,
    /import \{(?=[\s\S]*\bscheduleFeature\b)(?=[\s\S]*\bimportDataFeaturePath\b)(?=[\s\S]*\bselectionFeature\b)[\s\S]*\} from '\.\/helpers\/app-boundary-assertions\.mjs';/,
    'modularization smoke should import feature fixtures from the shared helper',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+scheduleFeature\s*=\s*readFileSync\(resolveFixturePath\(/,
    'modularization smoke should not keep local fixed feature fixture reads',
  );
  assert.doesNotMatch(
    modularizationSmokeSource,
    /const\s+importDataFeaturePath\s*=\s*resolveFixturePath\(/,
    'modularization smoke should not keep local optional feature fixture paths',
  );
});

test('root component parser only accepts createAppRootOptions() as the app.js registration surface', () => {
  assert.doesNotMatch(
    helperSource,
    /components:\s*appRootStaticComponents\b/,
    'root component parser should not accept app.js directly mounting appRootStaticComponents',
  );
  assert.doesNotMatch(
    helperSource,
    /componentsIndex\s*=\s*source\.indexOf\('components: \{'\)/,
    'root component parser should not accept inline root component registration in app.js',
  );
});

test('assertSharedLazyFeatureProxy verifies loader-backed proxy methods and rejects hand-rolled bridges', () => {
  assertSharedLazyFeatureProxy({
    proxyName: 'tourFeatureProxy',
    wireName: 'wireTourFeature',
    loaderName: 'loadTourFeature',
    appConsumerName: 'wireTourFeature',
    methods: ['startTour', 'mountTourAutostart'],
    forbiddenPattern: /tourFeaturePromise|getTourFeature/,
    label: 'tour feature',
  });
});

test('assertSharedLazyFeatureProxy accepts grouped proxy method declarations', () => {
  assertSharedLazyFeatureProxy({
    proxyName: 'settingsFeatureProxy',
    wireName: 'wireSettingsFeature',
    loaderName: 'loadSettingsFeature',
    appConsumerName: 'wireSettingsFeature',
    methods: ['onSettingsItemDragStart', 'clearSettingsList', 'handleItemRename'],
    forbiddenPattern: /settingsFeaturePromise|getSettingsFeature|withSettingsFeature/,
    label: 'settings feature',
  });
});
