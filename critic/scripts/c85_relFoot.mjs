// Critic run 85 (new, R196 and R195 off their cases): the relations panel's footer and filters at many sizes. At each size
// of SIZES (one touch page resized; default the sideways phones 568x320, 640x360, 667x375, 740x360, 844x390, 932x430, a
// short desk 1280x480, the upright 390x844 and 360x640, desks 1024x768 and 1600x900), Relations open with no nation: the
// panel's box, the footer's box and text, how far the footer's (and every child's) bottom lies past the panel's bottom
// (and past the viewport), the graph's height, the filters' row height and whether each kind's name shows; then a war
// node's line said (a click on the first war node, else the first edge), and the same read: the said line's rows, the
// graph's height with it shown (the jump R196 accepts), and the footer's overflow; then every war node and edge clicked
// and the longest said line kept ('longest'), the same read. The panel is closed and opened again at each size, so each
// size starts with no said line. A shot at each read.
// Usage: [BASE=...] [TAG=] node critic/scripts/c85_relFoot.mjs <seed> <days> [WxH,...]
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, hours } from './c85_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 85903), days = Number(process.argv[3] ?? 400);
const sizes = (process.argv[4] ?? '568x320,640x360,667x375,740x360,844x390,932x430,1280x480,390x844,360x640,1024x768,1600x900').split(',').map((s) => s.split('x').map(Number));
const TAG = process.env.TAG ?? '';
const L = `c85rf_${seed}_d${days}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const [W0, H0] = sizes[0];
const ctx = await browser.newContext({ viewport: { width: W0, height: H0 }, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
if (days) await hours(page, 24 * days);
await page.waitForTimeout(600);
const read = () => page.evaluate(() => {
  const P = document.querySelector('[data-testid=relations-panel]');
  if (!P) return { panel: null };
  const pr = P.getBoundingClientRect();
  const F = P.querySelector('[data-testid=relations-said]');
  const fr = F?.getBoundingClientRect();
  let deepest = fr ? fr.bottom : 0;
  if (F) for (const c of F.querySelectorAll('*')) { const r = c.getBoundingClientRect(); if (r.height > 0 && getComputedStyle(c).display !== 'none') deepest = Math.max(deepest, r.bottom); }
  // the text's own bottom (a Range over the footer's text), which an overflow: visible box does not bound
  let textBottom = null;
  if (F && F.textContent.trim()) { const rg = document.createRange(); rg.selectNodeContents(F); const rs = [...rg.getClientRects()]; if (rs.length) textBottom = Math.max(...rs.map((r) => r.bottom)); }
  const svg = P.querySelector('svg.relations-graph') ?? P.querySelector('svg');
  const fl = P.querySelector('.relations-filters')?.getBoundingClientRect();
  const names = [...P.querySelectorAll('.relations-kind-name')].map((e) => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0);
  const lh = F ? parseFloat(getComputedStyle(F).lineHeight) || 16 : 16;
  const untied = P.querySelector('.relations-untied');
  return {
    panel: [Math.round(pr.left), Math.round(pr.top), Math.round(pr.right), Math.round(pr.bottom)],
    vh: innerHeight,
    footer: fr ? [Math.round(fr.top), Math.round(fr.bottom)] : null,
    footerText: F?.innerText.trim().slice(0, 200) ?? null,
    footerRows: fr ? Math.round(fr.height / lh) : null,
    pastPanel: Math.round(Math.max(deepest, textBottom ?? 0) - pr.bottom),
    pastView: Math.round(Math.max(deepest, textBottom ?? 0) - innerHeight),
    graphH: svg ? Math.round(svg.getBoundingClientRect().height) : null,
    filterH: fl ? Math.round(fl.height) : null,
    kindNamesShown: names.filter(Boolean).length + '/' + names.length,
    untiedShown: untied ? getComputedStyle(untied).display !== 'none' : 'absent',
  };
});
const out = { seed, days, steps: [] };
let i = 0;
for (const [W, H] of sizes) {
  await page.setViewportSize({ width: W, height: H });
  await page.waitForTimeout(900);
  await page.evaluate(() => window.__warsim.hud.onSelectNation(0));
  // the said line cleared: the panel closed and opened again at each size
  if (await page.locator('[data-testid=relations-panel]').count()) {
    await page.evaluate(() => document.querySelector('[data-testid=relations-close]')?.click());
    await page.waitForTimeout(500);
  }
  if (!(await page.locator('[data-testid=relations-panel]').count())) {
    const b = page.getByTestId('relations-btn');
    if (await b.isVisible().catch(() => false)) { await b.tap().catch(() => null); await page.waitForTimeout(800); }
  }
  for (const phase of ['plain', 'said', 'longest']) {
    if (phase === 'said') {
      const what = await page.evaluate(() => {
        const P = document.querySelector('[data-testid=relations-panel]');
        const w = P?.querySelector('.relations-war') ?? P?.querySelector('.relations-edge');
        if (!w) return null;
        w.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return w.getAttribute('class');
      });
      await page.waitForTimeout(500);
      if (!what) continue;
    }
    if (phase === 'longest') {
      // every war node and edge clicked in turn; the one whose said line is longest is clicked last
      const n = await page.evaluate(async () => {
        const P = document.querySelector('[data-testid=relations-panel]');
        const F = P?.querySelector('[data-testid=relations-said]');
        const all = [...(P?.querySelectorAll('.relations-war, .relations-edge') ?? [])];
        let best = null, bestLen = -1;
        for (const w of all) {
          w.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          await new Promise((d) => requestAnimationFrame(() => d()));
          const len = F?.innerText.length ?? 0;
          if (len > bestLen) { bestLen = len; best = w; }
        }
        best?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return all.length;
      });
      await page.waitForTimeout(500);
      if (!n) continue;
    }
    const g = await read();
    const name = `${L}_${i}_${W}x${H}_${phase}.png`;
    await page.screenshot({ path: path.join(SHOTS, name) });
    const s = { i, W, H, phase, ...g, shot: `critic/shots/${name}` };
    out.steps.push(s);
    console.log(JSON.stringify(s));
  }
  i++;
}
const bad = out.steps.filter((s) => s.panel && (s.pastPanel > 0 || s.pastView > 0));
out.summary = { steps: out.steps.length, footerPastPanel: bad.map((s) => `${s.W}x${s.H}/${s.phase}:+${s.pastPanel}`), noPanel: out.steps.filter((s) => !s.panel).map((s) => `${s.W}x${s.H}`) };
out.errors = errors;
console.log('summary', JSON.stringify(out.summary), 'errors', errors.length);
save(`${L}.json`, out);
await browser.close();
