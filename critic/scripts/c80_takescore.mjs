// Critic run 71 (new, R85b on the page): the war score a player reads after taking a nation in a WWII year of the replay.
// The score counts from the one at the replay's end (`scoreFrom`); what do the war chips and their panel say, against the
// land the sides hold? YEAR replay paused; NATION selected and taken by its panel's "Take control" (a real click); DAYS on;
// the war chips' text, the selected war's panel, the ticker; shots. Usage: node c80_takescore.mjs [year=1943] [NATION=JAP] [DAYS=60] [W H]
import { launch, shot, save, CELLS, BASE } from './c80_lib.mjs';
const year = Number(process.argv[2] ?? 1943), NATION = process.argv[3] ?? 'JAP', DAYS = Number(process.argv[4] ?? 60);
const W = Number(process.argv[5] ?? 1600), H = Number(process.argv[6] ?? 900);
const label = `${year}_${NATION}_${DAYS}_${W}x${H}`;
const out = { year, NATION, DAYS, W, H, samples: [] };
const { browser, page, errors } = await launch(W, H);
const stepH = (n) => page.evaluate(async (n) => {
  const w = window.__warsim; const target = w.view.lastTick + n; await w.sim.step(n);
  const t0 = performance.now();
  await new Promise((done) => { const f = () => (w.view.lastTick >= target || performance.now() - t0 > 900000 ? done() : setTimeout(f, 20)); f(); });
}, n);
const sample = async (s) => {
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => ({
    date: document.querySelector('[data-testid=date-label]')?.innerText ?? null,
    chips: [...document.querySelectorAll('[data-testid=war-banner]')].map((b) => `${b.innerText.replace(/\s+/g, ' ')} [${b.title.split('\n')[0]}; fill ${b.querySelector('.war-score-fill')?.style.width}]`),
    ticker: [...document.querySelectorAll('[data-testid=ticker-row]')].slice(0, 6).map((e) => e.innerText.replace(/\n/g, ' ')),
  }));
  out.samples.push({ s, ...r });
  console.log(s, JSON.stringify(r).slice(0, 900));
};
try {
  await page.goto(`${BASE}/?scenario=1938h&seed=1938&paused=1&year=${year}&mode=replay`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null, null, { timeout: 180_000 });
  await page.waitForTimeout(2500);
  await page.evaluate((n) => window.__warsim.view.select(n), CELLS.tags[NATION]);
  await page.waitForTimeout(800);
  out.note = await page.evaluate(() => document.querySelector('[data-testid=take-ends-track]')?.innerText ?? null);
  out.panelShot = await shot(page, `c80ts_${label}_0panel.png`);
  await page.getByTestId('take-control').click();
  await stepH(2);
  await sample('hour 2');
  out.shot0 = await shot(page, `c80ts_${label}_1taken.png`);
  for (let d = 0; d < DAYS; d += 30) { await stepH(24 * Math.min(30, DAYS - d)); await sample(`day ${Math.min(DAYS, d + 30)}`); }
  const chip = page.locator('[data-testid=war-banner]').first();
  if (await chip.count()) { await chip.click(); await page.waitForTimeout(1000); }
  out.warPanel = await page.evaluate(() => document.querySelector('.panel')?.innerText.slice(0, 900) ?? null);
  out.shot1 = await shot(page, `c80ts_${label}_2war.png`);
} catch (e) { out.fatal = String(e?.stack ?? e); console.log(out.fatal); }
out.errors = errors;
save(`c80_ts_${label}.json`, out);
await browser.close();
