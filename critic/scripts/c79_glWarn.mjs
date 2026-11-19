// Critic run 79 (new): where the WebGL warning "bufferSubData: buffer overflow" (seen once in look 64907 at 2560 x 1440)
// comes from. Plain 1938 SEED (heroes on) at W x H, stepped to each of DAYS; at each day the camera at the world, Europe,
// East Asia and the two largest fronts at 14000/3000/1200/600/250/100/30 m/px, drawn and settled; after each act the
// console's errors and warnings so far: the act that adds one is named. Also the game run 20 s at Max at the world zoom.
// Usage: [BASE=...] node critic/scripts/c79_glWarn.mjs <seed> <W> <H> <days,comma>
import { launch, open1938, hours, lookAt, save, shot, run, pause, maxSpeed } from './c79_lib.mjs';
const seed = Number(process.argv[2] ?? 64907), W = Number(process.argv[3] ?? 2560), H = Number(process.argv[4] ?? 1440);
const DAYS = (process.argv[5] ?? '120,500').split(',').map(Number);
const out = { seed, W, H, acts: [] };
const { browser, page, errors } = await launch(W, H);
let seen = 0;
const note = (act) => { if (errors.length > seen) { out.acts.push({ act, new: errors.slice(seen) }); seen = errors.length; } };
try {
  await open1938(page, seed, '&heroes=on');
  note('open');
  let day = 0;
  for (const d of DAYS) {
    await hours(page, 24 * (d - day)); day = d; note(`step to day ${d}`);
    const fronts = await page.evaluate(() => {
      const s = window.__warsim.hud.stats.value; const wars = [...(s?.wars ?? [])].sort((a, b) => (b.men ?? 0) - (a.men ?? 0));
      const v = window.__warsim.view; const ids = wars.slice(0, 2).map((w) => w.sides?.[0]?.[0] ?? w.a ?? 0);
      return ids.map((id) => { const n = s.nations.find((x) => x.id === id); return n ? [n.capitalX ?? n.cx ?? 1100, n.capitalY ?? n.cy ?? 280] : [1100, 280]; });
    });
    const spots = [['world', 1024, 512], ['europe', 1100, 270], ['asia', 1700, 380], ...fronts.map((f, i) => [`front${i}`, f[0], f[1]])];
    for (const [name, x, y] of spots) for (const m of [14000, 3000, 1200, 600, 250, 100, 30]) {
      if (name === 'world' && m < 3000) continue;
      await lookAt(page, x, y, m); note(`day ${d} ${name} ${m} m/px`);
    }
    await lookAt(page, 1100, 270, 6000);
    await maxSpeed(page); await run(page); await page.waitForTimeout(20000); await pause(page); note(`day ${d} 20 s at Max, Europe 6000`);
    out[`shot${d}`] = await shot(page, `c79gw_${seed}_${W}x${H}_d${d}.png`);
  }
} catch (e) { out.error = String(e).slice(0, 400); }
out.errors = errors;
save(`c79_gw_${seed}_${W}x${H}.json`, out);
console.log(JSON.stringify(out, null, 1));
await browser.close();
