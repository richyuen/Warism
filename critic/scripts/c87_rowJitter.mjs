// Critic run 87 (new, R202 off its case). R202 puts the desk's war row on the bar's centre when its banners fit evenly on
// both sides, else in the free band's middle. Its case is a paused game. Here the game RUNS (heroes on, at the speed as
// loaded) for SECS seconds at each size and map mode; the row is read every 100 ms: its centre against the page's, its
// banner count. Counted: sideways moves of the row (its centre moving > 2 px while the window does not change), and the
// moves that are a centre/band switch (|offset| from ~0 to > 8 or back); the count changes. A row that walks sideways
// while the player watches is the jitter R202's design objection was about.
// Usage: [BASE=...] node critic/scripts/c87_rowJitter.mjs <seed> <day> [SECS=40] [sizes=1280x720,1366x768,1100x800,820x800] [modes=political,seaControl]
import { launch, open1938, shot, save, hours } from './c85_lib.mjs';
const seed = Number(process.argv[2] ?? 87601), DAY = Number(process.argv[3] ?? 300), SECS = Number(process.argv[4] ?? 40);
const sizes = (process.argv[5] ?? '1280x720,1366x768,1100x800,820x800').split(',').map((s) => s.split('x').map(Number));
const modes = (process.argv[6] ?? 'political,seaControl').split(',');
const out = { seed, DAY, SECS, cases: [] };
const { browser, page, errors } = await launch(1600, 900);
try {
  await open1938(page, seed, '&heroes=on');
  await hours(page, DAY * 24);
  await page.waitForTimeout(800);
  for (const [W, H] of sizes) for (const mode of modes) {
    await page.setViewportSize({ width: W, height: H });
    await page.evaluate((m) => window.__warsim.hud.setMapMode(m), mode);
    await page.waitForTimeout(700);
    await page.evaluate(() => {
      window.__c87 = []; window.__c87stop = false;
      const f = () => {
        const row = document.querySelector('[data-testid=war-banners]');
        const r = row?.getBoundingClientRect();
        const n = row ? row.querySelectorAll('[data-testid=war-banner]').length : 0;
        const wars = row ? [...row.querySelectorAll('[data-testid=war-banner]')].map((b) => b.getAttribute('data-war')).join(',') : '';
        window.__c87.push({ t: performance.now(), c: r ? (r.left + r.right) / 2 - innerWidth / 2 : null, w: r ? r.width : 0, n, wars, more: row?.querySelector('[data-testid=war-more]')?.textContent.trim() ?? null });
        if (!window.__c87stop) setTimeout(f, 100);
      };
      f();
    });
    await page.getByRole('button', { name: 'Resume', exact: true }).click();
    await page.waitForTimeout(SECS * 1000);
    const live = await page.evaluate(() => { window.__c87stop = true; return window.__c87; });
    await page.getByRole('button', { name: 'Pause', exact: true }).click().catch(() => {});
    let moves = 0, switches = 0, countCh = 0, maxOff = 0, minOff = 1e9, bigMoves = [];
    for (let i = 1; i < live.length; i++) {
      const a = live[i - 1], b = live[i];
      if (a.c == null || b.c == null) continue;
      if (Math.abs(b.c - a.c) > 2) { moves++; if (Math.abs(b.c - a.c) > 20 && bigMoves.length < 8) bigMoves.push({ at: Math.round(b.t - live[0].t), from: Math.round(a.c), to: Math.round(b.c), n: `${a.n}->${b.n}`, wars: `${a.wars} | ${b.wars}` }); }
      if ((Math.abs(a.c) <= 2) !== (Math.abs(b.c) <= 2) && Math.max(Math.abs(a.c), Math.abs(b.c)) > 8) switches++;
      if (a.n !== b.n) countCh++;
    }
    for (const s of live) if (s.c != null) { maxOff = Math.max(maxOff, Math.abs(s.c)); minOff = Math.min(minOff, Math.abs(s.c)); }
    const offCentre = live.filter((s) => s.c != null && Math.abs(s.c) > 2).length;
    const c = { W, H, mode, samples: live.length, moves, switches, countCh, offCentreShare: +(offCentre / live.length).toFixed(3), maxOff: Math.round(maxOff), bigMoves };
    c.shot = await shot(page, `c87rj_${seed}_${W}x${H}_${mode}_end.png`);
    out.cases.push(c);
    console.log(`${W}x${H} ${mode}: samples ${live.length} moves ${moves} switches ${switches} countCh ${countCh} offCentre ${c.offCentreShare} maxOff ${c.maxOff} big ${JSON.stringify(bigMoves.slice(0, 3))}`);
  }
} finally {
  out.errors = errors;
  console.log('errors', errors.length, errors.slice(0, 3));
  save(`c87_rj_${seed}.json`, out);
  await browser.close();
}
