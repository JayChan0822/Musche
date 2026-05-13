import { createClient } from '@supabase/supabase-js';

export function createSupabaseService({ url, key } = {}) {
  if (!url || !key) {
    const createConfigError = () => ({
      message: 'Supabase is not configured. Copy app/config.local.example.js to app/config.local.js and fill in supabaseUrl and supabaseKey.',
    });

    const rejectWithConfigError = async () => ({
      data: null,
      error: createConfigError(),
    });

    return {
      client: null,
      signInWithPassword: rejectWithConfigError,
      signUp: rejectWithConfigError,
      resetPasswordForEmail: rejectWithConfigError,
      updateUser: rejectWithConfigError,
      getUser: rejectWithConfigError,
      getSession: async () => ({
        data: { session: null },
        error: null,
      }),
      signOut: async () => ({
        error: null,
      }),
      uploadAvatar: rejectWithConfigError,
      getAvatarPublicUrl() {
        return {
          data: { publicUrl: null },
          error: createConfigError(),
        };
      },
      loadUserData: rejectWithConfigError,
      fetchUserDataVersion: rejectWithConfigError,
      saveUserData: rejectWithConfigError,
      deleteUserData: rejectWithConfigError,
    };
  }

  const client = createClient(url, key);

  return {
    client,
    signInWithPassword(credentials) {
      return client.auth.signInWithPassword(credentials);
    },
    signUp(credentials) {
      return client.auth.signUp(credentials);
    },
    resetPasswordForEmail(email, options) {
      return client.auth.resetPasswordForEmail(email, options);
    },
    updateUser(payload) {
      return client.auth.updateUser(payload);
    },
    getUser() {
      return client.auth.getUser();
    },
    getSession() {
      return client.auth.getSession();
    },
    signOut() {
      return client.auth.signOut();
    },
    uploadAvatar(filePath, file, options = {}) {
      return client.storage.from('avatars').upload(filePath, file, options);
    },
    getAvatarPublicUrl(filePath) {
      return client.storage.from('avatars').getPublicUrl(filePath);
    },
    loadUserData(userId) {
      return client.from('user_data').select('content, version').eq('user_id', userId).single();
    },
    fetchUserDataVersion(userId) {
      return client.from('user_data').select('version').eq('user_id', userId).single();
    },
    saveUserData(userId, content, version) {
      return client.from('user_data').upsert({
        user_id: userId,
        content,
        version,
      }, { onConflict: 'user_id' });
    },
    deleteUserData(userId) {
      return client.from('user_data').delete().eq('user_id', userId);
    },
  };
}
