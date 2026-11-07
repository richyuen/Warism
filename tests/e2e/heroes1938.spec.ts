import { expect, test, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { NATIONS_1938, TEMPLATES_LAND } from '../../src/sim/scenario1938';

// PLAN 7.184b: the heroes drawn. With `?heroes=on` the 1938 world has the 14 heroes of
// data/scenarios/1938/heroes.json (PLAN 7.184a), each a formation of one element.

const EVIDENCE = path.resolve('docs/evidence/7.184b');
const EVIDENCE_C = path.resolve('docs/evidence/7.184c');
const HEAVY = TEMPLATES_LAND.findIndex((t) => t.id === 'heavy_panzer_div');

/** Opens the 1938 world, paused, with the heroes on. */
async function openWithHeroes(page: Page): Promise<void> {
  await page.setViewportSize({ width: 1400, height: 800 });
  await page.goto('/?scenario=1938&paused=1&seed=1938&heroes=on');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
}

/** The id of the hero named `name` in the last snapshot. */
async function heroId(page: Page, name: string): Promise<number> {
  return page.evaluate((name) => {
    const v = window.__warsim!.view!;
    return v.heroFormations().find((f) => v.formationTitle(f)?.name === name) ?? 0;
  }, name);
}

/** Centres the view on formation `id` at `mPerPx` metres a CSS px. */
async function lookAt(page: Page, id: number, mPerPx: number): Promise<void> {
  await page.evaluate(({ id, mPerPx }) => {
    const v = window.__warsim!.view!;
    const [x, y] = v.formationPos(id)!;
    v.controller.set({ cx: x, cy: y, scale: (v.metresPerPx * v.controller.cam.scale) / mPerPx });
  }, { id, mPerPx });
}

test('PLAN 7.184b1: with heroes=on, 14 hero formations, each tagged by its name alone', async ({ page }) => {
  test.setTimeout(180_000);
  await openWithHeroes(page);
  const heroes = await page.evaluate(() => window.__warsim!.view!.heroFormations().length);
  expect(heroes, 'hero formations in the 1938 world with heroes=on').toBe(14);
  for (const name of ['Yamato', 'Maus']) {
    const id = await heroId(page, name);
    expect(id, `${name}'s formation`).toBeGreaterThan(0);
    await lookAt(page, id, 150);
    await page.waitForFunction(() => window.__warsim!.view!.subscription?.tier === 2 && window.__warsim!.view!.elementCount > 0, null, { timeout: 30_000 });
    await page.waitForFunction((id) => window.__warsim!.view!.tagRects.some((g) => g.id === id) && window.__warsim!.view!.tagOpacity > 0.99, id, { timeout: 15_000 });
    const tag = await page.evaluate((id) => window.__warsim!.view!.tagRects.find((g) => g.id === id)!.name, id);
    expect(tag, `${name}'s tag at T2`).toBe(name);
    await page.screenshot({ path: path.join(EVIDENCE, `b1-tag-${name.toLowerCase()}-150m.png`), clip: { x: 500, y: 250, width: 400, height: 300 } });
  }
});

/** What the sprite layer alone draws of one sprite (`MapView.drawUnitLayers(now, true)`), CSS px. */
interface Drawn {
  /** Its cover: the sum of its pixels' opacity (an edge pixel half covered counts a half), px². */
  cover: number;
  /** Its box: of its pixels at least 3/8 opaque. */
  w: number;
  h: number;
}

/**
 * Sprite `index` of the element layer (or with `figures` of the figure layer) drawn alone: the layer
 * drawn by itself (`MapView.drawUnitLayers(now, true)`) with every other instance but the sprite's
 * turret moved far off the map for that draw, its pixels flood-filled from the opaque pixel nearest
 * its place, the instances then put back.
 */
async function drawnAlone(page: Page, index: number, figures: boolean): Promise<Drawn> {
  return page.evaluate(({ index, figures }) => {
    const v = window.__warsim!.view!;
    // The instance buffers are the view's own (private in TypeScript, there at run time).
    const p = (v as unknown as Record<string, { data: Float32Array; count: number; upload(n: number): void }>)[figures ? 'individualProxies' : 'elementProxies']!;
    const first = figures ? v.individualCount : v.elementCount;
    const owner = figures ? v.individualTurretOwner : v.elementTurretOwner;
    const keep = new Set([index]);
    for (let k = 0; k < owner.length; k++) if (owner[k] === index) keep.add(first + k);
    const saved = p.data.slice(0, p.count * 8);
    for (let q = 0; q < p.count; q++) if (!keep.has(q)) for (let c = 0; c < 4; c++) p.data[q * 8 + c] = 1e6;
    p.upload(p.count);
    const canvas = document.querySelector('canvas')!;
    const gl = canvas.getContext('webgl2')!;
    v.drawUnitLayers(performance.now(), true);
    const [W, H] = [canvas.width, canvas.height];
    const dpr = W / canvas.clientWidth;
    const px = new Uint8Array(W * H * 4);
    gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
    p.data.set(saved);
    p.upload(p.count);
    const alpha = (x: number, y: number): number => (x >= 0 && y >= 0 && x < W && y < H ? px[(y * W + x) * 4 + 3]! : 0);
    const opaque = (x: number, y: number): boolean => alpha(x, y) > 8;
    // Where the sprite stands on the screen (the world paused: its place is its element's or figure's).
    const cam = v.controller.cam;
    const [wx, wy] = figures ? [v.individualX[index]!, v.individualY[index]!] : [v.elementX[index]!, v.elementY[index]!];
    const cx = Math.round(((wx - cam.cx) * cam.scale + canvas.clientWidth / 2) * dpr);
    const cy = H - 1 - Math.round(((wy - cam.cy) * cam.scale + canvas.clientHeight / 2) * dpr);
    let seed: [number, number] | null = null;
    for (let r = 0; r <= 8 && !seed; r++) for (let dy = -r; dy <= r && !seed; dy++) for (let dx = -r; dx <= r && !seed; dx++) if (opaque(cx + dx, cy + dy)) seed = [cx + dx, cy + dy];
    if (!seed) return { cover: 0, w: 0, h: 0 };
    const seen = new Uint8Array(W * H);
    const stack: [number, number][] = [seed];
    seen[seed[1] * W + seed[0]] = 1;
    let [cover, x0, x1, y0, y1] = [0, seed[0], seed[0], seed[1], seed[1]];
    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      cover += alpha(x, y) / 255;
      if (alpha(x, y) >= 96) [x0, x1, y0, y1] = [Math.min(x0, x), Math.max(x1, x), Math.min(y0, y), Math.max(y1, y)];
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]] as const) {
        if (!opaque(nx, ny) || seen[ny * W + nx]) continue;
        seen[ny * W + nx] = 1;
        stack.push([nx, ny]);
      }
    }
    return { cover: cover / (dpr * dpr), w: (x1 - x0 + 1) / dpr, h: (y1 - y0 + 1) / dpr };
  }, { index, figures });
}

