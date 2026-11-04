// Critic run 31 (R12): the ticker's "lost" and "back" rows of a hero: a click on each, where does the camera go
// (against the event's place), and the History panel's row's Go to. 1938 ?heroes=on seed 4111: Bismarck lost tick 2485.
import { launch, open1938, shot, save, hours } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 4111), loss = Number(process.argv[3] ?? 2485), back = Number(process.argv[4] ?? 3925);
const out = { seed, rows: [] };
const { browser, page, errors } = await launch();
const cam = () => page.evaluate(() => { const v = window.__warsim.view; const c = v.controller.cam; return [Math.round(c.cx * 10) / 10, Math.round(c.cy * 10) / 10, Math.round(v.metresPerPx * c.scale)]; });
const clickRow = async (re, tag) => {
  const rows = page.locator('[data-testid=ticker-row]');
  const n = await rows.count();
  for (let i = 0; i < n; i++) {
    const t = await rows.nth(i).innerText();
    if (re.test(t)) {
      const before = await cam();
      await rows.nth(i).click(); await page.waitForTimeout(1500);
      out.rows.push({ tag, text: t.replace(/\n/g, ' '), kind: await rows.nth(i).getAttribute('data-kind-name').catch(() => null), before, after: await cam(), shot: await shot(page, `c33hg_${seed}_${tag}.png`) });
      return true;
    }
  }
  out.rows.push({ tag, missing: true, seen: await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker] button')].map((b) => b.getAttribute('data-testid') + ': ' + b.innerText.replace(/\n/g, ' '))) });
  return false;
};
try {
  await open1938(page, seed, '&heroes=on');
  await hours(page, loss - 2); for (let k = 0; k < 4; k++) await hours(page, 1); await page.waitForTimeout(800);
  out.hero = await page.evaluate(() => null);
  await clickRow(/lost Bismarck/, 'lost');
  await hours(page, back - loss - 6); for (let k = 0; k < 6; k++) await hours(page, 1); await page.waitForTimeout(800);
  await clickRow(/Bismarck is back/, 'back');
  // History: the hero kinds in the filter, and Go to on the "back" row
  await page.getByRole('button', { name: 'History', exact: true }).click(); await page.waitForTimeout(800);
  out.kinds = await page.evaluate(() => [...document.querySelectorAll('select option')].map((o) => o.textContent).filter((t) => /Hero/.test(t)));
  const hrow = page.locator('text=/Bismarck is back/').first();
  out.historyRow = await hrow.innerText().catch(() => null);
  const before = await cam();
  await hrow.click().catch(() => {}); await page.waitForTimeout(1500);
  out.historyGoto = { before, after: await cam(), shot: await shot(page, `c33hg_${seed}_history_back.png`) };
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c33_hg_${seed}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 0).slice(0, 1500));
