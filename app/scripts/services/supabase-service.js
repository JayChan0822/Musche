export function createSupabaseService({
  url,
  key,
  createClientLoader = async () => {
    const module = await import('@supabase/supabase-js');
    return module.createClient;
  },
} = {}) {
  if (!url || !key) {
    const createConfigError = () => ({
      message: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY for hosted builds, or fill app/config.local.js for local-only development.',
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

  let clientPromise = null;
  const getClient = () => {
    if (!clientPromise) {
      clientPromise = createClientLoader().then((createClient) => createClient(url, key));
    }
    return clientPromise;
  };
  const withClient = async (callback) => callback(await getClient());
  const publicUrlBase = url.replace(/\/+$/, '');

  return {
    client: null,
    signInWithPassword(credentials) {
      return withClient((client) => client.auth.signInWithPassword(credentials));
    },
    signUp(credentials) {
      return withClient((client) => client.auth.signUp(credentials));
    },
    resetPasswordForEmail(email, options) {
      return withClient((client) => client.auth.resetPasswordForEmail(email, options));
    },
    updateUser(payload) {
      return withClient((client) => client.auth.updateUser(payload));
    },
    getUser() {
      return withClient((client) => client.auth.getUser());
    },
    getSession() {
      return withClient((client) => client.auth.getSession());
    },
    signOut() {
      return withClient((client) => client.auth.signOut());
    },
    uploadAvatar(filePath, file, options = {}) {
      return withClient((client) => client.storage.from('avatars').upload(filePath, file, options));
    },
    getAvatarPublicUrl(filePath) {
      return {
        data: { publicUrl: `${publicUrlBase}/storage/v1/object/public/avatars/${filePath}` },
        error: null,
      };
    },
    loadUserData(userId) {
      return withClient((client) => client.from('user_data').select('content, version').eq('user_id', userId).single());
    },
    fetchUserDataVersion(userId) {
      return withClient((client) => client.from('user_data').select('version').eq('user_id', userId).single());
    },
    saveUserData(userId, content, version) {
      return withClient((client) => client.from('user_data').upsert({
        user_id: userId,
        content,
        version,
      }, { onConflict: 'user_id' }));
    },
    deleteUserData(userId) {
      return withClient((client) => client.from('user_data').delete().eq('user_id', userId));
    },
  };
}
