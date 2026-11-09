// Critic run 52 (copy of c59_rise_page). Critic run 52 (new): R48-B1 in the page. 1938, seed 20429, random diplomacy (&diplo=random), stepped to day 547
// (past t13104), the ticker rows, the war chips and History filtered to "Puppet revolt", with shots.
import { launch, open1938, shot, save, hours } from './c59_lib.mjs';
const out = {};
const { browser, page, errors } = await launch();
try {
  await open1938(page, 20429, '&diplo=random');
  await hours(page, 13104 - 6);
  await hours(page, 12);
  out.tick = await page.evaluate(() => window.__warsim.view.lastTick);
  out.ticker = await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row]')].map((x) => x.innerText.replace(/\s+/g, ' ')));
  out.chips = await page.evaluate(() => [...document.querySelectorAll('.war-chip, [data-testid=war-chip]')].map((x) => x.innerText.replace(/\s+/g, ' ')));
  out.shotTicker = await shot(page, 'c59rise_20429_ticker.png');
  const hist = await page.$('button:has-text("History")');
  if (hist) { await hist.click(); await page.waitForTimeout(800); }
  const sel = await page.$('select');
  out.histRows = await page.evaluate(() => [...document.querySelectorAll('[data-testid=history-row], .history-row, li')].map((x) => x.innerText.replace(/\s+/g, ' ')).filter((t) => /rose against|freed from|Dutch East Indies/.test(t)).slice(0, 10));
  out.shotHist = await shot(page, 'c59rise_20429_history.png');
} finally {
  out.errors = errors;
  save('c59_rise_page.json', out);
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
}
