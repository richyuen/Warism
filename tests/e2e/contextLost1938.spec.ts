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
  // The save's tick is on the HUD before the boot has finished: the camera is set after one more round trip to the
  // worker (`showWorld`), in the same task that takes the kept view out of sessionStorage. Read it after that.
  await page.waitForFunction(() => sessionStorage.getItem('warism.viewAfterLoss') === null, null, { timeout: 30_000 });
  const after = await page.evaluate(() => ({ lost: window.__warsim!.view!.contextLost, cam: { ...window.__warsim!.view!.controller.cam } }));
  expect(after.lost).toBe(false);
  expect(after.cam.cx).toBeCloseTo(cam.cx, 3);
  expect(after.cam.cy).toBeCloseTo(cam.cy, 3);
  expect(after.cam.scale).toBeCloseTo(cam.scale, 6);
});

// ADR-1153: what was open comes back too: the selected nation, the formation's panel, the played nation's selected
// formations, the top-centre panel and the God tab.
test('a lost WebGL context keeps the selection, the panels and the God tab through the boot', async ({ page }) => {
  test.setTimeout(150_000);
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.hud.worker.value ?? null) !== null, null, { timeout: 60_000 });
  await page.evaluate(() => window.__warsim!.sim.step(24));
  await page.waitForFunction(() => window.__warsim!.hud.tick.value === 24 && (window.__warsim!.hud.stats.value?.nations.length ?? 0) > 0, null, { timeout: 30_000 });
  // Play a nation with formations, select two of them, open one's panel, History and God Mode.
  const before = await page.evaluate(() => {
    const { view, hud, player } = window.__warsim!;
    const nation = hud.stats.value!.nations.map((n) => n.id).find((id) => view!.formationsOf(id).length >= 2)!;
    player!.take(nation);
    return nation;
  });
  expect(before).toBeGreaterThan(0);
  await page.waitForFunction((n) => window.__warsim!.player!.nation.value === n, before, { timeout: 30_000 });
  const kept = await page.evaluate((nation) => {
    const { view, hud, player } = window.__warsim!;
    const ids = view!.formationsOf(nation).slice(0, 2);
    player!.boxSelect(ids, false);
    hud.onSelectNation(nation);
    hud.selectFormation(ids[0]!);
    hud.toggleHistory();
    hud.toggleGod();
    return { nation, ids: [...view!.selectedFormations].sort((a, b) => a - b), formation: ids[0]! };
  }, before);
  expect(kept.ids.length).toBeGreaterThan(0);
  await page.evaluate(() => {
    const gl = document.querySelector('canvas')!.getContext('webgl2')!;
    gl.getExtension('WEBGL_lose_context')!.loseContext();
  });
  await page.waitForURL(/continue=1/, { timeout: 30_000 });
  await page.waitForFunction(() => window.__warsim?.hud.tick.value === 24, null, { timeout: 60_000 });
  await page.waitForFunction((n) => window.__warsim!.player?.nation.value === n && window.__warsim!.player.selectedCount.value > 0, kept.nation, { timeout: 30_000 });
  const after = await page.evaluate(() => {
    const { view, hud } = window.__warsim!;
    return {
      nation: hud.selected.value,
      formation: hud.formation.value,
      ids: [...view!.selectedFormations].sort((a, b) => a - b),
      history: hud.showHistory.value,
      god: hud.godMode.value,
    };
  });
  expect(after).toEqual({ nation: kept.nation, formation: kept.formation, ids: kept.ids, history: true, god: true });
});
