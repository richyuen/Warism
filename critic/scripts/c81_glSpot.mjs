// Critic run 80 (new): the WebGL "bufferSubData: buffer overflow" warning of look 64907 (QHD, day 500, 30 m/px on the
// first front, a fleet at sea). Plain 1938 SEED (heroes on, as look opens it) at W x H stepped DAY days; the camera at
// (X, Y) at each of 1200, 250, 100, 30 m/px, settled, then 30 m/px again with the game run 5 s at x5; the warnings after each.
// Usage: [BASE=...] node critic/scripts/c81_glSpot.mjs <seed> <W> <H> <day> <x> <y>
import { launch, open1938, hours, lookAt, save, shot, run, pause } from './c81_lib.mjs';
const [seedS, WS, HS, DS, XS, YS] = process.argv.slice(2);
const seed = Number(seedS), W = Number(WS), H = Number(HS), DAY = Number(DS), X = Number(XS), Y = Number(YS);
const out = { seed, W, H, DAY, X, Y, acts: [] };
const { browser, page, errors } = await launch(W, H);
let seen = 0;
const note = (act) => { out.acts.push({ act, n: errors.length - seen }); seen = errors.length; };
try {
  await open1938(page, seed, '&heroes=on');
  await hours(page, 24 * DAY); note('step');
  for (const m of [1200, 250, 100, 30]) { await lookAt(page, X, Y, m); note(`${m} m/px`); }
  await run(page); await page.waitForTimeout(5000); await pause(page); note('30 m/px running 5 s');
  out.shot = await shot(page, `c81gs_${seed}_${W}x${H}_d${DAY}.png`);
} catch (e) { out.error = String(e).slice(0, 300); }
out.errors = errors;
save(`c81_gs_${seed}_${W}x${H}_d${DAY}.json`, out);
console.log(JSON.stringify(out));
await browser.close();
