// Critic run 22, TD: run 21's "no war from the map on touch" on HEAD's path (PLAN 7.175d): 390 x 844 with touch,
// playing France: Diplomacy, then a tap on Italy's land: the menu (in view?), its items; Declare war; the war made.
// Then Diplomacy and a tap on the sea / on own land: what happens.
// Usage: node critic/scripts/c36_td_touchdiplo.mjs [seed]
import { chromium } from '@playwright/test';
import { BASE, shot, save, CELLS } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 3391);
const T = CELLS.tags;
const out = { seed, steps: [] };
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
const groundOf = (n) => page.evaluate((n) => {
  const v = window.__warsim.view; const [w, h] = [innerWidth, innerHeight];
  for (let r = 0; r < Math.min(w, h) / 2; r += 10) for (let k = 0; k < 16; k++) {
    const x = Math.round(w / 2 + r * Math.cos((k * Math.PI) / 8)); const y = Math.round(h / 2 + r * Math.sin((k * Math.PI) / 8));
    if (v.nationAt(x, y) === n && v.nationAt(x + 8, y) === n && v.nationAt(x, y + 8) === n && y < h - 200 && y > 80) return [x, y];
  }
  return null;
}, n);
try {
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120000 });
  await page.evaluate((n) => window.__warsim.view.select(n), T.FRA);
  await page.waitForTimeout(500);
  await page.getByTestId('take-control').tap();
  await page.getByTestId('nation-close').tap().catch(() => {});
  const rome = CELLS.rome;
  await page.evaluate(([x, y]) => window.__warsim.view.controller.set({ cx: x - 12, cy: y - 25, scale: 4 }), rome);
  await page.waitForTimeout(800);
  const ita = await groundOf(T.ITA);
  out.ita = ita;
  await page.getByTestId('diplomacy-btn').tap();
  await page.waitForTimeout(300);
  out.steps.push({ s: 'toggle on', pressed: await page.getByTestId('diplomacy-btn').getAttribute('aria-pressed'), shot: await shot(page, 'c36td_01_toggle.png') });
  await page.touchscreen.tap(ita[0], ita[1]);
  await page.waitForTimeout(600);
  const m = page.getByTestId('nation-menu');
  const box = await m.boundingBox().catch(() => null);
  out.steps.push({ s: 'tap Italy', menu: await m.count(), box, inView: box ? box.x >= 0 && box.y >= 0 && box.x + box.width <= 390 && box.y + box.height <= 844 : null, text: (await m.innerText().catch(() => '')).replace(/\n/g, ' | '), shot: await shot(page, 'c36td_02_menu.png') });
  if (await page.getByTestId('nation-menu-war').count()) {
    await page.getByTestId('nation-menu-war').tap();
    await page.waitForTimeout(800);
    await page.evaluate(() => window.__warsim.sim.step(1));
    await page.waitForTimeout(800);
    const w = await page.evaluate(({ a, b }) => window.__warsim.sim.inspect().then ? null : null, { a: T.FRA, b: T.ITA });
    void w;
    const ins = await page.evaluate(() => window.__warsim.sim.inspect());
    out.steps.push({ s: 'war tapped', atWar: ins.wars.some((x) => (x.attackers.includes(19) && x.defenders.includes(15)) || (x.attackers.includes(15) && x.defenders.includes(19))), banners: await page.evaluate(() => [...document.querySelectorAll('[data-testid=war-banner], .war-banner')].map((b) => b.innerText.replace(/\n/g, ' ')).slice(0, 6)), shot: await shot(page, 'c36td_03_war.png') });
  }
  // Toggle and a tap on the sea.
  await page.getByTestId('diplomacy-btn').tap();
  await page.waitForTimeout(300);
  const sea = await page.evaluate(() => { const v = window.__warsim.view; for (let y = 120; y < 600; y += 20) for (let x = 20; x < 370; x += 20) if (v.nationAt(x, y) === 0) return [x, y]; return null; });
  if (sea) { await page.touchscreen.tap(sea[0], sea[1]); await page.waitForTimeout(500); }
  out.steps.push({ s: 'tap sea', sea, menu: await page.getByTestId('nation-menu').count(), pressed: await page.getByTestId('diplomacy-btn').getAttribute('aria-pressed').catch(() => null), hint: (await page.evaluate(() => document.body.innerText)).match(/[^\n]*(tap|Tap)[^\n]*/)?.[0] ?? null, shot: await shot(page, 'c36td_04_sea.png') });
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c36_td_${seed}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1));
