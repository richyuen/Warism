// Critic run 76 (new): R142's hand-back. Plain 1938 SEED stepped DAYS, the director on, the game running at the speed
// as loaded. Each act in turn (the director switched on again before each, 6 s to settle): the wheel, a drag on the map,
// a camera key, and the page's own flights: a ticker row clicked, a war banner clicked, a History row's link clicked.
// After each: is the director still on, did it cut (fly elsewhere) within 9 s, and how far is the camera then from where
// the act put it (CSS px at the act's zoom)?
// Usage: [BASE=...] node critic/scripts/c85_dirHand.mjs <seed> <days> [W H touch]
import { launch, open1938, shot, save, hours } from './c85_lib.mjs';
const seed = Number(process.argv[2] ?? 59955), DAYS = Number(process.argv[3] ?? 120), W = Number(process.argv[4] ?? 1600), H = Number(process.argv[5] ?? 900), TOUCH = process.argv[6] === 'touch';
const out = { seed, DAYS, W, H, TOUCH, acts: [] };
const { browser, page, errors } = await launch(W, H);
const P = `c85dh_${seed}_${W}x${H}`;
const st = () => page.evaluate(() => { const w = window.__warsim, c = w.view.controller.cam; return { on: w.hud.director.on.value, cuts: w.hud.director.cuts.length, cam: [c.cx, c.cy, c.scale], paused: w.hud.paused.value }; });
async function directorOn() {
  const on = await page.evaluate(() => window.__warsim.hud.director.on.value);
  if (!on) await page.getByTestId('director-btn').click();
  if (await page.evaluate(() => window.__warsim.hud.paused.value)) await page.evaluate(() => window.__warsim.hud.togglePause());
  await page.waitForTimeout(6000);
}
async function act(name, fn) {
  await directorOn();
  const before = await st();
  let note = null;
  try { note = await fn(); } catch (e) { note = `act failed: ${String(e).slice(0, 120)}`; }
  await page.waitForTimeout(1500);
  const after = await st();
  await page.waitForTimeout(9000);
  const later = await st();
  const movedPx = Math.hypot(later.cam[0] - after.cam[0], later.cam[1] - after.cam[1]) * after.cam[2];
  const r = { name, note, onBefore: before.on, onAfter: after.on, onLater: later.on, cutsAfterAct: later.cuts - after.cuts, cameraMovedPx: Math.round(movedPx) };
  r.shot = await shot(page, `${P}_${name}.png`);
  out.acts.push(r);
  console.log(JSON.stringify(r));
}
try {
  await open1938(page, seed, '&heroes=on');
  await hours(page, DAYS * 24);
  await page.waitForTimeout(800);
  await act('wheel', async () => { await page.mouse.move(W / 2, H / 2); await page.mouse.wheel(0, -300); });
  await act('drag', async () => { if (TOUCH) { const c = await page.context().newCDPSession(page); await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: W / 2, y: H / 2 }] }); for (let i = 1; i <= 8; i++) await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: W / 2 + i * 10, y: H / 2 }] }); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return 'touch'; } await page.mouse.move(W / 2, H / 2); await page.mouse.down(); await page.mouse.move(W / 2 + 80, H / 2 + 10, { steps: 8 }); await page.mouse.up(); });
  await act('key', async () => { await page.mouse.move(W / 2, H / 3); await page.keyboard.press('ArrowLeft'); });
  await act('ticker', async () => { const r = page.locator('[data-testid=ticker-row]').first(); const t = await r.innerText(); await r.click(); return t.slice(0, 80); });
  await act('banner', async () => { const b = page.locator('[data-testid=war-banner]').first(); const t = await b.innerText(); await b.click(); return t.replace(/\s+/g, ' ').slice(0, 80); });
  await act('history', async () => {
    await page.evaluate(() => { if (!window.__warsim.hud.showHistory.value) window.__warsim.hud.toggleHistory(); });
    await page.waitForSelector('[data-testid=history-go]', { timeout: 30_000 });
    const g = page.locator('[data-testid=history-go]').first(); const t = await g.innerText(); await g.click(); return t.slice(0, 80);
  });
} catch (e) { out.error = String(e).slice(0, 300); }
out.errors = errors;
save(`${P}.json`, out);
await browser.close();
