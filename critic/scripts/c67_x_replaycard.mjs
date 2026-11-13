// Critic run 65 (new): the 1938 card's replay slider (R68c) and a start from a year (R68b), as a player does it.
// Title: the card, the slider's range, what the card shows at the chosen year (preview, date, nations, description).
// Start: the time to the first stats, the date, the "Next" line (replay) or none (free), the map; then 30 days run.
// Usage: node critic/scripts/c67_x_replaycard.mjs <year> <replay|free> [W H]
import { launch, save, shot, BASE } from './c67_lib.mjs';
const year = Number(process.argv[2] ?? 1960);
const mode = process.argv[3] ?? 'replay';
const W = Number(process.argv[4] ?? 1600), H = Number(process.argv[5] ?? 900);
const tag = `${year}_${mode}_${W}x${H}`;
const out = { year, mode, W, H };
const { browser, page, errors } = await launch(W, H);
const text = (id) => page.getByTestId(id).innerText().catch(() => null);
try {
  await page.goto(`${BASE}/`);
  await page.getByTestId('title-screen').waitFor();
  await page.getByTestId('title-scenario-1938').click();
  await page.waitForTimeout(1500);
  const slider = page.getByTestId('title-start-year');
  out.slider = (await slider.count()) ? await slider.evaluate((e) => ({ min: e.min, max: e.max, value: e.value })) : null;
  out.cardBefore = { chosen: await text('title-chosen'), date: await text('title-start-date'), nations: await text('title-nations'), preview: await page.getByTestId('title-preview').getAttribute('src') };
  out.shotTitle = await shot(page, `c67rc_${W}x${H}_title.png`);
  if (out.slider) {
    await slider.evaluate((e, y) => { e.value = String(y); e.dispatchEvent(new Event('input', { bubbles: true })); }, year);
    await page.waitForTimeout(300);
  }
  await page.getByTestId(mode === 'replay' ? 'title-mode-replay' : 'title-mode-free').click();
  await page.waitForTimeout(500);
  out.cardAfter = { date: await text('title-start-date'), nations: await text('title-nations'), preview: await page.getByTestId('title-preview').getAttribute('src'), desc: await page.locator('.title-desc').innerText().catch(() => null) };
  out.shotCard = await shot(page, `c67rc_${tag}_card.png`);
  const t0 = Date.now();
  await page.getByTestId('settings-new-game').click();
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  out.url = page.url();
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null, null, { timeout: 180_000 });
  out.msToStats = Date.now() - t0;
  // Whatever the bar says, every 250 ms, until the date says the chosen year (the load) or 20 s.
  const samples = [];
  for (let i = 0; i < 80; i++) {
    const s = await page.evaluate(() => ({ date: document.querySelector('[data-testid=date-label]')?.textContent ?? null, next: document.querySelector('[data-testid=track-next]')?.textContent ?? null, building: !!document.querySelector('[data-testid=world-building]'), tick: window.__warsim?.hud?.tick?.value ?? null }));
    samples.push({ ms: Date.now() - t0, ...s });
    if (s.date && s.date.includes(String(year)) && !s.building) break;
    await page.waitForTimeout(250);
  }
  out.samples = samples;
  out.failed = page.url().includes('failed=');
  await page.waitForTimeout(1000);
  out.date0 = await text('date-label');
  out.next0 = await text('track-next');
  out.shot0 = await shot(page, `c67rc_${tag}_start.png`);
  out.info0 = await page.evaluate(() => { const i = window.__warsim.sim.inspect?.(); return i ? { tick: i.tick, hash: i.hash } : null; }).catch((e) => String(e));
  out.ticker0 = await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row]')].slice(0, 8).map((e) => e.textContent));
  await page.evaluate(() => window.__warsim.sim.step(24 * 30));
  await page.waitForTimeout(2500);
  out.date30 = await text('date-label');
  out.next30 = await text('track-next');
  out.ticker30 = await page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker-row]')].slice(0, 12).map((e) => e.textContent));
  out.shot30 = await shot(page, `c67rc_${tag}_d30.png`);
} catch (e) { out.fatal = String(e?.stack ?? e); out.shotFatal = await shot(page, `c67rc_${tag}_fatal.png`).catch(() => null); out.urlFatal = page.url(); }
out.errors = errors;
save(`c67_rc_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 4000));
