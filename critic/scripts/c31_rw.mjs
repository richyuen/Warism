// Critic run 28 (new), RW: the first-run path through the title screen into the random world, then 3 years watched at
// Max (1600x900). The title screen's scenario cards, the random world's settings, boot time, each year's shot, the
// ticker, the banners, the frame rate; at the end a zoom series over the busiest fight; a click on a nation.
// Usage: node critic/scripts/c31_rw.mjs <seed> <nations> <years>
import { launch, shot, save, lookAt, BASE } from './c31_lib.mjs';
const [seed, nations, years] = [Number(process.argv[2] ?? 6143), Number(process.argv[3] ?? 80), Number(process.argv[4] ?? 3)];
const out = { seed, nations, years: [] };
const { browser, page, errors } = await launch(1600, 900);
const L = `c31rw_${seed}`;
try {
  await page.goto(`${BASE}/`);
  await page.getByTestId('title-screen').waitFor({ timeout: 60_000 });
  await page.waitForTimeout(1500);
  out.cards = await page.evaluate(() => [...document.querySelectorAll('[data-testid^=title-scenario-]')].map((e) => e.getAttribute('data-testid') + ': ' + e.innerText.replace(/\n/g, ' | ').slice(0, 120)));
  await shot(page, `${L}_00_title.png`);
  const rnd = page.locator('[data-testid=title-scenario-random]');
  out.hasRandomCard = (await rnd.count()) > 0;
  if (out.hasRandomCard) { await rnd.click(); await page.waitForTimeout(800); }
  out.detail = await page.getByTestId('title-detail').innerText().catch(() => null);
  await shot(page, `${L}_01_random_detail.png`);
  // set seed and nations where the form allows
  const seedIn = page.getByTestId('settings-seed');
  if (await seedIn.count()) { await seedIn.fill(String(seed)); }
  const nIn = page.getByTestId('settings-nations');
  if (await nIn.count()) { await nIn.fill(String(nations)); }
  await page.waitForTimeout(500);
  await shot(page, `${L}_02_random_set.png`);
  const t0 = Date.now();
  const start = page.getByTestId('settings-new-game');
  out.startButton = await start.count();
  if (out.startButton) await start.click(); else await page.goto(`${BASE}/?scenario=random&seed=${seed}&nations=${nations}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 180_000 });
  out.bootS = (Date.now() - t0) / 1000;
  out.url = page.url();
  await page.waitForTimeout(1500);
  out.nationsAtStart = await page.evaluate(() => window.__warsim.hud.stats.value?.nations?.length ?? null);
  await shot(page, `${L}_03_start.png`);
  await page.evaluate(() => {
    try { window.__warsim.settings.nukePause.value = false; } catch {}
    window.__lw = { gaps: [], last: performance.now(), frames: 0 };
    const f = (t) => { const w = window.__lw; w.gaps.push(t - w.last); w.last = t; w.frames++; requestAnimationFrame(f); };
    requestAnimationFrame(f);
    window.__warsim.hud.setSpeedLevel(99);
  });
  for (let y = 1; y <= years; y++) {
    const tk = await page.evaluate(() => window.__warsim.hud.tick.value);
    await page.evaluate(() => { window.__lw.gaps = []; window.__lw.frames = 0; if (window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
    const w0 = Date.now();
    await page.waitForFunction((t) => window.__warsim.hud.tick.value >= t + 8760, tk, { timeout: 900_000, polling: 250 });
    const wall = (Date.now() - w0) / 1000;
    await page.evaluate(() => { if (!window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
    const s = await page.evaluate(() => {
      const g = window.__lw.gaps.slice().sort((a, b) => a - b);
      return {
        frames: window.__lw.frames, maxGap: Math.round(g[g.length - 1] ?? 0), over500: g.filter((x) => x > 500).length,
        ticker: [...document.querySelectorAll('[data-testid=ticker] > *')].map((e) => e.innerText.replace(/\n/g, ' ')).slice(-5),
        chips: [...document.querySelectorAll('[data-testid=war-banner]')].map((c) => c.innerText.replace(/\n/g, ' ')),
        nations: window.__warsim.hud.stats.value?.nations?.length ?? null,
        top: (window.__warsim.hud.stats.value?.nations ?? []).slice().sort((a, b) => b.area - a.area).slice(0, 5).map((n) => `${n.name} ${(n.landShare * 100).toFixed(1)}%`),
      };
    });
    s.year = y; s.wallS = wall; s.fps = +(s.frames / wall).toFixed(1);
    s.shot = await shot(page, `${L}_y${y}_world.png`);
    out.years.push(s);
    save(`c31_rw_${seed}.json`, { ...out, errors });
    console.log(y, wall, s.fps, s.maxGap, s.nations, s.top.join(', '));
  }
  const at = await page.evaluate(async () => {
    const v = window.__warsim.view; const st = await window.__warsim.sim.inspect(true);
    const eng = st.formations.filter((f) => !v.formationAfloat(f.id) && v.formationEngaged(f.id)).map((f) => v.formationPos(f.id)).filter(Boolean);
    let best = null, bn = -1;
    for (const p of eng) { const n = eng.filter((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 3).length; if (n > bn) { bn = n; best = p; } }
    return { best, bn, engaged: eng.length };
  });
  out.fight = at;
  if (at.best) for (const m of [12000, 3000, 600, 120, 25]) {
    await lookAt(page, at.best[0], at.best[1], m);
    await page.waitForTimeout(600);
    await shot(page, `${L}_zoom_${String(m).padStart(5, '0')}.png`);
  }
  // click the screen centre: what the player gets
  await page.mouse.click(800, 450);
  await page.waitForTimeout(800);
  out.clickPanel = await page.evaluate(() => (document.querySelector('[data-testid=formation-panel]') ?? document.querySelector('[data-testid=nation-panel]') ?? document.querySelector('[data-testid=nation-menu]'))?.innerText.slice(0, 600) ?? null);
  await shot(page, `${L}_click.png`);
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c31_rw_${seed}.json`, out);
await browser.close();
console.log(out.fatal ?? 'ok', errors.slice(0, 5));
