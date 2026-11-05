// Critic run 31 (focused, ROADMAP R8): the folded hero counters at the world's zoom.
// 1938 ?heroes=on seed <seed>, after <day> days, at <mpp> m/px (0 = the start view): each drawn hero counter, the heroes
// folded into it (name, nation, px from the counter's box centre, inside the box?), and a click on it repeated
// members + 1 times: what each click's panel opens (the camera put back each time). Every hero reachable?
// Usage: node critic/scripts/c36_hf_herofold.mjs <seed> <day> <mpp> [w] [h] [tag]
import { launch, open1938, settle, shot, save, hours } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 5521), day = Number(process.argv[3] ?? 0), mppWant = Number(process.argv[4] ?? 0);
const W = Number(process.argv[5] ?? 1600), H = Number(process.argv[6] ?? 900), tg = process.argv[7] ?? 'desk';
const out = { seed, day, mppWant, W, H, counters: [] };
const { browser, page, errors } = await launch(W, H);
const read = () => page.evaluate(() => {
  const v = window.__warsim.view; const c = v.controller.cam;
  const idx = new Map(); for (let i = 0; i < v.formIds.length; i++) idx.set(v.formIds[i], i);
  return { mpp: v.metresPerPx * c.scale, cam: { cx: c.cx, cy: c.cy, scale: c.scale }, counters: v.counters.drawn.filter((d) => d.hero !== undefined).map((d) => ({
    key: d.key, text: d.text, box: [d.x, d.y, d.w, d.h], alpha: d.alpha,
    members: (d.heroes ?? [d.hero]).map((id) => {
      const i = idx.get(id);
      const sx = (v.formX[i] - c.cx) * c.scale + innerWidth / 2, sy = (v.formY[i] - c.cy) * c.scale + innerHeight / 2;
      return { id, name: v.formationName(id, v.formTemplate[i]), nation: v.formNation[i], at: [Math.round(sx), Math.round(sy)], pxFromBox: Math.round(Math.hypot(sx - (d.x + d.w / 2), sy - (d.y + d.h / 2))), inBox: sx >= d.x && sx <= d.x + d.w && sy >= d.y && sy <= d.y + d.h };
    }),
  })) };
});
const panelTitle = () => page.evaluate(() => { const p = [...document.querySelectorAll('aside, .panel')].map((e) => e.innerText).find((t) => /Kind|Overview/.test(t)); return p ? p.split('\n').slice(0, 6).join(' | ').slice(0, 120) : null; });
try {
  await open1938(page, seed, '&heroes=on');
  if (day > 0) await hours(page, day * 24);
  await page.waitForTimeout(1000); await settle(page);
  if (mppWant > 0) {
    await page.evaluate((m) => { const v = window.__warsim.view; v.controller.set({ cx: 1080, cy: 300, scale: (v.metresPerPx * v.controller.cam.scale) / m }); }, mppWant);
    await settle(page);
  }
  const base = await read();
  out.mpp = base.mpp;
  out.shot = await shot(page, `c36hf_${seed}_${tg}_d${day}_${mppWant}.png`);
  for (const ctr of base.counters) {
    const rec = { ...ctr, clicks: [] };
    for (let k = 0; k < ctr.members.length + 1; k++) {
      // the camera back where it was, then the counter's box as drawn now
      await page.evaluate((cam) => window.__warsim.view.controller.set(cam), base.cam);
      await settle(page);
      const now = (await read()).counters.find((c) => c.key === ctr.key) ?? (await read()).counters.find((c) => c.members.some((m) => m.id === ctr.members[0].id));
      if (!now) { rec.clicks.push({ k, missing: true }); continue; }
      const [x, y, w, h] = now.box;
      await page.mouse.click(x + w / 2, y + h / 2);
      await page.waitForTimeout(500);
      const picked = await page.evaluate(() => window.__warsim.view.picked);
      rec.clicks.push({ k, at: [Math.round(x + w / 2), Math.round(y + h / 2)], picked, panel: await panelTitle() });
    }
    rec.reached = ctr.members.map((m) => rec.clicks.some((c) => c.picked === m.id));
    out.counters.push(rec);
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c36_hf_${seed}_${tg}_d${day}_${mppWant}.json`, out);
await browser.close();
for (const c of out.counters) console.log(c.text, JSON.stringify(c.members.map((m) => [m.name, m.pxFromBox, m.inBox])), JSON.stringify(c.reached), JSON.stringify(c.clicks.map((k) => k.panel?.split(' | ')[0])));
console.log(out.fatal ?? '', errors.length);
