// Critic run 31 (R7, new): a default as a player meets it. 1938 seed <seed>: God sets <TAG>'s treasury to <gold>; the
// world runs day by day until the History has a "defaulted" row (up to <maxDays>). Records the day, the History row(s)
// with the "Default" kind, the ticker rows of those days naming the nation, the nation's treasury in its panel before
// and after, then a save at that hour reloaded (hash after <run> hours both times).
// Usage: node critic/scripts/c38_df_default.mjs <seed> <TAG> <gold> <maxDays> <tag>
import { launch, open1938, shot, save, hours, CELLS } from './c31_lib.mjs';
const [seedS, TAG, goldS, maxS, tagS] = process.argv.slice(2);
const seed = Number(seedS ?? 7019), gold = Number(goldS ?? -800), maxDays = Number(maxS ?? 220), tag = tagS ?? 'pol';
const n = CELLS.tags[TAG ?? 'POL'];
const out = { seed, TAG, gold, nation: n, samples: [] };
const { browser, page, errors } = await launch();
const panelGold = () => page.evaluate(() => {
  const p = [...document.querySelectorAll('aside, .panel')].find((e) => e.offsetParent !== null && /Treasury/.test(e.innerText));
  const m = p?.innerText.match(/Treasury\s*\n?\s*([^\n]+)/);
  return m ? m[1] : null;
});
const tickerRows = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row]')].map((r) => r.innerText.replace(/\n/g, ' ')));
try {
  await open1938(page, seed);
  await page.getByTestId('god-btn').click();
  await page.evaluate((n) => window.__warsim.view.select(n), n);
  await page.waitForTimeout(600);
  await page.getByTestId('tab-god').click();
  await page.getByTestId('god-gold-input').fill(String(gold));
  await page.getByTestId('god-gold').click();
  await hours(page, 1);
  await page.getByTestId('tab-overview').click().catch(() => {});
  out.goldAfterSet = await panelGold();
  out.shotSet = await shot(page, `c38df_${tag}_set.png`);
  let found = null;
  for (let d = 1; d <= maxDays && !found; d++) {
    await hours(page, 24);
    const tk = await tickerRows();
    const named = tk.filter((r) => /Poland|default|debt/i.test(r));
    if (d % 10 === 0 || named.length) out.samples.push({ d, gold: await panelGold(), ticker: named.slice(0, 4) });
    // History rows, searched every 5 days (the panel read through its DOM)
    if (d % 5 === 0) {
      await page.getByRole('button', { name: 'History', exact: true }).click();
      await page.waitForSelector('[data-testid=history-row]', { timeout: 60_000 }).catch(() => {});
      const rows = await page.evaluate(() => [...document.querySelectorAll('[data-testid=history-row]')].map((r) => r.innerText.replace(/\n/g, ' ')));
      const hit = rows.filter((r) => /default/i.test(r));
      if (hit.length) {
        found = { day: d, rows: hit, tickerThen: tk.slice(0, 8) };
        out.kinds = await page.evaluate(() => [...document.querySelectorAll('[data-testid=history-kind] option')].map((o) => [o.value, o.textContent]));
        const opt = out.kinds.find(([, l]) => /Default/.test(l));
        if (opt) {
          await page.selectOption('[data-testid=history-kind]', opt[0]);
          await page.waitForTimeout(300);
          out.filtered = await page.evaluate(() => ({ count: document.querySelector('[data-testid=history-count]')?.innerText, rows: [...document.querySelectorAll('[data-testid=history-row]')].map((r) => r.innerText.replace(/\n/g, ' ')) }));
        }
        out.shotHistory = await shot(page, `c38df_${tag}_history.png`);
      }
      await page.getByTestId('history-close').click().catch(() => {});
    }
  }
  out.found = found;
  out.goldAfter = await panelGold();
  out.shotAfter = await shot(page, `c38df_${tag}_after.png`);
  // save, run 200 h, hash; load, run 200 h, hash
  const st = () => page.evaluate(async () => ({ tick: window.__warsim.view.lastTick, hash: await window.__warsim.sim.hash() }));
  await page.evaluate(async () => { window.__critSave = await window.__warsim.sim.save(); });
  out.saveAt = await st();
  await hours(page, 200);
  out.runA = await st();
  await page.evaluate(async () => window.__warsim.sim.load(window.__critSave));
  await page.waitForTimeout(1500);
  out.loadedAt = await st();
  await hours(page, 200);
  out.runB = await st();
  out.same = out.runA.hash === out.runB.hash && out.runA.tick === out.runB.tick;
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 600); }
out.errors = errors;
save(`c38_df_${seed}_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify(out).slice(0, 3000));
