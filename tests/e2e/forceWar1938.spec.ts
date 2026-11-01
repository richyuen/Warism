import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import type { Inspection } from '../../src/shared/protocol';
import { NATIONS_1938 } from '../../src/sim/scenario1938';

// PLAN 7.175b (ADR-780, the user's request): the right-click menu says a nation's standing with the
// played one, and its war button reads "Force war" where a bond stands: playing Germany, Italy (its
// ally at the 1938 start) reads Allied and "Force war", and the click makes the war, Germany out of
// the alliance; Switzerland reads Neutral and "Declare war". The Actions tab says the chosen
// nation's standing too. God's war on two allies (the United Kingdom on France) makes it.

const id = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;
const [GER, ITA, SWI, ENG, FRA] = ['GER', 'ITA', 'SWI', 'ENG', 'FRA'].map(id) as [number, number, number, number, number];
const inspect = (page: Page): Promise<Inspection> => page.evaluate(() => window.__warsim!.sim.inspect());
const atWar = async (page: Page, a: number, b: number): Promise<boolean> =>
  (await inspect(page)).wars.some((w) => (w.attackers.includes(a) && w.defenders.includes(b)) || (w.attackers.includes(b) && w.defenders.includes(a)));
const allianceOf = (page: Page, n: number): Promise<number | null> => page.evaluate((n) => window.__warsim!.hud.stats.value!.nations.find((x) => x.id === n)?.alliance?.id ?? null, n);

/** A point of `nation`'s ground on the screen, the camera over its first formation at 6 px a cell. */
async function groundOf(page: Page, nation: number): Promise<[number, number]> {
  const at = (await page.evaluate((n) => window.__warsim!.view!.formationPos(window.__warsim!.view!.formationsOf(n)[0]!), nation))!;
  await page.evaluate(([x, y]) => window.__warsim!.view!.controller.set({ cx: x, cy: y, scale: 6 }), at);
  await page.waitForTimeout(400);
  const spot = await page.evaluate((n) => {
    const v = window.__warsim!.view!;
    const [w, h] = [innerWidth, innerHeight];
    for (let r = 0; r < Math.min(w, h) / 2; r += 12)
      for (let k = 0; k < 16; k++) {
        const x = Math.round(w / 2 + r * Math.cos((k * Math.PI) / 8));
        const y = Math.round(h / 2 + r * Math.sin((k * Math.PI) / 8));
        if (v.nationAt(x, y) === n && v.nationAt(x + 8, y) === n && v.nationAt(x, y + 8) === n) return [x, y] as [number, number];
      }
    return null;
  }, nation);
  expect(spot, `ground of nation ${nation} on the screen`).not.toBeNull();
  return spot!;
}

test('the menu says the standing; "Force war" on an ally makes the war and leaves the alliance; a neutral reads "Declare war"', async ({ page }, info) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1400, height: 800 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.waitForFunction((n) => window.__warsim!.view!.formationsOf(n).length > 3, ITA, { timeout: 60_000 });
  await page.evaluate((n) => window.__warsim!.view!.select(n), GER);
  await page.getByTestId('take-control').click();
  await page.evaluate(() => window.__warsim!.view!.select(0));
  expect(await allianceOf(page, GER)).not.toBeNull();
  expect(await allianceOf(page, GER)).toBe(await allianceOf(page, ITA));
  const out = info.outputPath();
  mkdirSync(out, { recursive: true });

  // Switzerland: Neutral, "Declare war".
  const swi = await groundOf(page, SWI);
  await page.mouse.click(swi[0], swi[1], { button: 'right' });
  await expect(page.getByTestId('nation-menu-name')).toHaveText('Switzerland');
  await expect(page.getByTestId('nation-menu-standing')).toHaveText('Neutral');
  await expect(page.getByTestId('nation-menu-war')).toHaveText('Declare war');
  await page.keyboard.press('Escape');

  // Italy: Allied, "Force war"; the click makes the war, Germany out of the alliance.
  const ita = await groundOf(page, ITA);
  await page.mouse.click(ita[0], ita[1], { button: 'right' });
  await expect(page.getByTestId('nation-menu-name')).toHaveText('Italy');
  await expect(page.getByTestId('nation-menu-standing')).toHaveText('Allied');
  await expect(page.getByTestId('nation-menu-war')).toHaveText('Force war');
  await page.screenshot({ path: path.join(out, 'menu-allied.png') });
  await page.getByTestId('nation-menu-war').click();
  await expect.poll(() => atWar(page, GER, ITA)).toBe(true);
  await expect.poll(() => allianceOf(page, GER)).toBeNull();
  expect(await allianceOf(page, ITA)).not.toBeNull();
  // The ticker tells it.
  await expect(page.getByTestId('ticker')).toContainText('broke its alliance with Italy');
  // At war now: the menu says so and offers peace.
  await page.mouse.click(ita[0], ita[1], { button: 'right' });
  await expect(page.getByTestId('nation-menu-standing')).toHaveText('At war');
  await expect(page.getByTestId('nation-menu-peace')).toBeVisible();
  await page.keyboard.press('Escape');

  // The Actions tab: the chosen nation's standing, and its button.
  await page.evaluate((n) => window.__warsim!.view!.select(n), GER);
  await page.getByTestId('tab-actions').click();
  await page.getByTestId('act-target').selectOption({ label: 'Switzerland' });
  await expect(page.getByTestId('act-standing')).toHaveText('Neutral');
  await expect(page.getByTestId('act-war')).toHaveText('Declare war');
  await page.getByTestId('act-target').selectOption({ label: 'Italy' });
  await expect(page.getByTestId('act-standing')).toHaveText('At war');
  await expect(page.getByTestId('act-war')).toBeDisabled();
});

