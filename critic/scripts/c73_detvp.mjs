// Critic run 73 (new): is the world the same at two window sizes? The 1942 replay (or plain 1938 with YEAR=0), NATION
// taken by Take control at the first hour (or no one, NATION=-), 30 days stepped by sim.step: the tick, the state
// hash, the wars. The same seed and the same acts must give the same hash whatever the viewport.
// Usage: node critic/scripts/c73_detvp.mjs <W> <H> [year=1942] [NATION=GER] [days=30]
import { launch, BASE, CELLS } from './c73_lib.mjs';
const W = Number(process.argv[2] ?? 1600), H = Number(process.argv[3] ?? 900);
const year = Number(process.argv[4] ?? 1942), NAT = process.argv[5] ?? 'GER', days = Number(process.argv[6] ?? 30);
const { browser, page, errors } = await launch(W, H);
const hash = () => page.evaluate(async () => { const s = await window.__warsim.sim.hash(); return { tick: s.tick, hash: s.hash ?? s.stateHash }; });
const stepH = (n) => page.evaluate(async (n) => {
  const w = window.__warsim; const target = w.view.lastTick + n; await w.sim.step(n); const t0 = performance.now();
  await new Promise((done) => { const f = () => (w.view.lastTick >= target || performance.now() - t0 > 900000 ? done() : setTimeout(f, 20)); f(); });
}, n);
const url = year ? `${BASE}/?scenario=1938h&seed=1938&paused=1&year=${year}&mode=replay${process.env.AFTER ? `&after=${process.env.AFTER}` : ""}` : `${BASE}/?scenario=1938&seed=56991&paused=1`;
await page.goto(url);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 180_000 });
await page.waitForTimeout(2500);
const h0 = await hash();
let label = null;
if (NAT !== '-') {
  await page.evaluate((n) => window.__warsim.view.select(n), CELLS.tags[NAT]);
  await page.waitForTimeout(800);
  await page.getByTestId('take-control').click();
  await page.waitForTimeout(300);
  label = await page.getByTestId('player-label').innerText().catch(() => null);
  await page.getByTestId('nation-close').click().catch(() => {});
}
const h1 = await hash();
await stepH(1);
const h2 = await hash();
await stepH(days * 24 - 1);
const h3 = await hash();
const wars = await page.evaluate(() => window.__warsim.hud.stats.value?.wars?.length ?? null);
console.log(`${W}x${H} year ${year} ${NAT}: label ${JSON.stringify(label)}; loaded ${JSON.stringify(h0)}; taken ${JSON.stringify(h1)}; hour 1 ${JSON.stringify(h2)}; day ${days} ${JSON.stringify(h3)}; wars ${wars}; errors ${errors.length}`);
await browser.close();
