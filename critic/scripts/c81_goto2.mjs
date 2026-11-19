// Critic run 81 (new, R176): "Go to country" from a panel's chip menu, by the UI, for several chips of several nations.
// For each: the chip's nation, its capital (view.capitalOf), the camera after 3 s, the capital's screen point and whether
// the map shows there (the top element is the canvas, not a panel), and its distance from the view's centre. Then nations
// with no capital known, if any (hud.onGoToNation directly). Desk or phone (W H).
// Usage: [BASE=...] [TAG=] node critic/scripts/c81_goto2.mjs <seed> <W> <H> [days] [TAGS comma list]
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, CELLS, hours } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 69931), W = Number(process.argv[3] ?? 1600), H = Number(process.argv[4] ?? 900);
const days = Number(process.argv[5] ?? 0);
const TAGS = (process.argv[6] ?? 'GER,JAP,ENG').split(',');
const TAG = process.env.TAG ?? '';
const L = `c81g2_${seed}_${W}x${H}_d${days}${TAG}`;
const phone = W < 600 || H < 500;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: phone, isMobile: W < 600 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`${m.type()}: ${m.text()}`.slice(0, 300)); });
const out = { seed, W, H, days, base: BASE, cases: [] };
const where = (id) => page.evaluate((id) => {
  const v = window.__warsim.view, cap = v.capitalOf ? v.capitalOf(id) : null, c = v.controller.cam;
  const el = v.canvas ?? document.querySelector('canvas');
  const at = el.getBoundingClientRect();
  let sp = null, top = null;
  if (cap) {
    // screen point of the capital: the camera maps cells to px about the view's centre
    const px = (cap[0] - c.cx) * c.scale + el.clientWidth / 2 + at.left, py = (cap[1] - c.cy) * c.scale + el.clientHeight / 2 + at.top;
    sp = [Math.round(px), Math.round(py)];
    const t = px >= 0 && py >= 0 && px < innerWidth && py < innerHeight ? document.elementFromPoint(px, py) : null;
    top = t ? (t === el ? 'map' : (t.closest('[data-testid]')?.getAttribute('data-testid') ?? t.tagName)) : 'off screen';
  }
  return { cap, cam: [+c.cx.toFixed(1), +c.cy.toFixed(1), +c.scale.toFixed(3)], capPx: sp, capTop: top, selected: window.__warsim.hud.selected.value, panel: document.querySelector('[data-testid=nation-panel]') ? 1 : 0 };
}, id);
try {
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  if (days > 0) await hours(page, 24 * days);
  for (const tg of TAGS) {
    const id = CELLS.tags[tg];
    for (let k = 0; k < 3; k++) {
      await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), id);
      await page.waitForTimeout(400);
      const chips = page.locator('[data-testid=nation-chip]');
      const n = await chips.count();
      if (k >= n) break;
      const chip = chips.nth(k);
      const chipText = (await chip.innerText()).trim().slice(0, 30);
      await chip.scrollIntoViewIfNeeded();
      if (phone) await chip.tap(); else await chip.click();
      await page.waitForTimeout(300);
      const go = page.locator('[data-testid=nation-menu-goto]');
      if (!(await go.count())) { out.cases.push({ from: tg, chip: chipText, noGoto: true }); continue; }
      const before = await page.evaluate(() => { const c = window.__warsim.view.controller.cam; return [+c.cx.toFixed(1), +c.cy.toFixed(1), +c.scale.toFixed(3)]; });
      if (phone) await go.tap(); else await go.click();
      await page.waitForTimeout(3000);
      const sel = await page.evaluate(() => window.__warsim.hud.selected.value);
      const w = await where(sel);
      const name = await page.evaluate((s) => window.__warsim.hud.stats.value?.nations?.find?.((x) => x.id === s)?.name ?? null, sel).catch(() => null);
      const c = { from: tg, chip: chipText, sel, name, before, ...w, moved: Math.hypot(w.cam[0] - before[0], w.cam[1] - before[1]) > 1 };
      c.shot = `critic/shots/${L}_${tg}_${k}.png`;
      await page.screenshot({ path: path.join(SHOTS, `${L}_${tg}_${k}.png`) });
      out.cases.push(c);
      console.log(JSON.stringify(c));
    }
  }
  // Nations alive with no capital known.
  out.noCapital = await page.evaluate(() => {
    const v = window.__warsim.view; const ns = window.__warsim.hud.stats.value.nations ?? [];
    return ns.filter((n) => (n.cells ?? n.area ?? 1) > 0 && !v.capitalOf(n.id)).map((n) => [n.id, n.name]).slice(0, 10);
  }).catch((e) => String(e).slice(0, 200));
  console.log('noCapital', JSON.stringify(out.noCapital));
} catch (e) {
  out.failed = String(e).slice(0, 300);
  console.log('FAILED', out.failed);
}
const cs = out.cases.filter((c) => !c.noGoto);
out.summary = { cases: cs.length, moved: cs.filter((c) => c.moved).length, capOnMap: cs.filter((c) => c.capTop === 'map').length, capCovered: cs.filter((c) => c.capTop !== 'map').map((c) => `${c.chip}:${c.capTop}`) };
out.errors = errors;
console.log('summary', JSON.stringify(out.summary), 'errors', errors.length);
save(`${L}.json`, out);
await browser.close();
