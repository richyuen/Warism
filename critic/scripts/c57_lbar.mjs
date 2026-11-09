// Critic run 52 (new): R47's landings bar as a player meets it. Takes control of TAG at war with FOE, selects the N
// divisions nearest FROM, orders them to TO by sea; then each day reads the bar (rows: title, status, ships), opens
// the click's row and reads its divisions' voyage lines and its wait line, and reads each division's own panel status;
// screenshots at day 0, 2, the sail day, and the end. With CANCEL=<day>, presses the row's cancel on that day and
// follows the divisions after (back at port? afloat? the row's outcome?).
// Usage: node critic/scripts/c57_lbar.mjs <seed> <TAG> <FOE> <fromLon,fromLat> <toLon,toLat> <N> <label> [W H] [DAYS] [CANCEL]
import { launch, open1938, shot, save, hours, CELLS } from './c57_lib.mjs';

const a = process.argv.slice(2);
const [seed, TAG, FOE, FROM, TO, N, label, W, H, DAYS, CANCEL] = [Number(a[0]), a[1], a[2], a[3], a[4], Number(a[5]), a[6], Number(a[7] ?? 1600), Number(a[8] ?? 900), Number(a[9] ?? 40), a[10] === undefined ? null : Number(a[10])];
const out = { seed, TAG, FOE, FROM, TO, N, label, W, H, cancelDay: CANCEL, days: [], shots: [] };
const { browser, page, errors } = await launch(W, H);
const ll = (s) => s.split(',').map(Number);
const readBar = () =>
  page.evaluate(() => {
    const bar = document.querySelector('[data-testid=landings-bar]');
    if (!bar) return null;
    const r = bar.getBoundingClientRect();
    const rows = [...bar.querySelectorAll('[data-testid=landing-row]')].map((li) => {
      const title = li.querySelector('[data-testid=landing-title]');
      const tb = title?.getBoundingClientRect();
      return {
        id: li.getAttribute('data-landing'),
        state: li.getAttribute('data-state'),
        outcome: li.getAttribute('data-outcome'),
        title: title?.textContent,
        titleCut: title ? title.scrollWidth > title.clientWidth + 1 : null,
        titleBox: tb ? [Math.round(tb.x), Math.round(tb.y), Math.round(tb.width), Math.round(tb.height)] : null,
        status: li.querySelector('[data-testid=landing-status]')?.textContent,
        ships: li.querySelector('[data-testid=landing-ships]')?.textContent ?? null,
        wait: li.querySelector('[data-testid=landing-wait]')?.textContent ?? null,
        divisions: [...li.querySelectorAll('[data-testid=landing-division]')].map((d) => [d.getAttribute('data-formation'), d.getAttribute('data-voyage'), d.textContent]),
        open: li.classList.contains('open'),
      };
    });
    return { box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], vw: innerWidth, vh: innerHeight, scrollW: document.documentElement.scrollWidth, rows };
  });
