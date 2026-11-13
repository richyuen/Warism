// Critic run 63 (new): c65_h_watch's samples, taken paused, show no "Next" line in 5 of the first 19. When a player
// pauses at Max in the second after an event fired (the line hidden by R64f), does the line come back while paused?
// 1938h at Max; poll every 50 ms until the line is hidden while the track runs, pause at once; then read the line at
// 0.5, 2, 5 and 10 s paused; shot at 10 s. N tries.
// Usage: node critic/scripts/c65_h_pauseblank.mjs [tries=5]
import { launch, save, shot, BASE } from './c65_lib.mjs';
const N = Number(process.argv[2] ?? 5);
const out = { tries: [] };
const { browser, page, errors } = await launch(1600, 900);
const read = () => page.evaluate(() => ({
  date: document.querySelector('[data-testid=date-label]')?.innerText.replace(/\n/g, ' | ') ?? null,
  next: document.querySelector('[data-testid=track-next]')?.innerText ?? null,
  tick: window.__warsim.hud.tick.value,
  statsTick: window.__warsim.hud.stats.value?.tick ?? null,
  trackNextTick: window.__warsim.hud.stats.value?.trackNext?.tick ?? null,
  paused: window.__warsim.hud.paused.value,
}));
try {
  await page.goto(`${BASE}/?scenario=1938h&paused=1`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} window.__warsim.hud.setSpeedLevel(99); });
  for (let k = 0; k < N; k++) {
    await page.evaluate(() => { if (window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
    await page.waitForTimeout(1500);
    // wait for the hidden state, then pause in the same task
    const got = await page.evaluate(async () => {
      const w = window.__warsim; const t0 = performance.now();
      while (performance.now() - t0 < 60000) {
        const s = w.hud.stats.value;
        if (s?.trackNext && s.trackNext.tick < w.hud.tick.value) { w.hud.togglePause(); return true; }
        await new Promise((r) => setTimeout(r, 20));
      }
      return false;
    });
    const t = { got, reads: [] };
    for (const ms of [500, 1500, 3000, 5000]) { await page.waitForTimeout(ms); t.reads.push(await read()); }
    t.shot = await shot(page, `c65hpb_${k}.png`);
    out.tries.push(t);
    console.log(k, got, JSON.stringify(t.reads.map((r) => [r.date, r.next, r.tick, r.statsTick, r.trackNextTick])));
  }
} catch (e) { out.fatal = String(e?.stack ?? e); console.log(out.fatal); }
out.errors = errors;
save('c65_hpb.json', out);
await browser.close();
