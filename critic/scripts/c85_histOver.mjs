// Critic run 81 (new, R170 off its case): on a phone, a nation panel open, History tapped: how much of History's panel
// shows (9 x 9 points, the top element in it), and is its first row's link tappable? Then the same for Relations (R175).
// Usage: [BASE=...] [TAG=] node critic/scripts/c85_histOver.mjs <seed> <days> <W> <H> [TAG of nation]
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, CELLS, hours } from './c85_lib.mjs';
import path from 'node:path';
const [seed, days, W, H] = process.argv.slice(2, 6).map(Number);
const NAT = process.argv[6] ?? 'GER', TAG = process.env.TAG ?? '';
const L = `c85ho_${seed}_d${days}_${W}x${H}_${NAT}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 600 });
const page = await ctx.newPage();
const errors = []; page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
const out = { seed, days, W, H, NAT, base: BASE };
const cover = (sel) => page.evaluate((sel) => {
  const g = document.querySelector(sel); if (!g) return null;
  const r = g.getBoundingClientRect(); let hidden = 0;
  for (let i = 1; i < 10; i++) for (let j = 1; j < 10; j++) { const x = r.left + (r.width * i) / 10, y = r.top + (r.height * j) / 10;
    if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) { hidden++; continue; } const t = document.elementFromPoint(x, y); if (!(t && g.contains(t))) hidden++; }
  return { hiddenOf81: hidden, panel: !!document.querySelector('[data-testid=nation-panel]') };
}, sel);
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
if (days) await hours(page, 24 * days);
for (const [btn, sel] of [['history-btn', '[data-testid=history-panel]'], ['relations-btn', '[data-testid=relations-graph]']]) {
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), CELLS.tags[NAT]);
  await page.waitForSelector('[data-testid=nation-panel]', { timeout: 10_000 });
  await page.getByTestId(btn).tap();
  await page.waitForTimeout(800);
  out[btn] = await cover(sel);
  if (btn === 'history-btn') { try { await page.locator('[data-testid=history-go]').first().tap({ timeout: 4000 }); out.historyGoTapped = true; } catch { out.historyGoTapped = false; } }
  await page.screenshot({ path: path.join(SHOTS, `${L}_${btn}.png`) });
  // Closed by the HUD's own state (the button may itself be under the panel), so the next step starts clean.
  await page.evaluate(() => { const h = window.__warsim.hud; h.showHistory.value = false; h.showRelations.value = false; });
  await page.waitForTimeout(400);
}
out.errors = errors;
console.log(JSON.stringify(out));
save(`${L}.json`, out);
await browser.close();
