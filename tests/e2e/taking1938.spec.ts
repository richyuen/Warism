import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { lookAt, open1938 } from './mapView';

// ROADMAP R105 (ADR-1096): ground being taken is seen. A cell of a front whose holder is being out-pressed glows, the
// more the nearer it is to changing hands; a stretch that nobody out-presses does not. Germany's war on Poland by God
// Mode, looked at over Silesia: no glow there in peace; in the war, a glow at the cells the snapshot says are being
// taken, each a cell of one of the two with the other beside it, and the picture there lighter with the glow than
// without it.

const { w: W, h: H } = SIZE_1938;
const nation = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;
const [GER, POL] = [nation('GER'), nation('POL')];

test('ground being taken glows along a front at war, and not at peace', async ({ page }, info) => {
  test.setTimeout(240_000);
  await open1938(page, 1938);
  const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R105') : info.outputPath();
  mkdirSync(out, { recursive: true });
  const [cx, cy] = cellOf(17.5, 51, W, H);
  /** The cells being taken in the view of the two nations' land: their number, those with the other beside them, and the glows drawn. */
  const read = (): Promise<{ inView: number; fronts: number; drawn: number; most: number }> =>
    page.evaluate(({ a, b }) => {
      const v = window.__warsim!.view!;
      v.draw(performance.now() + 1e6);
      const grid = (v as unknown as { controlGrid: Uint16Array }).controlGrid;
      const gw = v.geo.w;
      const cam = v.controller.cam;
      const canvas = document.getElementById('map') as HTMLCanvasElement;
      let [inView, fronts, most] = [0, 0, 0];
      for (const packed of v.taking) {
        const c = Math.floor(packed / 256);
        const [x, y] = [c % gw, Math.floor(c / gw)];
        const [sx, sy] = [(x + 0.5 - cam.cx) * cam.scale + canvas.clientWidth / 2, (y + 0.5 - cam.cy) * cam.scale + canvas.clientHeight / 2];
        if (sx < 0 || sy < 0 || sx > canvas.clientWidth || sy > canvas.clientHeight) continue;
        const holder = grid[c]!;
        if (holder !== a && holder !== b) continue;
        inView++;
        most = Math.max(most, packed % 256);
        const other = holder === a ? b : a;
        if ([c - 1, c + 1, c - gw, c + gw].some((k) => grid[k] === other)) fronts++;
      }
      return { inView, fronts, drawn: v.takingDrawn, most };
    }, { a: GER, b: POL });
  await lookAt(page, cx, cy, 1500);
  const peace = await read();
  expect(peace.inView, 'no cell of Germany or Poland being taken in peace').toBe(0);
  await page.evaluate(({ a, d }) => window.__warsim!.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: GER, d: POL });
  // Until the front over Silesia has a few cells being taken, some of them well on.
  let war = peace;
  let hour = 0;
  for (; hour < 96 && !(war.inView >= 4 && war.most >= 120); hour += 3) {
    await page.evaluate((h) => window.__warsim!.sim.step(h - window.__warsim!.view!.lastTick), hour + 3);
    await page.waitForFunction((h) => window.__warsim!.view!.lastTick >= h, hour + 3, { timeout: 60_000 });
    war = await read();
  }
  process.stderr.write(`hour ${hour}: ${war.inView} cells of the two being taken in view (${war.fronts} with the other beside them), the most progress ${war.most} of 255; ${war.drawn} glows drawn\n`);
  expect(war.inView, 'cells being taken in view').toBeGreaterThanOrEqual(4);
  expect(war.fronts, 'each at the front of the two').toBe(war.inView);
  expect(war.drawn, 'a glow for each').toBeGreaterThanOrEqual(war.inView);
  // The picture with the glow and without: lighter about the cells being taken, the same elsewhere.
  const shot = async (shown: boolean): Promise<Buffer> => {
    await page.evaluate((s) => {
      const v = window.__warsim!.view!;
      v.takingShown = s;
      v.requestDraw();
    }, shown);
    await page.waitForTimeout(400);
    return page.screenshot();
  };
  const without = await shot(false);
  const withIt = await shot(true);
  const differing = await page.evaluate(async ({ p, q }) => {
    const load = async (b64: string): Promise<ImageData> => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = document.createElement('canvas');
      [c.width, c.height] = [img.width, img.height];
      const g = c.getContext('2d')!;
      g.drawImage(img, 0, 0);
      return g.getImageData(0, 0, c.width, c.height);
    };
    const [a, b] = [await load(p), await load(q)];
    let [n, lighter] = [0, 0];
    for (let i = 0; i < a.data.length; i += 4) {
      const [la, lb] = [a.data[i]! + a.data[i + 1]! + a.data[i + 2]!, b.data[i]! + b.data[i + 1]! + b.data[i + 2]!];
      if (Math.abs(la - lb) > 12) {
        n++;
        if (lb > la) lighter++;
      }
    }
    return { n, lighter };
  }, { p: without.toString('base64'), q: withIt.toString('base64') });
  process.stderr.write(`with the glow ${differing.n} px differ from without, ${differing.lighter} of them lighter\n`);
  expect(differing.n, 'px the glow changes').toBeGreaterThan(200);
  // The shots on the war's fifth day, the front in motion.
  await page.evaluate(() => window.__warsim!.sim.step(120 - window.__warsim!.view!.lastTick));
  await page.waitForFunction(() => window.__warsim!.view!.lastTick >= 120, null, { timeout: 60_000 });
  for (const m of [4000, 1500, 600]) {
    await lookAt(page, cx, cy, m);
    await page.screenshot({ path: path.join(out, `taking-${m}.png`) });
  }
});
