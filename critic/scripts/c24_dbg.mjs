import { launch, open1938, hours } from './c24_lib.mjs';
const { browser, page } = await launch();
await open1938(page, 7019);
await hours(page, 72);
console.log(await page.evaluate(() => { const v = window.__warsim.view; const ids = v.formationsOf(1); return [ids.length, ids.slice(0,3), ids.slice(0,3).map((i) => v.formationPos(i)), typeof v.formationAfloat]; }));
await browser.close();
