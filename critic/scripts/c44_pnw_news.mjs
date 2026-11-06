// Critic run 34 (R21a, R21b, new): which of a landing order's outcomes reach the player in the page (the worker's
// `orderNews`, listened to directly, and the rows). 1938 seed 3517, <TAG> played, God's war on <FOE> if needed; the <n>
// divisions nearest (sx, sy) ordered over the sea to (dx, dy) through the page's own command (escort on). Optional God's
// peace at hour <peaceH> (-1: none). Hourly to <hours>: every orderNews post, every voyage state change, the rows.
// Usage: node critic/scripts/c44_pnw_news.mjs <TAG> <FOE> <sx> <sy> <dx> <dy> <n> <peaceH> <hours> <tag>
import { launch, open1938, shot, save, hours, CELLS } from './c31_lib.mjs';
const [TAG, FOE, sx, sy, dx, dy, nS, peaceS, hoursS, tag] = process.argv.slice(2);
const nat = CELLS.tags[TAG], foe = CELLS.tags[FOE], n = Number(nS), peaceH = Number(peaceS), H = Number(hoursS);
const out = { TAG, FOE, dst: [+dx, +dy], n, peaceH, changes: [], rows: [] };
const { browser, page, errors } = await launch(1600, 900);
try {
  await open1938(page, 3517);
  await page.evaluate(({ a, b }) => window.__warsim.hud.command({ kind: 'forceWar', attacker: a, defender: b }), { a: nat, b: foe });
  await hours(page, 1);
  await page.evaluate((x) => window.__warsim.view.select(x), nat);
  await page.waitForTimeout(400);
  await page.getByTestId('take-control').click();
  await page.waitForSelector('[data-testid=release-control]', { timeout: 10_000 });
  await page.evaluate(() => { window.__news = []; window.__warsim.sim.onOrderNews((m) => window.__news.push(m)); });
  const ids = await page.evaluate(({ nat, x, y, n }) => {
    const v = window.__warsim.view;
    return v.formationsOf(nat).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - x, v.formationPos(id)[1] - y)]).sort((a, b) => a[1] - b[1]).slice(0, n).map((d) => d[0]);
  }, { nat, x: +sx, y: +sy, n });
  out.ids = ids;
  for (const id of ids) await page.evaluate(({ id, n, x, y }) => window.__warsim.hud.command({ kind: 'moveFormation', id, x, y, nation: n, escort: true }), { id, n: nat, x: +dx, y: +dy });
  let last = '';
  for (let h = 1; h <= H; h++) {
    await hours(page, 1);
    if (h === peaceH) {
      out.peace = await page.evaluate(async ({ a, b }) => {
        const s = { wars: window.__warsim.hud.stats.value?.wars ?? [] };
        const war = (s?.wars ?? []).find((w) => (w.attackers?.includes(a) && w.defenders?.includes(b)) || (w.attackers?.includes(b) && w.defenders?.includes(a)));
        if (!war) return { none: true, wars: (s?.wars ?? []).length };
        window.__warsim.hud.command({ kind: 'forcePeace', war: war.id });
        return { war: war.id };
      }, { a: nat, b: foe });
    }
    const st = await page.evaluate(async (ids) => { const r = []; for (const id of ids) { const f = await window.__warsim.sim.formation(id); r.push(f ? (f.voyage?.state ?? '-') : 'dead'); } return r.join(','); }, ids);
    if (st !== last) { out.changes.push({ h, st }); last = st; }
    for (const r of await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row], [data-testid=order-row], [data-testid=order-news]')].map((x) => x.innerText.replace(/\n/g, ' ')))) if (!out.rows.includes(r)) out.rows.push(r);
  }
  out.news = await page.evaluate(() => window.__news);
  out.shotEnd = await shot(page, `c44pnw_${tag}_end.png`);
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c44_pnw_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify(out).slice(0, 3000));
