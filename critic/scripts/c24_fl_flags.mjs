// Critic run 23, FL: the helmeted flag (PLAN 7.179) on many nations' infantry at T3 (10 m/px) and T1 (1200 m/px),
// the default look, start of the 1938 world, seed 7019. A crop of the screen centre per nation.
// Usage: node critic/scripts/c24_fl_flags.mjs [port] [tag]
import { launch, lookAt, shot, save, CELLS, settle } from './c24_lib.mjs';
import { execFileSync } from 'node:child_process';

const port = Number(process.argv[2] ?? 5299);
const tag = process.argv[3] ?? 'c24fl';
const T = CELLS.tags;
const NATS = ['ENG', 'USA', 'JAP', 'SOV', 'ITA', 'FRA', 'CHI', 'AUT', 'HUN', 'ROM', 'YUG', 'CZS', 'NED', 'BEL', 'TUR', 'NSP', 'POR', 'SWE', 'GRE', 'BUL', 'LAT', 'EST', 'LIT', 'FIN'];
const out = { port, nations: [] };
const { browser, page, errors } = await launch(900, 600);
try {
  await page.goto(`http://127.0.0.1:${port}/?scenario=1938&paused=1&seed=7019`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  for (const t of NATS) {
    const id = T[t];
    if (!id) { out.nations.push({ t, missing: true }); continue; }
    const f = await page.evaluate((n) => {
      const v = window.__warsim.view;
      const fs = v.formationsOf(n).map((f) => ({ f, t: v.formationTitle(f), pos: v.formationPos(f) })).filter((x) => x.pos && /Infantry/.test(JSON.stringify(x.t)));
      return fs[0] ?? null;
    }, id);
    if (!f) { out.nations.push({ t, id, none: true }); continue; }
    const row = { t, id, f: f.f, name: f.t?.name };
    for (const m of [10, 1200]) {
      await lookAt(page, f.pos[0], f.pos[1], m);
      await settle(page, 5000);
      row[`s${m}`] = await shot(page, `${tag}_${t}_${m}m.png`);
    }
    out.nations.push(row);
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`${tag}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 3000));
void execFileSync;
