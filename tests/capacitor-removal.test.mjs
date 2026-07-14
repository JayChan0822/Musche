import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const rootDir = resolve(new URL('..', import.meta.url).pathname);
const readProjectFile = (path) => readFileSync(resolve(rootDir, path), 'utf8');

function collectJavaScriptFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return collectJavaScriptFiles(path);
    return entry.isFile() && entry.name.endsWith('.js') ? [path] : [];
  });
}

test('repository has no iOS or Capacitor integration', () => {
  assert.equal(existsSync(resolve(rootDir, 'ios')), false, 'the native iOS project should be removed');
  assert.equal(existsSync(resolve(rootDir, 'capacitor.config.json')), false, 'the Capacitor config should be removed');

  const packageJson = JSON.parse(readProjectFile('package.json'));
  for (const dependencyName of [
    '@capacitor/cli',
    '@capacitor/core',
    '@capacitor/haptics',
    '@capacitor/ios',
    '@capacitor/local-notifications',
  ]) {
    assert.equal(packageJson.dependencies?.[dependencyName], undefined, `${dependencyName} should be removed from dependencies`);
    assert.equal(packageJson.devDependencies?.[dependencyName], undefined, `${dependencyName} should be removed from devDependencies`);
  }

  for (const modulePath of [
    'app/scripts/features/app-click-haptics.js',
    'app/scripts/features/notifications.js',
    'app/scripts/services/device-service.js',
    'app/scripts/services/haptics-service.js',
    'app/scripts/services/notifications-feature-loader.js',
  ]) {
    assert.equal(existsSync(resolve(rootDir, modulePath)), false, `${modulePath} should be removed`);
  }

  const appScriptsDir = resolve(rootDir, 'app/scripts');
  assert.equal(statSync(appScriptsDir).isDirectory(), true);
  const appSource = collectJavaScriptFiles(appScriptsDir)
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');

  for (const removedSymbol of [
    'window.Capacitor',
    'deviceService',
    'triggerTouchHaptic',
    'updateTaskNotification',
    'scheduleReminder',
    'cancelNotification',
    'reminderMinutes',
  ]) {
    assert.equal(appSource.includes(removedSymbol), false, `${removedSymbol} should not remain in application code`);
  }

  const currentProjectDocs = [
    readProjectFile('README.md'),
    readProjectFile('CLAUDE.md'),
    packageJson.description || '',
  ].join('\n');
  assert.doesNotMatch(currentProjectDocs, /Capacitor|iOS 客户端|Capacitor iOS/);
});
