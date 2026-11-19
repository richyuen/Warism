// Critic run 82 (new, R181/R175 off their case): on a phone, A's panel open, Relations tapped (A's panel gives way), then A
// chosen again from outside the graph by a real tap: the war row's side of A (A at war), else the ranking's row, else
// hud.onSelectNation(A). Does A's panel show, or is the tap dead (A already selected, `relationsOver` still A)?
// Then B by the same route, for comparison. Shots at each step.
// Usage: [BASE=...] [TAG=] node critic/scripts/c82_relSame.mjs <seed> <W> <H> [A] [B] [days]
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, CELLS, hours } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 68901), W = Number(process.argv[3] ?? 390), H = Number(process.argv[4] ?? 844);
const A = process.argv[5] ?? 'JAP', B = process.argv[6] ?? 'CHI', DAYS = Number(process.argv[7] ?? 0);
const TAG = process.env.TAG ?? '';
const L = `c82rs_${seed}_${W}x${H}_${A}_${B}_d${DAYS}${TAG}`;
const out = { seed, W, H, A, B, days: DAYS, base: BASE, steps: [] };
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 600 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`${m.type()}: ${m.text()}`.slice(0, 300)); });
const shot = async (n) => { await page.screenshot({ path: path.join(SHOTS, `${L}_${n}.png`) }); return `critic/shots/${L}_${n}.png`; };
const state = () => page.evaluate(() => {
  const p = document.querySelector('[data-testid=nation-panel]');
  const g = document.querySelector('[data-testid=relations-graph]');
  const h = window.__warsim.hud;
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; };
  return { selected: h.selected.value, relationsOn: h.showRelations.value, relationsOver: h.relationsOver?.value, panel: p ? (p.querySelector('h2, h3')?.textContent ?? '').trim().slice(0, 30) || 'shown' : null, panelRect: R(p), graphRect: R(g) };
});
const step = async (name) => { const s = { name, ...(await state()), shot: await shot(name.replace(/\W+/g, '_')) }; out.steps.push(s); console.log(name, JSON.stringify(s)); return s; };
// A real tap on the nation `id` from outside the graph: its side in the war row, then the ranking, then the hud call.
const chooseOutside = async (id, name) => {
  const via = await page.evaluate(({ id, name }) => {
    // A banner's tap chooses its attackers' leader: the banner whose first side names A.
    const sides = [...document.querySelectorAll('.war-banners [data-testid=war-banner]')];
    for (const s of sides) {
      const t = (s.querySelector('.war-side .war-name')?.textContent ?? '').trim().replace('…', '');
      if (!t || !name.includes(t.slice(0, 4))) continue;
      const r = s.getBoundingClientRect(); const x = r.left + Math.min(10, r.width / 2), y = r.top + r.height / 2;
      const top = document.elementFromPoint(x, y);
      if (top && (top === s || s.contains(top))) return { how: 'war-side', x, y, text: t.slice(0, 20) };
      return { how: 'war-side covered', x, y, text: t.slice(0, 20), top: top?.className?.toString().slice(0, 40) };
    }
    return null;
  }, { id, name });
  if (via && via.how === 'war-side') { await page.touchscreen.tap(via.x, via.y); await page.waitForTimeout(700); return via; }
  // The map: a tap a little off A's capital, where the canvas is the top element.
  const m = await page.evaluate((id) => {
    const v = window.__warsim.view; const at = v.capitalOf(id); if (!at) return null;
    const c = v.controller.cam; const cv = v.canvas ?? document.querySelector('canvas');
    for (const [dx, dy] of [[0, 6], [6, 0], [-6, 0], [0, -6], [8, 8]]) {
      const x = (at[0] - c.cx) * c.scale + innerWidth / 2 + dx, y = (at[1] - c.cy) * c.scale + innerHeight / 2 + dy;
      if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
      const top = document.elementFromPoint(x, y);
      if (top && top.tagName === 'CANVAS') return { how: 'map tap', x, y };
    }
    return null;
  }, id);
  if (m) { await page.touchscreen.tap(m.x, m.y); await page.waitForTimeout(900); return m; }
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), id);
  await page.waitForTimeout(700);
  return { how: 'hud.onSelectNation', banner: via };
};
try {
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  if (DAYS > 0) await hours(page, 24 * DAYS);
  const a = CELLS.tags[A], b = CELLS.tags[B];
  const nameOf = (id) => page.evaluate((id) => window.__warsim.hud.stats.value.nations.find((n) => n.id === id)?.name ?? '', id);
  const an = await nameOf(a), bn = await nameOf(b);
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), a);
  await page.waitForSelector('[data-testid=nation-panel]', { timeout: 10_000 });
  await step('1 A panel');
  const rel = page.getByTestId('relations-btn');
  await rel.tap();
  await page.waitForTimeout(700);
  await step('2 relations opened');
  out.viaA = await chooseOutside(a, an);
  const s3 = await step('3 A chosen again from outside');
  out.aAgainDead = s3.selected === a && !s3.panel;
  out.viaB = await chooseOutside(b, bn);
  const s4 = await step('4 B chosen from outside');
  out.bShows = !!s4.panel;
} catch (e) {
  out.failed = String(e).slice(0, 300);
  console.log('FAILED', out.failed);
  await shot('fail').catch(() => null);
}
out.errors = errors;
console.log('viaA', JSON.stringify(out.viaA), 'aAgainDead', out.aAgainDead, 'bShows', out.bShows, 'errors', errors.length);
save(`${L}.json`, out);
await browser.close();
