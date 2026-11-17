// Critic run 73 (new): R112, a counter's edge in its nation's colour, in both unit looks. 1938 SEED at the start,
// Europe at 4,000 m/px: a shot in the look the title gives (Countryballs) and one in Classic, and a crop of each.
// Usage: node critic/scripts/c75_stripe.mjs <seed>
import { launch, open1938, shot, lookAt } from './c75_lib.mjs';
const seed = Number(process.argv[2] ?? 56981);
const { browser, page, errors } = await launch(1600, 900);
await open1938(page, seed);
for (const look of ['balls', 'classic']) {
  await page.evaluate((look) => { const s = window.__warsim.settings; if (s?.unitLook) s.unitLook.value = look; window.__warsim.view.unitLook = look; }, look);
  await page.waitForTimeout(800);
  await lookAt(page, 1090, 285, 4000);
  await page.waitForTimeout(600);
  const got = await page.evaluate(() => window.__warsim.view.unitLook);
  await page.screenshot({ path: `critic/shots/c75stripe_${seed}_${look}.png`, clip: { x: 600, y: 250, width: 500, height: 300 } });
  console.log(look, 'view look', got);
}
console.log(JSON.stringify(errors));
await browser.close();
