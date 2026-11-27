import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { lookAt } from './mapView';

// ROADMAP R235 (ADR-1162; the user's report of 2026-11-27: "the arrows are misleading here", two pictures of the
// historical replay's 23 November 1939 at Strasbourg, far and close). A movement arrow is bold where a nation is
// "invading another country or pushing through a front" (R96, the user's rule). In the replay the Phoney War's front
// is held from 3 September 1939 to 10 May 1940: no land is taken across it. Each march whose line clipped the foe's
// land there had a bold arrow all the same: 153 on 23 November, 147 of their formations in the same cell three weeks
// on. No arrow is bold across a held front, also in the days of a stage elsewhere (Southern Norway's, from 2 April
// 1940: asked of Germany and France alone, the hold reads as lifted then); where land can be taken (Poland in
// September 1939, a war the track holds no front of; the West from 10 May 1940) the advances are drawn as in any war.

const ready = async (page: Page): Promise<void> => {
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
};

/** Steps the replay to `days` after 1 January 1938 and waits for that day's picture and statistics. */
const toDay = async (page: Page, days: number): Promise<void> => {
  const tick = days * 24;
  const now = await page.evaluate(() => window.__warsim!.hud.stats.value!.tick);
  await page.evaluate((n) => window.__warsim!.sim.step(n), tick - now);
  await page.waitForFunction((n) => (window.__warsim!.view?.lastTick ?? 0) >= n && (window.__warsim!.hud.stats.value?.tick ?? 0) >= n, tick, { timeout: 400_000, polling: 500 });
};

/** The formations on an advance in the whole world: each one's nation (its tag) and the cell it stands in. */
const advances = (page: Page): Promise<{ tag: string; x: number; y: number }[]> =>
  page.evaluate(() => {
    const v = window.__warsim!.view!;
    const tags = new Map(window.__warsim!.hud.stats.value!.nations.map((n) => [n.id, n.name.replace('nation.', '')]));
    return v
      .formationIds()
      .filter((id) => v.formationAdvancing(id))
      .map((id) => {
        const [x, y] = v.formationPos(id)!;
        return { tag: tags.get(v.formationTitle(id)!.nation) ?? '?', x: Math.round(x), y: Math.round(y) };
      });
  });

/** The arrows drawn in the view: bold ones by their nations' tags, and how many faint. */
const drawn = (page: Page): Promise<{ bold: string[]; faint: number }> =>
  page.evaluate(() => {
    const v = window.__warsim!.view!;
    const tags = new Map(window.__warsim!.hud.stats.value!.nations.map((n) => [n.id, n.name.replace('nation.', '')]));
    return { bold: v.moveArrows.filter((a) => !a.faint).map((a) => tags.get(a.nation) ?? '?'), faint: v.moveArrows.filter((a) => a.faint).length };
  });

// The cell at Strasbourg where the five German divisions of the report stand; the Ardennes.
const STRASBOURG: [number, number] = [1068.5, 297.5];
const ARDENNES: [number, number] = [1062.5, 289.5];
/** In the West, cells: the Low Countries, the Rhine and France's east (Poland is east of it, Norway north). */
const inWest = (a: { x: number; y: number }): boolean => a.x >= 1040 && a.x <= 1080 && a.y >= 275 && a.y <= 310;

