// Critic run 22, K2: run 21's "Breakthrough silent" (PLAN 7.165): God Mode, Germany at peace, Breakthrough from the
// bar's Map tools, two clicks; is "no front to break through" anywhere on the page, with the panel on Overview, and
// then with the God tab open?
import { launch, open1938, shot, save, lookAt, CELLS, screenOf } from './c31_lib.mjs';
const T = CELLS.tags; const out = { steps: [] };
const { browser, page, errors } = await launch();
const said = () => page.evaluate(() => (document.body.innerText.match(/[^\n]*no front to break through[^\n]*/) ?? [null])[0]);
try {
  await open1938(page, 2203);
  await page.evaluate((g) => window.__warsim.hud.onSelectNation(g), T.GER);
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'God Mode', exact: true }).click();
  await page.waitForTimeout(600);
  await lookAt(page, (CELLS.berlin[0] + CELLS.warsaw[0]) / 2, CELLS.berlin[1], 1500);
  for (const tab of ['overview', 'god']) {
    await page.getByTestId(`tab-${tab}`).click().catch(() => {});
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Breakthrough', exact: true }).click();
    await page.waitForTimeout(300);
    const [ax, ay] = await screenOf(page, CELLS.berlin[0] + 3, CELLS.berlin[1]);
    const [bx, by] = await screenOf(page, CELLS.warsaw[0], CELLS.warsaw[1]);
    await page.mouse.click(ax, ay); await page.waitForTimeout(300);
    await page.mouse.click(bx, by); await page.waitForTimeout(1200);
    out.steps.push({ tab, said: await said(), status: await page.evaluate(() => [...document.querySelectorAll('[role=status]')].map((e) => e.innerText).join(' / ')), shot: await shot(page, `c40k2_${tab}.png`) });
    await page.keyboard.press('Escape');
  }
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 600); }
out.errors = errors; save('c40_k2_2203.json', out); await browser.close(); console.log(JSON.stringify(out, null, 1));
