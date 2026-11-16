import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { lookAt, open1938 } from './mapView';

// PLAN 7.4b (ADR-441): at T1 an order line is drawn for what is looked at, not for every
// formation on the march. In a war at 2000 m/px the lines were a web of dashed yellow lines from
// formations off the screen (the critic of 2026-10-07; N4, N5). Drawn: the formation whose panel
// is open, the player's selection and own nation, and the nation whose panel is open.
//
// ROADMAP R89a (ADR-1074): a march so shown is a movement arrow, thick and in a pale tint of its
// nation's colour, from the formation along the start of its way; the dashed yellow line along the
// whole way is drawn for the formation picked or selected alone (and for the fleets).

const { w: W, h: H } = SIZE_1938;
const nation = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;
const POL = nation('POL');
const GER = nation('GER');
const LINE = [255, 232, 150];

/** The ids of the formations whose order lines the last frame drew, among `ids`. */
function lines(page: Page, ids: number[]): Promise<number[]> {
  return page.evaluate((ids) => {
    const v = window.__warsim!.view!;
    v.draw();
    return v.orderLineIds.filter((id) => ids.includes(id)).sort((a, b) => a - b);
  }, ids);
}

/** The movement arrows of the last frame that stand for one of `ids`: their nations, their marches among `ids`, and the overlay's pixel inside each. */
function arrows(page: Page, ids: number[]): Promise<{ nation: number; ids: number[]; faint: boolean; width: number; px: number[] }[]> {
  return page.evaluate((ids) => {
    const v = window.__warsim!.view!;
    v.draw();
    const c = document.querySelector('canvas.map-cities') as HTMLCanvasElement;
    const k = c.width / c.clientWidth;
    const g = c.getContext('2d')!;
    return v.moveArrows.filter((a) => a.ids.some((id) => ids.includes(id))).map((a) => ({ nation: a.nation, faint: a.faint, ids: a.ids.filter((id) => ids.includes(id)).sort((p, q) => p - q), width: a.width, px: Array.from(g.getImageData(Math.round(a.x * k), Math.round(a.y * k), 1, 1).data) }));
  }, ids);
}

/** Pixels of the order line's colour on the overlay. */
function linePixels(page: Page): Promise<number> {
  return page.evaluate((LINE) => {
    window.__warsim!.view!.draw();
    const c = document.querySelector('canvas.map-nations') as HTMLCanvasElement;
    const px = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 0; i < px.length; i += 4) if (px[i + 3]! > 120 && Math.abs(px[i]! - LINE[0]!) + Math.abs(px[i + 1]! - LINE[1]!) + Math.abs(px[i + 2]! - LINE[2]!) < 60) n++;
    return n;
  }, LINE);
}

