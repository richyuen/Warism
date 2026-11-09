// Critic run 57 (new): on a phone on its side, Germany's Actions tab: which air groups' names are visible inside the
// panel, before and after wheeling and swiping over it (can the player reach group N at all?). Shots each step.
// Usage: node critic/scripts/c57_actions_wheel.mjs <seed> <TAG> [W H]
import { launch, open1938, shot, save, CELLS } from './c57_lib.mjs';
const [seedS, TAG, wS, hS] = process.argv.slice(2);
const seed = Number(seedS), W = Number(wS ?? 844), H = Number(hS ?? 390);
const out = { seed, TAG, W, H, steps: [] };
const { browser, page, errors } = await launch(W, H);
const seen = () => page.evaluate(() => {
  const panel = document.querySelector('[data-testid=nation-panel]');
  const box = panel.getBoundingClientRect();
  const rows = [...panel.querySelectorAll('[data-testid^=act-wing-]')];
  const vis = rows.filter((r) => { const b = r.getBoundingClientRect(); return b.top >= box.top - 1 && b.bottom <= Math.min(box.bottom, innerHeight) + 1 && b.left >= box.left - 1 && b.right <= box.right + 1; });
  const tab = panel.querySelector('[data-testid=panel-actions]');
  const tb = tab?.getBoundingClientRect();
  const cs = tab ? getComputedStyle(tab) : null;
  const chain = [];
  for (let e = tab; e && e !== document.body; e = e.parentElement) { const s = getComputedStyle(e); chain.push([e.className, s.overflowY, s.overflowX, e.scrollHeight, e.clientHeight, e.scrollWidth, e.clientWidth, e.scrollTop]); }
  return { wings: rows.length, visible: vis.length, visNames: vis.map((r) => r.textContent.slice(0, 26)), tab: tb ? [tb.left, tb.top, tb.right, tb.bottom].map(Math.round) : null, columns: cs?.columnCount, height: cs?.height, chain };
});
try {
  await open1938(page, seed);
  await page.evaluate((n) => window.__warsim.view.select(n), CELLS.tags[TAG]);
  await page.getByTestId('take-control').click();
  await page.getByTestId('tab-actions').click();
  await page.waitForTimeout(500);
  out.steps.push({ step: 'open', ...(await seen()) });
  const box = await page.getByTestId('nation-panel').boundingBox();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.7);
  for (let i = 0; i < 6; i++) await page.mouse.wheel(0, 400);
  await page.waitForTimeout(400);
  out.steps.push({ step: 'wheel down x6', ...(await seen()) });
  await shot(page, `c57aw_${TAG}_${W}x${H}_wheel.png`);
  for (let i = 0; i < 6; i++) await page.mouse.wheel(400, 0);
  await page.waitForTimeout(400);
  out.steps.push({ step: 'wheel right x6', ...(await seen()) });
  await shot(page, `c57aw_${TAG}_${W}x${H}_wheelx.png`);
} catch (e) { out.fail = String(e?.stack ?? e).slice(0, 500); }
out.errors = errors;
save(`c57_aw_${TAG}_${W}x${H}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 5000));
