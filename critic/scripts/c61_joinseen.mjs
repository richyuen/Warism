// Critic run 55 (new): played as TAG, step to DAY, then 6 hours at a time over 2 days: the ticker's rows, the war chips
// and any alert, to see how the player learns its nation joined a war (26309: France joins Germany–Poland on day 350).
// Usage: node critic/scripts/c61_joinseen.mjs <seed> <TAG> <day>
import { launch, open1938, save, hours, CELLS, shot } from './c61_lib.mjs';
const [seedS, TAG, dayS] = process.argv.slice(2);
const out = { seed: Number(seedS), TAG, samples: [] };
const { browser, page, errors } = await launch(1600, 900);
try {
  await open1938(page, Number(seedS));
  await page.evaluate((g) => window.__warsim.hud.command({ kind: 'setPlayer', nation: g }), CELLS.tags[TAG]);
  const day = Number(dayS);
  for (let d = 0; d < day - 1; d += 30) await hours(page, 24 * Math.min(30, day - 1 - d));
  for (let k = 0; k < 10; k++) {
    await hours(page, 6);
    const s = await page.evaluate(() => ({
      tick: window.__warsim.view.lastTick,
      ticker: [...document.querySelectorAll('[data-testid=ticker-row]')].slice(0, 8).map((r) => r.innerText.replace(/\s+/g, ' ')),
      chips: [...document.querySelectorAll('[data-testid^=war-chip]')].map((r) => r.innerText.replace(/\s+/g, ' ')).slice(0, 8),
      dialogs: [...document.querySelectorAll('[role=dialog], [role=alert], [data-testid*=alert]')].map((r) => r.innerText.replace(/\s+/g, ' ').slice(0, 200)),
    }));
    out.samples.push(s);
    if (k === 2 || k === 6) await shot(page, `c61js_${seedS}_${TAG}_${k}.png`);
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c61_joinseen_${seedS}_${TAG}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 6000));
