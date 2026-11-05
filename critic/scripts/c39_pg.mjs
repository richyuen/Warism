// Critic run 26 (new), PG: PLAN 7.190's pledges in the page. Seed <seed>, day 0: the nation panel of each named nation
// (Guarantees / Guaranteed by blocks), at the given viewport. Then, if <lapseDay> is given, run to it and read the
// ticker, the panel of the two nations of the lapse, and the history rows of the new kinds (GuaranteeLapsed, WarLeft).
// Usage: node critic/scripts/c39_pg.mjs <seed> <w> <h> <tag> <tags,comma> [lapseDay] [lapseTags,comma]
import { launch, open1938, shot, save, hours, CELLS } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 3739);
const W = Number(process.argv[3] ?? 1600), H = Number(process.argv[4] ?? 900);
const tg = process.argv[5] ?? 'desk';
const tags = (process.argv[6] ?? 'ENG,FRA,POL,ROM,CZS,SOV').split(',');
const lapseDay = Number(process.argv[7] ?? 0);
const lapseTags = (process.argv[8] ?? '').split(',').filter(Boolean);
const T = CELLS.tags;
const out = { seed, W, H, panels: {}, lapse: null };
const { browser, page, errors } = await launch(W, H);
const panelOf = async (tag, name) => {
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), T[tag]);
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => {
    const q = (s) => document.querySelector(`[data-testid="${s}"]`);
    const box = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
    const p = q('nation-panel') ?? document.querySelector('.panel');
    return {
      guarantees: q('panel-guarantees')?.innerText ?? null, guaranteesBox: box(q('panel-guarantees')),
      guarantors: q('panel-guarantors')?.innerText ?? null, guarantorsBox: box(q('panel-guarantors')),
      wars: q('panel-wars')?.innerText ?? null,
      panelBox: box(p), panelScroll: p ? [p.scrollHeight, p.clientHeight] : null,
      overflowX: document.documentElement.scrollWidth > innerWidth,
    };
  });
  r.shot = await shot(page, `c39pg_${seed}_${tg}_${name}.png`);
  return r;
};
try {
  await open1938(page, seed);
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  for (const t of tags) out.panels[t] = await panelOf(t, `d0_${t}`);
  if (lapseDay > 0) {
    await page.evaluate(() => window.__warsim.hud.onSelectNation(0));
    await hours(page, lapseDay * 24);
    const lp = { day: lapseDay };
    lp.ticker = await page.evaluate(() => document.querySelector('[data-testid=ticker]')?.innerText ?? '');
    lp.tickerShot = await shot(page, `c39pg_${seed}_${tg}_d${lapseDay}_ticker.png`);
    lp.panels = {};
    for (const t of lapseTags) lp.panels[t] = await panelOf(t, `d${lapseDay}_${t}`);
    // History: open it and read rows mentioning the new kinds.
    await page.evaluate(() => window.__warsim.hud.onSelectNation(0));
    const hb = page.getByRole('button', { name: 'History' });
    if (await hb.count()) {
      await hb.first().click();
      await page.waitForTimeout(1500);
      lp.historyText = await page.evaluate(() => {
        const d = document.querySelector('[data-testid=history], .history, [role=dialog]');
        return (d?.innerText ?? '').split('\n').filter((l) => /lapsed|left its war|Guarantee|War left/i.test(l)).slice(0, 40);
      });
      lp.historyTypes = await page.evaluate(() => [...document.querySelectorAll('select option, [data-testid^=history-type] , label')].map((o) => o.textContent.trim()).filter((s) => /lapsed|War left/i.test(s)));
      lp.historyShot = await shot(page, `c39pg_${seed}_${tg}_d${lapseDay}_history.png`);
    }
    out.lapse = lp;
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors.slice(0, 20);
save(`c39_pg_${seed}_${tg}.json`, out);
await browser.close();
console.log('done:', JSON.stringify({ fatal: out.fatal, panels: Object.fromEntries(Object.entries(out.panels).map(([k, v]) => [k, [v.guarantees, v.guarantors]])), lapse: out.lapse && { ticker: out.lapse.ticker?.slice(0, 400), hist: out.lapse.historyText } }));
