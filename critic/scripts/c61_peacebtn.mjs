// Critic run 58 (new): R56d, the Actions tab's "Offer peace" as the menu's. Play ME, declare war on FOE by the tab,
// then every STEP days up to DAYS: each peace button's row, disabled, title; the right-click menu's peace item on FOE
// (disabled, title) beside it. A disabled button is clicked (force) to see nothing happens; the first enabled one is
// clicked and the war checked 2 h later. Usage: node c61_peacebtn.mjs <seed> <ME> <FOE> [DAYS] [STEP] [W H]
import { launch, open1938, shot, save, hours, CELLS, lookAt, screenOf } from './c61_lib.mjs';
const [seedS, ME, FOE, daysS, stepS, wS, hS] = process.argv.slice(2);
const seed = Number(seedS), DAYS = Number(daysS ?? 120), STEP = Number(stepS ?? 5), W = Number(wS ?? 1600), H = Number(hS ?? 900);
const T = CELLS.tags;
const label = `${seed}_${ME}_${FOE}_${W}x${H}`;
const out = { seed, ME, FOE, samples: [] };
const { browser, page, errors } = await launch(W, H);
const wars = () => page.evaluate(() => {
  const s = window.__warsim.hud.stats.value;
  return s.wars.map((w) => ({ id: w.id, a: w.attackers, d: w.defenders, score: w.score, ex: w.exhaustion, death: w.toDeath }));
});
const btns = () => page.evaluate(() => [...document.querySelectorAll('[data-testid^=act-peace-]')].map((b) => ({
  id: b.dataset.testid, row: b.closest('.god-row')?.textContent, disabled: b.disabled, title: b.title,
})));
const menu = async () => {
  // open the nation menu on FOE by the player's openMenu (as a right click does)
  await page.evaluate((n) => window.__warsim.player?.openMenu?.(n, 600, 300), T[FOE]);
  await page.waitForTimeout(300);
  const m = await page.evaluate(() => [...document.querySelectorAll('[data-testid=nation-menu] button')].map((b) => ({ id: b.dataset.testid, text: b.textContent, disabled: b.disabled, title: b.title })));
  await page.keyboard.press('Escape');
  await page.evaluate(() => window.__warsim.player?.menu && (window.__warsim.player.menu.value = null));
  return m;
};
try {
  await open1938(page, seed);
  out.hasPlayer = await page.evaluate(() => !!window.__warsim.player);
  await page.evaluate((n) => window.__warsim.view.select(n), T[ME]);
  await page.getByTestId('take-control').click();
  await page.getByTestId('release-control').waitFor({ timeout: 10000 });
  await page.getByTestId('tab-actions').click();
  await page.waitForTimeout(400);
  await page.getByTestId('act-target').selectOption(String(T[FOE]));
  await page.waitForTimeout(300);
  await page.getByTestId('act-war').click();
  await hours(page, 2); await page.waitForTimeout(1200);
  await shot(page, `c61pb_${label}_d0.png`);
  let clicked = false, triedDisabled = false;
  for (let d = 0; d <= DAYS; d += STEP) {
    if (d > 0) await hours(page, 24 * STEP);
    await page.waitForTimeout(800);
    const b = await btns();
    const s = { day: d, buttons: b, wars: await wars(), menu: await menu() };
    out.samples.push(s);
    if (!triedDisabled && b.some((x) => x.disabled)) {
      triedDisabled = true;
      const x = b.find((y) => y.disabled);
      const before = await wars();
      await page.locator(`[data-testid=${x.id}]`).click({ force: true, timeout: 3000 }).catch(() => {});
      await hours(page, 2); await page.waitForTimeout(800);
      out.disabledClick = { button: x, warsBefore: before.length, warsAfter: (await wars()).length };
      await shot(page, `c61pb_${label}_disabled_d${d}.png`);
    }
    const en = b.find((x) => !x.disabled);
    if (en && !clicked) {
      clicked = true;
      const before = await wars();
      await shot(page, `c61pb_${label}_enabled_d${d}.png`);
      await page.locator(`[data-testid=${en.id}]`).click();
      await hours(page, 2); await page.waitForTimeout(1200);
      const after = await wars();
      out.enabledClick = { day: d, button: en, before: before.map((w) => w.id), after: after.map((w) => w.id),
        ticker: await page.evaluate(() => document.body.innerText.split('\n').filter((l) => /19\d\d /.test(l)).slice(-6)) };
      await shot(page, `c61pb_${label}_afterpeace_d${d}.png`);
    }
    if (clicked && d > 0 && out.enabledClick && out.enabledClick.day < d) break;
  }
} catch (e) {
  out.fail = String(e?.stack ?? e).slice(0, 600);
}
out.errors = errors;
save(`c61_pb_${label}.json`, out);
await browser.close();
console.log(JSON.stringify({ fail: out.fail, n: out.samples.length, enabledClick: out.enabledClick, disabledClick: out.disabledClick, errors: errors.length }));
