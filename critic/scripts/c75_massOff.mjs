// Critic run 75 (copy of c75_massHist, the kind changed to R129's MassingCalledOff): the row in the History panel and its export. Plain 1938 SEED, DAYS days: History opened, the
// kind's filter set to "Massing called off" (rows, count), "my wars only" with a nation played (TAKE, a name in a
// row), the CSV's and JSON's type of the row; a click on a row (does the map go to the border).
// Usage: node critic/scripts/c75_massHist.mjs <seed> <DAYS> <TAKE name>
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { BASE, save, shot, hours, open1938, CELLS } from './c75_lib.mjs';
const seed = Number(process.argv[2] ?? 56211), DAYS = Number(process.argv[3] ?? 80), TAKE = process.argv[4] ?? 'Romania';
const out = { seed };
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 1600, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message)));
const rows = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=history-row]')].map((r) => r.innerText.replace(/\s+/g, ' ')));
try {
  await open1938(page, seed);
  await hours(page, DAYS * 24);
  await page.waitForTimeout(1500);
  await page.getByTestId('history-btn').click();
  await page.waitForSelector('[data-testid=history-row]', { timeout: 60_000 });
  out.kinds = await page.evaluate(() => [...document.querySelector('[data-testid=history-kind]').options].map((o) => o.text));
  await page.getByTestId('history-kind').selectOption({ label: 'Massing called off' });
  await page.waitForTimeout(800);
  out.massRows = await rows();
  out.count = await page.getByTestId('history-count').innerText();
  console.log(`kind filter "Massing called off": ${out.count}: ${JSON.stringify(out.massRows)}`);
  out.shot = await shot(page, `c75mo_${seed}_kind.png`);
  for (const kind of ['csv', 'json']) {
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30_000 }), page.getByTestId(`history-${kind}`).click()]);
    const p = path.resolve(`critic/c75_mo_${seed}.${kind}`);
    await dl.saveAs(p);
    const text = readFileSync(p, 'utf8');
    out[kind] = text.slice(0, 700);
    console.log(`${kind}: ${text.split('\n').length} lines: ${text.slice(0, 420).replace(/\n/g, ' | ')}`);
  }
  await page.getByTestId('history-close').click().catch(() => {});
  // The ticker's row of a massing clicked: where the camera goes (the place of the event: a point of the border).
  if (await page.getByTestId('ticker-more').count()) { await page.getByTestId('ticker-more').click(); await page.waitForTimeout(300); }
  const tick = page.locator('[data-testid=ticker-row][data-kind-name=MassingCalledOff]');
  out.tickerMass = await tick.count();
  if (out.tickerMass > 0) {
    const text = (await tick.last().innerText()).replace(/\s+/g, ' ');
    await tick.last().click();
    await page.waitForTimeout(2500);
    const after = await page.evaluate(() => { const v = window.__warsim.view; const c = v.controller.cam; return [Math.round(c.cx), Math.round(c.cy), Math.round(v.metresPerPx)]; });
    console.log(`ticker row "${text}" clicked: camera at cell ${after[0]},${after[1]}, ${after[2]} m/px`);
    out.tickerClick = { text, after, shot: await shot(page, `c75mo_${seed}_tickerclick.png`) };
  } else console.log('no massing row in the ticker now');
  // My wars only, playing TAKE.
  const id = CELLS.tags[TAKE];
  out.takeId = id;
  await page.evaluate((n) => window.__warsim.view.select(n), id);
  await page.waitForTimeout(800);
  await page.getByTestId('take-control').click();
  await page.waitForTimeout(600);
  await page.getByTestId('nation-close').click().catch(() => {});
  await page.getByTestId('history-btn').click();
  await page.waitForSelector('[data-testid=history-panel]', { timeout: 60_000 });
  await page.getByTestId('history-kind').selectOption({ index: 0 }).catch(() => {});
  await page.getByTestId('history-mine').click();
  await page.waitForTimeout(800);
  const mine = await rows();
  out.mine = mine.filter((r) => /massing/i.test(r));
  console.log(`my wars only as ${TAKE} (id ${id}): ${mine.length} rows, of a massing: ${JSON.stringify(out.mine)}`);
  out.shotMine = await shot(page, `c75mo_${seed}_mine.png`);
} catch (e) { out.error = String(e?.stack ?? e).slice(0, 1500); console.log('ERROR', out.error); }
out.errors = errors;
console.log(`page errors ${errors.length}`);
save(`c75_mo_${seed}.json`, out);
await browser.close();
