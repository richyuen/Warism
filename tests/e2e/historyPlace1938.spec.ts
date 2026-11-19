import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { EventKind } from '../../src/shared/events';
import { kindName } from '../../src/shared/history';
import { NATIONS_1938 } from '../../src/sim/scenario1938';

// ROADMAP R141 AT (critic run 75's small things: "a row of History cannot be clicked to its place"; the ticker's rows
// can): every History kind with a place (a battle, an annexation, a strike, a capital, a revolt) on two seeds, at
// 1600 x 900 and 390 x 844: a click puts the place in the view, where the page shows the map; a row with no place is
// not offered as a link.

const id = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;
const KINDS = [EventKind.MajorBattleStarted, EventKind.NationAnnexed, EventKind.NukeCasualties, EventKind.CapitalCaptured, EventKind.RevoltSpawned];

/** The game of `seed` after 90 days of its own, then God's annexation, strike, capital taken and revolt, an hour on. */
async function setUp(page: Page, seed: number): Promise<void> {
  await page.goto(`/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.waitForFunction(() => window.__warsim!.sim.mapLayers !== null, null, { timeout: 60_000 });
  await page.evaluate(() => window.__warsim!.sim.step(24 * 90));
  const [GER, AUT, POL, CZS, FRA] = [id('GER'), id('AUT'), id('POL'), id('CZS'), id('FRA')];
  await page.evaluate(
    async ({ GER, AUT, POL, CZS, FRA }) => {
      const sim = window.__warsim!.sim;
      const cities = (await sim.inspect(true)).cities;
      const capital = (n: number) => cities.find((c) => c.capitalOf === n)!;
      const [prague, paris, warsaw] = [capital(CZS), capital(FRA), capital(POL)];
      const layers = sim.mapLayers!;
      const province = layers.province[Math.floor(warsaw.y) * layers.terrain.w + Math.floor(warsaw.x)]!;
      sim.command({ kind: 'annexNation', annexer: GER, target: AUT }, true);
      sim.command({ kind: 'godNuke', x: paris.x, y: paris.y, thermonuclear: false }, true);
      sim.command({ kind: 'declareWar', attacker: GER, defender: CZS }, true);
      sim.command({ kind: 'paintControl', nation: GER, x: prague.x, y: prague.y, r: 2 }, true);
      sim.command({ kind: 'spawnRevolt', province }, true);
      sim.step(2);
    },
    { GER, AUT, POL, CZS, FRA },
  );
}

/** Clicks the first row of `kind` in History, waits out the flight, and says where its place is on the page. */
async function goTo(page: Page, kind: number | null): Promise<{ place: [number, number]; open: boolean; covered: string }> {
  await page.getByTestId('history-kind').selectOption(kind === null ? '' : String(kind));
  const go = page.locator(`[data-testid=history-row]${kind === null ? '' : `[data-kind="${kind}"]`} [data-testid=history-go]`).first();
  await expect(go, kind === null ? 'a row of any kind' : kindName(kind)).toBeVisible();
  const place: [number, number] = [Number(await go.getAttribute('data-x')), Number(await go.getAttribute('data-y'))];
  // Away first, so that the flight is seen to begin.
  await page.evaluate(() => window.__warsim!.view!.controller.set({ cx: 10, cy: 10, scale: 2 }));
  await go.click();
  return page.evaluate(async ([x, y]) => {
    const view = window.__warsim!.view!;
    const c = view.controller;
    const asked = performance.now();
    while (!c.animating && c.cam.cx === 10 && c.cam.cy === 10) {
      if (performance.now() - asked > 20_000) throw new Error('no flight began');
      await new Promise((done) => setTimeout(done, 1));
    }
    while (c.animating) await new Promise((done) => requestAnimationFrame(done));
    view.draw(performance.now());
    // The place on the page: what stands there is the map's canvas.
    const canvas = [...document.querySelectorAll('canvas')].find((e) => e.clientWidth === window.innerWidth) ?? document.querySelector('canvas')!;
    const r = canvas.getBoundingClientRect();
    const [sx, sy] = [(x - c.cam.cx) * c.cam.scale + canvas.clientWidth / 2 + r.left, (y - c.cam.cy) * c.cam.scale + canvas.clientHeight / 2 + r.top];
    const at = document.elementFromPoint(sx, sy);
    return { place: [x, y] as [number, number], open: document.querySelector('[data-testid=history-panel]') !== null, covered: at === canvas ? '' : `${at?.tagName ?? 'nothing'}.${(at as HTMLElement | null)?.className ?? ''} at (${Math.round(sx)}, ${Math.round(sy)})` };
  }, place);
}

for (const seed of [1938, 7]) {
  test(`History's rows fly to their places, seed ${seed}`, async ({ page }, info) => {
    test.setTimeout(300_000);
    const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R141') : info.outputPath();
    mkdirSync(out, { recursive: true });
    await page.setViewportSize({ width: 1600, height: 900 });
    await setUp(page, seed);
    for (const [w, h] of [
      [1600, 900],
      [390, 844],
    ] as const) {
      await page.setViewportSize({ width: w, height: h });
      for (const kind of KINDS) {
        if ((await page.getByTestId('history-panel').count()) === 0) await page.evaluate(() => window.__warsim!.hud.toggleHistory());
        const r = await goTo(page, kind);
        expect(r.covered, `${kindName(kind)} at ${w} x ${h}: the place under the map's canvas`).toBe('');
        // On a desk the panel stays open beside the place; on a phone it gives way when no part of the map is clear of it.
        if (w === 1600) expect(r.open, `${kindName(kind)}: the panel open`).toBe(true);
        if (seed === 1938) await page.screenshot({ path: path.join(out, `history-${kindName(kind)}-${w}.png`) });
      }
      // The whole list, the panel at its tallest: on a desk beside it, on a phone the panel gives way.
      if ((await page.getByTestId('history-panel').count()) === 0) await page.evaluate(() => window.__warsim!.hud.toggleHistory());
      const all = await goTo(page, null);
      expect(all.covered, `the newest placed row at ${w} x ${h}`).toBe('');
      expect(all.open, `the panel at ${w} x ${h}`).toBe(w === 1600);
      if (seed === 1938) await page.screenshot({ path: path.join(out, `history-all-${w}.png`) });
      // A row with no place is no link: a war declared, a peace.
      if ((await page.getByTestId('history-panel').count()) === 0) await page.evaluate(() => window.__warsim!.hud.toggleHistory());
      await page.getByTestId('history-kind').selectOption(String(EventKind.WarDeclared));
      const wars = page.locator(`[data-testid=history-row][data-kind="${EventKind.WarDeclared}"]`);
      await expect(wars.first()).toBeVisible();
      await expect(wars.locator('[data-testid=history-go]')).toHaveCount(0);
      await page.getByTestId('history-kind').selectOption('');
    }
  });
}

// R170 (critic run 79, R79-N3): on a phone History opened under a nation's panel (a banner's tap selects its attacker),
// and no row's place could be tapped. History stands in the panel's place; the panel is back as History closes.
test("on a phone History opened over a nation's panel: its rows' places can be tapped", async ({ page }) => {
  test.setTimeout(200_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await setUp(page, 1938);
  await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), id('GER'));
  await expect(page.getByTestId('nation-panel')).toBeVisible();
  await page.evaluate(() => window.__warsim!.hud.toggleHistory());
  await expect(page.getByTestId('history-panel')).toBeVisible();
  await expect(page.getByTestId('nation-panel')).toBeHidden();
  const go = page.getByTestId('history-go').first();
  await expect(go).toBeVisible();
  // What a tap at the link's middle reaches: the link, not a panel over it.
  const hit = await go.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return top === el || el.contains(top);
  });
  expect(hit, "History's link under the tap").toBe(true);
  await page.evaluate(() => window.__warsim!.hud.toggleHistory());
  await expect(page.getByTestId('nation-panel')).toBeVisible();
  expect(await page.evaluate(() => window.__warsim!.hud.selected.value)).toBe(id('GER'));
});
