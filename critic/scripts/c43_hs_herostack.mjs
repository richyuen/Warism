// Critic run 24 (new), HS: what the hero's T1 marker with a "×N" badge is: clicks on it at 1200 m/px open which formation(s)?
import { launch, open1938, shot, save, lookAt, hours, screenOf } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 3739);
const out = { seed, clicks: [] };
const { browser, page, errors } = await launch();
try {
  await open1938(page, seed, '&heroes=on');
  await hours(page, 2);
  for (const id of [1474, 1475, 1477]) {
    const p = await page.evaluate((id) => window.__warsim.view.formationPos(id), id);
    await lookAt(page, p[0], p[1], 1200);
    const near = await page.evaluate(({ p, id }) => { const v = window.__warsim.view; const r = []; for (let n = 1; n < 120; n++) for (const f of v.formationsOf(n)) { const q = v.formationPos(f); if (q && Math.hypot(q[0] - p[0], q[1] - p[1]) < 1.5) r.push([f, n, +q[0].toFixed(2), +q[1].toFixed(2)]); } return r; }, { p, id });
    const [sx, sy] = await screenOf(page, p[0], p[1]);
    const rec = { id, near, opened: [] };
    for (let k = 0; k < 5; k++) {
      await page.mouse.click(sx, sy - 6);
      await page.waitForTimeout(900);
      rec.opened.push(await page.evaluate(() => { const d = [...document.querySelectorAll('div')].filter((e) => /Kind/.test(e.innerText) && e.innerText.length < 700).sort((a, b) => a.innerText.length - b.innerText.length)[0]; return d ? d.innerText.split('\n').slice(0, 3).join(' | ') : null; }));
    }
    rec.shot = await shot(page, `c43hs_${seed}_${id}_1200m.png`);
    await page.keyboard.press('Escape');
    out.clicks.push(rec);
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c43_hs_${seed}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 3000));
