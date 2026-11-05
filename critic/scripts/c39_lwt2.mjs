// Critic run 36 (copy of run 35; acts near / allnear added: a real click NPX px east of Shanghai's centre, the one aboard alone or every division of the click) (R22b, R22c, R22d, R22e, new): the landing's wait in the page. 1938 seed <seed>, Japan played (at war with
// China at the start); the <n> divisions nearest Tokyo selected (by the API) and sent to Shanghai by a real click, escort
// box ticked. Every 3 hours: each division's voyage (and `wait`), the first aboard's panel (Status, Landing, notice);
// shots and crops of the panel at the first boarding and at set hours. At hour <actH> (-1 none) with the first aboard
// alone selected, a real click at <act>: 'recall' (Japan's coast by the port), 'sea' (open Pacific), 'neutral' (Manila,
// the USA's at peace) and what the panel says after; then on to <days> days or every division landed.
// Usage: node critic/scripts/c39_lwt_landwait.mjs <seed> <n> <days> <actH> <act> <w> <h> <tag>
import { launch, open1938, shot, save, hours, CELLS, settle } from './c31_lib.mjs';
const [seedS, nS, daysS, actS, act, wS, hS, tag] = process.argv.slice(2);
const seed = Number(seedS), n = Number(nS), days = Number(daysS), actH = Number(actS);
const nat = CELLS.tags.JAP;
const src = [1818.5, 385.5], dst = [1715.5, 413.5];
const actAt = { recall: [1814.5, 381.5], sea: [1900.5, 420.5], neutral: [1034.5, 279.5], same: [1715.5, 413.5], near: [1715.5, 413.5], allnear: [1715.5, 413.5] }[act] ?? null;
const out = { seed, n, days, actH, act, trace: [], marks: [], rows: [] };
const { browser, page, errors } = await launch(Number(wS), Number(hS));
const panel = async () => ({
  open: await page.getByTestId('formation-panel').isVisible().catch(() => false),
  id: await page.getByTestId('formation-panel').getAttribute('data-formation', { timeout: 300 }).catch(() => null),
  status: await page.getByTestId('formation-status').innerText({ timeout: 300 }).catch(() => null),
  wait: await page.getByTestId('formation-wait').innerText({ timeout: 300 }).catch(() => null),
  notice: await page.getByTestId('formation-notice').innerText({ timeout: 300 }).catch(() => null),
  text: (await page.getByTestId('formation-panel').innerText({ timeout: 300 }).catch(() => '')).slice(0, 900),
});
const states = (ids) => page.evaluate(async (ids) => {
  const r = [];
  for (const id of ids) { const f = await window.__warsim.sim.formation(id); const p = window.__warsim.view.formationPos(id); r.push({ id, alive: !!f, v: f?.voyage?.state ?? null, port: f?.voyage?.port ?? null, wait: f?.voyage?.wait ?? null, moving: f?.moving ?? null, p: p ? [+p[0].toFixed(1), +p[1].toFixed(1)] : null }); }
  return r;
}, ids);
const rows = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row]')].map((x) => x.innerText.replace(/\n/g, ' ')));
const select = (id) => page.evaluate((id) => { const v = window.__warsim.view; v.selectedFormations.clear(); v.selectedFormations.add(id); window.__warsim.hud.selectFormation(id); }, id);
const NPX = Number(process.env.NPX ?? 0);
async function clickAt(x, y, off = 0) {
  await page.evaluate(({ x, y }) => window.__warsim.view.showPlace(x, y), { x, y });
  await page.waitForTimeout(1500); await settle(page, 6000);
  const cb = await page.locator('canvas').first().boundingBox();
  const cx = cb.x + cb.width / 2 + off, cy = cb.y + cb.height / 2;
  out.scale = await page.evaluate(() => ({ pxPerCell: window.__warsim.view.lastCam?.scale ?? null, mPerPx: window.__warsim.view.metresPerPx })).catch(() => null);
  await page.mouse.move(cx + 4, cy + 4); await page.mouse.move(cx, cy); await page.waitForTimeout(600);
  const tip = await page.evaluate(() => document.querySelector('[data-testid=map-tooltip], .map-tooltip')?.innerText ?? null);
  await page.mouse.click(cx, cy);
  return tip;
}
async function panelShot(name) {
  const loc = page.getByTestId('formation-panel');
  const p = `critic/shots/${name}`;
  await loc.screenshot({ path: p }).catch(() => {});
  return p;
}
try {
  await open1938(page, seed);
  await page.evaluate((n) => window.__warsim.view.select(n), nat);
  await page.waitForTimeout(500);
  await page.getByTestId('take-control').click();
  await page.waitForSelector('[data-testid=release-control]', { timeout: 10_000 });
  await page.evaluate(() => { window.__news = []; window.__warsim.sim.onOrderNews((m) => window.__news.push({ ...m, at: window.__warsim.hud.stats.value?.tick ?? null })); });
  const ids = await page.evaluate(({ nat, x, y, n }) => {
    const v = window.__warsim.view;
    return v.formationsOf(nat).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - x, v.formationPos(id)[1] - y)]).sort((a, b) => a[1] - b[1]).slice(0, n).map((d) => d[0]);
  }, { nat, x: src[0], y: src[1], n });
  out.ids = ids;
  await page.evaluate((ids) => { const v = window.__warsim.view; for (const id of ids) v.selectedFormations.add(id); window.__warsim.hud.selectFormation(ids[0]); }, ids);
  await page.waitForSelector('[data-testid=formation-panel]', { timeout: 10_000 });
  const box = page.getByTestId('formation-escort');
  out.escortBox = await box.isVisible().catch(() => false);
  if (out.escortBox && !(await box.isChecked())) await box.click();
  out.tooltip = await clickAt(dst[0], dst[1]);
  await hours(page, 1);
  let h = 1, firstAboard = null, acted = false;
  const marks = new Set([3, 24, 120, 240, 480, 720, 960, 1110, 1150, 1200]);
  while (h < days * 24) {
    await hours(page, 3); h += 3;
    const st = await states(ids);
    const ab = st.find((s) => s.v === 'aboard');
    if (ab && firstAboard === null) firstAboard = ab.id;
    let pn = null;
    const mk = [...marks].find((m) => h >= m && h < m + 3);
    if (firstAboard !== null) {
      await select(firstAboard); await page.waitForTimeout(250);
      pn = await panel();
      if (mk !== undefined) {
        marks.delete(mk);
        out.marks.push({ h, st, panel: pn, crop: await panelShot(`c39lwt2_${tag}_h${h}_panel.png`), shot: await shot(page, `c39lwt2_${tag}_h${h}.png`) });
      }
    }
    out.trace.push({ h, st: st.map((s) => `${s.id}:${s.v ?? '-'}${s.wait ? `(${s.wait.aboard}/${s.wait.of},${s.wait.days})` : ''}`).join(' '), wait: pn?.wait ?? null, status: pn?.status ?? null, notice: pn?.notice ?? null });
    for (const r of await rows()) if (!out.rows.includes(r) && out.rows.length < 80) out.rows.push(r);
    if (!acted && actAt && actH >= 0 && h >= actH && firstAboard !== null && st.find((s) => s.id === firstAboard)?.v === 'aboard') {
      acted = true;
      await select(firstAboard); await page.waitForTimeout(300);
      const before = { panel: await panel(), st: (await states([firstAboard]))[0] };
      if (act === 'allnear') await page.evaluate((ids) => { const v = window.__warsim.view; for (const id of ids) v.selectedFormations.add(id); }, ids);
      const tip = await clickAt(actAt[0], actAt[1], act === 'near' || act === 'allnear' ? NPX : 0);
      await hours(page, 1); h += 1;
      await select(firstAboard); await page.waitForTimeout(300);
      out.act = { h, tip, before, after: { panel: await panel(), st: (await states([firstAboard]))[0] }, crop: await panelShot(`c39lwt2_${tag}_act_panel.png`), shot: await shot(page, `c39lwt2_${tag}_act.png`) };
      await hours(page, 6); h += 6;
      await select(firstAboard); await page.waitForTimeout(300);
      out.act.after6 = { panel: await panel(), st: (await states([firstAboard]))[0] };
    }
    if (st.every((s) => !s.alive || (s.p && Math.hypot(s.p[0] - dst[0], s.p[1] - dst[1]) < 10 && s.v !== 'aboard' && s.v !== 'atSea'))) { out.endH = h; break; }
  }
  out.final = await states(ids);
  out.finalH = h;
  out.news = await page.evaluate(() => window.__news);
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c39_lwt2_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify({ ids: out.ids, tooltip: out.tooltip, act: out.act ? { tip: out.act.tip, before: out.act.before.panel.status, after: [out.act.after.panel.status, out.act.after.panel.notice, out.act.after.st], after6: [out.act.after6?.panel.status, out.act.after6?.panel.notice, out.act.after6?.st] } : null, trace: out.trace.filter((_, i) => i % 8 === 0).map((t) => [t.h, t.st, t.wait, t.status]), endH: out.endH, final: out.final, fatal: out.fatal, errors: out.errors.slice(0, 5) }).slice(0, 6000));
