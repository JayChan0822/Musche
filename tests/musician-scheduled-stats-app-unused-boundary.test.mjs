import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertNoAppRegistration,
  assertNoStaticAppImport,
} from './helpers/app-boundary-assertions.mjs';

const rootDir = resolve(new URL('..', import.meta.url).pathname);

test('app bootstrap does not register unused musician scheduled stats', () => {
  assertNoStaticAppImport({
    modulePath: './features/musician-scheduled-stats.js',
    label: 'the unused musician-scheduled-stats feature',
  });
  assertNoStaticAppImport({
    modulePath: './features/musician-scheduled-stats-shell.js',
    label: 'the unused musician-scheduled-stats shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerMusicianScheduledStats(?:Shell)?Feature\(/,
    label: 'musician-scheduled-stats until there is a component consumer',
  });
  assert.equal(
    existsSync(resolve(rootDir, 'app/scripts/features/musician-scheduled-stats.js')),
    false,
    'unused musician-scheduled-stats feature file should not remain without a caller',
  );
  assert.equal(
    existsSync(resolve(rootDir, 'app/scripts/features/musician-scheduled-stats-shell.js')),
    false,
    'unused musician-scheduled-stats shell file should not remain without a caller',
  );
});