/**
 * The element (T2) or figure (T3) of formation `hero`, or with `frame` the most isolated one of
 * that frame among those of `of` (a battleship of a squadron, a heavy tank of a division), in cells.
 */
async function pick(page: Page, of: number[], figures: boolean, frame?: number): Promise<{ at: [number, number]; frame: number; index: number }> {
  return page.evaluate(({ of, figures, frame }) => {
    const v = window.__warsim!.view!;
    const formationOfElement = new Map<number, number>();
    for (let i = 0; i < v.elementCount; i++) formationOfElement.set(v.elementId[i]!, v.elementFormation[i]!);
    const n = figures ? v.individualCount : v.elementCount;
    const at = (k: number): [number, number] => (figures ? [v.individualX[k]!, v.individualY[k]!] : [v.elementX[k]!, v.elementY[k]!]);
    const formationOf = (k: number): number => (figures ? (formationOfElement.get(v.individualOwner[k]!) ?? 0) : v.elementFormation[k]!);
    const frameOf = (k: number): number => (figures ? v.individualFrame(k) : v.elementFrame(k));
    let best = -1;
    let room = -1;
    for (let k = 0; k < n; k++) {
      if (!of.includes(formationOf(k)) || (frame !== undefined && frameOf(k) !== frame)) continue;
      const [x, y] = at(k);
      let near = Infinity;
      for (let q = 0; q < n; q++) if (q !== k) near = Math.min(near, Math.hypot(at(q)[0] - x, at(q)[1] - y));
      if (near > room) [best, room] = [k, near];
    }
    if (best < 0) throw new Error(`no ${figures ? 'figure' : 'element'}${frame !== undefined ? ` of frame ${frame}` : ''} of ${of.join(', ')}`);
    return { at: at(best), frame: frameOf(best), index: best };
  }, { of, figures, frame });
}

/** Centres the view on a cell point at `mPerPx` and waits for the tier's sprites. */
async function lookAtPoint(page: Page, [x, y]: [number, number], mPerPx: number, tier: number): Promise<void> {
  await page.evaluate(({ x, y, mPerPx }) => {
    const v = window.__warsim!.view!;
    v.controller.set({ cx: x, cy: y, scale: (v.metresPerPx * v.controller.cam.scale) / mPerPx });
  }, { x, y, mPerPx });
  await page.waitForFunction((tier) => {
    const v = window.__warsim!.view!;
    if (v.subscription?.tier !== tier || v.elementCount === 0) return false;
    return tier === 3 ? v.shares.individuals > 0.99 && v.individualCount > 0 : v.shares.elements > 0.99 && v.shares.individuals < 0.01;
  }, tier, { timeout: 30_000 });
  await page.waitForTimeout(1200);
}

