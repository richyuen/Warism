// Critic run 73 (new): how much the markers of a crowded front cover one another at the middle zooms (T1, 2,000 m/px
// and nearer), on the build at BASE (HEAD's at 5377, run 72's at 5374): the same seed, the same days, the same camera.
// The 1938 world's own war (Japan on China) and, with FORCE=ATT,DEF, a war declared by hand on the first day.
// For each view: the markers drawn (alpha >= 0.5), those with over 30 % and over 60 % of their box under boxes drawn
// after them, the pairs that overlap, the markers under the chrome (clock, banners, bars, ticker, legend). Shots.
// Usage: BASE=... node critic/scripts/c81_markers.mjs <seed> <tag> <W> <H> <cx,cy> <days,comma> <m/px,comma> [FORCE ATT,DEF]
import { launch, save, shot, lookAt, hours, BASE } from './c81_lib.mjs';
const seed = Number(process.argv[2] ?? 56951);
const tag = process.argv[3] ?? 'head';
const W = Number(process.argv[4] ?? 1600), H = Number(process.argv[5] ?? 900);
const [cx, cy] = (process.argv[6] ?? '1675,372').split(',').map(Number);
const days = (process.argv[7] ?? '10,20,30').split(',').map(Number);
const zooms = (process.argv[8] ?? '1800,1200,600').split(',').map(Number);
const force = process.argv[9] ? process.argv[9].split(',') : null;
const out = { seed, tag, base: BASE, W, H, cx, cy, force, views: [] };
const { browser, page, errors } = await launch(W, H);
try {
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}&heroes=on`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null && window.__warsim.sim.mapLayers !== null, null, { timeout: 180_000 });
  if (force) {
    await page.evaluate(async ([a, d]) => {
      const s = window.__warsim.hud.stats.value;
      const ins = await window.__warsim.sim.inspect();
      const idOf = (t) => (ins.nations ?? []).find((n) => n.tag === t)?.id ?? 0;
      window.__forced = [idOf(a), idOf(d)];
      window.__warsim.sim.command({ kind: 'declareWar', attacker: idOf(a), defender: idOf(d) });
    }, force);
    out.forced = await page.evaluate(() => window.__forced);
  }
  let done = 0;
  for (const d of days) {
    await hours(page, (d - done) * 24); done = d;
    await page.waitForTimeout(1200);
    for (const m of zooms) {
      await lookAt(page, cx, cy, m);
      await page.waitForTimeout(600);
      const v = await page.evaluate(() => {
        const v = window.__warsim.view;
        v.draw(performance.now());
        const ms = v.markerRects.filter((r) => r.alpha >= 0.5).map((r) => ({ x: r.x, y: r.y, w: r.w, h: r.h, nation: r.nation }));
        const inter = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
        let pairs = 0, c30 = 0, c60 = 0;
        for (let i = 0; i < ms.length; i++) {
          let cov = 0;
          for (let j = 0; j < ms.length; j++) {
            if (i === j) continue;
            const a = inter(ms[i], ms[j]);
            if (a > 0) { if (j > i) { pairs++; cov += a; } }
          }
          const f = Math.min(1, cov / (ms[i].w * ms[i].h));
          if (f > 0.3) c30++;
          if (f > 0.6) c60++;
        }
        const chrome = [...document.querySelectorAll('.war-banner, .war-more, .bottombar, .topbar, .topclock, .map-legend, .stats-ranking, .ticker-row, [data-testid=ticker-more], [data-testid=ranking-toggle]')].map((e) => { const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; }).filter((b) => b.w > 0);
        const under = ms.filter((r) => chrome.some((c) => inter(r, c) > 0.3 * r.w * r.h)).length;
        const onScreen = ms.filter((r) => r.x + r.w > 0 && r.y + r.h > 0 && r.x < window.innerWidth && r.y < window.innerHeight).length;
        const size = ms.length ? { w: Math.round(ms[0].w), h: Math.round(ms[0].h) } : null;
        return { markers: ms.length, onScreen, pairs, c30, c60, under, size, tags: (v.tagRects ?? []).length, mpp: Math.round(v.metresPerPx) };
      });
      const s = await shot(page, `c81mk_${tag}_${seed}_${W}x${H}_${force ? force.join('') + '_' : ''}d${d}_${m}m.png`);
      out.views.push({ day: d, m, ...v, shot: s });
      console.log(`${tag} seed ${seed} ${W}x${H} ${force ? force.join('>') : 'own'} day ${d} ${m} m/px: markers ${v.markers} (on screen ${v.onScreen}) size ${JSON.stringify(v.size)} pairs ${v.pairs} over30 ${v.c30} over60 ${v.c60} underChrome ${v.under}`);
    }
  }
} catch (e) {
  out.error = String(e?.stack ?? e).slice(0, 1200);
  console.log('ERROR', out.error);
}
out.errors = errors;
save(`c81_mk_${tag}_${seed}_${W}x${H}${force ? '_' + force.join('') : ''}.json`, out);
await browser.close();
