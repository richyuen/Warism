// Critic run 81 (new): can the war row's "+n" be clicked at a desk size, and does the row lie over the ticker's rows?
// 1938 seed after <days> days at W x H: Playwright's click on "+n" (it refuses when another element takes the click),
// then the ticker rows' rects against the banners'. Usage: [BASE=...] [TAG=] node critic/scripts/c81_moreClick.mjs <seed> <days> <W> <H>
import { launch, open1938, hours, save, shot } from './c81_lib.mjs';
const [seed, days, W, H] = process.argv.slice(2).map(Number);
const TAG = process.env.TAG ?? '';
const { browser, page, errors } = await launch(W, H);
const out = { seed, days, W, H };
await open1938(page, seed);
if (days) await hours(page, 24 * days);
await page.waitForTimeout(800);
out.overTicker = await page.evaluate(() => {
  const ov = (a, b) => { const x = Math.min(a.right, b.right) - Math.max(a.left, b.left), y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); return x > 1 && y > 1 ? [Math.round(x), Math.round(y)] : null; };
  const res = [];
  for (const t of document.querySelectorAll('.ticker *')) { if (t.children.length) continue; const tr = t.getBoundingClientRect(); if (!tr.width) continue;
    for (const b of document.querySelectorAll('[data-testid=war-banner], [data-testid=war-more]')) { const o = ov(tr, b.getBoundingClientRect()); if (o) res.push({ ticker: t.textContent.trim().slice(0, 40), banner: b.textContent.trim().slice(0, 30), o }); } }
  return res;
});
try { await page.locator('[data-testid=war-more]').click({ timeout: 3000 }); out.moreClicked = true; } catch (e) { out.moreClicked = false; out.why = String(e).split('\n').filter((l) => /intercept|from/.test(l)).slice(0, 2).join(' | ').slice(0, 300); }
await page.waitForTimeout(400);
out.opened = await page.evaluate(() => !!document.querySelector('.war-banners.opened'));
out.shot = await shot(page, `c81mc_${seed}_d${days}_${W}x${H}${TAG}.png`);
out.errors = errors;
console.log(JSON.stringify(out, null, 1));
save(`c81_mc_${seed}_${days}_${W}x${H}${TAG}.json`, out);
await browser.close();
