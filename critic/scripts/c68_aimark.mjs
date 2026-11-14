// Critic run 68 (new, R81c): an AI burst's mark on the page at Speed x1 against Max, from one save: the 7019 year-20
// world stepped to 48 h before its first AI strike (tick from c68_an_7019y20.json), then run at the speed until the
// strike's alert; "Go to"; the view's burst list and what the last draw showed (`nukeFx.shown`: flash, ring, cloud,
// mark), and shots at 2 and 10 s. Usage: node critic/scripts/c68_aimark.mjs <save.bin> <strikeTick> <speedLevel> <label>
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { launch, open1938, save, shot, settle } from './c68_lib.mjs';

const [bin, tickS, speedS, label] = process.argv.slice(2);
const strikeTick = Number(tickS), speed = Number(speedS);
const out = { bin, strikeTick, speed, label };
const { browser, page, errors } = await launch();
const bytes = readFileSync(path.resolve(bin));
await page.route('**/__critic_ck.bin', (r) => r.fulfill({ status: 200, body: bytes, contentType: 'application/octet-stream' }));
await open1938(page, 7019);
await page.evaluate(async () => window.__warsim.sim.load(new Uint8Array(await (await fetch('/__critic_ck.bin')).arrayBuffer())));
await page.waitForTimeout(2000);
const t0 = await page.evaluate(() => window.__warsim.view.lastTick);
const n = strikeTick - 48 - t0;
out.stepFrom = t0; out.stepped = n;
await page.evaluate(async (n) => {
  const w = window.__warsim; const target = w.view.lastTick + n; await w.sim.step(n);
  await new Promise((d) => { const f = () => (w.view.lastTick >= target ? d() : setTimeout(f, 20)); f(); });
}, n);
await page.evaluate((s) => { window.__warsim.hud.setSpeedLevel(s); if (window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); }, speed);
const got = await page.waitForFunction(() => document.querySelectorAll('[data-testid=nuke-alert]').length > 0 ? window.__warsim.view.lastTick : false, null, { timeout: 900_000, polling: 50 }).then((h) => h.jsonValue()).catch((e) => String(e));
out.alertAt = got;
out.alert = await page.evaluate(() => document.querySelector('[data-testid=nuke-alert]')?.innerText.replace(/\n/g, ' | '));
out.bursts = await page.evaluate(() => window.__warsim.view.nukeFx.bursts.map((b) => ({ x: b.x, y: b.y, ageMs: Math.round(performance.now() - b.born) })));
out.trace = [];
for (let i = 0; i < 6; i++) { out.trace.push(await page.evaluate(() => { const v = window.__warsim.view; const f = v.nukeFx; const now = performance.now(); v.draw(now); return { n: f.bursts.length, ages: f.bursts.map((b) => Math.round(now - b.born)), shown: [...f.shown], loaded: v.loaded ?? null, cam: [Math.round(v.controller.cam.cx), Math.round(v.controller.cam.cy)] }; })); await page.waitForTimeout(250); }
await page.getByTestId('nuke-goto').last().click();
out.trace2 = await page.evaluate(() => { const v = window.__warsim.view; const f = v.nukeFx; const now = performance.now(); v.draw(now); return { n: f.bursts.length, ages: f.bursts.map((b) => Math.round(now - b.born)), shown: [...f.shown], cam: [v.controller.cam.cx, v.controller.cam.cy, v.metresPerPx], b: f.bursts.map((b) => [b.x, b.y, b.yieldN]) }; });
out.trace3 = [];
for (let i = 0; i < 12; i++) { await page.waitForTimeout(250); out.trace3.push(await page.evaluate(() => { const v = window.__warsim.view; const f = v.nukeFx; const now = performance.now(); return { n: f.bursts.length, ages: f.bursts.map((b) => Math.round(now - b.born)), shown: [...f.shown], cam: [+v.controller.cam.cx.toFixed(2), +v.controller.cam.cy.toFixed(2), Math.round(v.metresPerPx)] }; })); }
// No settle here: `settle` waits while anything animates, the burst's 20 s mark included (run 68's first shots were
// taken after it had gone).
out.mpp = await page.evaluate(() => Math.round(window.__warsim.view.metresPerPx));
out.shown2 = await page.evaluate(() => [...window.__warsim.view.nukeFx.shown]);
out.shot2 = await shot(page, `c68am_${label}_goto2s.png`);
await page.waitForTimeout(6000);
out.shown10 = await page.evaluate(() => [...window.__warsim.view.nukeFx.shown]);
out.shot10 = await shot(page, `c68am_${label}_goto10s.png`);
out.errors = errors;
save(`c68_aimark_${label}.json`, out);
console.log(JSON.stringify(out));
await browser.close();
