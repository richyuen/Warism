// Critic run 74 (new): R121's row of banners with no nation played, then with one. Plain 1938 SEED (heroes on, as from
// the title), DAYS days, a day at a time: the banners of the row (their wars' ids, whether each has a battle), and the
// wars behind "+n". Counted: the days the row's order changed, the days its set changed, the banner-days of a war with
// no battle while a war with one was behind "+n" ("a quiet giant on the row"). Then: a nation that leads a war behind
// "+n" is taken (Take control): is its war first; released: does the row go back.
// Usage: node critic/scripts/c78_bannerRank.mjs <seed> [DAYS=150] [W=1600 H=900]
import { launch, open1938, shot, save } from './c78_lib.mjs';
const seed = Number(process.argv[2] ?? 57901), DAYS = Number(process.argv[3] ?? 150);
const W = Number(process.argv[4] ?? 1600), H = Number(process.argv[5] ?? 900);
const out = { seed, days: [] };
const { browser, page, errors } = await launch(W, H);
const read = () => page.evaluate(() => {
  const s = window.__warsim.hud.stats.value;
  const byId = new Map((s?.nations ?? []).map((n) => [n.id, n]));
  const row = [...document.querySelectorAll('[data-testid=war-banner]')].map((b) => ({ id: Number(b.getAttribute('data-war')), battle: b.getAttribute('data-battle') === '1', text: b.innerText.replace(/\s+/g, ' ') }));
  const wars = (s?.wars ?? []).map((w) => ({ id: w.id, battle: w.battle, a: w.attackers, d: w.defenders, lead: [byId.get(w.attackers[0])?.name, byId.get(w.defenders[0])?.name], men: [...w.attackers, ...w.defenders].reduce((x, n) => x + (byId.get(n)?.men ?? 0), 0), start: w.startTick }));
  return { row, wars, more: document.querySelector('[data-testid=war-more]')?.innerText ?? null };
});
const stepH = (n) => page.evaluate(async (n) => {
  const w = window.__warsim; const target = w.view.lastTick + n; await w.sim.step(n); const t0 = performance.now();
  await new Promise((done) => { const f = () => (w.view.lastTick >= target || performance.now() - t0 > 300000 ? done() : setTimeout(f, 20)); f(); });
}, n);
try {
  await open1938(page, seed, '&heroes=on');
  let prev = null, orderChanges = 0, setChanges = 0, quietWhileBattleBehind = 0, bannerDays = 0, quietDays = 0, swapsSameSet = 0;
  for (let d = 1; d <= DAYS; d++) {
    await stepH(24);
    await page.waitForTimeout(250);
    const r = await read();
    const ids = r.row.map((b) => b.id);
    const behind = r.wars.filter((w) => !ids.includes(w.id));
    const behindBattle = behind.filter((w) => w.battle).length;
    for (const b of r.row) { bannerDays++; if (!b.battle) { quietDays++; if (behindBattle > 0) quietWhileBattleBehind++; } }
    if (prev) {
      const sameSet = prev.length === ids.length && prev.every((x) => ids.includes(x));
      if (!sameSet) setChanges++;
      else if (prev.join() !== ids.join()) { orderChanges++; swapsSameSet++; }
    }
    prev = ids;
    out.days.push({ d, row: r.row.map((b) => `${b.text}${b.battle ? '' : ' (quiet)'}`), more: r.more, wars: r.wars.length, behindBattle });
    if (d % 30 === 0) {
      console.log(`day ${d}: row ${JSON.stringify(r.row.map((b) => `${b.text}${b.battle ? '' : ' (quiet)'}`))} more ${r.more}; wars ${r.wars.length}; behind with a battle ${behindBattle}: ${JSON.stringify(behind.filter((w) => w.battle).map((w) => `${w.lead[0]} v ${w.lead[1]} ${Math.round(w.men / 1000)}k`))}; row men ${JSON.stringify(r.row.map((b) => Math.round((r.wars.find((w) => w.id === b.id)?.men ?? 0) / 1000) + 'k'))}`);
      await shot(page, `c78br_${seed}_${W}x${H}_d${d}.png`);
    }
  }
  out.sum = { bannerDays, quietDays, quietWhileBattleBehind, setChanges, orderChanges };
  console.log(`sum: banner-days ${bannerDays}, of a war with no battle ${quietDays}, of those while a war with a battle was behind "+n" ${quietWhileBattleBehind}; days the row's set changed ${setChanges}, days its order alone changed ${orderChanges} (of ${DAYS - 1})`);
  // A nation played: the leader of a war behind "+n".
  const r = await read();
  const ids = r.row.map((b) => b.id);
  const behind = r.wars.filter((w) => !ids.includes(w.id));
  if (behind.length > 0) {
    const w = behind[behind.length - 1];
    const nation = w.a[0];
    await page.evaluate((n) => window.__warsim.view.select(n), nation);
    await page.waitForTimeout(800);
    await page.getByTestId('take-control').click();
    await page.waitForTimeout(1200);
    const t = await read();
    out.taken = { nation: w.lead[0], war: w.id, row: t.row.map((b) => b.text), first: t.row[0]?.id === w.id, label: await page.getByTestId('player-label').innerText().catch(() => null) };
    console.log(`taken ${w.lead[0]} (war ${w.id}, ${Math.round(w.men / 1000)}k men, behind "+n" before): row now ${JSON.stringify(out.taken.row)}; its war first: ${out.taken.first}; label ${out.taken.label}`);
    out.taken.shot = await shot(page, `c78br_${seed}_${W}x${H}_taken.png`);
    if (await page.getByTestId('release-control').count()) {
      await page.getByTestId('release-control').click();
      await page.waitForTimeout(1200);
      const u = await read();
      out.released = { row: u.row.map((b) => b.text), back: u.row.map((b) => b.id).join() === ids.join() };
      console.log(`released: row ${JSON.stringify(out.released.row)}; as before the taking: ${out.released.back}`);
    } else console.log('no release-control button found');
  } else console.log('no war behind "+n" at the end: the taking not tried');
} catch (e) {
  out.error = String(e?.stack ?? e).slice(0, 1200);
  console.log('ERROR', out.error);
}
out.errors = errors;
console.log(`page errors ${errors.length}`);
save(`c78_br_${seed}_${W}x${H}.json`, out);
await browser.close();
