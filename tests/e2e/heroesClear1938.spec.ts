import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';

// ROADMAP R34e (critic run 31, R31-N1: Japan's two hero counters under the Ranking at every desk start view, 5521
// and 1201; Sovetsky Soyuz cut by it on 7019 at day 730): no hero counter is drawn under a panel over the map at a
// desk, at the start view and two years on; one moved beside a panel is still clicked open.

type Box = { x: number; y: number; w: number; h: number };

const covered = (page: Page): Promise<{ heroes: (Box & { hero: number })[]; panels: (Box & { cls: string })[] }> =>
  page.evaluate(() => {
    const v = window.__warsim!.view!;
    const cr = document.querySelector('canvas')!.getBoundingClientRect();
    const heroes = v.counters.drawn.filter((d) => d.hero !== undefined && d.alpha > 0.9).map((d) => ({ x: d.x + cr.left, y: d.y + cr.top, w: d.w, h: d.h, hero: d.hero! }));
    const panels = [...document.querySelectorAll<HTMLElement>('.topbar, .bottombar, .stats-ranking, .nation-panel, .map-legend')]
      .map((el) => ({ r: el.getBoundingClientRect(), cls: el.className }))
      .filter((p) => p.r.width > 0 && p.r.height > 0)
      .map((p) => ({ x: p.r.left, y: p.r.top, w: p.r.width, h: p.r.height, cls: p.cls }));
    return { heroes, panels };
  });

const under = (b: Box, p: Box): boolean => b.x < p.x + p.w - 0.5 && p.x < b.x + b.w - 0.5 && b.y < p.y + p.h - 0.5 && p.y < b.y + b.h - 0.5;

for (const [seed, days] of [[5521, 0], [1201, 0], [7019, 730]] as const) {
  test(`desk, seed ${seed}${days ? ` day ${days}` : ''}: no hero counter under a panel`, async ({ page }, info) => {
    test.setTimeout(300_000);
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto(`/?scenario=1938&paused=1&seed=${seed}&heroes=on`);
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
    if (days > 0) {
      await page.evaluate((h) => window.__warsim!.sim.step(h), days * 24);
      await page.waitForFunction((h) => (window.__warsim!.view?.lastTick ?? 0) >= h, days * 24, { timeout: 240_000 });
    }
    await page.waitForTimeout(600);
    const { heroes, panels } = await covered(page);
    expect(heroes.length, 'hero counters drawn').toBeGreaterThan(0);
    const bad = heroes.flatMap((h) => panels.filter((p) => under(h, p)).map((p) => `hero ${h.hero} under ${p.cls}`));
    process.stderr.write(`R34e ${seed}/${days}: ${heroes.length} hero counters, ${bad.length} under a panel\n`);
    expect(bad).toEqual([]);
    const out = process.env['EVIDENCE'] ? path.resolve(import.meta.dirname, '../../docs/evidence/R34') : info.outputPath();
    mkdirSync(out, { recursive: true });
    await page.screenshot({ path: path.join(out, `heroes-clear-${seed}-d${days}.png`) });
  });
}
