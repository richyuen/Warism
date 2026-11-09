// Critic run 57 (new): the player's own diplomacy by the Actions tab, as a player clicks it. Play ME; pick each of
// ALLIES and propose an alliance (record the button's state, the standing note, and what the ticker/news says); pick
// FOE, read the standing, press War; 2 h later list the wars and who is on them, History's war rows; after DAYS offer
// peace on each of my wars, then 48 h later: wars, standing, history. Shots of the Actions tab at each step.
// Usage: node critic/scripts/c58_dip_player.mjs <seed> <ME> <FOE> <ALLY,ALLY..> [DAYS] [W H]
import { launch, open1938, shot, save, hours, CELLS } from './c58_lib.mjs';
const [seedS, ME, FOE, ALLIES, daysS, wS, hS] = process.argv.slice(2);
const seed = Number(seedS), DAYS = Number(daysS ?? 30), W = Number(wS ?? 1600), H = Number(hS ?? 900);
const T = CELLS.tags;
const label = `${seed}_${ME}_${FOE}_${W}x${H}`;
const out = { seed, ME, FOE, ALLIES, DAYS, steps: [] };
const { browser, page, errors } = await launch(W, H);
const st = () => page.evaluate(() => {
  const s = window.__warsim.hud.stats.value;
  const nm = new Map(s.nations.map((n) => [n.id, n.name]));
  const name = (id) => (nm.get(id) ?? `#${id}`).replace(/^nation\./, '');
  return {
    tick: s.tick,
    wars: s.wars.map((w) => `${w.id}: ${w.attackers.map(name).join('+')} vs ${w.defenders.map(name).join('+')} (${Math.round(w.score)})`),
    ticker: (s.ticker ?? []).map((r) => r.text ?? JSON.stringify(r)).slice(-8),
  };
});
const ui = async () => page.evaluate(() => ({
  standing: document.querySelector('[data-testid=act-standing]')?.textContent ?? null,
  war: { text: document.querySelector('[data-testid=act-war]')?.textContent, disabled: document.querySelector('[data-testid=act-war]')?.disabled },
  ally: { text: document.querySelector('[data-testid=act-ally]')?.textContent, disabled: document.querySelector('[data-testid=act-ally]')?.disabled, title: document.querySelector('[data-testid=act-ally]')?.title },
  peace: [...document.querySelectorAll('[data-testid^=act-peace-]')].map((b) => b.closest('.god-row')?.textContent),
  tickerText: document.body.innerText.split('\n').filter((l) => /19\d\d /.test(l)).slice(-8),
}));
const pick = async (tag) => {
  await page.getByTestId('act-target').selectOption(String(T[tag]));
  await page.waitForTimeout(400);
};
try {
  await open1938(page, seed);
  await page.evaluate((n) => window.__warsim.view.select(n), T[ME]);
  await page.getByTestId('take-control').click();
  await page.getByTestId('release-control').waitFor({ timeout: 10000 });
  await page.getByTestId('tab-actions').click();
  await page.waitForTimeout(400);
  if (process.env.NOASSIST) { await page.getByTestId('act-assist-diplomacy').uncheck(); out.noAssist = true; }
  for (const a of (ALLIES ?? '').split(',').filter(Boolean)) {
    await pick(a);
    const before = await ui();
    let clicked = false;
    if (!before.ally.disabled) { await page.getByTestId('act-ally').click(); clicked = true; }
    await hours(page, 2); await page.waitForTimeout(1500);
    const after = await ui();
    out.steps.push({ step: `ally ${a}`, before, clicked, after, state: await st() });
    await shot(page, `c58dp_${label}_ally_${a}.png`);
  }
  await pick(FOE);
  const before = await ui();
  await page.getByTestId('act-war').click();
  await hours(page, 2); await page.waitForTimeout(1500);
  out.steps.push({ step: `war ${FOE}`, before, after: await ui(), state: await st() });
  await shot(page, `c58dp_${label}_war.png`);
  for (let d = 0; d < DAYS; d += 10) await hours(page, 24 * Math.min(10, DAYS - d));
  out.steps.push({ step: `day ${DAYS}`, ui: await ui(), state: await st() });
  await shot(page, `c58dp_${label}_d${DAYS}.png`);
  const peaceBtns = await page.locator('[data-testid^=act-peace-]').count();
  for (let i = 0; i < peaceBtns; i++) {
    const b = page.locator('[data-testid^=act-peace-]').nth(i);
    const row = await b.evaluate((e) => e.closest('.god-row')?.textContent).catch(() => null);
    await b.click().catch(() => {});
    await hours(page, 2); await page.waitForTimeout(1500);
    out.steps.push({ step: `peace ${row}`, ui: await ui(), state: await st() });
    await shot(page, `c58dp_${label}_peace${i}.png`);
  }
  await hours(page, 48);
  out.steps.push({ step: 'after peace +48h', ui: await ui(), state: await st() });
  // History, war rows
  await page.getByTestId('history-btn').click();
  await page.waitForSelector('[data-testid=history-row]', { timeout: 60_000 });
  out.history = await page.evaluate(() => [...document.querySelectorAll('[data-testid=history-row]')].map((r) => r.innerText.replace(/\n/g, ' ')).slice(0, 400));
  await shot(page, `c58dp_${label}_history.png`);
} catch (e) {
  out.fail = String(e?.stack ?? e).slice(0, 600);
}
out.errors = errors;
save(`c58_dp_${label}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 6000));
