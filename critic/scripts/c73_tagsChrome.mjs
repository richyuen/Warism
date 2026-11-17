// Critic run 73 (new): R100 and R101 on new seeds, by the page's own boxes. 1938 SEED, Germany's war on Poland
// declared on the first day, DAY days on; at up to eight of Germany's formations in contact, at each of ZOOMS m/px:
// the tags drawn, those with any part under the chrome (the clock, the banners and their "+n", the bars, the legend,
// the ticker's rows, the top bar), the pairs of tags that overlap, and the pointers (if the view lists them).
// Usage: node critic/scripts/c73_tagsChrome.mjs <seed> [DAY=5] [W H] [zooms=250,120,60,12]
import { launch, open1938, shot, save, hours, lookAt, CELLS } from './c73_lib.mjs';
const seed = Number(process.argv[2] ?? 56971), DAY = Number(process.argv[3] ?? 5);
const W = Number(process.argv[4] ?? 1600), H = Number(process.argv[5] ?? 900);
const zooms = (process.argv[6] ?? '250,120,60,12').split(',').map(Number);
const out = { seed, DAY, W, H, views: [] };
const { browser, page, errors } = await launch(W, H);
try {
  await open1938(page, seed);
  const ger = CELLS.tags.GER, pol = CELLS.tags.POL;
  await page.evaluate(({ a, d }) => window.__warsim.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: ger, d: pol });
  await hours(page, DAY * 24);
  await page.waitForTimeout(1500);
  const spots = await page.evaluate((n) => {
    const v = window.__warsim.view;
    const eng = v.formationsOf(n).filter((f) => v.formationEngaged(f));
    const step = Math.max(1, Math.floor(eng.length / 8));
    return eng.filter((_, i) => i % step === 0).slice(0, 8).map((f) => v.formationPos(f));
  }, ger);
  out.spots = spots.length;
  let tot = { tags: 0, under: 0, pairs: 0 };
  for (const m of zooms) {
    let k = 0;
    for (const p of spots) {
      await lookAt(page, p[0], p[1], m);
      await page.waitForTimeout(500);
      const r = await page.evaluate(() => {
        const v = window.__warsim.view;
        v.draw(performance.now());
        const tags = v.tagRects.map((t) => ({ x: t.x, y: t.y, w: t.w, h: t.h }));
        const inter = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
        const chrome = [...document.querySelectorAll('.war-banner, .war-more, .bottombar, .topbar, .topclock, .map-legend, .stats-ranking, .ticker-row')].map((e) => { const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height, c: e.className.split(' ')[0] }; }).filter((b) => b.w > 0);
        const on = tags.filter((t) => t.x + t.w > 0 && t.y + t.h > 0 && t.x < window.innerWidth && t.y < window.innerHeight);
        const underList = on.filter((t) => chrome.some((c) => inter(t, c) > 4)).map((t) => chrome.find((c) => inter(t, c) > 4).c);
        let pairs = 0;
        for (let i = 0; i < on.length; i++) for (let j = i + 1; j < on.length; j++) if (inter(on[i], on[j]) > 4) pairs++;
        return { tags: on.length, under: underList.length, underOf: underList, pairs };
      });
      tot.tags += r.tags; tot.under += r.under; tot.pairs += r.pairs;
      let s = null;
      if (r.under > 0 || r.pairs > 0 || k === 0) s = await shot(page, `c73tc_${seed}_${W}x${H}_${m}m_${k}.png`);
      out.views.push({ m, k, ...r, shot: s });
      k++;
    }
    console.log(`seed ${seed} ${W}x${H} day ${DAY} ${m} m/px: ${JSON.stringify(out.views.filter((x) => x.m === m).map((x) => [x.tags, x.under, x.pairs]))} [tags, under chrome, overlapping pairs] ${JSON.stringify(out.views.filter((x) => x.m === m).flatMap((x) => x.underOf))}`);
  }
  console.log(`total: ${tot.tags} tags, ${tot.under} under the chrome, ${tot.pairs} overlapping pairs`);
  out.total = tot;
} catch (e) {
  out.error = String(e?.stack ?? e).slice(0, 1200);
  console.log('ERROR', out.error);
}
out.errors = errors;
save(`c73_tc_${seed}_${W}x${H}.json`, out);
await browser.close();
