// Critic run 82 (new, R180 off its case): the desk war row's "fit" (banners that fit the row's width) through things that
// change the row's width without a window resize or a change in the number of wars: a nation panel opened (the row moves
// right of it), then closed (does the row come back to all the banners that fit, or stay short?), paused and running.
// At each step: banners shown, the row's scrollWidth vs clientWidth, banners past the row's right or under another element
// (the legend, the ticker, the panel), "+n" clickable (Playwright's click, which refuses an intercepted point).
// Usage: [BASE=...] [TAG=] node critic/scripts/c82_deskFit.mjs <seed> <days> <W> <H> [nation TAG]
import { launch, open1938, hours, save, shot, CELLS } from './c81_lib.mjs';
const [seed, days, W, H] = process.argv.slice(2, 6).map(Number);
const NAT = process.argv[6] ?? 'GER';
const TAG = process.env.TAG ?? '';
const L = `c82df_${seed}_d${days}_${W}x${H}_${NAT}${TAG}`;
const { browser, page, errors } = await launch(W, H);
const out = { seed, days, W, H, nat: NAT, steps: [] };
await open1938(page, seed);
if (days) await hours(page, 24 * days);
await page.waitForTimeout(800);
const geom = () => page.evaluate(() => {
  const row = document.querySelector('[data-testid=war-banners]');
  if (!row) return { row: null };
  const rr = row.getBoundingClientRect();
  const banners = [...row.querySelectorAll('[data-testid=war-banner]')];
  const covered = [];
  for (const b of [...banners, row.querySelector('[data-testid=war-more]')].filter(Boolean)) {
    const r = b.getBoundingClientRect();
    const pts = [[r.left + 4, r.top + r.height / 2], [r.left + r.width / 2, r.top + r.height / 2], [r.right - 4, r.top + r.height / 2]];
    for (const [x, y] of pts) {
      if (x >= innerWidth) { covered.push({ b: b.textContent.trim().slice(0, 24), off: 'right of the view' }); break; }
      const top = document.elementFromPoint(x, y);
      if (top && !(top === b || b.contains(top))) { covered.push({ b: b.textContent.trim().slice(0, 24), by: (top.closest('[data-testid]')?.getAttribute('data-testid') ?? top.className?.toString() ?? top.tagName).slice(0, 40) }); break; }
    }
  }
  const more = row.querySelector('[data-testid=war-more]');
  return { wars: window.__warsim.hud.stats.value.wars.length, shown: banners.length, more: more?.textContent.trim() ?? null, rowL: Math.round(rr.left), rowR: Math.round(rr.right), scrollW: row.scrollWidth, clientW: row.clientWidth, covered, panel: !!document.querySelector('[data-testid=nation-panel]') };
});
const tryMore = async () => {
  try { await page.locator('[data-testid=war-more]').click({ timeout: 2500, trial: true }); return true; } catch (e) { return String(e).split('\n').filter((l) => /intercept/.test(l)).slice(0, 1).join('').slice(0, 160) || false; }
};
const step = async (name) => { const s = { name, ...(await geom()), moreClickable: await tryMore(), shot: await shot(page, `${L}_${name.replace(/\W+/g, '_')}.png`) }; out.steps.push(s); console.log(JSON.stringify(s)); return s; };
await step('1 paused');
await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), CELLS.tags[NAT]);
await page.waitForTimeout(800);
await step('2 panel opened paused');
await page.evaluate(() => window.__warsim.hud.onSelectNation(0));
await page.waitForTimeout(800);
await step('3 panel closed paused');
await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), CELLS.tags[NAT]);
await hours(page, 24 * 3);
await page.waitForTimeout(800);
await step('4 panel opened, 3 days run');
await page.evaluate(() => window.__warsim.hud.onSelectNation(0));
await hours(page, 24 * 3);
await page.waitForTimeout(800);
await step('5 panel closed, 3 days run');
await page.setViewportSize({ width: W + 1, height: H });
await page.waitForTimeout(300);
await page.setViewportSize({ width: W, height: H });
await page.waitForTimeout(800);
await step('6 after a resize');
out.errors = errors;
save(`${L}.json`, out);
await browser.close();
