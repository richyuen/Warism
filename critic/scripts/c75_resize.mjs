// Critic run 75 (new): the window resized in a running game. Plain 1938 SEED with heroes at DAY, running; the viewport
// set to each size in turn (desk, small desk, phone upright, phone on its side, a small phone, a large screen, and
// back): after 1.2 s the canvas against the window, a page wider than the window, chrome off the screen (the top bar,
// the bottom bar, the banners, the ticker: any box with a part outside the window), the frames drawn in a second,
// page errors; a picture each.
// Usage: node critic/scripts/c75_resize.mjs <seed> <day>
import { launch, open1938, hours, shot, save } from './c75_lib.mjs';
const seed = Number(process.argv[2] ?? 58821), DAY = Number(process.argv[3] ?? 60);
const out = { seed, DAY, sizes: [] };
const { browser, page, errors } = await launch(1600, 900);
try {
  await open1938(page, seed, '&heroes=on');
  await hours(page, DAY * 24);
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  for (const [w, h] of [[1600, 900], [1024, 768], [800, 600], [390, 844], [844, 390], [320, 568], [2560, 1440], [640, 360], [1600, 900]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(1200);
    const r = await page.evaluate(async () => {
      const v = window.__warsim.view; const f0 = v.frames; const t0 = v.lastTick;
      await new Promise((d) => setTimeout(d, 1000));
      const cs = [...document.querySelectorAll('canvas')].map((c) => { const b = c.getBoundingClientRect(); return { cw: Math.round(b.width), ch: Math.round(b.height), bw: c.width, bh: c.height }; });
      const vw = window.innerWidth, vh = window.innerHeight;
      const off = [...document.querySelectorAll('.topbar, .topclock, .bottombar, [data-testid=war-banner], .war-more, .ticker-row, .map-legend, [data-testid=ranking-toggle], [data-testid=speed-label], button')]
        .filter((e) => e.offsetParent !== null)
        .map((e) => { const b = e.getBoundingClientRect(); return { id: e.getAttribute('data-testid') ?? e.className?.toString().slice(0, 30) ?? e.tagName, text: (e.innerText ?? '').trim().slice(0, 20), l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom) }; })
        .filter((b) => b.l < -1 || b.t < -1 || b.r > vw + 1 || b.b > vh + 1);
      return { vw, vh, dpr: window.devicePixelRatio, canvases: cs, wider: document.documentElement.scrollWidth > vw, taller: document.documentElement.scrollHeight > vh, off: off.slice(0, 8), offCount: off.length, frames: v.frames - f0, ticks: v.lastTick - t0, mpp: Math.round(v.metresPerPx) };
    });
    const s = await shot(page, `c75rs_${seed}_${w}x${h}.png`);
    out.sizes.push({ w, h, ...r, shot: s });
    console.log(`${w}x${h}: canvas ${JSON.stringify(r.canvases[0])}, wider ${r.wider}, taller ${r.taller}, off-screen chrome ${r.offCount} ${JSON.stringify(r.off.slice(0, 3))}, frames/s ${r.frames}, ticks ${r.ticks}, ${r.mpp} m/px`);
  }
} catch (e) { out.error = String(e?.stack ?? e).slice(0, 1200); console.log('ERROR', out.error); }
out.errors = errors;
console.log(`page errors ${errors.length} ${JSON.stringify(errors.slice(0, 4))}`);
save(`c75_rs_${seed}.json`, out);
await browser.close();
