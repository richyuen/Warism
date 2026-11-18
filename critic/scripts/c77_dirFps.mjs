// Critic run 77 (new): R150's cost. The director asks `inView(..., uncovered)` (elementFromPoint) each frame. Plain 1938
// SEED (heroes on) stepped DAYS; History open; the director on; the game at x5 for SECS s: frames per second, p95 and
// the longest frame, and the director's cuts. Run on HEAD and run 76's build at the same time.
// Usage: [BASE=...] node critic/scripts/c77_dirFps.mjs <seed> <days> <tag> [SECS] [W H]
import { launch, open1938, save, hours, run } from './c77_lib.mjs';
const seed = Number(process.argv[2] ?? 59951), DAYS = Number(process.argv[3] ?? 100), tag = process.argv[4] ?? 'head', SECS = Number(process.argv[5] ?? 30), W = Number(process.argv[6] ?? 1600), H = Number(process.argv[7] ?? 900);
const out = { seed, DAYS, tag, SECS, W, H };
const { browser, page, errors } = await launch(W, H);
try {
  await open1938(page, seed, '&heroes=on');
  await hours(page, DAYS * 24);
  await page.evaluate(() => { if (!window.__warsim.hud.showHistory.value) window.__warsim.hud.toggleHistory(); });
  await page.getByTestId('director-btn').click();
  await page.waitForTimeout(500);
  await run(page);
  out.frames = await page.evaluate(async (secs) => {
    const times = []; const t0 = performance.now();
    while (performance.now() - t0 < secs * 1000) times.push(await new Promise((d) => requestAnimationFrame(d)));
    const gaps = times.slice(1).map((t, i) => t - times[i]).sort((a, b) => a - b);
    return { fps: (times.length - 1) / ((times.at(-1) - times[0]) / 1000), p50: gaps[Math.floor(gaps.length / 2)], p95: gaps[Math.floor(gaps.length * 0.95)], max: gaps.at(-1), over50: gaps.filter((g) => g > 50).length };
  }, SECS);
  out.on = await page.evaluate(() => window.__warsim.hud.director?.on?.value ?? null);
} catch (e) { out.error = String(e).slice(0, 300); }
out.errors = errors;
save(`c77_dirFps_${tag}_${seed}_${W}x${H}.json`, out);
console.log(JSON.stringify(out));
await browser.close();
