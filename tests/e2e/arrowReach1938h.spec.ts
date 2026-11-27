import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { lookAt } from './mapView';

// ROADMAP R241 (ADR-1165; the user, 2026-11-27: "the arrows in far zoom looked like they crossed far into enemy
// territory, but at close zoom it looked like it was in held territory"). An arrow ran the first 70 to 136 px of its
// march's line at every zoom, and the line of a march on land is straight to its target: on a front fought for, the
// part of an arrow past the front was nothing at 60 m/px, 2 cells at 1,000 and 6 at 5,000 (24 at the most). An
// advance's arrow now ends at the cell its march presses on: the first of its route that an enemy holds. Where a cell
// is smaller than the arrow's least length (26 px, R96's sign: past 1,000 m/px) the arrow is that sign and no longer.
// A march behind the lines, drawn faint for the nation looked at, is drawn on its own side of the front.

const ready = async (page: Page): Promise<void> => {
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
};

/** Steps the world to `days` after its start and waits for that day's picture and statistics. */
const toDay = async (page: Page, days: number): Promise<void> => {
  const tick = days * 24;
  const now = await page.evaluate(() => window.__warsim!.hud.stats.value!.tick);
  await page.evaluate((n) => window.__warsim!.sim.step(n), tick - now);
  await page.waitForFunction((n) => (window.__warsim!.view?.lastTick ?? 0) >= n && (window.__warsim!.hud.stats.value?.tick ?? 0) >= n, tick, { timeout: 400_000, polling: 500 });
};

interface Reach {
  nation: number;
  faint: boolean;
  /** The arrow's length as drawn, CSS px and cells. */
  px: number;
  long: number;
  /** How much of it lies past where it first comes onto land a nation at war with its own holds, cells and CSS px. */
  deep: number;
  deepPx: number;
  /** How much of it lies over such land in all, cells. */
  over: number;
}

/** The arrows of the view, each with its length and how much of it lies past the front, read from the picture's own map. */
const reaches = (page: Page): Promise<Reach[]> =>
  page.evaluate(() => {
    const v = window.__warsim!.view!;
    // Who is at war with whom, as the view has it from the snapshot (its own field, not an accessor made for this
    // test: the same on the build before).
    const wars = (v as unknown as { warPairs: Set<number> }).warPairs;
    const atWar = (a: number, b: number): boolean => wars.has(a < b ? a * 65536 + b : b * 65536 + a);
    const pxPerCell = v.controller.cam.scale;
    return v.moveArrows.map((a) => {
      const w = a.way;
      let len = 0;
      let entered = -1;
      let over = 0;
      for (let i = 2; i < w.length; i += 2) {
        const seg = Math.hypot(w[i]! - w[i - 2]!, w[i + 1]! - w[i - 1]!);
        for (let s = 0; s <= seg; s += 1) {
          const holder = v.nationAt(w[i - 2]! + ((w[i]! - w[i - 2]!) * s) / (seg || 1), w[i - 1]! + ((w[i + 1]! - w[i - 1]!) * s) / (seg || 1));
          if (holder === 0 || holder === a.nation || !atWar(a.nation, holder)) continue;
          if (entered < 0) entered = len + s;
          over++;
        }
        len += seg;
      }
      const deepPx = entered < 0 ? 0 : len - entered;
      return { nation: a.nation, faint: a.faint, px: len, long: len / pxPerCell, deep: deepPx / pxPerCell, deepPx, over: over / pxPerCell };
    });
  });

const median = (xs: number[]): number => (xs.length === 0 ? 0 : [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]!);
const most = (xs: number[]): number => Math.max(0, ...xs);
/** The zooms the map shows a cell at (a cell 326 to 20 px), and those where a cell is under the arrow's least length. */
const NEAR = [60, 150, 400, 1000];
const FAR = [2500, 5000];
/** An arrow's least length, CSS px (`ARROW_LEAST_PX`), and a pixel of its rounding. */
const LEAST_PX = 26 + 1;
/** How far past the front an advance's arrow may lie, cells: the cell it presses on, and the least length's part of one more. */
const PAST = 1.5;
/** Kilometres a cell of the 1938 map (its 2,048 cells round the equator). */
const CELL_KM = 19.57;
/** How much of a faint arrow may lie over an enemy's land, cells: a corner between two looks at its line (`OWN_SIDE_STEP`). */
const OVER = 0.5;

