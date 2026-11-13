// Critic run 63 (new; run 62 left it out for time): 1938h saved mid-track by the player's own path (Settings > Main menu
// > Continue) on day D. Does the continued game still run the track (the "Next" line, its notes), at the same tick and
// hash, and does it go on as an unbroken page does M days later (same hash, the track's events on their days)?
// Usage: node critic/scripts/c67_h_continue.mjs <days> <moreDays>
import { launch, shot, save, hours, BASE } from './c67_lib.mjs';
const D = Number(process.argv[2] ?? 400), M = Number(process.argv[3] ?? 120);
const out = { D, M };
const hash = (page) => page.evaluate(async () => { const s = await window.__warsim.sim.hash(); return { tick: s.tick, hash: s.hash ?? s.stateHash }; });
const read = (page) => page.evaluate(() => ({
  date: document.querySelector('[data-testid=date-label]')?.innerText.replace(/\n/g, ' | ') ?? null,
  next: document.querySelector('[data-testid=track-next]')?.innerText ?? null,
  ticker: [...document.querySelectorAll('[data-testid=ticker] > *')].map((e) => e.innerText.replace(/\n/g, ' ')).slice(-5),
}));
const open = async (page) => {
  await page.goto(`${BASE}/`);
  await page.getByTestId('title-screen').waitFor();
  await page.getByTestId('title-scenario-1938').click(); await page.getByTestId('title-mode-replay').click();
  await page.waitForTimeout(500);
  await page.getByTestId('settings-new-game').click();
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} if (!window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
};
const a = await launch(1600, 900);
try {
  const page = a.page;
  await open(page);
  out.url = page.url();
  await hours(page, 24 * D);
  await page.waitForTimeout(1500);
  out.left = await hash(page);
  out.leftRead = await read(page);
  out.leftShot = await shot(page, `c67hc_left.png`);
  await page.getByTestId('settings-btn').click();
  await page.getByTestId('settings-menu').click();
  await page.getByTestId('title-continue').waitFor({ timeout: 20000 });
  out.saveText = await page.getByTestId('title-save').innerText();
  out.titleShot = await shot(page, `c67hc_title.png`);
  await page.getByTestId('title-continue').click();
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 120000 });
  await page.waitForTimeout(2500);
  out.cont = await hash(page);
  out.contRead = await read(page);
  out.contShot = await shot(page, `c67hc_continued.png`);
  await hours(page, 24 * M);
  await page.waitForTimeout(1500);
  out.after = await hash(page);
  out.afterRead = await read(page);
  out.afterShot = await shot(page, `c67hc_after.png`);
} catch (e) { out.fail = String(e?.stack ?? e).slice(0, 600); }
finally { out.errors = a.errors; await a.browser.close(); }
const b = await launch(1600, 900);
try {
  const page = b.page;
  // The same URL (its ?after=, the track's second seed, drawn at the title's Start) as the saved game's.
  await page.goto(out.url);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  await hours(page, 24 * D);
  out.unbrokenAtLeave = await hash(page);
  await hours(page, 24 * M);
  await page.waitForTimeout(1500);
  out.unbroken = await hash(page);
  out.unbrokenRead = await read(page);
} catch (e) { out.fail2 = String(e?.stack ?? e).slice(0, 600); }
finally { out.errors2 = b.errors; await b.browser.close(); }
out.sameAfter = out.after?.hash === out.unbroken?.hash && out.after?.tick === out.unbroken?.tick;
save(`c67_hc_${D}_${M}.json`, out);
console.log(JSON.stringify(out, null, 1));
