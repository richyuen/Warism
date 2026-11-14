// Critic run 62 (new): the "Next, <date>: <event>" line around an event's day: does it name an event already past?
// 1938h stepped to day D0 (from 1 January 1938), then 6-hour steps for N hours: the date label, the line, the ticker.
// Usage: node critic/scripts/c68_h_next.mjs <D0> <hours> <label>   (Italy invades Greece, 28 October 1940: D0 1030)
import { launch, save, shot, BASE } from './c68_lib.mjs';
const D0 = Number(process.argv[2] ?? 1030), N = Number(process.argv[3] ?? 96), label = process.argv[4] ?? 'greece';
const out = { D0, rows: [] };
const { browser, page, errors } = await launch(1600, 900);
const stepH = (n) => page.evaluate(async (n) => {
  const w = window.__warsim; const target = w.view.lastTick + n; await w.sim.step(n);
  const t0 = performance.now();
  await new Promise((done) => { const f = () => (w.view.lastTick >= target || performance.now() - t0 > 600000 ? done() : setTimeout(f, 20)); f(); });
}, n);
try {
  await page.goto(`${BASE}/?scenario=1938h&paused=1`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  await stepH(24 * D0);
  for (let h = 0; h <= N; h += 6) {
    if (h > 0) await stepH(6);
    await page.waitForTimeout(300);
    out.rows.push(await page.evaluate(() => ({
      tick: window.__warsim.view.lastTick,
      date: document.querySelector('[data-testid=date-label]')?.innerText.replace(/\n/g, ' | ') ?? null,
      ticker: [...document.querySelectorAll('[data-testid=ticker] > *')].map((e) => e.innerText.replace(/\n/g, ' ')).slice(-3).join(' // '),
    })));
    console.log(JSON.stringify(out.rows.at(-1)));
  }
  out.shot = await shot(page, `c68hn_${label}.png`);
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c68_hn_${label}.json`, out);
await browser.close();