test('the replay: no bold arrow across a held front, at any zoom; the fronts fought for keep theirs', async ({ page }, info) => {
  test.setTimeout(900_000);
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R235') : info.outputPath();
  mkdirSync(out, { recursive: true });
  await page.setViewportSize({ width: 1400, height: 900 });
  // The game's own look (the report's pictures have it).
  await page.addInitScript(() => localStorage.setItem('warsim.unitLook', 'balls'));
  await page.goto('/?scenario=1938h&paused=1');
  await ready(page);

  // 4 September 1939: Poland is fought for, in a war the track holds no front of; the West is held since the day before.
  await toDay(page, 611);
  const sept = await advances(page);
  process.stderr.write(`R235 4 Sep 1939: ${sept.length} advances: ${[...new Set(sept.map((a) => a.tag))].map((t) => `${t} ${sept.filter((a) => a.tag === t).length}`).join(', ')}\n`);
  expect(sept.length, 'advances in Poland').toBeGreaterThanOrEqual(5);
  expect([...new Set(sept.map((a) => a.tag))].sort(), 'whose').toEqual(['GER', 'POL']);
  expect(sept.filter(inWest), 'advances in the West while Poland is fought for').toEqual([]);
  for (const m of [1000, 60]) {
    await lookAt(page, ...STRASBOURG, m);
    expect((await drawn(page)).bold, `bold arrows at Strasbourg on 4 September 1939, ${m} m/px`).toEqual([]);
  }

  // 23 November 1939, the day of the report: nothing is taken anywhere in the world (the West and China held).
  await toDay(page, 691);
  expect(await page.locator('header').first().textContent()).toContain('23 November 1939');
  expect(await advances(page), 'advances on 23 November 1939').toEqual([]);
  for (const m of [1000, 400, 60]) {
    await lookAt(page, ...STRASBOURG, m);
    const a = await drawn(page);
    expect(a.bold, `bold arrows at Strasbourg, ${m} m/px`).toEqual([]);
    expect(a.faint, `faint arrows with no nation looked at, ${m} m/px`).toBe(0);
    await page.screenshot({ path: path.join(out, `strasbourg-1939-11-23-${m}m.png`) });
  }
  // With France looked at its own marches are drawn, faint, as any nation's orders are: none bold.
  const fra = await page.evaluate(() => window.__warsim!.hud.stats.value!.nations.find((n) => n.name === 'nation.FRA')!.id);
  await page.evaluate((id) => window.__warsim!.hud.onSelectNation(id), fra);
  await lookAt(page, ...STRASBOURG, 1000);
  expect((await drawn(page)).bold, 'bold arrows with France looked at').toEqual([]);
  await page.screenshot({ path: path.join(out, 'strasbourg-1939-11-23-1000m-france.png') });
  await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));

  // 5 April 1940: Germany's stage in Southern Norway is on the 9th, and its days of fighting began on the 2nd. The
  // West is held all the same: a stage lifts the hold on its own land, for its taker's side.
  await toDay(page, 825);
  expect(await page.locator('header').first().textContent()).toContain('5 April 1940');
  const april = await advances(page);
  process.stderr.write(`R235 5 Apr 1940: ${april.length} advances: ${[...new Set(april.map((a) => a.tag))].map((t) => `${t} ${april.filter((a) => a.tag === t).length}`).join(', ')}
`);
  expect(april.filter(inWest), "advances in the West in the days of Norway's stage").toEqual([]);
  for (const m of [1000, 60]) {
    await lookAt(page, ...STRASBOURG, m);
    expect((await drawn(page)).bold, `bold arrows at Strasbourg on 5 April 1940, ${m} m/px`).toEqual([]);
  }

  // 14 May 1940: the hold of the West ended on the 10th. Germany's advances there are drawn.
  await toDay(page, 864);
  const may = await advances(page);
  const west = may.filter(inWest);
  process.stderr.write(`R235 14 May 1940: ${may.length} advances, ${west.length} in the West: ${[...new Set(west.map((a) => a.tag))].map((t) => `${t} ${west.filter((a) => a.tag === t).length}`).join(', ')}\n`);
  expect(west.filter((a) => a.tag === 'GER').length, "Germany's advances in the West").toBeGreaterThanOrEqual(10);
  for (const m of [1000, 400]) {
    await lookAt(page, ...ARDENNES, m);
    expect((await drawn(page)).bold.filter((t) => t === 'GER').length, `Germany's bold arrows in the West, ${m} m/px`).toBeGreaterThanOrEqual(1);
    await page.screenshot({ path: path.join(out, `ardennes-1940-05-14-${m}m.png`) });
  }
});
