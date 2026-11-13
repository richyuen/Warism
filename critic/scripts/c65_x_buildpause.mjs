// Critic run 64 (new): while "Building the world…" is up, the short bar shows "Pause" (the game running) even when the
// start is paused (?paused=1), then "Resume · Paused" at the first stats. A player who presses the bar's pause button
// in the build: what state does the game end in, and what does the bar say before and after?
// Usage: node critic/scripts/c65_x_buildpause.mjs <W> <H> <paused 0|1>
import { launch, shot, save, BASE } from './c65_lib.mjs';
const W = Number(process.argv[2] ?? 1600), H = Number(process.argv[3] ?? 900), P = process.argv[4] ?? '1';
const out = { W, H, P };
const { browser, page, errors } = await launch(W, H);
const state = () => page.evaluate(() => ({
  overlay: document.querySelector('[data-testid=world-building]') !== null,
  bar: [...document.querySelectorAll('.bottom-bar button, [data-testid=date-label]')].map((e) => e.innerText.replace(/\n/g, ' ')).join(' | '),
  paused: window.__warsim?.hud?.paused?.value ?? null,
  worker: window.__warsim?.hud?.worker?.value ?? null,
  tick: window.__warsim?.hud?.tick?.value ?? null,
}));
try {
  await page.goto(`${BASE}/?scenario=1938&seed=36211${P === '1' ? '&paused=1' : ''}`);
  await page.waitForSelector('[data-testid=world-building]', { timeout: 60000 });
  out.before = await state();
  out.beforeShot = await shot(page, `c65xbp_${W}x${H}_p${P}_before.png`);
  const btn = page.getByRole('button', { name: /^(Pause|Resume)$/ });
  out.clicked = await btn.first().innerText();
  await btn.first().click();
  out.afterClick = await state();
  await page.waitForFunction(() => window.__warsim?.hud?.stats?.value != null, null, { timeout: 60000 });
  await page.waitForTimeout(3000);
  out.after3s = await state();
  out.afterShot = await shot(page, `c65xbp_${W}x${H}_p${P}_after.png`);
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 600); }
out.errors = errors;
save(`c65_xbp_${W}x${H}_p${P}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 2500));
