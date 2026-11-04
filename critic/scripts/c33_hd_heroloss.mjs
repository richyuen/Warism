// Critic run 29 (R5a, heroes), HD: a hero's loss and return as the player meets them, in the page.
// 1938, ?heroes=on, seed <seed>. Steps to <lossTick - before> hours, then hour by hour past <lossTick>: whether the hero
// lives, the ticker's rows, the nation's Heroes block, a shot at the hero's last place; then the History panel searched
// for the hero's name and its nation's rows of that day; then to <returnTick>: ticker, block, the hero at its return place.
// Usage: node critic/scripts/c33_hd_heroloss.mjs <seed> <nationId> <heroNameRe> <lossTick> <returnTick> <tagOut>
import { launch, open1938, shot, save, lookAt, hours, settle } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 4111);
const nation = Number(process.argv[3] ?? 1);
const nameRe = new RegExp(process.argv[4] ?? 'Bismarck', 'i');
const lossTick = Number(process.argv[5] ?? 2485);
const returnTick = Number(process.argv[6] ?? 3925);
const tg = process.argv[7] ?? 'bis';
const out = { seed, nation, hero: String(nameRe), lossTick, returnTick, hourly: [], history: {}, ret: {} };
const file = `c33_hd_${seed}_${tg}.json`;
const { browser, page, errors } = await launch();
const ticker = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=ticker] button, [data-testid=ticker] .ticker-row')].map((b) => b.innerText.replace(/\n/g, ' ')).slice(0, 12));
const block = () => page.evaluate(() => document.querySelector('[data-testid="panel-heroes"]')?.innerText.replace(/\n/g, ' | ') ?? null);
const tickNow = () => page.evaluate(() => window.__warsim.view.lastTick);
const heroInfo = (re) => page.evaluate(async ({ src, nation }) => {
  const re = new RegExp(src, 'i');
  const w = window.__warsim;
  const n = w.hud.stats.value.nations.find((x) => x.id === nation);
  const h = n?.heroes?.find((x) => re.test(x.nameKey.replace('template.hero_', '')) || re.test(x.nameKey));
  if (!h || !h.formation) return null;
  const st = await w.sim.inspect(true);
  const f = st.formations.find((g) => g.id === h.formation);
  if (!f) return null;
  return { id: h.formation, name: h.nameKey, x: f.x, y: f.y, nation: f.nation, strength: f.strength, engaged: f.engaged, health: h.health, returnDays: h.returnDays };
}, { src: re.source, nation });
try {
  await open1938(page, seed, '&heroes=on');
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  const before = 30;
  await hours(page, lossTick - before - 1);
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), nation);
  await page.waitForTimeout(600);
  let lastPos = await heroInfo(nameRe);
  out.start = { tick: await tickNow(), hero: lastPos, block: await block() };
  if (lastPos) { await lookAt(page, lastPos.x, lastPos.y, 250); out.start.shot = await shot(page, `c33hd_${seed}_${tg}_before.png`); }
  let lostAt = null;
  for (let h = 0; h < before + 12; h++) {
    await hours(page, 1);
    const hi = await heroInfo(nameRe);
    const row = { tick: await tickNow(), alive: !!hi, x: hi?.x, y: hi?.y, engaged: hi?.engaged, strength: hi?.strength, ticker: await ticker() };
    if (hi) lastPos = hi;
    if (!hi && lostAt === null) {
      lostAt = row.tick;
      await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), nation);
      await page.waitForTimeout(500);
      row.block = await block();
      await lookAt(page, lastPos.x, lastPos.y, 250);
      row.shot = await shot(page, `c33hd_${seed}_${tg}_lost.png`);
      await lookAt(page, lastPos.x, lastPos.y, 3000);
      row.shotWide = await shot(page, `c33hd_${seed}_${tg}_lost_wide.png`);
    }
    out.hourly.push(row);
    if (lostAt !== null && row.tick > lostAt + 6) break;
  }
  out.lostAt = lostAt;
  save(file, { ...out, errors });
  // History: open, read rows that name the hero, and the nation's rows near the loss.
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await page.waitForSelector('[data-testid=history-row]', { timeout: 120_000 });
  out.history.count = await page.evaluate(() => document.querySelector('[data-testid=history-count]')?.innerText);
  out.history.kinds = await page.evaluate(() => [...document.querySelectorAll('[data-testid=history-kind] option')].map((o) => o.textContent));
  out.history.naming = await page.evaluate((src) => [...document.querySelectorAll('[data-testid=history-row]')].map((r) => r.innerText.replace(/\n/g, ' ')).filter((t) => new RegExp(src, 'i').test(t)).slice(0, 20), nameRe.source);
  out.history.first = await page.evaluate(() => [...document.querySelectorAll('[data-testid=history-row]')].slice(0, 15).map((r) => r.innerText.replace(/\n/g, ' ')));
  out.history.shot = await shot(page, `c33hd_${seed}_${tg}_history.png`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  save(file, { ...out, errors });
  // On to the return.
  const now = await tickNow();
  if (returnTick > now + 2) await hours(page, returnTick - now - 2);
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), nation);
  await page.waitForTimeout(600);
  out.ret.waitShot = await shot(page, `c33hd_${seed}_${tg}_waiting.png`);
  out.ret.waitBlock = await block();
  const count0 = await page.evaluate(() => window.__warsim.view.heroFormations().length);
  for (let h = 0; h < 40; h++) {
    await hours(page, 1);
    const c = await page.evaluate(() => window.__warsim.view.heroFormations().length);
    if (c > count0) {
      await page.waitForTimeout(300);
      const hi = await heroInfo(nameRe);
      await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), nation);
      await page.waitForTimeout(500);
      out.ret = { ...out.ret, tick: await tickNow(), hero: hi, ticker: await ticker(), block: await block() };
      if (hi) { await lookAt(page, hi.x, hi.y, 250); out.ret.shot = await shot(page, `c33hd_${seed}_${tg}_returned.png`); }
      break;
    }
  }
  // A day on: what the ticker and the block say.
  await hours(page, 24);
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), nation);
  await page.waitForTimeout(500);
  out.ret.dayAfter = { tick: await tickNow(), ticker: await ticker(), block: await block() };
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(file, out);
await browser.close();
console.log(JSON.stringify({ lostAt: out.lostAt, ret: out.ret?.tick, naming: out.history.naming?.length, fatal: out.fatal }));
