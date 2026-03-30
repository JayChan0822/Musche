import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const packageJsonPath = resolve(rootDir, 'package.json');
const indexHtmlPath = resolve(rootDir, 'app/index.html');

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const indexHtml = readFileSync(indexHtmlPath, 'utf8');

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
    packageJson.scripts?.test,
    'npm run verify:modularization && npm run verify:split-state',
    'npm test must run both the modularization smoke check and the split-state regression'
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

assert.ok(!/<style[\s>]/i.test(indexHtml), 'index.html should not contain an inline style block');

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
    'app/scripts/features/mobile-ui.js'
];

for (const relativePath of requiredFiles) {
    const absolutePath = resolve(rootDir, relativePath);
    assert.ok(existsSync(absolutePath), `${relativePath} must exist`);
    execFileSync(process.execPath, ['--check', absolutePath], { stdio: 'pipe' });
}

console.log(`modularization smoke passed (${requiredFiles.length} JS modules checked)`);
