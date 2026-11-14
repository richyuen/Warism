import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { NATIONS_1938 } from '../../src/sim/scenario1938';

// ROADMAP R81e (critic run 67: "the relations graph labels few of its nodes; a truce is told only in its footer",
// 39939 a year on, the graph on Germany): at a desk (1600 × 900) and on a phone (390 × 844), the whole graph and the
// graph on Germany: every nation at war or in an alliance named (and, when they are fewer, the largest up to 15), no
// two labels overlapping; every truce drawn as a truce (its own dashed edge, `data-kind="truce"`).

type Rect = { x: number; y: number; w: number; h: number; text: string };

const labels = (page: Page): Promise<Rect[]> =>
  page.locator('.relations-label').evaluateAll((els) =>
    els.map((e) => {
      const r = e.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height, text: e.textContent ?? '' };
    }),
  );

const overlapping = (rs: Rect[]): string[] => {
  const out: string[] = [];
  for (let i = 0; i < rs.length; i++)
    for (let j = i + 1; j < rs.length; j++) {
      const [a, b] = [rs[i]!, rs[j]!];
      if (a.x < b.x + b.w - 1 && b.x < a.x + a.w - 1 && a.y < b.y + b.h - 1 && b.y < a.y + a.h - 1) out.push(`${a.text} / ${b.text}`);
    }
  return out;
};

/** The graph as drawn: the nations at war or in an alliance, those named, and the truces drawn. */
const read = (page: Page): Promise<{ tied: string[]; named: string[]; nodes: string[]; truces: number; hidden: string[] }> =>
  page.evaluate(() => {
    const tied = new Set<string>();
    for (const e of document.querySelectorAll<SVGGElement>('.relations-edge'))
      if (e.dataset['kind'] === 'war' || e.dataset['kind'] === 'alliance') for (const k of [e.dataset['from']!, e.dataset['to']!]) if (document.querySelector(`[data-testid="relations-node-${k}"].relations-nation`)) tied.add(k);
    const named = [...document.querySelectorAll('.relations-label')].map((e) => e.getAttribute('data-testid')!.replace('relations-label-', ''));
    const nodes = [...document.querySelectorAll('.relations-nation')].map((e) => e.getAttribute('data-testid')!.replace('relations-node-', ''));
    // A truce's line the same as another line of its pair: drawn under it, not seen.
    const all = [...document.querySelectorAll<SVGGElement>('.relations-edge')];
    const pair = (e: SVGGElement): string => [e.dataset['from']!, e.dataset['to']!].sort().join('|');
    const hidden = all
      .filter((e) => e.dataset['kind'] === 'truce')
      .filter((e) => all.some((o) => o !== e && pair(o) === pair(e) && o.querySelector('.relations-line')!.getAttribute('d') === e.querySelector('.relations-line')!.getAttribute('d')))
      .map(pair);
    return { tied: [...tied], named, nodes, truces: all.filter((e) => e.dataset['kind'] === 'truce').length, hidden };
  });

for (const seed of [39939, 39941, 39943])
  for (const [name, width, height] of [['desk', 1600, 900], ['phone', 390, 844]] as const)
    test(`seed ${seed} a year on, ${name}: every nation at war or in an alliance named, no overlap; truces drawn`, async ({ page }, info) => {
      test.setTimeout(300_000);
      await page.setViewportSize({ width, height });
      await page.goto(`/?scenario=1938&paused=1&seed=${seed}`);
      await page.waitForFunction(() => window.__warsim?.hud.stats.value !== null && window.__warsim?.hud.stats.value !== undefined, null, { timeout: 60_000 });
      await page.evaluate(() => window.__warsim!.sim.step(24 * 365));
      await page.waitForFunction(() => (window.__warsim!.view?.lastTick ?? 0) >= 24 * 365, null, { timeout: 240_000 });
      const btn = page.getByTestId('relations-btn');
      await btn.scrollIntoViewIfNeeded();
      await btn.click();
      await expect(page.getByTestId('relations-panel')).toBeVisible();
      await expect.poll(async () => (await labels(page)).length).toBeGreaterThan(3);
      const GER = NATIONS_1938.findIndex((n) => n.tag === 'GER') + 1;
      for (const view of ['whole', 'Germany'] as const) {
        if (view === 'Germany') {
          await page.getByTestId('relations-focus').selectOption(String(GER));
          await page.waitForTimeout(400);
        }
        const g = await read(page);
        // The truces in force now between listed nations (each kept on one side of its pair), read as the graph is.
        const truces = await page.evaluate(() => {
          const pairs = new Set<string>();
          const ns = window.__warsim!.hud.stats.value!.nations;
          const listed = new Set(ns.map((n) => n.id));
          // A truce with a nation gone (not listed) has no node to draw it to.
          for (const n of ns) for (const x of n.truces) if (listed.has(x.with)) pairs.add(`${Math.min(n.id, x.with)},${Math.max(n.id, x.with)}`);
          return pairs.size;
        });
        const rs = await labels(page);
        const missing = g.tied.filter((k) => !g.named.includes(k));
        process.stderr.write(`R81e ${seed} ${name} ${view}: ${g.nodes.length} nations drawn, ${g.tied.length} at war or allied, ${g.named.length} named, ${missing.length} of those unnamed; ${g.truces} truce edges of ${truces} truces, ${g.hidden.length} under another line\n`);
        await page.screenshot({ path: path.join(info.outputPath(), `relations-${seed}-${name}-${view}.png`) });
        expect(overlapping(rs), `${view}: overlapping labels`).toEqual([]);
        expect(missing, `${view}: at war or allied, unnamed`).toEqual([]);
        expect(g.named.length, `${view}: named`).toBeGreaterThanOrEqual(Math.min(15, g.nodes.length));
        if (view === 'whole') expect(g.truces, 'every truce its own edge').toBe(truces);
        expect(g.hidden, `${view}: truces drawn under another line of their pair`).toEqual([]);
      }
    });