test('PLAN 7.184b2: a hero is drawn twice its kind at T2 and T3, Classic and Countryball', async ({ page }) => {
  test.setTimeout(420_000);
  await openWithHeroes(page);
  const yamato = await heroId(page, 'Yamato');
  const maus = await heroId(page, 'Maus');
  // A heavy panzer division west of Berlin (its heavy tanks are the Maus's frame); Japan's battle
  // squadrons for Yamato. One hour on: the new division in the snapshot, nothing far from where it was.
  const others = await page.evaluate(async ({ yamato, maus, HEAVY }) => {
    const { sim, view } = window.__warsim!;
    const v = view!;
    const ger = v.formationNation(maus);
    const jap = v.formationNation(yamato);
    const [mx, my] = v.formationPos(maus)!;
    const before = new Set(v.formationsOf(ger));
    sim.command({ kind: 'spawnFormation', nation: ger, x: mx - 1.5, y: my, strength: 0, template: HEAVY });
    const tick = (await sim.step(1)).tick;
    await new Promise<void>((done) => {
      const wait = (): void => (v.lastTick === tick ? done() : void setTimeout(wait, 5));
      wait();
    });
    const tanks = v.formationsOf(ger).filter((f) => !before.has(f));
    const squadrons = v.formationsOf(jap).filter((f) => /Battle squadron/.test(v.formationTitle(f)?.name ?? ''));
    return { tanks, squadrons };
  }, { yamato, maus, HEAVY });
  expect(others.tanks, 'the heavy panzer division spawned').toHaveLength(1);
  expect(others.squadrons.length, "Japan's battle squadrons").toBeGreaterThan(0);
  const cases = [
    { hero: yamato, name: 'Yamato', others: others.squadrons },
    { hero: maus, name: 'Maus', others: others.tanks },
  ];
  const tiers = [
    { tier: 2, m: 150 },
    { tier: 3, m: 15 },
  ];
  const lines: string[] = [];
  const fails: string[] = [];
  for (const look of ['classic', 'balls'] as const) {
    await page.evaluate((look) => window.__warsim!.settings.setUnitLook(look), look);
    for (const { tier, m } of tiers) {
      for (const c of cases) {
        // Each on its own view: the subscription at T3 is a few km about the centre. The hero, then
        // the one of its frame among the others (the squadron nearest it), each at the view's centre.
        const drawn: Drawn[] = [];
        let frame = -1;
        for (const who of ['', '-normal'] as const) {
          const of = who === '' ? [c.hero] : c.others;
          const start = await page.evaluate(({ of, hero }) => {
            const v = window.__warsim!.view!;
            const [hx, hy] = v.formationPos(hero)!;
            const d = (f: number): number => Math.hypot(v.formationPos(f)![0] - hx, v.formationPos(f)![1] - hy);
            return v.formationPos([...of].sort((a, b) => d(a) - d(b))[0]!)!;
          }, { of, hero: c.hero });
          await lookAtPoint(page, start, m, tier);
          // The countryballs are one an element at T3 too (PLAN 7.174c): the figures are Classic's.
          const figures = tier === 3 && look === 'classic';
          const got = await pick(page, of, figures, who === '' ? undefined : frame);
          frame = got.frame;
          await lookAtPoint(page, got.at, m, tier);
          // Its index again: a snapshot may have come since the pick.
          const again = await pick(page, of, figures, frame);
          drawn.push(await drawnAlone(page, again.index, figures));
          await page.screenshot({ path: path.join(EVIDENCE, `b2-${look}-t${tier}-${c.name.toLowerCase()}${who}.png`), clip: { x: 550, y: 275, width: 300, height: 250 } });
        }
        const [hd, nd] = drawn as [Drawn, Drawn];
        // A sprite's side: Classic's the square root of its cover (a silhouette turns with its
        // facing, its cover does not); a countryball's its diameter, the lesser side of its box (it
        // stands upright, and a prop, which a ball shows from a size on, sticks out on one side).
        const side = (d: Drawn): number => (look === 'classic' ? Math.sqrt(d.cover) : Math.min(d.w, d.h));
        const ratio = side(hd) / side(nd);
        const line = `${look} T${tier} ${m} m/px ${c.name} (frame ${frame}): ${hd.cover.toFixed(0)} px² (${hd.w.toFixed(1)} × ${hd.h.toFixed(1)}) against ${nd.cover.toFixed(0)} px² (${nd.w.toFixed(1)} × ${nd.h.toFixed(1)}): side ${ratio.toFixed(3)} ×`;
        lines.push(line);
        if (!(side(nd) > 0 && ratio >= 1.9 && ratio <= 2.1)) fails.push(line);
      }
    }
  }
  writeFileSync(path.join(EVIDENCE, 'b2-sizes.txt'), `${lines.join('\n')}\n`);
  expect(fails, 'heroes not 1.9–2.1 × their kind').toEqual([]);
});

