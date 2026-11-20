// Critic run 88 (new): Batch 55 (R203 to R208) and the page's boxes at the five supported sizes (ADR-1141): the iPhone 16
// upright 393 x 659 and 393 x 852, sideways 734 x 343 and 852 x 393 (touch, pixel ratio 3), and the 1440p desk's window,
// 2560 x 1305. One 1938 world of SEED at day DAYS, paused. At each size, in each map mode: which of the page's boxes
// (bars, legend, war row, ranking, news, panels, landings' bar, first cue) lies over which (the element at sampled
// points of each box), which leaves the view, and whether the page scrolls sideways; with the legend folded and opened
// (its rows reachable by scrolling? the ranking back as it folds, R208), the ranking opened, a nation's panel, History,
// relations, the charts, God Mode; a rotation with the legend open (phones); and a landing ordered (the landings' bar
// beside the legend and a nation's panel, the panel's x under the pointer, R207).
// Usage: [BASE=...] node critic/scripts/c88_sizes.mjs <seed> <days> [sizes=393x659,393x852,734x343,852x393,2560x1305] [landing=1]
import { chromium } from '@playwright/test';
import path from 'node:path';
import { BASE, save, SHOTS, hours } from './c85_lib.mjs';
import { CELLS } from './c81_lib.mjs';
const seed = Number(process.argv[2] ?? 88901), days = Number(process.argv[3] ?? 400);
const sizes = (process.argv[4] ?? '393x659,393x852,734x343,852x393,2560x1305').split(',').map((s) => s.split('x').map(Number));
const doLanding = (process.argv[5] ?? '1') === '1';
const modes = (process.env.MODES ?? 'political,seaControl,airControl,fallout,puppets,diplomacy').split(',');
const L = `c88sz_${seed}_d${days}`;
const out = { seed, days, cases: [] };
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });

const audit = (page) => page.evaluate(() => {
  const sel = {
    topbar: '[data-testid=topbar]', bottombar: '[data-testid=bottombar]', legend: '[data-testid=map-legend]', row: '[data-testid=war-banners]',
    ranking: '.stats-ranking', news: '[data-testid=ticker]', nation: '[data-testid=nation-panel]', history: '[data-testid=history-panel]',
    landings: '[data-testid=landings-bar]', cue: '[data-testid=first-cue]', relations: '[data-testid=relations-panel]', chart: '[data-testid=stats-chart]',
    god: '[data-testid=god-tools]', lapse: '[data-testid=time-lapse]', alerts: '[data-testid=nuke-alerts]', orderNews: '[data-testid=order-news]',
    modeMenu: '[data-testid=mapmode-menu]', formation: '[data-testid=formation-panel]', settings: '[data-testid=settings-panel]', player: '[data-testid=player-label]',
  };
  const els = {};
  for (const [k, s] of Object.entries(sel)) {
    const e = document.querySelector(s);
    if (!e) continue;
    const r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || getComputedStyle(e).display === 'none' || getComputedStyle(e).visibility === 'hidden') continue;
    els[k] = e;
  }
  const boxes = {}, covers = [], outs = [];
  for (const [k, e] of Object.entries(els)) {
    const r = e.getBoundingClientRect();
    boxes[k] = [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)];
    if (r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1) outs.push(k);
    const cnt = {}; let total = 0;
    for (let x = Math.max(0, r.left) + 1; x < Math.min(innerWidth, r.right) - 1; x += 3) for (let y = Math.max(0, r.top) + 1; y < Math.min(innerHeight, r.bottom) - 1; y += 3) {
      total++;
      const t = document.elementFromPoint(x, y);
      if (!t || e.contains(t)) continue;
      for (const [k2, e2] of Object.entries(els)) if (k2 !== k && e2.contains(t) && !e.contains(e2) && !e2.contains(e)) cnt[k2] = (cnt[k2] ?? 0) + 1;
    }
    for (const [k2, n] of Object.entries(cnt)) covers.push(`${k}<${k2} ${n}/${total}`);
  }
  const lg = els.legend, rk = els.ranking;
  const banners = [...document.querySelectorAll('[data-testid=war-banner]')];
  return {
    boxes, covers, outs, scrollsX: document.documentElement.scrollWidth > innerWidth + 1,
    legendOpen: lg?.getAttribute('data-open') ?? null, foldable: lg?.classList.contains('foldable') ?? null,
    legendScroll: lg ? [lg.scrollHeight, lg.clientHeight, lg.scrollWidth, lg.clientWidth] : null,
    rankingFolded: rk ? rk.classList.contains('folded') : null,
    shown: banners.length, more: document.querySelector('[data-testid=war-more]')?.textContent.trim() ?? null,
    bannerCut: banners.filter((b) => [...b.querySelectorAll('*')].some((c) => c.scrollWidth > c.clientWidth + 1 && getComputedStyle(c).textOverflow !== 'ellipsis' && getComputedStyle(c).overflow !== 'visible')).length,
  };
});

