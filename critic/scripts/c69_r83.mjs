// Critic run 69 (new): R83, the "World history" card and a later year played free with 1938's form, by mouse.
// The list's name and period, the heading at 1938 and at YEAR, the free form (its options, the size disabled with its
// note), options chosen (OPTS: diplomacy=random,aggression=random,heroes=on ...), the seed typed, Start: the URL, the
// date, no Next line, the hash. The same URL opened twice more in fresh pages: the hash at the start and after 10 days.
// Usage: node critic/scripts/c69_r83.mjs <year> <seed> [W H] [opts]
import { launch, save, shot, BASE } from './c69_lib.mjs';
const year = Number(process.argv[2] ?? 1983);
const seed = String(process.argv[3] ?? '51283');
const W = Number(process.argv[4] ?? 1600), H = Number(process.argv[5] ?? 900);
const opts = (process.argv[6] ?? 'diplomacy=random,aggression=random,heroes=on').split(',').filter(Boolean).map((s) => s.split('='));
const tag = `${year}_${seed}_${W}x${H}`;
const out = { year, seed, W, H, opts };
const ready = async (page) => {
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null && !document.querySelector('[data-testid=world-building]'), null, { timeout: 180_000 });
  await page.waitForTimeout(1500);
};
const state = (page) => page.evaluate(async () => {
  const i = await window.__warsim.sim.inspect?.();
  const h = await window.__warsim.sim.hash();
  return { tick: i?.tick ?? null, hash: h?.hash ?? null, date: document.querySelector('[data-testid=date-label]')?.textContent ?? null, next: document.querySelector('[data-testid=track-next]')?.textContent ?? null };
});
const { browser, page, errors } = await launch(W, H);
const text = (id) => page.getByTestId(id).innerText().catch(() => null);
try {
  await page.goto(`${BASE}/`);
  await page.getByTestId('title-screen').waitFor();
  out.list = await page.evaluate(() => [...document.querySelectorAll('[data-testid^=title-scenario-]')].map((b) => b.textContent));
  await page.getByTestId('title-scenario-1938').click();
  await page.waitForTimeout(1200);
  out.heading1938 = await text('title-chosen');
  out.shotList = await shot(page, `c69r83_${tag}_list.png`);
  const slider = page.getByTestId('title-start-year');
  out.slider = (await slider.count()) ? await slider.evaluate((e) => ({ min: e.min, max: e.max, value: e.value })) : null;
  await slider.evaluate((e, y) => { e.value = String(y); e.dispatchEvent(new Event('input', { bubbles: true })); }, year);
  await page.waitForTimeout(600);
  out.headingYear = await text('title-chosen');
  out.powers = await text('title-powers');
  out.nations = await text('title-nations');
  out.date = await text('title-start-date');
  await page.getByTestId('title-mode-free').click();
  await page.waitForTimeout(800);
  out.freeNote = await text('title-free-note');
  out.form = await page.evaluate(() => [...document.querySelectorAll('select[data-testid^=opt-], input[data-testid^=settings-]')].map((e) => ({ id: e.dataset.testid, value: e.value, disabled: e.disabled, title: e.title || null, options: e.tagName === 'SELECT' ? [...e.options].map((o) => o.value) : null })));
  out.sizeNote = await text('opt-size-fixed');
  out.shotForm = await shot(page, `c69r83_${tag}_form.png`);
  for (const [k, v] of opts) {
    const sel = page.getByTestId(`opt-${k}`);
    if (await sel.count()) await sel.selectOption(v).catch((e) => (out[`optErr_${k}`] = String(e).slice(0, 200)));
    else out[`optMissing_${k}`] = true;
  }
  const seedBox = page.getByTestId('settings-seed');
  if (await seedBox.count()) { await seedBox.fill(seed); }
  out.shotFormSet = await shot(page, `c69r83_${tag}_formset.png`);
  const t0 = Date.now();
  await page.getByTestId('settings-new-game').click();
  await ready(page);
  out.msReady = Date.now() - t0;
  out.url = page.url();
  out.s0 = await state(page);
  out.shotStart = await shot(page, `c69r83_${tag}_start.png`);
  await page.evaluate(() => window.__warsim.sim.step(24 * 10));
  await page.waitForTimeout(3000);
  out.s10 = await state(page);
  out.ticker10 = await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row]')].slice(0, 12).map((e) => e.textContent));
  out.shot10 = await shot(page, `c69r83_${tag}_d10.png`);
  // The URL twice more, each in a fresh page.
  out.again = [];
  for (let k = 0; k < 2; k++) {
    const p2 = await browser.newPage({ viewport: { width: W, height: H } });
    p2.on('pageerror', (e) => errors.push(`again${k} pageerror: ${e.message}`));
    await p2.goto(out.url.includes('paused=') ? out.url : `${out.url}${out.url.includes('?') ? '&' : '?'}paused=1`);
    await ready(p2);
    const a0 = await state(p2);
    await p2.evaluate(() => window.__warsim.sim.step(24 * 10));
    await p2.waitForTimeout(3000);
    const a10 = await state(p2);
    out.again.push({ a0, a10 });
    await p2.close();
  }
} catch (e) { out.fatal = String(e?.stack ?? e); out.shotFatal = await shot(page, `c69r83_${tag}_fatal.png`).catch(() => null); }
out.errors = errors;
save(`c69_r83_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 6000));
