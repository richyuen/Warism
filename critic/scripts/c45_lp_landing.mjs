// Critic run 34 (copy of run 33) (R17, new): a landing as a player orders it. 1938 seed <seed>, the player takes <TAG>; the <n> land
// divisions nearest (srcLon, srcLat) are selected; the camera goes to (dstLon, dstLat) at <m> m/px; the mouse hovers
// there (tooltip read) and left-clicks (the order). The escort box set to <escort>. Then hours in steps of 3, up to
// <days>, recording each division's voyage state, position, the panel's status and notice, the ticker rows, and a
// screenshot at each new state of the first division (camera on it). Optional: war with <foe> declared first by God.
// Usage: node critic/scripts/c45_lp_landing.mjs <seed> <TAG> <srcX> <srcY> <dstX> <dstY> (cells) <n> <escort 1|0> <days> <tag> [foeTAG]
import { launch, open1938, shot, save, hours, CELLS, settle } from './c31_lib.mjs';
const [seedS, TAG, sLon, sLat, dLon, dLat, nS, escS, daysS, tag, FOE] = process.argv.slice(2);
const seed = Number(seedS), nat = CELLS.tags[TAG], n = Number(nS), escort = escS === '1', days = Number(daysS);
const out = { seed, TAG, src: [+sLon, +sLat], dst: [+dLon, +dLat], n, escort, states: [], samples: [], notices: [], ticker: [] };
const { browser, page, errors } = await launch(1600, 900);
const cell = (lon, lat) => page.evaluate(({ lon, lat }) => {
  const l = window.__warsim.sim.mapLayers; const w = l.w ?? l.width; const h = l.h ?? l.height;
  return [Math.floor(((lon + 180) / 360) * w) + 0.5, Math.floor(((90 - lat) / 180) * h) + 0.5];
}, { lon, lat });
const tickerRows = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row]')].map((r) => r.innerText.replace(/\n/g, ' ')));
try {
  await open1938(page, seed);
  if (FOE) {
    await page.getByTestId('god-btn').click();
    await page.evaluate(({ a, b }) => window.__warsim.hud.command({ kind: 'forceWar', attacker: a, defender: b }), { a: nat, b: CELLS.tags[FOE] }).catch((e) => { out.warErr = String(e); });
    await hours(page, 1);
    await page.getByTestId('god-btn').click().catch(() => {});
  }
  await page.evaluate((n) => window.__warsim.view.select(n), nat);
  await page.waitForTimeout(500);
  await page.getByTestId('take-control').click();
  await page.waitForSelector('[data-testid=release-control]', { timeout: 10_000 });
  const src = [+sLon, +sLat], dst = [+dLon, +dLat]; // cells (critic/scripts/c45_cells.ts)
  out.srcCell = src; out.dstCell = dst;
  const divs = await page.evaluate(({ nat, x, y, n }) => {
    const v = window.__warsim.view;
    return v.formationsOf(nat).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - x, v.formationPos(id)[1] - y)]).sort((a, b) => a[1] - b[1]).slice(0, n);
  }, { nat, x: src[0], y: src[1], n });
  out.divs = divs;
  const ids = divs.map((d) => d[0]);
  await page.evaluate((ids) => { const v = window.__warsim.view; for (const id of ids) v.selectedFormations.add(id); window.__warsim.hud.selectFormation(ids[0]); }, ids);
  await page.waitForSelector('[data-testid=formation-panel]', { timeout: 10_000 });
  const box = page.getByTestId('formation-escort');
  out.escortBoxVisible = await box.isVisible().catch(() => false);
  out.escortBoxDefault = out.escortBoxVisible ? await box.isChecked() : null;
  if (out.escortBoxVisible && out.escortBoxDefault !== escort) await box.click();
  out.shotPanel = await shot(page, `c45lp_${tag}_panel.png`);
  // camera to the landing, hover, read the tooltip, click
  await page.evaluate(({ x, y }) => { const v = window.__warsim.view; v.showPlace(x, y); }, { x: dst[0], y: dst[1] });
  await page.waitForTimeout(2500); await settle(page, 8000);
  const cb = await page.locator('canvas').first().boundingBox();
  const cx = cb.x + cb.width / 2, cy = cb.y + cb.height / 2;
  await page.mouse.move(cx + 4, cy + 4); await page.mouse.move(cx, cy); await page.waitForTimeout(600);
  out.tooltip = await page.evaluate(() => document.querySelector('[data-testid=map-tooltip], .map-tooltip')?.innerText ?? null);
  out.tooltipBySea = await page.getByTestId('tooltip-by-sea').isVisible().catch(() => false);
  out.mpp = await page.evaluate(() => window.__warsim.view.metresPerPx);
  out.shotHover = await shot(page, `c45lp_${tag}_hover.png`);
  await page.mouse.click(cx, cy);
  await hours(page, 1);
  out.afterClick = { notice: await page.getByTestId('formation-notice').innerText({ timeout: 500 }).catch(() => null), status: await page.getByTestId('formation-status').innerText({ timeout: 500 }).catch(() => null), ticker: (await tickerRows()).slice(0, 6) };
  out.shotClick = await shot(page, `c45lp_${tag}_click.png`);
  let lastState = 'none';
  for (let h = 0; h < days * 24; h += 3) {
    await hours(page, 3);
    const st = await page.evaluate(async (ids) => {
      const r = [];
      for (const id of ids) { const f = await window.__warsim.sim.formation(id); const p = window.__warsim.view.formationPos(id); r.push({ id, alive: !!f, v: f?.voyage?.state ?? null, port: f?.voyage?.port ?? null, nation: f?.nation, p: p ? [+p[0].toFixed(1), +p[1].toFixed(1)] : null, afloat: window.__warsim.view.formationAfloat(id) }); }
      return r;
    }, ids);
    const s0 = st.map((s) => s.v ?? (s.alive ? 'none' : 'dead')).join(',');
    const notice = await page.getByTestId('formation-notice').innerText({ timeout: 500 }).catch(() => null);
    if (notice && !out.notices.includes(notice)) out.notices.push(notice);
    for (const r of await tickerRows()) if (!out.ticker.includes(r) && out.ticker.length < 60) out.ticker.push(r);
    if (s0 !== lastState) {
      lastState = s0;
      const status = await page.getByTestId('formation-status').innerText({ timeout: 500 }).catch(() => null);
      const e = { h: h + 3, states: st, status };
      const lead = st.find((s) => s.p);
      if (lead) { await page.evaluate(({ x, y }) => window.__warsim.view.showPlace(x, y), { x: lead.p[0], y: lead.p[1] }); await page.waitForTimeout(2000); await settle(page, 5000); e.shot = await shot(page, `c45lp_${tag}_h${h + 3}.png`); }
      out.states.push(e);
    }
    if (h % 72 === 0) out.samples.push({ h, s0 });
    if (st.every((s) => s.v === 'landed' || !s.alive) && h > 6) { out.endH = h + 3; break; }
  }
  out.final = await page.evaluate(async (ids) => { const r = []; for (const id of ids) { const f = await window.__warsim.sim.formation(id); const p = window.__warsim.view.formationPos(id); r.push({ id, v: f?.voyage?.state ?? null, p }); } return r; }, ids);
  out.shotEnd = await shot(page, `c45lp_${tag}_end.png`);
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c45_lp_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify({ ...out, states: out.states.map((s) => [s.h, s.states.map((x) => x.v).join(','), s.status]) }).slice(0, 4000));
