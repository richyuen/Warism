// Critic run 28 (new), PG2: a played game, not a watched one. Take control of <TAG> on a new seed, declare war on
// <TARGET> from the Actions tab, then let the game run at Max in real time for <months> months, as a player would.
// Each month: the date, the player's area and men, its wars (panel), the ticker's last rows, the war banners. Every
// third month: a shot over the player's capital at 3000 m/px and the nation panel. Each 4th month at war: offer peace
// from the Actions tab (as a player tired of a war would) and say whether it ended. Also: propose an alliance to
// <ALLY> at month 2 and read the answer.
// Usage: node critic/scripts/c33_pg2_played.mjs <seed> <TAG> <TARGET> <ALLY> <months> <capitalKey>
import { launch, open1938, shot, save, lookAt, CELLS } from './c31_lib.mjs';
const [seed, TAG, TGT, ALLY, months, capKey] = [Number(process.argv[2] ?? 4583), process.argv[3] ?? 'ITA', process.argv[4] ?? 'YUG', process.argv[5] ?? 'GER', Number(process.argv[6] ?? 24), process.argv[7] ?? 'rome'];
const T = CELLS.tags;
const me = T[TAG];
const out = { seed, TAG, TGT, ALLY, months: [] };
const { browser, page, errors } = await launch(1600, 900);
const L = `c33pg2_${seed}_${TAG}`;
const tick = () => page.evaluate(() => window.__warsim.hud.tick.value);
const pauseNow = () => page.evaluate(() => { if (!window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
const runNow = () => page.evaluate(() => { if (window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
const ticker = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker] > *')].map((e) => e.innerText.replace(/\n/g, ' ')).slice(-6));
const panel = () => page.evaluate(() => document.querySelector('[data-testid=nation-panel]')?.innerText.slice(0, 1500) ?? null);
const stat = () => page.evaluate((me) => { const n = window.__warsim.hud.stats.value?.nations?.find((x) => x.id === me); return n ? { area: Math.round(n.area), men: n.men, formations: n.formations, gold: Math.round(n.gold), overlord: n.overlord, alliance: n.alliance?.name ?? null, wars: n.wars ?? n.enemies ?? null } : null; }, me);
async function openActions() {
  await page.evaluate((p) => window.__warsim.hud.onSelectNation(p), me);
  await page.waitForTimeout(400);
  const b = page.getByTestId('tab-actions');
  if (await b.count()) await b.click(); else { const a = page.locator('[data-testid=nation-panel] button', { hasText: /Actions/ }).first(); if (await a.count()) await a.click(); }
  await page.waitForTimeout(400);
}
async function pick(id) {
  const opts = await page.evaluate(() => [...document.querySelectorAll('[data-testid=act-target] option')].map((o) => [o.value, o.textContent]));
  const o = opts.find(([v]) => Number(v) === id);
  if (!o) return false;
  await page.selectOption('[data-testid=act-target]', o[0]);
  await page.waitForTimeout(300);
  return true;
}
const names = await (async () => ({}))();
try {
  await open1938(page, seed);
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  await page.evaluate((p) => window.__warsim.hud.onSelectNation(p), me);
  await page.waitForTimeout(600);
  await page.getByTestId('take-control').click();
  await page.waitForTimeout(600);
  await openActions();
  const nm = await page.evaluate(({ t, a }) => { const s = window.__warsim.hud.stats.value.nations; return { t: s.find((n) => n.id === t)?.name, a: s.find((n) => n.id === a)?.name }; }, { t: T[TGT], a: T[ALLY] });
  out.names = nm;
  out.picked = await pick(T[TGT]);
  out.standingBefore = await page.getByTestId('act-standing').innerText().catch(() => null);
  out.warButton = await page.getByTestId('act-war').evaluate((b) => ({ text: b.innerText, disabled: b.disabled, title: b.title })).catch((e) => String(e));
  await shot(page, `${L}_00_actions.png`);
  if (out.warButton && !out.warButton.disabled) await page.getByTestId('act-war').click();
  await page.waitForTimeout(600);
  await lookAt(page, CELLS[capKey][0], CELLS[capKey][1], 3000);
  await page.evaluate(() => window.__warsim.hud.setSpeedLevel(99));
  const t0 = await tick();
  for (let m = 1; m <= months; m++) {
    await runNow();
    await page.waitForFunction((t) => window.__warsim.hud.tick.value >= t, t0 + m * 730, { timeout: 600_000, polling: 200 });
    await pauseNow();
    const row = { m, date: await page.evaluate(() => document.querySelector('[data-testid=bottombar]')?.innerText.match(/\d+ \w+ \d{4}/)?.[0] ?? null), stat: await stat(), ticker: await ticker(), banners: await page.evaluate(() => [...document.querySelectorAll('[data-testid=war-banner]')].map((c) => c.innerText.replace(/\n/g, ' '))) };
    await openActions();
    row.peaceButtons = await page.locator('[data-testid^=act-peace-]').count();
    row.warRows = await page.evaluate(() => [...document.querySelectorAll('[data-testid=panel-actions] .god-war-name')].map((e) => e.innerText));
    if (m === 2) {
      out.allyPicked = await pick(T[ALLY]);
      out.allyStanding = await page.getByTestId('act-standing').innerText().catch(() => null);
      out.allyButton = await page.getByTestId('act-ally').evaluate((b) => ({ text: b.innerText, disabled: b.disabled, title: b.title })).catch((e) => String(e));
      if (out.allyButton && !out.allyButton.disabled) { await page.getByTestId('act-ally').click(); await page.waitForTimeout(500); await runNow(); await page.waitForTimeout(1500); await pauseNow(); out.allyTicker = await ticker(); out.allyAfter = await stat(); }
      await shot(page, `${L}_m02_ally.png`);
    }
    if (m % 4 === 0 && row.peaceButtons > 0) {
      await page.locator('[data-testid^=act-peace-]').first().click();
      await page.waitForTimeout(500);
      await runNow(); await page.waitForTimeout(2000); await pauseNow();
      row.peaceTicker = await ticker();
      row.peaceAfter = await page.locator('[data-testid^=act-peace-]').count();
    }
    if (m % 3 === 0) {
      row.panel = await panel();
      await shot(page, `${L}_m${String(m).padStart(2, '0')}_panel.png`);
      await page.evaluate(() => window.__warsim.hud.onSelectNation(0)).catch(() => {});
      await lookAt(page, CELLS[capKey][0], CELLS[capKey][1], 3000);
      await shot(page, `${L}_m${String(m).padStart(2, '0')}_map.png`);
    }
    out.months.push(row);
    save(`c33_pg2_${seed}_${TAG}.json`, { ...out, errors });
    console.log(m, row.date, JSON.stringify(row.stat), row.peaceButtons, row.banners.length);
  }
  await lookAt(page, CELLS[capKey][0], CELLS[capKey][1], 12000);
  await shot(page, `${L}_end_region.png`);
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c33_pg2_${seed}_${TAG}.json`, out);
await browser.close();
console.log(out.fatal ?? 'ok', errors.slice(0, 5));
