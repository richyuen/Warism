// Critic run 90 (new): the peace line on the page around a war's start (R216, ADR-1145): a random world of N nations,
// SEED, stepped to day D0 in one message; the line opened and shot; then a day a message to D1: the line's text, its
// opened rows, the war row's banners; shots at D0, the last day with reasons, and D1.
// Usage: [BASE=...] node critic/scripts/c90_peaceWeek.mjs <seed> <nations> <d0> <d1> [WxH=2560x1305]
import { launch, save, shot } from './c85_lib.mjs';
const [seedS, nS, d0S, d1S, wh = '2560x1305'] = process.argv.slice(2);
const [W, H] = wh.split('x').map(Number);
const { browser, page, errors } = await launch(W, H);
const out = { seed: +seedS, days: [] };
const read = () => page.evaluate(() => ({
  date: document.querySelector('[data-testid=bottombar]')?.innerText.match(/\d+ \w+ \d{4}/)?.[0] ?? null,
  line: document.querySelector('[data-testid=war-peace]')?.innerText.replace(/\n/g, ' ') ?? null,
  rows: [...(document.querySelector('[data-testid=war-peace-rows]')?.children ?? [])].map((c) => c.innerText.replace(/\n/g, ' ')),
  banners: [...document.querySelectorAll('[data-testid=war-banner]')].map((b) => b.innerText.replace(/\n/g, ' ')),
  news: [...document.querySelectorAll('[data-testid=ticker] > *')].map((e) => e.innerText.replace(/\n/g, ' ')).slice(-3),
}));
try {
  await page.goto(`${process.env.BASE}/?scenario=random&paused=1&seed=${seedS}&nations=${nS}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120000 });
  const stepTo = async (d) => {
    await page.evaluate(async (t) => { const w = window.__warsim; const n = t - w.hud.stats.value.tick; if (n > 0) await w.sim.step(n); }, d * 24);
    await page.waitForFunction((t) => window.__warsim.hud.stats.value?.tick >= t, d * 24, { timeout: 300000 });
    await page.waitForTimeout(300);
  };
  let lastWhy = null;
  for (let d = +d0S; d <= +d1S; d++) {
    await stepTo(d);
    if (await page.getByTestId('war-peace').count() && (await page.getByTestId('war-peace').getAttribute('aria-expanded')) !== 'true') { await page.getByTestId('war-peace').click(); await page.waitForTimeout(300); }
    const r = await read(); r.day = d; out.days.push(r); console.log(JSON.stringify(r));
    if (d === +d0S) r.shot = await shot(page, `c90pw_${seedS}_d${d}.png`);
    if (r.rows.length > 1) lastWhy = d;
    if (d === +d1S) r.shot = await shot(page, `c90pw_${seedS}_d${d}.png`);
  }
  out.lastWhy = lastWhy;
} catch (e) { out.fail = String(e).slice(0, 300); }
finally { out.errors = errors; save(`c90_pw_${seedS}.json`, out); await browser.close(); console.log(JSON.stringify({ lastWhy: out.lastWhy, errors, fail: out.fail })); }
