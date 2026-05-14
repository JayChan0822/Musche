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
assert.doesNotMatch(
    indexHtml,
    /<script src="\.\/config\.local\.js"><\/script>/,
    'index.html should not hard-load config.local.js because hosted builds must rely on Vite environment variables'
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

assert.match(
    indexHtml,
    /class="desktop-search-shell hidden sm:flex items-center relative[\s\S]*fa-magnifying-glass absolute left-3\.5[\s\S]*class="desktop-search-input glass-input h-9 pr-8/,
    'desktop search input must use dedicated classes so the icon and placeholder text spacing can be controlled independently of shared glass-input styles'
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
    'scripts/supabase-keepalive.mjs'
];

for (const relativePath of requiredFiles) {
    const absolutePath = resolve(rootDir, relativePath);
    assert.ok(existsSync(absolutePath), `${relativePath} must exist`);
    execFileSync(process.execPath, ['--check', absolutePath], { stdio: 'pipe' });
}

console.log(`modularization smoke passed (${requiredFiles.length} JS modules checked)`);
