import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type {} from '../../src/app/testApi';

const en = JSON.parse(readFileSync(path.resolve(import.meta.dirname, '../../src/ui/i18n/en.json'), 'utf8')) as Record<string, string>;

// ROADMAP R216 (critic run 89, R89-N1; ADR-1145): three of six three-nation random worlds had no war in ten years and
// the page said nothing of it. A world of few nations at peace says so, and why, in the war row's place: "At peace" and
// the reason most of its realms share (89403: none outmatches another), each realm's reason opened by a tap; "for now"
// when one may yet go to war (89418; 89404 before ROADMAP R217). At the five supported sizes (ADR-1141): in the view,
// over none of the page's other boxes, closed and opened; gone when a war is declared; never in 1938.

const SIZES = [[393, 659], [393, 852], [734, 343], [852, 393], [2560, 1305]] as const;
const BOXES = ['topbar', 'bottombar', 'ticker', 'map-legend', 'stats-ranking', 'landings-bar', 'first-cue', 'order-news'];

async function open(page: Page, seed: number, w: number, h: number): Promise<void> {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(`/?scenario=random&paused=1&seed=${seed}&nations=3`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
}

/** The boxes of `ids` the element of `testid` lies over (by more than 1 px each way), and whether it is in the view. */
function faults(page: Page, testid: string): Promise<string[]> {
  return page.evaluate(
    ({ testid, ids }) => {
      const el = document.querySelector(`[data-testid=${testid}]`)!;
      const r = el.getBoundingClientRect();
      const out: string[] = [];
      if (r.left < 0 || r.top < 0 || r.right > innerWidth + 0.5 || r.bottom > innerHeight + 0.5) out.push(`${testid} out of the view: ${JSON.stringify(r)}`);
      for (const id of ids)
        for (const b of document.querySelectorAll<HTMLElement>(`[data-testid=${id}]`)) {
          const o = b.getBoundingClientRect();
          if (o.width === 0 || o.height === 0 || getComputedStyle(b).visibility === 'hidden') continue;
          const x = Math.min(r.right, o.right) - Math.max(r.left, o.left);
          const y = Math.min(r.bottom, o.bottom) - Math.max(r.top, o.top);
          if (x > 1 && y > 1) out.push(`${testid} over ${id} by ${Math.round(x)} × ${Math.round(y)} px`);
        }
      return out;
    },
    { testid, ids: BOXES },
  );
}

for (const [w, h] of SIZES) {
  test(`${w} × ${h}: a world of three at peace says so and why; a tap opens each one's reason; a war takes its place`, async ({ page }) => {
    test.setTimeout(120_000);
    await open(page, 89403, w, h);
    // At hour 0 the third outmatches the first, "for now"; on day 1 the first two ally against it, and from then none
    // outmatches another (`peaceWhy` at hours 0 and 24).
    await page.evaluate(() => window.__warsim!.sim.step(24));
    const line = page.getByTestId('war-peace');
    await expect(line).toBeVisible({ timeout: 20_000 });
    await expect(line).toHaveAttribute('data-why', '1');
    await expect(line).toContainText(en['peace.head']!);
    await expect(page.getByTestId('war-peace-why')).toHaveText(en['peace.short.equal']!);
    // The reason read whole, not cut by the line's width.
    expect(await page.getByTestId('war-peace-why').evaluate((e) => e.scrollWidth <= e.clientWidth + 1), 'the reason whole').toBe(true);
    expect(await faults(page, 'war-peace'), 'closed').toEqual([]);
    await page.screenshot({ path: test.info().outputPath(`peace-${w}x${h}.png`) });
    // Opened: the rule and each realm's reason, in the view and over nothing; closed again by the same tap.
    await line.click();
    const rows = page.getByTestId('war-peace-rows');
    await expect(rows).toBeVisible();
    await expect(rows.locator('p')).toHaveCount(4);
    await expect(rows.locator('p').first()).toHaveText(en['peace.rule']!);
    expect(await faults(page, 'war-peace-rows'), 'opened').toEqual([]);
    expect(await faults(page, 'war-peace'), 'its line, opened').toEqual([]);
    await page.screenshot({ path: test.info().outputPath(`peace-${w}x${h}-open.png`) });
    await line.click();
    await expect(rows).toHaveCount(0);
    // A war declared: the banner in its place.
    await page.evaluate(() => window.__warsim!.sim.command({ kind: 'forceWar', attacker: 1, defender: 3 }));
    await page.evaluate(() => window.__warsim!.sim.step(1));
    await expect(page.getByTestId('war-banner')).toHaveCount(1, { timeout: 20_000 });
    await expect(page.getByTestId('war-peace-row')).toHaveCount(0);
  });
}

// ROADMAP R222 (critic run 90, R90-N2): the peace's reason reaches History, in the line's own words, once while it holds.
for (const [w, h] of SIZES) {
  test(`${w} × ${h}: History tells the peace and its reason (89403)`, async ({ page }) => {
    test.setTimeout(120_000);
    await open(page, 89403, w, h);
    await page.evaluate(() => window.__warsim!.sim.step(24 * 30));
    await page.waitForFunction(() => (window.__warsim!.hud.stats.value?.tick ?? 0) >= 24 * 30, null, { timeout: 60_000 });
    const btn = page.getByTestId('history-btn');
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await expect(page.getByTestId('history-panel')).toBeVisible();
    const said = en['history.PeaceHeld']!.replace('{reason}', en['peace.short.equal']!);
    const row = page.getByTestId('history-row').filter({ hasText: said });
    await expect(row).toHaveCount(1, { timeout: 20_000 });
    await row.scrollIntoViewIfNeeded();
    const box = (await row.boundingBox())!;
    expect(box.x >= 0 && box.y >= 0 && box.x + box.width <= w + 0.5 && box.y + box.height <= h + 0.5, `the row in the view: ${JSON.stringify(box)}`).toBe(true);
    await page.screenshot({ path: test.info().outputPath(`peace-history-${w}x${h}.png`) });
  });
}

test('89418 (a war prepared): "At peace for now", no reason given', async ({ page }) => {
  test.setTimeout(120_000);
  await open(page, 89418, 393, 852);
  // Its first massing begins on day 26 (`.cache/r217_case.ts`; 89404's, on day 5, was on a land none of its men stood
  // on until ROADMAP R217).
  await page.evaluate(() => window.__warsim!.sim.step(24 * 30));
  const line = page.getByTestId('war-peace');
  await expect(line).toHaveAttribute('data-why', '0', { timeout: 20_000 });
  await expect(page.getByTestId('war-peace-why')).toHaveText(en['peace.forNow']!);
  await line.click();
  await expect(page.getByTestId('war-peace-rows').locator('p')).toHaveText([en['peace.forNowLong']!]);
});

test('1938 at peace everywhere says nothing: a world of more than three nations', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/?scenario=1938&paused=1&seed=1938');
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim!.hud.stats.value !== null, null, { timeout: 60_000 });
  await page.evaluate(async () => {
    for (const x of (await window.__warsim!.sim.inspect()).wars) window.__warsim!.sim.command({ kind: 'forcePeace', war: x.id });
    window.__warsim!.sim.step(1);
  });
  await expect(page.getByTestId('war-banner')).toHaveCount(0, { timeout: 20_000 });
  await page.waitForTimeout(1500);
  await expect(page.getByTestId('war-peace-row')).toHaveCount(0);
});
