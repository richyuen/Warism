// Critic run 31: the relations graph on a phone: does a tap on a nation select it, with no drag, after a drag, twice?
// Usage: node critic/scripts/c35_rgt_tap.mjs <seed> <days>
import { chromium } from '@playwright/test';
import { BASE, save, hours } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 4111), days = Number(process.argv[3] ?? 365);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}&heroes=on`);
await page.waitForFunction(() => window.__warsim?.hud?.stats?.value != null, null, { timeout: 120_000 });
if (days > 0) await hours(page, days * 24);
await page.getByRole('button', { name: 'Relations', exact: true }).tap();
await page.waitForSelector('[data-testid=relations-graph]');
const said = async () => { const r = await page.evaluate(() => ({ said: document.querySelector('[data-testid=relations-said]')?.innerText.split(' · ')[0] ?? null, nationPanel: document.querySelector('[data-testid=nation-panel]')?.getAttribute('data-nation') ?? null, graphStill: !!document.querySelector('[data-testid=relations-graph]') })); if (r.nationPanel) { await page.locator('[data-testid=nation-panel] .panel-close').first().tap().catch(() => {}); await page.waitForTimeout(300); r.graphAfterClose = await page.evaluate(() => ({ graph: !!document.querySelector('[data-testid=relations-graph]'), zoom: document.querySelector('[data-testid=relations-graph]')?.getAttribute('data-zoom') ?? null })); } return r; };
const pick = () => page.evaluate(() => { const g = document.querySelector('[data-testid=relations-graph]').getBoundingClientRect(); const c = [...document.querySelectorAll('.relations-nation circle:first-child')].map((e) => ({ id: e.closest('g').getAttribute('data-testid'), r: e.getBoundingClientRect() })).filter((c) => c.r.width > 8 && c.r.x > g.x + 30 && c.r.right < g.right - 30 && c.r.y > g.y + 30 && c.r.bottom < g.bottom - 30); const k = c[Math.floor(c.length / 2)]; return k ? { id: k.id, x: k.r.x + k.r.width / 2, y: k.r.y + k.r.height / 2 } : null; });
const out = { seed, days, rows: [] };
let n = await pick(); await page.touchscreen.tap(n.x, n.y); await page.waitForTimeout(400); out.rows.push(['whole, tap', n.id, await said()]);
for (let k = 0; k < 3; k++) { await page.locator('[data-testid=relations-zoom-in]').tap(); await page.waitForTimeout(200); }
n = await pick(); await page.touchscreen.tap(n.x, n.y); await page.waitForTimeout(400); out.rows.push(['zoom 3.4, tap', n.id, await said()]);
const cdp = await ctx.newCDPSession(page);
const g = await page.evaluate(() => { const r = document.querySelector('[data-testid=relations-graph]').getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; });
const sx = g[0] + g[2] * 0.5, sy = g[1] + g[3] * 0.5;
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx, y: sy }] });
for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx - i * 10, y: sy - i * 4 }] });
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await page.waitForTimeout(400);
out.rows.push(['after drag', null, await said()]);
n = await pick(); await page.touchscreen.tap(n.x, n.y); await page.waitForTimeout(400); out.rows.push(['after drag, tap 1', n.id, await said()]);
await page.touchscreen.tap(n.x, n.y); await page.waitForTimeout(400); out.rows.push(['after drag, tap 2', n.id, await said()]);
save(`c35_rgt_${seed}.json`, out);
console.log(JSON.stringify(out.rows));
await browser.close();
