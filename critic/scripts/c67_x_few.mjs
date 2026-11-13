// Critic run 61 (new): a random world of N nations stepped Y years: wars ever declared (History), wars now, nations left.
// Usage: node critic/scripts/c67_x_few.mjs <seed> <nations> <years> [size]
import { launch, shot, save, hours, BASE } from './c67_lib.mjs';
const [seedS, nS, yS, size] = process.argv.slice(2);
const out = { seed: +seedS, nations: +nS, years: +yS, perYear: [] };
const { browser, page, errors } = await launch(1600, 900);
try {
  await page.goto(`${BASE}/?scenario=random&paused=1&seed=${seedS}&nations=${nS}${size ? `&size=${size}` : ''}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120000 });
  for (let y = 1; y <= +yS; y++) {
    await hours(page, 8760);
    await page.waitForTimeout(300);
    out.perYear.push(await page.evaluate(() => { const s = window.__warsim.hud.stats.value; return { tick: s.tick, wars: s.wars.length, nations: s.nations.filter?.((n) => n.alive !== false).length ?? s.nations.length }; }));
  }
  await page.getByTestId('history-btn').click();
  await page.waitForTimeout(1500);
  out.history = await page.evaluate(() => [document.querySelector('[data-testid=history-count]')?.innerText, ...[...document.querySelectorAll('[data-testid=history-row]')].slice(0, 15).map((r) => r.innerText.replace(/\n/g, ' '))]);
  out.shot = await shot(page, `c67xf_${seedS}_${nS}.png`);
} catch (e) { out.fail = String(e).slice(0, 300); }
finally { out.errors = errors; save(`c67_xf_${seedS}_${nS}.json`, out); await browser.close(); console.log(JSON.stringify(out)); }
