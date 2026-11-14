import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';

// ROADMAP R82a (critic run 68, R68-B1: "Undo, and any load, leaves the undone burst's ruins and fallout drawn"): the
// picture, not only the hash. A layer the worker sends only while the world has some (fallout, ruins) was never sent
// empty after a load, so the page kept the burst's. Each God tool's act undone, the map's picture after the Undo
// against the one before the act; and a save of before a burst loaded over the game that had it, against the same
// save loaded in a fresh page. Pixels whose largest channel differs by over 40, in the map clear of the bars (the
// critic's `c68_pixdiff.py`), read in the page from two screenshots.

const { w: W, h: H } = SIZE_1938;
const WARSAW = cellOf(21.01, 52.23, W, H);

type Rect = { x: number; y: number; w: number; h: number };

/** The pixels differing by over 40 between two PNG screenshots, in the box clear of the page's bars, outside `skip`. */
const differing = (page: Page, a: Buffer, b: Buffer, skip: Rect[] = []): Promise<number> =>
  page.evaluate(
    async ([a, b, skip]) => {
      const img = async (b64: string): Promise<ImageData> => {
        const bmp = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
        const c = new OffscreenCanvas(bmp.width, bmp.height);
        const g = c.getContext('2d')!;
        g.drawImage(bmp, 0, 0);
        return g.getImageData(300, 60, 1000, bmp.height - 220);
      };
      const [p, q] = [await img(a as string), await img(b as string)];
      const rects = skip as { x: number; y: number; w: number; h: number }[];
      let n = 0;
      for (let i = 0; i < p.data.length; i += 4) {
        const [x, y] = [300 + ((i / 4) % p.width), 60 + Math.floor(i / 4 / p.width)];
        if (rects.some((r) => x >= r.x - 4 && x <= r.x + r.w + 4 && y >= r.y - 4 && y <= r.y + r.h + 4)) continue;
        if (Math.max(Math.abs(p.data[i]! - q.data[i]!), Math.abs(p.data[i + 1]! - q.data[i + 1]!), Math.abs(p.data[i + 2]! - q.data[i + 2]!)) > 40) n++;
      }
      return n;
    },
    [a.toString('base64'), b.toString('base64'), skip] as const,
  );

/** The cities named in view: each one's index and name box. */
const names = (page: Page): Promise<Map<number, Rect>> =>
  page
    .evaluate(() => {
      const v = window.__warsim!.view! as unknown as { cityLabels: { lastPlaced: { index: number; nameAlpha: number; box?: { x: number; y: number; w: number; h: number }; ghost?: boolean }[] } };
      return v.cityLabels.lastPlaced.filter((l) => l.nameAlpha > 0.5 && l.box && !l.ghost).map((l) => [l.index, l.box!] as const);
    })
    .then((xs) => new Map(xs));

/** The name boxes, before and after, of the cities named in both whose name took another place. */
const moved = (a: Map<number, Rect>, b: Map<number, Rect>): Rect[] =>
  [...a].flatMap(([i, r]) => {
    const q = b.get(i);
    return q && (Math.abs(q.x - r.x) > 1 || Math.abs(q.y - r.y) > 1) ? [r, q] : [];
  });

