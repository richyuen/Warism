// Critic run 76 (new): R141, a row of History flies to its place. Plain 1938 SEED stepped DAYS; History opened; for
// each kind of row with a link (history-go), the first row of it clicked: is its place then in the view, and is the
// point on the map's canvas (not under History, the bars, the ticker)? History opened again before each. Also counted:
// rows with a link and without, by kind.
// Usage: [BASE=...] node critic/scripts/c76_histPlace.mjs <seed> <days> [W H]
import { launch, open1938, shot, save, hours } from './c76_lib.mjs';
const seed = Number(process.argv[2] ?? 59961), DAYS = Number(process.argv[3] ?? 300);
const W = Number(process.argv[4] ?? 1600), H = Number(process.argv[5] ?? 900);
const out = { seed, DAYS, W, H, clicks: [] };
const { browser, page, errors } = await launch(W, H);
const P = `c76hp_${seed}_${W}x${H}`;
const openHist = async () => { await page.evaluate(() => { if (!window.__warsim.hud.showHistory.value) window.__warsim.hud.toggleHistory(); }); await page.waitForSelector('[data-testid=history-row]', { timeout: 60_000 }); await page.waitForTimeout(400); };
try {
  await open1938(page, seed, '&heroes=on');
  await hours(page, DAYS * 24);
  await page.waitForTimeout(800);
  await openHist();
  out.byKind = await page.evaluate(() => {
    const m = {};
    for (const r of document.querySelectorAll('[data-testid=history-row]')) { const k = r.getAttribute('data-kind-name'); const link = !!r.querySelector('[data-testid=history-go]'); m[k] ??= [0, 0]; m[k][link ? 0 : 1]++; }
    return m;
  });
  const kinds = Object.entries(out.byKind).filter(([, v]) => v[0] > 0).map(([k]) => k);
  for (const k of kinds) {
    await openHist();
    const target = await page.evaluate((k) => {
      const row = [...document.querySelectorAll('[data-testid=history-row]')].find((r) => r.getAttribute('data-kind-name') === k && r.querySelector('[data-testid=history-go]'));
      const b = row.querySelector('[data-testid=history-go]');
      b.scrollIntoView({ block: 'center' });
      return { x: Number(b.getAttribute('data-x')), y: Number(b.getAttribute('data-y')), text: b.innerText.slice(0, 120) };
    }, k);
    await page.locator('[data-testid=history-row]').filter({ has: page.locator(`[data-testid=history-go][data-x="${target.x}"][data-y="${target.y}"]`) }).first().locator('[data-testid=history-go]').click();
    await page.waitForTimeout(2500);
    const res = await page.evaluate(({ x, y }) => {
      const v = window.__warsim.view, c = v.controller.cam, canvas = v.canvas, vw = canvas.clientWidth, vh = canvas.clientHeight, at = canvas.getBoundingClientRect();
      let dx = x - c.cx; if (v.geo.wrapX) dx -= v.geo.w * Math.round(dx / v.geo.w);
      const sx = dx * c.scale + vw / 2, sy = (y - c.cy) * c.scale + vh / 2;
      const inView = sx >= 0 && sy >= 0 && sx <= vw && sy <= vh;
      const el = document.elementFromPoint(at.left + sx, at.top + sy);
      return { sx: Math.round(sx), sy: Math.round(sy), inView, onCanvas: el === canvas, coveredBy: el === canvas ? null : (el?.closest('[data-testid]')?.getAttribute('data-testid') ?? el?.tagName ?? null), km: Math.round((v.metresPerPx * vw) / 1000), historyOpen: window.__warsim.hud.showHistory.value };
    }, target);
    const s = await shot(page, `${P}_${k.replace(/[^a-z0-9]/gi, '')}.png`);
    out.clicks.push({ kind: k, ...target, ...res, shot: s });
  }
} catch (e) {
  out.error = String(e).slice(0, 400);
  await shot(page, `${P}_error.png`).catch(() => {});
}
out.errors = errors;
save(`${P}.json`, out);
console.log(JSON.stringify({ ...out, clicks: out.clicks.map((c) => `${c.kind}: inView ${c.inView} onCanvas ${c.onCanvas} ${c.coveredBy ?? ''} km ${c.km} hist ${c.historyOpen}`) }, null, 1));
await browser.close();
