// Critic run 61 (new): a game started from the title screen by clicks, with chosen options, then played in real time
// at the top speed for SECS seconds: the date, nations and rAF frame rate every 10 s, and shots at four zooms at the end.
// Usage: node critic/scripts/c61_x_play.mjs <label> <scenario 1938|random> <size small|medium|large> <secs> [opt=value ...] [W H via env]
import { launch, shot, save, BASE, lookAt } from './c61_lib.mjs';
const [label, scen, size, secsS, ...opts] = process.argv.slice(2);
const W = Number(process.env.W ?? 1600), H = Number(process.env.H ?? 900);
const out = { label, scen, size, opts, W, H, samples: [] };
const { browser, page, errors } = await launch(W, H);
try {
  await page.goto(`${BASE}/`);
  await page.getByTestId('title-screen').waitFor();
  await page.getByTestId(`title-scenario-${scen}`).click();
  await page.getByTestId('settings-seed').fill(process.env.SEED ?? '32401');
  if (process.env.NATIONS) await page.getByTestId('settings-nations').fill(process.env.NATIONS);
  const sizeIdx = { small: 0, medium: 1, large: 2 }[size];
  await page.getByTestId('opt-size').locator('select').selectOption({ index: sizeIdx }).catch(async () => { await page.getByTestId('opt-size').selectOption({ index: sizeIdx }); });
  for (const o of opts) {
    const [k, v] = o.split('=');
    const loc = page.getByTestId(`opt-${k}`);
    const sel = (await loc.evaluate((e) => e.tagName)) === 'SELECT' ? loc : loc.locator('select');
    await sel.selectOption({ label: v });
  }
  out.optsShot = await shot(page, `c61xp_${label}_options.png`);
  const t0 = Date.now();
  await page.getByTestId('settings-new-game').click();
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  out.loadMs = Date.now() - t0;
  await page.waitForTimeout(1500);
  out.startShot = await shot(page, `c61xp_${label}_start.png`);
  await page.evaluate(() => { const h = window.__warsim.hud; if (h.paused.value) h.togglePause(); h.setSpeedLevel(99); });
  await page.evaluate(() => { window.__fr = []; let last = performance.now(); const f = (t) => { window.__fr.push(t - last); last = t; requestAnimationFrame(f); }; requestAnimationFrame(f); });
  const secs = Number(secsS);
  for (let s = 10; s <= secs; s += 10) {
    await page.waitForTimeout(10_000);
    out.samples.push(await page.evaluate(() => {
      const fr = window.__fr.splice(0); const sum = fr.reduce((a, b) => a + b, 0);
      
      return { date: document.querySelector('[data-testid=date-label]')?.innerText ?? String(window.__warsim.hud.date?.() ?? ''), fps: +(1000 * fr.length / sum).toFixed(1), worst: Math.max(...fr).toFixed(0), over100: fr.filter((x) => x > 100).length, nations: document.querySelectorAll('[data-testid=nation-count]').length ? document.querySelector('[data-testid=nation-count]').innerText : null };
    }));
    console.log(JSON.stringify(out.samples.at(-1)));
  }
  await page.evaluate(() => { const h = window.__warsim.hud; if (!h.paused.value) h.togglePause(); });
  out.endShot = await shot(page, `c61xp_${label}_end_world.png`);
  out.ids = await page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter((e) => e.offsetParent !== null).map((e) => e.dataset.testid).slice(0, 200));
} catch (e) { out.fail = String(e); console.log(String(e)); }
finally {
  out.errors = errors;
  save(`c61_xp_${label}.json`, out);
  await browser.close();
}
