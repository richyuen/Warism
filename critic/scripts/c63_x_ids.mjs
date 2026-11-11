// Critic run 61 (new): open the 1938 world, step DAYS, click a sequence of test ids (comma list), shot and the visible
// test ids after each. Usage: node critic/scripts/c63_x_ids.mjs <seed> <days> <label> <id,id,...> [W H]
import { launch, open1938, shot, save, hours } from './c63_lib.mjs';
const [seedS, daysS, label, idsS, wS, hS] = process.argv.slice(2);
const out = { steps: [] };
const { browser, page, errors } = await launch(Number(wS ?? 1600), Number(hS ?? 900));
try {
  await open1938(page, Number(seedS), process.env.EXTRA ?? '');
  if (Number(daysS) > 0) await hours(page, 24 * Number(daysS));
  for (const id of (idsS || '').split(',').filter(Boolean)) {
    if (id.startsWith('wait')) { await page.waitForTimeout(Number(id.slice(4))); continue; }
    if (id.startsWith('key:')) { await page.keyboard.press(id.slice(4)); await page.waitForTimeout(500); }
    else if (id.startsWith('text:')) await page.getByText(id.slice(5), { exact: true }).first().click();
    else await page.getByTestId(id).first().click();
    await page.waitForTimeout(700);
    const ids = await page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter((e) => e.offsetParent !== null).map((e) => `${e.dataset.testid}: ${(e.innerText || e.value || '').replace(/\s+/g, ' ').slice(0, 90)}`));
    out.steps.push({ id, shot: await shot(page, `c63x_${label}_${out.steps.length}_${id.replace(/[^a-z0-9]/gi, '')}.png`), ids });
  }
} catch (e) { out.fail = String(e).slice(0, 500); }
finally { out.errors = errors; save(`c63_x_${label}.json`, out); await browser.close(); }
console.log(JSON.stringify(out, null, 1).slice(0, 6000));
