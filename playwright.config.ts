import { defineConfig, devices } from '@playwright/test';
import { e2eWorkers, GPU, GPU_ARGS } from './tools/gate/render';

// E2E runs against the production build (`vite preview`) so tests see what ships.
const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

/**
 * Every page starts with the classic unit look stored (PLAN 7.174h, ADR-777): the pixel specs
 * measure the sprites, markers and counters they were written for, while countryballs are the
 * game's default. A spec of the balls stores 'balls' itself; one of the default clears this.
 */
export const CLASSIC_PIN = {
  cookies: [],
  origins: [{ origin: BASE_URL, localStorage: [{ name: 'warsim.unitLook', value: 'classic' }] }],
};

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results',
  fullyParallel: true,
  // On the GPU where there is one (ADR-1029, `tools/gate/render.ts`): 8 workers. On SwiftShader
  // (CPU) more workers starve each other into timeouts: half the cores, at most 4; on a 4-core
  // machine 4 workers timed three UI specs out in every gate run (2026-10-03, PLAN 1.42f), and 2 do not.
  workers: e2eWorkers(),
  // Assertion polls wait up to 15 s (default 5 s): pages share the CPU with SwiftShader rendering
  // in the other workers (5–30× the solo time, see `perf` below). Assertions are unchanged; only
  // how long a poll may wait. Raised in PLAN 1.37a when an external process held 2.5 cores and
  // UI-command polls missed the 5 s window run after run while passing alone.
  expect: { timeout: 15_000 },
  forbidOnly: !!process.env['CI'],
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    storageState: CLASSIC_PIN,
    trace: 'retain-on-failure',
  },
  projects: [
    // The pages on the GPU (ADR-1029); SwiftShader where the machine has none.
    { name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: { args: GPU ? GPU_ARGS : [] } }, testIgnore: /\.perf\.spec\.ts$/, grepInvert: /@swiftshader/ },
    // The tests whose measure is SwiftShader's picture (tag `@swiftshader`), on SwiftShader always.
    { name: 'swiftshader', use: { ...devices['Desktop Chrome'] }, testIgnore: /\.perf\.spec\.ts$/, grep: /@swiftshader/ },
    // Timing-budget specs run only after the parallel suite has finished, so SwiftShader pages in
    // other workers cannot starve them (contention measured at 5–30× the solo time). On SwiftShader:
    // their budgets were set there.
    { name: 'perf', use: { ...devices['Desktop Chrome'] }, testMatch: /\.perf\.spec\.ts$/, dependencies: ['chromium', 'swiftshader'] },
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort --host 127.0.0.1`,
    url: BASE_URL,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
