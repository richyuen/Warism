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
