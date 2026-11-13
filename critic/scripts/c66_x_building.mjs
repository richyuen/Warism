// Critic run 64 (new): R65c's "Building the world…" over the map until the first stats. From the navigation, every
// 100 ms for SECS: is the overlay there, are the stats, the frames drawn, the nations drawn (a probe of the owner under
// the screen's middle); shots at the first sample with the overlay, the first without it, and at the end.
// Is it there for every start but the toy's, gone once the world is drawn, and never over a drawn world for long?
// Usage: node critic/scripts/c66_x_building.mjs <label> <W> <H> <url-path | file:<scenario file>> [secs=20]
import { launch, shot, save, BASE } from './c66_lib.mjs';
const [label, W, H, target] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4]), process.argv[5]];
const SECS = Number(process.argv[6] ?? 20);
const out = { label, W, H, target, samples: [] };
const { browser, page, errors } = await launch(W, H);
try {
  let t0;
  if (target.startsWith('file:')) {
    await page.goto(`${BASE}/`);
    await page.getByTestId('title-scenario-file').setInputFiles(target.slice(5));
    await page.waitForTimeout(1500);
    t0 = Date.now();
    await page.getByTestId('title-file-start').click();
  } else {
    t0 = Date.now();
    await page.goto(`${BASE}${target}`);
  }
  let shotOn = false, shotOff = false;
  while (Date.now() - t0 < SECS * 1000) {
    const s = await page.evaluate(() => {
      const el = document.querySelector('[data-testid=world-building]');
      const w = window.__warsim;
      return {
        overlay: el ? el.innerText : null,
        stats: w?.hud?.stats?.value != null,
        frames: w?.view?.frames ?? 0,
        layers: w?.sim?.mapLayers != null,
        tick: w?.hud?.tick?.value ?? null,
        mid: w?.view ? w.view.nationAt(innerWidth / 2, innerHeight / 2) : null,
      };
    }).catch((e) => ({ err: String(e).slice(0, 120) }));
    s.ms = Date.now() - t0;
    if (s.overlay && !shotOn) { shotOn = true; s.shot = await shot(page, `c66xb_${label}_on.png`); }
    if (!s.overlay && shotOn && !shotOff) { shotOff = true; s.shot = await shot(page, `c66xb_${label}_off.png`); }
    out.samples.push(s);
    await page.waitForTimeout(100);
  }
  out.endShot = await shot(page, `c66xb_${label}_end.png`);
  const S = out.samples;
  const on = S.filter((s) => s.overlay);
  out.summary = {
    n: S.length,
    overlaySamples: on.length,
    firstOverlayMs: on[0]?.ms ?? null,
    lastOverlayMs: on.at(-1)?.ms ?? null,
    firstFramesMs: S.find((s) => s.frames > 0)?.ms ?? null,
    firstLayersMs: S.find((s) => s.layers)?.ms ?? null,
    firstStatsMs: S.find((s) => s.stats)?.ms ?? null,
    firstMidNationMs: S.find((s) => s.mid)?.ms ?? null,
    overlayWithStats: on.filter((s) => s.stats).length,
    noOverlayNoStatsAfterFrames: S.filter((s) => s.frames > 0 && !s.stats && !s.overlay).length,
    overlayWithNationDrawn: on.filter((s) => s.mid).length,
    endOverlay: S.at(-1)?.overlay ?? null,
  };
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c66_xb_${label}.json`, out);
await browser.close();
console.log(label, JSON.stringify(out.summary), out.fatal ?? 'ok', errors.slice(0, 5));
