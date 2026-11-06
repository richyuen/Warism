// Critic run 29 (new, ROADMAP R1): the relations graph as a player meets it. 1938, seed <seed>, [heroes].
// At day 1 and after <days> days: open Relations; count drawn edges by kind and nodes; independently rebuild the
// ties from the statistics message (wars' sides, alliance ids, overlords, guarantees, truces) and from the sim's own
// inspect where it carries them, and compare; toggle each kind off/on (nodes move?); click an edge of each kind and
// read the footer; focus one nation; time to open; shots. Phone width too when <w> < 600.
// Usage: node critic/scripts/c45_rg_relations.mjs <seed> <days> [w] [h] [tag] [extra]
import { launch, open1938, shot, save, hours } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 7019), days = Number(process.argv[3] ?? 365);
const W = Number(process.argv[4] ?? 1600), H = Number(process.argv[5] ?? 900), tg = process.argv[6] ?? 'desk', extra = process.argv[7] ?? '';
const L = `c45rg_${seed}_${tg}`;
const out = { seed, days, W, H, samples: [] };
const { browser, page, errors } = await launch(W, H);
const drawn = () => page.evaluate(() => {
  const g = document.querySelector('[data-testid=relations-graph]');
  if (!g) return null;
  const edges = [...g.querySelectorAll('.relations-edge')].map((e) => [e.getAttribute('data-kind'), e.getAttribute('data-from'), e.getAttribute('data-to')]);
  const nodes = [...g.querySelectorAll('[data-testid^=relations-node-]')].map((n) => { const c = n.querySelector('circle'); return [n.getAttribute('data-testid').replace('relations-node-', ''), +(+c.getAttribute('cx')).toFixed(1), +(+c.getAttribute('cy')).toFixed(1)]; });
  return { edges, nodes, said: document.querySelector('[data-testid=relations-said]')?.innerText ?? null };
});
const truth = () => page.evaluate(() => {
  const st = window.__warsim.hud.stats.value;
  const live = new Set(st.nations.map((n) => n.id));
  const pairs = { alliance: new Set(), puppet: new Set(), guarantee: new Set(), truce: new Set(), war: 0 };
  const byAl = new Map();
  for (const n of st.nations) {
    if (n.alliance) { const k = n.alliance.id ?? n.alliance; if (!byAl.has(k)) byAl.set(k, []); byAl.get(k).push(n.id); }
    if (n.overlord) pairs.puppet.add(`${n.overlord}>${n.id}`);
    for (const g of n.guarantees ?? []) pairs.guarantee.add(`${n.id}>${g.id ?? g}`);
    for (const t of n.truces ?? []) { const o = t.id ?? t.with ?? t; pairs.truce.add([n.id, o].sort((a, b) => a - b).join('-')); }
  }
  let war = 0; for (const w of st.wars ?? []) war += (w.attackers?.length ?? 0) + (w.defenders?.length ?? 0);
  return { living: live.size, wars: (st.wars ?? []).length, warEdges: war, alliances: [...byAl.values()].map((m) => m.length), puppet: pairs.puppet.size, guarantee: pairs.guarantee.size, truce: pairs.truce.size, sample: st.nations.slice(0, 1).map((n) => ({ alliance: n.alliance, guarantees: n.guarantees, truces: n.truces })) };
});
try {
  await open1938(page, seed, extra);
  for (const d of [0, days]) {
    if (d > 0) await hours(page, 24 * d);
    const t0 = Date.now();
    await page.getByRole('button', { name: 'Relations', exact: true }).click();
    await page.waitForSelector('[data-testid=relations-graph]', { timeout: 30_000 });
    const openMs = Date.now() - t0;
    await page.waitForTimeout(800);
    const g = await drawn();
    const kinds = {}; for (const e of g.edges) kinds[e[0]] = (kinds[e[0]] ?? 0) + 1;
    const s = { day: d, openMs, nodes: g.nodes.length, kinds, said: g.said, truth: await truth(), shot: await shot(page, `${L}_d${d}.png`) };
    // toggle each kind
    s.toggles = [];
    for (const k of ['war', 'alliance', 'guarantee', 'puppet', 'truce']) {
      const box = page.locator(`[data-testid=relations-kind-${k}]`);
      if (!(await box.count())) continue;
      await box.click(); await page.waitForTimeout(500);
      const g2 = await drawn();
      const moved = g2.nodes.filter(([key, x, y]) => { const o = g.nodes.find((n) => n[0] === key); return o && (Math.abs(o[1] - x) > 0.5 || Math.abs(o[2] - y) > 0.5); }).length;
      s.toggles.push({ kind: k, edgesOff: g2.edges.filter((e) => e[0] === k).length, nodes: g2.nodes.length, moved });
      await box.click(); await page.waitForTimeout(400);
    }
    // click one edge of each kind (by dispatching a click on the hit line)
    s.clicks = [];
    for (const k of ['war', 'alliance', 'guarantee', 'puppet', 'truce']) {
      const ok = await page.evaluate((k) => { const e = document.querySelector(`.relations-edge[data-kind=${k}] .relations-hit`); if (!e) return false; e.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; }, k);
      if (!ok) continue;
      await page.waitForTimeout(300);
      s.clicks.push({ kind: k, said: await page.evaluate(() => document.querySelector('[data-testid=relations-said]')?.innerText ?? null) });
    }
    // focus a nation (the one with most edges)
    const focusOpts = await page.evaluate(() => [...document.querySelectorAll('[data-testid=relations-focus] option')].map((o) => [o.value, o.textContent]));
    s.focusOptions = focusOpts.length;
    const ger = focusOpts.find((o) => /Germany/.test(o[1])) ?? focusOpts[1];
    if (ger) { await page.selectOption('[data-testid=relations-focus]', ger[0]); await page.waitForTimeout(600); const g3 = await drawn(); s.focus = { nation: ger[1], nodes: g3.nodes.length, edges: g3.edges.length }; s.focusShot = await shot(page, `${L}_d${d}_focus.png`); await page.selectOption('[data-testid=relations-focus]', '0').catch(() => {}); }
    out.samples.push(s);
    save(`c45_rg_${seed}_${tg}.json`, { ...out, errors });
    await page.locator('[data-testid=relations-close]').click().catch(() => page.keyboard.press('Escape'));
    await page.waitForTimeout(400);
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c45_rg_${seed}_${tg}.json`, out);
await browser.close();
console.log(JSON.stringify(out.samples.map((s) => ({ day: s.day, openMs: s.openMs, nodes: s.nodes, kinds: s.kinds, truth: s.truth, toggles: s.toggles, clicks: s.clicks, focus: s.focus }))).slice(0, 4000), out.fatal ?? '');