// ROADMAP R40d (critic run 48, R48-N3): with the whole world in view, heroes' counters at twice the others' covered
// Germany, France and Italy's names. From 10,000 m/px a hero's counter is its nation's size; T0 below keeps twice.
test('R40d: with the whole world in view a hero counter is its nation’s size', async ({ page }) => {
  test.setTimeout(180_000);
  await openWithHeroes(page);
  const id = await heroId(page, 'Maus');
  await lookAt(page, id, 20000);
  await page.waitForFunction((id) => window.__warsim!.view!.counters.drawn.some((d) => d.hero === id && d.alpha > 0.99), id, { timeout: 30_000 });
  await page.waitForTimeout(800);
  const r = await page.evaluate((id) => {
    const v = window.__warsim!.view!;
    const hero = v.counters.drawn.find((d) => d.hero === id)!;
    const own = v.counters.drawn.filter((d) => d.hero === undefined && d.nation === hero.nation && d.alpha > 0.99);
    return { hero: hero.h, own: own.map((d) => d.h) };
  }, id);
  expect(r.own.length, "Germany's other counters in the view").toBeGreaterThan(0);
  for (const h of r.own) expect(r.hero / h, `Maus ${r.hero.toFixed(1)} px against ${h.toFixed(1)} px`).toBeCloseTo(1, 1);
});

// ROADMAP R42c (critic run 49, R49-N1): from 1× to 2× between 10,001 and 9,999 m/px, a jump at one step of the wheel,
// and 2× at a Europe view; on a phone "P.100 Ercole" 38 % of the screen. Now blended by zoom level from 1× at 10,000
// to 2× at 5,000 (7.184b3's T0), and no wider than a quarter of the screen while above the others' size.
test('R42c: a hero counter grows with the zoom from 10,000 to 5,000 m/px, no jump; on a phone, within a quarter of it', async ({ page }) => {
  test.setTimeout(240_000);
  await openWithHeroes(page);
  const id = await heroId(page, 'Maus');
  const ratioAt = async (m: number): Promise<{ ratio: number; w: number }> => {
    await lookAt(page, id, m);
    await page.waitForFunction((id) => window.__warsim!.view!.counters.drawn.some((d) => d.hero === id && d.alpha > 0.99), id, { timeout: 30_000 });
    await page.waitForTimeout(400);
    return page.evaluate((id) => {
      const v = window.__warsim!.view!;
      const hero = v.counters.drawn.find((d) => d.hero === id)!;
      const own = v.counters.drawn.filter((d) => d.hero === undefined && d.nation === hero.nation && !d.naval && d.alpha > 0.99);
      return { ratio: hero.h / own[0]!.h, w: hero.w };
    }, id);
  };
  const lines: string[] = [];
  let last = 0;
  for (const m of [12000, 10001, 9999, 9000, 8000, 7000, 6000, 5001, 4000]) {
    const { ratio } = await ratioAt(m);
    lines.push(`desk ${m} m/px: ${ratio.toFixed(3)} ×`);
    if (m >= 10000) expect(ratio, `${m} m/px`).toBeCloseTo(1, 2);
    if (m <= 5001) expect(ratio, `${m} m/px`).toBeGreaterThan(1.97);
    expect(ratio, `${m} m/px: it grows as the view closes in`).toBeGreaterThanOrEqual(last - 0.01);
    // One step of the wheel (10,001 to 9,999 m/px) moves it by a hair, not 1× to 2× (R49-N1).
    if (m === 9999) expect(ratio - last, 'no jump at 10,000').toBeLessThan(0.01);
    last = ratio;
  }
  await lookAt(page, id, 8000);
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'test-results/heroes-r42c-desk-08000.png' });
  // A phone: no hero counter over a quarter of the screen's width while larger than the others.
  await page.setViewportSize({ width: 390, height: 844 });
  for (const m of [9999, 8000, 5000]) {
    const { ratio, w } = await ratioAt(m);
    lines.push(`phone ${m} m/px: ${ratio.toFixed(3)} ×, Maus ${w.toFixed(0)} px (${((100 * w) / 390).toFixed(0)} %)`);
    const widest = await page.evaluate(() => Math.max(...window.__warsim!.view!.counters.drawn.filter((d) => d.hero !== undefined).map((d) => d.w)));
    expect(widest / 390, `${m} m/px: the widest hero counter's share`).toBeLessThan(0.38);
    if (ratio > 1.01) expect(widest / 390).toBeLessThanOrEqual(0.25 + 0.01);
  }
  await page.screenshot({ path: 'test-results/heroes-r42c-phone-05000.png' });
  writeFileSync(path.join(EVIDENCE, 'r42c-sizes.txt'), `${lines.join('\n')}\n`);
});

