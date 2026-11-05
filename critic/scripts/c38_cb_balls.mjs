// Critic run 22, CB: the countryballs (default since PLAN 7.174h) against Classic, the same frozen moment at every
// tier, on a live German-Polish front with armour in contact. Also: the default look on a fresh profile, the setting
// in the Settings panel, and the frame rate at each tier with each look while running at x1.
// Usage: node critic/scripts/c38_cb_balls.mjs <seed> [base]
import { launch, open1938, lookAt, shot, save, hours, CELLS, settle } from './c31_lib.mjs';

const seed = Number(process.argv[2] ?? 7019);
const tag = `c38cb_${seed}`;
const T = CELLS.tags;
const out = { seed, views: [], fps: [] };
const { browser, page, errors } = await launch();
const setLook = (l) => page.evaluate((l) => { window.__warsim.view.unitLook = l; }, l);
const look = () => page.evaluate(() => window.__warsim.view.unitLook);
try {
  await open1938(page, seed);
  out.defaultLook = await look();
  out.storedLook = await page.evaluate(() => localStorage.getItem('warsim.unitLook'));
  await page.evaluate(({ a, d }) => window.__warsim.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: T.GER, d: T.POL });
  let arm = [], inf = [];
  for (let d = 0; d < 14 && arm.length < 1; d++) {
    await hours(page, 24);
    const all = await page.evaluate((n) => {
      const v = window.__warsim.view;
      return v.formationsOf(n).map((f) => ({ f, t: v.formationTitle(f), pos: v.formationPos(f), e: v.formationEngaged(f) })).filter((x) => x.e);
    }, T.GER);
    inf = all.filter((x) => /Infantry/i.test(JSON.stringify(x.t)));
    arm = all.filter((x) => /Armoured|Tank|Panzer/i.test(JSON.stringify(x.t)));
    out.day = d + 1;
  }
  out.picks = { inf: inf[0] ?? null, arm: arm[0] ?? null };
  const tiers = [6000, 3000, 1200, 600, 250, 120, 60, 25, 12, 5];
  for (const [label, p] of [['arm', arm[0]], ['inf', inf[0]]]) {
    if (!p) continue;
    const pos = await page.evaluate((f) => window.__warsim.view.formationPos(f), p.f);
    for (const m of tiers) {
      await lookAt(page, pos[0], pos[1], m);
      for (const l of ['balls', 'classic']) {
        await setLook(l);
        await settle(page);
        await page.waitForTimeout(300);
        const s = await page.evaluate(() => { const v = window.__warsim.view; return { el: v.elementCount, ind: v.individualCount, mpp: Math.round(v.metresPerPx) }; });
        out.views.push({ label, f: p.f, m, look: l, ...s, shot: await shot(page, `${tag}_${label}_${String(m).padStart(4, '0')}m_${l}.png`) });
      }
    }
  }
  // Frame rate at x1, live, per tier and look (on the armour).
  if (arm[0]) {
    for (const m of [3000, 600, 120, 25]) {
      for (const l of ['balls', 'classic']) {
        const pos = await page.evaluate((f) => window.__warsim.view.formationPos(f), arm[0].f);
        if (!pos) break;
        await lookAt(page, pos[0], pos[1], m, false);
        await setLook(l);
        await page.evaluate(() => { window.__warsim.hud.setSpeedLevel(0); if (window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
        const r = await page.evaluate(async () => {
          const v = window.__warsim.view; const f0 = v.frames; const t0 = performance.now(); let worst = 0; let last = t0;
          await new Promise((done) => { const tick = () => { const n = performance.now(); worst = Math.max(worst, n - last); last = n; if (n - t0 > 4000) done(); else requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
          return { fps: +(((v.frames - f0) * 1000) / (performance.now() - t0)).toFixed(1), worstGapMs: Math.round(worst) };
        });
        await page.evaluate(() => { if (!window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
        out.fps.push({ m, look: l, ...r });
        if (m === 25) await shot(page, `${tag}_live25_${l}.png`);
      }
    }
  }
  await setLook('balls');
  // Settings panel: is the look a visible choice?
  try {
    const btn = page.getByRole('button', { name: /Settings/i }).first();
    await btn.click();
    await page.waitForTimeout(600);
    out.settingsText = (await page.evaluate(() => document.body.innerText)).match(/Unit look[\s\S]{0,120}/)?.[0] ?? null;
    out.settingsShot = await shot(page, `${tag}_settings.png`);
  } catch (e) { out.settingsErr = String(e).slice(0, 300); }
} catch (e) {
  out.fatal = String(e?.stack ?? e);
}
out.errors = errors;
save(`c38_cb_${seed}.json`, out);
await browser.close();
console.log(JSON.stringify({ ...out, views: out.views.map((v) => `${v.label} ${v.m} ${v.look} el${v.el} ind${v.ind}`) }, null, 1).slice(0, 5000));
