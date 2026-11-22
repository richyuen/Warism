import { expect, test } from '@playwright/test';
import type {} from '../../src/app/testApi';

// A lost WebGL context (iOS Safari takes it under memory pressure): the map froze while its names went on moving.
// The game saves, boots again from the save, and comes back at the view the player had.

test('a lost WebGL context saves, boots again from the save, at the same view', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.hud.worker.value ?? null) !== null, null, { timeout: 60_000 });
  await page.evaluate(() => window.__warsim!.sim.step(24));
  await page.waitForFunction(() => window.__warsim!.hud.tick.value === 24, null, { timeout: 30_000 });
  const cam = await page.evaluate(() => {
    const c = window.__warsim!.view!.controller;
    c.set({ ...c.cam, cx: c.cam.cx + 40, scale: c.cam.scale * 2 });
    return { ...c.cam };
  });
  await page.evaluate(() => {
    const gl = document.querySelector('canvas')!.getContext('webgl2')!;
    gl.getExtension('WEBGL_lose_context')!.loseContext();
  });
  await page.waitForURL(/continue=1/, { timeout: 30_000 });
  await page.waitForFunction(() => window.__warsim?.hud.tick.value === 24, null, { timeout: 60_000 });
  const after = await page.evaluate(() => ({ lost: window.__warsim!.view!.contextLost, cam: { ...window.__warsim!.view!.controller.cam } }));
  expect(after.lost).toBe(false);
  expect(after.cam.cx).toBeCloseTo(cam.cx, 3);
  expect(after.cam.cy).toBeCloseTo(cam.cy, 3);
  expect(after.cam.scale).toBeCloseTo(cam.scale, 6);
});