test('PLAN 7.184b3: a hero is its own counter at T0 and its own marker at T1, twice its nation’s, both looks', async ({ page }) => {
  test.setTimeout(240_000);
  await openWithHeroes(page);
  const lines: string[] = [];
  const fails: string[] = [];
  const check = (line: string, ratios: number[]): void => {
    lines.push(line);
    if (!ratios.every((r) => r >= 1.9 && r <= 2.1)) fails.push(line);
  };
  for (const look of ['classic', 'balls'] as const) {
    await page.evaluate((look) => window.__warsim!.settings.setUnitLook(look), look);
    for (const name of ['Yamato', 'Maus']) {
      const id = await heroId(page, name);
      // T0: the counters as the layer drew them; the hero's box against its nation's others of its kind (a
      // navy's for Yamato), by height (a counter's width follows its text).
      await lookAt(page, id, 5000);
      await page.waitForFunction((id) => {
        const v = window.__warsim!.view!;
        return v.subscription?.tier === 0 && v.markerOpacity < 0.01 && v.counters.drawn.some((d) => d.hero === id && d.alpha > 0.99);
      }, id, { timeout: 30_000 });
      await page.waitForTimeout(800);
      const t0 = await page.evaluate((id) => {
        const v = window.__warsim!.view!;
        const hero = v.counters.drawn.find((d) => d.hero === id)!;
        const own = v.counters.drawn.filter((d) => d.hero === undefined && d.nation === hero.nation && d.naval === hero.naval && d.alpha > 0.99);
        return { hero: { w: hero.w, h: hero.h, text: hero.text }, own: own.map((d) => d.h), heroes: v.counters.drawn.filter((d) => d.hero !== undefined).length };
      }, id);
      expect(t0.own.length, `${name}: its nation's other counters of its kind in the view`).toBeGreaterThan(0);
      expect(t0.hero.text, `${name}'s counter reads its name`).toBe(name);
      check(`${look} T0 5,000 m/px ${name}: ${t0.hero.w.toFixed(1)} × ${t0.hero.h.toFixed(1)} px against heights ${[...new Set(t0.own.map((h) => h.toFixed(1)))].join(', ')}`, t0.own.map((h) => t0.hero.h / h));
      await page.screenshot({ path: path.join(EVIDENCE, `b3-${look}-t0-${name.toLowerCase()}.png`), clip: { x: 500, y: 250, width: 400, height: 300 } });
      // T1: the markers as drawn; the hero's alone (never in a stack), against each other of its nation.
      await lookAt(page, id, 1000);
      await page.waitForFunction((id) => {
        const v = window.__warsim!.view!;
        return v.markerOpacity > 0.99 && v.markerRects.some((r) => r.id === id);
      }, id, { timeout: 30_000 });
      await page.waitForTimeout(800);
      const t1 = await page.evaluate((id) => {
        const v = window.__warsim!.view!;
        const hero = v.markerRects.find((r) => r.id === id)!;
        const nation = v.formationNation(id);
        const heroes = new Set(v.heroFormations());
        const own = v.markerRects.filter((r) => r.nation === nation && !heroes.has(r.id) && r.alpha > 0.99);
        return { hero: { w: hero.w, h: hero.h, members: hero.members.length }, own: own.map((r) => [r.w, r.h] as const) };
      }, id);
      expect(t1.own.length, `${name}: its nation's other markers in the view`).toBeGreaterThan(0);
      expect(t1.hero.members, `${name}'s marker stands for itself alone`).toBe(1);
      check(`${look} T1 1,000 m/px ${name}: ${t1.hero.w.toFixed(1)} × ${t1.hero.h.toFixed(1)} px against ${[...new Set(t1.own.map(([w, h]) => `${w.toFixed(1)} × ${h.toFixed(1)}`))].join(', ')}`, t1.own.flatMap(([w, h]) => [t1.hero.w / w, t1.hero.h / h]));
      await page.screenshot({ path: path.join(EVIDENCE, `b3-${look}-t1-${name.toLowerCase()}.png`), clip: { x: 500, y: 250, width: 400, height: 300 } });
    }
  }
  writeFileSync(path.join(EVIDENCE, 'b3-sizes.txt'), `${lines.join('\n')}\n`);
  expect(fails, 'heroes not 1.9–2.1 × their nation’s counters and markers').toEqual([]);
});

