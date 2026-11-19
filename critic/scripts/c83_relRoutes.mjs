// Critic run 83 (new, R184 off its case): on a sideways phone, A's panel open, Relations tapped (A's panel gives way),
// then A chosen again by another route than the Ranking: (map) a finger's tap on A's capital on the map beside the graph;
// (banner) a finger's tap on a war banner in which A fights, if one is shown. After each: selected, relationsOver, the
// panel shown, the graph still open, and whether the panel and the graph overlap. Then B chosen in the graph by a tap on
// its node is not tried here (c81_relOver covers it).
// Usage: [BASE=...] [TAG=] node critic/scripts/c83_relRoutes.mjs <seed> <days> <W> <H> <A>
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, CELLS, hours } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 83933), days = Number(process.argv[3] ?? 200), W = Number(process.argv[4] ?? 844), H = Number(process.argv[5] ?? 390);
const A = process.argv[6] ?? 'GER';
const TAG = process.env.TAG ?? '';
const L = `c83rt_${seed}_d${days}_${W}x${H}_${A}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 600 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
const out = { seed, days, W, H, A, routes: {} };
const a = CELLS.tags[A];
const st = async (name) => {
  const s = await page.evaluate(() => {
    const p = document.querySelector('[data-testid=nation-panel]')?.getBoundingClientRect();
    const g = document.querySelector('[data-testid=relations-panel]')?.getBoundingClientRect();
    const over = p && g ? Math.max(0, Math.min(p.right, g.right) - Math.max(p.left, g.left)) * Math.max(0, Math.min(p.bottom, g.bottom) - Math.max(p.top, g.top)) : 0;
    return { selected: window.__warsim.hud.selected.value, relationsOn: window.__warsim.hud.showRelations.value, relationsOver: window.__warsim.hud.relationsOver.value, panel: document.querySelector('[data-testid=nation-name]')?.textContent ?? (p ? 'shown' : null), overlapPx: Math.round(over) };
  });
  const shot = path.join(SHOTS, `${L}_${name.replace(/\W+/g, '_')}.png`);
  await page.screenshot({ path: shot });
  console.log(name, JSON.stringify(s));
  return { ...s, shot: `critic/shots/${path.basename(shot)}` };
};
const setup = async () => {
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  if (days) await hours(page, 24 * days);
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), a);
  await page.waitForTimeout(600);
  await page.getByTestId('relations-btn').tap();
  await page.waitForTimeout(800);
  return st('relations over A');
};
try {
  // (map): the camera put so A's capital stands in the right half's middle, then a tap there.
  out.routes.map = { before: await setup() };
  const pt = await page.evaluate(({ id }) => {
    const v = window.__warsim.view; const at = v.capitalOf(id); const c = v.controller.cam;
    const tx = innerWidth * 0.75, ty = innerHeight * 0.5;
    v.controller.set({ cx: at[0] - (tx - innerWidth / 2) / c.scale, cy: at[1] - (ty - innerHeight / 2) / c.scale, scale: c.scale });
    return null;
  }, { id: a });
  await page.waitForTimeout(600);
  const tapAt = await page.evaluate(({ id }) => {
    const v = window.__warsim.view; const at = v.capitalOf(id); const c = v.controller.cam;
    for (const [dx, dy] of [[0, 8], [8, 0], [-8, 0], [0, -8], [10, 10], [-10, 10]]) {
      const x = (at[0] - c.cx) * c.scale + innerWidth / 2 + dx, y = (at[1] - c.cy) * c.scale + innerHeight / 2 + dy;
      const t = document.elementFromPoint(x, y);
      if (t && t.tagName === 'CANVAS' && v.nationAt(x, y) === id) return { x, y };
    }
    return null;
  }, { id: a });
  out.routes.map.tapAt = tapAt;
  if (tapAt) { await page.touchscreen.tap(tapAt.x, tapAt.y); await page.waitForTimeout(900); }
  out.routes.map.after = await st('map tap on A');
  // (banner): a war banner in which A fights.
  out.routes.banner = { before: await setup() };
  const bn = page.locator('[data-testid=war-banner]').filter({ hasText: (await page.evaluate((id) => window.__warsim.hud.stats.value.nations.find((n) => n.id === id)?.name ?? '', a)).slice(0, 5) }).first();
  if (await bn.count()) {
    const bb = await bn.boundingBox();
    const top = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('[data-testid]')?.getAttribute('data-testid') ?? null, { x: bb.x + 20, y: bb.y + bb.height / 2 });
    out.routes.banner.top = top;
    await page.touchscreen.tap(bb.x + 20, bb.y + bb.height / 2);
    await page.waitForTimeout(900);
    out.routes.banner.after = await st('banner tap');
  } else out.routes.banner.after = 'no banner of A shown';
} catch (e) { out.failed = String(e).slice(0, 300); console.log('FAILED', out.failed); }
out.errors = errors;
save(`${L}.json`, out);
console.log('errors', errors.length);
await browser.close();
