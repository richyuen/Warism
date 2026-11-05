// Critic run 29 (R5a, heroes), HW: what a wounded hero reads as. 1938 ?heroes=on, seed <seed>, to tick <tick>: the
// nation's Heroes block (health), then a click on the hero's row: its formation panel (men, status...), its map tag,
// at 250 and 1200 m/px; and the same panel for a regular formation of the same kind next to it, for comparison.
// Usage: node critic/scripts/c36_hw_herowound.mjs <seed> <tick> <nationId> <heroRe> <tag>
import { launch, open1938, shot, save, lookAt, hours } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 4111), tick = Number(process.argv[3] ?? 2454), nation = Number(process.argv[4] ?? 1);
const re = process.argv[5] ?? 'bismarck', tg = process.argv[6] ?? 'bis';
const out = { seed, tick, nation, re };
const L = `c36hw_${seed}_${tg}`;
const { browser, page, errors } = await launch();
try {
  await open1938(page, seed, '&heroes=on');
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  await hours(page, tick);
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), nation);
  await page.waitForTimeout(800);
  out.block = await page.evaluate(() => document.querySelector('[data-testid="panel-heroes"]')?.innerText.replace(/\n/g, ' | ') ?? null);
  const btns = await page.$$('[data-testid="panel-heroes"] button');
  const texts = await Promise.all(btns.map((b) => b.innerText()));
  const i = texts.findIndex((t) => new RegExp(re, 'i').test(t.replace(/\s/g, '')));
  out.rows = texts;
  if (i >= 0) {
    await btns[i].click();
    await page.waitForTimeout(1500);
    out.panel = await page.evaluate(() => { const p = [...document.querySelectorAll('aside, .panel')].map((e) => e.innerText).find((t) => /Kind/.test(t)); return p ? p.replace(/\n/g, ' | ').slice(0, 800) : null; });
    out.shotPanel = await shot(page, `${L}_panel.png`);
    const hero = await page.evaluate(async (nation) => { const w = window.__warsim; const n = w.hud.stats.value.nations.find((x) => x.id === nation); return n.heroes; }, nation);
    out.heroStats = hero;
    const h = hero.find((x) => new RegExp(re, 'i').test(x.nameKey));
    const pos = await page.evaluate((id) => window.__warsim.view.formationPos(id), h.formation);
    for (const m of [3000, 1200, 250, 60]) { await lookAt(page, pos[0], pos[1], m); out[`shot${m}`] = await shot(page, `${L}_${m}m.png`); }
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c36_hw_${seed}_${tg}.json`, out);
await browser.close();
console.log(JSON.stringify({ block: out.block, panel: out.panel, fatal: out.fatal }));
