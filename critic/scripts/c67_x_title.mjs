// Critic run 61 (new): the title screen as a player meets it: buttons, test ids, each scenario started by clicks.
import { launch, shot, save, BASE } from './c67_lib.mjs';
const out = { steps: [] };
const { browser, page, errors } = await launch(1600, 900);
try {
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(4000);
  out.title = await shot(page, 'c67x_title.png');
  out.ids = await page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter((e) => e.offsetParent !== null).map((e) => `${e.dataset.testid}: ${(e.innerText || '').replace(/\s+/g, ' ').slice(0, 80)}`));
  out.text = await page.evaluate(() => document.body.innerText.slice(0, 3000));
} finally {
  out.errors = errors;
  save('c67_x_title.json', out);
  await browser.close();
}
