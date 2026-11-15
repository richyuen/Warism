// Critic run 72 (new): a replay save of the last build (df93b4c2's timeline, critic/c71_starts/<year>.sav, gzip) loaded in
// HEAD's page, as a player's Continue of yesterday's replay would be: what does the player read as the track ends at
// once (the Next line, the ticker, History's last rows, any notice)? Usage: node c72_oldsavepage.mjs <year> [dir]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { launch, save, shot, BASE } from './c72_lib.mjs';
const year = Number(process.argv[2] ?? 1975);
const dir = process.argv[3] ?? 'critic/c71_starts';
const out = { year, dir };
const { browser, page, errors } = await launch(1600, 900);
try {
  const bytes = gunzipSync(readFileSync(`${dir}/${year}.sav`));
  await page.route('**/__critic_old.bin', (r) => r.fulfill({ status: 200, body: bytes, contentType: 'application/octet-stream' }));
  await page.goto(`${BASE}/?scenario=1938h&seed=1938&paused=1&year=${year}&mode=replay&after=999`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null && !document.querySelector('[data-testid=world-building]'), null, { timeout: 180_000 });
  await page.waitForTimeout(1500);
  out.nextBefore = await page.evaluate(() => document.querySelector('[data-testid=track-next]')?.innerText ?? null);
  await page.evaluate(async () => window.__warsim.sim.load(new Uint8Array(await (await fetch('/__critic_old.bin')).arrayBuffer())));
  await page.waitForTimeout(2000);
  out.nextLoaded = await page.evaluate(() => document.querySelector('[data-testid=track-next]')?.innerText ?? null);
  await page.evaluate(() => window.__warsim.sim.step(3));
  await page.waitForTimeout(2500);
  out.next3h = await page.evaluate(() => document.querySelector('[data-testid=track-next]')?.innerText ?? null);
  out.ticker = await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row]')].slice(0, 6).map((e) => e.textContent));
  out.text = await page.evaluate(() => document.body.innerText.slice(0, 1500));
  out.shot = await shot(page, `c72os_${year}_3h.png`);
  await page.getByTestId('history-btn').click();
  await page.waitForSelector('[data-testid=history-row]', { timeout: 60_000 });
  out.history = await page.evaluate(() => [...document.querySelectorAll('[data-testid=history-row]')].slice(0, 6).map((r) => r.innerText.replace(/\s+/g, ' ')));
  out.shotHistory = await shot(page, `c72os_${year}_history.png`);
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c72_os_${year}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 3000));
