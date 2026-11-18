// Critic run 77 (new): R156's track rows on the page. The replay's start of YEAR (1938h, mode replay), DAYS days stepped;
// History opened; every row of the historical track (data-kind of TrackEvent, or a row whose text matches the timeline's
// notes) read as the player reads it; shots of History scrolled to rows named in ROWS (comma list of substrings).
// Usage: [BASE=...] node critic/scripts/c77_trackRows.mjs <year> <days> [W H]
import { launch, shot, save, hours, BASE } from './c77_lib.mjs';
const YEAR = Number(process.argv[2] ?? 1941), DAYS = Number(process.argv[3] ?? 365), W = Number(process.argv[4] ?? 1600), H = Number(process.argv[5] ?? 900);
const out = { YEAR, DAYS, W, H };
const { browser, page, errors } = await launch(W, H);
const P = `c77tr_${YEAR}_${W}x${H}`;
try {
  await page.goto(`${BASE}/?scenario=1938h&seed=1938&paused=1&year=${YEAR}&mode=replay`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null && !document.querySelector('[data-testid=world-building]'), null, { timeout: 180_000 });
  await page.waitForTimeout(1500);
  for (let d = 0; d < DAYS; d += 30) await hours(page, 24 * Math.min(30, DAYS - d));
  await page.evaluate(() => { if (!window.__warsim.hud.showHistory.value) window.__warsim.hud.toggleHistory(); });
  await page.waitForTimeout(1500);
  out.count = await page.evaluate(() => document.querySelector('.history-panel')?.querySelector('[class*=count], .history-count')?.textContent ?? null);
  out.kinds = await page.evaluate(() => [...new Set([...document.querySelectorAll('[data-testid=history-row]')].map((r) => r.getAttribute('data-kind-name')))]);
  out.trackRows = await page.evaluate(() => [...document.querySelectorAll('[data-testid=history-row]')].filter((r) => /Track/i.test(r.getAttribute('data-kind-name') ?? '')).map((r) => r.innerText.replace(/\s+/g, ' ').trim()));
  out.allRows = await page.evaluate(() => [...document.querySelectorAll('[data-testid=history-row]')].length);
  out.shotTop = await shot(page, `${P}_history.png`);
  // Scroll to each row of interest and shoot it.
  const want = (process.env.ROWS ?? 'occupies The line,retaken,joins the alliance,occupies The,Bulgaria').split(',');
  out.found = {};
  for (const w of want) {
    const ok = await page.evaluate((w) => { const r = [...document.querySelectorAll('[data-testid=history-row]')].find((e) => e.innerText.includes(w)); if (!r) return null; r.scrollIntoView({ block: 'center' }); r.style.outline = '2px solid #ff0'; return r.innerText.replace(/\s+/g, ' ').trim(); }, w);
    out.found[w] = ok;
    if (ok) { await page.waitForTimeout(300); out.found[`${w}#shot`] = await shot(page, `${P}_${w.replace(/[^a-z]/gi, '')}.png`); }
  }
} catch (e) {
  out.error = String(e).slice(0, 400);
  await shot(page, `${P}_error.png`).catch(() => {});
}
out.errors = errors;
save(`${P}.json`, out);
console.log(JSON.stringify(out, null, 1));
await browser.close();