test('PLAN 7.184c: a nation’s heroes first in its Overview; a row opens and follows its hero; a lost one returns in 60 days', async ({ page }) => {
  test.setTimeout(240_000);
  await openWithHeroes(page);
  const nationOf = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;
  const [JAP, POL] = [nationOf('JAP'), nationOf('POL')];
  await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), JAP);
  const overview = page.getByTestId('panel-overview');
  await expect(overview).toBeVisible();
  // The Overview's first block, with Japan's two.
  expect(await overview.evaluate((s) => (s.firstElementChild as HTMLElement | null)?.dataset.testid)).toBe('panel-heroes');
  const rows = page.getByTestId('hero-row');
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText('Yamato');
  await expect(rows.nth(1)).toContainText('O-I');
  await expect(rows.nth(0).getByTestId('hero-health')).toContainText('100%');
  await page.screenshot({ path: path.join(EVIDENCE_C, 'overview-japan.png'), clip: { x: 0, y: 0, width: 420, height: 500 } });
  // A click on Yamato's row: its panel, and the camera on it 24 ticks on, from far off (the view on
  // Europe at 1,500 m/px; at the world's zoom the view has no room to move).
  const yamato = await heroId(page, 'Yamato');
  await page.evaluate(() => {
    const v = window.__warsim!.view!;
    v.controller.set({ cx: v.geo.w * 0.52, cy: v.geo.h * 0.25, scale: (v.metresPerPx * v.controller.cam.scale) / 1500 });
  });
  await rows.nth(0).click();
  expect(await page.evaluate(() => window.__warsim!.hud.formation.value)).toBe(yamato);
  expect(await page.evaluate(() => window.__warsim!.view!.controller.following), 'following after the click').toBe(true);
  await page.evaluate(async () => {
    const { sim, view } = window.__warsim!;
    const tick = (await sim.step(24)).tick;
    await new Promise<void>((done) => {
      const wait = (): void => (view!.lastTick === tick ? done() : void setTimeout(wait, 5));
      wait();
    });
  });
  await page.waitForTimeout(1500);
  const off = await page.evaluate(() => {
    const v = window.__warsim!.view!;
    const p = v.pickedPoint()!;
    const cam = v.controller.cam;
    return Math.hypot(p[0] - cam.cx, p[1] - cam.cy) * cam.scale;
  });
  expect(off, 'px between the view’s centre and Yamato').toBeLessThanOrEqual(2);
  await page.screenshot({ path: path.join(EVIDENCE_C, 'yamato-followed.png') });
  // Yamato lost: its row says when it is back.
  await page.evaluate(async (id) => {
    const { sim, view } = window.__warsim!;
    sim.command({ kind: 'removeFormation', id });
    const tick = (await sim.step(1)).tick;
    await new Promise<void>((done) => {
      const wait = (): void => (view!.lastTick === tick ? done() : void setTimeout(wait, 5));
      wait();
    });
  }, yamato);
  await expect(rows.nth(0).getByTestId('hero-return')).toHaveText('returns in 60 days', { timeout: 15_000 });
  await expect(rows.nth(0)).toBeDisabled();
  await page.screenshot({ path: path.join(EVIDENCE_C, 'overview-japan-lost.png'), clip: { x: 0, y: 0, width: 420, height: 500 } });
  // Poland has none.
  await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), POL);
  await expect(page.getByTestId('nation-panel')).toHaveAttribute('data-nation', String(POL));
  await expect(page.getByTestId('panel-heroes')).toHaveCount(0);
  // Without the option, Japan has none.
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.evaluate((n) => window.__warsim!.hud.onSelectNation(n), JAP);
  await expect(page.getByTestId('panel-overview')).toBeVisible();
  await expect(page.getByTestId('panel-heroes')).toHaveCount(0);
});

