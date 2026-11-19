// Critic run 80 (new): SPEC's banner row, "the played nation's wars, then those fought in ten days" (heldRow). Plain
// 1938 SEED (heroes on, as from the title), TAG taken by Take control at day 0, stepped to FROM days, then a day at a
// time for DAYS days: the row's banners, which name the played nation, and the slot of its first war.
// Usage: [BASE=...] node critic/scripts/c81_ownFirst.mjs <seed> <TAG> <name> <from> <days>
import { launch, open1938, hours, save, shot, CELLS } from './c81_lib.mjs';
const [seedS, TAG, NAME, fromS, daysS] = process.argv.slice(2);
const seed = Number(seedS), FROM = Number(fromS), DAYS = Number(daysS);
const out = { seed, TAG, NAME, FROM, DAYS, days: [] };
const { browser, page, errors } = await launch(1600, 900);
try {
  await open1938(page, seed, '&heroes=on');
  await page.evaluate((n) => window.__warsim.view.select(n), CELLS.tags[TAG]);
  await page.getByTestId('take-control').click();
  await page.getByTestId('release-control').waitFor({ timeout: 10000 });
  await hours(page, 24 * FROM);
  for (let d = 0; d <= DAYS; d++) {
    if (d) await hours(page, 24);
    await page.waitForTimeout(1300);
    const row = await page.evaluate(() => [...document.querySelectorAll('[data-testid=war-banner]')].map((b) => b.innerText.replace(/\s+/g, ' ') + ' {' + (b.getAttribute('title') ?? '').split(String.fromCharCode(10))[0] + '}'));
    const more = await page.evaluate(() => document.querySelector('[data-testid=war-more]')?.innerText ?? null);
    const own = row.map((r, i) => (r.includes(NAME) ? i : -1)).filter((i) => i >= 0);
    out.days.push({ day: FROM + d, row, more, ownSlots: own });
  }
  out.wars = await page.evaluate((id) => { const st = window.__warsim.hud.stats.value; const nm = (n) => st.nations.find((x) => x.id === n)?.name ?? n; return st.wars.map((w) => JSON.stringify(Object.fromEntries(Object.entries(w).filter(([k, v]) => Array.isArray(v)).map(([k, v]) => [k, v.map(nm)])))).slice(0, 8); }, CELLS.tags[TAG]);
  out.shot = await shot(page, `c81of_${seed}_${TAG}.png`);
  out.label = await page.evaluate(() => document.body.innerText.match(/Playing [^\n·]+/)?.[0] ?? null);
} catch (e) { out.error = String(e).slice(0, 300); }
out.errors = errors;
const late = out.days.filter((d) => d.ownSlots.length && d.ownSlots[0] !== 0);
out.summary = `days ${out.days.length}; with a war of the played nation on the row ${out.days.filter((d) => d.ownSlots.length).length}; of them not first ${late.length}`;
save(`c81_of_${seed}_${TAG}.json`, out);
console.log(out.summary); console.log((out.wars ?? []).join(' || '), out.error ?? '');
for (const d of out.days) console.log(d.day, d.ownSlots.join(','), '|', d.row.join(' | '), d.more ?? '');
await browser.close();
