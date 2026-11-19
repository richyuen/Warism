// Critic run 82 (new, R181 off its case): on a sideways phone, A's panel open, Relations tapped (A's panel gives way, R175),
// then A chosen again by a real tap on its row in the Ranking (on screen beside Relations at 844 x 390). Does A's panel show,
// or is A left selected with no panel? Then B's row, for comparison. A control without Relations: A's panel, then a map tap
// on A's capital (does the map deselect a selected nation?).
// Usage: [BASE=...] [TAG=] node critic/scripts/c82_relRank.mjs <seed> <W> <H> [A] [B]
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, CELLS } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 68901), W = Number(process.argv[3] ?? 844), H = Number(process.argv[4] ?? 390);
const A = process.argv[5] ?? 'SOV', B = process.argv[6] ?? 'USA';
const TAG = process.env.TAG ?? '';
const L = `c82rr_${seed}_${W}x${H}_${A}_${B}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 600 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
const out = { seed, W, H, A, B, base: BASE, steps: [] };
const st = async (name) => {
  const s = await page.evaluate(() => ({ selected: window.__warsim.hud.selected.value, relationsOn: window.__warsim.hud.showRelations.value, relationsOver: window.__warsim.hud.relationsOver.value, panel: (document.querySelector('[data-testid=nation-panel] h2, [data-testid=nation-panel] h3')?.textContent ?? (document.querySelector('[data-testid=nation-panel]') ? 'shown' : null)) }));
  const shot = path.join(SHOTS, `${L}_${name.replace(/\W+/g, '_')}.png`);
  await page.screenshot({ path: shot });
  out.steps.push({ name, ...s, shot: `critic/shots/${path.basename(shot)}` });
  console.log(name, JSON.stringify(s));
  return s;
};
const tapRow = async (id) => {
  const row = page.locator(`[data-testid=rank-row][data-nation="${id}"]`).first();
  if (!(await row.count())) return 'no row';
  await row.scrollIntoViewIfNeeded().catch(() => null);
  const bb = await row.boundingBox(); if (!bb) return 'no box';
  const top = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('[data-testid]')?.getAttribute('data-testid') ?? null, { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 });
  await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await page.waitForTimeout(700);
  return `tapped, top ${top}`;
};
try {
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  const a = CELLS.tags[A], b = CELLS.tags[B];
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), a);
  await page.waitForTimeout(600);
  await st('1 A panel');
  await page.getByTestId('relations-btn').tap();
  await page.waitForTimeout(700);
  await st('2 relations');
  const tog = page.getByTestId('ranking-toggle');
  if (await tog.isVisible().catch(() => false)) { await tog.tap(); await page.waitForTimeout(600); out.rankingOpened = true; } else out.rankingOpened = false;
  await st('3 ranking opened');
  out.viaA = await tapRow(a);
  const s4 = await st('4 A row tapped');
  out.aAgainDead = s4.selected === a && !s4.panel;
  out.viaB = await tapRow(b);
  await st('5 B row tapped');
  // Control: Relations closed, A's panel, a map tap on A's capital.
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  await page.evaluate((n) => window.__warsim.hud.onGoToNation(n), a);
  await page.waitForTimeout(1500);
  const m = await page.evaluate((id) => {
    const v = window.__warsim.view; const at = v.capitalOf(id); const c = v.controller.cam;
    for (const [dx, dy] of [[0, 6], [6, 0], [-6, 0], [0, -6], [8, 8]]) {
      const x = (at[0] - c.cx) * c.scale + innerWidth / 2 + dx, y = (at[1] - c.cy) * c.scale + innerHeight / 2 + dy;
      const t = document.elementFromPoint(x, y); if (t && t.tagName === 'CANVAS') return { x, y };
    }
    return null;
  }, a);
  await st('6 control: A panel, relations closed');
  if (m) { await page.touchscreen.tap(m.x, m.y); await page.waitForTimeout(900); }
  out.controlTap = m;
  await st('7 control: map tap on A');
} catch (e) { out.failed = String(e).slice(0, 300); console.log('FAILED', out.failed); }
out.errors = errors;
console.log('viaA', out.viaA, 'aAgainDead', out.aAgainDead, 'errors', errors.length);
save(`${L}.json`, out);
await browser.close();
