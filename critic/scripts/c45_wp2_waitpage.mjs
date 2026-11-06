// Critic run 34 (R21e, new): the wait aboard in the page. 1938 seed <seed>, Japan played; the <n> divisions nearest Tokyo's
// port selected and sent to Shanghai by a real click (escort box ticked). At set hours: the first division's formation
// panel (status, notice), its screenshot; the escorts' places; at hour <recallH> a real click elsewhere with the waiting
// division alone selected (a recall), and what the page says. Then on to <days> days or all landed.
// Usage: node critic/scripts/c45_wp_waitpage.mjs <seed> <n> <days> <recallH> <tag>
import { launch, open1938, shot, save, hours, CELLS, settle } from './c31_lib.mjs';
const [seedS, nS, daysS, recallS, tag] = process.argv.slice(2);
const seed = Number(seedS), n = Number(nS), days = Number(daysS), recallH = Number(recallS);
const nat = CELLS.tags.JAP;
const src = [1818.5, 385.5], dst = [1715.5, 413.5];
const out = { seed, n, days, recallH, marks: [], ticker: [], notices: [] };
const { browser, page, errors } = await launch(+(process.env.VW ?? 1600), +(process.env.VH ?? 900));
const tickerRows = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row]')].map((r) => r.innerText.replace(/\n/g, ' ')));
const panel = async () => ({
  open: await page.getByTestId('formation-panel').isVisible().catch(() => false),
  title: await page.locator('[data-testid=formation-panel] h2, [data-testid=formation-panel] h3').first().innerText({ timeout: 300 }).catch(() => null),
  status: await page.getByTestId('formation-status').innerText({ timeout: 300 }).catch(() => null),
  notice: await page.getByTestId('formation-notice').innerText({ timeout: 300 }).catch(() => null),
  text: (await page.getByTestId('formation-panel').innerText({ timeout: 300 }).catch(() => '')).slice(0, 900),
});
const states = (ids) => page.evaluate(async (ids) => {
  const r = [];
  for (const id of ids) { const f = await window.__warsim.sim.formation(id); const p = window.__warsim.view.formationPos(id); r.push({ id, alive: !!f, v: f?.voyage?.state ?? null, port: f?.voyage?.port ?? null, aboard: f?.voyage?.aboard ?? null, p: p ? [+p[0].toFixed(1), +p[1].toFixed(1)] : null }); }
  return r;
}, ids);
try {
  await open1938(page, seed);
  await page.evaluate((n) => window.__warsim.view.select(n), nat);
  await page.waitForTimeout(500);
  await page.getByTestId('take-control').click();
  await page.waitForSelector('[data-testid=release-control]', { timeout: 10_000 });
  const ids = await page.evaluate(({ nat, x, y, n }) => {
    const v = window.__warsim.view;
    return v.formationsOf(nat).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - x, v.formationPos(id)[1] - y)]).sort((a, b) => a[1] - b[1]).slice(0, n).map((d) => d[0]);
  }, { nat, x: src[0], y: src[1], n });
  out.ids = ids;
  await page.evaluate((ids) => { const v = window.__warsim.view; for (const id of ids) v.selectedFormations.add(id); window.__warsim.hud.selectFormation(ids[0]); }, ids);
  await page.waitForSelector('[data-testid=formation-panel]', { timeout: 10_000 });
  const box = page.getByTestId('formation-escort');
  if (await box.isVisible().catch(() => false)) { if (!(await box.isChecked())) await box.click(); }
  await page.evaluate(({ x, y }) => window.__warsim.view.showPlace(x, y), { x: dst[0], y: dst[1] });
  await page.waitForTimeout(2000); await settle(page, 8000);
  const cb = await page.locator('canvas').first().boundingBox();
  const cx = cb.x + cb.width / 2, cy = cb.y + cb.height / 2;
  await page.mouse.move(cx + 4, cy + 4); await page.mouse.move(cx, cy); await page.waitForTimeout(600);
  out.tooltip = await page.evaluate(() => document.querySelector('[data-testid=map-tooltip], .map-tooltip')?.innerText ?? null);
  await page.mouse.click(cx, cy);
  await hours(page, 1);
  out.afterClick = { panel: await panel(), ticker: await tickerRows() };
  const markAt = new Set([24, 48, 240, 480, 720, 960, 1200]);
  let h = 1;
  let recalled = false;
  while (h < days * 24) {
    await hours(page, 3); h += 3;
    const st = await states(ids);
    for (const r of await tickerRows()) if (!out.ticker.includes(r) && out.ticker.length < 60) out.ticker.push(r);
    const near = [...markAt].find((m) => h >= m && h < m + 3);
    if (near !== undefined || (!recalled && h >= recallH)) {
      // the first division's panel, the camera on it, then the escorts at the landing
      await page.evaluate((id) => { window.__warsim.view.selectedFormations.clear(); window.__warsim.view.selectedFormations.add(id); window.__warsim.hud.selectFormation(id); }, ids[0]);
      await page.waitForTimeout(400);
      const p0 = st[0].p;
      if (p0) { await page.evaluate(({ x, y }) => window.__warsim.view.showPlace(x, y), { x: p0[0], y: p0[1] }); await page.waitForTimeout(1500); await settle(page, 5000); }
      const m = { h, st, panel: await panel(), shot: await shot(page, `c45wp_${tag}_h${h}_first.png`) };
      await page.evaluate(({ x, y }) => window.__warsim.view.showPlace(x, y), { x: dst[0], y: dst[1] });
      await page.waitForTimeout(1500); await settle(page, 5000);
      m.shotLanding = await shot(page, `c45wp_${tag}_h${h}_landing.png`);
      m.fleetsNearLanding = await page.evaluate(({ x, y }) => { const v = window.__warsim.view; return v.formationsOf(window.__warsim.view.selectedNation ?? 0).length; }, { x: dst[0], y: dst[1] }).catch(() => null);
      if (!recalled && h >= recallH) {
        recalled = true;
        // a real click on Japan's coast near the port: the recall of the waiting division
        const pt = await page.evaluate(({ x, y }) => { window.__warsim.view.showPlace(x, y); return null; }, { x: 1814.5, y: 381.5 });
        await page.waitForTimeout(1500); await settle(page, 5000);
        await page.evaluate((id) => { window.__warsim.view.selectedFormations.clear(); window.__warsim.view.selectedFormations.add(id); window.__warsim.hud.selectFormation(id); }, ids[0]);
        await page.waitForTimeout(400);
        await page.mouse.move(cx + 3, cy + 3); await page.mouse.move(cx, cy); await page.waitForTimeout(600);
        m.recallTooltip = await page.evaluate(() => document.querySelector('[data-testid=map-tooltip], .map-tooltip')?.innerText ?? null);
        await page.mouse.click(cx, cy);
        await hours(page, 1); h += 1;
        m.recall = { panel: await panel(), ticker: await tickerRows(), shot: await shot(page, `c45wp_${tag}_recall.png`) };
      }
      out.marks.push(m);
      markAt.delete(near);
    }
    if (st.every((s) => s.v === 'landed' || !s.alive || (s.v === null && h > recallH + 48 && s.p && Math.hypot(s.p[0] - dst[0], s.p[1] - dst[1]) < 12))) { out.endH = h; out.endSt = st; break; }
    if (h % 120 < 3) out.notices.push({ h, s: st.map((s) => s.v).join(',') });
  }
  out.final = await states(ids);
  out.finalH = h;
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c45_wp_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify({ ids: out.ids, tooltip: out.tooltip, afterClick: out.afterClick?.panel?.status, marks: out.marks.map((m) => [m.h, m.st.map((s) => s.v).join(','), m.panel.status, m.recall?.panel?.notice ?? m.recall?.panel?.status]), endH: out.endH, fatal: out.fatal, errors: out.errors.slice(0, 5) }).slice(0, 4000));
