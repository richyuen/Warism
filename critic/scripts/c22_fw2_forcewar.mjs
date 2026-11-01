// Critic run 22, FW: "Force war" (PLAN 7.175, ADR-780) from the right-click menu, on cases the builder's spec does
// not cover: (A) Japan on its ally Germany: who joins whom, what the alliance does after; (B) a puppet on its
// overlord; (C) a truce just signed; (D) what the ticker and the banners tell the player.
// Usage: node critic/scripts/c22_fw_forcewar.mjs <seed>
import { launch, open1938, shot, save, hours, CELLS } from './c22_lib.mjs';

const seed = Number(process.argv[2] ?? 2207);
const T = CELLS.tags;
const out = { seed, cases: [] };
const { browser, page, errors } = await launch(1400, 800);
const ins = () => page.evaluate(() => window.__warsim.sim.inspect());
const statsOf = (n) => page.evaluate((n) => { const s = window.__warsim.hud.stats.value.nations.find((x) => x.id === n); return s ? { alliance: s.alliance?.id ?? null, allianceName: s.alliance?.name ?? null, overlord: s.overlord ?? null, puppetOf: s.puppetOf ?? null, keys: Object.keys(s).join(',') } : null; }, n);
const name = (n) => page.evaluate((n) => window.__warsim.view.nationName(n), n);
const warsOf = async (n) => (await ins()).wars.filter((w) => w.attackers.includes(n) || w.defenders.includes(n)).map((w) => ({ att: w.attackers, def: w.defenders }));
const named = async (ws) => { const r = []; for (const w of ws) r.push({ att: await Promise.all(w.att.map(name)), def: await Promise.all(w.def.map(name)) }); return r; };
const ticker = () => page.evaluate(() => document.querySelector('[data-testid=ticker]')?.innerText ?? '');
const banners = () => page.evaluate(() => [...document.querySelectorAll('.war-banner, [data-testid^=war-banner]')].map((b) => b.innerText.replace(/\n/g, ' ')).slice(0, 8));
async function groundOf(nation) {
  const fs = await page.evaluate((n) => window.__warsim.view.formationsOf(n), nation);
  let at = fs.length ? await page.evaluate((f) => window.__warsim.view.formationPos(f), fs[0]) : null;
  if (!at) at = await page.evaluate((n) => { const c = window.__warsim.view.capitals.get(n); return c ? [c[0] ?? c.x, c[1] ?? c.y] : null; }, nation);
  await page.evaluate(([x, y]) => window.__warsim.view.controller.set({ cx: x, cy: y, scale: 6 }), at);
  await page.waitForTimeout(400);
  return page.evaluate((n) => {
    const v = window.__warsim.view; const [w, h] = [innerWidth, innerHeight];
    for (let r = 0; r < Math.min(w, h) / 2; r += 12) for (let k = 0; k < 16; k++) {
      const x = Math.round(w / 2 + r * Math.cos((k * Math.PI) / 8)); const y = Math.round(h / 2 + r * Math.sin((k * Math.PI) / 8));
      if (v.nationAt(x, y) === n && v.nationAt(x + 8, y) === n && v.nationAt(x, y + 8) === n) return [x, y];
    }
    return null;
  }, nation);
}
async function play(n) {
  await page.evaluate((n) => window.__warsim.view.select(n), n);
  await page.waitForTimeout(300);
  await page.getByTestId('take-control').click();
  await page.evaluate(() => window.__warsim.view.select(0));
  await page.waitForTimeout(300);
}
async function menuOn(n) {
  const p = await groundOf(n);
  if (!p) return { err: 'no ground' };
  await page.mouse.click(p[0], p[1], { button: 'right' });
  await page.waitForTimeout(400);
  const m = page.getByTestId('nation-menu');
  return {
    at: p,
    name: await page.getByTestId('nation-menu-name').innerText().catch(() => null),
    standing: await page.getByTestId('nation-menu-standing').innerText().catch(() => null),
    war: await page.getByTestId('nation-menu-war').innerText().catch(() => null),
    items: await m.getByRole('menuitem').allInnerTexts().catch(() => []),
    text: (await m.innerText().catch(() => '')).replace(/\n/g, ' | '),
  };
}
try {
  await open1938(page, seed);
  // A: Japan on its ally Germany.
  {
    const c = { case: 'A Japan force war on ally Germany' };
    await play(T.JAP);
    c.before = { jap: await statsOf(T.JAP), ger: await statsOf(T.GER), ita: await statsOf(T.ITA) };
    c.menu = await menuOn(T.GER);
    c.shotMenu = await shot(page, `c22fw_${seed}_A_menu.png`);
    await page.getByTestId('nation-menu-war').click();
    await page.waitForTimeout(800);
    await hours(page, 2);
    c.after0 = { wars: await named(await warsOf(T.JAP)), jap: await statsOf(T.JAP), ger: await statsOf(T.GER), ita: await statsOf(T.ITA), ticker: await ticker(), banners: await banners() };
    c.shotAfter = await shot(page, `c22fw_${seed}_A_after.png`);
    await hours(page, 24 * 30);
    c.after30 = { wars: await named(await warsOf(T.JAP)), jap: await statsOf(T.JAP), ger: await statsOf(T.GER), ita: await statsOf(T.ITA), ticker: await ticker() };
    c.menuAfter = await menuOn(T.ITA);
    c.shotItaMenu = await shot(page, `c22fw_${seed}_A_ita_menu.png`);
    await page.keyboard.press('Escape');
    out.cases.push(c);
  }
  // B: a puppet on its overlord (find one).
  {
    const c = { case: 'B puppet on overlord' };
    const st = await page.evaluate(() => window.__warsim.hud.stats.value.nations.map((n) => ({ id: n.id, keys: Object.keys(n), o: n.overlord ?? n.puppetOf ?? n.master ?? null })));
    c.statKeys = st[0]?.keys;
    const p = st.find((n) => n.o);
    c.puppet = p ?? null;
    if (p) {
      await page.evaluate(() => window.__warsim.hud.release?.());
      await play(p.id);
      c.pname = await name(p.id); c.oname = await name(typeof p.o === 'object' ? p.o.id : p.o);
      const ov = typeof p.o === 'object' ? p.o.id : p.o;
      c.menu = await menuOn(ov);
      c.shotMenu = await shot(page, `c22fw_${seed}_B_menu.png`);
      if (c.menu.war) { await page.getByTestId('nation-menu-war').click(); await page.waitForTimeout(800); await hours(page, 2); }
      c.after = { wars: await named(await warsOf(p.id)), me: await statsOf(p.id), ticker: await ticker() };
      c.shotAfter = await shot(page, `c22fw_${seed}_B_after.png`);
      c.pol = await statsOf(T.POL);
      c.series = [];
      for (const d of [1, 7, 30, 90]) {
        await hours(page, 24 * (d - (c.series.at(-1)?.d ?? 0)));
        const all = (await ins()).wars.filter((w) => w.attackers.includes(p.id) || w.defenders.includes(p.id));
        const both = all.filter((w) => w.attackers.includes(ov) || w.defenders.includes(ov));
        const sameSide = both.filter((w) => (w.attackers.includes(ov) && w.attackers.includes(p.id)) || (w.defenders.includes(ov) && w.defenders.includes(p.id)));
        c.series.push({ d, wars: await named(all.map((w) => ({ att: w.attackers, def: w.defenders }))), sameSideAsOverlord: sameSide.length, livingP: (await statsOf(p.id)) !== null, pol: await statsOf(T.POL) });
      }
      c.shotLate = await shot(page, `c22fw_${seed}_B_late.png`);
    }
    out.cases.push(c);
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c22_fw2_${seed}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 6000));
