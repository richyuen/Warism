// Critic run 70 (new, R84l): a later year free with heroes on, by the URL the form makes: the hero formations on the
// page (view.heroFormations) and their names, at day 0 and day 10. Usage: BASE=... node critic/scripts/c75_heroes60.mjs <year> <after>
import { launch, shot, save } from './c75_lib.mjs';
const year = Number(process.argv[2] ?? 1960), after = Number(process.argv[3] ?? 53260);
const { browser, page, errors } = await launch(1600, 900);
await page.goto(`${process.env.BASE}/?scenario=1938h&seed=1938&paused=1&heroes=on&after=${after}&year=${year}&mode=free`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 180_000 });
await page.waitForTimeout(3000);
const heroes = () => page.evaluate(() => { const v = window.__warsim.view; return v.heroFormations().map((f) => v.formationTitle(f)?.name ?? `#${f}`); });
const out = { year, after, h0: await heroes() };
await page.evaluate(() => window.__warsim.sim.step(240));
await page.waitForTimeout(4000);
out.h10 = await heroes();
out.shot = await shot(page, `c75h60_${year}_${after}.png`);
out.errors = errors;
save(`c75_heroes_${year}_${after}.json`, out);
console.log(JSON.stringify(out));
await browser.close();
