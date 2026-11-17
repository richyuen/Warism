// Critic run 75 (new): a monkey on the page. Plain 1938 SEED with heroes, running; for SECS seconds random acts from a
// seeded generator: clicks and right clicks on the map, drags, wheel turns, keys, and clicks on any shown button, tab,
// select or checkbox (God Mode and the editor included). Left alone: file inputs, downloads, links, and buttons that
// leave the game (title, quit, new game, load, restart).
// Every 10 s: the tick, the frames drawn, the page errors so far, whether the page answers within 5 s; a picture each
// 30 s. If the game is paused for 20 s on end it is resumed by the HUD (the monkey may pause it; a dialog may hold it).
// At the end: Escape thrice, the game resumed, 5 s: does the tick move, do frames draw.
// Usage: node critic/scripts/c75_monkey.mjs <seed> <SECS> [W H] [touch]
import { chromium } from '@playwright/test';
import path from 'node:path';
import { BASE, SHOTS, save } from './c75_lib.mjs';
const seed = Number(process.argv[2] ?? 58801), SECS = Number(process.argv[3] ?? 180);
const W = Number(process.argv[4] ?? 1600), H = Number(process.argv[5] ?? 900), touch = process.argv[6] === 'touch';
const tag = `${seed}_${W}x${H}${touch ? '_touch' : ''}`;
const out = { seed, SECS, W, H, touch, samples: [], acts: {} };
let s = seed >>> 0;
const rnd = () => { s = (s + 0x6d2b79f5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, ...(touch ? { deviceScaleFactor: 2, isMobile: true, hasTouch: true } : {}), acceptDownloads: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`.slice(0, 400)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`error: ${m.text()}`.slice(0, 400)); });
page.on('dialog', (d) => d.dismiss().catch(() => {}));
const log = [];
const act = (k, d = '') => { out.acts[k] = (out.acts[k] ?? 0) + 1; log.push(`${k} ${d}`); if (log.length > 60) log.shift(); };
/** Run 75: an act that does not come back in 8 s is given up (the page may be frozen): counted, and the state asked. */
const guard = (p, ms = 8000) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('ACT TIMEOUT')), ms))]);
const state = () => Promise.race([
  page.evaluate(() => { const w = window.__warsim; return w ? { tick: w.view?.lastTick ?? -1, frames: w.view?.frames ?? -1, paused: w.hud.paused.value, mpp: Math.round(w.view?.metresPerPx ?? 0), url: location.search, cam: [w.view?.controller.cam.cx, w.view?.controller.cam.cy, w.view?.controller.cam.scale] } : { gone: true, url: location.href }; }),
  new Promise((d) => setTimeout(() => d({ hung: true }), 5000)),
]);
const BAD = /menu|title|quit|new game|load|restart|export|download|csv|json|save|file|reset all|leave|exit|scenario/i;
try {
  await page.goto(`${BASE}/?scenario=1938&seed=${seed}&heroes=on`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null && window.__warsim.sim.mapLayers !== null, null, { timeout: 180_000 });
  await page.evaluate(() => (window.__warsim.hud.paused.value ? window.__warsim.hud.togglePause() : undefined));
  const t0 = Date.now(); let lastSample = 0, lastShot = 0, pausedSince = null, n = 0;
  while (Date.now() - t0 < SECS * 1000) {
    const r = rnd(); n++;
    const x = Math.floor(rnd() * W), y = Math.floor(rnd() * H);
    try {
     await guard((async () => {
      if (r < 0.2) { act('click', `${x},${y}`); if (touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); }
      else if (r < 0.26 && !touch) { act('rightclick', `${x},${y}`); await page.mouse.click(x, y, { button: 'right' }); }
      else if (r < 0.4 && !touch) { const k = pick([-600, -300, -100, 100, 300, 600]); act('wheel', `${x},${y} ${k}`); await page.mouse.move(x, y); for (let i = 0; i < 3; i++) await page.mouse.wheel(0, k); }
      else if (r < 0.5 && !touch) { act('drag', `${x},${y}`); await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(Math.floor(rnd() * W), Math.floor(rnd() * H), { steps: 4 }); await page.mouse.up(); }
      else if (r < 0.62) { const key = pick(['Space', 'Escape', 'Equal', 'Minus', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter', 'Delete', 'Backspace', 'KeyG', 'KeyH', 'KeyM', 'KeyS', 'KeyR', 'KeyE', 'KeyF', 'KeyP', 'KeyT', 'KeyC', 'KeyZ', 'Digit1', 'Digit2', 'Digit3', 'Digit5', 'Home', 'End', 'F1', 'Control+z', 'Control+y', 'Shift+KeyA']); act('key', key); await page.keyboard.press(key); }
      else {
        const els = await page.evaluate((bad) => {
          const re = new RegExp(bad, 'i');
          return [...document.querySelectorAll('button, [role=tab], select, input[type=checkbox], input[type=range], [role=button], summary')]
            .map((e, i) => ({ e, i }))
            .filter(({ e }) => e.offsetParent !== null && !e.disabled && !re.test(`${e.innerText ?? ''} ${e.title ?? ''} ${e.getAttribute('aria-label') ?? ''} ${e.getAttribute('data-testid') ?? ''}`))
            .map(({ e }) => { const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, tag: e.tagName, id: e.getAttribute('data-testid') ?? (e.innerText ?? '').trim().slice(0, 24), n: e.tagName === 'SELECT' ? e.options.length : 0 }; })
            .filter((b) => b.x >= 0 && b.y >= 0 && b.x <= window.innerWidth && b.y <= window.innerHeight);
        }, BAD.source);
        if (els.length) {
          const e = pick(els); act('ui', e.id); out.lastUi = e.id;
          if (e.tag === 'SELECT' && e.n > 0) { await page.evaluate(({ x, y, k }) => { const el = document.elementFromPoint(x, y); if (el && el.tagName === 'SELECT') { el.selectedIndex = k % el.options.length; el.dispatchEvent(new Event('change', { bubbles: true })); el.dispatchEvent(new Event('input', { bubbles: true })); } }, { x: e.x, y: e.y, k: Math.floor(rnd() * e.n) }); }
          else if (touch) await page.touchscreen.tap(e.x, e.y); else await page.mouse.click(e.x, e.y);
        }
      }
     })());
    } catch (e) {
      act(String(e).includes('ACT TIMEOUT') ? 'actTimeout' : 'actError'); out.lastActError = String(e).slice(0, 200);
      if (String(e).includes('ACT TIMEOUT')) {
        const st = await state();
        out.timeouts = (out.timeouts ?? []); out.timeouts.push({ s: Math.round((Date.now() - t0) / 1000), state: st, last: log.slice(-12) });
        console.log(`act timed out at ${Math.round((Date.now() - t0) / 1000)} s; page ${st.hung ? 'HUNG' : 'answers'}; last acts: ${log.slice(-8).join(' | ')}`);
        if (st.hung) { out.hung = true; break; }
      }
    }
    await page.waitForTimeout(40 + Math.floor(rnd() * 120));
    const el = Date.now() - t0;
    if (el - lastSample > 10000) {
      lastSample = el;
      const st = await state();
      out.samples.push({ s: Math.round(el / 1000), ...st, errors: errors.length, acts: n });
      if (st.hung) { console.log(`HUNG at ${Math.round(el / 1000)} s after ${out.lastUi}`); break; }
      if (st.gone) { console.log(`left the game at ${Math.round(el / 1000)} s: ${st.url} (last ui ${out.lastUi})`); break; }
      if (st.paused) { pausedSince ??= el; if (el - pausedSince >= 20000) { await page.evaluate(() => (window.__warsim.hud.paused.value ? window.__warsim.hud.togglePause() : undefined)); act('resumedByProbe'); pausedSince = null; } } else pausedSince = null;
    }
    if (el - lastShot > 30000) { lastShot = el; await guard(page.screenshot({ path: path.join(SHOTS, `c75mky_${tag}_${String(Math.round(el / 1000)).padStart(3, '0')}.png`) })).catch(() => { act('shotTimeout'); }); }
  }
  if (!out.hung) for (let i = 0; i < 3; i++) await guard(page.keyboard.press('Escape')).catch(() => {});
  const a = await state();
  if (!a.hung && !a.gone) {
    await page.evaluate(() => (window.__warsim.hud.paused.value ? window.__warsim.hud.togglePause() : undefined));
    await page.waitForTimeout(5000);
  }
  const b = await state();
  out.end = { before: a, after: b, tickMoved: (b.tick ?? 0) - (a.tick ?? 0), framesDrawn: (b.frames ?? 0) - (a.frames ?? 0) };
  out.endShot = `critic/shots/c75mky_${tag}_end.png`;
  await guard(page.screenshot({ path: path.join(SHOTS, `c75mky_${tag}_end.png`) })).catch(() => {});
  out.endText = await guard(page.evaluate(() => document.body.innerText.slice(0, 500))).catch(() => null);
  out.lastActs = log.slice(-30);
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 1200); }
out.errors = errors.slice(0, 60); out.errorCount = errors.length;
save(`c75_mky_${tag}.json`, out);
const ticks = out.samples.map((x) => x.tick);
console.log(`monkey ${tag} ${SECS} s: acts ${JSON.stringify(out.acts)}; samples ${out.samples.length}, ticks ${ticks[0]} -> ${ticks[ticks.length - 1]}; page errors ${errors.length}; end: tick moved ${out.end?.tickMoved} in 5 s, frames ${out.end?.framesDrawn}, hung ${Boolean(out.end?.after?.hung)}, gone ${Boolean(out.end?.after?.gone)}${out.fatal ? ' FATAL ' + out.fatal : ''}`);
for (const e of [...new Set(errors)].slice(0, 12)) console.log('  ' + e);
await Promise.race([browser.close(), new Promise((d) => setTimeout(d, 10000))]);
process.exit(0);
