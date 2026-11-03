// Critic run 26 (new), BT: PLAN 7.189's refusal where the player reads it. Germany declares on Poland (God's command,
// day 1); play Poland; day 10. The Actions tab with each target: France (beside, not allied), and the God tab's war
// between two partners (France on Poland, Italy on Germany): the button, its title, the standing line, the God tab's
// refusal text after a click. At the given viewport (a phone: no hover, so a title is unseen).
// Usage: node critic/scripts/c27_bt.mjs <seed> <w> <h> <tag>
import { launch, open1938, shot, save, hours, CELLS } from './c27_lib.mjs';
const seed = Number(process.argv[2] ?? 5113);
const W = Number(process.argv[3] ?? 1600), H = Number(process.argv[4] ?? 900), tg = process.argv[5] ?? 'desk';
const T = CELLS.tags;
const out = { seed, W, H, tg };
const { browser, page, errors } = await launch(W, H);
try {
  await open1938(page, seed);
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  await hours(page, 24);
  await page.evaluate(([a, d]) => window.__warsim.sim.command({ kind: 'forceWar', attacker: a, defender: d }), [T.GER, T.POL]);
  await hours(page, 2);
  await page.evaluate((n) => window.__warsim.view.select(n), T.POL);
  await page.waitForTimeout(400);
  await page.getByTestId('take-control').click();
  await hours(page, 9 * 24);
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), T.POL);
  await page.waitForTimeout(500);
  const tabBtn = page.getByRole('button', { name: /^Actions$/ });
  if (await tabBtn.count()) await tabBtn.first().click();
  await page.waitForTimeout(400);
  out.targets = {};
  for (const tag of ['FRA', 'GER', 'ENG', 'ITA']) {
    const sel = page.getByTestId('act-target');
    if (!(await sel.count())) { out.noActions = true; break; }
    await sel.selectOption(String(T[tag])).catch((e) => (out.selErr = String(e)));
    await page.waitForTimeout(300);
    const war = page.getByTestId('act-war');
    out.targets[tag] = {
      standing: await page.getByTestId('act-standing').innerText().catch(() => null),
      kind: await page.getByTestId('act-standing').getAttribute('data-standing').catch(() => null),
      warText: await war.innerText().catch(() => null), warDisabled: await war.isDisabled().catch(() => null), warTitle: await war.getAttribute('title').catch(() => null),
      allyDisabled: await page.getByTestId('act-ally').isDisabled().catch(() => null),
    };
    out.targets[tag].shot = await shot(page, `c27bt_${seed}_${tg}_actions_${tag}.png`);
  }
  // God Mode: war between two that fight on one side.
  const god = page.getByRole('button', { name: 'God Mode' });
  if (await god.count()) { await god.first().click(); await page.waitForTimeout(400); }
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), T.FRA);
  await page.waitForTimeout(500);
  const gt = page.getByRole('button', { name: /^God$/ });
  if (await gt.count()) { await gt.first().click(); await page.waitForTimeout(400); }
  out.godText = await page.evaluate(() => (document.querySelector('[data-testid=nation-panel]') ?? document.querySelector('.panel'))?.innerText?.slice(0, 1500) ?? null);
  out.godShot = await shot(page, `c27bt_${seed}_${tg}_god_fra.png`);
  // Direct command on the sim: France on Poland, then read the war list and the God tab.
  const before = await page.evaluate(async () => (await window.__warsim.sim.inspect()).wars.length);
  await page.evaluate(([a, d]) => window.__warsim.sim.command({ kind: 'forceWar', attacker: a, defender: d }), [T.FRA, T.POL]);
  await hours(page, 1);
  out.afterForce = await page.evaluate(async ([a, d]) => { const s = await window.__warsim.sim.inspect(); return { wars: s.wars.length, fraPol: s.wars.some((w) => (w.attackers.includes(a) && w.defenders.includes(d)) || (w.attackers.includes(d) && w.defenders.includes(a))) }; }, [T.FRA, T.POL]);
  out.warsBefore = before;
  out.ticker = await page.evaluate(() => document.querySelector('[data-testid=ticker]')?.innerText ?? '');
  out.godShot2 = await shot(page, `c27bt_${seed}_${tg}_after_force.png`);
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors.slice(0, 20);
save(`c27_bt_${seed}_${tg}.json`, out);
await browser.close();
console.log('done:', JSON.stringify({ fatal: out.fatal, targets: out.targets, afterForce: out.afterForce }));
