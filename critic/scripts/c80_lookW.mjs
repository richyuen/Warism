// Critic run 80: c80_look with the count of console errors and warnings after each shot (marks), to place a warning.
// Critic run 73 (new): the game as Batches 32-38 leave it, as a player meets it. A fresh browser at the title, the
// 1938 card, Start: the first cue (R113), the top's plate (R94c), the closed ranking (R94a) and the news (R94b);
// then the game at Max, stopped at each of DAYS: the player's own view, the world, Europe, and one front of each of
// two nations fighting at 1,200 / 600 / 250 / 100 / 30 m/px (arrows R89, R106; the fronts' glow R90a, R99; occupied
// bands R107; counters R93, R95, R108, R109, R112; tags R101, R114), the banners' row and its "+n" (R110, R115), the
// legend's "?" (R111), the settings panel (R116). Then the title again: no second cue.
// Usage: node critic/scripts/c80_look.mjs <seed> <W> <H> <days,comma> [tag]
import { launch, save, shot, settle, lookAt, BASE } from './c80_lib.mjs';
const seed = Number(process.argv[2] ?? 56901);
const W = Number(process.argv[3] ?? 1600), H = Number(process.argv[4] ?? 900);
const stops = (process.argv[5] ?? '45,180,400').split(',').map(Number);
const tag = `${process.argv[6] ?? 'look'}_${seed}_${W}x${H}`;
const out = { seed, W, H, stops: [] };
const { browser, page, errors } = await launch(W, H);
const marks = []; const S = async (name) => { const r = await shot(page, `c80w${tag}_${name}.png`); marks.push([name, errors.length]); return r; };
const txt = (id) => page.getByTestId(id).first().innerText({ timeout: 1500 }).catch(() => null);
const count = (id) => page.getByTestId(id).count();
const chrome = () => page.evaluate(() => {
  const r = (sel) => [...document.querySelectorAll(sel)].map((e) => { const b = e.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), text: (e.innerText ?? '').slice(0, 160), title: e.getAttribute('title') }; });
  return { banners: r('[data-testid=war-banner]'), more: r('[data-testid=war-more]'), ticker: r('[data-testid=ticker-row]'), tickerMore: r('[data-testid=ticker-more]'), clock: r('[data-testid=topclock]'), topbar: r('[data-testid=topbar]'), ranking: r('[data-testid=stats-ranking]'), rankToggle: r('[data-testid=ranking-toggle]'), legend: r('[data-testid=map-legend]'), cue: r('[data-testid=first-cue]'), bottom: r('[data-testid=bottombar]') };
});
try {
  await page.goto(`${BASE}/`);
  await page.getByTestId('title-screen').waitFor();
  await page.waitForTimeout(1200);
  await S('0title');
  await page.getByTestId('title-scenario-1938').click();
  await page.waitForTimeout(600);
  await page.getByTestId('settings-seed').fill(String(seed));
  await S('1form');
  await page.getByTestId('settings-new-game').click();
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 240_000 });
  await page.waitForFunction(() => !document.querySelector('[data-testid=world-building]'), null, { timeout: 120_000 }).catch(() => {});
  await page.waitForTimeout(1500);
  out.url = page.url();
  out.start = await chrome();
  out.cueText = await txt('first-cue');
  await S('2start');
  // The cue takes no pointer but its button: a click on the map through its text selects a nation?
  // Resume by the player's own button.
  await page.getByTestId('pause-btn').click();
  await page.waitForTimeout(800);
  out.cueAfterResume = await count('first-cue');
  out.cueSeen = await page.evaluate(() => localStorage.getItem('warsim.cueSeen'));
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  await page.evaluate(() => window.__warsim.hud.setSpeedLevel(99));
  const tick0 = await page.evaluate(() => window.__warsim.hud.tick.value);
  for (const d of stops) {
    await page.evaluate(() => { if (window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
    await page.waitForFunction((t) => window.__warsim.hud.tick.value >= t, tick0 + d * 24, { timeout: 1_800_000, polling: 250 });
    await page.evaluate(() => { if (!window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
    await page.waitForTimeout(1500);
    const st = { day: d, date: await txt('date-label'), shots: [] };
    st.chrome = await chrome();
    st.shots.push(await S(`d${d}_0asleft`));
    // The world and Europe.
    await lookAt(page, 1080, 300, 14000); st.shots.push(await S(`d${d}_1world14000`));
    await lookAt(page, 1080, 290, 6000); st.shots.push(await S(`d${d}_2eur6000`));
    await lookAt(page, 1090, 285, 3000); st.shots.push(await S(`d${d}_3eur3000`));
    await lookAt(page, 1760, 370, 3000); st.shots.push(await S(`d${d}_3asia3000`));
    // Two nations with a formation in contact, the largest armies first.
    const fronts = await page.evaluate(() => {
      const v = window.__warsim.view;
      const res = [];
      const s = window.__warsim.hud.stats.value;
      const n = (s?.nations?.length ?? 120);
      for (let i = 1; i <= 200 && res.length < 40; i++) {
        let fs; try { fs = v.formationsOf(i); } catch { break; }
        if (!fs || fs.length === 0) continue;
        const eng = fs.filter((f) => v.formationEngaged(f));
        if (eng.length === 0) continue;
        const p = v.formationPos(eng[Math.floor(eng.length / 2)]);
        res.push({ nation: i, forms: fs.length, engaged: eng.length, p });
      }
      res.sort((a, b) => b.engaged - a.engaged);
      return res.slice(0, 2);
    });
    st.fronts = fronts;
    let k = 0;
    for (const f of fronts) {
      if (!f.p) continue;
      for (const m of [1200, 600, 250, 100, 30]) {
        await lookAt(page, f.p[0], f.p[1], m);
        st.shots.push(await S(`d${d}_f${k}_${m}m`));
        if (m === 100) st[`tags${k}`] = await page.evaluate(() => { const v = window.__warsim.view; v.draw(); return (v.tagRects ?? []).length; });
      }
      k++;
    }
    // The chrome: "+n", the news, the ranking, the legend's "?", the settings.
    if (fronts[0]?.p) await lookAt(page, fronts[0].p[0], fronts[0].p[1], 1200);
    if (await count('war-more')) { await page.getByTestId('war-more').click(); await page.waitForTimeout(500); st.bannersOpen = (await chrome()).banners; st.shots.push(await S(`d${d}_c0more`)); await page.getByTestId('war-more').click().catch(() => {}); }
    if (await count('ticker-more')) { await page.getByTestId('ticker-more').click(); await page.waitForTimeout(500); st.tickerOpen = (await chrome()).ticker; st.shots.push(await S(`d${d}_c1news`)); await page.getByTestId('ticker-more').click().catch(() => {}); }
    if (await count('ranking-toggle')) { await page.getByTestId('ranking-toggle').click(); await page.waitForTimeout(500); st.shots.push(await S(`d${d}_c2ranking`)); await page.getByTestId('ranking-toggle').click().catch(() => {}); }
    if (await count('legend-signs')) { await page.getByTestId('legend-signs').click(); await page.waitForTimeout(400); st.legendText = await txt('legend-units'); st.shots.push(await S(`d${d}_c3legend`)); await lookAt(page, fronts[0]?.p?.[0] ?? 1090, fronts[0]?.p?.[1] ?? 285, 100); st.legendClose = await txt('legend-units'); st.shots.push(await S(`d${d}_c3legendClose`)); await page.getByTestId('legend-signs').click().catch(() => {}); }
    if (d === stops[0]) {
      await page.getByTestId('settings-btn').click().catch(() => {}); await page.waitForTimeout(600);
      st.shots.push(await S(`d${d}_c4settings`));
      st.settingsBox = await page.evaluate(() => { const e = document.querySelector('[data-testid=settings-panel]'); if (!e) return null; const b = e.getBoundingClientRect(); return { top: b.top, bottom: b.bottom, h: b.height, scrollH: e.scrollHeight, clientH: e.clientHeight, vh: window.innerHeight }; });
      await page.getByTestId('settings-close').click().catch(() => page.keyboard.press('Escape'));
      // A nation's panel (R111's "formations").
      await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), fronts[0]?.nation ?? 1);
      await page.waitForTimeout(700);
      st.army = await txt('stat-army');
      st.shots.push(await S(`d${d}_c5nation`));
      await lookAt(page, fronts[0]?.p?.[0] ?? 1090, fronts[0]?.p?.[1] ?? 285, 1200); st.shots.push(await S(`d${d}_c5nation1200`));
      await page.keyboard.press('Escape');
    }
    out.stops.push(st);
    save(`c80w_${tag}.json`, { ...out, errors, marks });
  }
  // The title again, a second game: no cue.
  await page.goto(`${BASE}/`);
  await page.getByTestId('title-screen').waitFor();
  await page.getByTestId('title-scenario-1938').click();
  await page.waitForTimeout(600);
  await page.getByTestId('settings-seed').fill(String(seed + 2));
  await page.getByTestId('settings-new-game').click();
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 240_000 });
  await page.waitForTimeout(2500);
  out.cueSecondGame = await count('first-cue');
  await S('9second');
} catch (e) {
  out.error = String(e?.stack ?? e).slice(0, 1500);
  await S('error').catch(() => {});
}
out.errors = errors;
save(`c80w_${tag}.json`, { ...out, marks });
console.log(JSON.stringify({ url: out.url, cueText: out.cueText, cueAfterResume: out.cueAfterResume, cueSecondGame: out.cueSecondGame, stops: out.stops.map((s) => ({ day: s.day, date: s.date, fronts: s.fronts, banners: s.chrome.banners.length, more: s.chrome.more.map((m) => m.text), legend: s.legendText, legendClose: s.legendClose, army: s.army })), error: out.error, errors: errors.slice(0, 10) }, null, 1));
await browser.close();
