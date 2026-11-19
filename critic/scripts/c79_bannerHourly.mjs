// Critic run 78 (new): R161's swap of a still war for one in battle, hour by hour. Plain 1938 SEED (heroes on), run to
// FROM days, then HOURS hours one at a time: the row's set each hour. Counted: hours the set changed, and flip-backs (a set
// that returns to the one of two or three hours before: a banner that came and went within three hours).
// Usage: [BASE=...] node critic/scripts/c79_bannerHourly.mjs <seed> <fromDay> <hours> [W H]
import { launch, open1938, save, hours, shot } from './c79_lib.mjs';
const seed = Number(process.argv[2] ?? 57901), FROM = Number(process.argv[3] ?? 100), HOURS = Number(process.argv[4] ?? 480);
const W = Number(process.argv[5] ?? 1600), H = Number(process.argv[6] ?? 900);
const out = { seed, FROM, HOURS, rows: [] };
const { browser, page, errors } = await launch(W, H);
const read = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=war-banner]')].map((b) => `${b.getAttribute('data-war')}${b.getAttribute('data-battle') === '1' ? '*' : ''}`));
try {
  await open1938(page, seed, '&heroes=on');
  await hours(page, FROM * 24);
  await page.waitForTimeout(400);
  let changes = 0, flipBacks = 0;
  const sets = [];
  for (let h = 0; h < HOURS; h++) {
    await hours(page, 1);
    await page.waitForTimeout(60);
    const r = await read();
    const set = r.map((x) => x.replace('*', '')).sort().join(',');
    if (sets.length && set !== sets[sets.length - 1]) {
      changes++;
      if ((sets.length >= 2 && set === sets[sets.length - 2]) || (sets.length >= 3 && set === sets[sets.length - 3])) {
        flipBacks++;
        if (flipBacks <= 5) await shot(page, `c79bh_${seed}_${FROM}_flip${flipBacks}.png`);
      }
    }
    sets.push(set);
    out.rows.push(r.join(' '));
  }
  out.sum = { changes, flipBacks };
  console.log(`seed ${seed} from day ${FROM}, ${HOURS} hours: set changed ${changes} times, ${flipBacks} of them back to a set of 1-3 hours before`);
} catch (e) {
  out.error = String(e?.stack ?? e).slice(0, 1200);
  console.log('ERROR', out.error);
}
out.errors = errors;
console.log(`page errors ${errors.length}`);
save(`c79_bh_${seed}_${FROM}.json`, out);
await browser.close();
