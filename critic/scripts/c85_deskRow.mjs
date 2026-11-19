// Critic run 85 (new, R194 off its case): R194 sizes a desk's lone war banner as a phone's when the row is too narrow for
// it (`war-sized`), and past that leaves "+n" alone (fit 0). Routes its case (fresh pages at five widths) does not take:
// one desk window (no touch) narrowed from 1100 px to 560 px in steps of STEP px and widened back, at height H, on a 1938
// world (or the random world, SCEN=random) after <days> days. At each step: phone or not, `war-sized`, banners shown, the
// "+n" text and whether its centre is the top element (clickable), the row's overflow, the ticker's rows and the legend
// covered by the row (px), each shown name's letters seen (its text times its seen width over its full width) and whether
// it is cut, names under five letters; then a nudge (1 px wider and back) and the count after it: a different count is a
// stale fit. A row shot at each step where something changed.
// Usage: [BASE=...] [TAG=] [SCEN=random] [STEP=20] node critic/scripts/c85_deskRow.mjs <seed> <days> [H] [from] [to]
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, hours } from './c85_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 85901), days = Number(process.argv[3] ?? 400), H = Number(process.argv[4] ?? 800);
const from = Number(process.argv[5] ?? 1100), to = Number(process.argv[6] ?? 560), STEP = Number(process.env.STEP ?? 20);
const SCEN = process.env.SCEN ?? '1938';
const TAG = process.env.TAG ?? '';
const L = `c85dr_${SCEN}_${seed}_d${days}_h${H}${TAG}`;
const widths = [];
for (let w = from; w >= to; w -= STEP) widths.push(w);
for (let w = to + STEP; w <= from; w += STEP) widths.push(w);
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: from, height: H }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
const q = SCEN === 'random' ? `scenario=random&nations=60` : `scenario=${SCEN}`;
await page.goto(`${BASE}/?${q}&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
if (days) await hours(page, 24 * days);
await page.waitForTimeout(1000);
const geom = () => page.evaluate(() => {
  const row = document.querySelector('[data-testid=war-banners]');
  if (!row) return { row: null };
  const rr = row.getBoundingClientRect();
  const more = row.querySelector('[data-testid=war-more]');
  let moreTop = null;
  if (more) { const m = more.getBoundingClientRect(); const t = document.elementFromPoint(m.left + m.width / 2, m.top + m.height / 2); moreTop = !!t && (t === more || more.contains(t)); }
  const names = [...row.querySelectorAll('[data-testid=war-name]')].filter((e) => e.getBoundingClientRect().width > 0 || e.textContent).map((e) => {
    const full = e.scrollWidth, seen = Math.min(e.clientWidth, full);
    const len = e.textContent.length;
    return { t: e.textContent, letters: full > 0 ? Math.floor((len * seen) / full + 0.01) : 0, len, cut: full > e.clientWidth + 0.5 };
  });
  const under = [];
  for (const el of document.querySelectorAll('.ticker .ticker-row, [data-testid=ticker-row], [data-testid=map-legend], .map-legend, [data-testid=ticker-more]')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    let hit = 0;
    for (let x = r.left + 2; x < r.right - 2; x += 4) { const t = document.elementFromPoint(x, r.top + r.height / 2); if (t && row.contains(t)) hit++; }
    if (hit) under.push({ what: el.textContent.trim().slice(0, 30), px: hit * 4 });
  }
  return {
    phone: matchMedia('(max-width: 600px), (max-height: 500px)').matches,
    sized: row.classList.contains('war-sized'),
    shown: row.querySelectorAll('[data-testid=war-banner]').length,
    more: more?.textContent.trim() ?? null,
    moreTop,
    row: [Math.round(rr.left), Math.round(rr.right)],
    overflow: Math.round(row.scrollWidth - row.clientWidth),
    names,
    under,
    wars: window.__warsim.hud.wars?.value?.length ?? null,
  };
});
const out = { seed, days, H, SCEN, steps: [] };
let prev = '';
for (const W of widths) {
  await page.setViewportSize({ width: W, height: H });
  await page.waitForTimeout(700);
  const g = await geom();
  await page.setViewportSize({ width: W + 1, height: H });
  await page.waitForTimeout(400);
  await page.setViewportSize({ width: W, height: H });
  await page.waitForTimeout(700);
  const n = await geom();
  const stale = g.shown !== n.shown;
  const short = (g.names ?? []).filter((x) => x.cut && x.letters < 5).map((x) => `${x.t}:${x.letters}`);
  const cut = (g.names ?? []).filter((x) => x.cut).map((x) => `${x.t}:${x.letters}/${x.len}`);
  const key = `${g.phone}|${g.sized}|${g.shown}|${g.more}|${cut.join()}`;
  let shot = null;
  if (key !== prev || stale || g.overflow > 0 || g.under?.length || short.length || g.moreTop === false) {
    const b = await page.locator('[data-testid=war-banners]').boundingBox().catch(() => null);
    if (b) {
      shot = `${L}_${W}.png`;
      const y = Math.max(0, b.y - 40);
      await page.screenshot({ path: path.join(SHOTS, shot), clip: { x: 0, y, width: W, height: Math.min(H - y, b.height + 120) } });
      shot = `critic/shots/${shot}`;
    }
  }
  prev = key;
  const st = { W, phone: g.phone, sized: g.sized, shown: g.shown, more: g.more, moreTop: g.moreTop, overflow: g.overflow, under: g.under, cut, short, nudged: n.shown, stale, shot };
  out.steps.push(st);
  console.log(JSON.stringify(st));
}
const desk = out.steps.filter((s) => !s.phone);
out.summary = {
  steps: out.steps.length,
  stale: out.steps.filter((s) => s.stale).map((s) => s.W),
  overflow: desk.filter((s) => s.overflow > 0).map((s) => `${s.W}:${s.overflow}`),
  covering: desk.filter((s) => s.under?.length).map((s) => `${s.W}:${s.under.map((u) => u.px).join('+')}`),
  sized: desk.filter((s) => s.sized).map((s) => s.W),
  fit0: desk.filter((s) => s.shown === 0).map((s) => `${s.W}:${s.more}`),
  under5: desk.filter((s) => s.short.length).map((s) => `${s.W}:${s.short.join('/')}`),
  moreBlocked: desk.filter((s) => s.more && s.moreTop === false).map((s) => s.W),
};
out.errors = errors;
console.log('summary', JSON.stringify(out.summary), 'errors', errors.length);
save(`${L}.json`, out);
await browser.close();
