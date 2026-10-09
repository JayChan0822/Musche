import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertNoAppRegistration,
  assertNoStaticAppImport,
} from './helpers/app-boundary-assertions.mjs';

const rootDir = resolve(new URL('..', import.meta.url).pathname);

test('app bootstrap does not register the unused mobile slider auto-hide feature', () => {
  assertNoStaticAppImport({
    modulePath: './features/mobile-slider-auto-hide.js',
    label: 'the unused mobile-slider-auto-hide feature',
  });
  assertNoStaticAppImport({
    modulePath: './features/mobile-slider-auto-hide-shell.js',
    label: 'the unused mobile-slider-auto-hide shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerMobileSliderAutoHide(?:Shell)?Feature\(/,
    label: 'mobile-slider-auto-hide until there is a caller for it',
  });
  assert.equal(
    existsSync(resolve(rootDir, 'app/scripts/features/mobile-slider-auto-hide.js')),
    false,
    'unused mobile-slider-auto-hide feature file should not remain without a caller',
  );
  assert.equal(
    existsSync(resolve(rootDir, 'app/scripts/features/mobile-slider-auto-hide-shell.js')),
    false,
    'unused mobile-slider-auto-hide shell file should not remain without a caller',
  );
});
