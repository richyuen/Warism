// Critic run 72 (new): the default game as a player starts it from the title (R86f, ADR-1070: heroes on; Countryball the
// unit look, ADR-777). A fresh browser (no saved settings): the title, the 1938 card's form (heroes select), Start, the
// URL, the heroes on the map and the unit look; then the game run at Max for DAYS days, the heroes counted each 30 days
// and shot at their place; the settings panel's heroes choice in the running game.
// Usage: node critic/scripts/c74_title2.mjs <seed> <days> [W H] [replay year for a free start | -]
import { launch, save, shot, settle, BASE } from './c74_lib.mjs';
const seed = Number(process.argv[2] ?? 55201);
const days = Number(process.argv[3] ?? 365);
const W = Number(process.argv[4] ?? 1600), H = Number(process.argv[5] ?? 900);
const freeYear = process.argv[6] && process.argv[6] !== '-' ? Number(process.argv[6]) : 0;
const tag = `${freeYear ? `free${freeYear}` : '1938'}_${seed}_${W}x${H}`;
const out = { seed, days, W, H, freeYear, samples: [] };
const { browser, page, errors } = await launch(W, H);
const heroes = () => page.evaluate(() => {
  const v = window.__warsim.view;
  const ids = v.heroFormations();
  const s = window.__warsim.hud.stats.value;
  return { n: ids.length, ids };
});
try {
  await page.goto(`${BASE}/`);
  await page.getByTestId('title-screen').waitFor();
  await page.waitForTimeout(1500);
  out.shotTitle = await shot(page, `c74t2_${tag}_0title.png`);
  await page.getByTestId('title-scenario-1938').click();
  await page.waitForTimeout(800);
  if (freeYear) {
    const slider = page.getByTestId('title-start-year');
    await slider.evaluate((e, y) => { e.value = String(y); e.dispatchEvent(new Event('input', { bubbles: true })); }, freeYear);
    await page.waitForTimeout(300);
    await page.getByTestId('title-mode-free').click();
    await page.waitForTimeout(500);
  }
  out.heroesSelect = await page.getByTestId('opt-heroes').inputValue().catch(() => null);
  out.heroesHint = await page.getByTestId('opt-heroes-hint').innerText().catch(() => null);
  out.formText = await page.locator('[data-testid=title-screen]').innerText().catch(() => null);
  await page.getByTestId('settings-seed').fill(String(seed));
  out.shotForm = await shot(page, `c74t2_${tag}_1form.png`);
  const t0 = Date.now();
  await page.getByTestId('settings-new-game').click();
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 240_000 });
  await page.waitForFunction(() => !document.querySelector('[data-testid=world-building]'), null, { timeout: 120_000 }).catch(() => {});
  out.msToWorld = Date.now() - t0;
  out.url = page.url();
  out.unitLook = await page.evaluate(() => ({ view: window.__warsim.view.unitLook, setting: window.__warsim.settings?.unitLook?.value ?? null, stored: (() => { try { return localStorage.getItem('warsim.unitLook'); } catch { return 'err'; } })() }));
  out.heroes0 = await heroes();
  await page.waitForTimeout(800);
  out.shot0 = await shot(page, `c74t2_${tag}_2start.png`);
  // Europe at 3,000 m/px and then the first hero at 400 m/px.
  const first = out.heroes0.ids[0];
  if (first !== undefined) {
    const at = await page.evaluate((id) => { const i = window.__warsim.view; return i.formationPos?.(id) ?? null; }, first).catch(() => null);
    out.firstHeroPos = at;
  }
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  await page.evaluate(() => window.__warsim.hud.setSpeedLevel(99));
  await page.evaluate(() => { if (window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
  const tick0 = await page.evaluate(() => window.__warsim.hud.tick.value);
  for (let d = 30; d <= days; d += 30) {
    await page.waitForFunction((t) => window.__warsim.hud.tick.value >= t, tick0 + d * 24, { timeout: 900_000, polling: 250 });
    const h = await heroes();
    const s = await page.evaluate(() => ({ date: document.querySelector('[data-testid=date-label]')?.textContent ?? null, banners: [...document.querySelectorAll('[data-testid=war-banner]')].length, ticker: [...document.querySelectorAll('[data-testid=ticker-row]')].slice(0, 3).map((e) => e.textContent) }));
    out.samples.push({ day: d, heroes: h.n, ...s });
    if (d % 180 === 0) out[`shot${d}`] = await shot(page, `c74t2_${tag}_3d${d}.png`);
  }
  await page.evaluate(() => { if (!window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
  // The settings panel of the running game.
  await page.getByTestId('settings-btn').click().catch(() => {});
  await page.waitForTimeout(600);
  out.panelHeroes = await page.getByTestId('opt-heroes').inputValue().catch(() => null);
  out.shotPanel = await shot(page, `c74t2_${tag}_4panel.png`);
} catch (e) { out.fatal = String(e?.stack ?? e); out.shotFatal = await shot(page, `c74t2_${tag}_fatal.png`).catch(() => null); out.urlFatal = page.url(); }
out.errors = errors;
save(`c74_t2_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify({ heroesSelect: out.heroesSelect, url: out.url, unitLook: out.unitLook, heroes0: out.heroes0?.n, samples: out.samples.map((s) => `${s.day}:${s.heroes}`).join(' '), panel: out.panelHeroes, errors: errors.length, fatal: out.fatal }));
