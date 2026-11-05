// Critic run 27 (new), RV: a puppet's revolt where the player reads it (PLAN 7.191 / 7.192: the rebel leaves its
// overlord's wars and rises; PuppetRevolt and WarLeft are ticker kinds). Seed <seed>, day <day>, watching (not playing)
// or playing <PUP>: God sets its autonomy 60 and loyalty 0; run until the month start passes; the ticker's rows (all of
// them, after a settle), a shot with no panel open, the History panel's text, and the rebel's panel.
// Usage: node critic/scripts/c34_rv.mjs <seed> <day> <PUP> <play 0|1> [port] [tag]
import { launch, shot, save, hours } from './c31_lib.mjs';
import { CELLS } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 7019), day = Number(process.argv[3] ?? 30), PT = process.argv[4] ?? 'MAN', play = process.argv[5] === '1';
const port = Number(process.argv[6] ?? 5299), tg = process.argv[7] ?? 'head';
const BASE = `http://127.0.0.1:${port}`;
const P = CELLS.tags[PT];
const out = { seed, day, PT, play, port, tg };
const { browser, page, errors } = await launch(1600, 900);
try {
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 120_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null && window.__warsim.sim.mapLayers !== null, null, { timeout: 120_000 });
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  await hours(page, day * 24);
  if (play) {
    await page.evaluate((n) => window.__warsim.view.select(n), P);
    await page.waitForTimeout(300);
    await page.getByTestId('take-control').click();
    await page.waitForTimeout(300);
    await page.evaluate(() => window.__warsim.view.select(0));
  }
  await page.evaluate(([p]) => { window.__warsim.sim.command({ kind: 'setAutonomy', subject: p, value: 60 }); window.__warsim.sim.command({ kind: 'setPuppetLoyalty', subject: p, value: 0 }); }, [P]);
  await hours(page, 30);
  await page.waitForTimeout(1500);
  out.ticker = await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker] > *')].map((e) => e.innerText.replace(/\n/g, ' ')));
  out.tickerShot = await shot(page, `c34rv_${tg}_${seed}_${PT}_${play ? 'play' : 'watch'}_ticker.png`);
  const hb = page.getByRole('button', { name: 'History' });
  if (await hb.count()) {
    await hb.first().click();
    await page.waitForTimeout(800);
    out.history = await page.evaluate(() => { const d = document.querySelector('[data-testid=history], .history, [role=dialog]'); return (d?.innerText ?? '').split('\n').filter((l) => /Manchukuo|Albania|revolt|rose|left its war/i.test(l)).slice(0, 20); });
    out.historyShot = await shot(page, `c34rv_${tg}_${seed}_${PT}_${play ? 'play' : 'watch'}_history.png`);
    await page.keyboard.press('Escape');
  }
  out.wars = await page.evaluate(async (p) => (await window.__warsim.sim.inspect()).wars.filter((w) => w.attackers.includes(p) || w.defenders.includes(p)).map((w) => [w.attackers, w.defenders]), P);
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors.slice(0, 20);
save(`c34_rv_${tg}_${seed}_${PT}_${play ? 'play' : 'watch'}.json`, out);
await browser.close();
console.log('done:', JSON.stringify({ fatal: out.fatal, ticker: out.ticker, history: out.history, wars: out.wars }));
