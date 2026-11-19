// Critic run 82 (new, R178 against R174 / ADR-1135 (a)): how many letters of each war-row name a phone shows. R178 clamps a
// long name to one line (-webkit-line-clamp), which hides the cut from scrollWidth, so run 81's bannerFit no longer sees it.
// Here each character's own box (a Range per character): the letters on the name's first line that lie inside the name's
// box, less one where the line ends in the ellipsis. Also whether that side's "& n" is shown. 1938 seed after <days> days.
// Usage: [BASE=...] [TAG=] node critic/scripts/c82_nameLetters.mjs <seed> <days> <WxH,WxH,...>
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, hours } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 68901), days = Number(process.argv[3] ?? 400);
const sizes = (process.argv[4] ?? '375x667').split(',').map((s) => s.split('x').map(Number));
const TAG = process.env.TAG ?? '';
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const [W0, H0] = sizes[0];
const ctx = await browser.newContext({ viewport: { width: W0, height: H0 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
if (days) await hours(page, 24 * days);
const out = { seed, days, base: BASE, sizes: [] };
for (const [W, H] of sizes) {
  await page.setViewportSize({ width: W, height: H });
  await page.waitForTimeout(900);
  const names = await page.evaluate(() => {
    const res = [];
    for (const el of document.querySelectorAll('.war-banners [data-testid=war-name]')) {
      const text = el.textContent ?? '';
      const box = el.getBoundingClientRect();
      const node = el.firstChild;
      let shown = 0, firstTop = null;
      if (node && node.nodeType === 3) {
        for (let i = 0; i < text.length; i++) {
          const r = document.createRange(); r.setStart(node, i); r.setEnd(node, i + 1);
          const rc = r.getClientRects()[0]; if (!rc) continue;
          if (firstTop === null) firstTop = rc.top;
          if (Math.abs(rc.top - firstTop) < 2 && rc.right <= box.right + 0.5 && rc.left >= box.left - 0.5) shown++;
        }
      }
      const cut = shown < text.length || el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
      // A cut line ends in the ellipsis, drawn over the last letter's room: count one letter less.
      const letters = cut ? Math.max(0, Math.min(shown, text.length) - 1) : text.length;
      const side = el.closest('.war-side');
      const allies = side?.querySelector('[data-testid=war-allies]');
      const alliesShown = !!allies && allies.getBoundingClientRect().width > 0 && getComputedStyle(allies).display !== 'none';
      res.push({ name: text, letters, cut, w: +box.width.toFixed(1), allies: allies?.textContent?.trim() ?? null, alliesShown });
    }
    return res;
  });
  const row = await page.locator('[data-testid=war-banners]').boundingBox();
  const shot = path.join(SHOTS, `c82nl_${seed}_d${days}_${W}x${H}${TAG}_row.png`);
  if (row) await page.screenshot({ path: shot, clip: { x: 0, y: Math.max(0, row.y - 4), width: W, height: Math.min(row.height + 8, H) } });
  const bad = names.filter((n) => n.cut && n.letters < 5);
  out.sizes.push({ W, H, names, under5: bad.map((n) => `${n.name} ${n.letters}${n.alliesShown ? ' with ' + n.allies : ''}`), shot: `critic/shots/${path.basename(shot)}` });
  console.log(`${W}x${H}`, names.map((n) => `${n.name}:${n.letters}${n.cut ? '/cut' : ''}${n.alliesShown ? '(' + n.allies + ')' : ''}`).join(' | '));
}
out.errors = errors;
save(`c82nl_${seed}_d${days}${TAG}.json`, out);
await browser.close();
