// Critic run 87 (new, R200 off its case). R200 folds the legend to its title on a desk of 800 px or less, opened by a
// click. Routes its case does not take: the legend OPENED on a narrow desk in each map mode (does the war row then cover
// it, or it the row; is the row recounted; does the legend leave the top of the view on a short desk), the legend opened
// at 700 then the window widened past 800 and narrowed back (does it come back open or folded; stale row), the toggle's
// click reaching the map (a nation selected under it), and the diplomacy mode's selected name.
// Usage: [BASE=...] node critic/scripts/c87_legendOpen.mjs <seed> <days> [sizes=700x800,780x800,760x560,640x520]
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, hours } from './c85_lib.mjs';
import { CELLS } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 84901), days = Number(process.argv[3] ?? 400);
const sizes = (process.argv[4] ?? '700x800,780x800,760x560,640x520').split(',').map((s) => s.split('x').map(Number));
const modes = (process.env.MODES ?? 'political,seaControl,airControl,fallout,puppets,diplomacy').split(',');
const L = `c87lo_${seed}_d${days}${process.env.TAG ?? ''}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: 1100, height: 800 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`error: ${m.text()}`.slice(0, 300)); });
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
if (days) await hours(page, 24 * days);
await page.waitForTimeout(800);
const geom = () => page.evaluate(() => {
  const row = document.querySelector('[data-testid=war-banners]');
  const lgEl = document.querySelector('[data-testid=map-legend]');
  const rr = row?.getBoundingClientRect();
  const lg = lgEl?.getBoundingClientRect();
  const hit = (outer, inner) => {
    if (!outer || !inner) return 0;
    const r = outer.getBoundingClientRect();
    let n = 0;
    for (let x = r.left + 1; x < r.right - 1; x += 2) for (let y = r.top + 1; y < r.bottom - 1; y += 2) { const t = document.elementFromPoint(x, y); if (t && inner.contains(t)) n++; }
    return n;
  };
  // Overlap of the two boxes, whoever is on top.
  const ov = rr && lg ? Math.max(0, Math.min(rr.right, lg.right) - Math.max(rr.left, lg.left)) * Math.max(0, Math.min(rr.bottom, lg.bottom) - Math.max(rr.top, lg.top)) : 0;
  const banners = [...(row?.querySelectorAll('[data-testid=war-banner]') ?? [])];
  const bOv = banners.filter((b) => { const r = b.getBoundingClientRect(); return lg && r.right > lg.left && r.left < lg.right && r.bottom > lg.top && r.top < lg.bottom; }).length;
  const ch = [...document.querySelectorAll('[data-testid=ticker], .ticker')].map((e) => e.getBoundingClientRect()).filter((b) => b.width)[0];
  return {
    open: lgEl?.getAttribute('data-open') ?? null,
    foldable: lgEl?.classList.contains('foldable') ?? false,
    legend: lg ? [Math.round(lg.left), Math.round(lg.top), Math.round(lg.right), Math.round(lg.bottom)] : null,
    row: rr ? [Math.round(rr.left), Math.round(rr.top), Math.round(rr.right), Math.round(rr.bottom)] : null,
    shown: banners.length, bannersOverLegend: bOv,
    more: row?.querySelector('[data-testid=war-more]')?.textContent.trim() ?? null,
    rowOverLegend: hit(lgEl, row), legendOverRow: hit(row, lgEl), boxOverlap: Math.round(ov),
    legendOffTop: lg ? lg.top < 0 : false, legendText: lgEl?.textContent.slice(0, 80) ?? null,
    ticker: ch ? [Math.round(ch.left), Math.round(ch.right)] : null,
    phone: matchMedia('(max-width: 600px), (max-height: 500px)').matches,
  };
});
const out = { seed, days, cases: [] };
const toggle = page.locator('[data-testid=legend-toggle]');
for (const [W, H] of sizes) {
  for (const mode of modes) {
    await page.setViewportSize({ width: W, height: H });
    await page.evaluate((m) => window.__warsim.hud.setMapMode(m), mode);
    if (mode === 'diplomacy') await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), CELLS.tags.GER);
    await page.waitForTimeout(500);
    const folded = await geom();
    const selBefore = await page.evaluate(() => window.__warsim.hud.selected?.value ?? null);
    let opened = null, selAfter = null, reopened = null, wide = null, back = null;
    if (await toggle.count()) {
      if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
      await page.waitForTimeout(600);
      opened = await geom();
      selAfter = await page.evaluate(() => window.__warsim.hud.selected?.value ?? null);
      await page.screenshot({ path: path.join(SHOTS, `${L}_${W}x${H}_${mode}_open.png`), clip: { x: 0, y: Math.max(0, H - 420), width: W, height: Math.min(420, H) } });
      // Widen past 800 and come back: is it still open, and is the row recounted?
      await page.setViewportSize({ width: 1280, height: H });
      await page.waitForTimeout(600);
      wide = await geom();
      await page.setViewportSize({ width: W, height: H });
      await page.waitForTimeout(700);
      back = await geom();
      // Nudge: a stale fit shows as a different count after 1 px.
      await page.setViewportSize({ width: W + 1, height: H });
      await page.waitForTimeout(300);
      await page.setViewportSize({ width: W, height: H });
      await page.waitForTimeout(700);
      reopened = await geom();
      // Fold it again for the next case.
      if ((await toggle.count()) && (await toggle.getAttribute('aria-expanded')) === 'true') await toggle.click();
      await page.waitForTimeout(300);
    }
    const c = { W, H, mode, folded, opened, wide, back, nudged: reopened, selBefore, selAfter };
    out.cases.push(c);
    console.log(`${W}x${H} ${mode}: folded shown ${folded.shown} ${folded.more ?? ''} foldable ${folded.foldable} | opened shown ${opened?.shown} ${opened?.more ?? ''} legend ${JSON.stringify(opened?.legend)} row ${JSON.stringify(opened?.row)} rowOverLegend ${opened?.rowOverLegend} legendOverRow ${opened?.legendOverRow} bannersOverLegend ${opened?.bannersOverLegend} offTop ${opened?.legendOffTop} | wide open ${wide?.open} | back open ${back?.open} shown ${back?.shown} nudged ${reopened?.shown} rowOverLegend ${back?.rowOverLegend}/${back?.legendOverRow} | sel ${selBefore}->${selAfter}`);
  }
}
out.errors = errors;
console.log('errors', errors.length, errors.slice(0, 3));
save(`${L}.json`, out);
await browser.close();
