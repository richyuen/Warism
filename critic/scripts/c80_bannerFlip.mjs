// Critic run 75 (new): R130's order of the banners' row (a war with a battle before one without), as a player sees it
// while the game runs. Plain 1938 SEED with heroes, stepped to DAY; then Resume at the speed as loaded for SECS seconds,
// the row read every 100 ms: each banner's war, slot and whether it has a battle.
// Counted: the times the row changed (its set, its order alone); how long each war held a slot ("tenure"), the tenures
// under 2 s and under 5 s; the flip-flops (the row back at an order it had within the last 10 s); the times the banner
// under a resting cursor (the first slot's middle) became another war's.
// Optional PLAY=<nation name>: that nation is taken first (its wars are the first banners).
// Usage: [BASE=...] [PLAY=Germany] node critic/scripts/c80_bannerFlip.mjs <seed> <day> <tag> [SECS=60] [W=1600 H=900]
import { launch, open1938, shot, save, hours } from './c80_lib.mjs';
const seed = Number(process.argv[2] ?? 57901), DAY = Number(process.argv[3] ?? 150), tag = process.argv[4] ?? 'head';
const SECS = Number(process.argv[5] ?? 60), W = Number(process.argv[6] ?? 1600), H = Number(process.argv[7] ?? 900);
const out = { seed, DAY, tag, SECS, W, H };
const { browser, page, errors } = await launch(W, H);
try {
  await open1938(page, seed, '&heroes=on');
  await hours(page, DAY * 24);
  await page.waitForTimeout(1000);
  if (process.env.PLAY) {
    const id = JSON.parse((await import('node:fs')).readFileSync(new URL('../c6_cells.json', import.meta.url), 'utf8')).tags[process.env.PLAY] ?? 0; // PLAY is a tag (GER)
    await page.evaluate((n) => window.__warsim.view.select(n), id);
    await page.waitForTimeout(800);
    await page.getByTestId('take-control').click();
    await page.waitForTimeout(1000);
  }
  const first = await page.evaluate(() => { const b = document.querySelector('[data-testid=war-banner]'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  out.cursor = first;
  await page.evaluate((first) => {
    window.__c80b = []; window.__c80stop = false;
    const f = () => {
      const row = [...document.querySelectorAll('[data-testid=war-banner]')].map((b) => `${b.getAttribute('data-war')}${b.getAttribute('data-battle') === '1' ? 'b' : 'q'}`);
      const under = first ? document.elementFromPoint(first.x, first.y)?.closest('[data-testid=war-banner]')?.getAttribute('data-war') ?? null : null;
      window.__c80b.push({ t: performance.now(), tick: window.__warsim.view.lastTick, row, under });
      if (!window.__c80stop) setTimeout(f, 100);
    };
    f();
  }, first);
  const speed = await page.getByTestId('speed-label').innerText().catch(() => null);
  out.shotStart = await shot(page, `c80bf_${tag}_${seed}_${W}x${H}_start.png`);
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await page.waitForTimeout(SECS * 1000);
  const live = await page.evaluate(() => { window.__c80stop = true; return window.__c80b; });
  await page.getByRole('button', { name: 'Pause', exact: true }).click().catch(() => {});
  out.shotEnd = await shot(page, `c80bf_${tag}_${seed}_${W}x${H}_end.png`);
  const ids = (r) => r.row.map((x) => x.slice(0, -1));
  let setCh = 0, orderCh = 0, underCh = 0, flipflop = 0;
  const tenures = []; // per slot: { war, from }
  const open = [];
  const hist = [];
  const changes = [];
  for (let i = 0; i < live.length; i++) {
    const cur = ids(live[i]);
    cur.forEach((w, s) => {
      if (!open[s] || open[s].war !== w) { if (open[s]) tenures.push({ slot: s, war: open[s].war, ms: live[i].t - open[s].from, cut: false }); open[s] = { war: w, from: live[i].t }; }
    });
    if (i > 0) {
      const prev = ids(live[i - 1]);
      if (prev.join() !== cur.join()) {
        const same = prev.length === cur.length && prev.every((x) => cur.includes(x));
        if (same) orderCh++; else setCh++;
        if (hist.some((h) => live[i].t - h.t < 10000 && h.key === cur.join())) flipflop++;
        hist.push({ t: live[i - 1].t, key: prev.join() });
        changes.push({ s: ((live[i].t - live[0].t) / 1000).toFixed(1), day: ((live[i].tick - live[0].tick) / 24).toFixed(1), from: live[i - 1].row.join(' '), to: live[i].row.join(' '), same });
      }
      if (live[i].under !== live[i - 1].under) underCh++;
    }
  }
  const ms = tenures.map((t) => t.ms);
  out.sum = { samples: live.length, days: (live[live.length - 1].tick - live[0].tick) / 24, setCh, orderCh, flipflop, underCh, tenures: ms.length, under2s: ms.filter((x) => x < 2000).length, under5s: ms.filter((x) => x < 5000).length, shortestMs: ms.length ? Math.round(Math.min(...ms)) : null };
  out.changes = changes;
  console.log(`${tag} seed ${seed} day ${DAY}${process.env.PLAY ? ` playing ${process.env.PLAY}` : ''} ${W}x${H}, running ${SECS} s (${speed}), ${out.sum.days.toFixed(1)} days, ${live.length} samples: the row changed ${setCh + orderCh} times (its set ${setCh}, its order alone ${orderCh}); back at an order of the last 10 s: ${flipflop}; slot tenures ended ${ms.length}, under 2 s ${out.sum.under2s}, under 5 s ${out.sum.under5s}, the shortest ${out.sum.shortestMs} ms; the banner under a resting cursor changed ${underCh} times`);
  for (const c of changes.slice(0, 40)) console.log(`  +${c.s} s (day +${c.day}): ${c.from} -> ${c.to}${c.same ? ' (order alone)' : ''}`);
} catch (e) {
  out.error = String(e?.stack ?? e).slice(0, 1200);
  console.log('ERROR', out.error);
}
out.errors = errors;
console.log(`page errors ${errors.length}`);
save(`c80_bf_${tag}_${seed}_${W}x${H}${process.env.PLAY ? '_' + process.env.PLAY : ''}.json`, out);
await browser.close();
