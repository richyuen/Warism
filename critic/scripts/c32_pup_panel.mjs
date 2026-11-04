// Critic run 28 (new), PUP: what the player reads of a puppet bond (AoC's panel shows the puppet integration bar,
// loyalty, the tier). 1938 world, seed, after `days` days: Manchukuo's and Japan's nation panels, the puppet map mode.
// Usage: node critic/scripts/c32_pup_panel.mjs <seed> <days>
import { launch, open1938, shot, save, hours, CELLS } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 4583), days = Number(process.argv[3] ?? 60);
const T = CELLS.tags;
const out = { seed, days };
const { browser, page, errors } = await launch(1600, 900);
try {
  await open1938(page, seed);
  if (days) await hours(page, days * 24);
  for (const tag of ['MAN', 'JAP', 'SLO']) {
    if (!T[tag]) continue;
    await page.evaluate((p) => window.__warsim.hud.onSelectNation(p), T[tag]);
    await page.waitForTimeout(900);
    out[tag] = await page.evaluate(() => document.querySelector('[data-testid=nation-panel]')?.innerText ?? null);
    out[tag + '_over'] = await page.evaluate(() => document.querySelector('[data-testid=panel-overlord]')?.innerText ?? null);
    out[tag + '_pups'] = await page.evaluate(() => document.querySelector('[data-testid=panel-puppets]')?.innerText ?? null);
    await shot(page, `c32pup_${seed}_${tag}_panel.png`);
  }
  // God tab of the puppet
  await page.evaluate((p) => window.__warsim.hud.onSelectNation(p), T.MAN);
  await page.waitForTimeout(500);
  const god = page.locator('button', { hasText: /^God Mode$/ }).first();
  if (await god.count()) { await god.click(); await page.waitForTimeout(600); }
  const gt = page.getByTestId('tab-god');
  if (await gt.count()) { await gt.click(); await page.waitForTimeout(600); }
  out.MAN_god = await page.evaluate(() => document.querySelector('[data-testid=nation-panel]')?.innerText.slice(0, 2500) ?? null);
  await shot(page, `c32pup_${seed}_MAN_god.png`);
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c32_pup_${seed}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 6000));
