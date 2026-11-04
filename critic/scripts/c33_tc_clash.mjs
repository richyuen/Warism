// Critic run 33 (R16a): the clash of traits in God's tab. Poland: tick Militarist; is Pacifist greyed; a clashing mask
// (militarist | pacifist = 3) sent as God's command: the toast. Usage: node critic/scripts/c33_tc_clash.mjs <seed>
import { launch, open1938, shot, save, hours, CELLS } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 3517);
const out = { seed };
const { browser, page, errors } = await launch();
try {
  await open1938(page, seed);
  await page.getByTestId('god-btn').click();
  await page.evaluate((n) => window.__warsim.view.select(n), CELLS.tags.POL); await page.waitForTimeout(500);
  await page.getByTestId('tab-god').click();
  await page.getByTestId('god-trait-militarist').click(); await hours(page, 1);
  out.pacifistDisabled = await page.getByTestId('god-trait-pacifist').isDisabled();
  out.militaristChecked = await page.getByTestId('god-trait-militarist').isChecked();
  await page.getByTestId('god-traits').scrollIntoViewIfNeeded();
  out.shot = await shot(page, `c33tc_${seed}_clash.png`);
  await page.evaluate(() => window.__warsim.hud.command({ kind: 'setTraits', nation: 4, mask: 3 }));
  await hours(page, 1); await page.waitForTimeout(500);
  out.toasts = await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row], [role=status]')].map((e) => e.innerText.replace(/\n/g, ' ')).slice(0, 4));
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 500); }
out.errors = errors;
save(`c33_tc_${seed}.json`, out);
await browser.close();
console.log(JSON.stringify(out));