/** The sweep at one place: what is printed, and what is held of the bold arrows. */
async function sweep(page: Page, label: string, at: [number, number], out: string | null): Promise<void> {
  let seen = 0;
  for (const m of [...NEAR, ...FAR]) {
    await lookAt(page, ...at, m);
    const bold = (await reaches(page)).filter((r) => !r.faint);
    const deep = bold.map((r) => r.deep);
    process.stderr.write(
      `REACH ${label} ${String(m).padStart(5)} m/px: ${String(bold.length).padStart(3)} bold arrows; past the front, cells: median ${median(deep).toFixed(2)}, most ${most(deep).toFixed(2)}; ` +
        `${bold.filter((r) => r.deep > PAST).length} more than ${PAST} past; long: median ${median(bold.map((r) => r.long)).toFixed(2)} cells, most ${most(bold.map((r) => r.px)).toFixed(0)} px\n`,
    );
    if (out && (m === 400 || m === 1000 || m === 5000)) await page.screenshot({ path: path.join(out, `${label}-${m}m.png`) });
    // Past the front by the cell it presses on at the most; where a cell is smaller than the arrow's least length, by
    // that length (the sign of R96): never by the 70 to 136 px of its line it ran before.
    const cellPx = (CELL_KM * 1000) / m;
    expect.soft(most(bold.map((r) => r.deepPx)), `${label}, ${m} m/px: the arrow furthest past the front, px (a cell ${cellPx.toFixed(1)} px)`).toBeLessThanOrEqual(Math.max(PAST * cellPx, LEAST_PX));
    if (NEAR.includes(m)) seen += bold.length;
    else expect(bold.length, `${label}, ${m} m/px: bold arrows`).toBeGreaterThan(0);
  }
  expect(seen, `${label}: bold arrows at the near zooms`).toBeGreaterThanOrEqual(10);
}

/** With `nation` looked at, its faint arrows at the far zooms: how much of each lies over land an enemy holds. */
async function faintSweep(page: Page, label: string, at: [number, number], nation: number, out: string | null): Promise<void> {
  await page.evaluate((id) => window.__warsim!.hud.onSelectNation(id), nation);
  let seen = 0;
  for (const m of [1000, 2500, 5000]) {
    await lookAt(page, ...at, m);
    const faint = (await reaches(page)).filter((r) => r.faint && r.nation === nation);
    seen += faint.length;
    process.stderr.write(
      `REACH ${label} ${String(m).padStart(5)} m/px, nation ${nation} looked at: ${String(faint.length).padStart(3)} faint arrows; over an enemy's land, cells: most ${most(faint.map((r) => r.over)).toFixed(2)}, ` +
        `${faint.filter((r) => r.over > OVER).length} more than ${OVER}\n`,
    );
    if (out && m === 2500) await page.screenshot({ path: path.join(out, `${label}-${m}m-looked-at.png`) });
    expect.soft(most(faint.map((r) => r.over)), `${label}, ${m} m/px: the faint arrow with the most of it over an enemy's land, cells`).toBeLessThanOrEqual(OVER);
  }
  expect(seen, `${label}: faint arrows of nation ${nation}`).toBeGreaterThan(0);
  await page.evaluate(() => window.__warsim!.hud.onSelectNation(0));
}

test("an advance's arrow ends at the front it presses on, at every zoom; a march behind the lines is drawn on its own side", async ({ page }, info) => {
  test.setTimeout(900_000);
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R241', process.env['EVIDENCE']) : info.outputPath();
  mkdirSync(out, { recursive: true });
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.addInitScript(() => localStorage.setItem('warsim.unitLook', 'balls'));
  await page.goto('/?scenario=1938h&paused=1');
  await ready(page);
  // 14 May 1940: the West is fought for since the 10th.
  await toDay(page, 864);
  await sweep(page, 'west-1940-05-14', [1062.5, 289.5], out);
  // With Germany looked at its marches behind the lines are drawn, faint.
  const ger = await page.evaluate(() => window.__warsim!.hud.stats.value!.nations.find((n) => n.name === 'nation.GER')!.id);
  await faintSweep(page, 'west-1940-05-14', [1062.5, 289.5], ger, out);

  // A free game, seed 99, 120 days in: where its advances are thickest, and the nation with the most of them looked at.
  await page.goto('/?scenario=1938&seed=99&paused=1');
  await ready(page);
  await toDay(page, 120);
  const at = await page.evaluate(() => {
    const v = window.__warsim!.view!;
    const ids = v.formationIds().filter((id) => v.formationAdvancing(id));
    const ps = ids.map((id) => v.formationPos(id)!);
    const mid = (k: 0 | 1): number => ps.map((p) => p[k]).sort((a, b) => a - b)[Math.floor(ps.length / 2)]!;
    const n = new Map<number, number>();
    for (const id of ids) n.set(v.formationTitle(id)!.nation, (n.get(v.formationTitle(id)!.nation) ?? 0) + 1);
    return { x: mid(0), y: mid(1), advances: ids.length, busiest: [...n].sort((a, b) => b[1] - a[1])[0]![0] };
  });
  process.stderr.write(`REACH free-99-day-120: ${at.advances} advances, the middle one at ${at.x.toFixed(1)}, ${at.y.toFixed(1)}; the nation with the most: ${at.busiest}\n`);
  await sweep(page, 'free-99-day-120', [at.x, at.y], null);
  await faintSweep(page, 'free-99-day-120', [at.x, at.y], at.busiest, null);
});