for (const [W, H] of sizes) {
  const phone = W < 1000;
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, ...(phone ? { deviceScaleFactor: 3, isMobile: true, hasTouch: true } : {}) });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`error: ${m.text()}`.slice(0, 300)); });
  const press = (loc) => (phone ? loc.tap({ timeout: 4000 }) : loc.click({ timeout: 4000 }));
  let n = 0;
  const rec = async (mode, state, extra = {}) => {
    const a = await audit(page);
    const c = { W, H, mode, state, ...a, ...extra };
    out.cases.push(c);
    const bad = a.covers.length || a.outs.length || a.scrollsX;
    if (bad || mode === 'political' || mode === 'seaControl' || state.startsWith('landing')) {
      c.shot = `critic/shots/${L}_${W}x${H}_${String(n++).padStart(2, '0')}_${mode}_${state}.png`;
      await page.screenshot({ path: path.join(SHOTS, path.basename(c.shot)), scale: 'css' });
    }
    console.log(`${W}x${H} ${mode} ${state}: shown ${a.shown} ${a.more ?? ''} legend ${a.legendOpen} ${JSON.stringify(a.boxes.legend ?? null)} row ${JSON.stringify(a.boxes.row ?? null)} ranking ${a.rankingFolded === null ? 'none' : a.rankingFolded ? 'folded' : 'open'} | covers ${JSON.stringify(a.covers)} outs ${JSON.stringify(a.outs)}${a.scrollsX ? ' SCROLLS-X' : ''} ${Object.keys(extra).length ? JSON.stringify(extra) : ''}`);
    return a;
  };
  try {
    await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
    await rec('political', 'start');
    if (days) await hours(page, 24 * days);
    await page.waitForTimeout(800);
    const toggle = page.locator('[data-testid=legend-toggle]');
    const rtoggle = page.locator('[data-testid=ranking-toggle]');
    for (const mode of modes) {
      await page.evaluate((m) => window.__warsim.hud.setMapMode(m), mode);
      if (mode === 'diplomacy') await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), CELLS.tags.GER);
      await page.waitForTimeout(500);
      const base = await rec(mode, 'base');
      if (await toggle.count() && await toggle.isVisible()) {
        await press(toggle).catch((e) => console.log('  toggle press failed', e.message.slice(0, 80)));
        await page.waitForTimeout(500);
        // Can every row of the opened legend be reached? Scroll it to its end and read the last row's box against the legend's.
        const reach = await page.evaluate(() => {
          const lg = document.querySelector('[data-testid=map-legend]');
          const before = [lg.scrollHeight, lg.clientHeight];
          lg.scrollTop = lg.scrollHeight;
          const kids = [...lg.querySelectorAll('.legend-row, [data-testid=legend-units], .legend-selected')];
          const last = kids[kids.length - 1]?.getBoundingClientRect(), b = lg.getBoundingClientRect();
          const r = { scroll: before, rows: kids.length, lastIn: last ? last.bottom <= b.bottom + 1 && last.top >= b.top - 1 : null, wide: lg.scrollWidth > lg.clientWidth + 1 };
          lg.scrollTop = 0;
          return r;
        });
        const opened = await rec(mode, 'legendOpen', { reach });
        // R208: the ranking gives way while the legend is open (upright), and is back, in its state, as it folds.
        if (await toggle.isVisible()) await press(toggle).catch(() => {});
        await page.waitForTimeout(400);
        const again = await audit(page);
        if (again.rankingFolded !== base.rankingFolded || again.legendOpen !== 'false') console.log(`  REFOLD differs: ranking ${base.rankingFolded} -> ${again.rankingFolded}, legend ${again.legendOpen}`);
        void opened;
      } else if (mode === 'diplomacy') await page.evaluate(() => window.__warsim.hud.onSelectNation(0));
      if (mode === 'diplomacy') await page.evaluate(() => window.__warsim.hud.onSelectNation(0));
    }
    await page.evaluate(() => window.__warsim.hud.setMapMode('seaControl'));
    await page.waitForTimeout(300);
    // The ranking opened; then the legend opened beside it; then the ranking's toggle pressed with the legend open.
    if (await rtoggle.count() && await rtoggle.isVisible()) {
      await press(rtoggle).catch((e) => console.log('  ranking press failed', e.message.slice(0, 80)));
      await page.waitForTimeout(500);
      await rec('seaControl', 'rankOpen');
      if (await toggle.count() && await toggle.isVisible()) {
        await press(toggle).catch((e) => console.log('  toggle press failed (rank open)', e.message.slice(0, 80)));
        await page.waitForTimeout(500);
        await rec('seaControl', 'rankOpen+legendOpen', { rankingToggleSeen: await rtoggle.isVisible().catch(() => false) });
        if (await toggle.isVisible()) await press(toggle).catch(() => {});
        await page.waitForTimeout(400);
        await rec('seaControl', 'rankOpen+legendRefolded');
      }
      if (await rtoggle.isVisible()) await press(rtoggle).catch(() => {});
      await page.waitForTimeout(300);
    }
    // Panels, each with the legend opened first (does it give way and come back?).
    const openLegend = async () => { if (await toggle.count() && await toggle.isVisible() && (await toggle.getAttribute('aria-expanded')) !== 'true') { await press(toggle).catch(() => {}); await page.waitForTimeout(300); } };
    await openLegend();
    await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), CELLS.tags.GER);
    await page.waitForTimeout(500);
    await rec('seaControl', 'legendOpen+nation');
    await page.evaluate(() => window.__warsim.hud.onSelectNation(0));
    await page.waitForTimeout(400);
    await rec('seaControl', 'legendOpen+nationClosed');
    for (const [name, fn] of [['history', 'toggleHistory'], ['relations', 'toggleRelations'], ['charts', 'toggleCharts'], ['god', 'toggleGod']]) {
      await page.evaluate((f) => window.__warsim.hud[f](), fn);
      await page.waitForTimeout(600);
      await rec('seaControl', `legendOpen+${name}`);
      await page.evaluate((f) => window.__warsim.hud[f](), fn);
      await page.waitForTimeout(400);
    }
    await rec('seaControl', 'legendOpen+allClosed');
    // A rotation with the legend open (phones): to the other way round and back.
    if (phone) {
      await page.setViewportSize({ width: H > W ? (H === 659 ? 734 : 852) : (W === 734 ? 393 : 393), height: H > W ? (H === 659 ? 343 : 393) : (W === 734 ? 659 : 852) });
      await page.waitForTimeout(800);
      await rec('seaControl', 'legendOpen+rotated');
      await page.setViewportSize({ width: W, height: H });
      await page.waitForTimeout(800);
      await rec('seaControl', 'legendOpen+rotatedBack');
    }
    if (await toggle.count() && await toggle.isVisible() && (await toggle.getAttribute('aria-expanded')) === 'true') await press(toggle).catch(() => {});
    // A landing ordered: Japan on China, three divisions by sea to Shanghai; the landings' bar beside everything.
    if (doLanding) {
      const JAP = CELLS.tags.JAP, CHI = CELLS.tags.CHI;
      await page.evaluate(({ a, d }) => window.__warsim.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: JAP, d: CHI });
      await page.evaluate(() => window.__warsim.sim.step(1));
      await page.evaluate((n) => window.__warsim.view.select(n), JAP);
      await page.waitForTimeout(400);
      const tc = page.getByTestId('take-control');
      if (await tc.count()) { await tc.scrollIntoViewIfNeeded().catch(() => {}); await press(tc).catch((e) => console.log('  take-control failed', e.message.slice(0, 80))); }
      await page.getByTestId('release-control').waitFor({ timeout: 10000 }).catch(() => console.log('  no release-control'));
      const ids = await page.evaluate(({ n, x, y }) => {
        const v = window.__warsim.view;
        return v.formationsOf(n).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - x, v.formationPos(id)[1] - y)]).sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, 3).map((d) => d[0]);
      }, { n: JAP, x: 1818.5, y: 385.5 });
      for (const id of ids) await page.evaluate(({ id, n }) => window.__warsim.hud.command({ kind: 'moveFormation', id, x: 1715.5, y: 413.5, nation: n }), { id, n: JAP });
      await page.evaluate(() => window.__warsim.sim.step(2));
      await page.waitForTimeout(800);
      for (const mode of ['political', 'seaControl']) {
        await page.evaluate((m) => window.__warsim.hud.setMapMode(m), mode);
        await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), JAP);
        await page.waitForTimeout(500);
        // R207: the element at the centre of the nation panel's x.
        const xHit = await page.evaluate(() => {
          const x = document.querySelector('[data-testid=nation-close]');
          if (!x) return null;
          const r = x.getBoundingClientRect();
          const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          return { box: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], at: t?.getAttribute('data-testid') ?? t?.className ?? null, isX: !!t && x.contains(t) };
        });
        await rec(mode, 'landing+nation', { xHit });
        await page.evaluate(() => window.__warsim.hud.onSelectNation(0));
        await page.waitForTimeout(400);
        await rec(mode, 'landing');
        if (await toggle.count() && await toggle.isVisible()) {
          await press(toggle).catch((e) => console.log('  toggle press failed (landing)', e.message.slice(0, 80)));
          await page.waitForTimeout(500);
          await rec(mode, 'landing+legendOpen');
          const lt = page.getByTestId('landing-toggle').first();
          if (await lt.count() && await lt.isVisible()) {
            await press(lt).catch((e) => console.log('  landing-toggle press failed', e.message.slice(0, 80)));
            await page.waitForTimeout(400);
            await rec(mode, 'landing+legendOpen+barToggled');
            await press(lt).catch(() => {});
          }
          if (await toggle.isVisible() && (await toggle.getAttribute('aria-expanded')) === 'true') await press(toggle).catch(() => {});
          await page.waitForTimeout(300);
        }
      }
    }
  } catch (e) {
    console.log(`${W}x${H} FAILED ${e.message.slice(0, 300)}`);
    await page.screenshot({ path: path.join(SHOTS, `${L}_${W}x${H}_failed.png`) }).catch(() => {});
  }
  console.log(`${W}x${H} errors ${errors.length} ${JSON.stringify(errors.slice(0, 3))}`);
  out.cases.push({ W, H, errors });
  await ctx.close();
}
save(`${L}.json`, out);
await browser.close();
