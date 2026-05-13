import assert from 'node:assert/strict';
import test from 'node:test';

import { createSupabaseService } from '../app/scripts/services/supabase-service.js';

test('createSupabaseService stays boot-safe when config is missing', async () => {
  const service = createSupabaseService({ url: '', key: '' });

  const sessionResult = await service.getSession();
  assert.deepEqual(sessionResult, { data: { session: null }, error: null });

  const loginResult = await service.signInWithPassword({
    email: 'test@example.com',
    password: 'secret',
  });
  assert.equal(loginResult.data, null);
  assert.match(loginResult.error.message, /Supabase is not configured/i);

  const saveResult = await service.saveUserData('user-1', {}, 1);
  assert.equal(saveResult.data, null);
  assert.match(saveResult.error.message, /Supabase is not configured/i);
});
