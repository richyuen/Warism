// Critic run 29 (R5a, heroes), HCC: a click on a displaced hero counter at the world's zoom (the start view): what opens?
// Usage: node critic/scripts/c30_hcc_heroclick.mjs <seed>
import { launch, open1938, shot, save, settle } from './c30_lib.mjs';
const seed = Number(process.argv[2] ?? 5521);
const out = { seed, clicks: [] };
const { browser, page, errors } = await launch();
try {
  await open1938(page, seed, '&heroes=on');
  await page.waitForTimeout(1200); await settle(page);
  const boxes = await page.evaluate(() => window.__warsim.view.counters.drawn.filter((d) => d.hero).map((d) => ({ name: d.text, cx: d.x + d.w / 2, cy: d.y + d.h / 2 })));
  for (const b of boxes.filter((x) => /Ercole|Roma|Char|TOG|Richelieu|Maus/.test(x.name))) {
    await page.mouse.click(b.cx, b.cy);
    await page.waitForTimeout(1000);
    const panel = await page.evaluate(() => { const p = [...document.querySelectorAll('aside, .panel')].map((e) => e.innerText).find((t) => /Kind|Overview/.test(t)); return p ? p.replace(/\n/g, ' | ').slice(0, 160) : null; });
    const cam = await page.evaluate(() => { const v = window.__warsim.view; const c = v.controller.cam; return [Math.round(c.cx), Math.round(c.cy), Math.round(v.metresPerPx * c.scale)]; });
    out.clicks.push({ hero: b.name, at: [Math.round(b.cx), Math.round(b.cy)], panel, cam, shot: await shot(page, `c30hcc_${seed}_${b.name.replace(/\W/g, '')}.png`) });
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    await page.evaluate(() => window.__warsim.view.controller.set({ cx: 1024, cy: 512, scale: 0.0001 })); await page.waitForTimeout(600); await settle(page);
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c30_hcc_${seed}.json`, out);
await browser.close();
console.log(JSON.stringify(out.clicks.map((c) => [c.hero, c.panel, c.cam])), out.fatal ?? '');
