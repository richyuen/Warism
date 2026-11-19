// Critic run 86 (new, R197 off its case). R197 places a desk's closed war row in the band free between the boxes of #ui
// beside it at its height (`freeBand`), recounts when the band moves, and drops the overflow's 1 px tolerance.
// Parts, on a 1938 world after <days> days:
//  dpr   : one window narrowed 1100 -> 600 px (STEP) at deviceScaleFactor 1, 1.25 and 1.5: banners shown, "+n", overflow,
//          the row's box, stale after a nudge. A count lower at 1.25/1.5 than at 1 is a fractional-px drop.
//  wide  : 1280x720, 1600x900, 1920x1080, 2560x1440: the row's centre against the page's, its width against 60 %, and
//          every map mode (the legend's width changes): banners shown and the row's left per mode.
//  hover : at 700x800 and 1280x800, the mouse swept over the map (land and sea): the legend's height and the row's
//          shown/left per point; a row that changes while only the mouse moves is a flicker.
//  idle  : the row's mutations over 4 s paused (a render loop shows as a steady count).
// Usage: [BASE=...] node critic/scripts/c86_deskAttack.mjs <seed> <days> [parts=dpr,wide,hover,idle]
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, hours } from './c85_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 84901), days = Number(process.argv[3] ?? 400);
const parts = (process.argv[4] ?? 'dpr,wide,hover,idle').split(',');
const STEP = Number(process.env.STEP ?? 20);
const L = `c86da_${seed}_d${days}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const out = { seed, days, parts: {} };
const errors = [];
async function open(w, h, dpr) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 200)}`); });
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  if (days) await hours(page, 24 * days);
  await page.waitForTimeout(1000);
  return { ctx, page };
}
const geom = (page) => page.evaluate(() => {
  const row = document.querySelector('[data-testid=war-banners]');
  if (!row) return { row: null };
  const rr = row.getBoundingClientRect();
  const more = row.querySelector('[data-testid=war-more]');
  const lg = document.querySelector('[data-testid=map-legend]')?.getBoundingClientRect();
  const under = [];
  for (const el of document.querySelectorAll('.ticker .ticker-row, [data-testid=ticker-row], [data-testid=map-legend], [data-testid=ticker-more]')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    let hit = 0;
    for (let x = r.left + 2; x < r.right - 2; x += 4) { const t = document.elementFromPoint(x, r.top + r.height / 2); if (t && row.contains(t)) hit++; }
    if (hit) under.push({ what: el.textContent.trim().slice(0, 30), px: hit * 4 });
  }
  // The row's neighbours at its height (what freeBand reads).
  const near = [...row.parentElement.children].filter((c) => c !== row).map((c) => ({ c, b: c.getBoundingClientRect() }))
    .filter(({ b }) => b.width && b.height && !(b.bottom <= rr.top || b.top >= rr.bottom))
    .map(({ c, b }) => `${(c.className || c.tagName).toString().slice(0, 24)}[${Math.round(b.left)},${Math.round(b.right)}]`);
  return {
    vw: innerWidth,
    shown: row.querySelectorAll('[data-testid=war-banner]').length,
    more: more?.textContent.trim() ?? null,
    sized: row.classList.contains('war-sized'),
    row: [Math.round(rr.left), Math.round(rr.right), Math.round(rr.top), Math.round(rr.bottom)],
    mid: Math.round((rr.left + rr.right) / 2),
    maxW: row.style.maxWidth || getComputedStyle(row).maxWidth,
    overflow: row.scrollWidth - row.clientWidth,
    legend: lg ? [Math.round(lg.left), Math.round(lg.top), Math.round(lg.width), Math.round(lg.height)] : null,
    under,
    near,
    wars: window.__warsim.hud.wars?.value?.length ?? null,
  };
});
async function rowShot(page, name) {
  const b = await page.locator('[data-testid=war-banners]').boundingBox().catch(() => null);
  const vp = page.viewportSize();
  const y = b ? Math.max(0, b.y - 60) : 0;
  await page.screenshot({ path: path.join(SHOTS, name), clip: { x: 0, y, width: vp.width, height: Math.min(vp.height - y, (b?.height ?? 100) + 160) } });
  return `critic/shots/${name}`;
}

