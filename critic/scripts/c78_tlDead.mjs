// Critic run 77 (new): R149's time-lapse "of the month shown", where the month's owner is dead now. A save with a whole
// record (run 76's 7019 year-20 world, made after R143) loaded in the page; History -> Time-lapse; step 0 (January 1938).
// The camera on the middle of the largest region whose owner then is no living nation now: the tooltip (resting mouse),
// a click (which panel opens, its text). Then: Escape twice (panel, then plate?), the game's Resume button while the plate
// is open (does the game run under it?), the plate opened again and the "from" label read.
// Usage: [BASE=...] node critic/scripts/c78_tlDead.mjs <file.bin> [W H]
import { readFileSync } from 'node:fs';
import { launch, open1938, shot, save, screenOf } from './c78_lib.mjs';
const file = process.argv[2] ?? 'critic/c76_seed7019_y20.bin', W = Number(process.argv[3] ?? 1600), H = Number(process.argv[4] ?? 900);
const out = { file, W, H };
const { browser, page, errors } = await launch(W, H);
const P = `c78tld_${W}x${H}`;
const plate = () => page.evaluate(() => { const b = document.querySelector('[data-testid=time-lapse]'); const h = window.__warsim.hud; return { open: !!b, step: b?.getAttribute('data-step'), steps: b?.getAttribute('data-steps'), from: document.querySelector('[data-testid=time-lapse-from]')?.textContent ?? null, date: document.querySelector('[data-testid=time-lapse-date]')?.textContent ?? null, tick: h.tick.value, paused: h.paused.value, selected: h.selected.value }; });
async function openLapse() {
  await page.evaluate(() => { if (!window.__warsim.hud.showHistory.value) window.__warsim.hud.toggleHistory(); });
  await page.waitForTimeout(600);
  await page.getByTestId('history-timelapse').click();
  await page.getByTestId('time-lapse').waitFor({ timeout: 30_000 });
  await page.waitForTimeout(500);
}
try {
  const bytes = readFileSync(file);
  await page.route('**/__critic_old.bin', (r) => r.fulfill({ status: 200, body: bytes, contentType: 'application/octet-stream' }));
  await open1938(page, 7019);
  await page.evaluate(async () => window.__warsim.sim.load(new Uint8Array(await (await fetch('/__critic_old.bin')).arrayBuffer())));
  await page.waitForTimeout(4000);
  out.loadedTick = await page.evaluate(() => window.__warsim.hud.tick.value);
  await openLapse();
  // History closed so the map is clear (the plate stays?).
  await page.evaluate(() => { if (window.__warsim.hud.showHistory.value) window.__warsim.hud.toggleHistory(); });
  await page.waitForTimeout(400);
  out.afterHistoryClosed = await plate();
  await page.evaluate(() => window.__warsim.hud.seekTimeLapse(0));
  await page.waitForTimeout(500);
  out.at0 = await plate();
  const pick = await page.evaluate(() => {
    const w = window.__warsim, v = w.view, p = w.hud.timeLapse.value, now = v.ownerCopy(), gw = v.geo.w, gh = now.length / gw;
    const living = new Set(w.hud.stats.value.nations.map((n) => n.id));
    let best = null, bestN = -1;
    for (let y = 4; y < gh - 4; y += 2) for (let x = 4; x < gw - 4; x += 2) {
      const k = y * gw + x; const t = p.map[k]; if (!t || living.has(t)) continue;
      let n = 0; for (let dy = -6; dy <= 6; dy += 2) for (let dx = -6; dx <= 6; dx += 2) if (p.map[k + dy * gw + dx] === t) n++;
      if (n > bestN) { bestN = n; best = { x: x + 0.5, y: y + 0.5, then: t, now: now[k] }; }
    }
    const nm = (id) => w.hud.stats.value.nations.find((n) => n.id === id)?.name ?? null;
    return best && { ...best, nowName: nm(best.now), around: bestN, deadCount: new Set([...p.map].filter((t) => t && !living.has(t))).size };
  });
  out.pick = pick;
  if (pick) {
    await page.evaluate(({ x, y }) => { const v = window.__warsim.view; const c = v.controller.cam; v.controller.set({ cx: x, cy: y, scale: c.scale * 3 }); }, pick);
    await page.waitForTimeout(1200);
    const [sx, sy] = await screenOf(page, pick.x, pick.y);
    out.screen = [sx, sy];
    out.cam = await page.evaluate(() => { const c = window.__warsim.view.controller.cam; return [c.cx, c.cy, c.scale]; });
    // A control: a cell of a nation living now, near the middle of the screen's left half.
    out.control = await page.evaluate(({ W, H }) => { const v = window.__warsim.view; const ids = []; for (let x = 100; x < W - 100; x += 60) for (let y = 150; y < H - 150; y += 60) ids.push([x, y, v.nationAt(x, y)]); return ids; }, { W, H });
    await page.mouse.move(sx, sy);
    await page.mouse.move(sx + 1, sy + 1);
    await page.waitForTimeout(1500);
    out.under = await page.evaluate(({ sx, sy }) => window.__warsim.view.nationAt(sx, sy), { sx, sy });
    out.tooltip = await page.evaluate(() => [...document.querySelectorAll('.map-tooltip')].map((e) => `${e.innerText} [${getComputedStyle(e).display}]`).join(' | '));
    // Hover over each control spot with a living-now owner then: the tooltip.
    const living = await page.evaluate(() => window.__warsim.hud.stats.value.nations.map((n) => n.id));
    out.controlTips = [];
    for (const [x, y, id] of out.control.filter((c) => c[2] !== 0).slice(0, 400)) {
      if (out.controlTips.length >= 6) break;
      const alive = living.includes(id);
      if (out.controlTips.filter((c) => c.alive === alive).length >= 3) continue;
      await page.mouse.move(x, y); await page.mouse.move(x + 1, y + 1); await page.waitForTimeout(900);
      out.controlTips.push({ x, y, id, alive, tip: await page.evaluate(() => [...document.querySelectorAll('.map-tooltip')].map((e) => e.innerText.replace(/\n/g, ' / ')).join(' | ')) });
    }
    await page.mouse.move(sx, sy); await page.mouse.move(sx + 1, sy + 1); await page.waitForTimeout(900);
    out.shotHover = await shot(page, `${P}_hover.png`);
    await page.mouse.click(sx, sy);
    await page.waitForTimeout(1200);
    out.click = await page.evaluate(() => { const w = window.__warsim; return { selected: w.hud.selected.value, viewSel: w.view.selected, panel: (document.querySelector('[data-testid=nation-panel]')?.innerText ?? '').slice(0, 300), asides: [...document.querySelectorAll('aside')].map((a) => (a.getAttribute('data-testid') ?? a.className)) }; });
    out.shotClick = await shot(page, `${P}_click.png`);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  out.esc1 = await plate();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  out.esc2 = await plate();
  // The plate again: the game's own Resume button (the bar's) while it is open.
  if (!out.esc2.open) await openLapse();
  await page.evaluate(() => { if (window.__warsim.hud.showHistory.value) window.__warsim.hud.toggleHistory(); });
  await page.evaluate(() => window.__warsim.hud.seekTimeLapse(0));
  await page.waitForTimeout(300);
  const t0 = await plate();
  const resume = page.locator('[data-testid=pause-btn]');
  out.resumeButtons = await resume.count();
  out.barButtons = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => b.offsetParent !== null).map((b) => `${b.getAttribute('data-testid') ?? ''}:${(b.innerText || b.title || '').trim().slice(0, 20)}`));
  if (out.resumeButtons) {
    await resume.first().click();
    await page.waitForTimeout(4000);
    const t1 = await plate();
    out.resume = { before: t0, after: t1, ranHours: t1.tick - t0.tick };
    out.shotResume = await shot(page, `${P}_resume.png`);
  }
} catch (e) {
  out.error = String(e).slice(0, 400);
  await shot(page, `${P}_error.png`).catch(() => {});
}
out.errors = errors;
save(`${P}.json`, out);
console.log(JSON.stringify(out, null, 1));
await browser.close();
