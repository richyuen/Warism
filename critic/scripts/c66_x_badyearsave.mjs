// Critic run 65 (new): R68b's refusal with a saved game present. Play plain 1938 a few days, Settings > Main menu (the
// game is saved), then open a start from a year whose save is missing (1960 served 404). What does the title say about
// the player's own saved game, and can it still be continued?
// Usage: node critic/scripts/c66_x_badyearsave.mjs
import { launch, open1938, shot, save, BASE } from './c66_lib.mjs';
const out = {};
const { browser, page, errors } = await launch(1600, 900);
try {
  await open1938(page, 4711);
  await page.evaluate(() => window.__warsim.sim.step(24 * 5));
  await page.waitForTimeout(1500);
  await page.getByTestId('settings-btn').click();
  await page.getByTestId('settings-menu').click();
  await page.getByTestId('title-screen').waitFor();
  await page.waitForTimeout(1500);
  out.before = await page.evaluate(() => document.querySelector('[data-testid=title-save]')?.innerText ?? null);
  out.shotBefore = await shot(page, 'c66bys_before.png');
  await page.route('**/start/1960.sav', (route) => route.fulfill({ status: 404, body: 'no' }));
  await page.goto(`${BASE}/?scenario=1938h&seed=1938&paused=1&year=1960&mode=replay&after=7`);
  await page.waitForTimeout(12000);
  out.url = page.url();
  out.after = await page.evaluate(() => document.querySelector('[data-testid=title-save]')?.innerText ?? null);
  out.continueButton = await page.locator('[data-testid=title-continue]').count();
  out.shotAfter = await shot(page, 'c66bys_after.png');
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 500); }
out.errors = errors.slice(0, 4);
save('c66_bys.json', out);
await browser.close();
console.log(JSON.stringify(out, null, 1));
