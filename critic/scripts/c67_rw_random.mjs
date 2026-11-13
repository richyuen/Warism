// Critic run 54 (new): the random world and the toy world in the page. Each opened, run N days at Max (in 30-day steps,
// as hours() does), a shot at the world zoom and at 600 m/px over the first engaged formation, the nations living, page
// errors. Usage: node critic/scripts/c67_rw_random.mjs <seed> <days>
import { launch, settle, hours, shot, save, lookAt, BASE } from './c67_lib.mjs';
const seed = Number(process.argv[2] ?? 24161);
const days = Number(process.argv[3] ?? 365);
const out = { seed, days, worlds: [] };
const { browser, page, errors } = await launch();
try {
  for (const [label, q] of [['random', 'scenario=random'], ['toy', 'scenario=toy']]) {
    const t0 = Date.now();
    await page.goto(`${BASE}/?${q}&paused=1&seed=${seed}`);
    await page.waitForFunction(() => window.__warsim?.sim && window.__warsim?.view, null, { timeout: 120_000 });
    await settle(page);
    const w = { label, openMs: Date.now() - t0, samples: [] };
    await shot(page, `c67rw_${label}_${seed}_d0.png`);
    for (let d = 0; d < days; d += 30) {
      const s0 = Date.now();
      await hours(page, 24 * Math.min(30, days - d));
      const info = await page.evaluate(() => {
        const i = window.__warsim.sim.inspect?.();
        return { date: document.body.innerText.match(/\d{1,2} \w+ \d{4}/)?.[0] ?? null, wars: [...document.querySelectorAll('[data-testid=war-chip]')].map((x) => x.innerText.replace(/\s+/g, ' ')).slice(0, 8), nations: i?.nations ?? null };
      });
      w.samples.push({ d: d + 30, wallMs: Date.now() - s0, ...info });
    }
    await shot(page, `c67rw_${label}_${seed}_end_world.png`);
    const spot = await page.evaluate(() => {
      const v = window.__warsim.view;
      const ids = v.formationIds?.() ?? [];
      for (const id of ids) if (v.formationEngaged?.(id)) return v.formationPos(id);
      return null;
    });
    if (spot) { await lookAt(page, spot[0], spot[1], 600); await shot(page, `c67rw_${label}_${seed}_end_600m.png`); }
    w.spot = spot;
    out.worlds.push(w);
  }
} catch (e) {
  out.fatal = String(e?.stack ?? e);
} finally {
  out.errors = errors;
  save(`c67_rw_${seed}.json`, out);
  await browser.close();
}
