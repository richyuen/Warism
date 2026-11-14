// Critic run 60 (new): R58b in the page. Play TAG at war with FOE, send the N nearest divisions of FROM to TO (as
// c59_whotold), then every STEP hours to AT: each division's panel line about its voyage, the ticker's order rows,
// and the landings bar's rows. Every panel/ticker text with "next voyage" or "come back" is logged with its hour; a
// shot of the first panel that says it. Usage: node c68_nvpage.mjs <seed> <TAG> <FOE> <from> <to> <N> <AT> [STEP] [W H]
import { launch, open1938, shot, save, hours, CELLS } from './c68_lib.mjs';
const a = process.argv.slice(2);
const [seed, TAG, FOE, FROM, TO, N, AT, STEP, W, H] = [Number(a[0]), a[1], a[2], a[3], a[4], Number(a[5]), Number(a[6]), Number(a[7] ?? 6), Number(a[8] ?? 1600), Number(a[9] ?? 900)];
const out = { seed, TAG, FOE, FROM, TO, N, AT, samples: [], hits: [] };
const { browser, page, errors } = await launch(W, H);
const ll = (s) => s.split(',').map(Number);
let shotDone = false;
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
  for (const id of sel) await page.evaluate(({ id, x, y, n }) => window.__warsim.hud.command({ kind: 'moveFormation', id, x, y, nation: n }), { id, x: to[0], y: to[1], n: NAT });
  if ((await page.getByTestId('nation-close').count()) > 0) await page.getByTestId('nation-close').click();
  for (let h = STEP; h <= AT; h += STEP) {
    await hours(page, STEP);
    await page.waitForTimeout(200);
    const tick = await page.evaluate(() => window.__warsim.view.lastTick);
    const s = { h, tick, divs: {}, rows: [], ticker: [] };
    s.rows = await page.evaluate(() => [...document.querySelectorAll('[data-testid=landing-row]')].map((li) => li.innerText.replace(/\s+/g, ' ')));
    s.ticker = await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row], [data-testid=order-news]')].map((r) => r.innerText.replace(/\s+/g, ' ')).filter((t) => !/declared war|made peace/.test(t)));
    for (const id of sel) {
      await page.evaluate((id) => window.__warsim.hud.selectFormation(id), id);
      await page.waitForTimeout(120);
      s.divs[id] = await page.evaluate(() => {
        const p = document.querySelector('[data-testid=formation-panel]');
        if (!p) return null;
        const st = document.querySelector('[data-testid=formation-status]')?.textContent ?? null;
        const lines = p.innerText.split('\n').filter((l) => /voyage|come back|port|transports|ashore|landing/i.test(l));
        return { st, lines };
      });
      const d = s.divs[id];
      const text = d ? d.lines.join(' | ') : '';
      if (/next voyage|come back/i.test(text)) {
        out.hits.push({ h, tick, id, text });
        if (!shotDone) { shotDone = true; await shot(page, `c68nv_${seed}_${TAG}_${id}_h${h}_${W}x${H}.png`); }
      }
    }
    for (const t of [...s.rows, ...s.ticker]) if (/next voyage|come back/i.test(t)) out.hits.push({ h, tick, where: 'bar/ticker', text: t });
    out.samples.push(s);
  }
  await page.keyboard.press('Escape');
  await shot(page, `c68nv_${seed}_${TAG}_end_h${AT}_${W}x${H}.png`);
} catch (e) { out.fail = String(e?.stack ?? e).slice(0, 600); }
out.errors = errors;
save(`c68_nvpage_${TAG}_${seed}_${N}_${W}x${H}.json`, out);
await browser.close();
console.log(JSON.stringify({ ids: out.ids, hits: out.hits.slice(0, 60), fail: out.fail, errors: errors.length }, null, 1));
