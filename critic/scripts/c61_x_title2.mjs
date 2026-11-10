// Critic run 61 (new): the title screen's options for the random world.
import { launch, shot, save, BASE } from './c61_lib.mjs';
const { browser, page, errors } = await launch(1600, 900);
await page.goto(`${BASE}/`);
await page.getByTestId('title-scenario-random').click();
await page.waitForTimeout(1500);
const ids = await page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter((e) => e.offsetParent !== null).map((e) => `${e.dataset.testid} <${e.tagName}>: ${(e.innerText || '').replace(/\s+/g, ' ').slice(0, 100)}`));
await shot(page, 'c61x_title_random.png');
console.log(ids.join('\n'), errors);
await browser.close();
