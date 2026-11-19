// Critic run 80 (new, R168): the war banners' side names as a player reads them. 1938 (or SCEN=random), seed, after
// <days> days, at W x H: for each banner's side, the name's text, its box width, whether it is cut (scrollWidth >
// clientWidth) and how many of its characters show (by measuring a prefix). A crop of the banner row is shot.
// Usage: [BASE=...] [TAG=] [SCEN=1938|random] node critic/scripts/c80_bannerNames.mjs <seed> <days> <W> <H>
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, hours } from './c80_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 68901), days = Number(process.argv[3] ?? 0), W = Number(process.argv[4] ?? 390), H = Number(process.argv[5] ?? 844);
const TAG = process.env.TAG ?? '', SCEN = process.env.SCEN ?? '1938';
const OPEN = process.env.OPEN === '1';
const L = `c80bn_${SCEN}_${seed}_d${days}_${W}x${H}${OPEN ? '_open' : ''}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
const url = SCEN === 'random' ? `${BASE}/?scenario=random&nations=60&paused=1&seed=${seed}` : `${BASE}/?scenario=1938&paused=1&seed=${seed}`;
const out = { seed, days, W, H, base: BASE, scen: SCEN };
try {
  await page.goto(url);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  if (days > 0) await hours(page, 24 * days);
  await page.waitForTimeout(800);
  if (OPEN) { await page.locator('[data-testid=war-more]').click(); await page.waitForTimeout(500); }
  out.date = await page.evaluate(() => document.querySelector('.bar-date, [data-testid=date]')?.textContent ?? '');
  out.sides = await page.evaluate(() => {
    const res = [];
    const names = document.querySelectorAll('[data-testid=war-banners] .war-side');
    for (const side of names) {
      const nm = side.querySelector('.war-name') ?? side;
      const tn0 = [...nm.childNodes].find((c) => c.nodeType === 3 && c.textContent.trim());
      const full = nm.classList.contains('war-name') ? (nm.textContent ?? '').trim() : (tn0?.textContent ?? '').trim();
      const r = nm.getBoundingClientRect();
      // How many characters show: the longest prefix whose width fits the box (a Range over the text node).
      let shown = full.length;
      const tn = [...nm.childNodes].find((c) => c.nodeType === 3 && c.textContent.trim());
      if (tn && (nm.scrollWidth > nm.clientWidth + 1 || !nm.classList.contains('war-name'))) {
        const range = document.createRange();
        const text = tn.textContent;
        const off = text.indexOf(full[0]);
        shown = 0;
        for (let i = 1; i <= Math.min(full.length, text.length - off); i++) {
          range.setStart(tn, off); range.setEnd(tn, off + i);
          if (range.getBoundingClientRect().right <= r.right - 8) shown = i; else break;
        }
      }
      const allies = side.querySelector('.war-allies')?.textContent?.trim() ?? '';
      const banner = side.closest('[data-testid=war-banner]') ?? side.parentElement;
      const br = banner.getBoundingClientRect();
      res.push({ full, allies, w: Math.round(r.width), cut: nm.scrollWidth > nm.clientWidth + 1 || shown < full.length, shown, bannerW: Math.round(br.width), onScreen: br.right <= innerWidth && br.left >= 0 });
    }
    return res;
  });
  const row = await page.locator('[data-testid=war-banners]').boundingBox();
  if (row) await page.screenshot({ path: path.join(SHOTS, `${L}_row.png`), clip: { x: Math.max(0, row.x - 4), y: Math.max(0, row.y - 4), width: Math.min(W, row.width + 8), height: Math.min(H, row.height + 8) } });
  await page.screenshot({ path: path.join(SHOTS, `${L}.png`) });
  out.shot = `critic/shots/${L}_row.png`;
  const cut = out.sides.filter((s) => s.cut);
  out.summary = { sides: out.sides.length, cut: cut.length, cutTo3OrLess: cut.filter((s) => s.shown <= 3).length, shortNamesCut: cut.filter((s) => s.full.length <= 8).length };
  console.log(out.date, JSON.stringify(out.summary));
  for (const s of out.sides) console.log(`  ${s.cut ? 'CUT' : 'ok '} shown ${s.shown}/${s.full.length} w=${s.w} "${s.full}" ${s.allies} banner=${s.bannerW}`);
} catch (e) {
  out.failed = String(e).slice(0, 300);
  console.log('FAILED', out.failed);
}
out.errors = errors;
console.log('errors', errors.length);
save(`${L}.json`, out);
await browser.close();
