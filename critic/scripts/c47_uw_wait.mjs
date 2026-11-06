// Critic run 45 (new): R36a's wait for room, read on the page. Japan <seed>: the NS (4) nearest Tokyo sent to Shanghai (API); when the
// first stands at its port +2 h the first two are selected and clicked onto Fuzhou (one click, as c47_sp_split). Then, whenever both of
// the two stand gathering at Tokyo (ashore, the landing not sailed), their panels (status, wait, notice) and the map are read, the first
// time and every 48 h after (at most 4); the hour each lands is logged. Usage: node critic/scripts/c47_uw_wait.mjs <seed> <days> <tag>
import { launch, open1938, shot, save, settle, CELLS } from './c47_lib.mjs';
const [seedS, daysS, tag] = process.argv.slice(2);
const seed = Number(seedS), days = Number(daysS);
const nat = CELLS.tags.JAP;
const TOKYO = [1818.5, 385.5], SH = [1715.5, 413.5], FZ = [1703.5, 445.5];
const out = { seed, tag, steps: [], panels: [] };
const { browser, page, errors } = await launch(1600, 900);
async function camAt(x, y, m) {
  await page.evaluate(({ x, y, m }) => { const v = window.__warsim.view; v.controller.set({ cx: x, cy: y, scale: (v.metresPerPx * v.controller.cam.scale) / m }); }, { x, y, m });
  await page.waitForTimeout(300); await settle(page, 6000);
}
async function hoverCentre() {
  const cb = await page.locator('canvas').first().boundingBox();
  const cx = cb.x + cb.width / 2, cy = cb.y + cb.height / 2;
  await page.mouse.move(cx + 5, cy + 5); await page.mouse.move(cx, cy); await page.waitForTimeout(900);
  return [cx, cy];
}
const st = (ids) => page.evaluate(async (ids) => {
  const r = [];
  for (const id of ids) { const f = await window.__warsim.sim.formation(id); const p = window.__warsim.view.formationPos(id); r.push({ id, v: f?.voyage?.state ?? null, port: f?.voyage?.port ?? null, p: p ? [+p[0].toFixed(1), +p[1].toFixed(1)] : null }); }
  return r;
}, ids);
const panel = async () => ({
  status: await page.getByTestId('formation-status').innerText({ timeout: 500 }).catch(() => null),
  wait: await page.getByTestId('formation-wait').innerText({ timeout: 500 }).catch(() => null),
  notice: await page.getByTestId('formation-notice').innerText({ timeout: 500 }).catch(() => null),
  voyage: await page.locator('[data-testid^=formation-voyage], [data-testid=formation-landing]').allInnerTexts().catch(() => null),
});
const step = (n) => page.evaluate(async (n) => { const w = window.__warsim; const t = w.view.lastTick + n; await w.sim.step(n); const t0 = performance.now(); await new Promise((d) => { const f = () => (w.view.lastTick >= t || performance.now() - t0 > 600000 ? d() : setTimeout(f, 10)); f(); }); }, n);
const pick = async (list) => page.evaluate((list) => { const p = window.__warsim.player; p.clearSelection(); p.boxSelect(list, false); window.__warsim.hud.selectFormation(list[0]); }, list);
const rows = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=order-news]')].map((x) => [x.getAttribute('data-order'), x.innerText.replace(/\s+/g, ' ')]));
try {
  await open1938(page, seed);
  await page.evaluate((n) => window.__warsim.view.select(n), nat);
  await page.waitForTimeout(400);
  await page.getByTestId('take-control').click();
  await page.waitForSelector('[data-testid=release-control]', { timeout: 10_000 });
  await page.evaluate(() => { window.__news = []; window.__warsim.sim.onOrderNews((m) => window.__news.push({ ...m, at: window.__warsim.hud.stats.value?.tick ?? null })); });
  const NS = Number(process.env.NS ?? 4);
  const ids = await page.evaluate(({ nat, x, y, NS }) => {
    const v = window.__warsim.view;
    return v.formationsOf(nat).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - x, v.formationPos(id)[1] - y)]).sort((a, b) => a[1] - b[1]).slice(0, NS).map((d) => d[0]);
  }, { nat, x: TOKYO[0], y: TOKYO[1], NS });
  out.ids = ids;
  for (const id of ids) await page.evaluate(({ id, x, y, n }) => window.__warsim.hud.command({ kind: 'moveFormation', id, x, y, nation: n, escort: true }), { id, x: SH[0], y: SH[1], n: nat });
  let h = 0, g = null;
  while (h < 96 && g === null) { await step(1); h++; g = (await st(ids)).find((s) => s.v === 'gathering')?.id ?? null; }
  await step(2); h += 2;
  const two = ids.slice(0, Number(process.env.NRE ?? 2));
  await camAt(FZ[0], FZ[1], 600);
  await pick(two); const [cx, cy] = await hoverCentre();
  await page.mouse.click(cx, cy); await page.waitForTimeout(400);
  out.click = { h, rows: await rows() };
  const landed = {};
  let nextPanel = -1;
  while (h < days * 24) {
    await step(6); h += 6;
    const s = await st(ids);
    for (const x of s) if (!landed[x.id] && x.v === null && x.p && (Math.hypot(x.p[0] - FZ[0], x.p[1] - FZ[1]) < 8 || Math.hypot(x.p[0] - SH[0], x.p[1] - SH[1]) < 6)) landed[x.id] = { h, p: x.p };
    if (h % 24 === 0) out.steps.push({ h, st: s.map((x) => `${x.id}:${x.v ?? '-'}@${x.p}`).join(' ') });
    const a = s.find((x) => x.id === two[0]), b = s.find((x) => x.id === two[1]);
    const atTokyo = (x) => x.v === 'gathering' && x.p && Math.hypot(x.p[0] - TOKYO[0], x.p[1] - TOKYO[1]) < 3;
    if (atTokyo(a) && atTokyo(b) && out.panels.length < 4 && (nextPanel < 0 || h >= nextPanel)) {
      nextPanel = h + 48;
      const ps = [];
      for (const id of two) { await pick([id]); await page.waitForTimeout(400); ps.push({ id, ...(await panel()) }); }
      await camAt(TOKYO[0], TOKYO[1], 1200);
      out.panels.push({ h, ps, rows: await rows(), shot: await shot(page, `c47uw_${tag}_h${h}.png`) });
    }
    const sea = s.filter((x) => two.includes(x.id) && x.v === 'atSea'), left = s.filter((x) => two.includes(x.id) && x.v !== 'atSea' && x.v !== null && x.p && Math.hypot(x.p[0] - TOKYO[0], x.p[1] - TOKYO[1]) < 3);
    if (sea.length && left.length && (out.stranded ?? []).length < 3 && h - (out.stranded?.at(-1)?.h ?? -999) >= 72) {
      out.stranded = out.stranded ?? [];
      await pick([left[0].id]); await page.waitForTimeout(400); await camAt(TOKYO[0], TOKYO[1], 1200);
      out.stranded.push({ h, who: left[0].id, st: s, ...(await panel()), rows: await rows(), shot: await shot(page, `c47uw_${tag}_stranded_h${h}.png`) });
    }
    if (ids.every((id) => landed[id])) break;
  }
  out.landed = landed; out.endH = h; out.end = await st(ids);
  out.rows = await rows();
  out.news = await page.evaluate(() => window.__news);
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c47_uw_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify({ ids: out.ids, click: out.click, panels: out.panels, landed: out.landed, end: out.end, fatal: out.fatal, errors: out.errors.slice(0, 5) }));
