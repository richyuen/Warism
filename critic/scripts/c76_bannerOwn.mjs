// Critic run 73 (new): R110's one row of banners and the player's own war. The 1942 replay, Germany taken by Take
// control (as c76_takescore), run DAYS days at Max: each 30 days the banners shown, whether any names the player's
// nation, the "+n"; then "+n" clicked: the banners then, whether it stays open 30 days on, and after a reload.
// Usage: node critic/scripts/c76_bannerOwn.mjs [year=1942] [NATION=GER] [name=Germany] [DAYS=150] [W H]
import { launch, save, shot, BASE, CELLS } from './c76_lib.mjs';
const year = Number(process.argv[2] ?? 1942), NAT = process.argv[3] ?? 'GER', name = process.argv[4] ?? 'Germany';
const DAYS = Number(process.argv[5] ?? 150), W = Number(process.argv[6] ?? 1600), H = Number(process.argv[7] ?? 900);
const out = { year, NAT, samples: [] };
const { browser, page, errors } = await launch(W, H);
const banners = () => page.evaluate(() => ({ titles: [...document.querySelectorAll('[data-testid=war-banner]')].map((b) => b.getAttribute('title') ?? ''), shown: [...document.querySelectorAll('[data-testid=war-banner]')].map((b) => b.innerText.replace(/\s+/g, ' ')), more: document.querySelector('[data-testid=war-more]')?.innerText ?? null, wars: window.__warsim.hud.stats.value?.wars?.length ?? null, all: (window.__warsim.hud.stats.value?.wars ?? []).map((w) => ({ id: w.id, a: w.attackers, d: w.defenders, start: w.startTick, score: w.score })) }));
const stepH = (n) => page.evaluate(async (n) => {
  const w = window.__warsim; const target = w.view.lastTick + n; await w.sim.step(n); const t0 = performance.now();
  await new Promise((done) => { const f = () => (w.view.lastTick >= target || performance.now() - t0 > 900000 ? done() : setTimeout(f, 20)); f(); });
}, n);
try {
  await page.goto(`${BASE}/?scenario=1938h&seed=1938&paused=1&year=${year}&mode=replay${process.env.AFTER ? `&after=${process.env.AFTER}` : ""}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 180_000 });
  await page.waitForTimeout(2500);
  await page.evaluate((n) => window.__warsim.view.select(n), CELLS.tags[NAT]);
  await page.waitForTimeout(800);
  await page.getByTestId('take-control').click();
  await page.getByTestId('nation-close').click().catch(() => {});
  out.label = await page.getByTestId('player-label').innerText().catch(() => null);
  for (let d = 30; d <= DAYS; d += 30) {
    await stepH(30 * 24);
    await page.waitForTimeout(1300);
    const b = await banners();
    const own = b.shown.filter((t, i) => t.includes(name) || (b.titles[i] ?? '').includes(name)).length;
    const me = CELLS.tags[NAT];
    const mine = b.all.filter((w) => w.a.includes(me) || w.d.includes(me));
    b.ownWars = mine.length; b.ownSizes = mine.map((w) => `${w.a.length}v${w.d.length} score ${w.score}`); b.sizes = b.all.map((w) => w.a.length + w.d.length).sort((x, y) => y - x); delete b.all;
    out.samples.push({ d, ...b, own });
    console.log(`day ${d}: shown ${JSON.stringify(b.shown)} more ${b.more}; of the player's on the banners: ${own}; the player's wars: ${b.ownWars} (${b.ownSizes.join(', ')}); all wars' nations ${JSON.stringify(b.sizes)}`);
  }
  out.shotClosed = await shot(page, `c76bo${process.env.TAG ?? ''}_${year}_${NAT}_${W}x${H}_closed.png`);
  if (await page.getByTestId('war-more').count()) {
    await page.getByTestId('war-more').click(); await page.waitForTimeout(500);
    const b = await banners(); delete b.all;
    out.opened = b; out.openedOwn = b.shown.filter((t) => t.includes(name));
    console.log(`opened: ${b.shown.length} banners; the player's: ${JSON.stringify(out.openedOwn)}; first of them at place ${b.shown.findIndex((t) => t.includes(name)) + 1}`);
    out.shotOpen = await shot(page, `c76bo${process.env.TAG ?? ''}_${year}_${NAT}_${W}x${H}_open.png`);
    await stepH(30 * 24); await page.waitForTimeout(1300);
    const c = await banners(); delete c.all;
    out.after30 = c;
    console.log(`30 days on: ${c.shown.length} banners shown, more ${c.more}`);
  }
} catch (e) {
  out.error = String(e?.stack ?? e).slice(0, 1200);
  console.log('ERROR', out.error);
}
out.errors = errors;
save(`c76_bo${process.env.TAG ?? ''}_${year}_${NAT}_${W}x${H}.json`, out);
await browser.close();
