// Critic run 25 (new), ES: a played nation leaves a war it is losing by force-declaring on its ally (PLAN 7.188's
// leaveWarsWhere reached from the player's menu). Play Germany, declare on Poland (menu), 60 days, read the menu's
// "Offer peace" on Poland (accepted or not), then "Force war" on Italy: Germany's wars, the land held both ways,
// the ticker, banners, Poland's panel and the history rows. Same script on both builds (port arg).
// Usage: node critic/scripts/c32_es_escape.mjs <seed> [port] [tag]
import { launch, shot, save, hours, CELLS } from './c31_lib.mjs';

const seed = Number(process.argv[2] ?? 7019);
const port = Number(process.argv[3] ?? 5299);
const tg = process.argv[4] ?? 'head';
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
  return shot(page, `c32es_${tg}_${seed}_${tag2}.png`);
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
  out.menuPolBefore = await menuOn(T.POL);
  await page.getByTestId('nation-menu-war').click();
  await page.waitForTimeout(500);
  await hours(page, 2);
  await step('declared on Poland');
  await hours(page, 24 * 60);
  await step('day 60 of the Polish war');
  out.shotBefore = await polandView('d61_before');
  out.menuPolAt60 = await menuOn(T.POL);
  out.shotPeaceMenu = await shot(page, `c32es_${tg}_${seed}_d61_polmenu.png`);
  await page.keyboard.press('Escape');
  out.menuIta = await menuOn(T.ITA);
  out.shotItaMenu = await shot(page, `c32es_${tg}_${seed}_d61_itamenu.png`);
  await page.getByTestId('nation-menu-war').click();
  await page.waitForTimeout(500);
  await hours(page, 2);
  await step('2 h after Force war on Italy');
  out.shotAfter = await polandView('d61_after');
  out.menuPolAfter = await menuOn(T.POL);
  out.shotPolMenuAfter = await shot(page, `c32es_${tg}_${seed}_d61_polmenu_after.png`);
  await page.keyboard.press('Escape');
  await page.evaluate((n) => window.__warsim.view.select(n), T.POL);
  await page.waitForTimeout(600);
  out.shotPolPanel = await shot(page, `c32es_${tg}_${seed}_d61_polpanel_after.png`);
  out.polPanel = await page.evaluate(() => document.querySelector('[data-testid="nation-panel"], .panel')?.innerText?.slice(0, 1200) ?? null);
} catch (e) {
  out.error = String(e?.stack ?? e);
} finally {
  out.errors = errors.slice(0, 20);
  save(`c32_es_${tg}_${seed}.json`, out);
  await browser.close();
}
console.log('done:', JSON.stringify(out.steps.map((s) => ({ k: s.k, day: s.day, wars: s.wars.length, heldGP: s.heldGP }))));
