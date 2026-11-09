// Critic run 52 (new): R48c's claim measured, not clicked. Playwright's click scrolls a button into view, so c59_lbar
// "finds" a cancel that a player must scroll for. Here: TAG at war with FOE takes control, sends the N divisions nearest
// FROM to TO by sea, closes any panel, opens the first row; each day, with every scroll in the bar reset to 0, reads
// the box of the cancel and of each division line: inside the viewport? inside the bar? the topmost element at its
// centre (not hidden under the bottom bar or clipped by the list's scroll)? Shots on day 0 and the last day.
// Usage: node critic/scripts/c59_lbox.mjs <seed> <TAG> <FOE> <fromX,Y> <toX,Y> <N> <label> [W H] [DAYS]
import { launch, open1938, shot, save, hours, CELLS } from './c59_lib.mjs';

const a = process.argv.slice(2);
const [seed, TAG, FOE, FROM, TO, N, label] = [Number(a[0]), a[1], a[2], a[3], a[4], Number(a[5]), a[6]];
const W = Number(a[7] ?? 844), H = Number(a[8] ?? 390), DAYS = Number(a[9] ?? 6);
const out = { seed, TAG, FOE, FROM, TO, N, label, W, H, days: [], shots: [] };
const { browser, page, errors } = await launch(W, H);
const ll = (s) => s.split(',').map(Number);
const measure = () =>
  page.evaluate(() => {
    const bar = document.querySelector('[data-testid=landings-bar]');
    if (!bar) return null;
    for (const el of [bar, ...bar.querySelectorAll('*')]) if (el.scrollTop) el.scrollTop = 0;
    const br = bar.getBoundingClientRect();
    const vis = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
      const top = document.elementFromPoint(cx, cy);
      return {
        text: (el.textContent ?? '').slice(0, 90),
        box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
        inViewport: r.top >= 0 && r.bottom <= innerHeight + 0.5 && r.left >= 0 && r.right <= innerWidth + 0.5,
        inBar: r.top >= br.top - 0.5 && r.bottom <= br.bottom + 0.5,
        topmost: !!top && (top === el || el.contains(top)),
        topmostIs: top ? `${top.tagName}.${top.className}`.slice(0, 60) : null,
      };
    };
    const row = bar.querySelector('[data-testid=landing-row].open') ?? bar.querySelector('[data-testid=landing-row]');
    return {
      bar: [Math.round(br.x), Math.round(br.y), Math.round(br.width), Math.round(br.height)],
      rows: bar.querySelectorAll('[data-testid=landing-row]').length,
      title: row?.querySelector('[data-testid=landing-title]')?.textContent ?? null,
      status: row?.querySelector('[data-testid=landing-status]')?.textContent ?? null,
      open: row?.classList.contains('open') ?? null,
      cancel: vis(row?.querySelector('[data-testid=landing-cancel]')),
      divisions: [...(row?.querySelectorAll('[data-testid=landing-division]') ?? [])].map(vis),
      parts: [...(row?.querySelectorAll('[data-testid=landing-part]') ?? [])].map(vis),
      bottomBar: (() => { const b = document.querySelector('.bottom-bar, [data-testid=bottom-bar]'); if (!b) return null; const r = b.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; })(),
      scrollW: document.documentElement.scrollWidth,
    };
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
  const sel = await page.evaluate(({ n, x, y, N }) => {
    const v = window.__warsim.view;
    return v.formationsOf(n).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - x, v.formationPos(id)[1] - y)]).sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, N).map((d) => d[0]);
  }, { n: NAT, x: from[0], y: from[1], N });
  out.ids = sel;
  await page.evaluate(({ sel, x, y, n }) => window.__warsim.hud.commands(sel.map((id) => ({ kind: 'moveFormation', id, x, y, nation: n }))), { sel, x: to[0], y: to[1], n: NAT });
  await page.evaluate(() => window.__warsim.sim.step(2));
  await page.waitForTimeout(600);
  if ((await page.getByTestId('nation-close').count()) > 0) await page.getByTestId('nation-close').click();
  await page.waitForTimeout(300);
  for (let d = 0; d <= DAYS; d++) {
    const openNow = await page.evaluate(() => !!document.querySelector('[data-testid=landing-row].open'));
    if (!openNow && (await page.getByTestId('landing-toggle').count()) > 0) {
      // A click at the toggle's own place, not Playwright's scrolling click.
      const bb = await page.getByTestId('landing-toggle').first().boundingBox();
      if (bb) await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
      await page.waitForTimeout(250);
    }
    const m = await measure();
    out.days.push({ day: d, m });
    console.log(JSON.stringify({ d, rows: m?.rows, status: m?.status, cancel: m?.cancel && [m.cancel.inViewport, m.cancel.inBar, m.cancel.topmost], divs: m?.divisions?.map((v) => [v.inViewport, v.inBar, v.topmost]) }));
    if (d === 0 || d === DAYS) out.shots.push(await shot(page, `c59lbox_${label}_${seed}_${W}x${H}_d${d}.png`));
    if (!m || m.rows === 0) break;
    await hours(page, 24);
  }
} catch (e) {
  out.fail = String(e?.stack ?? e);
} finally {
  out.errors = errors;
  save(`c59_lbox_${label}_${seed}_${W}x${H}.json`, out);
  await browser.close();
}
