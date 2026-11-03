// Critic run 24 (new), GU: the Soviet guarantee of Czechoslovakia while the two are at war (scenario diplomacy, seed <seed>, day 13).
import { launch, open1938, shot, save, hours } from './c29_lib.mjs';
const seed = Number(process.argv[2] ?? 3739);
const out = { seed };
const { browser, page, errors } = await launch();
try {
  await open1938(page, seed);
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  await hours(page, 13 * 24);
  for (const [n, tag] of [[10, 'sov'], [3, 'czs']]) {
    await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), n);
    await page.waitForTimeout(800);
    out[tag] = await page.evaluate(() => document.querySelector('.panel, [data-testid="nation-panel"]')?.innerText ?? null);
    out[tag + 'Shot'] = await shot(page, `c29gu_${seed}_${tag}.png`);
  }
  // diplomacy map mode on the Soviet Union
  await page.evaluate(() => window.__warsim.view.select(10));
  out.date = await page.evaluate(() => String(window.__warsim.hud.date?.() ?? ''));
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c29_gu_${seed}.json`, out);
await browser.close();
console.log(JSON.stringify({ sov: out.sov, czs: out.czs, fatal: out.fatal }).slice(0, 3000));
