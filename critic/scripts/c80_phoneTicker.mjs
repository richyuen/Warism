// Critic run 77 (new): R156's phone ticker over the opened banners. Plain 1938 SEED (heroes on) stepped DAYS at 390 x 844;
// the game run 10 s at x5 for news; the banners' "+n" opened. Read: the ticker's rows' rects, the banners' rect, the top
// bar's and bottom bar's rects; whether each ticker row is on the screen, clear of the banners, of the bars and of each
// other; a shot. Then the banners closed: the same.
// Usage: [BASE=...] node critic/scripts/c80_phoneTicker.mjs <seed> <days> [W H]
import { launch, open1938, shot, save, hours, run, pause } from './c80_lib.mjs';
const seed = Number(process.argv[2] ?? 62903), DAYS = Number(process.argv[3] ?? 200), W = Number(process.argv[4] ?? 390), H = Number(process.argv[5] ?? 844);
const out = { seed, DAYS, W, H };
const { browser, page, errors } = await launch(W, H);
const P = `c80pt_${seed}_${W}x${H}`;
const rects = () => page.evaluate(() => {
  const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), shown: cs.display !== 'none' && cs.visibility !== 'hidden' && b.height > 0 }; };
  const ticker = document.querySelector('.ticker');
  const rows = ticker ? [...ticker.children].map((c) => ({ ...r(c), text: c.innerText.replace(/\s+/g, ' ').slice(0, 60) })) : [];
  const ban = document.querySelector('[data-testid=war-banners]');
  const tops = [...document.querySelectorAll('.top-bar, .bar-top, [data-testid=top-bar], header')].map(r);
  const bottom = document.querySelector('.bottom-bar, [data-testid=bottom-bar], nav');
  // What is drawn at each ticker row's middle (the topmost element).
  const atMid = rows.map((row) => { const e = document.elementFromPoint(row.x + row.w / 2, row.y + row.h / 2); return e ? (e.closest('.ticker') ? 'ticker' : (e.getAttribute('data-testid') ?? e.className ?? e.tagName)) : 'off'; });
  return { ticker: r(ticker), tickerClass: ticker?.className ?? null, rows, atMid, banners: r(ban), bannersOpened: ban?.classList.contains('opened') ?? null, tops, bottom: r(bottom), vh: innerHeight, vw: innerWidth };
});
try {
  await open1938(page, seed, '&heroes=on');
  await hours(page, DAYS * 24);
  await run(page);
  await page.waitForTimeout(10_000);
  await pause(page);
  await page.waitForTimeout(500);
  out.closed = await rects();
  out.shotClosed = await shot(page, `${P}_closed.png`);
  const more = page.locator('[data-testid=war-more]');
  out.moreCount = await more.count();
  if (out.moreCount) {
    await more.first().click();
    await page.waitForTimeout(800);
    out.opened = await rects();
    out.shotOpened = await shot(page, `${P}_opened.png`);
  }
} catch (e) {
  out.error = String(e).slice(0, 400);
  await shot(page, `${P}_error.png`).catch(() => {});
}
out.errors = errors;
save(`${P}.json`, out);
console.log(JSON.stringify(out, null, 1));
await browser.close();