// ROADMAP R8 (critic run 29, R29-B1): at the world's zoom, the view a heroes game opens on, a hero's
// counter that would cover another's stepped down as often as it took: Europe's ten cascaded into
// Africa (seed 5521: P.100 Ercole drawn 5,009 km from itself), and a click on one opened the nation
// under it. Now each counter is drawn within a step (its height and 2 px) of its place; a hero that
// finds no room within a step is folded into the counter it covers ("Char 2C +2"); every hero is on
// a counter; a click on one opens its first hero, and a click again the next.
for (const [label, width, height] of [['desk', 1600, 900], ['phone', 390, 844]] as const) {
  test(`ROADMAP R8: at the start view (${label}), every hero's counter near its place, and a click opens it`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height });
    await page.goto('/?scenario=1938&paused=1&seed=5521&heroes=on');
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null && window.__warsim!.view!.counters.drawn.some((d) => d.hero !== undefined && d.alpha > 0.99), null, { timeout: 60_000 });
    await page.waitForTimeout(800);
    const read = (): Promise<{ id: number; heroes: number[]; name: string; dy: number; x: number; y: number; w: number; h: number }[]> =>
      page.evaluate(() => {
        const v = window.__warsim!.view!;
        const c = v.controller.cam;
        return v.counters.drawn
          .filter((d) => d.hero !== undefined)
          .map((d) => ({ id: d.hero!, heroes: d.heroes ?? [d.hero!], name: d.text, dy: d.y + d.h / 2 - ((d.wy - c.cy) * c.scale + innerHeight / 2), x: d.x, y: d.y, w: d.w, h: d.h }));
      });
    const drawn = await read();
    expect(drawn.length, 'hero counters drawn at the start view').toBeGreaterThan(0);
    const far = drawn.filter((d) => Math.abs(d.dy) > d.h * 1.2 + 0.5).map((d) => `${d.name} ${d.dy.toFixed(0)} px`);
    expect(far, 'hero counters drawn more than a step from their place').toEqual([]);
    const shown = new Set(drawn.flatMap((d) => d.heroes));
    const inView = await page.evaluate(() => {
      const v = window.__warsim!.view!;
      const c = v.controller.cam;
      return v.heroFormations().filter((f) => {
        const [x, y] = v.formationPos(f)!;
        const sx = (x - c.cx) * c.scale + innerWidth / 2;
        const sy = (y - c.cy) * c.scale + innerHeight / 2;
        return sx > 0 && sx < innerWidth && sy > 0 && sy < innerHeight;
      }).length;
    });
    expect(shown.size, 'heroes on a counter, of those whose place is in the view').toBeGreaterThanOrEqual(inView);
    await page.screenshot({ path: test.info().outputPath(`r8-${label}-start.png`) });
    // Each counter clicked at a point no later hero counter covers, where the map is on top (the
    // page's panels take their own clicks), the view at the start view again each time (a click
    // opens the hero, and the camera follows it); then once more for one with heroes folded in.
    const start = await page.evaluate(() => ({ ...window.__warsim!.view!.controller.cam }));
    const pointOf = (lead: number): Promise<readonly [number, number] | null> =>
      page.evaluate(({ lead, width, height }) => {
        const all = window.__warsim!.view!.counters.drawn.filter((d) => d.hero !== undefined);
        const k = all.findIndex((d) => (d.heroes ?? [d.hero]).includes(lead));
        if (k < 0) return null;
        const d = all[k]!;
        const later = all.slice(k + 1);
        const pts = [0.5, 0.2, 0.8].flatMap((fx) => [0.5, 0.25, 0.75].map((fy) => [d.x + d.w * fx, d.y + d.h * fy] as const));
        return pts.find(([x, y]) => x > 0 && y > 0 && x < width && y < height && !later.some((o) => x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h) && document.elementFromPoint(x, y)?.tagName === 'CANVAS') ?? null;
      }, { lead, width, height });
    const tried: string[] = [];
    let cycled = 0;
    for (const { id, heroes, name } of drawn) {
      await page.evaluate((cam) => {
        window.__warsim!.hud.selectFormation(0);
        window.__warsim!.view!.controller.set(cam);
      }, start);
      await page.waitForTimeout(400);
      const at = await pointOf(id);
      if (!at) continue;
      await page.mouse.click(at[0], at[1]);
      await expect.poll(() => page.evaluate(() => window.__warsim!.hud.formation.value), { message: `a click on ${name}`, timeout: 5_000 }).toBe(id);
      tried.push(name);
      if (heroes.length < 2) continue;
      await page.waitForTimeout(400);
      const again = await pointOf(id);
      if (!again) continue;
      await page.mouse.click(again[0], again[1]);
      await expect.poll(() => page.evaluate(() => window.__warsim!.hud.formation.value), { message: `a second click on ${name}`, timeout: 5_000 }).toBe(heroes[1]);
      cycled++;
    }
    expect(tried.length, 'hero counters clicked').toBeGreaterThan(Math.min(3, drawn.length - 1));
    if (drawn.some((d) => d.heroes.length > 1)) expect(cycled, 'folded counters clicked twice').toBeGreaterThan(0);
  });
}

