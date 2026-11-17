// Critic run 75 (new): what R130's row looks like while it runs: plain 1938 SEED with heroes at DAY, resumed at the
// loaded speed; a picture of the banners' strip (the bottom 110 px) every second for N seconds, and the row's text.
// Usage: [BASE=...] node critic/scripts/c75_bannerFrames.mjs <seed> <day> <tag> [N=10]
import path from 'node:path';
import { launch, open1938, hours, SHOTS } from './c75_lib.mjs';
const seed = Number(process.argv[2] ?? 57901), DAY = Number(process.argv[3] ?? 150), tag = process.argv[4] ?? 'head', N = Number(process.argv[5] ?? 10);
const { browser, page, errors } = await launch(1600, 900);
await open1938(page, seed, '&heroes=on');
await hours(page, DAY * 24);
await page.waitForTimeout(1000);
await page.getByRole('button', { name: 'Resume', exact: true }).click();
await page.waitForTimeout(3000);
for (let i = 0; i < N; i++) {
  const row = await page.evaluate(() => [...document.querySelectorAll('[data-testid=war-banner]')].map((b) => b.innerText.replace(/\s+/g, ' ')));
  await page.screenshot({ path: path.join(SHOTS, `c75bfr_${tag}_${seed}_${String(i).padStart(2, '0')}.png`), clip: { x: 400, y: 800, width: 800, height: 60 } });
  console.log(`${tag} +${i} s: ${JSON.stringify(row)}`);
  await page.waitForTimeout(1000);
}
console.log(`page errors ${errors.length}`);
await browser.close();
