// Critic run 72 (new): R86e's city names in History. History names a city by its row at the time it is shown
// (`historyRows`' city role, `strikeNear`), so a row of a year before a rename may read the later name.
// A built year opened (replay or free), History filtered by kind (Major battle began, 28, by default) and by each year
// FROM..TO alone (the panel shows the newest 400 rows), the rows that name a city of the rename list (either name).
// Shot of the first year with such a row, the row scrolled into view.
// Usage: node critic/scripts/c73_histnames.mjs <startYear> <replay|free> <fromYear> <toYear> [kind=28] [W H]
import { launch, save, shot, BASE } from './c73_lib.mjs';
const year = Number(process.argv[2] ?? 1991);
const mode = process.argv[3] ?? 'replay';
const from = Number(process.argv[4] ?? 1941), to = Number(process.argv[5] ?? 1944);
const kind = process.argv[6] ?? '28';
const W = Number(process.argv[7] ?? 1600), H = Number(process.argv[8] ?? 900);
const tag = `${year}_${mode}_${from}-${to}_k${kind}_${W}x${H}`;
const NAMES = /Stalingrad|Volgograd|Leningrad|St\.? Petersburg|Peiping|Peking|Beijing|Keij|Seoul|Heij|Pyongyang|Fusan|Pusan|L[ée]opoldville|Kinshasa|Nanking|Nanjing|Chungking|Chongqing|Tsingtao|Qingdao|Mukden|Shenyang|Hsinking|Changchun|Batavia|Jakarta|Saigon|Ho Chi Minh|Stalino\b|Donetsk|K[öo]nigsberg|Kaliningrad|Danzig|Gda[ńn]sk|Breslau|Wroc|Stettin|Szczecin|Memel|Klaip|Wilno|Vilnius|Lw[óo]w|Lvov|Lviv|Viipuri|Vyborg|Fiume|Rijeka|Zara\b|Zadar|Pola\b|Pula|Hankow|Wuhan|Tientsin|Tianjin|Amoy|Xiamen|Swatow|Shantou|Foochow|Fuzhou|Kalgan|Zhangjiakou|Dairen|Dalian|Taihoku|Taipei|Takao|Kaohsiung|Kishinev|Chi[șs]in[ăa]u|Gorky|Nizhny|Kuibyshev|Samara|Sverdlovsk|Yekaterinburg|Kalinin\b|Tver|Voroshilovgrad|Lugansk|Stalinabad|Dushanbe|Frunze|Bishkek|Rangoon|Yangon|Akmolinsk|Tselinograd/;
const out = { year, mode, from, to, kind, years: [] };
const { browser, page, errors } = await launch(W, H);
try {
  await page.goto(`${BASE}/?scenario=1938h&seed=1938&paused=1&year=${year}&mode=${mode}&after=999`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null && !document.querySelector('[data-testid=world-building]'), null, { timeout: 180_000 });
  await page.waitForTimeout(1500);
  out.date = await page.evaluate(() => document.querySelector('[data-testid=date-label]')?.innerText ?? null);
  await page.getByTestId('history-btn').click();
  await page.waitForSelector('[data-testid=history-row]', { timeout: 60_000 });
  out.countAll = await page.getByTestId('history-count').innerText().catch(() => null);
  if (kind !== 'all') await page.getByTestId('history-kind').selectOption(kind);
  out.named = [];
  let shotDone = false;
  for (let y = from; y <= to; y++) {
    await page.getByTestId('history-from').fill(String(y));
    await page.getByTestId('history-to').fill(String(y));
    await page.waitForTimeout(900);
    const count = await page.getByTestId('history-count').innerText().catch(() => null);
    const rows = await page.evaluate(() => [...document.querySelectorAll('[data-testid=history-row]')].map((r) => r.innerText.replace(/\s+/g, ' ')));
    const named = rows.filter((r) => NAMES.test(r));
    out.years.push({ y, count, shown: rows.length, named: named.length });
    out.named.push(...named.map((r) => `${y}: ${r}`));
    if (!shotDone && named.length > 0) {
      const idx = rows.findIndex((r) => NAMES.test(r));
      await page.locator('[data-testid=history-row]').nth(idx).scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      out.shot = await shot(page, `c73hn_${tag}_${y}.png`);
      shotDone = true;
    }
  }
} catch (e) { out.fatal = String(e?.stack ?? e); out.shotFatal = await shot(page, `c73hn_${tag}_fatal.png`).catch(() => null); }
out.errors = errors;
save(`c73_hn_${tag}.json`, out);
await browser.close();
console.log(`years ${out.years.map((x) => `${x.y}:${x.count}/${x.shown}/${x.named}`).join(' ')}`);
console.log((out.named ?? []).slice(0, 100).join('\n'));
