// Critic run 29 (R5a, heroes), HC: where the heroes' T0 counters are drawn against where the heroes are.
// 1938 ?heroes=on seed <seed>, day <day>: at the world's zoom (the start view) and at 6000 / 3000 m/px over Europe,
// each hero counter's drawn box centre against its formation's place on screen: px and km off. Shots.
// Usage: node critic/scripts/c31_hc_herocounters.mjs <seed> <day> [w] [h] [tag]
import { launch, open1938, shot, save, lookAt, hours, settle } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 5521), day = Number(process.argv[3] ?? 0);
const W = Number(process.argv[4] ?? 1600), H = Number(process.argv[5] ?? 900), tg = process.argv[6] ?? 'desk';
const out = { seed, day, W, H, views: [] };
const { browser, page, errors } = await launch(W, H);
const measure = () => page.evaluate(() => {
  const v = window.__warsim.view; const c = v.controller.cam;
  const mpp = v.metresPerPx * c.scale;
  return { mpp, heroes: v.counters.drawn.filter((d) => d.hero).map((d) => {
    const sx = (d.wx - c.cx) * c.scale + innerWidth / 2, sy = (d.wy - c.cy) * c.scale + innerHeight / 2;
    const bx = d.x + d.w / 2, by = d.y + d.h / 2;
    const px = Math.hypot(bx - sx, by - sy);
    return { name: d.text, px: Math.round(px), km: Math.round((px * (v.metresPerPx / c.scale ** 0) * 0) || 0), at: [Math.round(sx), Math.round(sy)], box: [Math.round(bx), Math.round(by)], dy: Math.round(by - sy) };
  }) };
});
try {
  await open1938(page, seed, '&heroes=on');
  if (day > 0) await hours(page, day * 24);
  await page.waitForTimeout(1200);
  await settle(page);
  const mppNow = await page.evaluate(() => { const v = window.__warsim.view; return v.metresPerPx * v.controller.cam.scale; });
  const views = [['start', null], ['eu6000', 6000], ['eu3000', 3000]];
  for (const [name, m] of views) {
    if (m) await lookAt(page, 1080, 300, m);
    await page.waitForTimeout(600);
    const r = await measure();
    // km on the map: px × metres per px
    const mpp = await page.evaluate(() => { const v = window.__warsim.view; return v.metresPerPx / v.controller.cam.scale * 0 + (v.metresPerPx); });
    r.heroes.forEach((h) => { h.km = Math.round((h.px * r.mpp) / 1000); });
    out.views.push({ name, ...r, shot: await shot(page, `c31hc_${seed}_${tg}_${name}.png`) });
  }
  out.mppStart = mppNow;
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c31_hc_${seed}_${tg}.json`, out);
await browser.close();
for (const v of out.views) console.log(v.name, Math.round(v.mpp), JSON.stringify(v.heroes.map((h) => [h.name, h.px, h.km])));
console.log(out.fatal ?? '');
