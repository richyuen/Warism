// Critic run 24 (new), HV: the heroes as a player meets them. 1938, ?heroes=on, seed <seed>.
// 1) Each hero at four zooms (3000, 1200, 120, 25 m/px), both looks for the land and sea heroes of Germany.
// 2) Germany's Overview with its heroes block; a click on the Maus row: panel opened? camera on it? follows it 3 days?
// 3) A pan breaks the follow; Escape closes; a second row (Bismarck) is followed at sea.
// 4) Runs `days` days at speed, sampling the heroes' rows from the stats every 30 days; shot of a "returns in" row.
// Usage: node critic/scripts/c40_hv_heroview.mjs <seed> [days]
import { launch, open1938, shot, save, lookAt, hours } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 3739);
const days = Number(process.argv[3] ?? 360);
const out = { seed, zooms: [], panel: {}, follow: [], samples: [] };
const { browser, page, errors } = await launch();
const cam = () => page.evaluate(() => { const v = window.__warsim.view; const c = v.controller.cam; return { cx: c.cx, cy: c.cy, mpp: v.metresPerPx * c.scale }; });
const posOf = (id) => page.evaluate(async (id) => { const st = await window.__warsim.sim.inspect(true); const f = st.formations.find((g) => g.id === id); return f ? { x: f.x, y: f.y } : null; }, id);
try {
  await open1938(page, seed, '&heroes=on');
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  await hours(page, 2);
  const heroes = await page.evaluate(async () => {
    const w = window.__warsim; const v = w.view;
    const st = await w.sim.inspect(true);
    return v.heroFormations().map((id) => { const f = st.formations.find((g) => g.id === id); return { id, nation: f?.nation, x: f?.x, y: f?.y, name: v.formationName?.(id) ?? null, afloat: v.formationAfloat(id) }; });
  });
  out.heroes = heroes;
  // 1) zooms
  for (const h of heroes) {
    for (const m of [3000, 1200, 120, 25]) {
      await lookAt(page, h.x, h.y, m);
      const p = await shot(page, `c40hv_${seed}_${h.id}_${m}m.png`);
      out.zooms.push({ id: h.id, name: h.name, m, shot: p });
    }
  }
  save(`c40_hv_${seed}.json`, { ...out, errors });
  // classic look on Germany's two
  const ger = heroes.filter((h) => h.nation === 1);
  await page.evaluate(() => { window.__warsim.view.unitLook = 'classic'; });
  for (const h of ger) for (const m of [1200, 120, 25]) { await lookAt(page, h.x, h.y, m); out.zooms.push({ id: h.id, m, look: 'classic', shot: await shot(page, `c40hv_${seed}_${h.id}_${m}m_classic.png`) }); }
  await page.evaluate(() => { window.__warsim.view.unitLook = 'balls'; });
  // 2) Germany's Overview
  await lookAt(page, 1050, 270, 3000);
  await page.evaluate(() => window.__warsim.hud.onSelectNation(1));
  await page.waitForTimeout(800);
  out.panel.block = await page.evaluate(() => { const b = document.querySelector('[data-testid="panel-heroes"]'); return b ? { text: b.innerText, buttons: [...b.querySelectorAll('button')].map((x) => ({ t: x.innerText, dis: x.disabled })) } : null; });
  out.panel.shot = await shot(page, `c40hv_${seed}_ger_overview.png`);
  const maus = ger.find((h) => !h.afloat) ?? ger[1];
  const bism = ger.find((h) => h.afloat) ?? ger[0];
  // click the land hero's row
  const btns = await page.$$('[data-testid="panel-heroes"] button');
  const mausBtn = btns.find(async () => true);
  if (btns.length >= 2) {
    const texts = await Promise.all(btns.map((b) => b.innerText()));
    const iM = texts.findIndex((t) => /maus/i.test(t));
    await btns[iM >= 0 ? iM : 1].click();
    await page.waitForTimeout(1500);
    const c = await cam(); const p = await posOf(maus.id);
    out.follow.push({ what: 'after click Maus row', cam: c, hero: p, d: p ? Math.hypot(c.cx - p.x, c.cy - p.y) : null, panelTitle: await page.evaluate(() => document.querySelector('.panel h2, .panel-title, [data-testid="panel-title"]')?.textContent ?? null), shot: await shot(page, `c40hv_${seed}_maus_click.png`) });
    for (const d of [1, 3]) {
      await hours(page, 24 * (d === 1 ? 1 : 2));
      await page.waitForTimeout(600);
      const c2 = await cam(); const p2 = await posOf(maus.id);
      out.follow.push({ what: `day +${d}`, cam: c2, hero: p2, d: p2 ? Math.hypot(c2.cx - p2.x, c2.cy - p2.y) : null, shot: await shot(page, `c40hv_${seed}_maus_follow_d${d}.png`) });
    }
    // pan breaks the follow
    await page.mouse.move(800, 450); await page.mouse.down(); await page.mouse.move(600, 350, { steps: 8 }); await page.mouse.up();
    await page.waitForTimeout(300);
    const cA = await cam(); await hours(page, 24); await page.waitForTimeout(500); const cB = await cam();
    out.follow.push({ what: 'pan then a day', moved: Math.hypot(cA.cx - cB.cx, cA.cy - cB.cy), cA, cB });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }
  // Bismarck from its row
  await page.evaluate(() => window.__warsim.hud.onSelectNation(1));
  await page.waitForTimeout(600);
  const btns2 = await page.$$('[data-testid="panel-heroes"] button');
  if (btns2.length) {
    const texts = await Promise.all(btns2.map((b) => b.innerText()));
    const iB = texts.findIndex((t) => /bismarck/i.test(t));
    await btns2[iB >= 0 ? iB : 0].click();
    await page.waitForTimeout(1500);
    const c = await cam(); const p = await posOf(bism.id);
    out.follow.push({ what: 'after click Bismarck row', cam: c, hero: p, d: p ? Math.hypot(c.cx - p.x, c.cy - p.y) : null, shot: await shot(page, `c40hv_${seed}_bismarck_click.png`) });
  }
  await page.keyboard.press('Escape');
  save(`c40_hv_${seed}.json`, { ...out, errors });
  // 4) run, sample the rows
  for (let d = 30; d <= days; d += 30) {
    await hours(page, 24 * 30);
    const s = await page.evaluate(() => {
      const st = window.__warsim.hud.stats.value;
      return { date: String(window.__warsim.hud.date?.() ?? ''), rows: st.nations.filter((n) => n.heroes?.length).flatMap((n) => n.heroes.map((h) => [n.name, h.nameKey.replace('template.hero_', ''), h.formation, Math.round(h.health * 100) / 100, h.returnDays])) };
    });
    out.samples.push({ d, ...s });
    const gone = s.rows.find((r) => r[2] === 0);
    if (gone && !out.goneShot) {
      const nat = await page.evaluate((nm) => window.__warsim.hud.stats.value.nations.find((n) => n.name === nm)?.id, gone[0]);
      await page.evaluate((id) => window.__warsim.hud.onSelectNation(id), nat);
      await page.waitForTimeout(700);
      out.goneShot = { row: gone, text: await page.evaluate(() => document.querySelector('[data-testid="panel-heroes"]')?.innerText ?? null), shot: await shot(page, `c40hv_${seed}_gone_row.png`) };
      await page.keyboard.press('Escape');
    }
    save(`c40_hv_${seed}.json`, { ...out, errors });
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c40_hv_${seed}.json`, out);
await browser.close();
console.log(JSON.stringify({ follow: out.follow.map((f) => [f.what, f.d, f.moved]), panel: out.panel.block, fatal: out.fatal, samples: out.samples.length }));