// ROADMAP R14 (critic run 30, R30-B1): on a phone the panel a tap on a folded hero counter opens
// covers the counter, and closing it (× or Escape) started the fold's round at its lead again: HMS
// Hood, TOG II and Char 2C were never opened on 5521. And a fold took another nation's hero (Hood
// in "Sovetsky Soyuz +1", under the Soviet flag). Now a fold is of one nation, and its round is kept
// with the panel closed: tapped once per hero, the panel closed before each tap, a fold opens each.
for (const [label, width, height, touch] of [['desk', 1600, 900, false], ['phone', 390, 844, true]] as const) {
  test.describe(`ROADMAP R14 (${label})`, () => {
    test.use({ hasTouch: touch });
    test(`ROADMAP R14: at the start view (${label}), every hero on a counter of its nation, each opened by taps on it`, async ({ page }) => {
      test.setTimeout(240_000);
      await page.setViewportSize({ width, height });
      await page.goto('/?scenario=1938&paused=1&seed=5521&heroes=on');
      await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null && window.__warsim!.view!.counters.drawn.some((d) => d.hero !== undefined && d.alpha > 0.99), null, { timeout: 60_000 });
      await page.waitForTimeout(800);
      const start = await page.evaluate(() => ({ ...window.__warsim!.view!.controller.cam }));
      const folds = await page.evaluate(() => {
        const v = window.__warsim!.view!;
        const c = v.controller.cam;
        return v.counters.drawn
          .filter((d) => d.hero !== undefined)
          .map((d) => ({ name: d.text, heroes: d.heroes ?? [d.hero!], nations: (d.heroes ?? [d.hero!]).map((id) => v.formationNation(id)), x: d.x, w: d.w, px: (d.wx - c.cx) * c.scale + innerWidth / 2 }));
      });
      const mixed = folds.filter((f) => new Set(f.nations).size > 1).map((f) => f.name);
      expect(mixed, 'folds of two nations').toEqual([]);
      // A counter whose place is in the view is whole in it (a "+1" was cut by the edge).
      const cut = folds.filter((f) => f.px >= 0 && f.px <= width && (f.x < -0.5 || f.x + f.w > width + 0.5)).map((f) => f.name);
      expect(cut, 'hero counters of a place in view cut by the screen edge').toEqual([]);
      await page.screenshot({ path: test.info().outputPath(`r14-${label}-start.png`) });
      // A point of the counter the map takes (no panel over it, no later hero counter), at the start view.
      const pointOf = (lead: number): Promise<readonly [number, number] | null> =>
        page.evaluate(({ lead, width, height }) => {
          const all = window.__warsim!.view!.counters.drawn.filter((d) => d.hero !== undefined);
          const k = all.findIndex((d) => (d.heroes ?? [d.hero]).includes(lead));
          if (k < 0) return null;
          const d = all[k]!;
          const later = all.slice(k + 1);
          const pts = [0.5, 0.2, 0.8].flatMap((fx) => [0.5, 0.25, 0.75].map((fy) => [d.x + d.w * fx, d.y + d.h * fy] as const));
          return pts.find(([x, y]) => x > 0 && y > 0 && x < width && y < height && !later.some((o) => x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h) && document.elementFromPoint(x, y)?.tagName === 'CANVAS') ?? null;
        }, { lead, width, height });
      const reached = new Set<number>();
      let tapped = 0;
      for (const f of folds) {
        for (let j = 0; j < f.heroes.length; j++) {
          // The panel closed (as its × closes it; Escape with none open would close the Ranking), the view
          // at the start view again (a pick follows).
          await page.evaluate((cam) => {
            window.__warsim!.hud.selectFormation(0);
            window.__warsim!.view!.controller.set(cam);
          }, start);
          await page.waitForTimeout(400);
          await expect.poll(() => page.evaluate(() => window.__warsim!.hud.formation.value), { timeout: 5_000 }).toBe(0);
          const at = await pointOf(f.heroes[0]!);
          if (!at) break;
          if (touch) await page.touchscreen.tap(at[0], at[1]);
          else await page.mouse.click(at[0], at[1]);
          await expect.poll(() => page.evaluate(() => window.__warsim!.hud.formation.value), { message: `tap ${j + 1} on ${f.name}`, timeout: 5_000 }).toBe(f.heroes[j]);
          reached.add(f.heroes[j]!);
          tapped++;
        }
      }
      const onCounters = folds.flatMap((f) => f.heroes);
      await page.evaluate((cam) => {
        window.__warsim!.hud.selectFormation(0);
        window.__warsim!.view!.controller.set(cam);
      }, start);
      await page.waitForTimeout(400);
      expect(tapped, 'taps made').toBeGreaterThan(3);
      // Every hero of a counter the map takes is reached (Japan's two under the desk's Ranking panel are R30-N2's).
      const open = [];
      for (const f of folds) if (await pointOf(f.heroes[0]!)) open.push(...f.heroes);
      expect([...reached].sort(), `heroes reached of ${onCounters.length} on counters`).toEqual([...new Set(open)].sort());
      await page.screenshot({ path: test.info().outputPath(`r14-${label}-last.png`) });
    });
  });
}
