// Critic run 30 (R10): a sea hero waiting for a port, as the player meets it: the nation's Overview Heroes block at
// <tick> (1938 heroes on, seed <seed>, nation <id>), and a shot. Usage: <seed> <tick> <nationId> <tag>
import { launch, open1938, shot, save, hours } from './c30_lib.mjs';
const seed = Number(process.argv[2] ?? 4111), tick = Number(process.argv[3] ?? 15600), nation = Number(process.argv[4] ?? 1), tg = process.argv[5] ?? 'ger';
const { browser, page, errors } = await launch();
const out = { seed, tick, nation };
try {
  await open1938(page, seed, '&heroes=on');
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  await hours(page, tick);
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), nation);
  await page.waitForTimeout(800);
  out.block = await page.evaluate(() => document.querySelector('[data-testid="panel-heroes"]')?.innerText.replace(/\n/g, ' | ') ?? null);
  out.heroStats = await page.evaluate((n) => (window.__warsim.hud.stats.value?.heroes ?? []).find?.((x) => x[0] === n) ?? null, nation).catch(() => null);
  out.shot = await shot(page, `c30hwp_${seed}_${tg}_${tick}.png`);
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c30_hwp_${seed}_${tg}.json`, out);
await browser.close();
console.log(JSON.stringify(out).slice(0, 800));
