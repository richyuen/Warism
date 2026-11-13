// Critic run 65 (new): the replay's Vietnam War as a viewer zooms in (a start from 1968, replay, run 40 days at Max):
// Indochina at 4000, 1000, 250, 60 and 25 m/px; the formations there by nation (inspect); the US stack's men.
// Usage: node critic/scripts/c66_x_vietnam.mjs [year=1968] [days=40]
import { launch, shot, save, lookAt, settle, BASE } from './c66_lib.mjs';
const year = Number(process.argv[2] ?? 1968), days = Number(process.argv[3] ?? 40);
const out = { year, days, views: [] };
const { browser, page, errors } = await launch(1600, 900);
const cell = (lon, lat) => [((lon + 180) / 360) * 2048, ((90 - lat) / 180) * 1024];
try {
  await page.goto(`${BASE}/?scenario=1938h&seed=1938&paused=1&year=${year}&mode=replay&after=777`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null && !document.querySelector('[data-testid=world-building]'), null, { timeout: 180_000 });
  await page.evaluate((d) => window.__warsim.sim.step(24 * d), days);
  await page.waitForTimeout(4000);
  out.date = await page.evaluate(() => document.querySelector('[data-testid=date-label]')?.innerText ?? null);
  const [x, y] = [1631.0, 525.8];
  for (const m of [4000, 1000, 250, 60, 25]) {
    await lookAt(page, x, y, m, true);
    await page.waitForTimeout(600);
    out.views.push({ m, shot: await shot(page, `c66vn_${year}_${m}.png`) });
  }
  // A hover over the centre at 250 m/px: the tooltip.
  await lookAt(page, x, y, 250, true);
  await page.mouse.move(800, 450);
  await page.waitForTimeout(800);
  out.hoverShot = await shot(page, `c66vn_${year}_hover.png`);
  out.tooltip = await page.evaluate(() => document.querySelector('[data-testid=map-tooltip]')?.innerText ?? null);
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c66_vn_${year}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 3000));
