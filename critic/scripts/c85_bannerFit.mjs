// Critic run 81 (new, R174): does the war row fit, not only each name its own box? 1938 (or SCEN=random), seed, after
// <days> days, at W x H. For each banner: its rect against the viewport and the row; each side's name, allies' count,
// swords and death mark: shown (not clipped by an ancestor), overlapping a sibling's or another banner's; the "+n" button:
// on screen and the top element at its centre; the row's and the page's horizontal overflow. Shots of the row.
// Usage: [BASE=...] [TAG=] [SCEN=1938|random] [OPEN=1] node critic/scripts/c85_bannerFit.mjs <seed> <days> <W> <H>
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, hours } from './c85_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 68901), days = Number(process.argv[3] ?? 0), W = Number(process.argv[4] ?? 390), H = Number(process.argv[5] ?? 844);
const TAG = process.env.TAG ?? '', SCEN = process.env.SCEN ?? '1938', OPEN = process.env.OPEN === '1';
const L = `c85bf_${SCEN}_${seed}_d${days}_${W}x${H}${OPEN ? '_open' : ''}${process.env.PANEL ? '_p' + process.env.PANEL : ''}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: Number(process.env.DPR ?? 1), hasTouch: W < 600 || H < 500, isMobile: W < 600 });
const page = await ctx.newPage();
// DPR from the environment for readable crops (DPR=2).
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`error: ${m.text()}`.slice(0, 300)); });
const url = SCEN === 'random' ? `${BASE}/?scenario=random&nations=60&paused=1&seed=${seed}` : `${BASE}/?scenario=1938&paused=1&seed=${seed}`;
const out = { seed, days, W, H, base: BASE, scen: SCEN, open: OPEN };
try {
  await page.goto(url);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  if (days > 0) await hours(page, 24 * days);
  await page.waitForTimeout(900);
  if (OPEN) { await page.locator('[data-testid=war-more]').click(); await page.waitForTimeout(500); }
  // PANEL=<tag>: a nation panel open first (does the row keep clear of it?).
  if (process.env.PANEL) { const { CELLS } = await import('./c85_lib.mjs'); await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), CELLS.tags[process.env.PANEL]); await page.waitForTimeout(700); }
  out.geom = await page.evaluate(() => {
    const R = (e) => { const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width) }; };
    // The part of e that shows: its rect cut by every ancestor that clips (overflow not visible) and by the viewport.
    const visible = (e) => {
      let r = e.getBoundingClientRect(); let l = r.left, t = r.top, rr = r.right, b = r.bottom;
      for (let a = e.parentElement; a; a = a.parentElement) {
        const cs = getComputedStyle(a);
        if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') { const q = a.getBoundingClientRect(); l = Math.max(l, q.left); t = Math.max(t, q.top); rr = Math.min(rr, q.right); b = Math.min(b, q.bottom); }
      }
      l = Math.max(l, 0); t = Math.max(t, 0); rr = Math.min(rr, innerWidth); b = Math.min(b, innerHeight);
      const w = Math.max(0, rr - l), full = Math.max(1, r.width);
      return { shownFrac: +(w / full).toFixed(2), offScreen: r.right > innerWidth + 0.5 || r.left < -0.5 };
    };
    const ov = (a, b) => { const x = Math.min(a.right, b.right) - Math.max(a.left, b.left), y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); return x > 1 && y > 1 ? Math.round(x) : 0; };
    const row = document.querySelector('[data-testid=war-banners]');
    if (!row) return { noRow: true };
    const banners = [...row.querySelectorAll('[data-testid=war-banner]')];
    const res = { row: R(row), rowScroll: row.scrollWidth - row.clientWidth, pageScrollX: document.documentElement.scrollWidth - innerWidth, banners: [] };
    const parts = [];
    banners.forEach((bn, bi) => {
      const br = bn.getBoundingClientRect();
      const b = { i: bi, rect: R(bn), contentOverflow: Math.round(bn.scrollWidth - bn.clientWidth), vis: visible(bn), sides: [] };
      for (const side of bn.querySelectorAll('.war-side')) {
        const nm = side.querySelector('.war-name'), al = side.querySelector('.war-allies');
        const nr = nm.getBoundingClientRect();
        const s = { name: nm.textContent.trim(), short: nm.classList.contains('war-name-short'), nameRect: R(nm), nameCut: nm.scrollWidth > nm.clientWidth + 1, nameVis: visible(nm), outsideBanner: Math.round(Math.max(0, nr.right - br.right, br.left - nr.left)) };
        if (al) { const ar = al.getBoundingClientRect(); s.allies = al.textContent.trim(); s.alliesVis = visible(al); s.alliesOutsideBanner = Math.round(Math.max(0, ar.right - br.right)); parts.push({ bi, what: `allies ${s.name}`, r: ar }); }
        parts.push({ bi, what: `name ${s.name}`, r: nr });
        const sw0 = side.querySelector('.chip-swatch'); if (sw0) s.swatchW = +sw0.getBoundingClientRect().width.toFixed(1);
        // characters shown in the name (prefix measure) when cut
        if (s.nameCut) {
          const tn = [...nm.childNodes].find((c) => c.nodeType === 3); const range = document.createRange(); let k = 0;
          for (let i = 1; i <= tn.textContent.length; i++) { range.setStart(tn, 0); range.setEnd(tn, i); if (range.getBoundingClientRect().right <= nr.right - 8) k = i; else break; }
          s.lettersShown = k;
        }
        b.sides.push(s);
      }
      const sw = bn.querySelector('.war-swords'); if (sw) { parts.push({ bi, what: 'swords', r: sw.getBoundingClientRect() }); b.swordsVis = visible(sw); b.swordsW = +sw.getBoundingClientRect().width.toFixed(1); }
      // Glyphs inside the banner that overlap each other (name, allies, swords, death mark, score figure).
      const inner = [...bn.querySelectorAll('.war-name, .war-allies, .war-swords, [data-testid=war-death], .war-score-n')].filter((e) => getComputedStyle(e).display !== 'none').map((e) => ({ e, r: e.getBoundingClientRect(), k: (e.className || e.getAttribute('data-testid')) + ':' + e.textContent.trim().slice(0, 12) }));
      b.innerOverlap = [];
      for (let x = 0; x < inner.length; x++) for (let y = x + 1; y < inner.length; y++) { const o = ov(inner[x].r, inner[y].r); if (o) b.innerOverlap.push(`${inner[x].k} / ${inner[y].k} ${o}px`); }
      const dm = bn.querySelector('[data-testid=war-death]'); if (dm) { b.deathVis = visible(dm); b.deathOutsideBanner = Math.round(Math.max(0, dm.getBoundingClientRect().right - br.right)); }
      const sc = bn.querySelector('.war-score'); if (sc) b.scoreBar = R(sc);
      res.banners.push(b);
    });
    // Overlaps between banners' boxes, and between a banner's parts and another banner's box.
    res.bannerOverlap = [];
    for (let i = 0; i < banners.length; i++) for (let j = i + 1; j < banners.length; j++) { const o = ov(banners[i].getBoundingClientRect(), banners[j].getBoundingClientRect()); if (o) res.bannerOverlap.push([i, j, o]); }
    res.partsOverOther = [];
    for (const p of parts) banners.forEach((bn, j) => { if (j !== p.bi) { const o = ov(p.r, bn.getBoundingClientRect()); if (o) res.partsOverOther.push({ part: p.what, of: p.bi, over: j, px: o }); } });
    const pnl = document.querySelector('[data-testid=nation-panel]');
    if (pnl) { res.panelOverlap = banners.map((bn) => ov(bn.getBoundingClientRect(), pnl.getBoundingClientRect())); }
    const more = row.querySelector('[data-testid=war-more]');
    if (more) {
      const mr = more.getBoundingClientRect(); const cx = mr.left + mr.width / 2, cy = mr.top + mr.height / 2;
      const top = cx >= 0 && cx < innerWidth && cy >= 0 && cy < innerHeight ? document.elementFromPoint(cx, cy) : null;
      res.more = { text: more.textContent.trim(), rect: R(more), vis: visible(more), topIsIt: !!top && (top === more || more.contains(top)) };
      for (const bn of banners) { const o = ov(mr, bn.getBoundingClientRect()); if (o) res.more.overBanner = o; }
    }
    return res;
  });
  const g = out.geom;
  const bad = [];
  if (g.noRow) bad.push('no row');
  else {
    if (g.pageScrollX > 0) bad.push(`page scrolls sideways ${g.pageScrollX}px`);
    if (g.rowScroll > 0) bad.push(`row overflows ${g.rowScroll}px`);
    for (const b of g.banners) {
      if (b.vis.shownFrac < 1) bad.push(`banner ${b.i} shows ${b.vis.shownFrac}`);
      if (b.contentOverflow > 0) bad.push(`banner ${b.i} content past its box ${b.contentOverflow}px`);
      for (const s of b.sides) {
        if (s.nameVis.shownFrac < 1) bad.push(`name "${s.name}" shown ${s.nameVis.shownFrac}`);
        if (s.nameCut && s.lettersShown !== undefined && s.lettersShown < Math.min(5, s.name.length)) bad.push(`name "${s.name}" ${s.lettersShown} letters`);
        if (s.short && s.nameCut) bad.push(`short name "${s.name}" cut`);
        if (s.outsideBanner) bad.push(`name "${s.name}" ${s.outsideBanner}px outside its banner`);
        if (s.alliesVis && s.alliesVis.shownFrac < 1) bad.push(`allies of "${s.name}" shown ${s.alliesVis.shownFrac}`);
        if (s.alliesOutsideBanner) bad.push(`allies of "${s.name}" ${s.alliesOutsideBanner}px outside its banner`);
      }
      for (const o of b.innerOverlap) bad.push(`banner ${b.i}: ${o} overlap`);
      if (b.swordsW !== undefined && b.swordsW < 6) bad.push(`swords of banner ${b.i} squeezed to ${b.swordsW}px`);
      for (const s of b.sides) if (s.swatchW !== undefined && s.swatchW < 4) bad.push(`swatch of "${s.name}" squeezed to ${s.swatchW}px`);
      if (b.deathOutsideBanner) bad.push(`death mark of banner ${b.i} ${b.deathOutsideBanner}px outside`);
      if (b.deathVis && b.deathVis.shownFrac < 1) bad.push(`death mark of banner ${b.i} shown ${b.deathVis.shownFrac}`);
    }
    for (const o of g.bannerOverlap) bad.push(`banners ${o[0]} and ${o[1]} overlap ${o[2]}px`);
    for (const o of g.partsOverOther) bad.push(`${o.part} (banner ${o.of}) over banner ${o.over} by ${o.px}px`);
    if (g.more && (!g.more.topIsIt || g.more.vis.shownFrac < 1)) bad.push(`"${g.more.text}" button shown ${g.more.vis.shownFrac}, top ${g.more.topIsIt}`);
    if (g.panelOverlap) g.panelOverlap.forEach((o, i) => { if (o) bad.push(`banner ${i} under/over the nation panel ${o}px`); });
    if (g.more && g.more.overBanner) bad.push(`"+n" over a banner ${g.more.overBanner}px`);
  }
  out.bad = bad;
  const row = await page.locator('[data-testid=war-banners]').boundingBox().catch(() => null);
  if (row) await page.screenshot({ path: path.join(SHOTS, `${L}_row.png`), clip: { x: 0, y: Math.max(0, row.y - 6), width: W, height: Math.min(H - Math.max(0, row.y - 6), row.height + 12) } });
  await page.screenshot({ path: path.join(SHOTS, `${L}.png`) });
  out.shot = `critic/shots/${L}_row.png`;
  console.log(`${L}: ${bad.length} faults`);
  for (const b of bad) console.log('  ' + b);
  if (!g.noRow) for (const b of g.banners) console.log(`  banner ${b.i} [${b.rect.l},${b.rect.r}] ` + b.sides.map((s) => `"${s.name}"${s.allies ? ' ' + s.allies : ''}${s.nameCut ? ` cut→${s.lettersShown}` : ''} [${s.nameRect.l},${s.nameRect.r}]`).join(' ⚔ '));
  if (g.more) console.log(`  more "${g.more.text}" [${g.more.rect.l},${g.more.rect.r}] top=${g.more.topIsIt}`);
} catch (e) {
  out.failed = String(e).slice(0, 300);
  console.log('FAILED', out.failed);
}
out.errors = errors;
console.log('errors', errors.length);
save(`${L}.json`, out);
await browser.close();
