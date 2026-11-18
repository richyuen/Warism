import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';
import { DIRECTOR_KINDS, kindName } from '../../src/shared/history';

// ROADMAP R142 AT: the director's camera, at 1 day/s (the speed of level 4) on two seeds: of the History rows of a new war,
// a Major Battle, a capital taken and a strike in the run (but its last TAIL_S), at least 80 % seen; no cut within 4 s
// of the last; a wheel on the map turns it off within a frame, and it cuts no more; so does a click on a ticker row, a
// war banner or a row of History's place (R146). The run is DIRECTOR_MINUTES long:
// 1.5 by default (the gate's), 10 for the AT (`DIRECTOR_MINUTES=10 npx playwright test director1938 --project=chromium`).
// The frame rate is `npm run bench -- G`'s.

const MINUTES = Number(process.env['DIRECTOR_MINUTES'] ?? 1.5);
const TAIL_S = 15;

async function open(page: Page, seed: number): Promise<void> {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(`/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.waitForFunction(() => window.__warsim!.sim.mapLayers !== null, null, { timeout: 60_000 });
  await page.evaluate(() => window.__warsim!.hud.setSpeedLevel(4));
}

for (const seed of [1938, 7]) {
  test(`the director, seed ${seed}`, async ({ page }, info) => {
    test.setTimeout((MINUTES * 60 + 240) * 1000);
    await open(page, seed);
    const director = page.getByTestId('director-btn');
    await expect(director).toHaveAttribute('aria-pressed', 'false');
    await director.click();
    await expect(director).toHaveAttribute('aria-pressed', 'true');
    const from = await page.evaluate(() => window.__warsim!.hud.stats.value!.tick);
    await page.evaluate(() => window.__warsim!.hud.togglePause());
    const t0 = Date.now();
    await page.waitForTimeout(MINUTES * 60_000);
    const to = await page.evaluate(() => window.__warsim!.hud.stats.value!.tick);
    const days = (to - from) / 24;
    const seconds = (Date.now() - t0) / 1000;

    // What it saw, against the History of the run.
    const { seen, cuts } = await page.evaluate(() => ({ seen: window.__warsim!.hud.director.seen.map((s) => s.key), cuts: [...window.__warsim!.hud.director.cuts] }));
    const rows = (await page.evaluate(() => window.__warsim!.hud.sim.history())).filter((r) => DIRECTOR_KINDS.has(r.kind) && r.tick > from && r.tick <= to - TAIL_S * 24 * (days / seconds));
    const keys = new Set(seen);
    const missed = rows.filter((r) => !keys.has(`${r.tick}:${r.kind}:${r.a}:${r.b}`));
    const gaps = cuts.slice(1).map((c, i) => c - cuts[i]!);
    const out = info.outputPath();
    mkdirSync(out, { recursive: true });
    const report = { seed, minutes: MINUTES, days, seconds, rows: rows.length, seen: rows.length - missed.length, share: rows.length ? (rows.length - missed.length) / rows.length : 1, cuts: cuts.length, shortestGapMs: gaps.length ? Math.min(...gaps) : null, missed: missed.map((r) => `${r.tick} ${kindName(r.kind)} ${r.a} ${r.b}`) };
    writeFileSync(path.join(out, 'director.json'), JSON.stringify(report, null, 2));
    process.stderr.write(`director seed ${seed}: ${report.seen} of ${report.rows} rows seen (${(report.share * 100).toFixed(1)} %), ${report.cuts} cuts, shortest gap ${report.shortestGapMs} ms, ${days.toFixed(0)} days in ${seconds.toFixed(0)} s\n`);
    // 1 day/s, near enough.
    expect(days / seconds).toBeGreaterThan(0.8);
    expect(rows.length, 'rows of the run').toBeGreaterThan(0);
    expect(report.share, `rows seen; missed ${report.missed.join(', ')}`).toBeGreaterThanOrEqual(0.8);
    expect(report.shortestGapMs ?? 4000, 'the shortest time between cuts').toBeGreaterThanOrEqual(4000);
    await page.screenshot({ path: path.join(out, 'director.png') });

    // The player's wheel: off within a frame, and no cut after it.
    const taken = await page.evaluate(async () => {
      const canvas = [...document.querySelectorAll('canvas')].find((e) => e.clientWidth === window.innerWidth) ?? document.querySelector('canvas')!;
      const r = canvas.getBoundingClientRect();
      const n = window.__warsim!.hud.director.cuts.length;
      canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, bubbles: true, cancelable: true }));
      await new Promise((done) => requestAnimationFrame(done));
      const off = !window.__warsim!.hud.director.on.value;
      return { off, n };
    });
    expect(taken.off, 'off a frame after the wheel').toBe(true);
    await expect(director).toHaveAttribute('aria-pressed', 'false');
    await page.waitForTimeout(6000);
    expect(await page.evaluate(() => window.__warsim!.hud.director.cuts.length)).toBe(taken.n);

    // The page's links to a place hand it back too (R146, critic run 76's R76-N1): a ticker row, a war banner, a row of
    // History; each with the director on again before it, off after it.
    const acts: [string, () => Promise<void>][] = [
      ['ticker row', () => page.getByTestId('ticker-row').first().click()],
      ['war banner', () => page.getByTestId('war-banner').first().click()],
      [
        'History row',
        async () => {
          await page.evaluate(() => window.__warsim!.hud.toggleHistory());
          await page.getByTestId('history-go').first().click();
        },
      ],
    ];
    for (const [name, click] of acts) {
      await director.click();
      await expect(director).toHaveAttribute('aria-pressed', 'true');
      await click();
      await expect(director, `off after a ${name}`).toHaveAttribute('aria-pressed', 'false');
    }
  });
}
