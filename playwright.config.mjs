import { defineConfig } from '@playwright/test';

// E2E 跑在 vite preview（app/dist）上：dist 不含 config.local.js，
// 应用以无 Supabase 的本地模式启动，避免测试触碰真实数据。
export default defineConfig({
    testDir: 'tests/e2e',
    timeout: 30_000,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        baseURL: 'http://127.0.0.1:4517',
        viewport: { width: 1400, height: 900 },
    },
    webServer: {
        command: 'npm run build && npm run preview -- --port 4517 --strictPort',
        url: 'http://127.0.0.1:4517',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
