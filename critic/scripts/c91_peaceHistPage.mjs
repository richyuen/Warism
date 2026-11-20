// Critic run 91 (new): R222's PeaceHeld rows (ADR-1149) in History on the page. A random world of N nations, SEED, at
// W x H (touch and pixel ratio 3 for a phone), stepped DAYS days; History opened: every row's text, the PeaceHeld rows
// ("The world is at peace: ..."), each one's box (in the view? cut?), the kind filter's options (is "Peace holds" one?)
// and the rows it keeps, the nation filter (does an unplaced row with no nation vanish?), then the time-lapse opened
// from History and shut (page errors). Shots of the panel.
// Usage: [BASE=...] node critic/scripts/c91_peaceHistPage.mjs <seed> <nations> <days> [WxH=2560x1305] [touch]
import { chromium } from '@playwright/test';
import { BASE, save, shot } from './c85_lib.mjs';
const [seedS, nS, dS, wh = '2560x1305', touchS = ''] = process.argv.slice(2);
const [W, H] = wh.split('x').map(Number), touch = touchS === 'touch';
const out = { seed: +seedS, nations: +nS, days: +dS, size: wh, touch };
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: touch ? 3 : 1, hasTouch: touch, isMobile: touch });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`error: ${m.text()}`.slice(0, 300)); });
const tag = `c91phh_${seedS}_${nS}_${wh}`;
try {
  await page.goto(`${BASE}/?scenario=random&paused=1&seed=${seedS}&nations=${nS}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120000 });
  for (let d = 0; d < +dS; d += 60) {
    const n = Math.min(60, +dS - d);
    await page.evaluate(async (h) => { await window.__warsim.sim.step(h); }, n * 24);
    await page.waitForFunction((t) => window.__warsim.hud.stats.value?.tick >= t, (d + n) * 24, { timeout: 300000 });
  }
  await page.waitForTimeout(500);
  out.wars = await page.evaluate(() => window.__warsim.hud.stats.value.wars.length);
  out.line = await page.evaluate(() => document.querySelector('[data-testid=war-peace]')?.innerText.replace(/\n/g, ' ') ?? null);
  const btn = page.getByTestId('history-btn');
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await page.getByTestId('history-panel').waitFor({ timeout: 20000 });
  await page.waitForTimeout(800);
  const readRows = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=history-row]')].map((r) => {
    const b = r.getBoundingClientRect();
    const cut = [r, ...r.querySelectorAll('*')].some((c) => c.scrollWidth > c.clientWidth + 1 && getComputedStyle(c).overflow !== 'visible');
    return { text: r.innerText.replace(/\n/g, ' '), box: [b.left, b.top, b.right, b.bottom].map(Math.round), cut, go: !!r.querySelector('[data-testid=history-go]'), goDisabled: r.querySelector('[data-testid=history-go]')?.disabled ?? null };
  }));
  out.count = await page.evaluate(() => document.querySelector('[data-testid=history-count]')?.innerText ?? null);
  out.rows = await readRows();
  out.peaceRows = out.rows.filter((r) => /at peace/i.test(r.text));
  out.shotAll = await shot(page, `${tag}_all.png`);
  // Each PeaceHeld row scrolled into view: is it whole in the view?
  out.peaceSeen = [];
  const pr = page.getByTestId('history-row').filter({ hasText: /The world is at peace/ });
  for (let i = 0; i < await pr.count(); i++) {
    await pr.nth(i).scrollIntoViewIfNeeded();
    const b = await pr.nth(i).boundingBox();
    out.peaceSeen.push({ box: b && [b.x, b.y, b.x + b.width, b.y + b.height].map(Math.round), inView: !!b && b.x >= -0.5 && b.y >= -0.5 && b.x + b.width <= W + 0.5 && b.y + b.height <= H + 0.5 });
    if (i === 0) out.shotPeace = await shot(page, `${tag}_peace.png`);
  }
  out.kinds = await page.evaluate(() => [...document.querySelectorAll('[data-testid=history-kind] option')].map((o) => [o.value, o.textContent]));
  const opt = out.kinds.find((k) => /peace holds/i.test(k[1]));
  if (opt) {
    await page.getByTestId('history-kind').selectOption(opt[0]);
    await page.waitForTimeout(500);
    out.kindRows = (await readRows()).map((r) => r.text);
    out.shotKind = await shot(page, `${tag}_kind.png`);
    await page.getByTestId('history-kind').selectOption('');
  }
  const nat = await page.evaluate(() => [...document.querySelectorAll('[data-testid=history-nation] option')].map((o) => o.value).filter(Boolean));
  if (nat.length) {
    await page.getByTestId('history-nation').selectOption(nat[0]);
    await page.waitForTimeout(500);
    out.nationRows = (await readRows()).map((r) => r.text);
    await page.getByTestId('history-nation').selectOption('');
  }
  const tl = page.getByTestId('history-timelapse');
  if (await tl.count()) {
    await tl.click(); await page.waitForTimeout(2500);
    out.shotLapse = await shot(page, `${tag}_lapse.png`);
    out.lapse = await page.evaluate(() => document.querySelector('[data-testid=time-lapse]')?.innerText.replace(/\n/g, ' ').slice(0, 200) ?? null);
  }
  out.scrollsX = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
} catch (e) { out.fail = String(e).slice(0, 400); }
finally { out.errors = errors; save(`c91_phh_${seedS}_${nS}_${wh}.json`, out); await browser.close(); console.log(JSON.stringify(out)); }
