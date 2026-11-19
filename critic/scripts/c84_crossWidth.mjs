// Critic run 84 (new, R189 off its case): R189 clears the phone row's sizing on a desk and counts the banners again when
// `phone` changes. Routes its case does not take: a window narrowed and widened in small steps across 600 px, a short
// desk that turns "phone" by its height alone (max-height 500 px), and the row opened ("+n") on a phone, the window
// widened to a desk and narrowed back, then the row closed. 1938 seed after <days> days. At each step: phone or not,
// banners shown, "+n", the room left, the row's overflow, names with an inline width (on a desk: must be none), names cut
// on a desk; then a nudge (the window 1 px wider and back, which counts the fit again) and the banners after it: a step
// whose nudge shows a different count is a stale fit. A shot of the row at each step.
// Usage: [BASE=...] [TAG=] node critic/scripts/c84_crossWidth.mjs <seed> <days> [route: steps|short|opened]
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, hours } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 84901), days = Number(process.argv[3] ?? 400), route = process.argv[4] ?? 'steps';
const ROUTES = {
  steps: '1280x800,900x800,700x800,620x800,601x800,600x800,560x800,480x800,420x800,375x800,420x800,560x800,600x800,601x800,700x800,1280x800,375x800',
  short: '1280x720,1280x500,1280x480,1280x720,844x390,1280x480,1280x720,390x844',
  opened: '390x844,O,1280x720,1024x768,390x844,C,844x390,1280x720,390x844',
};
const seq = (ROUTES[route] ?? route).split(',');
const TAG = process.env.TAG ?? '';
const L = `c84cw_${seed}_d${days}_${route.length > 10 ? 'custom' : route}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const first = seq.find((s) => s.includes('x')).split('x').map(Number);
const ctx = await browser.newContext({ viewport: { width: first[0], height: first[1] }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
if (days) await hours(page, 24 * days);
const geom = () => page.evaluate(() => {
  const row = document.querySelector('[data-testid=war-banners]');
  if (!row) return { row: null };
  const rr = row.getBoundingClientRect();
  const last = [...row.children].filter((c) => c.getBoundingClientRect().width > 0).at(-1)?.getBoundingClientRect();
  const phone = matchMedia('(max-width: 600px), (max-height: 500px)').matches;
  return {
    phone,
    opened: row.classList.contains('open') || row.classList.contains('opened') || !!row.querySelector('[aria-expanded=true]'),
    shown: row.querySelectorAll('[data-testid=war-banner]').length,
    more: row.querySelector('[data-testid=war-more]')?.textContent.trim() ?? null,
    tight: row.querySelectorAll('.war-tight').length,
    roomLeft: last ? Math.round(rr.right - last.right) : null,
    overflow: Math.round(row.scrollWidth - row.clientWidth),
    inline: [...row.querySelectorAll('[data-testid=war-name]')].filter((e) => e.style.width).map((e) => `${e.textContent}@${e.style.width}`),
    cut: [...row.querySelectorAll('[data-testid=war-name]')].filter((e) => e.scrollWidth > e.clientWidth + 0.5).map((e) => e.textContent),
  };
});
const out = { seed, days, route, steps: [], stale: 0, deskInline: 0, deskCut: 0 };
let i = 0, cur = first;
for (const s of seq) {
  if (s === 'O' || s === 'C') {
    const more = page.locator('[data-testid=war-more]');
    if (await more.count()) await more.first().click().catch(() => null);
    await page.waitForTimeout(700);
  } else {
    cur = s.split('x').map(Number);
    await page.setViewportSize({ width: cur[0], height: cur[1] });
    await page.waitForTimeout(1000);
  }
  const g = await geom();
  await page.setViewportSize({ width: cur[0] + 1, height: cur[1] });
  await page.waitForTimeout(500);
  await page.setViewportSize({ width: cur[0], height: cur[1] });
  await page.waitForTimeout(900);
  const n = await geom();
  const stale = g.shown !== n.shown;
  if (stale) out.stale++;
  if (!g.phone && g.inline?.length) out.deskInline++;
  if (!g.phone && g.cut?.length) out.deskCut++;
  const b = await page.locator('[data-testid=war-banners]').boundingBox().catch(() => null);
  const shot = `${L}_${i}_${s === 'O' || s === 'C' ? s + '_' : ''}${cur[0]}x${cur[1]}.png`;
  if (b) { const x = Math.max(0, b.x - 4); await page.screenshot({ path: path.join(SHOTS, shot), clip: { x, y: Math.max(0, b.y - 4), width: Math.min(cur[0] - x, b.width + 8), height: Math.min(b.height + 8, 400) } }); }
  const st = { i, step: s, W: cur[0], H: cur[1], ...g, afterNudge: { shown: n.shown, more: n.more }, stale, shot: `critic/shots/${shot}` };
  out.steps.push(st);
  console.log(JSON.stringify({ step: s, W: cur[0], H: cur[1], phone: g.phone, shown: g.shown, more: g.more, tight: g.tight, roomLeft: g.roomLeft, overflow: g.overflow, inline: g.inline, cut: g.cut, nudged: n.shown, stale }));
  i++;
}
out.errors = errors;
console.log('summary', JSON.stringify({ steps: out.steps.length, stale: out.stale, deskInline: out.deskInline, deskCut: out.deskCut, overflowSteps: out.steps.filter((s) => s.overflow > 0).length }), 'errors', errors.length);
save(`${L}.json`, out);
await browser.close();
