// Critic run 34 (copy of run 33) (R16a, new): an older build's save (before nation traits, save format 1) loaded on HEAD: which traits
// the great powers show after the load (the scenario's, or none), the God tab's boxes for Germany, and a 200-hour run
// after the load (no page error). Also HEAD's own fresh start of the same seed for comparison.
// Usage: node critic/scripts/c36_ot_oldtraits.mjs <seed> <save.bin> <tag>
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { launch, open1938, shot, save, hours, CELLS } from './c31_lib.mjs';
const [seedS, bin, tag] = process.argv.slice(2);
const out = { seed: Number(seedS), bin, fresh: {}, loaded: {} };
const { browser, page, errors } = await launch();
const chips = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=trait-chip]')].map((c) => c.dataset.trait));
const read = async (o) => { for (const T of ['GER', 'ENG', 'FRA', 'ITA', 'JAP', 'SOV', 'USA', 'SWI']) { await page.evaluate((n) => window.__warsim.view.select(n), CELLS.tags[T]); await page.waitForTimeout(400); o[T] = await chips(); } };
try {
  const bytes = readFileSync(path.resolve(bin));
  await page.route('**/__critic_ck.bin', (r) => r.fulfill({ status: 200, body: bytes, contentType: 'application/octet-stream' }));
  await open1938(page, Number(seedS));
  await read(out.fresh);
  out.loadResult = await page.evaluate(async () => { try { await window.__warsim.sim.load(new Uint8Array(await (await fetch('/__critic_ck.bin')).arrayBuffer())); return 'ok'; } catch (e) { return String(e); } });
  await page.waitForTimeout(2500);
  out.date = await page.evaluate(() => document.querySelector('[data-testid=hud-date], .hud-date')?.innerText ?? null);
  await read(out.loaded);
  await page.evaluate((n) => window.__warsim.view.select(n), CELLS.tags.GER); await page.waitForTimeout(400);
  out.shot = await shot(page, `c36ot_${tag}_ger.png`);
  await hours(page, 200);
  out.tick = await page.evaluate(() => window.__warsim.view.lastTick);
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 600); }
out.errors = errors;
save(`c36_ot_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify(out).slice(0, 2500));
