// Critic run 54 (new): R51a's city in the Breakthrough row, everywhere it is told: the ticker, History's row and its
// CSV and JSON downloads. Germany at war with Poland, Breakthrough from 3 cells east of Berlin to Warsaw (as c57_kw),
// a day on; then History searched for the row, both downloads read for the row and for a raw "=" before a name.
// Usage: node critic/scripts/c57_kwhist.mjs <seed>
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { launch, open1938, shot, save, lookAt, CELLS, screenOf, hours } from './c57_lib.mjs';

const seed = Number(process.argv[2] ?? 21151);
const T = CELLS.tags;
const out = { seed };
const { browser, page, errors } = await launch();
try {
  await open1938(page, seed);
  await page.evaluate(({ a, d }) => window.__warsim.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: T.GER, d: T.POL });
  await page.evaluate(() => window.__warsim.sim.step(1));
  await page.evaluate((g) => window.__warsim.hud.onSelectNation(g), T.GER);
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'God Mode', exact: true }).click();
  await page.waitForTimeout(600);
  await lookAt(page, (CELLS.berlin[0] + CELLS.warsaw[0]) / 2, CELLS.berlin[1], 1500);
  await page.getByRole('button', { name: 'Breakthrough', exact: true }).click();
  await page.waitForTimeout(400);
  const [ax, ay] = await screenOf(page, CELLS.berlin[0] + 3, CELLS.berlin[1]);
  const [bx, by] = await screenOf(page, CELLS.warsaw[0], CELLS.warsaw[1]);
  await page.mouse.click(ax, ay);
  await page.waitForTimeout(300);
  await page.mouse.click(bx, by);
  await page.waitForTimeout(1200);
  await hours(page, 24);
  out.ticker = await page.evaluate(() => document.body.innerText.split('\n').filter((l) => /breakthrough/i.test(l)));
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await page.waitForSelector('[data-testid=history-row]', { timeout: 120_000 });
  await page.waitForTimeout(800);
  out.historyRows = await page.evaluate(() => [...document.querySelectorAll('[data-testid=history-row]')].map((r) => r.innerText.replace(/\s+/g, ' ')).filter((t) => /breakthrough|=/i.test(t)));
  out.historyRaw = await page.evaluate(() => [...document.querySelectorAll('[data-testid=history-row]')].map((r) => r.innerText).filter((t) => /(^|\s)=\S/.test(t)));
  out.shot = await shot(page, `c57kwh_${seed}_history.png`);
  for (const kind of ['csv', 'json']) {
    const b = page.getByTestId(`history-${kind}`);
    if ((await b.count()) === 0) { out[kind] = 'no button'; continue; }
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30_000 }), b.click()]);
    const p = path.resolve(`critic/c57_kwh_${seed}.${kind}`);
    await dl.saveAs(p);
    const text = readFileSync(p, 'utf8');
    const lines = text.split('\n');
    out[kind] = { lines: lines.length, breakthrough: lines.filter((l) => /breakthrough/i.test(l)).slice(0, 4).map((l) => l.slice(0, 400)), rawEq: lines.filter((l) => /"=|,=/.test(l)).slice(0, 4).map((l) => l.slice(0, 300)) };
  }
  if (/json/.test(String(out.json?.breakthrough?.length))) void 0;
} catch (e) {
  out.fail = String(e?.stack ?? e);
} finally {
  out.errors = errors;
  save(`c57_kwh_${seed}.json`, out);
  await browser.close();
  console.log(JSON.stringify(out).slice(0, 3000));
}