test('order lines at T1: for the formation and nation looked at and the player\'s own, not for all', async ({ page }, info) => {
  test.setTimeout(150_000);
  await open1938(page, 1938);
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/7.4') : info.outputPath();
  mkdirSync(out, { recursive: true });
  const [cx, cy] = cellOf(18.5, 52.3, W, H);
  await lookAt(page, cx, cy, 1000);
  // Two Polish formations and a German one, the nearest to the middle of the view.
  const picked = await page.evaluate(({ POL, GER, cx, cy }) => {
    const v = window.__warsim!.view!;
    const near = (n: number): number[] => v.formationsOf(n).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)![0] - cx, v.formationPos(id)![1] - cy)] as const).sort((a, b) => a[1] - b[1]).map(([id]) => id);
    return { pol: near(POL).slice(0, 2), ger: near(GER).slice(0, 1) };
  }, { POL, GER, cx, cy });
  expect(picked.pol, 'two Polish formations').toHaveLength(2);
  expect(picked.ger, 'a German formation').toHaveLength(1);
  const ids = [...picked.pol, ...picked.ger].sort((a, b) => a - b);
  const bare = await linePixels(page);
  // Each to a place of its own land (Poznań, Berlin): an order into another's land is refused in peace.
  const [tx, ty] = cellOf(16.9, 52.4, W, H);
  const [gx, gy] = cellOf(13.4, 52.5, W, H);
  await page.evaluate(({ picked, tx, ty, gx, gy }) => {
    for (const id of picked.pol) window.__warsim!.sim.command({ kind: 'moveFormation', id, x: tx, y: ty });
    for (const id of picked.ger) window.__warsim!.sim.command({ kind: 'moveFormation', id, x: gx, y: gy });
  }, { picked, tx, ty, gx, gy });
  await page.evaluate(() => window.__warsim!.sim.step(2));
  await page.waitForFunction(() => window.__warsim!.view!.lastTick >= 2, null, { timeout: 30_000 });

  // All three on the march.
  expect(await page.evaluate((ids) => ids.filter((id) => window.__warsim!.view!.formationMoving(id)).length, ids), 'three on the march').toBe(3);
  // An observer with nothing open: none of the three has a line, and no line is drawn.
  expect(await lines(page, ids)).toEqual([]);
  expect(await page.evaluate(() => window.__warsim!.view!.orderLineIds.length), 'no line of any formation').toBe(0);
  expect(await linePixels(page), 'no line on the overlay').toBeLessThanOrEqual(bare);
  expect(await arrows(page, ids), 'no arrow of the three').toEqual([]);
  await page.screenshot({ path: path.join(out, 'b-lines-none.png') });

  // A formation's panel open: its line alone.
  await page.evaluate((id) => void (window.__warsim!.view!.pickedFormation = id), picked.pol[0]!);
  expect(await lines(page, ids)).toEqual([picked.pol[0]!]);
  expect(await linePixels(page), 'its line on the overlay').toBeGreaterThan(bare + 30);
  // And its arrow, alone (R89a): Poland's, filled.
  const one = await arrows(page, ids);
  expect(one.map((a) => [a.nation, a.ids])).toEqual([[POL, [picked.pol[0]!]]]);
  // In peace a march is behind the lines (R89b): faint, at half the opacity, and thinner.
  expect(one[0]!.faint, 'a march in peace is faint').toBe(true);
  expect(one[0]!.px[3], 'the arrow is filled, faintly').toBeGreaterThan(100);
  // (No upper bound on that pixel: the picked formation's dashed line runs along the arrow's middle.)
  expect(one[0]!.width).toBeGreaterThanOrEqual(3);
  await page.evaluate(() => void (window.__warsim!.view!.pickedFormation = 0));

  // Poland's panel open: the lines of both Polish formations, not the German one.
  await page.evaluate((n) => window.__warsim!.view!.select(n), POL);
  expect(await lines(page, ids)).toEqual([...picked.pol].sort((a, b) => a - b));
  // As arrows (R89a), one or two (two that start together and head the same way are one), each filled; and no dashed
  // line along a whole way: that is the picked formation's.
  const pol = await arrows(page, ids);
  expect(pol.every((a) => a.nation === POL), 'Polish arrows alone').toBe(true);
  expect(pol.flatMap((a) => a.ids).sort((a, b) => a - b)).toEqual([...picked.pol].sort((a, b) => a - b));
  for (const a of pol) expect(a.px[3], 'the arrow is filled, faintly').toBeGreaterThan(100);
  expect(await linePixels(page), 'no dashed line for a nation looked at').toBeLessThanOrEqual(bare);
  await page.screenshot({ path: path.join(out, 'b-lines-poland.png') });
  await page.evaluate(() => window.__warsim!.view!.select(0));
  expect(await lines(page, ids)).toEqual([]);

  // Playing Germany: its own formation's line.
  // (The sim is the truth of who plays: its stats follow the command at the next tick.)
  // Its AI, on till now, may have given the formation another order: the player gives it again.
  await page.evaluate((n) => window.__warsim!.player!.take(n), GER);
  await page.evaluate(({ id, tx, ty }) => window.__warsim!.sim.command({ kind: 'moveFormation', id, x: tx, y: ty }), { id: picked.ger[0]!, tx: gx, ty: gy });
  await page.evaluate(() => window.__warsim!.sim.step(1));
  await expect.poll(() => page.evaluate(() => window.__warsim!.view!.selectionNation)).toBe(GER);
  expect(await lines(page, ids)).toEqual(picked.ger);
});

