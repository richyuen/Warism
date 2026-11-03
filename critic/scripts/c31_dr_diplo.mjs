// Critic run 24 (new), DR: the seed-drawn start (?diplo=random) as a player sees it. Seed <seed>: day 1 and day 180:
// the world, China at 3000 m/px (Japan's held land), China's and Japan's panels, the war banners, the history's first rows.
// Usage: node critic/scripts/c31_dr_diplo.mjs <seed> [extra]
import { launch, open1938, shot, save, lookAt, hours, CELLS } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 8821);
const extra = process.argv[3] ?? '&diplo=random';
const tagx = extra.includes('random') ? 'rnd' : 'scn';
const CHI = CELLS.tags.CHI, JAP = CELLS.tags.JAP;
const out = { seed, extra, days: [] };
const { browser, page, errors } = await launch();
const panelText = () => page.evaluate(() => document.querySelector('.panel, [data-testid="nation-panel"]')?.innerText ?? null);
try {
  await open1938(page, seed, extra);
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  let day = 0;
  for (const d of [1, 180]) {
    await hours(page, (d - day) * 24); day = d;
    const rec = { d };
    rec.banners = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="war-"], .war-banner, .wars button')].map((b) => b.innerText.replace(/\s+/g, ' ')).slice(0, 12));
    await page.evaluate(() => window.__warsim.view.select(0));
    await lookAt(page, 1024, 512, 30000);
    rec.world = await shot(page, `c31dr_${tagx}_${seed}_d${d}_world.png`);
    await lookAt(page, 1700, 400, 3000);
    rec.china = await shot(page, `c31dr_${tagx}_${seed}_d${d}_china.png`);
    await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), CHI);
    await page.waitForTimeout(700);
    rec.chinaPanel = await panelText();
    rec.chinaShot = await shot(page, `c31dr_${tagx}_${seed}_d${d}_china_panel.png`);
    await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), JAP);
    await page.waitForTimeout(700);
    rec.japanPanel = await panelText();
    rec.japanShot = await shot(page, `c31dr_${tagx}_${seed}_d${d}_japan_panel.png`);
    await page.keyboard.press('Escape');
    out.days.push(rec);
    save(`c31_dr_${tagx}_${seed}.json`, { ...out, errors });
  }
  // history: open it
  const hb = page.getByRole('button', { name: 'History' });
  if (await hb.count()) { await hb.first().click(); await page.waitForTimeout(1200); out.history = (await page.evaluate(() => document.body.innerText)).split('\n').filter((l) => /1938/.test(l)).slice(0, 40); out.historyShot = await shot(page, `c31dr_${tagx}_${seed}_history.png`); }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c31_dr_${tagx}_${seed}.json`, out);
await browser.close();
console.log(JSON.stringify(out.days.map((r) => [r.d, (r.chinaPanel ?? '').slice(0, 600)])), out.fatal ?? '');
