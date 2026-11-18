// Critic run 76 (new): R142, the director, as a player uses it. Plain 1938 SEED with heroes, stepped DAYS; the director
// switched on by its button; Resume at the speed as loaded (or SPEED=<level>) for SECS seconds.
// Measured: the cuts and the gaps between them; the shots the director counts "seen" (in the view when the camera
// stands) and, of those, how many had their place under the page's chrome (elementFromPoint not the map's canvas: the
// banners, the ticker, a panel); the director's rows the worker sent against those seen (the share); with PANEL=history
// the History panel left open the whole time (does the director fly under it?). A shot each 10 s.
// Usage: [BASE=...] [PANEL=history] [SPEED=n] node critic/scripts/c76_director.mjs <seed> <days> <tag> [SECS] [W H]
import { launch, open1938, shot, save, hours } from './c76_lib.mjs';
const seed = Number(process.argv[2] ?? 59951), DAYS = Number(process.argv[3] ?? 100), tag = process.argv[4] ?? 'head';
const SECS = Number(process.argv[5] ?? 120), W = Number(process.argv[6] ?? 1600), H = Number(process.argv[7] ?? 900);
const out = { seed, DAYS, tag, SECS, W, H, panel: process.env.PANEL ?? null, speed: process.env.SPEED ?? null };
const { browser, page, errors } = await launch(W, H);
const P = `c76dr_${tag}_${seed}_${W}x${H}${out.panel ? '_' + out.panel : ''}${out.speed ? '_s' + out.speed : ''}`;
try {
  await open1938(page, seed, '&heroes=on');
  await hours(page, DAYS * 24);
  await page.waitForTimeout(800);
  if (out.speed) await page.evaluate((s) => window.__warsim.hud.setSpeedLevel(Number(s)), out.speed);
  out.speedLabel = await page.getByTestId('speed-label').innerText().catch(() => null);
  await page.evaluate(() => {
    const w = window.__warsim, d = w.hud.director, v = w.view, canvas = v.canvas;
    window.__c76 = { seenAt: [], rows: [], frames: 0 };
    const orig = d.inView.bind(d);
    d.inView = (x, y, inset) => {
      const r = orig(x, y, inset);
      if (r) {
        const c = v.controller.cam, vw = canvas.clientWidth, vh = canvas.clientHeight, at = canvas.getBoundingClientRect();
        let dx = x - c.cx; if (v.geo.wrapX) dx -= v.geo.w * Math.round(dx / v.geo.w);
        const sx = dx * c.scale + vw / 2, sy = (y - c.cy) * c.scale + vh / 2;
        const el = document.elementFromPoint(at.left + sx, at.top + sy);
        window.__c76.seenAt.push({ t: performance.now(), x, y, sx: Math.round(sx), sy: Math.round(sy), covered: el !== canvas, by: el === canvas ? null : (el?.closest('[data-testid]')?.getAttribute('data-testid') ?? el?.className ?? el?.tagName ?? null), km: (v.metresPerPx * vw) / 1000 });
      }
      return r;
    };
    const add = d.add.bind(d);
    d.add = (rows, now) => { if (d.on.value) for (const r of rows) window.__c76.rows.push({ kind: r.kind, x: r.x, y: r.y, tick: r.tick }); return add(rows, now); };
  });
  await page.getByTestId('director-btn').click();
  await page.waitForTimeout(300);
  out.onAfterClick = await page.evaluate(() => window.__warsim.hud.director.on.value);
  if (out.panel === 'history') { await page.evaluate(() => window.__warsim.hud.toggleHistory()); await page.waitForTimeout(500); }
  const t0 = Date.now(), tick0 = await page.evaluate(() => window.__warsim.hud.tick.value);
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  out.shots = [];
  for (let s = 10; s <= SECS; s += 10) {
    await page.waitForTimeout(Math.max(0, t0 + s * 1000 - Date.now()));
    if (s % 30 === 0 || s === 10) out.shots.push(await shot(page, `${P}_${String(s).padStart(3, '0')}.png`));
  }
  await page.getByRole('button', { name: 'Pause', exact: true }).click().catch(() => {});
  out.days = ((await page.evaluate(() => window.__warsim.hud.tick.value)) - tick0) / 24;
  const r = await page.evaluate(() => ({ on: window.__warsim.hud.director.on.value, cuts: [...window.__warsim.hud.director.cuts], seen: window.__warsim.hud.director.seen.map((s) => s.key), log: window.__c76 }));
  out.on = r.on;
  out.cuts = r.cuts.length;
  const gaps = r.cuts.slice(1).map((t, i) => t - r.cuts[i]).sort((a, b) => a - b);
  out.gapMin = gaps[0] ?? null; out.gapMedian = gaps[Math.floor(gaps.length / 2)] ?? null;
  out.rows = r.log.rows.length;
  out.rowKinds = r.log.rows.reduce((m, x) => ((m[x.kind] = (m[x.kind] ?? 0) + 1), m), {});
  out.seen = r.seen.length;
  out.share = out.rows ? +(out.seen / out.rows).toFixed(3) : null;
  out.seenCovered = r.log.seenAt.filter((s) => s.covered).length;
  out.seenCoveredBy = r.log.seenAt.filter((s) => s.covered).reduce((m, s) => ((m[s.by] = (m[s.by] ?? 0) + 1), m), {});
  out.seenSample = r.log.seenAt.slice(0, 12);
} catch (e) {
  out.error = String(e).slice(0, 400);
  await shot(page, `${P}_error.png`).catch(() => {});
}
out.errors = errors;
save(`${P}.json`, out);
console.log(JSON.stringify(out, null, 1));
await browser.close();
