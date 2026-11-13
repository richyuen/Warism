// Critic run 61 (new): at a landscape phone size, after a landing order as England, is the nation panel's close (x)
// clickable, or does the landings bar lie over it? Boxes of both, the element at the x's centre, a shot.
// Usage: node critic/scripts/c67_x_closeblock.mjs <seed> <W> <H>
import { launch, open1938, shot, save, CELLS } from './c67_lib.mjs';
const [seedS, wS, hS] = process.argv.slice(2);
const W = +wS, H = +hS, seed = +seedS;
const out = { seed, W, H };
const { browser, page, errors } = await launch(W, H);
const boxes = () => page.evaluate(() => { const b = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; }; const x = document.querySelector('[data-testid=nation-close]'); let top = null; if (x) { const r = x.getBoundingClientRect(); const el = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2); top = el ? `${el.tagName}.${el.className} ${el.dataset?.testid ?? ''}` : null; } return { close: b('[data-testid=nation-close]'), panel: b('[data-testid=nation-panel]'), bar: b('[data-testid=landings-bar]'), atClose: top }; });
try {
  await open1938(page, seed);
  const NAT = CELLS.tags.ENG, FOE = CELLS.tags.GER;
  await page.evaluate(({ a, d }) => window.__warsim.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: NAT, d: FOE });
  await page.evaluate(() => window.__warsim.sim.step(1));
  await page.evaluate((n) => window.__warsim.view.select(n), NAT);
  await page.getByTestId('take-control').click();
  await page.getByTestId('release-control').waitFor({ timeout: 10000 });
  out.before = await boxes();
  const sel = await page.evaluate(({ n }) => { const v = window.__warsim.view; return v.formationsOf(n).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - 1023.5, v.formationPos(id)[1] - 275.5)]).sort((a, b) => a[1] - b[1]).slice(0, 4).map((d) => d[0]); }, { n: NAT });
  await page.evaluate(({ sel, n }) => window.__warsim.hud.commands(sel.map((id) => ({ kind: 'moveFormation', id, x: 1072.5, y: 259.5, nation: n }))), { sel, n: NAT });
  await page.evaluate(() => window.__warsim.sim.step(2));
  await page.waitForTimeout(800);
  out.after = await boxes();
  out.shot = await shot(page, `c67xcb_${seed}_${W}x${H}.png`);
  out.clickOk = await page.getByTestId('nation-close').click({ timeout: 3000 }).then(() => true, () => false);
  if (!out.clickOk) {
    // Other ways out a phone player has: a tap on the open sea beside the panel, then a tap on the bar's own toggle.
    await page.mouse.click(W - 60, Math.round(H * 0.45));
    await page.waitForTimeout(600);
    out.afterSeaTap = await boxes();
    out.seaTapShot = await shot(page, `c67xcb_${seed}_${W}x${H}_seatap.png`);
  }
} catch (e) { out.fail = String(e).slice(0, 300); }
finally { out.errors = errors; save(`c67_xcb_${seed}_${W}x${H}.json`, out); await browser.close(); console.log(JSON.stringify(out)); }
