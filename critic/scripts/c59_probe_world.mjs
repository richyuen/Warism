// Critic run 56: does the page expose the sim's world (to move transport groups as landingCallBound1938 does)?
import { launch, open1938 } from './c59_lib.mjs';
const { browser, page } = await launch(1600, 900);
try {
  await open1938(page, 1);
  console.log(await page.evaluate(() => { const s = window.__warsim.sim; return JSON.stringify({ keys: Object.keys(s).slice(0, 40), world: typeof s.world, proto: Object.getOwnPropertyNames(Object.getPrototypeOf(s)).slice(0, 60) }); }));
} finally { await browser.close(); }
