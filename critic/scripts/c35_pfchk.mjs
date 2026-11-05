// Critic run 25: why PF read 0 fps on HEAD's 7019 y20 save: paused state, date, frames over 12 s after load at Max.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { launch, open1938, save, shot } from './c31_lib.mjs';
const [seedS, bin] = process.argv.slice(2);
const out = { seed: Number(seedS), bin, samples: [] };
const { browser, page, errors } = await launch();
try {
  const bytes = readFileSync(path.resolve(bin));
  await page.route('**/__critic_ck.bin', (r) => r.fulfill({ status: 200, body: bytes, contentType: 'application/octet-stream' }));
  await open1938(page, Number(seedS));
  await page.evaluate(async () => window.__warsim.sim.load(new Uint8Array(await (await fetch('/__critic_ck.bin')).arrayBuffer())));
  await page.waitForTimeout(3000);
  await page.evaluate(() => { window.__warsim.hud.setSpeedLevel(99); if (window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(1000);
    out.samples.push(await page.evaluate(() => ({ frames: window.__warsim.view.frames, paused: window.__warsim.hud.paused.value, date: document.body.innerText.match(/\d{1,2} [A-Z][a-z]+ \d{4}[^\n]*/)?.[0] ?? null, dialog: document.querySelector('[role=dialog], .modal, .nuke-pause')?.innerText?.slice(0, 200) ?? null })));
  }
  out.shot = await shot(page, 'c35pfchk_7019_y20.png');
} finally { out.errors = errors; save('c35_pfchk_7019.json', out); await browser.close(); }
console.log(JSON.stringify(out.samples));