if (parts.includes('dpr')) {
  const res = {};
  for (const dpr of [1, 1.25, 1.5]) {
    const { ctx, page } = await open(1100, 800, dpr);
    const steps = [];
    for (let W = 1100; W >= 600; W -= STEP) {
      await page.setViewportSize({ width: W, height: 800 });
      await page.waitForTimeout(600);
      const g = await geom(page);
      await page.setViewportSize({ width: W + 1, height: 800 });
      await page.waitForTimeout(300);
      await page.setViewportSize({ width: W, height: 800 });
      await page.waitForTimeout(600);
      const n = await geom(page);
      const st = { W, shown: g.shown, more: g.more, sized: g.sized, ov: g.overflow, row: g.row, under: g.under.map((u) => u.px), nudged: n.shown };
      if (g.shown === 0 || g.overflow > 0 || g.under.length || n.shown !== g.shown) st.shot = await rowShot(page, `${L}_dpr${dpr}_${W}.png`);
      steps.push(st);
      console.log('dpr', dpr, JSON.stringify(st));
    }
    res[dpr] = steps;
    await ctx.close();
  }
  const cmp = [];
  for (const s of res[1]) for (const d of [1.25, 1.5]) {
    const o = res[d].find((x) => x.W === s.W);
    if (o && o.shown !== s.shown) cmp.push(`${s.W}@${d}:${o.shown}vs${s.shown}`);
  }
  out.parts.dpr = { res, fewerThanDpr1: cmp, stale: Object.entries(res).flatMap(([d, st]) => st.filter((s) => s.nudged !== s.shown).map((s) => `${s.W}@${d}`)), fit0: Object.entries(res).flatMap(([d, st]) => st.filter((s) => s.shown === 0).map((s) => `${s.W}@${d}:${s.more}`)), overflow: Object.entries(res).flatMap(([d, st]) => st.filter((s) => s.ov > 0).map((s) => `${s.W}@${d}:${s.ov}`)), covering: Object.entries(res).flatMap(([d, st]) => st.filter((s) => s.under.length).map((s) => `${s.W}@${d}`)) };
  console.log('dpr summary', JSON.stringify({ fewer: cmp, stale: out.parts.dpr.stale, fit0: out.parts.dpr.fit0, overflow: out.parts.dpr.overflow, covering: out.parts.dpr.covering }));
}

if (parts.includes('wide')) {
  const res = [];
  for (const [w, h] of [[1280, 720], [1600, 900], [1920, 1080], [2560, 1440]]) {
    const { ctx, page } = await open(w, h, 1);
    for (const mode of ['political', 'alliances', 'puppets', 'terrain', 'wars', 'diplomacy', 'income', 'revolts', 'seaControl', 'airControl', 'fallout']) {
      await page.evaluate((m) => window.__warsim.hud.setMapMode(m), mode);
      await page.waitForTimeout(500);
      const g = await geom(page);
      const st = { w, h, mode, shown: g.shown, more: g.more, row: g.row, mid: g.mid, offCentre: g.mid - w / 2, maxW: g.maxW, pct: Math.round(((g.row[1] - g.row[0]) / w) * 100), legend: g.legend, under: g.under, near: g.near };
      if (mode === 'political' || mode === 'income' || mode === 'diplomacy') st.shot = await rowShot(page, `${L}_wide_${w}x${h}_${mode}.png`);
      res.push(st);
      console.log('wide', JSON.stringify(st));
    }
    await ctx.close();
  }
  out.parts.wide = res;
}

if (parts.includes('hover')) {
  const res = [];
  for (const [w, h] of [[700, 800], [1280, 800]]) {
    const { ctx, page } = await open(w, h, 1);
    for (const mode of ['seaControl', 'airControl', 'political']) {
      await page.evaluate((m) => window.__warsim.hud.setMapMode(m), mode);
      await page.waitForTimeout(400);
      const seen = new Map();
      let changes = 0, last = null;
      const pts = [];
      for (let y = 120; y < h - 200; y += 60) for (let x = 40; x < w - 40; x += 60) pts.push([x, y]);
      for (const [x, y] of pts) {
        await page.mouse.move(x, y);
        await page.waitForTimeout(120);
        const g = await geom(page);
        const k = `${g.shown}|${g.more}|${g.row[0]}|${g.row[1]}`;
        seen.set(k, (seen.get(k) ?? 0) + 1);
        if (last !== null && k !== last) changes++;
        last = k;
      }
      const st = { w, h, mode, points: pts.length, rowStates: Object.fromEntries(seen), changes };
      res.push(st);
      console.log('hover', JSON.stringify(st));
      if (changes) await rowShot(page, `${L}_hover_${w}_${mode}.png`);
    }
    await ctx.close();
  }
  out.parts.hover = res;
}

if (parts.includes('idle')) {
  const res = [];
  for (const [w, h] of [[640, 800], [700, 800], [1280, 800]]) {
    const { ctx, page } = await open(w, h, 1);
    const n = await page.evaluate(async () => {
      const row = document.querySelector('[data-testid=war-banners]');
      if (!row) return null;
      let c = 0;
      const mo = new MutationObserver((l) => { c += l.length; });
      mo.observe(row, { attributes: true, childList: true, subtree: true, characterData: true });
      await new Promise((r) => setTimeout(r, 4000));
      mo.disconnect();
      return c;
    });
    res.push({ w, h, mutations4s: n });
    console.log('idle', w, h, n);
    await ctx.close();
  }
  out.parts.idle = res;
}
out.errors = errors;
console.log('errors', errors.length, JSON.stringify(errors.slice(0, 5)));
save(`${L}.json`, out);
await browser.close();