try {
  await open1938(page, seed);
  const NAT = CELLS.tags[TAG], FOEID = CELLS.tags[FOE];
  const from = ll(FROM), to = ll(TO);
  await page.evaluate(({ a, d }) => window.__warsim.hud.command({ kind: 'declareWar', attacker: a, defender: d }), { a: NAT, d: FOEID });
  await page.evaluate(() => window.__warsim.sim.step(1));
  await page.evaluate((n) => window.__warsim.view.select(n), NAT);
  await page.getByTestId('take-control').click();
  await page.getByTestId('release-control').waitFor({ timeout: 10000 });
  out.barBefore = await readBar();
  const sel = await page.evaluate(({ n, x, y, N }) => {
    const v = window.__warsim.view;
    return v.formationsOf(n).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - x, v.formationPos(id)[1] - y)]).sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, N).map((d) => d[0]);
  }, { n: NAT, x: from[0], y: from[1], N });
  out.ids = sel;
  for (const id of sel) await page.evaluate(({ id, x, y, n }) => window.__warsim.hud.command({ kind: 'moveFormation', id, x, y, nation: n }), { id, x: to[0], y: to[1], n: NAT });
  await page.evaluate(() => window.__warsim.sim.step(2));
  await page.waitForTimeout(600);
  // Is the bar on the screen with the nation panel still open (as Take control leaves it)?
  out.barVisibleWithNationPanel = await page.evaluate(() => { const b = document.querySelector('[data-testid=landings-bar]'); return b ? b.getBoundingClientRect().width > 0 && getComputedStyle(b).display !== 'none' : null; });
  out.shots.push(await shot(page, `c57lbar_${label}_${seed}_${W}_nationpanel.png`));
  if ((await page.getByTestId('nation-close').count()) > 0) await page.getByTestId('nation-close').click();
  await page.waitForTimeout(300);
  let sailed = null, cancelled = false, ended = null;
  for (let d = 0; d <= DAYS; d++) {
    const rec = { day: d, tick: await page.evaluate(() => window.__warsim.view.lastTick) };
    // Open the first row if not open.
    const toggles = page.getByTestId('landing-toggle');
    if ((await toggles.count()) > 0) {
      const openNow = await page.evaluate(() => !!document.querySelector('[data-testid=landing-row].open'));
      if (!openNow) await toggles.first().click();
      await page.waitForTimeout(250);
    }
    rec.bar = await readBar();
    rec.panel = {};
    rec.afloat = {};
    rec.pos = {};
    for (const id of sel) {
      rec.afloat[id] = await page.evaluate((id) => (window.__warsim.view.formationAfloat(id) ? 1 : 0), id);
      rec.pos[id] = await page.evaluate((id) => window.__warsim.view.formationPos(id)?.map((v) => Math.round(v * 10) / 10) ?? null, id);
    }
    // Panels: open each division, read status, and come back (the bar should survive).
    for (const id of sel) {
      await page.evaluate((id) => window.__warsim.hud.selectFormation(id), id);
      await page.waitForTimeout(200);
      rec.panel[id] = await page.evaluate(() => document.querySelector('[data-testid=formation-status]')?.textContent ?? null);
    }
    rec.barWithPanel = await readBar();
    if (d === 0 || d === 2 || (sailed === null && Object.values(rec.afloat).every(Boolean)) || d === CANCEL || d === (CANCEL ?? -9) + 1 || d === DAYS) out.shots.push(await shot(page, `c57lbar_${label}_${seed}_${W}_d${d}.png`));
    await page.evaluate(() => window.__warsim.hud.selectFormation?.(null));
    out.days.push(rec);
    console.log(JSON.stringify({ d, bar: rec.bar?.rows?.map((r) => [r.state, r.status, r.ships, r.wait]), panel: rec.panel, afloat: rec.afloat }));
    if (sailed === null && sel.every((id) => rec.afloat[id])) sailed = out.sailedDay = d;
    if (CANCEL !== null && d === CANCEL && !cancelled) {
      const btn = page.getByTestId('landing-cancel');
      out.cancelButtons = await btn.count();
      if (out.cancelButtons > 0) {
        out.cancelTip = await btn.first().getAttribute('title');
        await btn.first().click();
        cancelled = true;
        await page.waitForTimeout(500);
        out.afterCancelBar = await readBar();
        out.shots.push(await shot(page, `c57lbar_${label}_${seed}_${W}_cancel.png`));
      }
    }
    const rows = rec.bar?.rows ?? [];
    if (ended === null && d > 0 && (rows.length === 0 || rows.every((r) => r.state === 'over'))) ended = out.endedDay = d;
    if (ended !== null && d > ended + 2) break;
    await hours(page, 24);
  }
} catch (e) {
  out.fail = String(e?.stack ?? e);
} finally {
  out.errors = errors;
  save(`c57_lbar_${label}_${seed}_${W}.json`, out);
  await browser.close();
}
