// Critic run 62 (new): 1938h's "Next, ...: ..." line at phone sizes: the title's card and form, the started game's
// bottom bar (is the line whole, cut, or does it push the bar?), a selected nation's panel beside it.
// Usage: node critic/scripts/c65_h_phone.mjs <W> <H>
import { launch, save, shot, BASE, CELLS } from './c65_lib.mjs';
const W = Number(process.argv[2] ?? 390), H = Number(process.argv[3] ?? 844);
const out = { W, H };
const { browser, page, errors } = await launch(W, H);
const box = (sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), sw: e.scrollWidth, cw: e.clientWidth, text: e.innerText }; }, sel);
try {
  await page.goto(`${BASE}/`);
  await page.getByTestId('title-screen').waitFor();
  await page.getByTestId('title-scenario-1938').click(); await page.getByTestId('title-mode-replay').click();
  await page.waitForTimeout(800);
  out.titleShot = await shot(page, `c65hp_${W}x${H}_title.png`);
  out.fixedNote = await box('[data-testid=settings-fixed]');
  await page.getByTestId('settings-new-game').click();
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  await page.evaluate(() => window.__warsim.sim.step(24 * 70));
  await page.waitForTimeout(1500);
  out.date = await box('[data-testid=date-label]');
  out.next = await box('[data-testid=track-next]');
  out.bar = await box('[data-testid=bottombar]');
  out.docW = await page.evaluate(() => document.documentElement.scrollWidth);
  out.shot = await shot(page, `c65hp_${W}x${H}_bar.png`);
  await page.evaluate((n) => window.__warsim.view.select(n), CELLS.tags.GER);
  await page.waitForTimeout(800);
  out.panel = await box('[data-testid=nation-panel]');
  out.panelShot = await shot(page, `c65hp_${W}x${H}_panel.png`);
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c65_hp_${W}x${H}.json`, out);
await browser.close();
console.log(JSON.stringify(out));
