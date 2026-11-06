// Critic run 27: PP with REVOLT=1 forcing the revolt branch (God: autonomy 60, loyalty 0). Was: Critic run 26 (new), PP: PR in the page. Seed <seed>, day <day>: play the puppet <PUP>; right-click its overlord: the
// menu (ADR-780's Force war). Then God sets the puppet's autonomy 60 and loyalty 0 (a revolt): a day later the ticker,
// the history, the puppet's panel and the menu on the old overlord. Same script on both builds (port).
// Usage: node critic/scripts/c44_pp.mjs <seed> <day> <PUP> <OVR> [port] [tag]
import { launch, shot, save, hours, CELLS } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 7019), day = Number(process.argv[3] ?? 30);
const PT = process.argv[4] ?? 'MAN', OT = process.argv[5] ?? 'JAP';
const port = Number(process.argv[6] ?? 5299), tg = process.argv[7] ?? 'head';
const BASE = `http://127.0.0.1:${port}`;
const T = CELLS.tags;
const P = T[PT], O = T[OT];
const out = { seed, day, PT, OT, port, tg };
const { browser, page, errors } = await launch(1400, 800);
async function groundOf(nation) {
  let at = await page.evaluate((n) => { const c = window.__warsim.view.capitals.get(n); return c ? [c[0] ?? c.x, c[1] ?? c.y] : null; }, nation);
  await page.evaluate(([x, y]) => window.__warsim.view.controller.set({ cx: x, cy: y, scale: 3 }), at);
  await page.waitForTimeout(500);
  return page.evaluate((n) => {
    const v = window.__warsim.view; const [w, h] = [innerWidth, innerHeight];
    for (let r = 0; r < Math.min(w, h) / 2; r += 12) for (let k = 0; k < 16; k++) {
      const x = Math.round(w / 2 + r * Math.cos((k * Math.PI) / 8)); const y = Math.round(h / 2 + r * Math.sin((k * Math.PI) / 8));
      if (v.nationAt(x, y) === n && v.nationAt(x + 8, y) === n && v.nationAt(x, y + 8) === n) return [x, y];
    }
    return null;
  }, nation);
}
async function menuOn(n) {
  const p = await groundOf(n);
  if (!p) return { err: 'no ground' };
  await page.mouse.click(p[0], p[1], { button: 'right' });
  await page.waitForTimeout(400);
  const war = page.getByTestId('nation-menu-war');
  return {
    name: await page.getByTestId('nation-menu-name').innerText().catch(() => null),
    standing: await page.getByTestId('nation-menu-standing').innerText().catch(() => null),
    items: await page.getByTestId('nation-menu').getByRole('menuitem').allInnerTexts().catch(() => []),
    warDisabled: (await war.count()) ? await war.isDisabled() : null,
    warTitle: (await war.count()) ? await war.getAttribute('title') : null,
  };
}
const panel = async (n) => { await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), n); await page.waitForTimeout(700); return page.evaluate(() => (document.querySelector('[data-testid=nation-panel]') ?? document.querySelector('.panel'))?.innerText ?? null); };
try {
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 120_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null && window.__warsim.sim.mapLayers !== null, null, { timeout: 120_000 });
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  await hours(page, day * 24);
  await page.evaluate((n) => window.__warsim.view.select(n), P);
  await page.waitForTimeout(300);
  await page.getByTestId('take-control').click();
  await page.waitForTimeout(300);
  await page.evaluate(() => window.__warsim.view.select(0));
  out.menuBefore = await menuOn(O);
  out.shotMenuBefore = await shot(page, `c44pp_${tg}_${seed}_${PT}_menu_before.png`);
  if (out.menuBefore.warDisabled === false && !process.env.REVOLT) {
    await page.getByTestId('nation-menu-war').click();
    await hours(page, 2);
    out.forced = true;
  } else {
    await page.keyboard.press('Escape');
    await page.evaluate(([p]) => { window.__warsim.sim.command({ kind: 'setAutonomy', subject: p, value: 60 }); window.__warsim.sim.command({ kind: 'setPuppetLoyalty', subject: p, value: 0 }); }, [P]);
    await hours(page, 26);
    out.revolted = true;
  }
  out.ticker = await page.evaluate(() => document.querySelector('[data-testid=ticker]')?.innerText ?? '');
  out.wars = await page.evaluate(async (p) => (await window.__warsim.sim.inspect()).wars.filter((w) => w.attackers.includes(p) || w.defenders.includes(p)).map((w) => [w.attackers, w.defenders]), P);
  out.panelAfter = await panel(P);
  out.shotPanelAfter = await shot(page, `c44pp_${tg}_${seed}_${PT}_panel_after.png`);
  await page.evaluate(() => window.__warsim.hud.onSelectNation(0));
  out.menuAfter = await menuOn(O);
  out.shotMenuAfter = await shot(page, `c44pp_${tg}_${seed}_${PT}_menu_after.png`);
  await page.keyboard.press('Escape');
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors.slice(0, 20);
save(`c44_pp_${tg}_${seed}_${PT}.json`, out);
await browser.close();
console.log('done:', JSON.stringify({ fatal: out.fatal, before: out.menuBefore, after: out.menuAfter, wars: out.wars }));
