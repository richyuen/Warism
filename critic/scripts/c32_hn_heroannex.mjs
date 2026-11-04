// Critic run 29 (R5a, heroes), HN: a hero whose nation is annexed (God's Annex, as the God tab's button sends it).
// 1938 ?heroes=on, seed <seed>: Germany annexes France on day 2. Then: France's heroes (Richelieu, Char 2C) on the map
// (nation, flag, name), Germany's Heroes block, a click on Char 2C's panel; 60 days on: the AI uses them? Then the
// Char 2C is destroyed (God's remove, the command): does it come back (France dead), and where is it listed?
// Usage: node critic/scripts/c32_hn_heroannex.mjs <seed>
import { launch, open1938, shot, save, lookAt, hours, CELLS } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 4111);
const T = CELLS.tags;
const out = { seed, steps: [] };
const L = `c32hn_${seed}`;
const { browser, page, errors } = await launch();
const heroesAll = () => page.evaluate(async () => {
  const w = window.__warsim; const v = w.view; const ins = await w.sim.inspect(true);
  return v.heroFormations().map((id) => { const f = ins.formations.find((g) => g.id === id); return { id, name: v.formationName?.(id) ?? null, nation: f?.nation, x: f?.x, y: f?.y }; });
});
const blockOf = async (n) => { await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), n); await page.waitForTimeout(700); return page.evaluate(() => document.querySelector('[data-testid="panel-heroes"]')?.innerText.replace(/\n/g, ' | ') ?? null); };
const statsHeroes = () => page.evaluate(() => window.__warsim.hud.stats.value.nations.filter((n) => n.heroes?.length).map((n) => [n.name, n.heroes.map((h) => [h.nameKey.replace('template.hero_', ''), h.formation, h.returnDays])]));
try {
  await open1938(page, seed, '&heroes=on');
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  await hours(page, 48);
  out.T = { GER: T.GER, FRA: T.FRA };
  out.before = { heroes: await heroesAll(), stats: await statsHeroes() };
  const r = await page.evaluate(({ a, t }) => window.__warsim.hud.command({ kind: 'annexNation', annexer: a, target: t }), { a: T.GER, t: T.FRA });
  out.cmdResult = r ?? null;
  await hours(page, 2);
  const hs = await heroesAll();
  out.after = { heroes: hs, stats: await statsHeroes(), gerBlock: await blockOf(T.GER), fraLiving: await page.evaluate((f) => !!window.__warsim.hud.stats.value.nations.find((n) => n.id === f), T.FRA) };
  out.after.gerShot = await shot(page, `${L}_ger_block.png`);
  const frIds = out.before.heroes.filter((h) => h.nation === T.FRA).map((h) => h.id); out.frIds = frIds;
  const fr = hs.filter((h) => frIds.includes(h.id)).map((h) => ({ ...h, name: `f${h.id}` }));
  for (const h of fr) {
    await lookAt(page, h.x, h.y, 1200);
    const sp = await page.evaluate(({ x, y }) => { const v = window.__warsim.view; const c = v.controller.cam; return [(x - c.cx) * c.scale + innerWidth / 2, (y - c.cy) * c.scale + innerHeight / 2]; }, h);
    await page.mouse.click(sp[0], sp[1]); await page.waitForTimeout(900);
    out.steps.push({ hero: h.name, panel: await page.evaluate(() => { const p = [...document.querySelectorAll('aside, .panel')].map((e) => e.innerText).find((t) => /Kind/.test(t)); return p ? p.replace(/\n/g, ' | ').slice(0, 400) : null; }), shot: await shot(page, `${L}_${(h.name ?? 'x').replace(/\W/g, '')}.png`) });
    await page.keyboard.press('Escape');
  }
  save(`c32_hn_${seed}.json`, { ...out, errors });
  // 60 days on: where are they?
  await hours(page, 24 * 60);
  out.d60 = { heroes: await heroesAll(), stats: await statsHeroes() };
  // God removes the Char 2C: does it return? (France is dead.)
  const c2 = out.d60.heroes.find((h) => h.id === out.frIds[1]);
  if (c2) {
    out.removed = await page.evaluate((id) => window.__warsim.hud.command({ kind: 'removeFormation', id }), c2.id) ?? null;
    await hours(page, 24 * 62);
    out.d122 = { heroes: await heroesAll(), stats: await statsHeroes(), gerBlock: await blockOf(T.GER) };
    out.d122.gerShot = await shot(page, `${L}_ger_block_d122.png`);
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c32_hn_${seed}.json`, out);
await browser.close();
console.log(JSON.stringify({ after: out.after?.stats, gerBlock: out.after?.gerBlock, steps: out.steps.map((s) => s.panel), d60: out.d60?.heroes?.filter((h) => out.frIds.includes(h.id)), d122: out.d122, fatal: out.fatal }).slice(0, 3000));
