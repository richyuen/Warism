// Critic run 60 (new): R58d's landscape Actions tab with many wars. Play ME, declare war (hud.command) on each FOE, open
// the Actions tab, shot; then the panel's scroll box: is every war row and its reason reachable (scrolled into view),
// and does the bottom bar cover any of it. Usage: node c68_manywars.mjs <seed> <ME> <FOE,FOE,...> <W> <H>
import { launch, open1938, shot, save, hours, CELLS } from './c68_lib.mjs';
const [seedS, ME, FOES, wS, hS] = process.argv.slice(2);
const seed = Number(seedS), W = Number(wS), H = Number(hS);
const T = CELLS.tags;
const label = `${seed}_${ME}_${W}x${H}`;
const out = { seed, ME, FOES, W, H };
const { browser, page, errors } = await launch(W, H);
try {
  await open1938(page, seed);
  await page.evaluate((n) => window.__warsim.view.select(n), T[ME]);
  await page.getByTestId('take-control').click();
  await page.getByTestId('release-control').waitFor({ timeout: 10000 });
  for (const f of FOES.split(',')) await page.evaluate(({ a, d }) => window.__warsim.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: T[ME], d: T[f] });
  await hours(page, 2);
  await page.getByTestId('tab-actions').click();
  await page.waitForTimeout(800);
  await shot(page, `c68mw_${label}_top.png`);
  out.rows = await page.evaluate(() => [...document.querySelectorAll('[data-testid^=act-peace-]')].map((b) => {
    const row = b.closest('.god-row') ?? b.parentElement;
    const r = row.getBoundingClientRect();
    const bb = b.getBoundingClientRect();
    return { id: b.dataset.testid, text: row.textContent, top: Math.round(r.top), bottom: Math.round(r.bottom), btnRight: Math.round(bb.right), btnLeft: Math.round(bb.left), disabled: b.disabled };
  }));
  // the bars that sit over the map at the foot
  out.bars = await page.evaluate(() => [...document.querySelectorAll('[data-testid=bottom-bar], .bottom-bar, [data-testid=controls], .controls')].map((e) => { const r = e.getBoundingClientRect(); return { cls: e.className, top: Math.round(r.top), bottom: Math.round(r.bottom) }; }));
  // the panel and its scroll boxes
  out.panel = await page.evaluate(() => {
    const p = document.querySelector('[data-testid=nation-panel]') ?? document.querySelector('.nation-panel');
    if (!p) return null;
    const r = p.getBoundingClientRect();
    const scrollers = [...p.querySelectorAll('*')].filter((e) => e.scrollHeight > e.clientHeight + 4 && getComputedStyle(e).overflowY !== 'visible').map((e) => ({ cls: e.className, sh: e.scrollHeight, ch: e.clientHeight, top: Math.round(e.getBoundingClientRect().top), bottom: Math.round(e.getBoundingClientRect().bottom) }));
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), scrollers };
  });
  // scroll the last war row into view, shot
  const last = out.rows[out.rows.length - 1];
  if (last) {
    await page.locator(`[data-testid=${last.id}]`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    out.lastAfterScroll = await page.evaluate((id) => { const b = document.querySelector(`[data-testid=${id}]`); const r = b.getBoundingClientRect(); const el = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2); return { top: Math.round(r.top), bottom: Math.round(r.bottom), hit: el === b || b.contains(el), hitCls: el?.className ?? null }; }, last.id);
    await shot(page, `c68mw_${label}_last.png`);
  }
  // the overall page: horizontal overflow
  out.overflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
} catch (e) { out.fail = String(e?.stack ?? e).slice(0, 600); }
out.errors = errors;
save(`c68_mw_${label}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 5000));
