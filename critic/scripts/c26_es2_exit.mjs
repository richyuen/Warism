// Critic run 25 (new), ES2 (from ES): the losing side's exit. Germany declares on Poland (played, then control
// passed to Poland); every 10 days Poland's menu on Germany is read until "Offer peace" is refused (greyed); then Poland
// declares (or forces) war on France, its partner in that war; then "Declare war" on Germany again at once.
// Was ES: a played nation leaves a war it is losing by force-declaring on its ally (PLAN 7.188's
// leaveWarsWhere reached from the player's menu). Play Germany, declare on Poland (menu), 60 days, read the menu's
// "Offer peace" on Poland (accepted or not), then "Force war" on Italy: Germany's wars, the land held both ways,
// the ticker, banners, Poland's panel and the history rows. Same script on both builds (port arg).
// Usage: node critic/scripts/c26_es2_exit.mjs <seed> [port] [tag] [minDay]
import { launch, shot, save, hours, CELLS } from './c26_lib.mjs';

const seed = Number(process.argv[2] ?? 7019);
const port = Number(process.argv[3] ?? 5297);
const tg = process.argv[4] ?? 'head';
const minDay = Number(process.argv[5] ?? 10);
const BASE = `http://127.0.0.1:${port}`;
const T = CELLS.tags;
const out = { seed, port, tg, steps: [] };
const { browser, page, errors } = await launch(1400, 800);
const ins = () => page.evaluate(() => window.__warsim.sim.inspect());
const name = (n) => page.evaluate((n) => window.__warsim.view.nationName(n), n);
const ticker = () => page.evaluate(() => document.querySelector('[data-testid=ticker]')?.innerText ?? '');
const banners = () => page.evaluate(() => [...document.querySelectorAll('.war-banner, [data-testid^=war-banner]')].map((b) => b.innerText.replace(/\n/g, ' ')).slice(0, 8));
async function groundOf(nation) {
  const fs = await page.evaluate((n) => window.__warsim.view.formationsOf(n), nation);
  let at = await page.evaluate((n) => { const c = window.__warsim.view.capitals.get(n); return c ? [c[0] ?? c.x, c[1] ?? c.y] : null; }, nation);
  if (!at && fs.length) at = await page.evaluate((f) => window.__warsim.view.formationPos(f), fs[0]);
  await page.evaluate(([x, y]) => window.__warsim.view.controller.set({ cx: x, cy: y, scale: 6 }), at);
  await page.waitForTimeout(400);
  return page.evaluate((n) => {
    const v = window.__warsim.view; const [w, h] = [innerWidth, innerHeight];
    for (let r = 0; r < Math.min(w, h) / 2; r += 12) for (let k = 0; k < 16; k++) {
      const x = Math.round(w / 2 + r * Math.cos((k * Math.PI) / 8)); const y = Math.round(h / 2 + r * Math.sin((k * Math.PI) / 8));
      if (v.nationAt(x, y) === n && v.nationAt(x + 8, y) === n && v.nationAt(x, y + 8) === n) return [x, y];
    }
    return null;
  }, nation);
}
async function menuOn(n) {
  const p = await groundOf(n);
  if (!p) return { err: 'no ground' };
  await page.mouse.click(p[0], p[1], { button: 'right' });
  await page.waitForTimeout(400);
  const m = page.getByTestId('nation-menu');
  const peace = page.getByTestId('nation-menu-peace');
  return {
    name: await page.getByTestId('nation-menu-name').innerText().catch(() => null),
    standing: await page.getByTestId('nation-menu-standing').innerText().catch(() => null),
    items: await m.getByRole('menuitem').allInnerTexts().catch(() => []),
    peaceDisabled: (await peace.count()) ? await peace.isDisabled() : null,
    peaceTitle: (await peace.count()) ? await peace.getAttribute('title') : null,
  };
}
const held = () => page.evaluate(async ([G, P]) => {
  const w = window.__warsim; const s = await w.sim.inspect();
  return { wars: s.wars.filter((x) => x.attackers.includes(G) || x.defenders.includes(G)).map((x) => ({ att: x.attackers, def: x.defenders })) };
}, [T.GER, T.POL]);
const statOf = (n) => page.evaluate((n) => { const s = window.__warsim.hud.stats.value.nations.find((x) => x.id === n); return s ? { cells: s.cells ?? s.land ?? null, occupied: s.occupied ?? s.held ?? null, wars: s.wars ?? s.atWar ?? null } : null; }, n);
async function polandView(tag2) {
  const c = await page.evaluate((n) => { const c = window.__warsim.view.capitals.get(n); return c ? [c[0] ?? c.x, c[1] ?? c.y] : null; }, T.POL);
  await page.evaluate(([x, y]) => { const v = window.__warsim.view; v.controller.set({ cx: x, cy: y, scale: (v.metresPerPx * v.controller.cam.scale) / 3000 }); }, c);
  await page.waitForTimeout(800);
  return shot(page, `c26es2_${tg}_${seed}_d${minDay}_${tag2}.png`);
}
async function step(k) {
  const s = { k, day: (await ins()).tick / 24, wars: [], ticker: await ticker(), banners: await banners() };
  for (const w of (await held()).wars) s.wars.push({ att: await Promise.all(w.att.map(name)), def: await Promise.all(w.def.map(name)) });
  s.ger = await statOf(T.GER); s.pol = await statOf(T.POL);
  out.steps.push(s);
  return s;
}
try {
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 120_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null && window.__warsim.sim.mapLayers !== null, null, { timeout: 120_000 });
  await hours(page, 24);
  await page.evaluate((n) => window.__warsim.view.select(n), T.GER);
  await page.waitForTimeout(300);
  await page.getByTestId('take-control').click();
  await page.evaluate(() => window.__warsim.view.select(0));
  await menuOn(T.POL);
  await page.getByTestId('nation-menu-war').click();
  await page.waitForTimeout(500);
  await hours(page, 2);
  await page.evaluate((n) => window.__warsim.view.select(n), T.POL);
  await page.waitForTimeout(400);
  await page.getByTestId('take-control').click();
  await page.waitForTimeout(300);
  await page.evaluate(() => window.__warsim.view.select(0));
  await step('Germany on Poland; playing Poland');
  out.reads = [];
  let refused = null;
  for (let d = 10; d <= 200; d += 10) {
    await hours(page, 240);
    const m = await menuOn(T.GER);
    await page.keyboard.press('Escape');
    const st = await statOf(T.POL);
    out.reads.push({ d, standing: m.standing, peaceDisabled: m.peaceDisabled, peaceTitle: m.peaceTitle, items: m.items });
    if (m.standing !== 'At war') break;
    if (m.peaceDisabled && d >= minDay) { refused = d; break; }
  }
  out.refusedAt = refused;
  if (refused) {
    await step('peace refused');
    out.shotBefore = await polandView(`es2_d${refused}_before`);
    const mg = await menuOn(T.GER);
    out.menuGerBefore = mg;
    out.shotGerMenu = await shot(page, `c26es2_${tg}_${seed}_d${minDay}_germenu_refused.png`);
    await page.keyboard.press('Escape');
    out.menuFra = await menuOn(T.FRA);
    out.shotFraMenu = await shot(page, `c26es2_${tg}_${seed}_d${minDay}_framenu.png`);
    await page.getByTestId('nation-menu-war').click();
    await page.waitForTimeout(500);
    await hours(page, 2);
    await step('2 h after war on France');
    out.shotAfter = await polandView(`es2_d${refused}_after`);
    out.menuGerAfter = await menuOn(T.GER);
    out.shotGerMenuAfter = await shot(page, `c26es2_${tg}_${seed}_d${minDay}_germenu_after.png`);
    if (out.menuGerAfter.standing !== 'At war' && (await page.getByTestId('nation-menu-war').count())) {
      await page.getByTestId('nation-menu-war').click();
      await page.waitForTimeout(500);
      await hours(page, 2);
      await step('2 h after declaring on Germany again');
      out.shotRedeclare = await polandView(`es2_d${refused}_redeclared`);
    } else await page.keyboard.press('Escape');
    await page.evaluate(() => window.__warsim.view.select(0));
    await page.keyboard.press('h').catch(() => {});
  }
} catch (e) {
  out.error = String(e?.stack ?? e);
} finally {
  out.errors = errors.slice(0, 20);
  save(`c26_es2_${tg}_${seed}_d${minDay}.json`, out);
  await browser.close();
}
console.log('done:', JSON.stringify(out.steps.map((s) => ({ k: s.k, day: s.day, wars: s.wars.length, heldGP: s.heldGP }))));
