// Critic run 55 (new): play TAG for DAYS, then dump History's rows (as shown, all kinds) that match a word, and the
// rows "My wars only" keeps, to see which of the played nation's war rows the filter leaves out.
// Usage: node critic/scripts/c61_histgrep.mjs <seed> <TAG> <days> <word>
import { launch, open1938, save, hours, CELLS, shot } from './c61_lib.mjs';
const [seedS, TAG, daysS, word] = process.argv.slice(2);
const seed = Number(seedS), days = Number(daysS);
const out = { seed, TAG, days, word };
const { browser, page, errors } = await launch(1600, 900);
try {
  await open1938(page, seed);
  await page.evaluate((g) => window.__warsim.hud.command({ kind: 'setPlayer', nation: g }), CELLS.tags[TAG]);
  for (let d = 0; d < days; d += 30) await hours(page, 24 * Math.min(30, days - d));
  out.atWarWith = await page.evaluate(() => document.querySelector('[data-testid=war-chips]')?.innerText ?? null);
  await page.getByTestId('history-btn').click();
  await page.waitForSelector('[data-testid=history-row]', { timeout: 60_000 });
  const rows = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=history-row]')].map((r) => `${r.getAttribute('data-kind')} ${r.innerText.replace(/\s+/g, ' ')}`));
  const all = await rows();
  const re = new RegExp(word, 'i');
  out.allMatching = all.filter((r) => re.test(r));
  await page.getByTestId('history-mine').check();
  await page.waitForTimeout(800);
  const mine = await rows();
  out.mine = mine;
  out.leftOut = out.allMatching.filter((r) => !mine.includes(r));
  await shot(page, `c61hg_${seed}_${TAG}_mine.png`);
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c61_histgrep_${seed}_${TAG}.json`, out);
await browser.close();
console.log(`matching ${out.allMatching?.length} mine ${out.mine?.length} leftOut ${out.leftOut?.length}`);
console.log((out.leftOut ?? []).slice(0, 60).join('\n'));
