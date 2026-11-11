// Critic run 61 (new): why c63_g_editor's day-120 wait timed out. The probe's own scenario file
// (critic/c63_critic_standoff.warsim-scenario: Poland with 10 warheads and a bomber group, fleets face to face) started
// from the title, Germany at war with Poland and Britain, run at Max; every 5 s: tick, paused, speed, nuke alert,
// Poland's warheads, the date. Usage: node critic/scripts/c63_x_stall.mjs [secs]
import path from 'node:path';
import { launch, BASE, shot, save, CELLS } from './c63_lib.mjs';
const secs = Number(process.argv[2] ?? 600);
const T = CELLS.tags;
const out = { samples: [] };
const { browser, page, errors } = await launch(1600, 900);
try {
  await page.goto(`${BASE}/`);
  await page.getByTestId('title-scenario-file').setInputFiles(path.resolve('critic/c63_critic_standoff.warsim-scenario'));
  await page.getByTestId('title-file-start').click();
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120000 });
  await page.waitForTimeout(2000);
  await page.evaluate(({ T }) => { const c = window.__warsim.sim; c.command({ kind: 'declareWar', attacker: T.GER, defender: T.POL }); c.command({ kind: 'declareWar', attacker: T.GER, defender: T.ENG }); }, { T });
  await page.evaluate(() => { const h = window.__warsim.hud; h.setSpeedLevel(99); if (h.paused.value) h.togglePause(); });
  const t0 = await page.evaluate(() => window.__warsim.hud.tick.value);
  out.t0 = t0;
  for (let s = 5; s <= secs; s += 5) {
    await page.waitForTimeout(5000);
    const m = await page.evaluate((P) => ({ tick: window.__warsim.hud.tick.value, paused: window.__warsim.hud.paused.value, date: document.querySelector('[data-testid=date-label]')?.innerText, speed: document.querySelector('[data-testid=speed-label]')?.innerText, alert: document.querySelector('[data-testid=nuke-alert-text]')?.innerText ?? null, polWarheads: window.__warsim.hud.stats.value.nations.find((x) => x.id === P)?.warheads ?? null }), T.POL);
    m.s = s; m.day = +((m.tick - t0) / 24).toFixed(1);
    out.samples.push(m);
    console.log(JSON.stringify(m));
    const last = out.samples.at(-4);
    if (m.day >= 125) break;
    if (last && last.tick === m.tick) { out.stuck = m; out.stuckShot = await shot(page, 'c63xs_stuck.png'); out.body = (await page.evaluate(() => document.body.innerText)).slice(0, 1500); break; }
  }
  out.endShot = await shot(page, 'c63xs_end.png');
} catch (e) { out.fail = String(e).slice(0, 400); }
finally { out.errors = errors; save('c63_xs.json', out); await browser.close(); }
