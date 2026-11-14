// Critic run 22, SB: a sea battle in the countryball look against Classic. Seed 7019's first sea battle (headless
// c68_headless_7019 seaLog: tick 290, France v Spanish Republic at 1018.5, 373.5). Step to 4 h before it, then hour by
// hour, shots at 250, 60, 25 m/px in both looks, live for 2 s each (gunfire, tracers).
// Usage: node critic/scripts/c68_sb_seaballs.mjs [seed] [tick] [x] [y]
import { launch, open1938, lookAt, shot, save, hours, settle } from './c68_lib.mjs';
const seed = Number(process.argv[2] ?? 7019);
const tick = Number(process.argv[3] ?? 290);
const X = Number(process.argv[4] ?? 1018.5), Y = Number(process.argv[5] ?? 373.5);
const out = { seed, tick, at: [X, Y], views: [] };
const { browser, page, errors } = await launch();
try {
  await open1938(page, seed);
  await hours(page, tick - 3);
  for (const m of [250, 60, 25]) {
    await lookAt(page, X, Y, m);
    for (const l of ['balls', 'classic']) {
      await page.evaluate((l) => { window.__warsim.view.unitLook = l; }, l);
      await page.evaluate(() => { window.__warsim.hud.setSpeedLevel(0); if (window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
      await page.waitForTimeout(2000);
      await page.evaluate(() => { if (!window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
      const s = await page.evaluate(() => { const v = window.__warsim.view; return { tick: v.lastTick, el: v.elementCount, mpp: Math.round(v.metresPerPx) }; });
      out.views.push({ m, look: l, ...s, shot: await shot(page, `c68sb_${seed}_${m}m_${l}.png`) });
    }
  }
  await page.evaluate(() => { window.__warsim.view.unitLook = 'balls'; });
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c68_sb_${seed}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1));
