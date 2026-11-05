// Critic run 22, K3: Breakthrough's refusal with God's tab open (K2's second arm had the panel closed).
import { launch, open1938, shot, save, lookAt, CELLS, screenOf } from './c31_lib.mjs';
const T = CELLS.tags; const out = {};
const { browser, page, errors } = await launch();
try {
  await open1938(page, 2203);
  await page.getByTestId('god-btn').click();
  await page.evaluate((n) => window.__warsim.view.select(n), T.GER);
  await page.waitForTimeout(600);
  await page.getByTestId('tab-god').click();
  await lookAt(page, (CELLS.berlin[0] + CELLS.warsaw[0]) / 2, CELLS.berlin[1], 1500);
  await page.getByTestId('god-tool-battle').click();
  const [ax, ay] = await screenOf(page, CELLS.berlin[0] + 3, CELLS.berlin[1]);
  const [bx, by] = await screenOf(page, CELLS.warsaw[0], CELLS.warsaw[1]);
  await page.mouse.click(ax, ay); await page.waitForTimeout(300);
  await page.mouse.click(bx, by); await page.waitForTimeout(1200);
  out.refusal = await page.getByTestId('god-refusal').innerText().catch(() => null);
  out.shot = await shot(page, 'c34k3_godtab.png');
} catch (e) { out.fatal = String(e).slice(0, 400); }
out.errors = errors; save('c34_k3_2203.json', out); await browser.close(); console.log(JSON.stringify(out));