async function open(page: Page, seed: number): Promise<void> {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(`/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null && window.__warsim!.sim.mapLayers !== null, null, { timeout: 60_000 });
  await page.waitForFunction(() => window.__warsim!.view!.hasFineCoast, null, { timeout: 60_000 });
}

/** The camera on (x, y) at `m` m/px, the pointer off the map, the view settled; its screenshot. */
async function look(page: Page, x: number, y: number, m: number): Promise<Buffer> {
  await page.evaluate(({ x, y, m }) => window.__warsim!.view!.controller.set({ cx: x, cy: y, scale: (window.__warsim!.view!.geo.kmPerCell * 1000) / m }), { x, y, m });
  await page.mouse.move(5, 300);
  await page.waitForTimeout(1500);
  return page.screenshot();
}

const closeAlerts = async (page: Page): Promise<void> => {
  for (let i = 0; i < 3; i++) if (await page.getByTestId('nuke-close').count()) await page.getByTestId('nuke-close').first().click().catch(() => {});
};

test("each God tool's act undone: the map's picture as before it", async ({ page }, info) => {
  test.setTimeout(300_000);
  await open(page, 41211);
  await page.getByTestId('god-btn').click();
  const [wx, wy] = WARSAW;
  const cases: [string, number, number, number, () => Promise<void>][] = [
    ['nuke', wx, wy, 937, async () => { await page.getByTestId('god-tool-nuke').click(); await page.getByTestId('god-nuke-size').selectOption('thermonuclear'); await page.mouse.click(800, 450); }],
    ['revolt', wx, wy, 937, async () => { await page.getByTestId('god-tool-revolt').click(); await page.mouse.click(800, 450); }],
    ['nation', wx + 6, wy, 600, async () => { await page.getByTestId('god-tool-nation').click(); await page.mouse.click(800, 450); }],
    ['city', wx - 8, wy + 4, 300, async () => { await page.getByTestId('god-tool-city').click(); await page.mouse.click(800, 450); }],
    ['raze', wx, wy, 300, async () => { await page.getByTestId('god-tool-raze').click(); await page.mouse.click(800, 450); }],
  ];
  for (const [name, x, y, m, act] of cases) {
    const before = await look(page, x, y, m);
    const namedBefore = await names(page);
    await act();
    await expect(page.getByTestId('god-undo'), name).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(2000);
    const acted = await look(page, x, y, m);
    await page.getByTestId('god-undo').click();
    await expect(page.getByTestId('god-undone'), name).toBeVisible({ timeout: 15_000 });
    await page.keyboard.press('Escape');
    await closeAlerts(page);
    const after = await look(page, x, y, m);
    const namedAfter = await names(page);
    await page.screenshot({ path: path.join(info.outputPath(), `undone-${name}.png`) });
    // A city's name may take another free place after a load (the names' places start afresh, a layout matter, not the
    // world's): the two places of a name that moved are left out; every city named before is named again.
    expect([...namedBefore.keys()].filter((i) => !namedAfter.has(i)), `${name}: cities no longer named`).toEqual([]);
    const skip = moved(namedBefore, namedAfter);
    const [changed, left] = [await differing(page, before, acted), await differing(page, before, after, skip)];
    process.stderr.write(`R82a ${name}: the act changed ${changed} px; after Undo ${left} px differ from before\n`);
    expect(changed, `${name}: the act drawn`).toBeGreaterThan(0);
    // A burst's scar was 7,028 px (the critic) and 13,391 here.
    expect(left, `${name}: px differing after Undo`).toBeLessThanOrEqual(name === 'nuke' ? 0 : 40);
  }
});

test('a save of before a burst loaded over the game that had it: the picture of a fresh page', async ({ page, browser }) => {
  test.setTimeout(300_000);
  await open(page, 41203);
  const [wx, wy] = WARSAW;
  await page.evaluate(() => window.__warsim!.sim.step(24));
  const save = await page.evaluate(async () => Array.from(await window.__warsim!.sim.save()));
  await page.evaluate(({ x, y }) => window.__warsim!.hud.command({ kind: 'godNuke', x, y, thermonuclear: true }, 'act'), { x: wx, y: wy });
  await page.evaluate(() => window.__warsim!.sim.step(48));
  await closeAlerts(page);
  await page.evaluate(async (b) => { await window.__warsim!.sim.load(new Uint8Array(b)); }, save);
  await closeAlerts(page);
  const loaded = await look(page, wx, wy, 937);
  const fresh = await browser.newPage();
  await open(fresh, 41203);
  await fresh.evaluate(async (b) => { await window.__warsim!.sim.load(new Uint8Array(b)); }, save);
  const clean = await look(fresh, wx, wy, 937);
  const left = await differing(page, loaded, clean);
  process.stderr.write(`R82a load: ${left} px differ from a fresh page's\n`);
  expect(left, 'px differing from a fresh page').toBeLessThanOrEqual(40);
});
