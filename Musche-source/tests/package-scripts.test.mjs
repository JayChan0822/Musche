import test from 'node:test';
import {
  assertPackageDeclaresModuleType,
  assertPackageTestScriptUsesGlob,
} from './helpers/app-boundary-assertions.mjs';

test('npm test discovers every top-level .test.mjs file through a glob', () => {
  assertPackageTestScriptUsesGlob();
});

test('package declares ESM mode for app and test modules', () => {
  assertPackageDeclaresModuleType();
});
