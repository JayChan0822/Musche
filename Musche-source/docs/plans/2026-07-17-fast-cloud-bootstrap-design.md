# Fast Cloud Bootstrap Design

## Goal

Remove the two application-owned 404 errors and make returning signed-in users see their last successful cloud snapshot immediately instead of waiting for Supabase startup requests.

## Approaches Considered

### Runtime configuration

1. Move local secrets to `.env.local` and remove `config.local.js`. This is conventional, but it forces an unnecessary local migration.
2. Ship an empty `public/config.local.js`. This removes the 404 but keeps an unnecessary production request.
3. Inject `config.local.js` only from the Vite development server. This preserves the current local workflow and removes the production request. This is the selected approach.

### Cloud startup

1. Keep blocking on Supabase. This preserves current semantics but leaves the 30-second blank state.
2. Restore a cache and wait indefinitely for Supabase. Data appears quickly, but startup and autosave suppression can remain stuck.
3. Restore a cache synchronously and place an eight-second deadline around session recovery and cloud reads. Successful cloud reads replace and refresh the cache; timeouts keep the last snapshot. This is the selected approach.

## Data Flow

The browser stores one `musche_cloud_cache_v1` object containing a minimal user profile, the cloud data version, and the last successfully loaded or saved `pool`, `tasks`, and `settings` content.

At startup, the auth feature applies this cache before its first network await. It then restores the Supabase session with a deadline. A valid matching session refreshes cloud data with the same deadline. A different user clears the cached snapshot before loading that user's cloud data. A confirmed guest session clears the cloud cache and follows the existing guest-local-data path.

Successful cloud loads and saves refresh the cache. Logout and factory reset remove it. Cache parsing and storage failures are non-fatal.

## Error Handling

Startup timeouts retain a matching cache without adding console noise. Without a usable cache, the app falls back to its existing local/default data. Manual login and manual sync continue reporting errors through their existing UI.

The Mixpanel SSL error is outside the application bundle and is not suppressed in application code.

## Static Assets

The favicon is copied to `app/public/icon/icon.png`, which Vite publishes as `/icon/icon.png`. The development-only runtime config script is injected by a Vite plugin and is absent from production HTML.

## Testing

Behavior tests cover cache restore, cache persistence, timeout fallback, logout cleanup, and account mismatch. Boundary tests cover production runtime-config removal and favicon publication. The full Node test suite, production build, and browser smoke test verify integration.
