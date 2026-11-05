// Critic run 36 (copy of run 35) (R22c, R22e, new): the aboard division's panel at a given viewport. 1938 seed 3517, Japan played, the four
// divisions nearest Tokyo ordered to Shanghai through the page's own command (escort on); at hours 4 and 200 the first's
// panel: Status and Landing rows' boxes (label right edge vs value left edge), text, and a crop.
// Usage: node critic/scripts/c38_lwp_phonepanel.mjs <w> <h> <tag>
import { launch, open1938, save, hours, CELLS } from './c31_lib.mjs';
const [wS, hS, tag] = process.argv.slice(2);
const nat = CELLS.tags.JAP;
const out = { marks: [] };
const { browser, page, errors } = await launch(Number(wS), Number(hS));
try {
  await open1938(page, 3517);
  await page.evaluate((n) => window.__warsim.view.select(n), nat);
  await page.waitForTimeout(500);
  await page.getByTestId('take-control').click();
  await page.waitForSelector('[data-testid=release-control]', { timeout: 10_000 });
  const ids = await page.evaluate(({ nat }) => {
    const v = window.__warsim.view;
    return v.formationsOf(nat).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - 1818.5, v.formationPos(id)[1] - 385.5)]).sort((a, b) => a[1] - b[1]).slice(0, 4).map((d) => d[0]);
  }, { nat });
  out.ids = ids;
  for (const id of ids) await page.evaluate(({ id, n }) => window.__warsim.hud.command({ kind: 'moveFormation', id, x: 1715.5, y: 413.5, nation: n, escort: true }), { id, n: nat });
  let h = 0;
  for (const at of [4, 200, 1100]) {
    await hours(page, at - h); h = at;
    await page.evaluate((id) => { const v = window.__warsim.view; v.selectedFormations.clear(); v.selectedFormations.add(id); window.__warsim.hud.selectFormation(id); }, ids[0]);
    await page.waitForTimeout(600);
    const rows = await page.evaluate(() => [...document.querySelectorAll('[data-testid=formation-panel] .panel-row')].map((r) => {
      const a = r.children[0], b = r.children[r.children.length - 1];
      if (!a || !b || a === b) return { text: r.innerText };
      const ra = a.getBoundingClientRect();
      const rects = [...b.getClientRects()];
      const left = Math.min(...rects.map((x) => x.left));
      return { label: a.innerText, value: b.innerText.replace(/\n/g, ' '), labelRight: Math.round(ra.right), valueLeft: Math.round(left), gap: Math.round(left - ra.right), lines: Math.round(b.getBoundingClientRect().height / 20) };
    }));
    const crop = `critic/shots/c38lwp_${tag}_h${at}_panel.png`;
    await page.getByTestId('formation-panel').screenshot({ path: crop }).catch(() => {});
    const full = `critic/shots/c38lwp_${tag}_h${at}.png`;
    await page.screenshot({ path: full });
    out.marks.push({ h: at, rows: rows.filter((r) => /Status|Landing|Kind|Nation/.test(r.label ?? '')), crop, full });
  }
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c38_lwp_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 4000));
