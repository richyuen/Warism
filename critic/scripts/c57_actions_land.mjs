// Critic run 57 (new): the Actions tab on a phone on its side for a nation with many air groups (R55j / ADR-902): which
// controls are off the screen or cut by the panel, can the panel scroll to each, and a shot at top and bottom.
// Usage: node critic/scripts/c57_actions_land.mjs <seed> <TAG> [W H]
import { launch, open1938, shot, save, CELLS } from './c57_lib.mjs';
const [seedS, TAG, wS, hS] = process.argv.slice(2);
const seed = Number(seedS), W = Number(wS ?? 844), H = Number(hS ?? 390);
const out = { seed, TAG, W, H };
const { browser, page, errors } = await launch(W, H);
const probe = () => page.evaluate(() => {
  const panel = document.querySelector('[data-testid=nation-panel]');
  const box = panel.getBoundingClientRect();
  const ctl = [...panel.querySelectorAll('button, select, input')].filter((b) => b.offsetParent !== null);
  const off = ctl.filter((b) => { const r = b.getBoundingClientRect(); return r.bottom > innerHeight + 1 || r.right > innerWidth + 1; }).map((b) => (b.innerText || b.title || b.tagName).trim().slice(0, 30));
  const cut = ctl.filter((b) => { const r = b.getBoundingClientRect(); return r.bottom > box.bottom + 1 || r.top < box.top - 1; }).length;
  const sc = [...panel.querySelectorAll('*')].filter((e) => e.scrollHeight > e.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(e).overflowY)).map((e) => [e.className, e.scrollHeight, e.clientHeight]);
  return { box: [box.left, box.top, box.right, box.bottom].map(Math.round), controls: ctl.length, off, cutByPanel: cut, scrollers: sc };
});
try {
  await open1938(page, seed);
  await page.evaluate((n) => window.__warsim.view.select(n), CELLS.tags[TAG]);
  await page.getByTestId('take-control').click();
  await page.getByTestId('tab-actions').click();
  await page.waitForTimeout(500);
  out.top = await probe();
  await shot(page, `c57al_${TAG}_${W}x${H}_top.png`);
  await page.evaluate(() => { for (const e of document.querySelectorAll('[data-testid=nation-panel] *')) if (e.scrollHeight > e.clientHeight + 4) e.scrollTop = e.scrollHeight; });
  await page.waitForTimeout(300);
  out.bottom = await probe();
  await shot(page, `c57al_${TAG}_${W}x${H}_bottom.png`);
} catch (e) { out.fail = String(e?.stack ?? e).slice(0, 500); }
out.errors = errors;
save(`c57_al_${TAG}_${W}x${H}.json`, out);
await browser.close();
console.log(JSON.stringify(out));
