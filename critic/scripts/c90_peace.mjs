// Critic run 90 (new): R216's peace line (ADR-1145) on a random world of N nations. Opens it paused at W x H (touch and
// pixel ratio 3 for a phone), steps STEP days a message for YEARS years; at each sample: wars now, the line shown or not,
// its text and data-why, the stats' `peace` reasons, and which of the page's boxes lie over the line (elementFromPoint
// on a 3 px grid). Each time the line or its reasons change, the line is tapped open: its rows read, a
// shot, which boxes lie over the opened rows and whether they leave the view; tapped shut. At the end the state hash
// (compare with c90_headHashR.ts on the same seed: the line's reads must not move the world).
// Usage: [BASE=...] node critic/scripts/c90_peace.mjs <seed> <nations> <years> [WxH=2560x1305] [touch] [step days=30] [extra url]
import { chromium, devices } from '@playwright/test';
import { BASE, save, shot } from './c85_lib.mjs';
const [seedS, nS, yS, wh = '2560x1305', touchS = '', stepS = '30', extra = ''] = process.argv.slice(2);
const [W, H] = wh.split('x').map(Number), touch = touchS === 'touch', STEP = Number(stepS);
const out = { seed: +seedS, nations: +nS, years: +yS, size: wh, touch, samples: [], opened: [] };
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: touch ? 3 : 1, hasTouch: touch, isMobile: touch });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`error: ${m.text()}`.slice(0, 300)); });
const sel = {
  topbar: '[data-testid=topbar]', bottombar: '[data-testid=bottombar]', legend: '[data-testid=map-legend]', ranking: '.stats-ranking',
  news: '[data-testid=ticker]', nation: '[data-testid=nation-panel]', god: '[data-testid=god-tools]', alerts: '[data-testid=nuke-alerts]',
  cue: '[data-testid=first-cue]', player: '[data-testid=player-label]', time: '[data-testid=time-lapse]',
};
const audit = (which) => page.evaluate(({ sel, which }) => {
  const me = document.querySelector(which);
  if (!me) return null;
  const r = me.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return { hidden: true };
  const cnt = {}; let total = 0;
  for (let x = Math.max(0, r.left) + 1; x < Math.min(innerWidth, r.right) - 1; x += 3) for (let y = Math.max(0, r.top) + 1; y < Math.min(innerHeight, r.bottom) - 1; y += 3) {
    total++;
    const t = document.elementFromPoint(x, y);
    if (!t || me.contains(t)) continue;
    let k = 'other:' + (t.getAttribute('data-testid') ?? t.className?.toString?.().slice(0, 30) ?? t.tagName);
    for (const [k2, s] of Object.entries(sel)) { const e2 = document.querySelector(s); if (e2 && e2.contains(t)) { k = k2; break; } }
    if (t.tagName === 'CANVAS') continue; // the map under it
    cnt[k] = (cnt[k] ?? 0) + 1;
  }
  const others = {};
  for (const [k, s] of Object.entries(sel)) { const e = document.querySelector(s); if (!e) continue; const q = e.getBoundingClientRect(); if (q.width > 0 && q.height > 0) others[k] = [q.left, q.top, q.right, q.bottom].map(Math.round); }
  const cut = [...me.querySelectorAll('*')].filter((c) => c.scrollWidth > c.clientWidth + 1 && getComputedStyle(c).overflow !== 'visible').map((c) => c.className?.toString?.() ?? c.tagName);
  return { box: [r.left, r.top, r.right, r.bottom].map(Math.round), out: r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1, covered: cnt, total, cut, others, scrollsX: document.documentElement.scrollWidth > innerWidth + 1 };
}, { sel, which });
try {
  await page.goto(`${BASE}/?scenario=random&paused=1&seed=${seedS}&nations=${nS}${extra}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120000 });
  let lastOpenKey = '';
  for (let d = 0; d <= +yS * 365; d += STEP) {
    if (d > 0) {
      await page.evaluate(async (n) => { await window.__warsim.sim.step(n); }, STEP * 24);
      await page.waitForFunction((t) => window.__warsim.hud.stats.value?.tick >= t, d * 24, { timeout: 120000 }).catch(() => {});
      await page.waitForTimeout(250);
    }
    const s = await page.evaluate(() => {
      const st = window.__warsim.hud.stats.value;
      const line = document.querySelector('[data-testid=war-peace]');
      return {
        tick: st.tick, wars: st.wars.length, alive: st.nations.filter((n) => n.alive !== false && (n.cells ?? 1) > 0).length,
        peace: st.peace ? { why: st.peace.why, rows: st.peace.rows?.map((r) => `${r.n}:${r.reason}:${r.t}`) } : null,
        line: line ? line.innerText.replace(/\n/g, ' ') : null, dataWhy: line?.getAttribute('data-why') ?? null,
        banners: document.querySelectorAll('[data-testid=war-banner]').length,
      };
    });
    s.day = d;
    if (s.line !== null) s.audit = await audit('[data-testid=war-peace-row]');
    out.samples.push(s);
    const key = `${s.line}|${s.dataWhy}|${JSON.stringify(s.peace)}`;
    if (s.line !== null && key !== lastOpenKey) {
      lastOpenKey = key;
      const btn = page.getByTestId('war-peace');
      if (touch) await btn.tap(); else await btn.click();
      await page.waitForTimeout(400);
      const o = { day: d, rows: await page.evaluate(() => [...(document.querySelector('[data-testid=war-peace-rows]')?.children ?? [])].map((c) => c.innerText.replace(/\n/g, ' '))), audit: await audit('[data-testid=war-peace-row]') };
      o.shot = await shot(page, `c90peace_${seedS}_${nS}_${wh}_d${d}_open.png`);
      if (touch) await btn.tap(); else await btn.click();
      await page.waitForTimeout(300);
      o.closedAgain = await page.evaluate(() => document.querySelector('[data-testid=war-peace]')?.getAttribute('aria-expanded'));
      out.opened.push(o);
      if (out.opened.length === 1) out.shotClosed = await shot(page, `c90peace_${seedS}_${nS}_${wh}_d${d}_closed.png`);
    }
  }
  out.hash = await page.evaluate(async () => (await window.__warsim.sim.step(0)).hash);
  out.endShot = await shot(page, `c90peace_${seedS}_${nS}_${wh}_end.png`);
} catch (e) { out.fail = String(e).slice(0, 400); }
finally {
  out.errors = errors;
  save(`c90_peace_${seedS}_${nS}_${wh}${touch ? '_t' : ''}.json`, out);
  await browser.close();
  const s = out.samples;
  console.log(JSON.stringify({ seed: out.seed, size: wh, samples: s.length, withLine: s.filter((x) => x.line !== null).length, atWar: s.filter((x) => x.wars > 0).length, lineWhileWar: s.filter((x) => x.line !== null && x.wars > 0).length, noLineAtPeace: s.filter((x) => x.line === null && x.wars === 0 && x.peace).length, hash: out.hash, errors, fail: out.fail }));
  for (const x of s) console.log(x.day, x.wars, x.alive, JSON.stringify(x.line), x.dataWhy, JSON.stringify(x.peace), x.audit ? JSON.stringify({ c: x.audit.covered, out: x.audit.out, cut: x.audit.cut }) : '');
  for (const o of out.opened) console.log('OPEN', o.day, JSON.stringify(o.rows), JSON.stringify({ box: o.audit?.box, c: o.audit?.covered, out: o.audit?.out, cut: o.audit?.cut, sx: o.audit?.scrollsX }), o.closedAgain, o.shot);
}
