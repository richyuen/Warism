// Critic run 80: c81_x_continue with the banners' row read when the game is left and after Continue (rowLeft, rowCont).
// Critic run 61 (new): the player's save: play SEED for D days as TAG (take control), Settings > Main menu > Continue.
// Is the continued game the one left (tick, hash, the nation played), and does it go on as an unbroken game would?
// Usage: node critic/scripts/c81_x_continue.mjs <seed> <days> <TAG> <moreDays>
import { launch, open1938, shot, save, hours, CELLS } from './c81_lib.mjs';
const [seedS, dS, TAG, mS] = process.argv.slice(2);
const seed = Number(seedS), D = Number(dS), M = Number(mS);
const out = { seed, D, TAG, M };
const hash = (page) => page.evaluate(async () => { const s = await window.__warsim.sim.hash(); return { tick: s.tick, hash: s.hash ?? s.stateHash }; });
const a = await launch(1600, 900);
try {
  const page = a.page;
  await open1938(page, seed);
  await page.evaluate((n) => window.__warsim.view.select(n), CELLS.tags[TAG]);
  await page.getByTestId('take-control').click();
  await page.getByTestId('release-control').waitFor({ timeout: 10000 });
  await hours(page, 24 * D);
  out.left = await hash(page);
  out.leftDate = await page.getByTestId('date-label').innerText();
  await page.waitForTimeout(1500); out.rowLeft = await page.evaluate(() => [...document.querySelectorAll('[data-testid=war-banner]')].map((b) => b.innerText.replace(/\s+/g, ' ')));
  await page.getByTestId('settings-btn').click();
  await page.getByTestId('settings-menu').click();
  // Since a confirm step was added (settings-menu-yes), the probe clicks it (run 79's mend: runs 77 and 78 stood here).
  if (await page.getByTestId('settings-menu-yes').count()) await page.getByTestId('settings-menu-yes').click();
  await page.getByTestId('title-continue').waitFor({ timeout: 20000 });
  out.saveText = await page.getByTestId('title-save').innerText();
  await page.getByTestId('title-continue').click();
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 120000 });
  await page.waitForTimeout(2500);
  out.cont = await hash(page);
  out.contDate = await page.getByTestId('date-label').innerText();
  out.rowCont = await page.evaluate(() => [...document.querySelectorAll('[data-testid=war-banner]')].map((b) => b.innerText.replace(/\s+/g, ' '))); await page.waitForTimeout(3000); out.rowCont2 = await page.evaluate(() => [...document.querySelectorAll('[data-testid=war-banner]')].map((b) => b.innerText.replace(/\s+/g, ' ')));
  out.playing = await page.evaluate(() => [...document.querySelectorAll('[data-testid=release-control],[data-testid=take-control],[data-testid=player-badge]')].map((e) => `${e.dataset.testid}:${e.innerText}`));
  out.contShot = await shot(page, `c81xc_${seed}_continued.png`);
  await hours(page, 24 * M);
  out.after = await hash(page);
} catch (e) { out.fail = String(e).slice(0, 400); }
finally { out.errors = a.errors; await a.browser.close(); }
// The unbroken game.
const b = await launch(1600, 900);
try {
  const page = b.page;
  await open1938(page, seed);
  await page.evaluate((n) => window.__warsim.view.select(n), CELLS.tags[TAG]);
  await page.getByTestId('take-control').click();
  await page.getByTestId('release-control').waitFor({ timeout: 10000 });
  await hours(page, 24 * D);
  out.unbrokenAtLeave = await hash(page);
  await hours(page, 24 * M);
  out.unbroken = await hash(page);
} catch (e) { out.fail2 = String(e).slice(0, 400); }
finally { out.errors2 = b.errors; await b.browser.close(); }
out.sameAfter = out.after?.hash === out.unbroken?.hash && out.after?.tick === out.unbroken?.tick;
save(`c81_xcRow_${seed}_${TAG}.json`, out);
console.log(JSON.stringify(out, null, 1));
