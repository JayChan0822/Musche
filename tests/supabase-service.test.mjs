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

test('createSupabaseService lazy-loads the Supabase client only when cloud APIs are used', async () => {
  const calls = [];
  const fakeClient = {
    auth: {
      getSession: async () => ({ data: { session: { user: { id: 'USER_1' } } }, error: null }),
      signOut: async () => ({ error: null }),
    },
    storage: {
      from: () => {
        throw new Error('storage client should not be needed for public URL generation');
      },
    },
    from: () => {
      throw new Error('table client was not expected in this test');
    },
  };
  const service = createSupabaseService({
    url: 'https://example.supabase.co/',
    key: 'publishable-key',
    createClientLoader: async () => {
      calls.push('load');
      return (url, key) => {
        calls.push(['create', url, key]);
        return fakeClient;
      };
    },
  });

  assert.deepEqual(calls, [], 'constructing the service must not load @supabase/supabase-js');
  assert.deepEqual(
    service.getAvatarPublicUrl('avatars/user.png'),
    { data: { publicUrl: 'https://example.supabase.co/storage/v1/object/public/avatars/avatars/user.png' }, error: null },
    'public avatar URLs should remain synchronously available without loading the Supabase client',
  );
  assert.deepEqual(calls, [], 'public URL generation must not load the Supabase client');

  const session = await service.getSession();
  assert.equal(session.data.session.user.id, 'USER_1');
  assert.deepEqual(calls, ['load', ['create', 'https://example.supabase.co/', 'publishable-key']]);

  await service.signOut();
  assert.deepEqual(calls, ['load', ['create', 'https://example.supabase.co/', 'publishable-key']], 'subsequent calls must reuse the lazy client');
});
