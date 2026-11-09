// Critic run 52 (new): R40d / R48-N3 in the page. 1938 with heroes on, seed <seed> (20471: run 50's LWHON), stepped
// <hours> hours. Over Europe (Berlin) at 30000 … 2500 m/px (desk 1600x900 or phone): a shot, and the hero counters
// drawn (`view.counters.drawn` with a hero): their boxes, the sum of their areas, and pairs that overlap a nation
// name's box is not exposed, so the shots are the judge for names.
// Usage: node critic/scripts/c57_hero.mjs <seed> <hours> <tag> [W H]
import { launch, open1938, shot, save, lookAt, hours, CELLS } from './c57_lib.mjs';
const [seedS, hS, tag, WS, HS] = process.argv.slice(2);
const seed = Number(seedS ?? 20471), H0 = Number(hS ?? 17520);
const W = Number(WS ?? 1600), H = Number(HS ?? 900);
const out = { seed, hours: H0, W, H, at: [] };
const { browser, page, errors } = await launch(W, H);
try {
  await open1938(page, seed, '&heroes=on');
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  for (let done = 0; done < H0; done += 720) await hours(page, Math.min(720, H0 - done));
  out.date = await page.evaluate(() => document.querySelector('[data-testid=bottombar]')?.innerText.match(/\d+ \w+ \d{4}/)?.[0] ?? null);
  for (const m of [30000, 15000, 10001, 9999, 9000, 8000, 7000, 6000, 5000, 3500, 2500]) {
    await lookAt(page, CELLS.berlin[0], CELLS.berlin[1], m);
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => {
      const v = window.__warsim.view;
      const d = (v.counters?.drawn ?? []).filter((x) => x.hero !== undefined && x.hero !== null);
      const all = (v.counters?.drawn ?? []).filter((x) => x.hero === undefined || x.hero === null);
      const onScreen = (b) => b.x + b.w > 0 && b.y + b.h > 0 && b.x < innerWidth && b.y < innerHeight;
      const hs = d.filter(onScreen);
      const area = hs.reduce((s, b) => s + b.w * b.h, 0);
      const meanOther = all.length ? all.reduce((s, b) => s + b.w * b.h, 0) / all.length : null;
      return { mpp: Math.round(v.metresPerPx), heroes: hs.map((b) => ({ text: b.text, others: b.others, box: [Math.round(b.x), Math.round(b.y), Math.round(b.w), Math.round(b.h)] })), heroArea: Math.round(area), heroAreaPct: +((100 * area) / (innerWidth * innerHeight)).toFixed(2), meanOtherArea: meanOther && Math.round(meanOther), others: all.length };
    });
    r.shot = await shot(page, `c57hero_${tag}_${seed}_${String(m).padStart(5, '0')}.png`);
    out.at.push(r);
  }
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c57_hero_${tag}_${seed}.json`, out);
await browser.close();
console.log(JSON.stringify(out.at.map((a) => [a.mpp, a.heroes.length, a.heroAreaPct, a.meanOtherArea, a.heroes.slice(0, 3).map((h) => `${h.text}:${h.box[2]}x${h.box[3]}`)]), null, 0));
console.log('done:');
