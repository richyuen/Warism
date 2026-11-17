// Critic run 70 (new, R84a/R84e on the page): the replay from a WWII year, one God act far from the wars (a revolt in
// South America), then an hour on: the Eastern Front and the ticker before and after. MODE=free starts the year free
// instead (no God act). Usage: BASE=... node critic/scripts/c73_god42.mjs <year> <after> [replay|free]
import { launch, shot, save, settle } from './c73_lib.mjs';

const year = Number(process.argv[2] ?? 1942);
const after = Number(process.argv[3] ?? 53542);
const mode = process.argv[4] ?? 'replay';
const out = { year, after, mode };
const { browser, page, errors } = await launch(1600, 900);
await page.goto(`${process.env.BASE}/?scenario=1938h&seed=1938&paused=1&year=${year}&mode=${mode}&after=${after}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 180_000 });
await page.waitForTimeout(3000);
const cell = (lon, lat) => {
  const w = 2048, h = 1024;
  const my = (p) => 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * p));
  const top = my((80 * Math.PI) / 180);
  return [((lon + 180) / 360) * w, ((top - my((lat * Math.PI) / 180)) / Math.PI) * h];
};
const look = async (lon, lat, m) => {
  const [cx, cy] = cell(lon, lat);
  await page.evaluate(({ cx, cy, m }) => { const v = window.__warsim.view; v.controller.set({ cx, cy, scale: (v.metresPerPx * v.controller.cam.scale) / m }); }, { cx, cy, m });
  await page.mouse.move(5, 300);
  await settle(page, 10_000);
  await page.waitForTimeout(1200);
};
const ticker = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row]')].slice(0, 14).map((e) => e.innerText.replace(/\n/g, ' ')));
const wars = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=war-chip], .war-chip')].map((e) => e.innerText.replace(/\n/g, ' ')));
await look(Number(process.env.LON ?? 35), Number(process.env.LAT ?? 50), Number(process.env.M ?? 8000));
out.dateBefore = await page.evaluate(() => document.querySelector('[data-testid=date-label]')?.innerText ?? null);
out.warsBefore = await wars();
out.before = await shot(page, `c73g42_${year}_${mode}_${after}_0before_${process.env.TAGN ?? "east"}.png`);
if (mode === 'replay') {
  await page.getByTestId('god-btn').click();
  await page.waitForTimeout(500);
  out.godNote = await page.evaluate(() => document.body.innerText.match(/[^\n]*(replay|history|track)[^\n]*/gi)?.slice(0, 6) ?? null);
  await look(-60, -15, 3000);
  await page.getByTestId('god-tool-revolt').click();
  await page.mouse.click(800, 450);
  await page.waitForTimeout(1500);
  await page.keyboard.press('Escape');
}
await page.evaluate(() => window.__warsim.sim.step(2));
await page.waitForTimeout(2500);
await look(Number(process.env.LON ?? 35), Number(process.env.LAT ?? 50), Number(process.env.M ?? 8000));
out.dateAfter = await page.evaluate(() => document.querySelector('[data-testid=date-label]')?.innerText ?? null);
out.tickerAfter = await ticker();
out.warsAfter = await wars();
out.after = await shot(page, `c73g42_${year}_${mode}_${after}_1after_${process.env.TAGN ?? "east"}.png`);
out.errors = errors;
save(`c73_g42_${year}_${mode}_${after}.json`, out);
console.log(JSON.stringify(out, null, 1));
await browser.close();