// ROADMAP R89b (ADR-1073, the user's decision): every nation at war shows its advances as bold arrows, with nothing
// selected; the marches behind the lines, faint, are those of what is looked at. Swept over the war's hours and the
// zooms from the world's counters to the sprites.
test('a war shows its advances as arrows with nothing selected; a nation looked at its other marches, faint', async ({ page }, info) => {
  test.setTimeout(240_000);
  await open1938(page, 1938);
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R89b') : info.outputPath();
  mkdirSync(out, { recursive: true });
  const [cx, cy] = cellOf(19, 52, W, H);
  /** The arrows of the last frame: the bold ones' nations, the faint ones' nations, and whether each bold one's nation is at war. */
  const seen = (): Promise<{ bold: number[]; faint: number[]; atPeace: number[]; crossing: number }> => page.evaluate(() => {
    const v = window.__warsim!.view!;
    v.draw();
    const atWar = (v as unknown as { atWar: Set<number> }).atWar;
    const a = v.moveArrows;
    const side = (p: number[], i: number, x: number, y: number): number => Math.sign((p[i + 2]! - p[i]!) * (y - p[i + 1]!) - (p[i + 3]! - p[i + 1]!) * (x - p[i]!));
    let crossing = 0;
    for (let i = 0; i < a.length; i++) {
      for (let j = i + 1; j < a.length; j++) {
        if (a[i]!.nation !== a[j]!.nation) continue;
        const [p, q] = [a[i]!.way, a[j]!.way];
        let hit = false;
        for (let s = 0; s + 3 < p.length && !hit; s += 2) for (let t = 0; t + 3 < q.length && !hit; t += 2) hit = side(p, s, q[t]!, q[t + 1]!) * side(p, s, q[t + 2]!, q[t + 3]!) < 0 && side(q, t, p[s]!, p[s + 1]!) * side(q, t, p[s + 2]!, p[s + 3]!) < 0;
        if (hit) crossing++;
      }
    }
    return { bold: a.filter((x) => !x.faint).map((x) => x.nation), faint: a.filter((x) => x.faint).map((x) => x.nation), atPeace: a.filter((x) => !x.faint && !atWar.has(x.nation)).map((x) => x.nation), crossing };
  });
  // In peace over Poland and Germany: no arrow at any zoom.
  for (const m of [4000, 1500, 600]) {
    await lookAt(page, cx, cy, m);
    expect((await seen()).bold, `no arrow in peace at ${m} m/px`).toEqual([]);
  }
  await page.evaluate(({ a, d }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: GER, d: POL });
  let most = 0;
  /** The points of arrows' middle lines under a nation's name, over the zooms looked at, and those where the name is not told from the arrow. */
  const under = { points: 0, lost: 0 };
  for (const hour of [6, 24, 48, 96]) {
    await page.evaluate((h) => window.__warsim!.sim.step(h - window.__warsim!.view!.lastTick), hour);
    await page.waitForFunction((h) => window.__warsim!.view!.lastTick >= h, hour, { timeout: 60_000 });
    for (const m of [4000, 1500, 600, 100]) {
      await lookAt(page, cx, cy, m);
      const none = await seen();
      expect(none.atPeace, `hour ${hour}, ${m} m/px: a bold arrow of a nation at peace`).toEqual([]);
      expect(none.faint, `hour ${hour}, ${m} m/px: no faint arrow with nothing looked at`).toEqual([]);
      expect(none.crossing, `hour ${hour}, ${m} m/px: arrows of one nation across each other`).toBe(0);
      expect(none.bold.length, `hour ${hour}, ${m} m/px: a war read at a glance, not a web`).toBeLessThanOrEqual(60);
      if (m >= 600) most = Math.max(most, none.bold.length);
      if (hour === 48 && m >= 600) {
        expect(none.bold.length, `the war's advances at ${m} m/px`).toBeGreaterThan(0);
        expect(new Set(none.bold).has(GER) || new Set(none.bold).has(POL), 'of Germany or Poland').toBe(true);
        await page.screenshot({ path: path.join(out, `war-none-${m}.png`) });
        // No name under an arrow (R89c): the arrows are on the names' canvas, below the names. Every pixel a name or a
        // city's dot fills whole in the picture of the names alone is that pixel in the frame's; and where a nation's
        // name, which lets its ground through, lies on an arrow, the pixel is not the arrow's plain fill.
        const names = await page.evaluate(() => {
          const v = window.__warsim!.view!;
          const c = document.querySelector('canvas.map-cities') as HTMLCanvasElement;
          const g = c.getContext('2d')!;
          const k = c.width / c.clientWidth;
          const now = performance.now() + 60_000;
          v.draw(now);
          const full = g.getImageData(0, 0, c.width, c.height).data;
          const drawn = v.moveArrows.map((a) => ({ x: Math.round(a.x * k), y: Math.round(a.y * k), way: a.way, width: a.width }));
          v.drawLabelLayers(now);
          const alone = g.getImageData(0, 0, c.width, c.height).data;
          v.draw(now);
          let whole = 0;
          let changed = 0;
          for (let i = 0; i < alone.length; i += 4) {
            if (alone[i + 3]! < 255) continue;
            whole++;
            if (Math.abs(alone[i]! - full[i]!) + Math.abs(alone[i + 1]! - full[i + 1]!) + Math.abs(alone[i + 2]! - full[i + 2]!) > 6) changed++;
          }
          // Along each arrow's middle line: the points a nation's name lies on (its body: an alpha of its own from 150, short of whole), and those of
          // them that are the colour the arrow has where no name is.
          let onName = 0;
          let lost = 0;
          let arrowPx = 0;
          for (const a of drawn) {
            const at = (x: number, y: number): number => (Math.round(y) * c.width + Math.round(x)) * 4;
            // The arrow's plain fill: a point of its middle line with no name on it.
            let plain = -1;
            const pts: number[] = [];
            for (let s = 2; s < a.way.length; s += 2) {
              for (let t = 0; t <= 1; t += 0.05) {
                const [x, y] = [(a.way[s - 2]! + (a.way[s]! - a.way[s - 2]!) * t) * k, (a.way[s - 1]! + (a.way[s + 1]! - a.way[s - 1]!) * t) * k];
                if (x < 0 || y < 0 || x >= c.width || y >= c.height) continue;
                pts.push(at(x, y));
              }
            }
            for (const i of pts) if (alone[i + 3]! === 0 && full[i + 3]! > 250) plain = i;
            if (plain < 0) continue;
            for (const i of pts) {
              if (full[i + 3]! > 250) arrowPx++;
              if (alone[i + 3]! < 150 || alone[i + 3]! === 255) continue;
              onName++;
              if (Math.abs(full[i]! - full[plain]!) + Math.abs(full[i + 1]! - full[plain + 1]!) + Math.abs(full[i + 2]! - full[plain + 2]!) < 12) lost++;
            }
          }
          return { whole, changed, onName, lost, arrowPx, arrows: drawn.length };
        });
        process.stderr.write(`names at ${m} m/px: ${names.whole} px filled whole, ${names.changed} changed by the arrows; ${names.onName} points of ${names.arrows} arrows under a nation's name, ${names.lost} of them the arrow's plain fill
`);
        expect(names.whole, 'names and dots in view').toBeGreaterThan(200);
        expect(names.changed, `${m} m/px: a name's or a dot's pixel changed by an arrow`).toBe(0);
        expect(names.arrowPx, 'the arrows are on the canvas of the names').toBeGreaterThan(50);
        under.points += names.onName;
        under.lost += names.lost;
      }
      // Poland looked at: the same bold arrows, and its other marches faint, Poland's alone.
      await page.evaluate((n) => window.__warsim!.view!.select(n), POL);
      const pol = await seen();
      expect(pol.bold.length, `hour ${hour}, ${m} m/px: the advances the same with Poland looked at`).toBe(none.bold.length);
      expect(pol.faint.every((n) => n === POL), `hour ${hour}, ${m} m/px: faint arrows of Poland alone`).toBe(true);
      if (hour === 48 && m === 1500) await page.screenshot({ path: path.join(out, 'war-poland-1500.png') });
      await page.evaluate(() => window.__warsim!.view!.select(0));
    }
  }
  // At most a tenth (ADR-1077): a pale name on a pale arrow of its own nation (Germany's grey name on its grey arrows)
  // is the arrow's colour there; every other name is told from the arrow under it.
  process.stderr.write(`a nation's name on an arrow: ${under.lost} of ${under.points} points not told from the arrow
`);
  expect(under.points, 'names on arrows were looked at').toBeGreaterThan(20);
  expect(under.lost, `a nation's name lost on an arrow, of ${under.points} points`).toBeLessThanOrEqual(under.points / 10);
  process.stderr.write(`GER v POL, 6 to 96 hours, 4000 to 600 m/px: at most ${most} bold arrows in view\n`);
});
