// Critic run 28 (new), AN: an AI's nuclear strike as the player meets it in the page. Load a late save (the nuclear
// age), keep the default "pause on a strike" on, run at Max until the game pauses on a strike (or `maxDays`), then:
// the alert's text, a shot as it is, "Go to" pressed and a shot, then a zoom series over the burst (12000 .. 120
// m/px), then two more days run and the burst's aftermath shot (fallout). Up to `n` strikes.
// Usage: node critic/scripts/c61_an_ainuke.mjs <seed> <save.bin> <tag> [n] [maxDays]
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { launch, open1938, save, shot, lookAt, settle } from './c61_lib.mjs';
const [seedS, bin, tag] = process.argv.slice(2);
const n = Number(process.argv[5] ?? 2), maxDays = Number(process.argv[6] ?? 400);
const out = { seed: Number(seedS), bin, strikes: [] };
const { browser, page, errors } = await launch(1600, 900);
const L = `c61an_${tag}`;
try {
  const bytes = readFileSync(path.resolve(bin));
  await page.route('**/__critic_ck.bin', (r) => r.fulfill({ status: 200, body: bytes, contentType: 'application/octet-stream' }));
  await open1938(page, Number(seedS));
  await page.evaluate(async () => window.__warsim.sim.load(new Uint8Array(await (await fetch('/__critic_ck.bin')).arrayBuffer())));
  await page.waitForTimeout(3000);
  out.nukePause = await page.evaluate(() => window.__warsim.settings.nukePause.value);
  out.startDate = await page.evaluate(() => document.querySelector('[data-testid=bottombar]')?.innerText.match(/\d+ \w+ \d{4}/)?.[0] ?? null);
  await page.evaluate(() => window.__warsim.hud.setSpeedLevel(99));
  const tk0 = await page.evaluate(() => window.__warsim.hud.tick.value);
  for (let k = 0; k < n; k++) {
    await page.evaluate(() => { if (window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
    const got = await page.waitForFunction((lim) => {
      const w = window.__warsim; const a = document.querySelectorAll('[data-testid=nuke-alert]').length;
      return (w.hud.paused.value && a > 0) || w.hud.tick.value > lim ? { a, tick: w.hud.tick.value } : false;
    }, tk0 + maxDays * 24, { timeout: 1_200_000, polling: 100 }).then((h) => h.jsonValue()).catch((e) => ({ err: String(e) }));
    if (!got.a) { out.end = got; break; }
    const row = { got };
    row.date = await page.evaluate(() => document.querySelector('[data-testid=bottombar]')?.innerText.match(/\d+ \w+ \d{4}/)?.[0] ?? null);
    row.paused = await page.evaluate(() => window.__warsim.hud.paused.value);
    row.alerts = await page.evaluate(() => [...document.querySelectorAll('[data-testid=nuke-alert]')].map((e) => e.innerText.replace(/\n/g, ' | ')));
    row.ticker = await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker] > *')].map((e) => e.innerText.replace(/\n/g, ' ')).slice(-4));
    row.shotAlert = await shot(page, `${L}_${k}_alert.png`);
    const go = page.getByTestId('nuke-goto').last();
    if (await go.count()) { await go.click(); await page.waitForTimeout(1500); await settle(page); }
    row.cam = await page.evaluate(() => { const c = window.__warsim.view.controller.cam; return { cx: c.cx, cy: c.cy, mpp: window.__warsim.view.metresPerPx }; });
    row.shotGoto = await shot(page, `${L}_${k}_goto.png`);
    for (const m of [12000, 3000, 600, 120]) {
      await lookAt(page, row.cam.cx, row.cam.cy, m);
      await page.waitForTimeout(500);
      await shot(page, `${L}_${k}_z${String(m).padStart(5, '0')}.png`);
    }
    await lookAt(page, row.cam.cx, row.cam.cy, 3000);
    const close = page.getByTestId('nuke-close');
    while (await close.count()) { await close.first().click(); await page.waitForTimeout(200); }
    await page.evaluate(async () => { const w = window.__warsim; await w.sim.step(48); });
    await page.waitForTimeout(1500); await settle(page);
    row.shotAfter = await shot(page, `${L}_${k}_after48h.png`);
    out.strikes.push(row);
    save(`c61_an_${tag}.json`, { ...out, errors });
    console.log(k, row.date, row.alerts.join(' // '));
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c61_an_${tag}.json`, out);
await browser.close();
console.log(out.fatal ?? 'ok', errors.slice(0, 5));
