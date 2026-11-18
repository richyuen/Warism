// Critic run 76 (new): R135 on the page. Plain 1938 SEED stepped DAY; every banner's data-death and its title (the
// tooltip a resting mouse shows), the "+n" list opened too; a shot with the mouse on the first banner of a war to the death.
// Usage: [BASE=...] node critic/scripts/c77_deathTitle.mjs <seed> <day> [W H]
import { launch, open1938, shot, save, hours } from './c77_lib.mjs';
const seed = Number(process.argv[2] ?? 7019), DAY = Number(process.argv[3] ?? 300), W = Number(process.argv[4] ?? 1600), H = Number(process.argv[5] ?? 900);
const out = { seed, DAY, W, H };
const { browser, page, errors } = await launch(W, H);
try {
  await open1938(page, seed);
  await hours(page, DAY * 24);
  await page.waitForTimeout(1200);
  const read = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=war-banner]')].map((b) => ({ war: b.getAttribute('data-war'), death: b.getAttribute('data-death'), text: b.innerText.replace(/\s+/g, ' '), title: b.getAttribute('title') })));
  out.row = await read();
  const more = page.getByTestId('war-more');
  if (await more.count()) { await more.click(); await page.waitForTimeout(600); out.opened = await read(); }
  const d = (out.opened ?? out.row).find((b) => b.death === '1');
  out.deathBanner = d ?? null;
  if (d) {
    const box = await page.locator(`[data-testid=war-banner][data-war="${d.war}"]`).first().boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(1800);
    out.shot = await shot(page, `c77dt_${seed}_${DAY}_${W}x${H}.png`);
  }
} catch (e) { out.error = String(e).slice(0, 300); }
out.errors = errors;
save(`c77_dt_${seed}_${DAY}_${W}x${H}.json`, out);
console.log(JSON.stringify(out, null, 1));
await browser.close();