test("God's war on two allies makes it: the United Kingdom on France", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  expect(await allianceOf(page, ENG)).toBe(await allianceOf(page, FRA));
  await page.evaluate((n) => window.__warsim!.view!.select(n), ENG);
  await page.getByTestId('god-btn').click();
  await page.getByTestId('tab-god').click();
  await page.getByTestId('god-target').selectOption({ label: 'France' });
  await page.getByTestId('god-war').click();
  await expect.poll(() => atWar(page, ENG, FRA)).toBe(true);
  await expect.poll(() => allianceOf(page, ENG)).toBeNull();
});

// PLAN 7.175c (the user's request): the right-click menu's "Offer peace" is greyed out while the
// enemy would refuse, its title saying why; once the war is won enough (German control painted
// over Polish land with God's brush, a day at a time, until Germany leads by the bar), it is
// enabled and its click makes the peace.
test('"Offer peace" greyed out while refused, saying why; enabled once they would accept, and its click the peace', async ({ page }) => {
  test.setTimeout(240_000);
  const POL = id('POL');
  await page.setViewportSize({ width: 1400, height: 800 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.waitForFunction((n) => window.__warsim!.view!.formationsOf(n).length > 3, POL, { timeout: 60_000 });
  await page.evaluate((n) => window.__warsim!.view!.select(n), GER);
  await page.getByTestId('take-control').click();
  await page.evaluate(() => window.__warsim!.view!.select(0));
  await page.evaluate(([g, p]) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: g!, defender: p! }, true), [GER, POL]);
  await expect.poll(() => atWar(page, GER, POL)).toBe(true);

  // Day one: an even war. Greyed out, and why.
  const pol = await groundOf(page, POL);
  await page.mouse.click(pol[0], pol[1], { button: 'right' });
  const peace = page.getByTestId('nation-menu-peace');
  await expect(peace).toBeDisabled();
  await expect(peace).toHaveAttribute('title', /^They refuse: lead the war score by 25 \(now [+-]?\d+\), or wear them out/);
  await page.keyboard.press('Escape');

  // German control over Warsaw and about it, wider a day at a time, until Germany leads by 25.
  const warsaw = (await page.evaluate(async (p) => (await window.__warsim!.sim.inspect(true)).cities.find((c) => c.capitalOf === p)!, POL))!;
  const score = (): Promise<number> => page.evaluate(([g, p]) => window.__warsim!.hud.stats.value!.wars.find((w) => w.attackers.includes(g!) && w.defenders.includes(p!))?.score ?? NaN, [GER, POL]);
  for (let r = 2; r <= 12 && (await score()) < 25; r += 2) {
    await page.evaluate(([g, x, y, r]) => window.__warsim!.sim.command({ kind: 'paintControl', nation: g!, x: x!, y: y!, r: r! }, true), [GER, warsaw.x, warsaw.y, r]);
    await page.evaluate(async () => {
      const w = window.__warsim!;
      const t = (await w.sim.step(24)).tick;
      await new Promise<void>((done) => {
        const go = (): void => void (w.view!.lastTick >= t ? done() : setTimeout(go, 5));
        go();
      });
    });
    await page.waitForTimeout(300);
  }
  expect(await score(), 'Germany leads by the bar').toBeGreaterThanOrEqual(25);
  expect(await atWar(page, GER, POL), 'the war goes on (no capitulation)').toBe(true);

  // Enabled, with no reason; its click makes the peace. (Polish ground found again: the first
  // spot may be under German control now, Germany's to the menu.)
  const free = await groundOf(page, POL);
  await page.mouse.click(free[0], free[1], { button: 'right' });
  await expect(page.getByTestId('nation-menu-name')).toHaveText('Poland');
  await expect(peace).toBeEnabled();
  await expect(peace).not.toHaveAttribute('title', /\S/);
  await peace.click();
  await expect.poll(() => atWar(page, GER, POL)).toBe(false);
});
