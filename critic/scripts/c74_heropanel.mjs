// Critic run 72 (new): where the heroes' tags stand when a panel covers their units. The 1938 world with heroes (as a
// game from the title), a day in, the world view at the probe's scale: a shot with no panel, then with Relations open,
// then with History open. Usage: node critic/scripts/c74_heropanel.mjs <seed> [m/px=12000]
import { launch, open1938, save, shot, lookAt, hours, CELLS } from './c74_lib.mjs';
const seed = Number(process.argv[2] ?? 55929);
const m = Number(process.argv[3] ?? 12000);
const out = { seed, m };
const { browser, page, errors } = await launch(1600, 900);
try {
  await open1938(page, seed, '&heroes=on');
  await hours(page, 24);
  await lookAt(page, CELLS.berlin[0] + 200, CELLS.berlin[1] + 60, m);
  out.none = await shot(page, `c74hp_${seed}_${m}_0none.png`);
  await page.getByTestId('relations-btn').click();
  await page.waitForTimeout(1500);
  out.relations = await shot(page, `c74hp_${seed}_${m}_1relations.png`);
  await page.keyboard.press('Escape');
  await page.locator('[data-testid=relations-close], .panel-close').first().click().catch(() => {});
  await page.waitForTimeout(500);
  await page.getByTestId('history-btn').click();
  await page.waitForTimeout(1500);
  out.history = await shot(page, `c74hp_${seed}_${m}_2history.png`);
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c74_hp_${seed}_${m}.json`, out);
await browser.close();
console.log(JSON.stringify(out));
