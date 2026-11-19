// Critic run 85 (new, exploring Batch 52 as a player): (a) a desk window 640 x 800 (half a 1280 screen) on a 1938 world
// after <days> days: the war row (R194: "+n" alone), "+n" clicked, the opened list read (banners, any off screen, what it
// covers), closed again; (b) a sideways phone 568 x 320 (touch): Relations opened, each filter (R195: colours alone) tapped
// off in turn with a shot, to see what tells the player which kind went. Shots of each step.
// Usage: [BASE=...] [TAG=] node critic/scripts/c85_explore.mjs <seed> <days>
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, hours } from './c85_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 84901), days = Number(process.argv[3] ?? 400);
const TAG = process.env.TAG ?? '';
const L = `c85ex_${seed}_d${days}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const out = { seed, days, desk: {}, phone: {} };
const boot = async (ctx) => {
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  if (days) await hours(page, 24 * days);
  await page.waitForTimeout(1000);
  return { page, errors };
};
// (a)
{
  const ctx = await browser.newContext({ viewport: { width: 640, height: 800 } });
  const { page, errors } = await boot(ctx);
  await page.screenshot({ path: path.join(SHOTS, `${L}_a0_640x800.png`) });
  const more = page.locator('[data-testid=war-more]');
  out.desk.moreText = (await more.count()) ? await more.first().textContent() : null;
  if (out.desk.moreText) {
    await more.first().click();
    await page.waitForTimeout(700);
    out.desk.opened = await page.evaluate(() => {
      const row = document.querySelector('[data-testid=war-banners]');
      const r = row.getBoundingClientRect();
      const bs = [...row.querySelectorAll('[data-testid=war-banner]')].map((b) => { const x = b.getBoundingClientRect(); return { t: b.textContent.trim().slice(0, 50), box: [Math.round(x.left), Math.round(x.top), Math.round(x.right), Math.round(x.bottom)] }; });
      return { row: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], banners: bs.length, off: bs.filter((b) => b.box[0] < 0 || b.box[2] > innerWidth || b.box[1] < 0).map((b) => b.t), first: bs.slice(0, 6) };
    });
    await page.screenshot({ path: path.join(SHOTS, `${L}_a1_opened.png`) });
  }
  out.desk.errors = errors;
  await ctx.close();
}
// (b)
{
  const ctx = await browser.newContext({ viewport: { width: 568, height: 320 }, hasTouch: true, deviceScaleFactor: 2 });
  const { page, errors } = await boot(ctx);
  const b = page.getByTestId('relations-btn');
  if (await b.isVisible().catch(() => false)) { await b.tap(); await page.waitForTimeout(800); }
  await page.screenshot({ path: path.join(SHOTS, `${L}_b0_568x320_relations.png`) });
  const ids = await page.evaluate(() => [...document.querySelectorAll('[data-testid^=relations-kind-]')].map((e) => e.getAttribute('data-testid')));
  out.phone.kinds = [];
  for (const id of ids) {
    const loc = page.getByTestId(id);
    const bb = await loc.boundingBox();
    if (!bb) continue;
    await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2);
    await page.waitForTimeout(400);
    const seen = await page.evaluate(() => ({ said: document.querySelector('[data-testid=relations-said]')?.innerText.trim() ?? null, lines: document.querySelectorAll('[data-testid=relations-panel] .relations-edge').length }));
    await page.screenshot({ path: path.join(SHOTS, `${L}_b_${id}_off.png`) });
    out.phone.kinds.push({ id, ...seen, checked: await loc.isChecked() });
    await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2);
    await page.waitForTimeout(300);
  }
  out.phone.errors = errors;
  await ctx.close();
}
console.log(JSON.stringify(out, null, 1));
save(`${L}.json`, out);
await browser.close();
