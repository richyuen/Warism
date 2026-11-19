// Critic run 81 (new, R175): on a phone, the nation panel and the relations graph in turns. A's panel open, Relations
// tapped (how much of the graph shows); B chosen from outside the graph (hud.onSelectNation, as a map tap or a row of the
// ticker does); A chosen again (does A's panel show, or is A selected with no panel?); a node tapped in the graph (how much
// of the graph still shows); Relations closed (the panel back?). Shots at each step.
// Usage: [BASE=...] [TAG=] node critic/scripts/c81_relOver.mjs <seed> <W> <H> [A] [B]
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, CELLS } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 69933), W = Number(process.argv[3] ?? 390), H = Number(process.argv[4] ?? 844);
const A = process.argv[5] ?? 'GER', B = process.argv[6] ?? 'ITA';
const TAG = process.env.TAG ?? '';
const L = `c81ro_${seed}_${W}x${H}_${A}_${B}${TAG}`;
const out = { seed, W, H, A, B, base: BASE, steps: [] };
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 600 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`${m.type()}: ${m.text()}`.slice(0, 300)); });
const shot = async (n) => { await page.screenshot({ path: path.join(SHOTS, `${L}_${n}.png`) }); return `critic/shots/${L}_${n}.png`; };
const state = () => page.evaluate(() => {
  const g = document.querySelector('[data-testid=relations-graph]');
  const p = document.querySelector('[data-testid=nation-panel]');
  let hidden = null, n = 0;
  if (g) {
    const r = g.getBoundingClientRect(); hidden = 0;
    for (let i = 1; i < 10; i++) for (let j = 1; j < 10; j++) {
      const x = r.left + (r.width * i) / 10, y = r.top + (r.height * j) / 10;
      if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) { hidden++; continue; }
      n++;
      const top = document.elementFromPoint(x, y);
      if (!(top && (top === g || g.contains(top)))) hidden++;
    }
  }
  const h = window.__warsim.hud;
  return { selected: h.selected.value, relationsOn: h.showRelations.value, relationsOver: h.relationsOver?.value, graph: !!g, hiddenOf81: hidden, panel: p ? (p.querySelector('h2, h3, [data-testid=nation-name]')?.textContent ?? p.textContent).trim().slice(0, 30) : null };
});
const step = async (name) => { const s = { name, ...(await state()), shot: await shot(name.replace(/\W+/g, '_')) }; out.steps.push(s); console.log(name, JSON.stringify(s)); return s; };
try {
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  const a = CELLS.tags[A], b = CELLS.tags[B];
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), a);
  await page.waitForSelector('[data-testid=nation-panel]', { timeout: 10_000 });
  await step('1 A panel');
  const rel = page.getByTestId('relations-btn');
  await rel.scrollIntoViewIfNeeded();
  await rel.tap();
  await page.waitForTimeout(700);
  await step('2 relations opened');
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), b);
  await page.waitForTimeout(600);
  await step('3 B chosen outside the graph');
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), a);
  await page.waitForTimeout(600);
  const s4 = await step('4 A chosen again');
  out.aAgainNoPanel = s4.selected === a && !s4.panel;
  // Back to the graph alone: deselect, then tap a node in it.
  await page.evaluate(() => window.__warsim.hud.onSelectNation(0));
  await page.waitForTimeout(400);
  const pick = await page.evaluate(() => {
    const g = document.querySelector('[data-testid=relations-graph]'); if (!g) return null;
    const gr = g.getBoundingClientRect();
    for (const n of document.querySelectorAll('[data-testid^=relations-node-]')) {
      const c = n.querySelector('circle'); if (!c) continue;
      const r = c.getBoundingClientRect(); const x = r.x + r.width / 2, y = r.y + r.height / 2;
      if (x > gr.left + 20 && x < gr.right - 20 && y > gr.top + 20 && y < gr.bottom - 20) { const top = document.elementFromPoint(x, y); if (top && n.contains(top)) return { id: n.getAttribute('data-testid'), x, y }; }
    }
    return null;
  });
  out.pick = pick;
  if (pick) { await page.touchscreen.tap(pick.x, pick.y); await page.waitForTimeout(700); }
  await step('5 node tapped in the graph');
  // Relations closed by its button (or Escape).
  const rb = page.getByTestId('relations-btn');
  if (await rb.isVisible().catch(() => false)) await rb.tap(); else await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  await step('6 relations closed');
  // A again, Relations again, then closed again without choosing: A's panel back?
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), a);
  await page.waitForTimeout(400);
  if (await rb.isVisible().catch(() => false)) { await rb.tap(); await page.waitForTimeout(600); }
  await step('7 A then relations');
  if (await rb.isVisible().catch(() => false)) { await rb.tap(); await page.waitForTimeout(600); } else await page.evaluate(() => window.__warsim.hud.toggleRelations());
  const s8 = await step('8 relations closed again');
  out.panelBackAfterClose = !!s8.panel;
} catch (e) {
  out.failed = String(e).slice(0, 300);
  console.log('FAILED', out.failed);
  await shot('fail').catch(() => null);
}
out.errors = errors;
console.log('aAgainNoPanel', out.aAgainNoPanel, 'panelBackAfterClose', out.panelBackAfterClose, 'errors', errors.length, errors.slice(0, 3));
save(`${L}.json`, out);
await browser.close();
