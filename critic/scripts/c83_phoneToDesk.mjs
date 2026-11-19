// Critic run 83 (new, R183 off its case): `sizeRow` sets a long name's width on the element (style.width) on a phone's
// closed row; the layout effect clears those widths only when the row is opened, and runs `sizeRow` only while `phone`.
// A window that goes from a phone's width to a desk's (a browser narrowed and widened, a tablet's split view): do the
// names keep the phone's cut with a desk's room? 1938 seed after <days> days; the window at each of SIZES in turn
// (default 384x832 -> 1280x720 -> 1024x768 -> 384x832 -> 1600x900). At each: phone or not, each name's inline width,
// whether it is cut (scrollWidth > clientWidth), the banners shown, the row's room left; a shot of the row.
// Usage: [BASE=...] [TAG=] node critic/scripts/c83_phoneToDesk.mjs <seed> <days> [WxH,WxH,...]
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, hours } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 68901), days = Number(process.argv[3] ?? 400);
const sizes = (process.argv[4] ?? '384x832,1280x720,1024x768,384x832,1600x900').split(',').map((s) => s.split('x').map(Number));
const TAG = process.env.TAG ?? '';
const L = `c83pd_${seed}_d${days}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const [W0, H0] = sizes[0];
const ctx = await browser.newContext({ viewport: { width: W0, height: H0 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
if (days) await hours(page, 24 * days);
const out = { seed, days, steps: [] };
let i = 0;
for (const [W, H] of sizes) {
  await page.setViewportSize({ width: W, height: H });
  await page.waitForTimeout(1200);
  const g = await page.evaluate(() => {
    const row = document.querySelector('[data-testid=war-banners]');
    if (!row) return { row: null };
    const rr = row.getBoundingClientRect();
    const last = [...row.children].at(-1)?.getBoundingClientRect();
    return {
      phone: matchMedia('(max-width: 600px), (max-height: 500px)').matches,
      shown: row.querySelectorAll('[data-testid=war-banner]').length,
      more: row.querySelector('[data-testid=war-more]')?.textContent.trim() ?? null,
      tight: row.querySelectorAll('.war-tight').length,
      roomLeft: last ? Math.round(rr.right - last.right) : null,
      names: [...row.querySelectorAll('[data-testid=war-name]')].map((el) => ({ name: el.textContent, inline: el.style.width || null, w: Math.round(el.getBoundingClientRect().width), cut: el.scrollWidth > el.clientWidth + 0.5 })),
    };
  });
  const rowBox = await page.locator('[data-testid=war-banners]').boundingBox().catch(() => null);
  const shotName = `${L}_${i}_${W}x${H}.png`;
  if (rowBox) await page.screenshot({ path: path.join(SHOTS, shotName), clip: { x: Math.max(0, rowBox.x - 4), y: Math.max(0, rowBox.y - 4), width: Math.min(W - Math.max(0, rowBox.x - 4), rowBox.width + 8), height: rowBox.height + 8 } });
  const s = { i, W, H, ...g, shot: `critic/shots/${shotName}` };
  out.steps.push(s);
  console.log(JSON.stringify({ W, H, phone: g.phone, shown: g.shown, more: g.more, tight: g.tight, roomLeft: g.roomLeft, names: (g.names ?? []).map((n) => `${n.name}${n.cut ? '/cut' : ''}${n.inline ? '@' + n.inline : ''}`).join(' | ') }));
  i++;
}
out.errors = errors;
save(`${L}.json`, out);
await browser.close();
