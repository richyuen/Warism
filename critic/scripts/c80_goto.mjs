// Critic run 80 (new): the nation menu's "Go to country" from a panel's chip (PLAN 7.175f: "selects it and flies there as
// the chip did"). Desk 1600 x 900: select Germany, click its first chip, click Go to country; the selection and the
// camera before and 0.5, 2 and 4 s after; shots.
// Usage: [BASE=...] [TAG=] node critic/scripts/c80_goto.mjs <seed>
import { launch, open1938, shot, save, CELLS } from './c80_lib.mjs';
const seed = Number(process.argv[2] ?? 68931), TAG = process.env.TAG ?? '';
const { browser, page, errors } = await launch(1600, 900);
const cam = () => page.evaluate(() => { const c = window.__warsim.view.controller.cam; return { cx: +c.cx.toFixed(1), cy: +c.cy.toFixed(1), scale: +c.scale.toFixed(3) }; });
const out = { seed };
await open1938(page, seed);
await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), CELLS.tags.GER);
await page.waitForSelector('[data-testid=nation-chip]');
out.chip = await page.locator('[data-testid=nation-chip]').first().innerText();
await page.locator('[data-testid=nation-chip]').first().click();
await page.waitForSelector('[data-testid=nation-menu-goto]');
out.menuShot = await shot(page, `c80goto_${seed}${TAG}_menu.png`);
out.before = { cam: await cam(), selected: await page.evaluate(() => window.__warsim.hud.selected.value) };
await page.locator('[data-testid=nation-menu-goto]').click();
out.after = [];
for (const ms of [500, 1500, 2000]) { await page.waitForTimeout(ms); out.after.push({ cam: await cam(), selected: await page.evaluate(() => window.__warsim.hud.selected.value) }); }
out.shot = await shot(page, `c80goto_${seed}${TAG}_after.png`);
out.errors = errors;
console.log(JSON.stringify(out));
save(`c80_goto_${seed}${TAG}.json`, out);
await browser.close();
